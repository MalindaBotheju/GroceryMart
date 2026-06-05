const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// 🔥 Restrict CORS to your local development and live production URLs
// Middleware
// 🔓 Flexible CORS setup supporting both Web frontends and Mobile apps
const allowedOrigins = [
  process.env.FRONTEND_URL, 
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // 💡 Mobile apps (.apk) and Expo Go do not send an origin header.
    // This condition allows requests with no origin to pass through safely.
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS security policy'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Neon PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

// ==========================================
// 🔥 NEW: ADMIN SECURITY GUARD MIDDLEWARE
// ==========================================
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extracts the string after 'Bearer '

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Security token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the decrypted payload confirms this token belongs to an admin
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Access denied. You are not an authorized administrator.' });
    }

    req.admin = decoded; // Attach admin details to the request mapping
    next(); // Access granted! Move to the actual route logic
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired administrative token.' });
  }
};


// --- AUTHENTICATION ROUTES ---

// 1. Register User (Signup)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const newUser = await pool.query(
      `INSERT INTO users (name, email, password, is_verified, otp, otp_expires) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, email`,
      [name, email, hashedPassword, false, otp, otpExpires]
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'GroceryMart - Verify Your Email',
      html: `
        <h2>Welcome to GroceryMart, ${name}!</h2>
        <p>Your email verification code is:</p>
        <h1 style="color: #4CAF50; font-size: 40px; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 15 minutes.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ 
      message: "Registration successful. Please check your email for the OTP.", 
      email: newUser.rows[0].email 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// 1.5 Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(400).json({ error: 'User not found.' });

    const user = userResult.rows[0];
    if (user.otp !== otp) return res.status(400).json({ error: 'Invalid verification code.' });
    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    await pool.query('UPDATE users SET is_verified = true, otp = null, otp_expires = null WHERE email = $1', [email]);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: "Email verified successfully!", token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error during verification.' });
  }
});

// 1.6 Resend OTP Route
app.post('/api/auth/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(400).json({ error: 'User not found.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query('UPDATE users SET otp = $1, otp_expires = $2 WHERE email = $3', [otp, otpExpires, email]);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'GroceryMart - Your New Verification Code',
      html: `<h2>Hello!</h2><p>Your new verification code is:</p><h1 style="color: #4CAF50; font-size: 40px; letter-spacing: 5px;">${otp}</h1>`
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: "New OTP sent successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error resending OTP.' });
  }
});

// 3. Forgot Password Route
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(400).json({ error: 'No account found with that email.' });
    if (!userResult.rows[0].is_verified) return res.status(400).json({ error: 'Email is not verified.' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query('UPDATE users SET otp = $1, otp_expires = $2 WHERE email = $3', [resetCode, resetExpires, email]);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'GroceryMart - Password Reset Request',
      html: `<h2>Password Reset</h2><h1 style="color: #f44336; font-size: 40px;">${resetCode}</h1>`
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset code sent to email." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error requesting reset.' });
  }
});

// 4. Reset Password Route
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(400).json({ error: 'User not found.' });

    const user = userResult.rows[0];
    if (user.otp !== otp) return res.status(400).json({ error: 'Invalid reset code.' });
    if (new Date() > new Date(user.otp_expires)) return res.status(400).json({ error: 'Reset code has expired.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query('UPDATE users SET password = $1, otp = null, otp_expires = null WHERE email = $2', [hashedPassword, email]);
    res.json({ message: "Password successfully reset." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error resetting password.' });
  }
});

// 2. Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) return res.status(400).json({ error: 'Invalid email or password' });

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });
    if (!user.is_verified) return res.status(403).json({ error: 'Please verify your email.', requiresVerification: true });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});


// --- CATEGORY ROUTES ---

// Note: Left public so customer mobile apps can view products/categories freely.
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error fetching categories' });
  }
});

// 🔥 SECURED WITH MIDDLEWARE
app.post('/api/categories', authenticateAdmin, async (req, res) => {
  const { name, image_url } = req.body;
  try {
    const result = await pool.query('INSERT INTO categories (name, image_url) VALUES ($1, $2) RETURNING *', [name, image_url]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server Error adding category' });
  }
});

// 🔥 SECURED WITH MIDDLEWARE
app.delete('/api/categories/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error deleting category' });
  }
});

// 🔥 SECURED WITH MIDDLEWARE
app.put('/api/categories/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, image_url } = req.body;
  try {
    const result = await pool.query('UPDATE categories SET name = $1, image_url = $2 WHERE id = $3 RETURNING *', [name, image_url, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server Error updating category' });
  }
});


// --- PRODUCT ROUTES ---

// Note: Left public so mobile app clients can view product catalog items
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server Error fetching products' });
  }
});

// 🔥 SECURED WITH MIDDLEWARE
app.post('/api/products', authenticateAdmin, async (req, res) => {
  const { name, description, quantity_amount, quantity_unit, price, stock, image_url, category_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, quantity_amount, quantity_unit, price, stock, image_url, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, description, quantity_amount, quantity_unit, price, stock, image_url, category_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server Error adding product' });
  }
});

// 🔥 SECURED WITH MIDDLEWARE
app.put('/api/products/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, quantity_amount, quantity_unit, price, stock, image_url, category_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET name = $1, description = $2, quantity_amount = $3, quantity_unit = $4, price = $5, stock = $6, image_url = $7, category_id = $8 WHERE id = $9 RETURNING *`,
      [name, description, quantity_amount, quantity_unit, price, stock, image_url, category_id, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server Error updating product' });
  }
});

