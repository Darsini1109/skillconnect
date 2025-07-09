import React from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

const Dashboard = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-medium">Total Users</h2>
            <p className="text-3xl font-bold text-blue-600 mt-2">120</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-medium">Active Sessions</h2>
            <p className="text-3xl font-bold text-green-600 mt-2">35</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-medium">Feedback Received</h2>
            <p className="text-3xl font-bold text-purple-600 mt-2">18</p>
          </div>
        </div>

        {/* Optional: Add a table or recent logs below */}
      </div>
    </div>
  );
};

export default Dashboard;
