import {useEffect, useState} from "react";
import DeviceListItem from "@/components/device-list-item.tsx";

const Home = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);

  const listConnectedDevices = async () => {
    setLoading(true);
    try {
      window.electronAPI.invoke("adb:list-devices").then((devices) => {
        setDevices(devices)
        console.log("Connected devices:", devices);
      });
    }catch (e) {
      console.error("Error listing connected devices:", e);
    }finally {
      setLoading(false);
    }
  }

  const handleMirror = async (serial: string) => {
    console.log("--->", serial)

    const res = await window.electronAPI.invoke("adb:mirror-device", serial, []);
    if (!res.success) {
      alert("Failed to mirror device: " + res.error);
    }
  };

  useEffect(() => {
    listConnectedDevices()
    const pollingLoop = setInterval(() => {
      listConnectedDevices()
    }, 3000)

    return () => clearInterval(pollingLoop);
  }, [])
  return (
    <div className={"w-full h-full"}>
      <div className={"flex flex-col mt-10"}>
        <h1 className={"text-gray-400 font-quicksand-semibold mb-4"}>Connected Devices</h1>
        {loading ? (
          <p className="text-gray-400 font-quicksand-regular">Scanning for devices...</p>
        ) : devices.length === 0 ? (
          <p className="text-gray-500 font-quicksand-regular">No devices connected.</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {devices.map((device, index) => (
              <DeviceListItem key={index} {...device} mirrorDevice={(serial: string) => handleMirror(serial)} />
            ))}
          </div>
          )}
      </div>
    </div>
  );
};

export default Home;
