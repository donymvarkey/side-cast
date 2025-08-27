import { ChildProcess } from "child_process";
import { execa } from "execa";
import * as readline from "node:readline";
import { store } from "./store";

const logMap: Record<string, ChildProcess> = {};
const ADB_PATH = store.get("adbPath") || "adb";
const TIMEOUT = store.get("adbTimeout");

const FLUSH_INTERVAL = 100; // ms between sends to renderer
const MAX_QUEUE_LINES = 2000; // cap queue size to prevent memory blow-up

export async function logCatProcess(
  serial: string,
  onBatch: (lines: string[]) => void,
  onEnd?: (manual: boolean) => void
) {
  if (logMap[serial]) {
    return;
  }

  const subProcess = execa(ADB_PATH, ["-s", serial, "logcat"], {
    stdout: "pipe",
    stderr: "pipe",
    timeout: TIMEOUT,
    reject: false, // don't throw on SIGTERM or non-zero exit
  });

  logMap[serial] = subProcess;

  const rl = readline.createInterface({
    input: subProcess.stdout!,
    crlfDelay: Infinity,
  });

  const queue: string[] = [];
  const flushTimer = setInterval(() => {
    if (queue.length === 0) return;
    const batch = queue.splice(0, queue.length);
    onBatch(batch);
  }, FLUSH_INTERVAL);

  rl.on("line", (line) => {
    queue.push(line);
    if (queue.length > MAX_QUEUE_LINES) {
      queue.splice(0, queue.length - MAX_QUEUE_LINES); // drop oldest
    }
  });

  const cleanup = () => {
    clearInterval(flushTimer);
    rl.close();
    delete logMap[serial];
  };

  subProcess.on("exit", (_code, signal) => {
    cleanup();
    if (signal === "SIGTERM") {
      console.log(`Logcat for ${serial} stopped normally`);
      if (onEnd) onEnd(true); // manual stop
    } else {
      console.log(`Logcat for ${serial} exited with signal=${signal}`);
      if (onEnd) onEnd(false); // unexpected stop
    }
  });

  subProcess.on("error", (err) => {
    console.error(`Error in logcat process for ${serial}:`, err);
    cleanup();
    if (onEnd) onEnd(false);
  });

  console.log(`Started logcat for device ${serial}`);
}

export function stopLogcat(serial: string) {
  const proc = logMap[serial];
  if (proc) {
    proc.kill("SIGTERM");
    console.log(`Stopped logcat for device: ${serial}`);
  }
}

export function stopAllLogcats() {
  for (const serial of Object.keys(logMap)) {
    stopLogcat(serial);
  }
}
