# StoreRate

> **Discover better businesses. Share real experiences. Build trust.**

A full-stack store discovery and reputation platform that connects consumers with local businesses through transparent ratings and authentic customer feedback across three distinct user roles (**`USER`**, **`STORE_OWNER`**, **`ADMIN`**).

`React 18` • `Vite 5` • `Node.js` • `Express.js` • `PostgreSQL` • `Prisma ORM` • `JWT` • `TailwindCSS`

---

![StoreRate Landing Page](docs/screenshots/landing-page.png)

---

## ⚡ Quick Project Snapshot

| Area | Implementation |
| :--- | :--- |
| **Frontend** | React 18 + Vite 5 + TailwindCSS 3.4 |
| **Backend** | Node.js + Express.js REST API |
| **Database** | PostgreSQL 15+ |
| **ORM** | Prisma ORM 5 |
| **Authentication** | JWT (JSON Web Tokens) + `bcryptjs` Password Hashing |
| **Role Architecture** | **`USER`** (Consumer) • **`STORE_OWNER`** (Business Owner) • **`ADMIN`** (Operator) |
| **Rating System** | 1–5 Stars (Integer), Enforced Single Rating per User-Store Pair |
| **Business Intelligence** | 5★–1★ Distribution Bars + Dynamic Small-Dataset SVG Trend Timeline |
| **Admin Operations** | Multi-Field Search/Filter + Dual-Direction Sorting (`asc` / `desc`) |
| **Test Verification** | 6 Integration Test Suites (**86 / 86 Total Test Cases PASS**) |
| **Production Build** | Verified clean build via `npm run build` (**0 errors**, 2.28s) |

---

## 🎯 Why StoreRate Exists

Traditional review platforms often bombard users with unverified marketing noise or rigid minimum thresholds that hide small business ratings. **StoreRate** provides a transparent, role-tailored platform for all stakeholders:

- 👤 **Consumer**: **Discover** stores → **Compare** ratings → **Submit & Update** authentic 1–5 star reviews.
- 🏪 **Store Owner**: **Monitor** reputation → **Understand** customer breakdown → **Improve** service quality.
- 🛡️ **Administrator**: **Manage** users & stores → **Analyze** platform metrics → **Enforce** data integrity.

---

## 🏗️ System Architecture & Data Flow

```mermaid
flowchart LR
    subgraph Client ["Client Layer"]
        A[React 18 + Vite Frontend]
    end

    subgraph Server ["Server Layer"]
        B[Express.js REST API Router]
        C[Zod Validation & RBAC Middleware]
        D[JWT Authentication Service]
    end

    subgraph Data ["Data Layer"]
        E[Prisma ORM]
        F[(PostgreSQL Database)]
    end

    A -->|HTTP / REST API| B
    B --> C
    C --> D
    C --> E
    E --> F
```

### Role-Based Access Control (RBAC)
- **Backend Enforced**: Routes are guarded by `requireAuth` and `requireRole('ADMIN' | 'STORE_OWNER' | 'USER')`.
- **Frontend Enforced**: Client routing is isolated via `<ProtectedRoute>` and `<RoleRoute>` guards.

---

## ✨ Core Product Features (By Role)

### 👤 1. Normal User (`USER`)
- **Store Browser & Search**: Instant case-insensitive keyword search by Store Name or Address.
- **Authentic 1–5 Star Ratings**: View store average ratings and submit ratings from 1 to 5 stars.
- **Rating Updates**: Updating a rating modifies the existing record seamlessly without creating duplicate rows.
- **My Ratings History**: Dedicated timeline listing all rated stores, scores, timestamps, and quick edit options.
- **User Profile**: Personal account details, security options, and password update flow.

![User Store Discovery](docs/screenshots/user-stores.png)
*User Store Browser with instant search filtering*

![User Profile](docs/screenshots/user-profile.png)
*User Account Profile & Rating Activity*

---

### 🏪 2. Store Owner Intelligence (`STORE_OWNER`)
- **Reputation Telemetry**: KPI overview displaying Average Rating, Total Reviews, 5-Star Ratio, and Positive Reviews %.
- **Rating Distribution**: Mathematically exact count and percentage distribution bars for 5★ down to 1★.
- **Small-Dataset Rating Trend Timeline**: Time-series SVG line chart that dynamically plots ratings for small datasets (1, 2, 3, 4, 5+ ratings) without artificial 5-rating minimum thresholds.
- **Customer Rater Feed**: Real-time listing of verified rater names, scores, and submission timestamps.
- **Data Isolation**: Store Owners can strictly access data for their assigned store.

