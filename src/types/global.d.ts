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
    logCatApi: {
      startLogcat: (serial: string) => Promise<void>;
      stopLogcat: (serial: string) => Promise<void>;
      onLogcatData: (callback: (serial: string, line: string) => void) => void;
      onLogcatEnd: (callback: (serial: string) => void) => void;
    };
    mirrorApi: {
      onMirroringStopped: (callback: (serial: string) => void) => Promise<void>;
    };
    screenApi: {
      startRecording: (serial: string) => Promise<{
        success: boolean;
        error?: string;
        filename?: string;
        message?: string;
      }>;
      stopRecording: (
        serial: string
      ) => Promise<{ success: boolean; error?: string }>;
      takeScreenshot: (serial: string) => Promise<{
        success: boolean;
        error?: string;
        filename?: string;
        path?: string;
      }>;
      selectRecordingPath: () => Promise<string | null>;
      selectScreenshotPath: () => Promise<string | null>;
    };
  }
}
