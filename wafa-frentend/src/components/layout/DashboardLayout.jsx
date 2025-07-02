import React from "react";
import { Outlet } from "react-router";
import SideBar from "./SideBar";


const DashBoardLayout = () => {

  return (
    
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#0A0A0F] via-[#111015] to-[#1A1625] ">
      <SideBar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashBoardLayout;
