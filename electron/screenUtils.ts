/**
 * Screen Utils
 * Contains Utilities for handling Video recording and screenshots
 */

import { execa } from "execa";
import { ChildProcess } from "node:child_process";
import { store } from "./store";
import { mkdir } from "node:fs/promises";
import { existsSync, readdirSync, statSync, unlinkSync } from "node:fs";
import path from "node:path";

const ADB_PATH = store.get("adbPath") === "" ? "adb" : store.get("adbPath");
const TIMEOUT = store.get("adbTimeout") || 5000;

// Track active recording processes
const activeRecordings: Record<string, ChildProcess> = {};

// Ensure directory exists
const ensureDirectoryExists = async (path: string) => {
  if (!existsSync(path)) {
    await mkdir(path, { recursive: true });
  }
};

export const startScreenRecord = async (serial: string) => {
  try {
    // Check if already recording
    if (activeRecordings[serial]) {
      return {
        success: false,
        error: `Recording already in progress for device ${serial}`,
      };
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `screen-record-${serial}-${timestamp}.mkv`;

    // Get save path and ensure directory exists
    const savePath = store.get("recordingPath");
    await ensureDirectoryExists(savePath);
    const outputPath = savePath + "/" + filename;

    // Build scrcpy arguments for recording
    const args = ["-s", serial, "--record", outputPath];

    // Apply the same settings as mirroring for consistency
    if (store.get("bitrate")) args.push("-b", store.get("bitrate"));
    if (store.get("maxRes")) args.push("-m", String(store.get("maxRes")));
    if (store.get("maxFPS"))
      args.push("--max-fps", String(store.get("maxFPS")));
    if (store.get("showTouches")) args.push("-t");

    // Audio forwarding
    if (store.get("audioForwarding")) {
      args.push("--audio");
      if (store.get("audioForwarding")) {
        args.push("--audio-codec", "aac");
      }
    } else {
      args.push("--no-audio");
    }

    // Add custom arguments if any
    if (store.get("customArguments")) {
      args.push(...store.get("customArguments").split(" "));
    }

    // Start screen recording using scrcpy
    const subProcess = execa("scrcpy", args, {
      detached: true,
      stdio: "ignore",
    });

    activeRecordings[serial] = subProcess;

    subProcess.on("exit", async (code) => {
      console.log(
        `Screen recording for device ${serial} exited with code ${code}`
      );
      delete activeRecordings[serial];

      // Validate and optimize video file if needed
      // try {
      //   await validateAndFixVideoFile(outputPath);
      //   console.log(`Recording saved to: ${outputPath}`);
      // } catch (validationError) {
      //   console.warn(
      //     "Video validation/fix failed, keeping original file:",
      //     validationError
      //   );
      // }
    });

    subProcess.unref();

    return {
      success: true,
      filename: filename,
      message:
        "Recording started using scrcpy. File will be automatically saved and optimized when recording stops.",
    };
  } catch (error) {
    console.error("Failed to start screen recording:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const stopScreenRecord = async (serial: string) => {
  try {
    const proc = activeRecordings[serial];
    if (!proc) {
      return {
        success: false,
        error: `No active recording found for device ${serial}`,
      };
    }

    // Kill the recording process
    proc.kill("SIGTERM");
    delete activeRecordings[serial];

    // Wait a moment for the file to be finalized
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to stop screen recording:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const takeScreenShot = async (serial: string) => {
  try {
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `screenshot-${serial}-${timestamp}.png`;

    // Take screenshot using ADB
    await execa(
      ADB_PATH,
      ["-s", serial, "shell", "screencap", "/sdcard/" + filename],
      {
        timeout: TIMEOUT,
      }
    );

    // Pull the screenshot to local machine
    const savePath = store.get("screenShotPath");
    await ensureDirectoryExists(savePath);
    await execa(
      ADB_PATH,
      ["-s", serial, "pull", "/sdcard/" + filename, savePath + "/" + filename],
      {
        timeout: TIMEOUT,
      }
    );

    // Clean up the file from device
    await execa(
      ADB_PATH,
      ["-s", serial, "shell", "rm", "/sdcard/" + filename],
      {
        timeout: TIMEOUT,
      }
    );

    return {
      success: true,
      filename: filename,
      path: savePath + "/" + filename,
    };
  } catch (error) {
    console.error("Failed to take screenshot:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const listMediaFiles = async () => {
  const recordingPath = store.get("recordingPath");
  const screenshotPath = store.get("screenShotPath");

  const recordings = readdirSync(recordingPath).map((file) => ({
    name: file,
    path: path.join(recordingPath, file),
    type: "recording",
  }));
  const screenShots = readdirSync(screenshotPath).map((file) => ({
    name: file,
    path: path.join(screenshotPath, file),
    type: "screenshot",
  }));

  return {
    recordings,
    screenShots,
  };
};

export const listRecordings = async (page = 1, limit = 20) => {
  const recordingPath = store.get("recordingPath");
  const recordings = readdirSync(recordingPath)
    .map((file) => ({
      name: file,
      path: path.join(recordingPath, file),
      time: statSync(path.join(recordingPath, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time); // Sort by modified time descending

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  return {
    files: recordings.slice(startIndex, endIndex),
    total: recordings.length,
    hasMore: endIndex < recordings.length,
  };
};

export const listScreenShots = async (page = 1, limit = 20) => {
  const screenShotsPath = store.get("screenShotPath");

  const screenshots = readdirSync(screenShotsPath)
    .map((file) => ({
      name: file,
      path: path.join(screenShotsPath, file),
      time: statSync(path.join(screenShotsPath, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time); // Sort by modified time descending

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  return {
    files: screenshots.slice(startIndex, endIndex),
    total: screenshots.length,
    hasMore: endIndex < screenshots.length,
  };
};

export const deleteFile = async (filePath: string) => {
  unlinkSync(filePath);
  return { success: true };
};
