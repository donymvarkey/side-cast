import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export default function AdvancedSettings() {
  const [maxConnections, setMaxConnections] = useState<number>(1);
  const [defaultMode, setDefaultMode] = useState<string>("");
  const [adbTimeout, setAdbTimeout] = useState<number>(5000);
  const [debugLogging, setDebugLogging] = useState<boolean>(false);
  const [scriptsPath, setScriptsPath] = useState<string>("");

  const handleBrowseScripts = () => {
    // TODO: Implement file dialog via IPC
    console.log("Browse scripts folder");
  };

  const handleSetSettings = (setting: string, value: unknown) => {
    switch (setting) {
      case "maxConnections":
        window.settings.set("maxConnections", Number(value));
        setMaxConnections(Number(value));
        return;
      case "adbTimeout":
        window.settings.set("adbTimeout", Number(value));
        setAdbTimeout(Number(value));
        return;
      case "debugLogging":
        window.settings.set("debugLogging", Boolean(value));
        setDebugLogging(Boolean(value));
        return;
      case "scriptPath":
        window.settings.set("scriptsPath", String(value));
        setScriptsPath(String(value));
        return;
      case "defaultConnectionMode":
        window.settings.set("defaultConnectionMode", String(value));
        setDefaultMode(String(value));
        return;
    }
  };

  useEffect(() => {
    window.settings.getAll().then((prefs) => {
      setMaxConnections(prefs.maxConnections);
      setDefaultMode(prefs.defaultConnectionMode);
      setAdbTimeout(prefs.adbTimeout);
      setDebugLogging(prefs.debugLogging);
      setScriptsPath(prefs.scriptsPath || "");
    });
  }, []);

  return (
    <Card className="bg-gray-900 text-white border border-gray-700">
      <CardHeader>
        <CardTitle className="font-quicksand-semibold text-lg">
          Advanced Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Max Connections */}
        <div>
          <Label className="font-quicksand-medium text-sm text-gray-400">
            Max Simultaneous Connections
          </Label>
          <Input
            type="text"
            min="1"
            value={maxConnections}
            onChange={(e) =>
              handleSetSettings("maxConnections", e.target.value)
            }
            className="mt-1 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Default Mode */}
        <div>
          <Label className="font-quicksand-medium text-sm text-gray-400">
            Default Device Connection Mode
          </Label>
          <select
            value={defaultMode}
            onChange={(e) =>
              handleSetSettings("defaultConnectionMode", e.target.value)
            }
            className="mt-1 w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 font-quicksand-regular"
          >
            <option value="usb">USB</option>
            <option value="tcpip">TCP/IP</option>
          </select>
        </div>

        {/* ADB Timeout */}
        <div>
          <Label className="font-quicksand-medium text-sm text-gray-400">
            ADB Command Timeout (ms)
          </Label>
          <Input
            type="text"
            value={adbTimeout}
            onChange={(e) => handleSetSettings("adbTimeout", e.target.value)}
            className="mt-1 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Debug Logging */}
        <div className="flex items-center justify-between">
          <Label className="font-quicksand-medium text-sm text-gray-400">
            Enable Debug Logging
          </Label>
          <Switch
            checked={debugLogging}
            onCheckedChange={() =>
              handleSetSettings("debugLogging", !debugLogging)
            }
          />
        </div>

        {/* Custom Scripts Folder */}
        <div>
          <Label className="font-quicksand-medium text-sm text-gray-400">
            Custom Scripts Folder
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={scriptsPath}
              onChange={(e) => handleSetSettings("scriptsPath", e.target.value)}
              placeholder="/path/to/scripts"
              className="bg-gray-800 border-gray-700 text-white flex-1"
            />
            <Button
              onClick={handleBrowseScripts}
              className="bg-blue-500 hover:bg-blue-600 font-quicksand-medium"
            >
              Browse
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