![Store Owner Dashboard](docs/screenshots/owner-dashboard.png)
*Store Owner Reputation Analytics & Rater Feed*

---

### 🛡️ 3. Administrator Operations (`ADMIN`)
- **Operations Console**: Dedicated sidebar navigation for Overview, User Operations, Store Operations, and Admin Profile.
- **Platform Analytics**: Real-time database metrics for Total Users, Total Stores, Total Ratings, and Average Platform Rating.
- **User & Store Operations**: Create `USER`, `STORE_OWNER`, and `ADMIN` accounts and register stores linked to verified owners.
- **Multi-Field Filtering & Sorting**: Filter users/stores by Name, Email, Address, or Role, and sort by key fields in ascending (`asc`) or descending (`desc`) order.
- **Associated Store Intelligence**: Viewing a `STORE_OWNER` profile displays their linked store rating telemetry.

![Admin Operations Console](docs/screenshots/admin-dashboard.png)
*Admin Operations Console & User Management*

---

## ⭐ Rating Architecture & Database Constraints

StoreRate enforces a strict **Single-Rating Constraint** per user-store pair to eliminate rating manipulation.

### Database Schema Constraint (`schema.prisma`)
```prisma
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
```

- **Uniqueness Guarantee**: The composite index `@@unique([userId, storeId])` prevents duplicate database entries.
- **Upsert Execution**: When a user submits an updated rating, `userStoreService.js` updates the existing record via `userId_storeId` lookup, automatically triggering store average recalculation.

---

## 📏 Validation Rules

All API requests are validated through Zod schema middleware before reaching business logic handlers:

| Entity / Field | Constraint | Enforced Validator |
| :--- | :--- | :--- |
| **User Name** | **20 to 60 characters** (Min 20, Max 60) | `authValidator.js`, `adminValidator.js` |
| **Address** | **Maximum 400 characters** | `authValidator.js`, `adminValidator.js` |
| **Password** | **8 to 16 characters**, min 1 uppercase (`/[A-Z]/`), min 1 special char (`/[^a-zA-Z0-9]/`) | `authValidator.js`, `adminValidator.js` |
| **Rating** | **Integer 1 to 5** (Decimals, 0, >5 rejected) | `userStoreValidator.js` |
| **Email** | Valid RFC 5322 email format | `authValidator.js`, `adminValidator.js` |

---

## 🔒 Security Implementation

- **Password Hashing**: Passwords stored as `bcryptjs` hashes with salt rounds.
- **Sensitive Field Protection**: `passwordHash` is omitted from all API responses.
- **JWT Authentication**: Tokens signed with server `JWT_SECRET` and transmitted via HTTP Headers (`Authorization: Bearer <token>`).
- **Owner Data Isolation**: Backend queries automatically scope store owner metrics to `where: { ownerId: req.user.id }`.
- **Protected Environment**: Secret values strictly ignored via `.gitignore`.

---

## 🔑 Demo Environment & Credentials

> [!NOTE]
> **LOCAL / DEMO ENVIRONMENT CREDENTIALS**

| Role | Email | Password | Access / Assigned Entity |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@storerate.local` | `Admin@123` | Platform Operations Console |
| **Primary Store Owner** | `owner@storerate.local` | `Owner@123` | Demo StoreRate Market (`4.7 ★`) |
| **FreshMart Store Owner** | `owner2@storerate.local` | `Owner@123` | FreshMart Grocery Store (`4.0 ★`) |
| **Electronics Store Owner** | `owner3@storerate.local` | `Owner@123` | City Electronics Superstore (`5.0 ★`) |
| **Normal Consumer 1** | `user@storerate.local` | `User@123` | Consumer Portal |
| **Normal Consumer 2** | `user2@storerate.local` | `User@123` | Consumer Portal |
| **Normal Consumer 3** | `user3@storerate.local` | `User@123` | Consumer Portal |

### Seeded Baseline Metrics
- **Users**: `9`
- **Stores**: `3`
- **Ratings**: `6`

---

## 🧪 Test Suite & Quality Verification

StoreRate includes six comprehensive automated integration test suites:

| Test Suite | Domain Covered | Executed Tests | Result |
| :--- | :--- | :--- | :--- |
| `testAuth.js` | Authentication, JWT, Name Boundaries (20–60 chars), Password Rules | 19 / 19 Passed | **PASS** |
| `testAdmin.js` | Admin Metrics, User/Store CRUD, Filtering, Sorting, RBAC | 18 / 18 Passed | **PASS** |
| `testUser.js` | Store Discovery, Name/Address Search, Rating Upsert, Rating Bounds | 17 / 17 Passed | **PASS** |
| `testOwner.js` | Owner Dashboard Metrics, Small-Dataset Trend, Rater Isolation | 11 / 11 Passed | **PASS** |
| `testMasterQA.js` | End-to-End Multi-Role System Quality & Security Audit | 14 / 14 Passed | **PASS** |
| `verifySeed.js` | Seed Dataset Credentials & Portal Access Validation | 7 / 7 Passed | **PASS** |
| **Total Automated Tests** | **Full System Audit** | **86 / 86 Passed** | **`PASS (100%)`** |

*Manual acceptance testing was also executed across USER, STORE_OWNER, ADMIN, security isolation, rating updates, small-dataset trends, search/filtering/sorting, responsive UI, and landing page asset resilience.*

---

## 🚀 Local Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **PostgreSQL**: v15.x or higher (listening on port `5432`)
- **npm**: v9.x or higher

### 1. Clone & Install Dependencies
```bash
# Clone repository
git clone https://github.com/Prajvalinjar/StoreRate.git
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

