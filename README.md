# 🛒 GroceryMart Ecosystem

Welcome to the **GroceryMart** project repository. This is a production-ready, full-stack monorepo system containing a mobile shopping application, a web-based administration dashboard, and a centralized Express/Node.js REST API backed by a cloud-hosted cloud database.

---

## 📂 Repository Structure

```text
GroceryMart/
│
├── backend/               # Node.js + Express REST API
│   ├── src/               # Middleware, routes, controllers
│   ├── server.js          # Main entry point
│   └── package.json
│
├── admin-dashboard/       # Web Admin Control Panel (Vite + React)
│   ├── src/               # Pages (Orders, Customers, Login, Layout)
│   ├── Vite.config.js
│   └── package.json
│
└── mobile-app/            # Cross-Platform Customer App (React Native + Expo)
    ├── src/               # Screens (Cart, Checkout, Browse)
    └── package.json

```

---

## 🛠️ Technology Stack

* **Backend API:** Node.js, Express.js, PostgreSQL (Neon Cloud Database), JWT Authentication (`jsonwebtoken`), `bcrypt` password hashing.
* **Admin Portal:** React (Vite), React Router DOM, Tailwind CSS, Axios.
* **Mobile App:** React Native, Expo, React Native WebView (PayHere Payment Gateway integration).

---

## 🚀 Key Features

### 💻 Admin Dashboard

* **Secure Session Guard:** Custom JWT verification middleware safeguarding sensitive routes (`/api/admin/*`, `/api/customers`).
* **Orders Pipeline:** Complete oversight of customer purchases with a live action block to transition states (e.g., *Mark as Delivered*).
* **User Management:** Complete analytical look at consumer metrics, live search filtering, and one-way account suspension safety protocols.
* **Super-Admin Permissions:** Dynamic layout checks ensuring high-level settings (like adding other administrators) are rendered strictly for the main controller account.

### 📱 Mobile Customer App

* **Bulletproof PayHere Integration:** Bypasses Android WebView POST bugs completely by injecting an abstracted HTML Form Auto-Submit wrapper executing secure client-side checkouts directly through the web engine context.

---

## ⚙️ Environment Variables Configuration

Before launching any system piece, you must configure individual environment profiles.

### 1. Backend API (`/backend/.env`)

```env
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@<neon-cluster-id>.neon.tech/grocerymart?sslmode=require
JWT_SECRET=your_super_secure_jwt_secret_token_here
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_MERCHANT_SECRET=your_merchant_secret
VITE_SUPER_ADMIN_EMAIL=admin@grocerymart.com

```

### 2. Admin Dashboard (`/admin-dashboard/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPER_ADMIN_EMAIL=admin@grocerymart.com

```

### 3. Mobile App (`/mobile-app/.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:5000

```

---

## 📦 Installation & Local Setup

Ensure you have **Node.js** and **npm** installed on your system.

### Step 1: Start the Backend API

```bash
cd backend
npm install
npm run dev

```

*The server will boot up and automatically run seed functions on your Neon Database if tables are empty. It listens natively on port `5000`.*

### Step 2: Launch the Admin Dashboard

```bash
cd ../admin-dashboard
npm install
npm run dev

```

*Vite will compile development assets and serve the local control deck interface at `http://localhost:5173`.*

### Step 3: Spin up the Mobile App

```bash
cd ../mobile-app
npm install
npx expo start

```

*Press `a` to run on an Android emulator or scan the QR code via the Expo Go app.*

---

## ☁️ Deployment Playbook

### 🔷 Backend (Render / Railway)

1. Set the **Root Directory** configurations on the deployment host to `backend`.
2. Map the Build Script to `npm install` and the Entry Execution Command to `node server.js` or `npm start`.
3. Add all keys mapped in `/backend/.env` straight into the cloud dashboard's environment properties area.

### 🔷 Admin Dashboard (Vercel / Netlify)

1. Point your platform to build the project sub-directory `admin-dashboard`.
2. Configure build commands to evaluate asset outputs using `npm run build`, targeting output distribution configurations directly toward the `dist` directory.
3. Replace the `VITE_API_BASE_URL` property within the environment engine to link to your **live cloud backend API URL** instead of `localhost`.

### 🔷 Mobile App (Expo EAS)

1. Configure credentials inside the CLI environment matching production build protocols:
```bash

```



eas build:configure

```
2. Compile standalone binaries ready for app store submissions or internal testing distributions via:
   ```bash
eas build --platform android

```