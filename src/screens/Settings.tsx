import ADBSettings from "@/components/adb-settings";
import AdvancedSettings from "@/components/advanced-settings";
import ScrcpySettings from "@/components/scrcpy-settings";

const Settings = () => {
  return (
    <div className={"w-full h-full pe-10"}>
      <div className="mt-10">
        <ADBSettings />
      </div>
      <div className="mt-10">
        <ScrcpySettings />
      </div>
      <div className="mt-10">
        <AdvancedSettings />
      </div>
    </div>
  );
};

export default Settings;
