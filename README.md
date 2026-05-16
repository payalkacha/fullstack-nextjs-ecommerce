# 🛒 Full Stack E-Commerce Web Application

A fully functional production-style E-commerce platform built using **Next.js, Node.js, Express.js, and MongoDB** — designed as a real-world scalable application with complete user, admin, authentication systems including wishlist, profile management, contact system, and payment flow.

🔗 **Live Demo:** [fullstack-nextjs-ecommerce-zeta.vercel.app](https://fullstack-nextjs-ecommerce-zeta.vercel.app)

---

## 📌 Project Overview

This application provides a complete online shopping experience where users can:

- Browse products
- Manage cart & wishlist ❤️
- Update profile information
- Place orders & track history
- Contact support

Admins can fully manage:

- Products
- Orders
- Users
- Reviews
- Contact messages
- Dashboard operations

The project follows a **modular MVC architecture** with secure authentication and role-based access control.

---

## ✨ Features

### 👤 User Features

- Secure Signup & Login (JWT Authentication)
- OTP Email Verification
- Browse Products & Product Details
- Add to Cart & Manage Quantity
- Wishlist System — Save Favourite Products ❤️
- User Profile Management (Update Personal Info)
- Place Orders (COD / Online Payment)
- Order History Tracking
- Product Reviews & Ratings
- Contact Support System (Send Queries)

### 🧑‍💼 Admin Features

- Secure Admin Authentication
- Product CRUD (Create / Update / Delete)
- Order Management (Update Status / Cancel)
- User Management Dashboard
- Review Moderation
- Contact Message Handling (View & Reply)
- Dashboard Analytics Overview

---

## 🔄 Application Flow

### 👤 User Flow

1. Signup → OTP Verification
2. Login (JWT Authentication)
3. Browse Products
4. Add to Cart / Wishlist ❤️
5. Update Profile
6. Checkout & Place Order
7. View Order History
8. Contact Support if needed

### 🧑‍💼 Admin Flow

1. Admin Login
2. Manage Products
3. Manage Orders
4. Manage Users
5. Handle Contact Queries
6. Manage Reviews & System Data

---

## 🔐 Security Features

- JWT Authentication with HTTP-only Cookies
- Password Hashing using bcrypt
- Role-based Access Control (User / Admin)
- Input Validation (Frontend + Backend)
- Secure API Headers using Helmet
- Rate Limiting for API Protection
- Protected Routes

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS |
| Backend | Node.js, Express.js, MongoDB (Mongoose) |
| Integrations | Cloudinary, Multer, Razorpay, Nodemailer |
| Deployment | Vercel, Render, MongoDB Atlas |

---

## 📁 Project Structure

```
e-com store/
├── frontend/
└── backend/
    ├── controllers/
    ├── services/
    ├── models/
    ├── routes/
    ├── middlewares/
    ├── utils/
    └── config/
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/payalkacha/fullstack-nextjs-ecommerce
```

### 2️⃣ Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3️⃣ Environment Variables

**Backend `.env`**

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret

EMAIL_USER=your_email
EMAIL_PASS=your_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY=your_key
```

### 4️⃣ Run the Project

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

---

## 🌐 API Endpoints

```
POST   /api/auth/signup   →  User Signup (OTP Verification)
POST   /api/auth/login    →  User Login
GET    /api/products      →  Fetch All Products
POST   /api/cart          →  Cart Management
POST   /api/wishlist      →  Wishlist Management
POST   /api/orders        →  Place Order
POST   /api/contact       →  Contact Support
POST   /api/reviews       →  Product Reviews
```

---

## 🧠 Key Learnings

- Built scalable MERN architecture using MVC (Controller-Service-Model) pattern
- Implemented JWT authentication with HTTP-only cookies and role-based access
- Developed real-world features: wishlist, profile management, OTP verification
- Integrated Razorpay payment gateway (COD + Online Payment)
- Applied security best practices: rate limiting, helmet, bcrypt
- Deployed full-stack app across Vercel, Render, and MongoDB Atlas

---

## 🚀 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## 👩‍💻 Developer

**Payal Kacha**
GitHub: [github.com/payalkacha](https://github.com/payalkacha)

---

## ⭐ Conclusion

This is a production-style full-stack e-commerce application built to demonstrate real-world development skills. It covers complete authentication flow, wishlist system, profile management, admin dashboard, payment integration, and scalable backend architecture — making it suitable for real-world applications and technical interviews.