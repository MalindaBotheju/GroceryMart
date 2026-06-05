import React, { useState } from 'react';
import axios from 'axios';

export default function CreateAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.post(`${API_BASE_URL}/api/admin/create`, 
        { newAdminEmail: email, newAdminPassword: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus({ type: 'success', message: res.data.message });
      setEmail('');
      setPassword('');
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to create admin";
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Admins</h1>
      <p className="text-gray-500 mb-8">Create new administrative accounts with dashboard access.</p>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Admin</h2>
        
        {status.message && (
          <div className={`p-3 rounded-lg mb-4 text-sm font-medium border ${
            status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="newadmin@grocerymart.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
            <input 
              type="password" 
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium p-2.5 rounded-lg transition disabled:bg-green-300"
          >
            {loading ? 'Creating...' : 'Authorize New Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}