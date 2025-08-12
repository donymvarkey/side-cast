import { useEffect, useState } from "react";
import DeviceListItem from "@/components/device-list-item.tsx";
import DeviceDetailsDialog from "@/components/DeviceDetailsDialog.tsx";
import { DeviceDetails } from "@/types";
import { Power, PowerOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";

const Home = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState<DeviceDetails | null>(
    null
  );
  const [isServerRunning, setIsServerRunning] = useState(false);

  const getAdbServerState = async () => {
    window.electronAPI
      .invoke("adb:get-server-state")
      .then((state: boolean) => setIsServerRunning(state));
  };

  const listConnectedDevices = async () => {
    setLoading(true);
    try {
      window.electronAPI.invoke("adb:list-devices").then((devices) => {
        console.log("🚀 ~ listConnectedDevices ~ devices:", devices);
        setDevices(devices);
      });
    } catch (e) {
      console.error("Error listing connected devices:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleMirror = async (serial: string) => {
    const res = await window.electronAPI.invoke(
      "adb:mirror-device",
      serial,
      []
    );
    if (!res.success) {
      toast("Failed to mirror device: " + res.error);
      return;
    }

    toast("Mirroring device " + serial + " started successfully");
  };

  const fetchDeviceInfo = async (serial: string) => {
    const info = await window.electronAPI.invoke("adb:get-device-info", serial);
    console.log("Device info for", serial, ":", info);
    setDeviceDetails(info);
  };

  const handleStopServer = async () => {
    window.electronAPI.invoke("adb:stop-server").then(() => {
      setIsServerRunning((prev: boolean) => !prev);
    });
  };

  const handleStartServer = async () => {
    window.electronAPI.invoke("adb:start-server").then(() => {
      setIsServerRunning((prev: boolean) => !prev);
    });
  };

  const handleRestartServer = async () => {
    window.electronAPI.invoke("adb:restart-server").then(() => {
      setIsServerRunning((prev: boolean) => !prev);
    });
  };

  useEffect(() => {
    listConnectedDevices();
    const pollingLoop = setInterval(() => {
      listConnectedDevices();
    }, 3000);

    return () => clearInterval(pollingLoop);
  }, []);

  useEffect(() => {
    getAdbServerState();
  }, [devices]);
  return (
    <div className={"w-full h-full"}>
      <div className={"flex flex-col w-full"}>
        <div
          className={
            "flex items-center justify-end self-end gap-x-2 w-full mr-10"
          }
        >
          <div className={"flex items-center gap-x-2"}>
            <div
              className={cn(
                "rounded-full size-2 animate-pulse",
                isServerRunning ? "bg-green-500" : "bg-red-500"
              )}
            />
            <div className={"text-gray-400 font-quicksand-medium text-xs"}>
              ADB Server status:{" "}
              <span className={"font-quicksand-semibold text-gray-300"}>
                {isServerRunning ? "Active" : "Stopped"}
              </span>
            </div>
          </div>
          <Button
            className={"bg-gray-100 text-gray-900"}
            onClick={handleRestartServer}
          >
            <RefreshCw />
          </Button>
          {isServerRunning ? (
            <Button
              className={"bg-red-500 text-white"}
              onClick={handleStopServer}
            >
              <PowerOff />
            </Button>
          ) : (
            <Button
              className={"bg-green-500 text-white"}
              onClick={handleStartServer}
            >
              <Power />
            </Button>
          )}
        </div>
        <h1 className={"text-gray-400 font-quicksand-semibold mb-4 mt-2"}>
          Connected Devices
        </h1>
        {loading ? (
          <p className="text-gray-400 font-quicksand-regular">
            Scanning for devices...
          </p>
        ) : devices.length === 0 ? (
          <p className="text-gray-500 font-quicksand-regular">
            No devices connected.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pe-4">
            {devices.map((device, index) => (
              <DeviceListItem
                key={index}
                open={showDetailsDialog}
                onOpenChange={() => setShowDetailsDialog((prev) => !prev)}
                {...device}
                mirrorDevice={(serial: string) => handleMirror(serial)}
                getInfo={(serial: string) => fetchDeviceInfo(serial)}
              />
            ))}
          </div>
        )}
      </div>
      {showDetailsDialog && (
        <DeviceDetailsDialog
          device={deviceDetails}
          open={showDetailsDialog}
          onOpenChange={() => setShowDetailsDialog((prev: boolean) => !prev)}
        />
      )}
    </div>
  );
};

export default Home;
