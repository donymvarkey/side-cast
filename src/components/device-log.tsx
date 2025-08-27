import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useEffect, useRef, useState } from "react";

const MAX_LOG_LINES = 500;
const FLUSH_INTERVAL_MS = 100;

type LogCatApi = {
  startLogcat: (serial: string) => Promise<void> | void;
  stopLogcat: (serial: string) => Promise<void> | void;
  onLogcatData: (cb: (serial: string, lines: string[]) => void) => void;
  onLogcatEnd: (cb: (serial: string) => void) => void;
  offLogcatData?: (cb: (serial: string, lines: string[]) => void) => void;
  offLogcatEnd?: (cb: (serial: string) => void) => void;
};

declare global {
  interface Window {
    logCatApi: LogCatApi;
  }
}

const DeviceLog = ({ serial }: { serial: string }) => {
  const [lines, setLines] = useState<string[]>([]);
  const bufferRef = useRef<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const flushTimerRef = useRef<number | null>(null);
  const autoScrollRef = useRef(true);
  const manualStopRef = useRef(false);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  useEffect(() => {
    if (autoScrollRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    manualStopRef.current = false; // fresh start

    const handleData = (s: string, batch: string[]) => {
      if (s !== serial) return;
      bufferRef.current.push(...batch);
    };

    const handleEnd = (s: string) => {
      if (s !== serial) return;
      if (!manualStopRef.current) {
        bufferRef.current.push("[Logcat stopped]");
      }
    };

    window.logCatApi.onLogcatData(handleData);
    window.logCatApi.onLogcatEnd(handleEnd);
    window.logCatApi.startLogcat(serial);

    flushTimerRef.current = window.setInterval(() => {
      if (bufferRef.current.length === 0) return;
      const chunk = bufferRef.current.splice(0, bufferRef.current.length);
      setLines((prev) => {
        const next = [...prev, ...chunk];
        return next.length > MAX_LOG_LINES ? next.slice(-MAX_LOG_LINES) : next;
      });
    }, FLUSH_INTERVAL_MS);

    return () => {
      manualStopRef.current = true; // now mark it as manual
      window.logCatApi.stopLogcat(serial);

      window.logCatApi.offLogcatData?.(handleData);
      window.logCatApi.offLogcatEnd?.(handleEnd);

      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current);
        flushTimerRef.current = null;
      }

      bufferRef.current.length = 0;
    };
  }, []);

  return (
    <div className="w-full mt-6">
      <Card className="bg-gray-900 border border-gray-700 h-[75vh] flex flex-col max-w-[70vw]">
        <CardHeader>
          <CardTitle className="text-gray-100 text-sm font-quicksand-regular">
            DeviceLog for device{" "}
            <span className="font-quicksand-bold">{serial}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex w-full h-full">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="w-full max-h-[65vh] overflow-y-scroll rounded-md bg-black/80 p-3"
          >
            <pre className="whitespace-pre-wrap text-xs text-gray-100 font-mono">
              {lines.join("\n")}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceLog;
