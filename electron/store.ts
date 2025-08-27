// src/main/store.ts
import Store from "electron-store";
import path from "path";
import os from "node:os";
import { existsSync, mkdirSync } from "node:fs";

export interface AppSettings {
  // ADB Settings
  adbPath: string;
  connectionMode: "usb" | "tcpip";
  tcpIpHost?: string;
  tcpIpPort?: string;

  // scrcpy settings
  bitrate: string;
  maxRes: number;
  maxFPS: number;
  fullscreen: boolean;
  showTouches: boolean;
  audioForwarding: boolean;
  customArguments: string;

  // Advanced setting
  maxConnections: number;
  adbTimeout: number;
  debugLogging: boolean;
  scriptsPath?: string;
  defaultConnectionMode: string;

  // Recording settings
  recordingPath: string;
  screenShotPath: string;
}

const getUserHomeDirectory = () => {
  return os.homedir();
};

const sideCastDir = path.join(getUserHomeDirectory(), "SideCast");
const recordingsDir = path.join(sideCastDir, "Recordings");
const screenshotsDir = path.join(sideCastDir, "Screenshots");

// Ensure the SideCast, Recordings, and Screenshots directories exist
for (const dir of [sideCastDir, recordingsDir, screenshotsDir]) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

export const store = new Store<AppSettings>({
  name: "sidecast-settings", // file will be stored in userData/sidecast-settings.json
  defaults: {
    // ADB Settings
    adbPath: "",
    connectionMode: "usb",
    tcpIpHost: "",
    tcpIpPort: "5555",

    // scrcpy settings
    bitrate: "8M",
    maxRes: 1080,
    maxFPS: 60,
    showTouches: false,
    fullscreen: false,
    audioForwarding: false,
    customArguments: "",

    // Advanced settings
    maxConnections: 1,
    adbTimeout: 5000,
    debugLogging: false,
    scriptsPath: "",
    defaultConnectionMode: "usb",

    // Recording settings
    recordingPath: recordingsDir,
    screenShotPath: screenshotsDir,
  },
});
