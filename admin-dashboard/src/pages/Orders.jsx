import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all database orders on component mount
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken'); // 🔥 ADDED THIS
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // 🔥 ADDED THIS
      const response = await axios.get(`${API_BASE_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` } // 🔥 ADDED THIS
      });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error pulling orders:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle click on "Mark as Delivered"
  const handleMarkDelivered = async (orderId) => {
    try {
      const token = localStorage.getItem('adminToken'); // 🔥 ADDED THIS
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // 🔥 ADDED THIS
      await axios.put(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
        status: 'delivered'
      }, {
        headers: { Authorization: `Bearer ${token}` } // 🔥 ADDED THIS
      });
      // Refresh local array state to update UI immediately
      fetchOrders();
    } catch (error) {
      alert("Failed to update status. Check backend connection.");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600 font-medium">Loading GroceryMart Orders...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Orders Management</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold tracking-wider">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer Email</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-mono font-semibold text-gray-900">#{order.id}</td>
                <td className="p-4 text-gray-600">{order.email || 'Guest User'}</td>
                <td className="p-4 font-medium text-gray-900">LKR {parseFloat(order.total_price).toFixed(2)}</td>
                <td className="p-4 text-gray-500">
                  {new Date(order.created_at).toLocaleString()}
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                    order.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  {order.status === 'paid' ? (
                    <button
                      onClick={() => handleMarkDelivered(order.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition"
                    >
                      ✓ Deliver Order
                    </button>
                  ) : order.status === 'delivered' ? (
                    <span className="text-gray-400 text-xs italic">Archived</span>
                  ) : (
                    <span className="text-amber-600 text-xs font-medium">Awaiting Payment</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-400 italic">
            No orders found in the database system.
          </div>
        )}
      </div>
    </div>
  );
}