import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Customers from './pages/Customers';
import AdminLogin from './pages/AdminLogin'; // 1. Import your new Login page
import CreateAdmin from './pages/CreateAdmin'; // adjust the path if necessary

function App() {
  // 2. Quick check: Is there an admin token saved in the browser?
  const isAdminAuthenticated = () => {
    return localStorage.getItem('adminToken') !== null;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* 3. Public route for logging in */}
        <Route path="/login" element={<AdminLogin />} />

        {/* 4. Protected routes wrapper */}
        <Route 
          path="/" 
          element={isAdminAuthenticated() ? <Layout /> : <Navigate to="/login" replace />}
        >
          {/* These sub-pages only load if the Layout loads */}
          <Route index element={<Overview />} />
          <Route path="orders" element={<Orders />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
          <Route path="/create-admin" element={<CreateAdmin />} />
        </Route>

        {/* 5. Catch-all fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;