# StoreRate

A full-stack store discovery and reputation platform that connects consumers with local businesses through transparent ratings and authentic customer feedback across three distinct user roles (**`USER`**, **`STORE_OWNER`**, **`ADMIN`**).

---

## 🚀 Live Demo

**Frontend:** https://storerate-tau.vercel.app/

**Backend API:** https://storerate-backend-nbjm.onrender.com

**Health Check:** https://storerate-backend-nbjm.onrender.com/api/health

---

## 🧪 Evaluator Guide

### Step 1
Open:
https://storerate-tau.vercel.app/

### Step 2
Use one of the demo accounts.

### Step 3
Recommended exploration order:

1. **USER**
   - Browse stores
   - Search stores
   - View ratings
   - Submit/update rating
   - View profile

2. **STORE OWNER**
   - Open dashboard
   - View rating distribution
   - View rating trend
   - View customer ratings
   - View store information

3. **ADMIN**
   - Open admin dashboard
   - View platform statistics
   - Manage users
   - Manage stores
   - Explore filtering/sorting
   - Review platform data

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@storerate.local` | `Admin@123` |
| Store Owner | `owner@storerate.local` | `Owner@123` |
| User | `user@storerate.local` | `User@123` |

> These are seeded demonstration credentials intended for evaluation purposes. They are not production credentials.

---

## 🎯 Problem

Traditional review portals frequently suffer from unverified noise, lack of transparent business metrics, or rigid threshold requirements that obscure early-stage ratings for small businesses. Consumers need a trustworthy platform to explore local stores and leave authentic feedback, while business owners require real-time reputation analytics without artificial 5-rating minimum hurdles.

---

## 💡 Solution

**StoreRate** delivers a full-stack, role-tailored platform featuring:
- **Consumer Portal**: Instant store discovery, multi-field search, and single-rating enforcement per user-store pair to prevent manipulation.
- **Store Owner Business Intelligence**: Real-time score distributions, verified rater feeds, and dynamic small-dataset SVG time-series trends.
- **System Admin Operations**: Platform-wide metrics, user/store CRUD management, and dual-direction multi-field filtering and sorting.

---

## ✨ Features

### 👤 Consumer (`USER`)
- **Store Browser & Search**: Instant case-insensitive filtering by Store Name or Address.
- **Authentic 1–5 Star Ratings**: Submit and edit ratings dynamically without duplicate rows.
- **Rating History Timeline**: Dedicated personal dashboard displaying past rating submissions and timestamps.
- **Profile Management**: Personal account details and password change workflows.

### 🏪 Store Owner (`STORE_OWNER`)
- **Reputation Telemetry**: Key metrics showing Average Rating, Total Reviews, 5-Star Ratio, and Positive Reviews %.
- **Rating Distribution**: Mathematical count and percentage distribution bars across 1★ to 5★ scores.
- **Small-Dataset Rating Trend Timeline**: Time-series SVG chart plotting ratings dynamically for small datasets without artificial minimum review counts.
- **Verified Rater Feed**: Real-time listing of customer scores and submission timestamps.

### 🛡️ System Admin (`ADMIN`)
- **Operations Console**: Dedicated sidebar for Platform Overview, User Operations, Store Operations, and Admin Profile.
- **Platform Analytics**: Real-time database metrics for Total Users, Total Stores, Total Ratings, and Platform Mean Rating.
- **User & Store CRUD**: Account creation and store registration linked to verified owners.
- **Multi-Field Filter & Sort**: Search users/stores across multiple attributes with dual-direction (`asc` / `desc`) sorting.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, TailwindCSS 3.4, Lucide React, React Router 6 |
| **Backend** | Node.js, Express.js REST API |
| **Database & ORM** | PostgreSQL 15+, Prisma ORM 5 |
| **Authentication & Security** | JWT (JSON Web Tokens), `bcryptjs` password hashing, Zod validation |
| **Testing** | Automated Integration Test Suite (Node.js test runners) |
| **Deployment** | Vercel (Frontend SPA), Render (Backend Web Service), Managed PostgreSQL |

---

## 🏗️ Architecture

```
                  ┌────────────────────────┐
                  │    React 18 + Vite     │
                  │   Vercel Frontend SPA  │
                  └───────────┬────────────┘
                              │
                              │ HTTP / REST API (JWT Bearer Token)
                              ▼
                  ┌────────────────────────┐
                  │   Express.js Router    │
                  │ Zod Validation & RBAC  │
                  └───────────┬────────────┘
                              │
                              │ Prisma ORM
                              ▼
                  ┌────────────────────────┐
                  │   PostgreSQL Database  │
                  └────────────────────────┘
