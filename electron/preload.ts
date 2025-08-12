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
