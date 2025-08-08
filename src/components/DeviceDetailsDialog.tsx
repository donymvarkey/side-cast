import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {DeviceDetails} from "@/types";
import {
	Barcode,
	Battery,
	BatteryCharging,
	BatteryFull,
	BatteryMedium,
	BatteryWarning, Clock, Cpu,
	Scaling,
	Smartphone
} from "lucide-react";
import {Badge} from "@/components/ui/badge.tsx";

// {
// 	"serial": "X8NNQ48PCAMVQ845",
// 	"brand": "realme",
// 	"model": "RMX3686",
// 	"batteryLevel": "100%",
// 	"batteryStatus": "Full",
// 	"androidVersion": "15",
// 	"apiLevel": "35",
// 	"screenSize": "1080x2412",
// 	"cpuAbi": "arm64-v8a",
// 	"uptime": "10:48:10 up 7 days, 21:13,  0 users,  load average: 19.86, 18.17, 17.75",
// 	"connection": "device"
// }
// '1': 'Unknown',
// 	'2': 'Charging',
// 	'3': 'Discharging',
// 	'4': 'Not charging',
// 	'5': 'Full',

const DeviceDetailsDialog = ({open, onOpenChange, device}: {open: boolean, onOpenChange: () => void, device: DeviceDetails}) => {
	const handleCopyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text).then(() => {
			console.log("Copied to clipboard:", text);
		}).catch(err => {
			console.error("Failed to copy text:", err);
		});
	}

	const renderBatteryStatus = (status: string) => {
		switch (status) {
			case "Full":
				return <BatteryFull className={"w-5 h-5 fill-green-500 text-green-500 "} />
			case "Charging":
				return <BatteryCharging className={"w-5 h-5 fill-green-500 text-green-500"} />
			case "Discharging":
				return <BatteryMedium className={"w-5 h-5 fill-amber-500 text-amber-500"} />
			case "Not charging":
				return <BatteryWarning className={"w-5 h-5 fill-red-500 text-red-500"} />
			case "Unknown":
				return <Battery className={"w-5 h-5 fill-gray-500 text-gray-500"} />
		}
	}
	return (
		<Dialog open={open} onOpenChange={onOpenChange} >
			<DialogContent className={"bg-gray-900 text-gray-100 border-0 min-w-2/3"}>
				<DialogHeader>
					<DialogTitle className={"flex items-center space-x-2"}>
						<Smartphone className={"text-white size-5 "} />
						<p className={"font-quicksand-semibold"}>{device?.model}</p>
						<Badge className={"bg-green-500 text-white font-quicksand-medium uppercase ml-6"}>{device?.connection}</Badge>
					</DialogTitle>
					<DialogDescription className={"mt-5 grid grid-cols-4 gap-4"}>
						<div className={"flex items-center gap-x-2"}>
							<Barcode className={"w-5 h-5 text-gray-500"} />
							<div>
								<span className={"text-gray-500 font-quicksand-regular text-xs"}>Serial</span>
								<p className={"font-quicksand-semibold text-gray-100"}>{device?.serial}</p>
							</div>
						</div>
						<div className={"flex items-center gap-x-2"}>
							<Smartphone className={"w-5 h-5 text-gray-500"} />
							<div>
								<span className={"text-gray-500 font-quicksand-regular text-xs"}>Brand</span>
								<p className={"font-quicksand-semibold text-gray-100 capitalize"}>{device?.brand}</p>
							</div>
						</div>
						<div className={"flex items-center gap-x-2"}>
							<Battery className={"w-5 h-5 text-gray-500"} />
							<div>
								<span className={"text-gray-500 font-quicksand-regular text-xs"}>Battery Level</span>
								<p className={"font-quicksand-semibold text-gray-100 capitalize"}>{device?.batteryLevel}</p>
							</div>
						</div>
						<div className={"flex items-center gap-x-2"}>
							{renderBatteryStatus(device?.batteryStatus)}
							<div>
								<span className={"text-gray-500 font-quicksand-regular text-xs"}>Battery Status</span>
								<p className={"font-quicksand-semibold text-gray-100 capitalize"}>{device?.batteryStatus}</p>
							</div>
						</div>
						<div className={"flex items-center gap-x-2"}>
							<Scaling className={"w-5 h-5 text-gray-500"} />
							<div>
								<span className={"text-gray-500 font-quicksand-regular text-xs"}>Screen Size</span>
								<p className={"font-quicksand-semibold text-gray-100 capitalize"}>{device?.screenSize}</p>
							</div>
						</div>
						<div className={"flex items-center gap-x-2"}>
							<Cpu className={"w-5 h-5 text-gray-500"} />
							<div>
								<span className={"text-gray-500 font-quicksand-regular text-xs"}>CPU</span>
								<p className={"font-quicksand-semibold text-gray-100 capitalize"}>{device?.cpuAbi}</p>
							</div>
						</div>
						<div className={"flex items-center gap-x-2"}>
							<Clock className={"w-5 h-5 text-gray-500"} />
							<div>
								<span className={"text-gray-500 font-quicksand-regular text-xs"}>Uptime</span>
								<p className={"font-quicksand-semibold text-gray-100 capitalize"}>{device?.uptime?.split(",")[0]}</p>
							</div>
						</div>
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	)
}
export default DeviceDetailsDialog
