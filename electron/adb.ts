import {execa} from "execa";

export interface DeviceInfo {
	serial: string;
	status: string;
	model: string;
	product?: string;
	device?: string;
}

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

export async function getDeviceDetails(serial: string): Promise<DeviceDetails> {
	const execAdb = async (cmd: string) => {
		const { stdout } = await execa('adb', ['-s', serial, 'shell', cmd]);
		return stdout.trim();
	};

	const [brand, model, androidVersion, apiLevel, cpuAbi, screenSizeRaw, batteryRaw, uptimeRaw, connection] =
		await Promise.all([
			execAdb('getprop ro.product.brand'),
			execAdb('getprop ro.product.model'),
			execAdb('getprop ro.build.version.release'),
			execAdb('getprop ro.build.version.sdk'),
			execAdb('getprop ro.product.cpu.abi'),
			execAdb('wm size'),
			execAdb('dumpsys battery'),
			execAdb('uptime'),
			getConnectionState(serial),
		]);

	const screenSize = screenSizeRaw.split(':')[1]?.trim() ?? 'Unknown';

	const batteryLevelMatch = batteryRaw.match(/level:\s*(\d+)/);
	const batteryStatusMatch = batteryRaw.match(/status:\s*(\d+)/);
	const batteryLevel = batteryLevelMatch ? `${batteryLevelMatch[1]}%` : 'Unknown';
	const batteryStatusCode = batteryStatusMatch ? batteryStatusMatch[1] : '0';

	const batteryStatusMap: Record<string, string> = {
		'1': 'Unknown',
		'2': 'Charging',
		'3': 'Discharging',
		'4': 'Not charging',
		'5': 'Full',
	};

	const batteryStatus = batteryStatusMap[batteryStatusCode] || 'Unknown';

	return {
		serial,
		brand,
		model,
		batteryLevel,
		batteryStatus,
		androidVersion,
		apiLevel,
		screenSize,
		cpuAbi,
		uptime: uptimeRaw,
		connection,
	};
}

async function getConnectionState(serial: string): Promise<string> {
	try {
		const { stdout } = await execa('adb', ['devices']);
		const line = stdout.split('\n').find(l => l.startsWith(serial));
		if (!line) return 'offline';
		const parts = line.trim().split(/\s+/);
		return parts[1] || 'unknown';
	} catch {
		return 'unknown';
	}
}

export async function getAdbServerState(){
	try {
		const { stdout } = await execa('adb', ['devices']);

		// If we see "daemon not running", then it was not running before
		return !stdout.includes('daemon not running');
	} catch (error) {
		console.error('Error checking ADB server status:', error);
		return false;
	}
}

export async function startAdbServer() {
	try {
		const {stdout} = await execa("adb", ["start-server"]);
		return stdout.trim();
	} catch (e) {
		console.error("Failed to start ADB Server", e);
		return e;
	}
}

export async function stopAdbServer() {
	try {
		const {stdout} = await execa("adb", ["kill-server"]);
		return stdout.trim();
	} catch (e) {
		console.error("Failed to stop ADB Server", e);
		return e;
	}
}

export async function restartAdbServer() {
	try {
		await stopAdbServer();
		await new Promise((r) => setTimeout(r, 1000)); // Wait for a second before restarting
		return await startAdbServer();
	} catch (e) {
		console.error("Failed to restart ADB Server", e);
		return e;
	}
}
