// src/main/store.ts
import Store from "electron-store";

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
  },
});
