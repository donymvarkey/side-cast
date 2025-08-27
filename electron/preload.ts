import { ipcRenderer, contextBridge } from "electron";
import { AppSettings } from "./store";

type SettingsKey = keyof AppSettings;
type SettingsValue<K extends SettingsKey> = AppSettings[K];

// --------- Expose API to the Renderer process ---------
contextBridge.exposeInMainWorld("electronAPI", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
});

// --------- Settings API with Type Safety ---------
contextBridge.exposeInMainWorld("settings", {
  get: <K extends SettingsKey>(key: K): Promise<SettingsValue<K>> =>
    ipcRenderer.invoke("settings:get", key),

  set: <K extends SettingsKey>(
    key: K,
    value: SettingsValue<K>
  ): Promise<SettingsValue<K>> =>
    ipcRenderer.invoke("settings:set", key, value),

  getAll: (): Promise<AppSettings> => ipcRenderer.invoke("settings:getAll"),
});

contextBridge.exposeInMainWorld("logCatApi", {
  startLogcat: (serial: string) =>
    ipcRenderer.invoke("adb:start-logcat", serial),
  stopLogcat: (serial: string) => ipcRenderer.invoke("adb:stop-logcat", serial),
  onLogcatData: (callback: (serial: string, lines: string[]) => void) =>
    ipcRenderer.on("adb:logcat-data", (_event, { serial, lines }) => {
      callback(serial, lines);
    }),
  onLogcatEnd: (callback: (serial: string) => void) =>
    ipcRenderer.on("adb:logcat-end", (_event, { serial }) => {
      callback(serial);
    }),
});

contextBridge.exposeInMainWorld("mirrorApi", {
  onMirroringStopped: (callback: (serial: string) => void) => {
    ipcRenderer.on("mirroring-stopped", (_event, { serial }) =>
      callback(serial)
    );
  },
  offMirroringStopped: (callback: (serial: string) => void) => {
    ipcRenderer.removeListener("mirroring-stopped", callback);
  },
});

contextBridge.exposeInMainWorld("screenApi", {
  startRecording: (serial: string) =>
    ipcRenderer.invoke("screen:start-recording", serial),
  stopRecording: (serial: string) =>
    ipcRenderer.invoke("screen:stop-recording", serial),
  takeScreenshot: (serial: string) =>
    ipcRenderer.invoke("screen:take-screenshot", serial),
  selectRecordingPath: () => ipcRenderer.invoke("screen:select-recording-path"),
  selectScreenshotPath: () =>
    ipcRenderer.invoke("screen:select-screenshot-path"),
});
