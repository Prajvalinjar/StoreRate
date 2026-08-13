# StoreRate

A premium full-stack store discovery and reputation platform built with React, Node.js, Express, PostgreSQL, and Prisma.

---

## 📋 Project Overview

**StoreRate** connects consumers with trusted local businesses through transparent, authentic customer rating telemetry.

- **Normal Users** can discover stores, search by name/address, view rating breakdowns, and submit/update 1–5 star ratings.
- **Store Owners** access a Business Intelligence dashboard to monitor store reputation, rating distribution, customer activity, and performance trends.
- **System Administrators** manage users, stores, platform operations, filtering, and multi-field sorting through a dedicated Operations Console.

---

## ✨ Features

### 👤 Normal User (`USER`)
- **Public & Authenticated Store Browser**: Search stores by name or address with instant keyword filtering.
- **Authentic 1–5 Star Rating System**: Submit 1 to 5 star ratings.
- **Single-Rating Constraint**: Enforces one rating per store per user. Submitting an updated rating modifies the existing record without generating duplicate database rows.
- **My Ratings**: Personal history timeline listing rated stores, scores, timestamps, and quick edit CTAs.
- **Account Management**: View consumer profile details and update account passwords securely.

### 🏪 Store Owner (`STORE_OWNER`)
- **Business Intelligence Dashboard**: High-level KPI cards displaying Average Rating, Total Reviews, 5-Star Ratio, and Positive Reviews %.
- **Mathematically Verified Rating Breakdown**: 5★ to 1★ horizontal count and percentage distribution bars.
- **SVG Rating Trend Timeline**: Time-series line chart that dynamically plots rating points for small datasets (1, 2, 3, 4, 5+ ratings) without artificial minimum thresholds.
- **Customer Activity Timeline**: View verified customer names, ratings, and timestamps.
- **Data Isolation**: Store Owners only access data for their assigned store.

### 🛡️ System Administrator (`ADMIN`)
- **Operations Console Sidebar**: Dedicated administration interface with Console Overview, User Operations, Store Operations, and Admin Profile.
- **User Management**: Create `USER`, `STORE_OWNER`, and `ADMIN` accounts with full validation checks.
- **Store Management**: Create stores linked strictly to verified `STORE_OWNER` accounts.
- **Multi-Field Filtering & Sorting**: Filter users and stores by Name, Email, Address, and Role. Sort listings in ascending (`asc`) or descending (`desc`) order.
- **Associated Store Details**: Viewing a `STORE_OWNER` profile automatically displays their assigned store and rating analytics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite 5
- **Styling**: Vanilla CSS + TailwindCSS 3.4 (Warm Ivory `#F7F6F1`, Forest Green `#173D32`, Champagne Gold `#C9A24A`)
- **Icons**: Lucide React (`lucide-react`)
- **Routing**: React Router DOM 6

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **ORM**: Prisma ORM 5
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs password hashing
- **Validation**: Zod schema validation middleware

---

## 🏗️ System Architecture

```text
React 18 Frontend (Vite)
       │
       ▼  (REST API / JSON)
Express.js Router & Controllers
       │
       ▼  (Zod Schema & Auth Middleware)
Business Logic & Role Authorization
       │
       ▼  (Type-Safe Queries)
Prisma ORM
       │
       ▼  (TCP/IP 5432)
PostgreSQL Database
```

### Role-Based Access Control (RBAC)
- Backend authorization middleware (`requireRole('ADMIN')`, `requireRole('STORE_OWNER')`, `requireRole('USER')`) strictly enforces route isolation on API endpoints.
- Frontend routes are protected by `<ProtectedRoute>` and `<RoleRoute>` guards.

---

## 🗄️ Database & Data Model

### Data Entities (`schema.prisma`)
1. **`User`**: `id`, `name`, `email` (unique), `passwordHash`, `address`, `role` (`ADMIN` | `USER` | `STORE_OWNER`), `createdAt`, `updatedAt`.
2. **`Store`**: `id`, `name`, `email`, `address`, `ownerId` (references `User.id`), `createdAt`, `updatedAt`.
3. **`Rating`**: `id`, `userId` (references `User.id`), `storeId` (references `Store.id`), `rating` (Integer 1–5), `createdAt`, `updatedAt`.

### Key Database Constraint
```prisma
model Rating {
  ...
  @@unique([userId, storeId])
}
```
The composite unique index `@@unique([userId, storeId])` guarantees at the database level that a user can have at most **one** rating per store.

---

## 📏 Official Validation Rules

| Entity / Field | Validation Rule | Enforced By |
| :--- | :--- | :--- |
| **User Name** | **20 to 60 characters** (min 20, max 60) | `authValidator.js`, `adminValidator.js` |
| **Address** | **Maximum 400 characters** | `authValidator.js`, `adminValidator.js` |
| **Password** | **8 to 16 characters**, min 1 uppercase, min 1 special char | `authValidator.js`, `adminValidator.js` |
| **Rating** | **Integer 1 to 5** (decimals, 0, >5 rejected) | `userStoreValidator.js` |
| **Email** | Standard RFC 5322 email format | `authValidator.js`, `adminValidator.js` |

---

## 🔍 Search, Filtering, & Sorting

### User Store Search
- **Endpoint**: `GET /api/stores?q=query`
- **Fields**: Case-insensitive partial matching on Store Name and Address.

### Admin Filtering & Sorting
- **User Filtering**: Filter by Name, Email, Address, and Role (`ADMIN`, `USER`, `STORE_OWNER`).
- **User Sorting**: Sort by `name`, `email`, `address`, `role`, or `createdAt` (`asc` / `desc`).
- **Store Filtering**: Filter by Name, Email, and Address.
- **Store Sorting**: Sort by `name`, `email`, `address`, `rating`, or `createdAt` (`asc` / `desc`).

