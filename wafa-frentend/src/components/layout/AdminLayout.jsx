import React from "react";
import TopBar from "./TopBar";
import SideBarAdmin from "./SideBarAdmin";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-white">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <SideBarAdmin />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
