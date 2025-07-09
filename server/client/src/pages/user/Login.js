import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="min-h-screen bg-[#f4f5fa] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        {/* Logo + Branding */}
        <div className="mb-6 flex flex-col items-center">
          <div className="text-4xl text-blue-600 mb-2">👤🔒</div>
          <h1 className="text-xl font-semibold text-blue-600">UserFlow</h1>
        </div>

        {/* Welcome Text */}
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Welcome Back</h2>
        <p className="text-sm text-gray-500 mb-6">
          Please enter your credentials to access your account
        </p>

        {/* Form */}
        <form className="text-left space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
            <input
              type="email"
              placeholder="your.email@example.com"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input
              type="password"
              placeholder="********"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="accent-blue-600 mr-2" />
              Remember me
            </label>
            <a href="#" className="text-blue-500 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {/* Footer Text */}
        <p className="text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Register now
          </Link>
        </p>

        {/* Optional Footer */}
        <p className="text-xs text-gray-400 mt-8">© 2023 UserFlow. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
