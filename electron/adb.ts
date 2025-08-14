import { execa } from "execa";
import type { ChildProcess } from "node:child_process";
import { store } from "./store";

export interface DeviceInfo {
  serial: string;
  status: string;
  model: string;
  product?: string;
  device?: string;
}

export interface DeviceDetails {
  serial: string;
  brand: string;
  model: string;
  batteryLevel: string;
  batteryStatus: string;
  androidVersion: string;
  apiLevel: string;
  screenSize: string;
  cpuAbi: string;
  uptime: string;
  connection: string;
}

const activeMirrors: Record<string, ChildProcess> = {};
const ADB_PATH = store.get("adbPath") === "" ? "adb" : store.get("adbPath");
const TIME_OUT = store.get("adbTimeout") || 5000;

/**
 * Lists all connected Android devices using ADB.
 * @returns {Promise<DeviceInfo[]>} - A promise that resolves to an array of DeviceInfo objects.
 */
export async function listDevices(): Promise<DeviceInfo[]> {
  try {
    const { stdout } = await execa(ADB_PATH, ["devices", "-l"], {
      timeout: TIME_OUT,
    });
    const lines = stdout.split("\n").slice(1); // Skip the first line which is a header

    const devices: DeviceInfo[] = lines
      .filter((line) => line.trim() !== "")
      .map((line) => {
        const [serial, status, ...rest] = line.split(/\s+/);
        const props = Object.fromEntries(
          rest.map((item) => {
            const [key, value] = item.split(":");
            return [key, value];
          })
        );

        const connectionMode = /^\d{1,3}(\.\d{1,3}){3}:\d+/.test(serial)
          ? "tcpip"
          : "usb";

        return {
          serial,
          status,
          connectionMode,
          model: props.model || "unknown",
          product: props.product,
          device: props.device,
        };
      });

    return devices;
  } catch (e) {
    console.error("Error listing devices:", e);
    return [];
  }
}

/**
 * Starts mirroring a device using scrcpy.
 * @param {string} serial - The serial number of the device to mirror.
 * @param {string[]} options - Additional options for scrcpy.
 * @returns {Promise<{success: boolean, error?: string}>} - A promise that resolves to an object indicating success or failure.
 */
