import React from 'react';

export default function Overview() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      
      {/* Overview Card Container */}
      <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
        
        {/* The Logo Circle (Vibrant Green matching the mobile app) */}
        <div className="bg-green-500 w-32 h-32 rounded-full flex items-center justify-center mb-6 shadow-md">
          {/* SVG Shopping Basket Icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="white" 
            className="w-20 h-20"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" 
            />
          </svg>
        </div>

        {/* The App Name */}
        <h2 className="text-4xl font-bold text-gray-800 tracking-wide mb-2">
          GroceryMart
        </h2>
        
        {/* Subtitle text */}
        <p className="text-gray-500 text-lg">
          Welcome to your central management dashboard.
        </p>

      </div>
    </div>
  );
}