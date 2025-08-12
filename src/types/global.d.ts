export {};

declare global {
  interface Window {
    electronAPI: {
      on: typeof import("electron").ipcRenderer.on;
      off: typeof import("electron").ipcRenderer.off;
      send: typeof import("electron").ipcRenderer.send;
      invoke: typeof import("electron").ipcRenderer.invoke;
    };
    settings: {
      get<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]>;
      set<K extends keyof AppSettings>(
        key: K,
        value: AppSettings[K]
      ): Promise<AppSettings[K]>;
      getAll(): Promise<AppSettings>;
    };
  }
}
