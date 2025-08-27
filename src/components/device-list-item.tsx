import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Image, Info, Monitor, SmartphoneIcon, Usb, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DeviceListItem = ({
  serial,
  model,
  product,
  device,
  connectionMode,
  activeSessions,
  mirrorDevice,
  stopMirror,
  getInfo,
  onOpenChange,
}: {
  serial: string;
  model: string;
  product: string;
  device: string;
  connectionMode: "usb" | "tcpip";
  activeSessions: Record<string, { pid: number; serial: string }>;
  mirrorDevice: (serial: string) => void;
  stopMirror: (serial: string) => void;
  getInfo: (serial: string) => void;
  onOpenChange: () => void;
}) => {
  const [recordingStatus, setRecordingStatus] = useState<
    Record<string, boolean>
  >({});
  const handleDeviceInfo = (serial: string) => {
    getInfo(serial);
    onOpenChange();
  };

  /**
   *
   * @param serial Device serial number
   * Start screen recording for the device with the given serial number.
   */
  const handleStartRecording = async (serial: string) => {
    try {
      const result = await window.screenApi.startRecording(serial);
      if (result.success) {
        setRecordingStatus({
          ...recordingStatus,
          [serial]: true,
        });
        console.log("Recording started:", result.message);
        toast.success(result.message);
      } else {
        console.error("Failed to start recording:", result.error);
        toast.error(`Failed to start recording: ${result.error}`);
      }
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error(`Failed to start recording: ${error}`);
    }
  };

  /**
   *
   * @param serial Device serial number
   * Stop screen recording for the device with the given serial number.
   */
  const handleStopRecording = async (serial: string) => {
    try {
      const result = await window.screenApi.stopRecording(serial);
      if (result.success) {
        setRecordingStatus({
          ...recordingStatus,
          [serial]: false,
        });
        toast.success("Recording stopped. File saved.");
      } else {
        console.error("Failed to stop recording:", result.error);
        toast.error(`Failed to stop recording: ${result.error}`);
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  /**
   *
   * @param serial Device serial number
   * Take a screenshot for the device with the given serial number.
   */
  const handleTakeScreenshot = async (serial: string) => {
    try {
      const result = await window.screenApi.takeScreenshot(serial);
      if (result.success) {
        console.log("Screenshot saved:", result.path);
        toast.success("Screenshot saved: " + result.path);
        // You could add a toast notification here
      } else {
        console.error("Failed to take screenshot:", result.error);
        toast.error(`Failed to take screenshot: ${result.error}`);
      }
    } catch (error) {
      console.error("Error taking screenshot:", error);
    }
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
          {/* {activeSessions[serial]?.serial === serial && (
            <Cast className="text-green-500 size-4" />
          )} */}
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
          {activeSessions[serial]?.serial === serial ? (
            <>
              <Button
                onClick={() => stopMirror(serial)}
                className="flex-1"
                variant={"destructive"}
              >
                Stop Mirror
              </Button>
            </>
          ) : (
            <Button
              className={"bg-green-500 hover:bg-green-600 flex-1"}
              onClick={() => mirrorDevice(serial)}
            >
              <Monitor className="w-4 h-4 mr-1" /> Mirror
            </Button>
          )}
          <Button
            onClick={() => handleDeviceInfo(serial)}
            variant="secondary"
            className={"flex-1"}
          >
            <Info className="w-4 h-4 mr-1" /> Info
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        {activeSessions[serial]?.serial === serial && (
          <div>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant={"ghost"}
                  className="hover:bg-gray-800"
                  onClick={() =>
                    recordingStatus[serial]
                      ? handleStopRecording(serial)
                      : handleStartRecording(serial)
                  }
                >
                  <div
                    className={cn(
                      "bg-red-500 size-4 rounded-full",
                      recordingStatus[serial] && "animate-pulse"
                    )}
                  />
                </Button>
                <TooltipContent>
                  {recordingStatus[serial] ? (
                    <span>Stop Recording</span>
                  ) : (
                    <span>Start Recording</span>
                  )}
                </TooltipContent>
              </TooltipTrigger>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant={"ghost"}
                  className="hover:bg-gray-800"
                  onClick={() => handleTakeScreenshot(serial)}
                >
                  <Image className="text-gray-100 size-4" />
                </Button>
                <TooltipContent>
                  <span>Take a screenshot</span>
                </TooltipContent>
              </TooltipTrigger>
            </Tooltip>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
export default DeviceListItem;
