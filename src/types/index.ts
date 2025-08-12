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
}
