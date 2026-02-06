# 📦 Inventory Manager

> A full-stack **learning project** built with React, Node.js, and PostgreSQL, focused on exploring real-world inventory management patterns such as authentication, role-based access control, audit logging, and Excel-like data interaction.  
>  
> Developed as a hands-on project with the assistance of AI, prioritizing clarity, stability, and learning over production readiness.

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![JWT](https://img.shields.io/badge/Auth-JWT-orange)](https://jwt.io)
[![Status](https://img.shields.io/badge/Status-Learning%20Project-yellow)](https://github.com/your-username)

---

## 🧪 Project Purpose

This application was created as a **learning-focused project**, with the aspiration to be a finished commercial product.
Also inspired by a former company I used to work for.

The goal is to experiment with:
- Full-stack architecture
- Enterprise-style UX patterns
- Data safety and traceability
- Role-based authorization
- Iterative development with AI assistance

The project intentionally favors **predictable behavior and clarity** over premature optimization.

---

## ✨ Key Features

### 🔐 Authentication & Roles
- Secure login using JWT
- Role-based access control:
  - **Viewer** – read-only access
  - **Editor** – create, edit, mark products
  - **Admin** – full access (users, audit logs)

---

### 📊 Product Management
- Excel-like product table:
  - Sticky headers
  - Sortable columns
  - User-resizable columns
  - Auto-size on double click
  - Inline editing without layout shifts
  - Checkbox-based *Marked* state with row highlighting
- Computed **Resume** column  
  _(Reference + Color + Dimensions → e.g. Atenas Beige 112x250cm)_
- Pagination (100 rows per page)

---

### 🔎 Advanced Filtering
- Case-insensitive filters:
  - Reference
  - Color
  - Finish (Acab)
  - Rack
- Numeric filtering for X / Y dimensions
- “Marked only” toggle
- Instant client-side updates

---

### 📥 CSV Import / Export
- Safe CSV import with:
  - Header normalization
  - Invalid value protection
  - Integer sanitization
- CSV export for reporting and backups
- Designed to handle large datasets

---

### 🧾 Audit Log
- Tracks **CREATE / UPDATE / DELETE** actions
- Full before/after state comparison
- Full-row visual distinction:
  - 🟢 CREATE
  - 🟡 UPDATE
  - 🔴 DELETE
- Progressive date filtering:
  - `1` → all logs from day 1
  - `1-1` → January 1st (all years)
  - `01-01-2024` → exact date

---

### 👥 User Management (Admin)
- Create users
- Change roles with confirmation
- Prevent deletion of:
  - Your own account
  - The last remaining admin
- Visual role indicators
- Clean admin-style layout

---

## 🛠️ Tech Stack

### Frontend
- React
- Context API (authentication)
- Plain CSS (custom Excel-like UI)
- Fetch-based API layer

### Backend
- Node.js
- Express
- PostgreSQL
- JWT authentication
- Role-based middleware
- CSV parsing (`csv-parse`)
- UUID identifiers

---

## 📁 Project Structure

```bash
inventory-manager/
│
├── backend/
│   ├── middleware/
│   │   ├── auth.js          # JWT auth
│   │   └── roles.js         # Role-based access
│   │
│   ├── routes/
│   │   ├── products.js      # Products CRUD + CSV import
│   │   ├── users.js         # Users & roles
│   │   └── auditLogs.js     # Audit log API
│   │
│   ├── utils/
│   │   └── auditLogger.js   # Centralized audit logging
│   │
│   ├── db.js                # PostgreSQL connection
│   ├── server.js            # Express entry point
│   └── .env                 # Environment variables
│
├── frontend/
│   └── frontend-react/
│       ├── src/
│       │   ├── api/          # API clients
│       │   ├── components/
│       │   │   ├── inventory/
│       │   │   │   ├── ProductTable.jsx
│       │   │   │   ├── ProductFilters.jsx
│       │   │   │   └── ProductForm.jsx
│       │   │   ├── admin/
│       │   │   │   ├── UsersPanel.jsx
│       │   │   │   └── AuditLogPanel.jsx
│       │   │   └── common/
│       │   │       └── Modal.jsx
│       │   ├── context/
│       │   │   └── AuthContext.js
│       │   ├── styles/
│       │   │   ├── index.css
│       │   │   ├── tables.css
│       │   │   ├── panels.css
│       │   │   └── login.css
│       │   ├── pages/
│       │   │   ├── InventoryPage.jsx
│       │   │   └── LoginPage.jsx
│       │   └── App.js
│       └── package.json
│
└── README.md
````

### 🚀 Getting Started

## 1️⃣ Prerequisites

```bash
Node.js (v18+ recommended)
PostgreSQL
npm
````

## 2️⃣ Backend Setup

```bash
cd backend
npm install

Create .env file:

DATABASE_URL=postgres://user:password@localhost:5432/inventory
JWT_SECRET=your_secret_here
PORT=5000

Start backend:

npm start

Backend runs on:

http://localhost:5000
````

## 3️⃣ Frontend Setup

```bash
cd frontend/frontend-react
npm install
npm start

Frontend runs on:

http://localhost:3000
````

## 📸 Screenshots

**Login Page**

![Screenshot_1](https://github.com/user-attachments/assets/dcbe1900-cee2-47d5-8137-700f77ecc281)


**Admin Page**
![Screenshot_2](https://github.com/user-attachments/assets/a067220c-88ff-42d0-be0c-ce2b374c6bc3)


**Editor Page**
![Screenshot_3](https://github.com/user-attachments/assets/0c4b22e5-28ae-4855-a2f0-6da74a652b2b)


**Viewer Page**
![Screenshot_4](https://github.com/user-attachments/assets/0f5a09d5-8a31-4b5a-ae78-9a2c90eede9f)

**Add Product**
![Screenshot_5](https://github.com/user-attachments/assets/0f05578d-f015-42bd-a97a-09561c4c47c4)


**Filter Product**
![Screenshot_6](https://github.com/user-attachments/assets/50b63419-3ba2-4f77-9100-c2a4465d23d7)


**Marked Products**
![Screenshot_7](https://github.com/user-attachments/assets/8429ace3-c032-4356-8a47-de3ea6ba0437)


**Users Modal**
![Screenshot_8](https://github.com/user-attachments/assets/1ddc9cdf-0e02-4ac8-9808-fede8f3271c5)


**Audit Log Modal**
![Screenshot_9](https://github.com/user-attachments/assets/9e33ed7b-d899-4c3c-b391-43fb06cbc8b4)






---

### AI Assistance Disclaimer

This project was developed with the assistance of AI as a learning tool.

AI was used to:

- Explore architectural decisions
- Refactor and reason about code
- Improve UX consistency
- Validate edge cases

All implementation choices and iterations were human-driven.

---

### 📈 Future Implementation / Features

- Bulk actions:
  - Delete all marked products at once
  - Mark / unmark multiple products
- Extended Audit Log filtering:
  - Filter by user email
  - Filter by action type
- Improved authentication error handling:
  - Handle additional HTTP errors (404, 500)
  - User-friendly error messages
- Filter marked products by date
- Persist UI state:
  - Column widths per user
  - Active filters between sessions

---

### 🎓 Future Learning Goals

- Server-side pagination for large datasets
- Centralized backend error handling
- Soft deletes instead of hard deletes
- Basic automated testing (backend)
- Running the app on a local network
- Deployment experiments:
  - Production build
  - Environment configuration
  - Reverse proxy setup

---

  ### 🏢 Multi-User / Multi-Tenant Considerations

Currently, the application supports **multiple users with role-based access** within a single shared dataset.

A future goal is to evolve the system into a **multi-tenant architecture**, where:

- Each company has its own isolated inventory
- Users belong to a specific organization
- Admins manage users only within their company
- Audit logs are scoped per tenant

This would require changes in:
- Database schema (tenant/company separation)
- Authorization middleware
- Query scoping and data isolation
- UI context awareness (active company)

---

### 🎓 Future Learning Goals

- Designing multi-tenant database schemas
- Implementing tenant-based authorization
- Preventing cross-tenant data leakage
- Evaluating different isolation strategies:
  - Shared database with tenant IDs
  - Schema-per-tenant
  - Database-per-tenant

