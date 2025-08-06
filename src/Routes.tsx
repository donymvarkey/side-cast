import { Route, Routes } from "react-router";
import MainLayout from "@/layouts/MainLayout.tsx";
import {About, Devices, Home, Logs, Recordings, Settings} from "@/screens";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path={"/"} element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="settings" element={<Settings />} />
        <Route path="devices" element={<Devices />} />
        <Route path="recordings" element={<Recordings />} />
        <Route path="logs" element={<Logs />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
