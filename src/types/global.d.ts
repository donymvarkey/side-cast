export {};

declare global {
	interface Window {
		electronAPI: {
			on: (...args: Parameters<typeof import("electron").ipcRenderer.on>) => void;
			off: (...args: Parameters<typeof import("electron").ipcRenderer.off>) => void;
			send: (...args: Parameters<typeof import("electron").ipcRenderer.send>) => void;
			invoke: <T = any>(channel: string, ...args: any[]) => Promise<T>;
		};
	}
}
