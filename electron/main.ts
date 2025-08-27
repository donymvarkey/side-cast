import { app, BrowserWindow, dialog, ipcMain, protocol } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  connectViaWifi,
  getActiveMirrors,
  getAdbServerState,
  getDeviceDetails,
  isMirroring,
  listDevices,
  mirrorDevice,
  restartAdbServer,
  startAdbServer,
  stopAdbServer,
  stopMirroring,
} from "./adb";
import { AppSettings, store } from "./store";
import { logCatProcess, stopAllLogcats, stopLogcat } from "./logCat";
import {
  deleteFile,
  listMediaFiles,
  listRecordings,
  listScreenShots,
  startScreenRecord,
  stopScreenRecord,
  takeScreenShot,
} from "./screenUtils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 1124, // Set your desired width
    height: 864, // Set your desired height
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Handle IPC communication
ipcMain.handle("adb:list-devices", async () => {
  return await listDevices();
});

// Handle mirroring a device
ipcMain.handle(
  "adb:mirror-device",
  async (_event, serial: string, options: string[]) => {
    return await mirrorDevice(serial, options);
  }
);

// Stop a mirroring device
ipcMain.handle("adb:stop-mirror", async (_event, serial: string) => {
  return stopMirroring(serial);
});

// Active mirroring sessions
ipcMain.handle("adb:get-active-mirrors", async (_event, serial: string) => {
  return isMirroring(serial);
});

// Get the details of device.
ipcMain.handle("adb:get-device-info", async (_event, serial: string) => {
  return await getDeviceDetails(serial);
});

// Start ADB server
ipcMain.handle("adb:start-server", async () => {
  return await startAdbServer();
});

// Kill ADB Server
ipcMain.handle("adb:stop-server", async () => {
  return await stopAdbServer();
});

// Restart ADB Server
ipcMain.handle("adb:restart-server", async () => {
  return await restartAdbServer();
});

// Get ADB server state
ipcMain.handle("adb:get-server-state", async () => {
  return await getAdbServerState();
});

// Open the dialog for selecting the ADB binary.
ipcMain.handle("adb:select-adb-path", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      {
        name: "ADB Executable",
        extensions: process.platform === "win32" ? ["exe"] : [""],
      },
    ],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// List all the active mirroring sessions
ipcMain.handle("adb:list-sessions", () => {
  return getActiveMirrors();
});

// Connect via WiFi
ipcMain.handle("adb:connect-wifi", async (_event, ip: string, port: string) => {
  return await connectViaWifi(ip, port);
});

// Handle the adb logcat (batched)
ipcMain.handle("adb:start-logcat", (event, serial: string) => {
  let buffer: string[] = [];
  const FLUSH_INTERVAL_MS = 100; // adjust as needed
  let flushTimer: NodeJS.Timeout | null = null;

  logCatProcess(
    serial,
    (lines: string[]) => {
      buffer.push(...lines);
      if (!flushTimer) {
        flushTimer = setInterval(() => {
          if (buffer.length > 0) {
            event.sender.send("adb:logcat-data", { serial, lines: buffer });
            buffer = [];
          }
        }, FLUSH_INTERVAL_MS);
      }
    },
    (manual: boolean) => {
      if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
      }
      event.sender.send("adb:logcat-end", { serial, manual });
    }
  );
});

// Stop logcat for device
ipcMain.handle("adb:stop-logcat", (_event, serial: string) => {
  stopLogcat(serial);
});

// Start screen recording
ipcMain.handle("screen:start-recording", async (_event, serial: string) => {
  return await startScreenRecord(serial);
});

// Stop screen recording
ipcMain.handle("screen:stop-recording", async (_event, serial: string) => {
  return await stopScreenRecord(serial);
});

// Take screenshot
ipcMain.handle("screen:take-screenshot", async (_event, serial: string) => {
  return await takeScreenShot(serial);
});

// Select recording save directory
ipcMain.handle("screen:select-recording-path", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    title: "Select Recording Save Directory",
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Select screenshot save directory
ipcMain.handle("screen:select-screenshot-path", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    title: "Select Screenshot Save Directory",
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// List the Media files of the App.
ipcMain.handle("screen:list-media-files", async () => {
  return await listMediaFiles();
});

// List the recordings
ipcMain.handle(
  "screen:list-recordings",
  async (_event, page = 1, limit = 20) => {
    return await listRecordings(page, limit);
  }
);

// List the screenshots
ipcMain.handle(
  "screen:list-screenshots",
  async (_event, page = 1, limit = 20) => {
    return await listScreenShots(page, limit);
  }
);

// Delete a media file (recording or screenshot)
ipcMain.handle("screen:delete-media-file", async (_event, filePath: string) => {
  return await deleteFile(filePath);
});

// Handle the App Settings.

// Get a setting
ipcMain.handle("settings:get", (_event, key: keyof AppSettings) => {
  return store.get(key);
});

// Set a setting
ipcMain.handle(
  "settings:set",
  (_event, key: keyof AppSettings, value: AppSettings[keyof AppSettings]) => {
    store.set(key, value);
    return store.get(key);
  }
);

// Get all settings
ipcMain.handle("settings:getAll", () => {
  return store.store;
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("before-quit", () => {
  stopAllLogcats();
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();
  protocol.registerFileProtocol("sidecast", (req, cb) => {
    const url = req.url.replace("sidecast://", "");
    const filePath = path.normalize(url);
    cb({ path: filePath });
  });
});