```

---

## 🗄️ Database Design

StoreRate uses Prisma ORM with PostgreSQL. The database schema defines three core models: `User`, `Store`, and `Rating`.

### Database Schema Models (`prisma/schema.prisma`)

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  address      String
  role         Role     @default(USER)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  stores       Store[]  @relation("OwnerStores")
  ratings      Rating[]
}

model Store {
  id          String   @id @default(uuid())
  name        String
  email       String
  address     String
  ownerId     String
  owner       User     @relation("OwnerStores", fields: [ownerId], references: [id], onDelete: Cascade)
  rating      Float    @default(0.0)
  totalRating Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  ratings     Rating[]
}

model Rating {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  storeId   String
  store     Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
  rating    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, storeId])
  @@index([userId])
  @@index([storeId])
  @@map("ratings")
}

enum Role {
  ADMIN
  STORE_OWNER
  USER
}
```

### Unique Constraint & Rating Upsert Logic
The database model includes a composite unique index:
```prisma
@@unique([userId, storeId])
```
- **Single-Rating Guarantee**: Prevents duplicate rating submissions by the same user for the same store at the database engine level.
- **Seamless Rating Updates**: Submitting a new score for an existing store updates the existing record via `userId_storeId` lookup, recalculating the store average rating automatically.

---

## 🔐 Authentication & Security

### Role-Based Access Control (RBAC) Matrix

| Capability | USER | STORE_OWNER | ADMIN |
|---|:---:|:---:|:---:|
| Browse Stores | ✓ | — | ✓ |
| Submit Rating | ✓ | — | ✓ |
| Update Own Rating | ✓ | — | ✓ |
| View Own Profile | ✓ | ✓ | ✓ |
| Store Analytics | — | ✓ | ✓ |
| Manage Users | — | — | ✓ |
| Manage Stores | — | Own Store | ✓ |
| Platform Operations | — | — | ✓ |

### Security Measures
- **Password Hashing**: Passwords stored using `bcryptjs` with salt rounds. `passwordHash` is excluded from all API outputs.
- **JWT Authorization**: Authenticated API endpoints verify tokens passed via the `Authorization: Bearer <token>` HTTP header.
- **Owner Data Isolation**: Store Owner queries are strictly scoped on the backend to `where: { ownerId: req.user.id }`.

---

## 📋 Validation Rules

All incoming request payloads are validated via Zod schema middleware prior to executing route handlers:

| Field | Rule |
|---|---|
| Name | 20–60 characters |
| Address | Maximum 400 characters |
| Password | 8–16 characters |
| Password | At least one uppercase character |
| Password | At least one special character |
| Email | Valid email format |
| Rating | Integer from 1–5 |

---

## 🔎 Search, Filtering & Sorting

- **Consumer Search**: Instant search by Store Name or Store Address (case-insensitive).
- **Admin User Management**: Filter by Name, Email, Address, or Role (`USER`, `STORE_OWNER`, `ADMIN`). Sort by Name, Email, Role, or Date in ascending (`asc`) or descending (`desc`) direction.
- **Admin Store Operations**: Search by Store Name, Email, or Address. Sort by Name, Rating, or Total Reviews.

---

## 📁 Project Structure

```text
StoreRate/
├── README.md
├── package.json
├── docs/
│   ├── DEPLOYMENT.md
│   └── screenshots/
│       ├── landing-page.png
│       ├── user-stores.png
│       ├── user-profile.png
│       ├── owner-dashboard.png
│       └── admin-dashboard.png
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── scripts/
│       ├── services/
│       └── validators/
└── frontend/
    ├── package.json
    ├── .env.example
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── components/
        ├── context/
        ├── pages/
        └── services/
```

---

## 🔌 API Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Backend service health status |
| `POST` | `/api/auth/register` | Public | Register new consumer account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `POST` | `/api/auth/change-password` | Authenticated | Change user account password |
| `GET` | `/api/stores` | `USER`, `ADMIN` | Search & list stores |
| `POST` | `/api/stores/:id/rating` | `USER`, `ADMIN` | Submit rating (1–5 stars) |
| `PUT` | `/api/stores/:id/rating` | `USER`, `ADMIN` | Update existing rating (1–5 stars) |
| `GET` | `/api/stores/my-ratings` | `USER` | List personal submitted ratings |
| `GET` | `/api/owner/dashboard` | `STORE_OWNER` | Retrieve owner BI metrics & customer feed |
| `GET` | `/api/admin/dashboard` | `ADMIN` | Retrieve system overview metrics |
| `GET` | `/api/admin/users` | `ADMIN` | Search, filter & list user accounts |
| `POST` | `/api/admin/users` | `ADMIN` | Create user account with assigned role |
| `GET` | `/api/admin/users/:id` | `ADMIN` | Get single user details & store rating info |
| `GET` | `/api/admin/stores` | `ADMIN` | List stores with search & sorting |
| `POST` | `/api/admin/stores` | `ADMIN` | Create store linked to store owner |