export async function mirrorDevice(
  serial: string,
  options: string[] = []
): Promise<{ success: boolean; error?: string }> {
  // Handle the case if an active mirror already exists for this device
  if (activeMirrors[serial]) {
    return {
      success: false,
      error: `A mirror is already running for device ${serial}`,
    };
  }
  try {
    // const settings = store.get("")
    const args = ["-s", serial, ...options];

    if (store.get("bitrate")) args.push("-b", store.get("bitrate"));
    if (store.get("maxRes")) args.push("-m", String(store.get("maxRes")));
    if (store.get("maxFPS"))
      args.push("--max-fps", String(store.get("maxFPS")));
    if (store.get("showTouches")) args.push("-t");

    // 🔊 Audio forwarding
    if (store.get("audioForwarding")) {
      args.push("--audio");

      // Optional: If your scrcpy build supports specifying codec or output
      if (store.get("audioForwarding")) {
        args.push("--audio-codec", "aac"); // e.g., "opus" or "aac"
      }
    } else {
      args.push("--no-audio");
    }

    const subProcess = execa("scrcpy", args, {
      detached: true,
      stdio: "ignore",
    });

    activeMirrors[serial] = subProcess;

    subProcess.on("exit", (code) => {
      console.log(`scrcpy for device ${serial} exited with code ${code}`);
      delete activeMirrors[serial];
    });

    subProcess.unref();

    return { success: true };
  } catch (e: unknown) {
    console.error("Failed to start scrcpy:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * Stops the mirroring process for a specific device.
 * @param {string} serial - The serial number of the device whose mirroring process should be stopped.
 */
export function stopMirroring(serial: string) {
  const proc = activeMirrors[serial];
  if (proc) {
    proc.kill("SIGTERM");
    delete activeMirrors[serial];
    console.log(`Mirroring stopped for device ${serial}`);
    return true;
  }
}

/**
 * Checks if a device is currently being mirrored.
 * @param {string} serial - The serial number of the device to check.
 * @returns {boolean} - Returns `true` if the device is being mirrored, otherwise `false`.
 */
export function isMirroring(serial: string): boolean {
  return Boolean(activeMirrors[serial]);
}

/**
 * Retrieves detailed information about a specific Android device using its serial number.
 * @param {string} serial - The serial number of the device.
 * @returns {Promise<DeviceDetails>} - A promise that resolves to an object containing detailed device information.
 *
 * The returned object includes:
 * - `serial`: The device's serial number.
 * - `brand`: The brand of the device.
 * - `model`: The model of the device.
 * - `batteryLevel`: The battery level of the device as a percentage.
 * - `batteryStatus`: The current battery status (e.g., Charging, Discharging, Full).
 * - `androidVersion`: The Android version running on the device.
 * - `apiLevel`: The API level of the Android version.
 * - `screenSize`: The screen size of the device.
 * - `cpuAbi`: The CPU architecture of the device.
 * - `uptime`: The device's uptime.
 * - `connection`: The connection state of the device (e.g., online, offline).
 */
export async function getDeviceDetails(serial: string): Promise<DeviceDetails> {
  const execAdb = async (cmd: string) => {
    const { stdout } = await execa(ADB_PATH, ["-s", serial, "shell", cmd], {
      timeout: TIME_OUT,
    });
    return stdout.trim();
  };

  const [
    brand,
    model,
    androidVersion,
    apiLevel,
    cpuAbi,
    screenSizeRaw,
    batteryRaw,
    uptimeRaw,
    connection,
  ] = await Promise.all([
    execAdb("getprop ro.product.brand"),
    execAdb("getprop ro.product.model"),
    execAdb("getprop ro.build.version.release"),
    execAdb("getprop ro.build.version.sdk"),
    execAdb("getprop ro.product.cpu.abi"),
    execAdb("wm size"),
    execAdb("dumpsys battery"),
    execAdb("uptime"),
    getConnectionState(serial),
  ]);

  const screenSize = screenSizeRaw.split(":")[1]?.trim() ?? "Unknown";

  const batteryLevelMatch = batteryRaw.match(/level:\s*(\d+)/);
  const batteryStatusMatch = batteryRaw.match(/status:\s*(\d+)/);
  const batteryLevel = batteryLevelMatch
    ? `${batteryLevelMatch[1]}%`
    : "Unknown";
  const batteryStatusCode = batteryStatusMatch ? batteryStatusMatch[1] : "0";

  const batteryStatusMap: Record<string, string> = {
    "1": "Unknown",
    "2": "Charging",
    "3": "Discharging",
    "4": "Not charging",
    "5": "Full",
  };

  const batteryStatus = batteryStatusMap[batteryStatusCode] || "Unknown";

  return {
    serial,
    brand,
    model,
    batteryLevel,
    batteryStatus,
    androidVersion,
    apiLevel,
    screenSize,
    cpuAbi,
    uptime: uptimeRaw,
    connection,
  };
}

/**
 * Retrieves the connection state of a specific Android device using its serial number.
 *
 * @param {string} serial - The serial number of the device.
 * @returns {Promise<string>} - A promise that resolves to the connection state of the device.
 *
 * Possible return values:
 * - `online`: The device is connected and ready.
 * - `offline`: The device is not connected or not ready.
 * - `unknown`: The connection state could not be determined.
 *
 * This function uses the `adb devices` command to check the connection state of the device.
 */
async function getConnectionState(serial: string): Promise<string> {
  try {
    const { stdout } = await execa(ADB_PATH, ["devices"], {
      timeout: TIME_OUT,
    });
    const line = stdout.split("\n").find((l) => l.startsWith(serial));
    if (!line) return "offline";
    const parts = line.trim().split(/\s+/);
    return parts[1] || "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Checks the state of the ADB server.
 *
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the ADB server is running, otherwise `false`.
 *
 * This function uses the `adb devices` command to determine the server state.
 * If the output contains "daemon not running", it indicates that the server is not running.
 * In case of an error, it logs the error and returns `false`.
 */
export async function getAdbServerState(): Promise<boolean> {
  try {
    const { stdout } = await execa(ADB_PATH, ["devices"], {
      timeout: TIME_OUT,
    });

    // If we see "daemon not running", then it was not running before
    return !stdout.includes("daemon not running");
  } catch (error) {
    console.error("Error checking ADB server status:", error);
    return false;
  }
}

/**
 * Starts the ADB server.
 *
 * @returns {Promise<string>} - A promise that resolves to the trimmed output of the `adb start-server` command.
 *
 * This function attempts to start the ADB server by executing the `adb start-server` command.
 * If the command succeeds, it returns the output as a string. If it fails, the error is logged
 * to the console, and the error object is returned.
 */
export async function startAdbServer(): Promise<unknown> {
  try {
    const { stdout } = await execa(ADB_PATH, ["start-server"], {
      timeout: TIME_OUT,
    });
    return stdout.trim();
  } catch (e: unknown) {
    console.error("Failed to start ADB Server", e);
    return e instanceof Error ? e.message : String(e);
  }
}

/**
 * Stops the ADB server.
 *
 * @returns {Promise<string | Error>} - A promise that resolves to the trimmed output of the `adb kill-server` command
 * if successful, or the error object if the operation fails.
 *
 * This function attempts to stop the ADB server by executing the `adb kill-server` command.
 * If the command succeeds, it returns the output as a string. If it fails, the error is logged
 * to the console, and the error object is returned.
 */
export async function stopAdbServer(): Promise<unknown | Error> {
  try {
    const { stdout } = await execa(ADB_PATH, ["kill-server"], {
      timeout: TIME_OUT,
    });
    return stdout.trim();
  } catch (e: unknown) {
    console.error("Failed to stop ADB Server", e);
    return e instanceof Error ? e.message : String(e);
  }
}

/**
 * Restarts the ADB server.
 *
 * @returns {Promise<unknown>} - A promise that resolves to the result of starting the ADB server after stopping it.
 *
 * This function first stops the ADB server by calling `stopAdbServer()`.
 * It then waits for 1 second to ensure the server has completely stopped before restarting it using `startAdbServer()`.
 * If any error occurs during the process, it logs the error to the console and returns the error object.
 */
export async function restartAdbServer(): Promise<unknown> {
  try {
    await stopAdbServer();
    await new Promise((r) => setTimeout(r, 1000)); // Wait for a second before restarting
    return await startAdbServer();
  } catch (e) {
    console.error("Failed to restart ADB Server", e);
    return e;
  }
}

/**
 * Connects to an Android device via WiFi using ADB.
 *
 * This function establishes a wireless connection to an Android device using its IP address and port.
 * The device must have ADB over WiFi enabled and be on the same network as the host computer.
 *
 * @param {string} ip - The IP address of the Android device (e.g., "192.168.1.100").
 * @param {string} port - The port number for ADB connection (typically "5555").
 * @returns {Promise<string>} - A promise that resolves to the connection result message from ADB.
 *
 * @example
 * // Connect to a device at IP 192.168.1.100 on port 5555
 * const result = await connectViaWifi("192.168.1.100", "5555");
 * console.log(result); // "connected to 192.168.1.100:5555" or error message
 *
 * @throws {Error} - Throws an error if the connection fails or ADB is not available.
 */
export async function connectViaWifi(
  ip: string,
  port: string
): Promise<string> {
  try {
    const { stdout } = await execa(ADB_PATH, ["connect", `${ip}:${port}`], {
      timeout: TIME_OUT,
    });
    return stdout;
  } catch (error) {
    console.error("Failed to connect to device via WiFi:", error);
    return error instanceof Error ? error.message : String(error);
  }
}
