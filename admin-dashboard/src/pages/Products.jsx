import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('');

  // States for adding a new product
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantityAmount, setQuantityAmount] = useState('');
  const [quantityUnit, setQuantityUnit] = useState('g');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // States for editing an existing product
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editQuantityAmount, setEditQuantityAmount] = useState('');
  const [editQuantityUnit, setEditQuantityUnit] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');

  // 🔥 UPDATED: Added headers to GET requests
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/products`, config),
        axios.get(`${API_BASE_URL}/api/categories`, config)
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 UPDATED: Added headers to POST request
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!name || !price || !categoryId || !quantityAmount || !stock) {
      return alert("Please fill in all required fields");
    }

    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      await axios.post(`${API_BASE_URL}/api/products`, {
        name,
        description,
        quantity_amount: parseFloat(quantityAmount),
        quantity_unit: quantityUnit,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        image_url: imageUrl,
        category_id: parseInt(categoryId)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setName(''); setDescription(''); setQuantityAmount(''); 
      setQuantityUnit('g'); setPrice(''); setStock(''); 
      setImageUrl(''); setCategoryId('');
      
      fetchData();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product.");
    }
  };

  // 🔥 UPDATED: Added headers to DELETE request
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const startEditing = (prod) => {
    setEditingId(prod.id);
    setEditName(prod.name);
    setEditDescription(prod.description || '');
    setEditQuantityAmount(prod.quantity_amount);
    setEditQuantityUnit(prod.quantity_unit);
    setEditPrice(prod.price);
    setEditStock(prod.stock);
    setEditImageUrl(prod.image_url);
    setEditCategoryId(prod.category_id || '');
  };

  // 🔥 UPDATED: Added headers to PUT request
  const handleSaveEdit = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      await axios.put(`${API_BASE_URL}/api/products/${id}`, {
        name: editName,
        description: editDescription,
        quantity_amount: parseFloat(editQuantityAmount),
        quantity_unit: editQuantityUnit,
        price: parseFloat(editPrice),
        stock: parseInt(editStock, 10),
        image_url: editImageUrl,
        category_id: parseInt(editCategoryId)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  const filteredProducts = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedFilterCategory ? prod.category_id === parseInt(selectedFilterCategory) : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Products</h1>

      {/* ADD PRODUCT FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <input type="text" placeholder="Product Name" className="border p-2 rounded-lg text-sm w-full" value={name} onChange={e => setName(e.target.value)} />
          
          <div className="flex gap-2">
            <input type="number" step="0.01" placeholder="Qty Amount" className="border p-2 rounded-lg text-sm w-2/3" value={quantityAmount} onChange={e => setQuantityAmount(e.target.value)} />
            <select className="border p-2 rounded-lg text-sm w-1/3 bg-white" value={quantityUnit} onChange={e => setQuantityUnit(e.target.value)}>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="L">L</option>
              <option value="ml">ml</option>
              <option value="pcs">pcs</option>
            </select>
          </div>

          <input type="number" step="0.01" placeholder="Price (LKR)" className="border p-2 rounded-lg text-sm w-full" value={price} onChange={e => setPrice(e.target.value)} />
          <input type="number" placeholder="Stock Level" className="border p-2 rounded-lg text-sm w-full" value={stock} onChange={e => setStock(e.target.value)} />
          
          <select className="border p-2 rounded-lg text-sm w-full bg-white" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="" disabled>Select Category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>

          <input type="text" placeholder="Image URL" className="border p-2 rounded-lg text-sm w-full md:col-span-2 lg:col-span-3" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          
          <textarea placeholder="Product Description..." className="border p-2 rounded-lg text-sm w-full md:col-span-3 lg:col-span-4" rows="2" value={description} onChange={e => setDescription(e.target.value)}></textarea>

          <div className="md:col-span-3 lg:col-span-4 flex justify-end">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition text-sm">+ Add Product</button>
          </div>
        </form>
      </div>

      {/* SEARCH BAR & PARALLEL CATEGORY FILTER DROPDOWN */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">All Products ({filteredProducts.length})</h2>
        <div className="flex w-full md:w-auto flex-1 max-w-xl gap-3 justify-end">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="border p-2.5 rounded-lg text-sm flex-1 md:max-w-md shadow-sm" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
          <select 
            className="border p-2.5 rounded-lg text-sm w-48 bg-white shadow-sm font-medium text-gray-700"
            value={selectedFilterCategory}
            onChange={e => setSelectedFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(prod => (
          <div key={prod.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col relative">
            
            {editingId === prod.id ? (
              <div className="flex flex-col gap-2">
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="border p-1.5 rounded text-sm" placeholder="Name"/>
                <div className="flex gap-2">
                  <input type="number" step="0.01" value={editQuantityAmount} onChange={e => setEditQuantityAmount(e.target.value)} className="border p-1.5 rounded text-sm w-1/2" placeholder="Qty"/>
                  <input type="text" value={editQuantityUnit} onChange={e => setEditQuantityUnit(e.target.value)} className="border p-1.5 rounded text-sm w-1/2" placeholder="Unit (g, kg)"/>
                </div>
                <input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(e.target.value)} className="border p-1.5 rounded text-sm" placeholder="Price"/>
                <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} className="border p-1.5 rounded text-sm" placeholder="Stock"/>
                <input type="text" value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)} className="border p-1.5 rounded text-sm" placeholder="Image URL"/>
                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className="border p-1.5 rounded text-sm" rows="2" placeholder="Description"></textarea>
                <select value={editCategoryId} onChange={e => setEditCategoryId(e.target.value)} className="border p-1.5 rounded text-sm bg-white">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleSaveEdit(prod.id)} className="bg-green-500 text-white py-1.5 flex-1 rounded text-sm">Save</button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-300 py-1.5 flex-1 rounded text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <span className="absolute top-2 right-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium z-10">
                  {prod.category_name || 'Unassigned'}
                </span>
                
                <div className="w-full h-36 bg-gray-50 rounded-lg overflow-hidden mb-3 mt-2 flex items-center justify-center">
                  <img 
                    src={prod.image_url} 
                    alt={prod.name} 
                    className="w-full h-full object-contain p-1" 
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-800 line-clamp-1">{prod.name}</h3>
                  <p className="text-gray-400 text-xs mb-1">{prod.quantity_amount} {prod.quantity_unit}</p>
                  <p className="text-gray-500 text-xs mb-2 line-clamp-2" title={prod.description}>{prod.description}</p>
                  <div className="mt-auto">
                    <p className="text-sm font-medium text-gray-700">Stock: <span className={prod.stock > 10 ? 'text-green-600' : 'text-red-500'}>{prod.stock}</span></p>
                    <p className="text-green-600 font-bold text-lg mb-3">LKR {parseFloat(prod.price).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-2 border-t pt-3">
                  <button onClick={() => startEditing(prod)} className="text-blue-500 border border-blue-100 py-1 flex-1 rounded text-sm hover:bg-blue-50">Edit</button>
                  <button onClick={() => handleDelete(prod.id)} className="text-red-500 border border-red-100 py-1 flex-1 rounded text-sm hover:bg-red-50">Delete</button>
                </div>
              </>
            )}
            
          </div>
        ))}
      </div>
    </div>
  );
}