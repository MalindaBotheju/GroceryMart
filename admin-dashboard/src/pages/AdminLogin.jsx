import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Points exactly to your new isolated admin route
      const response = await axios.post('http://localhost:5000/api/admin/auth/login', {
        email,
        password,
      });

      // Save the admin token securely in the browser session
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminEmail', response.data.admin.email);

      // Send the manager straight to the order dashboard management area
      navigate('/orders');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Server error or invalid credentials.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* 🔥 UPDATED: SVG Logo matching the mobile app and overview page */}
        <div style={styles.logoContainer}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="white" 
            style={{ width: '48px', height: '48px' }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" 
            />
          </svg>
        </div>

        <h2 style={styles.title}>GroceryMart Admin</h2>
        <p style={styles.subtitle}>Control Panel Sign In</p>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Admin Email</label>
            <input
              type="email"
              style={styles.input}
              placeholder="manager@grocerymart.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Inline styles for a complete out-of-the-box professional dashboard look
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f4f6f8',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  
  // 🔥 UPDATED: Made it a green circle centered in the card
  logoContainer: {
    backgroundColor: '#4CAF50',
    width: '84px',
    height: '84px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 20px auto', 
    boxShadow: '0 4px 10px rgba(76, 175, 80, 0.25)', 
  },
  
  title: {
    margin: '0 0 5px 0',
    color: '#333333',
    fontSize: '26px',
    fontWeight: '700',
  },
  subtitle: {
    margin: '0 0 25px 0',
    color: '#666666',
    fontSize: '14px',
  },
  errorBanner: {
    backgroundColor: '#ffebe9',
    color: '#ea3829',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px',
    fontWeight: '500',
    border: '1px solid rgba(234, 56, 41, 0.2)',
  },
  form: {
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#444444',
    fontSize: '14px',
    fontWeight: '6px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #cccccc',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4CAF50',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s',
  },
};