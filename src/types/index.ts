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

export interface Device {
  serial: string;
  device: string;
  model: string;
  connectionMode: string;
  product: string;
  status: string;
}

export type LogMap = Record<string, string[]>;
export interface MediaFilesType {
  name: string;
  path: string;
  time: TimeRanges;
}
