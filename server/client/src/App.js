// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Login from "./pages/user/Login";
import Signup from "./pages/user/Signup";
import AdminSidebar from "./Components/admin/AdminSidebar";

// AppContent must be inside <Router>
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Dummy function placeholders — you can replace with real handlers
  const handlePageChange = (page) => console.log("Navigate to:", page);
  const handleSidebarClose = () => console.log("Sidebar closed");

  return (
    <div className="flex min-h-screen">
      {/* Show AdminSidebar only for /admin routes */}
      {isAdminRoute && (
        <AdminSidebar
          currentPage={location.pathname.split("/")[2]} // e.g. 'dashboard'
          onPageChange={handlePageChange}
          sidebarOpen={true}
          onCloseSidebar={handleSidebarClose}
        />
      )}

      <div className="flex-1 p-5">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/admin/dashboard"
            element={<div className="text-xl">Admin Dashboard</div>}
          />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
