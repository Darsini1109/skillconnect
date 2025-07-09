import React from "react";

const AdminSidebar = () => {
  return (
    <div className="bg-white h-full w-64 p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Admin Sidebar</h2>
      <ul>
        <li className="mb-2">Dashboard</li>
        <li className="mb-2">Users</li>
        <li className="mb-2">Settings</li>
      </ul>
    </div>
  );
};

export default AdminSidebar;
