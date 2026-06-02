import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  
  // States for adding
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  // States for editing
  const [editingId, setEditingId] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatImage, setEditCatImage] = useState('');

  // 🔥 UPDATED: Added headers to GET request
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('http://localhost:5000/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔥 UPDATED: Added headers to POST request
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName || !newCatImage) return alert("Please fill in all fields");

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post('http://localhost:5000/api/categories', {
        name: newCatName,
        image_url: newCatImage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewCatName('');
      setNewCatImage('');
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category.");
    }
  };

  // 🔥 UPDATED: Added headers to DELETE request
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  };

  const startEditing = (cat) => {
    setEditingId(cat.id);
    setEditCatName(cat.name);
    setEditCatImage(cat.image_url);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditCatName('');
    setEditCatImage('');
  };

  // 🔥 UPDATED: Added headers to PUT request
  const handleSaveEdit = async (id) => {
    if (!editCatName || !editCatImage) return alert("Fields cannot be empty");

    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`http://localhost:5000/api/categories/${id}`, {
        name: editCatName,
        image_url: editCatImage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null); 
      fetchCategories();  
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Categories</h1>

      {/* ADD CATEGORY FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Category Name (e.g. Fruits)" 
            className="flex-1 border border-gray-300 p-2 rounded-lg"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Image URL" 
            className="flex-1 border border-gray-300 p-2 rounded-lg"
            value={newCatImage}
            onChange={(e) => setNewCatImage(e.target.value)}
          />
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition">
            + Add
          </button>
        </form>
      </div>

      {/* CATEGORIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col items-center p-4">
            
            {editingId === cat.id ? (
              /* --- EDIT MODE UI --- */
              <div className="w-full flex flex-col gap-3">
                <input 
                  type="text" 
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded text-sm"
                  placeholder="Category Name"
                />
                <input 
                  type="text" 
                  value={editCatImage}
                  onChange={(e) => setEditCatImage(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded text-sm"
                  placeholder="Image URL"
                />
                <div className="flex gap-2 w-full mt-2">
                  <button 
                    onClick={() => handleSaveEdit(cat.id)}
                    className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium flex-1 py-2 rounded transition"
                  >
                    Save
                  </button>
                  <button 
                    onClick={cancelEditing}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium flex-1 py-2 rounded transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* --- NORMAL MODE UI --- */
              <>
                <img src={cat.image_url} alt={cat.name} className="w-20 h-20 object-contain rounded-2xl mb-3 bg-gray-100 p-3" />
                <h3 className="font-semibold text-lg text-gray-800 mb-3">{cat.name}</h3>
                
                <div className="flex w-full gap-2 mt-auto">
                  <button 
                    onClick={() => startEditing(cat)}
                    className="text-blue-500 hover:text-blue-700 text-sm font-medium flex-1 border border-blue-100 hover:bg-blue-50 py-2 rounded transition"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium flex-1 border border-red-100 hover:bg-red-50 py-2 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}