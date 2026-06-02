import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom'; // 1. Added useNavigate here

export default function Layout() {
  const navigate = useNavigate(); // 2. Initialized the navigation hook

  // 3. Added the logout function to clear storage and redirect
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/login'); // Sends the user back to the login screen
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-green-800 text-white flex flex-col">
        <div className="p-5 text-2xl font-bold border-b border-green-700">
          GroceryMart
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="block p-3 rounded hover:bg-green-700 transition">📊 Overview</Link>
          <Link to="/orders" className="block p-3 rounded hover:bg-green-700 transition">🧾 Orders</Link>
          <Link to="/categories" className="block p-3 rounded hover:bg-green-700 transition">📁 Categories</Link>
          <Link to="/products" className="block p-3 rounded hover:bg-green-700 transition">📦 Products</Link>
          <Link to="/customers" className="block p-3 rounded hover:bg-green-700 transition">👥 Customers</Link>
          
          {/* Create Admin Link */}
          <Link to="/create-admin" className="block p-3 rounded hover:bg-green-700 transition">🔑 Manage Admins</Link>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Admin Portal</h2>
          
          {/* Profile & Logout Container */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <span className="text-gray-600 font-medium">Admin</span>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
            
            {/* 4. Added Logout Button */}
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition border border-red-100"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* DYNAMIC PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}