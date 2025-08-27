import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ADBSettings() {
  const [connectionType, setConnectionType] = useState<"usb" | "tcpip">("usb");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("");
  const [adbPath, setAdbPath] = useState("");

  // Trigger Electron dialog to select adb binary
  const handleBrowseADB = async () => {
    const path = await window.electronAPI.invoke("adb:select-adb-path");
    if (path) {
      window.settings.set("adbPath", path);
      setAdbPath(path);
    }
  };

  // Handle the connection type change
  const handleConnectionTypeChange = (type: "usb" | "tcpip") => {
    setConnectionType(type);
    window.settings.set("connectionMode", type);
  };

  // Handle the IP Address input change
  const handleIpChange = (ip: string) => {
    window.settings.set("tcpIpHost", ip);
    setIp(ip);
  };

  // Handle the Port input change
  const handlePortChange = (port: string) => {
    window.settings.set("tcpIpPort", port);
    setPort(port);
  };

  useEffect(() => {
    window.settings.getAll().then((prefs) => {
      setConnectionType(prefs.connectionMode);
      setIp(prefs.tcpIpHost);
      setPort(prefs.tcpIpPort);
      setAdbPath(prefs.adbPath);
    });
  }, []);

  return (
    <Card className="bg-gray-900 text-white border border-gray-700">
      <CardHeader>
        <CardTitle className="font-quicksand-semibold text-lg">
          ADB Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Type */}
        <div>
          <Label className="font-quicksand-medium text-gray-400 text-sm">
            Connection Type
          </Label>
          <RadioGroup
            value={connectionType}
            onValueChange={(val: "usb" | "tcpip") =>
              handleConnectionTypeChange(val)
            }
            className="flex gap-4 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                className="text-gray-100 bg-gray-100"
                value="usb"
                id="usb"
              />
              <Label htmlFor="usb" className="font-quicksand-regular">
                USB
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                className="text-gray-100 bg-gray-100"
                value="tcpip"
                id="tcpip"
              />
              <Label htmlFor="tcpip" className="font-quicksand-regular">
                TCP/IP
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* IP & Port Fields (only if TCP-IP) */}
        {connectionType === "tcpip" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-quicksand-medium text-sm text-gray-400">
                IP Address
              </Label>
              <Input
                value={ip}
                onChange={(e) => handleIpChange(e.target.value)}
                placeholder="192.168.0.101"
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <Label className="font-quicksand-medium text-sm text-gray-400">
                Port
              </Label>
              <Input
                value={port}
                onChange={(e) => handlePortChange(e.target.value)}
                placeholder="5555"
                className="mt-1 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
        )}

        {/* ADB Path */}
        <div>
          <Label className="font-quicksand-medium text-sm text-gray-400">
            ADB Path
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={adbPath}
              onChange={(e) => setAdbPath(e.target.value)}
              placeholder="Path to adb executable"
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Button
              type="button"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleBrowseADB}
            >
              Browse
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
