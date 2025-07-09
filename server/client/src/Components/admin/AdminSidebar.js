import React from "react";
import { Home, Users, Calendar, MessageCircle, LogOut } from "lucide-react";

const AdminSidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col items-center py-6 shadow-lg">
      {/* Avatar */}
      <img
        src="https://i.pravatar.cc/100?img=12"
        alt="Admin Avatar"
        className="w-20 h-20 rounded-full mb-4"
      />
      <h2 className="text-lg font-semibold mb-6">Admin - Mira</h2>

      {/* Navigation */}
      <nav className="space-y-4 w-full px-6">
        <div className="flex items-center space-x-2 hover:text-blue-400 cursor-pointer">
          <Home size={20} />
          <span>Dashboard</span>
        </div>
        <div className="flex items-center space-x-2 hover:text-blue-400 cursor-pointer">
          <Users size={20} />
          <span>Users</span>
        </div>
        <div className="flex items-center space-x-2 hover:text-blue-400 cursor-pointer">
          <Calendar size={20} />
          <span>Sessions</span>
        </div>
        <div className="flex items-center space-x-2 hover:text-blue-400 cursor-pointer">
          <MessageCircle size={20} />
          <span>Feedback</span>
        </div>
        <div className="flex items-center space-x-2 hover:text-red-400 cursor-pointer mt-10">
          <LogOut size={20} />
          <span>Logout</span>
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;