---

## 🔒 Security Features

- **Encrypted Password Storage**: All user passwords hashed via `bcryptjs` with salt rounds before database persistence.
- **Sanitized API Responses**: `passwordHash` is stripped from user object outputs.
- **JWT Authorization**: Session tokens signed with server `JWT_SECRET` and validated on protected routes.
- **ID Manipulation Prevention**: Rating endpoints operate strictly using `req.user.id` from the decoded token payload.

---

## 🔑 Demo Environment & Credentials

> [!NOTE]
> **DEMO CREDENTIALS — LOCAL / DEMO USE ONLY**

| Role | Email | Password | Assigned Entity |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@storerate.local` | `Admin@123` | Platform Operations Console |
| **Primary Store Owner** | `owner@storerate.local` | `Owner@123` | Demo StoreRate Market |
| **FreshMart Store Owner** | `owner2@storerate.local` | `Owner@123` | FreshMart Grocery Store |
| **Electronics Store Owner** | `owner3@storerate.local` | `Owner@123` | City Electronics Superstore |
| **Normal Consumer 1** | `user@storerate.local` | `User@123` | Consumer Portal |
| **Normal Consumer 2** | `user2@storerate.local` | `User@123` | Consumer Portal |
| **Normal Consumer 3** | `user3@storerate.local` | `User@123` | Consumer Portal |

### Deterministic Demo Baseline
- **Users**: `9`
- **Stores**: `3`
- **Ratings**: `6`

---

## 🚀 Local Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **PostgreSQL**: v15.x or higher (running on port `5432`)
- **npm**: v9.x or higher

### 1. Clone Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/StoreRate.git
cd StoreRate

# Install root scripts
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables
```bash
# In backend/ directory
cp .env.example .env

# Edit backend/.env with your PostgreSQL password
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/storeratedb?schema=public"
# JWT_SECRET="super_secret_jwt_key_store_rate"

# In frontend/ directory
cp .env.example .env
```

### 3. Initialize PostgreSQL Database & Seed Data
```bash
cd ../backend

# Run Prisma database migrations
npx prisma migrate dev --name init

# Seed the deterministic demo dataset (9 Users, 3 Stores, 6 Ratings)
node src/scripts/seed.js
```

### 4. Start Development Servers
```bash
# Start Backend API (Port 5000)
cd backend
npm run dev

# In a separate terminal, start Frontend Dev Server (Port 5173 / 3000)
cd frontend
npm run dev
```

---

## 🧪 Test Suite Results

The backend contains automated integration test scripts covering authentication, RBAC, admin management, user rating, and store owner analytics.

| Test Suite File | Domain | Executed Checks | Result |
| :--- | :--- | :--- | :--- |
| `testAuth.js` | Authentication & Name Boundaries (20–60 chars) | 19 / 19 Passed | **PASS** |
| `testAdmin.js` | Admin Operations, Filtering, Sorting, User Creation | 18 / 18 Passed | **PASS** |
| `testUser.js` | Store Browser, Name/Address Search, Rating Upsert | 17 / 17 Passed | **PASS** |
| `testOwner.js` | Store Owner BI Dashboard, Rater Isolation | 11 / 11 Passed | **PASS** |
| `testMasterQA.js` | End-to-End Multi-Role Master System Audit | 14 / 14 Passed | **PASS** |
| `verifySeed.js` | Demo Account Credential & Portal Validation | 7 / 7 Passed | **PASS** |
| `prisma validate` | Schema Syntax & Foreign Key Validation | Verified | **PASS** |

---

## 📦 Production Build

```bash
cd frontend
npm run build
```

**Latest Build Output**:
```text
vite v5.4.21 building for production...
transforming...
✓ 1665 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.37 kB │ gzip:   0.66 kB
dist/assets/index-CSTVGFPH.css   40.56 kB │ gzip:   7.22 kB
dist/assets/index-D7Amd-pW.js   407.10 kB │ gzip: 104.29 kB
✓ built in 2.30s
```

---

## 📡 API Endpoint Reference

| Method | Endpoint | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new `USER` account (min 20 char name) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `POST` | `/api/auth/change-password` | Authenticated | Change user password |
| `GET` | `/api/stores` | `USER` | List & search stores by name/address |
| `POST` | `/api/stores/:id/rating` | `USER` | Submit 1–5 star rating for store |
| `PUT` | `/api/stores/:id/rating` | `USER` | Update existing 1–5 star rating for store |
| `GET` | `/api/stores/my-ratings` | `USER` | List personal submitted store ratings |
| `GET` | `/api/owner/dashboard` | `STORE_OWNER` | Retrieve owner BI dashboard analytics |
| `GET` | `/api/admin/dashboard` | `ADMIN` | Retrieve platform-wide metrics & leaderboard |
| `GET` | `/api/admin/users` | `ADMIN` | List users with filtering, sorting, & pagination |
| `POST` | `/api/admin/users` | `ADMIN` | Create new user account with role selection |
| `GET` | `/api/admin/users/:id` | `ADMIN` | Get single user details & assigned store ratings |
| `GET` | `/api/admin/stores` | `ADMIN` | List stores with filtering & rating sorting |
| `POST` | `/api/admin/stores` | `ADMIN` | Create store linked to a `STORE_OWNER` |

---

## 📄 Documentation

For full technical audit notes, design decisions, and screenshots walkthrough, refer to [`walkthrough.md`](./walkthrough.md).