---

## ⚙️ Environment Variables

### Frontend (`frontend/.env`)
```bash
# Production API Endpoint
VITE_API_BASE_URL=https://storerate-backend-nbjm.onrender.com/api

# Local Development Endpoint
# VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)
```bash
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://username:password@localhost:5432/storeratedb?schema=public"
JWT_SECRET="replace_with_a_secure_random_jwt_secret_key"
```

---

## 💻 Local Development

### 1. Repository Setup & Dependencies
```bash
# Clone repository
git clone https://github.com/Prajvalinjar/StoreRate.git
cd StoreRate

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Local Environment Files
- Copy `backend/.env.example` to `backend/.env` and update `DATABASE_URL` and `JWT_SECRET`.
- Copy `frontend/.env.example` to `frontend/.env`.

### 3. Database Sync & Development Server
```bash
# From backend directory
npx prisma generate
npx prisma db push
npm run seed

# Start backend server (Port 5000)
npm run dev

# In a new terminal, start frontend dev server (Port 5173 / 3000)
cd frontend
npm run dev
```

---

## 🌱 Database Seeding

Seed the database with deterministic baseline accounts and demo stores:

```bash
cd backend
npm run seed
```

This creates `9` users, `3` stores, and `6` initial verified ratings.

---

## ☁️ Production Deployment

The project is configured for cloud deployment on Vercel and Render:

- **Frontend (Vercel)**: Configured with `npm run build` targeting `dist/` output, using `VITE_API_BASE_URL`.
- **Backend (Render)**: Configured with Node.js runtime and build script:
  ```bash
  npm install --include=dev && npx prisma generate && npx prisma db push && npm run seed
  ```
  and start command:
  ```bash
  npm start
  ```

> For step-by-step deployment instructions, view [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## 📸 Application Screenshots

### Landing Page

![StoreRate Landing Page](docs/screenshots/landing-page.png)
*Public store discovery portal & community telemetry statistics.*

### User Store Discovery

![StoreRate User Store Discovery](docs/screenshots/user-stores.png)
*Consumer store browser with instant multi-field search and rating submit/update modal.*

### User Profile

![StoreRate User Profile](docs/screenshots/user-profile.png)
*User profile telemetry, submitted rating history timeline, and account security options.*

### Store Owner Dashboard

![StoreRate Owner Dashboard](docs/screenshots/owner-dashboard.png)
*Business intelligence dashboard with score breakdown, rating metrics, and dynamic SVG trend chart.*

### Admin Dashboard

![StoreRate Admin Dashboard](docs/screenshots/admin-dashboard.png)
*Platform operations console featuring user/store metrics, role breakdown, and leaderboard.*

---

## 🧪 Testing & Verification

StoreRate includes comprehensive automated integration test suites:

- **Authentication Suite**: `19 / 19` PASS
- **Admin Operations Suite**: `18 / 18` PASS
- **User Discovery & Rating Suite**: `17 / 17` PASS
- **Store Owner BI Suite**: `11 / 11` PASS
- **Master QA System Audit**: `14 / 14` PASS
- **Seed Verification Suite**: `7 / 7` PASS

**Summary:** `86/86 automated verification checks passed.`

### Verified Production State
- Vercel frontend is deployed
- Render backend is deployed
- PostgreSQL is connected
- Prisma database schema is deployed
- Demo seed data is available
- User login works
- Store Owner dashboard works
- Admin dashboard works
- Store data is visible
- Rating data is visible
- Role-based access works

---

## ⚠️ Deployment Considerations

- **Server Warm-Up**: Render free-tier web services spin down after inactivity. Initial API requests may experience a short cold-start latency.
- **Database Connection Pooling**: Ensure `DATABASE_URL` uses connection pooling when connecting from serverless or high-concurrency environments.

---

## 🔮 Future Improvements

- 📍 **Geolocation & Map Search**: Interactive map pins for store discovery.
- 📝 **Rich Written Reviews**: Text review comments and customer storefront image uploads.
- 🔔 **Real-Time Owner Alerts**: WebSockets or email notifications on new ratings.

---

## 👨‍💻 Author

Developed with care by **Prajval Injar**.
