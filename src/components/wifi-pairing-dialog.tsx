import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { getTcpIpErrorMessage } from "@/utils";

const WifiPairingDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: () => void;
}) => {
  const [pairingData, setPairingData] = useState({
    ip: "",
    port: "",
  });
  const [error, setError] = useState<string>("");

  const handleInputChange = (key: string, value: string) => {
    setPairingData({
      ...pairingData,
      [key]: value,
    });
  };

  const handleDeviceConnection = () => {
    window.electronAPI
      .invoke("adb:connect-wifi", pairingData?.ip, pairingData?.port)
      .then((output) => {
        console.log("🚀 ~ handleDeviceConnection ~ output:", output);
        if (
          typeof output === "string" &&
          output.toLocaleLowerCase().includes("connected to")
        ) {
          console.log("device connected");
        } else {
          const message = getTcpIpErrorMessage(output);
          console.log("🚀 ~ handleDeviceConnection ~ message:", message);
        }
      });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"bg-gray-900 text-gray-100 border-0 min-w-1/3"}>
        <DialogHeader>
          <DialogTitle className="font-quicksand-semibold">
            Pair new Device over Wifi
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="flex flex-col gap-y-4">
            <div>
              <Label className="font-quicksand-medium text-sm text-gray-400">
                IP Address
              </Label>
              <Input
                value={pairingData?.ip}
                onChange={(e) => handleInputChange("ip", e.target.value)}
                placeholder="192.168.0.101"
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="font-quicksand-medium text-sm text-gray-400">
                Port
              </Label>
              <Input
                value={pairingData?.port}
                onChange={(e) => handleInputChange("port", e.target.value)}
                placeholder="5555"
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button
              onClick={handleDeviceConnection}
              className="bg-green-500 hover:bg-green-600 font-quicksand-semibold"
            >
              Connect
            </Button>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default WifiPairingDialog;