// 🔥 SECURED WITH MIDDLEWARE
app.delete('/api/products/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error deleting product' });
  }
});


// --- PAYMENT GATEWAY ROUTES ---

app.post('/api/payments/checkout', (req, res) => {
  const { userEmail, userName, totalPrice } = req.body;
  const merchant_id = process.env.PAYHERE_MERCHANT_ID.trim(); 
  const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET.trim(); 
  
  const order_id = `ORDER_${Date.now()}`;
  const amount = parseFloat(totalPrice).toFixed(2); 
  const currency = 'LKR';

  const hashed_secret = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();
  const string_to_hash = merchant_id + order_id + amount + currency + hashed_secret;
  const hash = crypto.createHash('md5').update(string_to_hash).digest('hex').toUpperCase();

  res.json({
    merchant_id, 
    return_url: "https://grocerymart.com/success",
    cancel_url: "https://grocerymart.com/cancel",  
    notify_url: "https://grocerymart.com/notify", 
    first_name: userName ? userName.split(' ')[0] : 'Guest', last_name: userName && userName.split(' ')[1] ? userName.split(' ')[1] : 'User',
    email: userEmail || 'guest@test.com', phone: '0771234567', address: '123 Grocery Lane', city: 'Colombo', country: 'Sri Lanka',
    order_id, items: 'Grocery Items Order', currency, amount, hash
  });
});

app.post('/api/payments/notify', async (req, res) => {
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;
  const merchant_secret = process.env.PAYHERE_MERCHANT_SECRET.trim();

  const hashed_secret = crypto.createHash('md5').update(merchant_secret).digest('hex').toUpperCase();
  const string_to_hash = merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashed_secret;
  const local_md5sig = crypto.createHash('md5').update(string_to_hash).digest('hex').toUpperCase();

  if (local_md5sig === md5sig) {
    if (status_code === '2') {
      console.log(`✅ Webhook verified: Payment SUCCESS for Order: ${order_id}`);
    }
    res.status(200).send('OK');
  } else {
    res.status(400).send('Invalid Signature');
  }
});


// --- ORDER ROUTES ---

app.post('/api/orders', async (req, res) => {
  const { email, cartItems, totalAmount } = req.body;
  try {
    const orderResult = await pool.query("INSERT INTO orders (email, total_price, status) VALUES ($1, $2, 'paid') RETURNING id", [email, totalAmount]);
    const orderId = orderResult.rows[0].id;

    for (let item of cartItems) {
      await pool.query("INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)", [orderId, item.id, item.cartQuantity, item.price]);
    }
    res.status(201).json({ message: "Order placed successfully!", orderId });
  } catch (err) {
    res.status(500).json({ error: "Server error during checkout" });
  }
});

app.get('/api/orders/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query("SELECT * FROM orders WHERE email = $1 ORDER BY id DESC", [email]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching orders" });
  }
});


// --- ADMIN DASHBOARD ROUTES ---

app.post('/api/admin/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminResult = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (adminResult.rows.length === 0) return res.status(400).json({ error: 'Invalid admin credentials' });

    const admin = adminResult.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid admin credentials' });

    // 🔥 Added 'isAdmin: true' parameter inside our payload signature 
    const token = jwt.sign({ id: admin.id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: "Admin login successful", token, admin: { id: admin.id, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server Error during admin login' });
  }
});

// 🔥 SECURED: Only existing admins can create new admins
app.post('/api/admin/create', authenticateAdmin, async (req, res) => {
  try {
    const { newAdminEmail, newAdminPassword } = req.body;

    // 1. Check if email is already taken
    const existing = await pool.query('SELECT * FROM admins WHERE email = $1', [newAdminEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An admin with this email already exists' });
    }

    // 2. Hash the new password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newAdminPassword, salt);

    // 3. Insert the new admin into the database
    await pool.query(
      'INSERT INTO admins (email, password) VALUES ($1, $2)',
      [newAdminEmail, hashedPassword]
    );

    res.status(201).json({ message: "New admin created successfully!" });
  } catch (err) {
    console.error("Error creating admin:", err.message);
    res.status(500).json({ error: 'Server Error creating new admin' });
  }
});

// 🔥 SECURED WITH MIDDLEWARE
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server Error fetching admin orders' });
  }
});

// 🔥 SECURED WITH MIDDLEWARE
app.put('/api/admin/orders/:id/status', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order status updated successfully", order: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server Error updating order status' });
  }
});


// --- CUSTOMER ROUTES ---

// 🔥 SECURED WITH MIDDLEWARE
app.get('/api/customers', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, name, email, created_at, is_active FROM users ORDER BY id DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server Error fetching customers' });
  }
});

// 🔥 SECURED WITH MIDDLEWARE
app.put('/api/customers/:id/suspend', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`UPDATE users SET is_active = false WHERE id = $1 RETURNING id`, [id]);
    res.json({ message: 'Account permanently suspended' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error suspending customer' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});