import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('adminToken'); // 🔥 ADDED THIS
      const res = await axios.get('http://localhost:5000/api/customers', {
        headers: { Authorization: `Bearer ${token}` } // 🔥 ADDED THIS
      });
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // One-way suspension logic
  const handleSuspend = async (id) => {
    if (!window.confirm("Are you sure you want to suspend this account? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem('adminToken'); // 🔥 ADDED THIS
      // Note the empty {} as the second argument for the body payload
      await axios.put(`http://localhost:5000/api/customers/${id}/suspend`, {}, {
        headers: { Authorization: `Bearer ${token}` } // 🔥 ADDED THIS
      });
      fetchCustomers(); // Refresh the list from the database
    } catch (error) {
      console.error("Error suspending customer:", error);
      alert("Failed to suspend customer.");
    }
  };

  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = 
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? cust.is_active : !cust.is_active;

    return matchesSearch && matchesStatus;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.is_active).length;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Management</h1>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-400 uppercase">Total Customers</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{totalCustomers}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-400 uppercase">Active Accounts</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeCustomers}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-400 uppercase">Suspended Accounts</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{totalCustomers - activeCustomers}</p>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">All Registered Users ({filteredCustomers.length})</h2>
        <div className="flex w-full md:w-auto flex-1 max-w-xl gap-3 justify-end">
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="border p-2.5 rounded-lg text-sm flex-1 md:max-w-md shadow-sm" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
          <select 
            className="border p-2.5 rounded-lg text-sm w-44 bg-white shadow-sm font-medium text-gray-700"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* CUSTOMERS TABLE DISPLAY */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase font-semibold tracking-wider">
                <th className="py-4 px-6">Customer Details</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6 text-center">Account Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-400 bg-gray-50/50">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(cust => (
                  <tr key={cust.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-800">{cust.name}</div>
                      <div className="text-xs text-gray-400">{cust.email}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {new Date(cust.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                        cust.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {cust.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {cust.is_active ? (
                        <button 
                          onClick={() => handleSuspend(cust.id)}
                          className="text-xs border px-3 py-1.5 rounded-lg font-medium transition shadow-sm text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Suspend Account
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Action restricted</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}