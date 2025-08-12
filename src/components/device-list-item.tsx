import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Info, Monitor, SmartphoneIcon, Usb, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
// import {Badge} from "@/components/ui/badge.tsx";

const DeviceListItem = ({
  serial,
  model,
  product,
  device,
  status,
  connectionMode,
  mirrorDevice,
  getInfo,
  onOpenChange,
}: {
  serial: string;
  model: string;
  product: string;
  device: string;
  connectionMode: "usb" | "tcpip";
  status: string;
  mirrorDevice: (serial: string) => void;
  getInfo: (serial: string) => void;
  onOpenChange: () => void;
}) => {
  const handleDeviceInfo = (serial: string) => {
    getInfo(serial);
    onOpenChange();
  };
  return (
    <Card
      key={serial}
      className="bg-gray-900 text-white border border-gray-700 "
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-md font-quicksand-semibold flex items-center gap-2">
          <SmartphoneIcon className="w-4 h-4" />
          {model}
          {/* <div
            className={cn(
              "size-3  rounded-full",
              status === "device" ? "bg-green-500" : "bg-red-500"
            )}
          /> */}
          {connectionMode === "usb" ? (
            <Usb className="size-4 text-blue-500" />
          ) : (
            <Wifi className="size-4 text-blue-500" />
          )}
        </CardTitle>
        {/*<Badge variant="outline" className="text-xs uppercase bg-green-500 border-0 text-gray-100">*/}
        {/*	{status}*/}
        {/*</Badge>*/}
      </CardHeader>
      <CardContent className="space-y-1 font-quicksand-regular text-sm">
        <p>
          <span className="text-gray-400">Serial:</span> {serial}
        </p>
        <p>
          <span className="text-gray-400">Product:</span> {product || "—"}
        </p>
        <p>
          <span className="text-gray-400">Device:</span> {device || "—"}
        </p>
        <div className="flex gap-2 pt-2 items-center justify-between">
          <Button
            className={"bg-blue-500 hover:bg-blue-600 flex-1"}
            onClick={() => mirrorDevice(serial)}
          >
            <Monitor className="w-4 h-4 mr-1" /> Mirror
          </Button>
          <Button
            onClick={() => handleDeviceInfo(serial)}
            variant="secondary"
            className={"flex-1"}
          >
            <Info className="w-4 h-4 mr-1" /> Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
export default DeviceListItem;
