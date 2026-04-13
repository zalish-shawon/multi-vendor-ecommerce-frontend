# Nexus - Multi-Vendor E-Commerce Platform

Nexus is a full-stack, multi-role e-commerce platform built with Next.js and Node.js. It features a modern, responsive storefront for customers and a highly secure, data-rich administration panel for managing products, users, and orders.

## 🚀 Tech Stack

### Frontend
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS
* **UI Components:** Shadcn UI, Radix UI
* **Icons:** Lucide React
* **State & Forms:** React Hook Form
* **HTTP Client:** Axios
* **Notifications:** Sonner (Toast)
* **Auth Storage:** JS-Cookie & LocalStorage

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (Mongoose ODM)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **Email Service:** Nodemailer (for 2FA)
* **File Storage:** Cloudinary (Product images)

---

## ✨ Key Features

### 🔐 Authentication & Security
* **Multi-Role System:** Distinct roles for `ADMIN`, `VENDOR`, `CUSTOMER`, and `DELIVERY`.
* **Admin 2-Factor Authentication (2FA):** * High-security 6-digit Email OTP requirement for Admin logins.
  * OTP auto-expires after 5 minutes and self-deletes upon use.
  * Built-in 40-second cooldown for OTP resends to prevent spam.
* **Security Settings:** Admins can toggle 2FA on/off via the dashboard, requiring current password verification to authorize the change.

### 🛍️ Public Storefront
* **Modern Home Page:** Features a dynamic hero section, trending product sliders, and a flash sale countdown timer.
* **Dynamic Categories:** Automatically extracts and displays categories based on the current product inventory, matched with custom icons.
* **Advanced Product Search:** * Interactive sidebar with instant filtering.
  * Filter by text search, multiple categories, and min/max price ranges.
* **Product Cards:** Sleek UI with hover effects, dynamic stock badges ("Low Stock", "Out of Stock"), and quick "Add to Cart" actions.

### ⚙️ Admin Dashboard
* **Analytics Overview:** Real-time statistics for total users, vendors, orders, products, and a 7-day revenue chart.
* **Advanced Product Management:**
  * Full CRUD operations for products.
  * Advanced filtering table (Search, Category facets, Price ranges, Stock status).
  * Cloudinary integration for multiple image uploads and previews.
* **Recent Orders:** Live tracking of the most recent platform orders.

---

## 🛠️ Installation & Setup

### Prerequisites
* Node.js (v18+ recommended)
* MongoDB database (Local or Atlas)
* Gmail Account (with App Passwords enabled for Nodemailer)
* Cloudinary Account (for image uploads)

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/nexus-ecommerce.git](https://github.com/yourusername/nexus-ecommerce.git)
cd nexus-ecommerce
