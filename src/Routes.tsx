import React from "react";
import { Route, Routes } from "react-router";
import { Home, Settings } from "./screens";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default AppRoutes;
