import DeviceLog from "@/components/device-log";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

const Logs = () => {
  const [activeMirrors, setActiveMirrors] = useState<
    Record<string, { pid: string; serial: string }>
  >({});

  const getAllActiveMirrors = async () => {
    const sessions = await window.electronAPI.invoke("adb:list-sessions");
    setActiveMirrors(sessions);
  };

  useEffect(() => {
    getAllActiveMirrors();
  }, []);
  return (
    <div className="flex w-full h-full mt-10">
      {Object.keys(activeMirrors).length > 0 ? (
        <Tabs
          className="w-full mr-8"
          defaultValue={
            Object.keys(activeMirrors).length > 0
              ? Object.keys(activeMirrors)[0]
              : undefined
          }
        >
          <TabsList className="bg-gray-950">
            {Object.keys(activeMirrors).map((item, index) => (
              <TabsTrigger
                className="data-[state=active]:bg-gray-200 data-[state=active]:text-gray-900 font-quicksand-medium text-gray-100"
                value={item}
                key={index}
              >
                {item}
              </TabsTrigger>
            ))}
          </TabsList>
          {Object.keys(activeMirrors).map((item, index) => (
            <TabsContent className="w-full" value={item} key={index}>
              <DeviceLog serial={activeMirrors[item].serial} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <span className="text-gray-100 font-quicksand-bold text-center">
          No Devices Connected
        </span>
      )}
    </div>
  );
};
export default Logs;
