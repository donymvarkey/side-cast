import {execa} from "execa";

export interface DeviceInfo {
	serial: string;
	status: string;
	model: string;
	product?: string;
	device?: string;
}

export async function listDevices(): Promise<DeviceInfo[]> {
	try {
		const {stdout} = await execa("adb", ["devices", "-l"]);
		const lines = stdout.split("\n").slice(1); // Skip the first line which is a header

		const devices: DeviceInfo[] = lines.filter((line) => line.trim() !== "").map((line) => {
			const [serial, status, ...rest] = line.split(/\s+/);
			const props = Object.fromEntries(rest.map(item => {
				const [key, value] = item.split(":");
				return [key, value]
			}))

			return {
				serial, status,
				model: props.model || "unknown",
				product: props.product,
				device: props.device
			}
		})

		return devices;
	}catch (e) {
		console.error("Error listing devices:", e);
		return [];
	}
}

export async function mirrorDevice(serial: string, options: string[] = []): Promise<{success: boolean, error?: string}> {
	try {
		const args = ["-s", serial, ...options];

		const subProcess = execa("scrcpy", args, {
			detached: true,
			stdio: "ignore"
		})

		subProcess.unref();

		return {success: true};
	}catch (e: any) {
		console.error("Failed to start scrcpy:", e);
		return {success: false, error: e.message}
	}
}
