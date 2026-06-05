import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function Layout() {
  const navigate = useNavigate();

  // 🔥 1. Get the logged-in admin's email from storage
  const currentAdminEmail = localStorage.getItem('adminEmail');
  
  // 🔥 2. Define the main super admin
  const MAIN_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL;
  
  // 🔥 3. Check if the current user is the main admin
  const isMainAdmin = currentAdminEmail === MAIN_ADMIN_EMAIL;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/login'); 
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
          
          {/* 🔥 4. CONDITIONAL RENDER: Only show if it is the Main Admin */}
          {isMainAdmin && (
            <Link to="/create-admin" className="block p-3 rounded hover:bg-green-700 transition">🔑 Manage Admins</Link>
          )}
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
              
              {/* 🔥 5. Dynamically show the logged-in email and their initial */}
              <span className="text-gray-600 font-medium">
                {currentAdminEmail || 'Admin'}
              </span>
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold uppercase">
                {currentAdminEmail ? currentAdminEmail[0] : 'A'}
              </div>

            </div>
            
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