# Edit backend/.env with your PostgreSQL credentials
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/storeratedb?schema=public"
# JWT_SECRET="super_secret_jwt_key_store_rate"

# In frontend/ directory
cp .env.example .env
```

### 3. Setup PostgreSQL Database & Seed Data
```bash
cd ../backend

# Run Prisma database migrations
npx prisma migrate dev --name init

# Seed the deterministic demo dataset (9 Users, 3 Stores, 6 Ratings)
node src/scripts/seed.js
```

### 4. Run Application Development Servers
```bash
# Start Backend API Server (Port 5000)
cd backend
npm run dev

# In a separate terminal, start Frontend Dev Server (Port 5173 / 3000)
cd frontend
npm run dev
```

---

## 📡 API Endpoint Reference

| Method | Endpoint | Auth / Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new `USER` account (min 20 char name) |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials & return JWT |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile details of authenticated user |
| `POST` | `/api/auth/change-password` | Authenticated | Update account password |
| `GET` | `/api/stores` | `USER` | Search & list stores by name/address |
| `POST` | `/api/stores/:id/rating` | `USER` | Submit initial 1–5 star rating for store |
| `PUT` | `/api/stores/:id/rating` | `USER` | Update existing 1–5 star rating for store |
| `GET` | `/api/stores/my-ratings` | `USER` | List personal submitted ratings |
| `GET` | `/api/owner/dashboard` | `STORE_OWNER` | Retrieve store owner BI analytics & rater feed |
| `GET` | `/api/admin/dashboard` | `ADMIN` | Retrieve platform-wide metrics & leaderboard |
| `GET` | `/api/admin/users` | `ADMIN` | List users with filtering, sorting, & pagination |
| `POST` | `/api/admin/users` | `ADMIN` | Create user account (`USER`, `STORE_OWNER`, `ADMIN`) |
| `GET` | `/api/admin/users/:id` | `ADMIN` | Retrieve single user & assigned store rating data |
| `GET` | `/api/admin/stores` | `ADMIN` | List stores with filtering & rating sorting |
| `POST` | `/api/admin/stores` | `ADMIN` | Create store linked to a `STORE_OWNER` |

---

## 🌟 Key Differentiators

1. **Role-Tailored Portals**: Distinct experiences designed specifically for Consumers, Business Owners, and Operators.
2. **PostgreSQL Unique Constraint Integrity**: `@@unique([userId, storeId])` prevents rating duplicate records at the database engine level.
3. **Small-Dataset Rating Trend Timeline**: Dynamic SVG line graph that correctly visualizes available rating data (1 to 5+ points) without artificial error thresholds.
4. **Operations Console**: Admin table architecture featuring instant filtering across Name, Email, Address, and Role, alongside dual-direction sorting (`asc` / `desc`).
5. **86-Point Automated Integration Suite**: Automated tests verifying auth boundaries, RBAC isolation, rating recalculations, and database cleanup.

---

## 🔮 Future Roadmap (Possibilities)

- 📍 **Map & Geolocation Integration**: Interactive store locator and proximity search.
- 📝 **Rich Written Reviews & Photo Uploads**: Allow customers to attach text feedback and storefront photos.
- 🔔 **Owner Notifications**: Real-time notifications for store owners when a new rating is submitted.
- 🛡️ **Suspicious Review Detection**: Anomaly detection for unusual rating spikes.

---

## 📄 Documentation

For full technical audit logs, code structure notes, and design evolution details, refer to [`walkthrough.md`](./walkthrough.md).

---

StoreRate demonstrates a complete full-stack product workflow — from consumer discovery and rating submission to business intelligence and platform administration.

**Built with React • Node.js • Express • PostgreSQL • Prisma**
