import React from "react";
import { Outlet } from "react-router";
import SideBar from "./SideBar";
import TopBar from "./TopBar";


const DashBoardLayout = () => {

  return (

    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-white">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashBoardLayout;
