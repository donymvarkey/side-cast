import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Info, Monitor, SmartphoneIcon} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {Badge} from "@/components/ui/badge.tsx";

const DeviceListItem = ({serial, model, product, device, status, mirrorDevice}: {serial: string, model: string, product: string, device: string, status: string, mirrorDevice: (serial: string) => void}) => {
	return (
		<Card key={serial} className="bg-gray-900 text-white border border-gray-700 ">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-lg font-quicksand-semibold flex items-center gap-2">
					<SmartphoneIcon className="w-5 h-5" />
					{model}
				</CardTitle>
				<Badge variant="outline" className="text-xs uppercase bg-green-500 border-0 text-gray-100">
					{status}
				</Badge>
			</CardHeader>
			<CardContent className="space-y-2 font-quicksand-regular text-sm">
				<p><span className="text-gray-400">Serial:</span> {serial}</p>
				<p><span className="text-gray-400">Product:</span> {product || "—"}</p>
				<p><span className="text-gray-400">Device:</span> {device || "—"}</p>
				<div className="flex gap-2 pt-2 justify-between">
					<Button className={"bg-blue-500 hover:bg-blue-600"}  onClick={() => mirrorDevice(serial)}>
						<Monitor className="w-4 h-4 mr-1" /> Mirror
					</Button>
					<Button variant="secondary" >
						<Info className="w-4 h-4 mr-1" /> Info
					</Button>
				</div>
			</CardContent>
		</Card>
	)
}
export default DeviceListItem
