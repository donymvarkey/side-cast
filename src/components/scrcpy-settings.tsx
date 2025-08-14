import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AppSettings } from "@/types";

export default function ScrcpySettings() {
  const [bitrate, setBitrate] = useState<string>();
  const [maxResolution, setMaxResolution] = useState<number>();
  const [maxFps, setMaxFps] = useState<number>();
  const [showTouches, setShowTouches] = useState<boolean>(false);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [audioForwarding, setAudioForwarding] = useState<boolean>(false);
  const [customArgs, setCustomArgs] = useState<string>("");

  // Handle set bitrate
  const handleSetSettings = (setting: string, value: unknown) => {
    switch (setting) {
      case "bitrate":
        window.settings.set("bitrate", value);
        setBitrate(String(value));
        return;
      case "maxRes":
        window.settings.set("maxRes", value);
        setMaxResolution(Number(value));
        return;
      case "maxFPS":
        window.settings.set("maxFPS", Number(value));
        setMaxFps(Number(value));
        return;
      case "showTouches":
        window.settings.set("showTouches", Boolean(value));
        setShowTouches(Boolean(value));
        return;
      case "fullscreen":
        window.settings.set("fullscreen", Boolean(value));
        setFullscreen(Boolean(value));
        return;
      case "audioForwarding":
        window.settings.set("audioForwarding", Boolean(value));
        setAudioForwarding(Boolean(value));
        return;
      case "customArgs":
        window.settings.set("customArguments", value);
        setCustomArgs(String(value));
        return;
    }
  };

  useEffect(() => {
    window.settings.getAll().then((prefs: AppSettings) => {
      setBitrate(prefs.bitrate);
      setMaxResolution(prefs.maxRes);
      setMaxFps(prefs.maxFPS);
      setShowTouches(prefs.showTouches);
      setFullscreen(prefs.fullscreen);
      setAudioForwarding(prefs.audioForwarding);
      setCustomArgs(prefs.customArguments);
    });
  }, []);

  return (
    <Card className="bg-gray-900 text-white border border-gray-700">
      <CardHeader>
        <CardTitle className="font-quicksand-semibold text-lg">
          Scrcpy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bitrate */}
        <div>
          <Label className="font-quicksand-medium text-sm text-gray-400">
            Bitrate (8M-16M)
          </Label>
          <Input
            value={bitrate}
            onChange={(e) => handleSetSettings("bitrate", e.target.value)}
            placeholder="8M"
            className="mt-1 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Max Resolution */}
        <div>
          <Label className="font-quicksand-medium text-sm text-gray-400">
            Max Resolution (Width)
          </Label>
          <Input
            value={maxResolution}
            onChange={(e) => handleSetSettings("maxRes", e.target.value)}
            placeholder="1080"
            className="mt-1 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Max FPS */}
        <div>
          <Label className="font-quicksand-medium text-sm text-gray-400">
            Max FPS
          </Label>
          <Input
            value={maxFps}
            onChange={(e) => handleSetSettings("maxFPS", e.target.value)}
            placeholder="60"
            className="mt-1 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center justify-between">
          <Label className="font-quicksand-medium text-sm text-gray-400">
            Show Touches
          </Label>
          <Switch
            checked={showTouches}
            onCheckedChange={() =>
              handleSetSettings("showTouches", !showTouches)
            }
          />
        </div>

        {/* <div className="flex items-center justify-between">
          <Label className="font-quicksand-medium text-sm text-gray-400">
            Fullscreen
          </Label>
          <Switch
            checked={fullscreen}
            onCheckedChange={() => handleSetSettings("fullscreen", !fullscreen)}
          />
        </div> */}

        <div className="flex items-center justify-between">
          <Label className="font-quicksand-medium text-sm text-gray-400">
            Audio Forwarding
          </Label>
          <Switch
            checked={audioForwarding}
            onCheckedChange={() =>
              handleSetSettings("audioForwarding", !audioForwarding)
            }
          />
        </div>

        {/* Custom Arguments */}
        <div>
          <Label className="font-quicksand-medium text-sm text-gray-400">
            Custom Arguments
          </Label>
          <Textarea
            value={customArgs}
            onChange={(e) => handleSetSettings("customArgs", e.target.value)}
            placeholder="Enter additional scrcpy CLI arguments"
            className="mt-1 bg-gray-800 border-gray-700 text-white font-quicksand-regular"
          />
        </div>
      </CardContent>
    </Card>
  );
}
