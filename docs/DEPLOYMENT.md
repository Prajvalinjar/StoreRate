# StoreRate — Production Deployment Guide

This document details the production architecture, deployment workflow, environment configuration, and database setup for the **StoreRate** platform.

---

## 🏗️ Production Architecture Overview

The StoreRate platform is deployed across modern cloud services using a decoupled frontend/backend topology:

```
                  ┌────────────────────────┐
                  │    GitHub Repository   │
                  └───────────┬────────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
   ┌───────────────────────┐    ┌────────────────────────┐
   │    Vercel Hosting     │    │     Render Hosting     │
   │  (React + Vite SPA)   │    │ (Node.js + Express API)│
   └───────────┬───────────┘    └───────────┬────────────┘
               │                            │
               │ HTTP / REST API            │ Prisma ORM Connection
               ▼                            ▼
   ┌─────────────────────────────────────────────────────┐
   │             PostgreSQL Managed Database              │
   └─────────────────────────────────────────────────────┘
```

---

## 🌐 Verified Production Endpoints

| Layer | Environment | URL |
| :--- | :--- | :--- |
| **Frontend Web App** | Vercel | [https://storerate-tau.vercel.app/](https://storerate-tau.vercel.app/) |
| **Backend REST API** | Render | [https://storerate-backend-nbjm.onrender.com](https://storerate-backend-nbjm.onrender.com) |
| **Backend Health Check** | Render | [https://storerate-backend-nbjm.onrender.com/api/health](https://storerate-backend-nbjm.onrender.com/api/health) |

---

## ⚙️ Environment Variables

### Frontend Environment Variables (`frontend/.env`)

| Variable Name | Environment | Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Local | `http://localhost:5000/api` | Local Express server API base endpoint |
| `VITE_API_BASE_URL` | Production | `https://storerate-backend-nbjm.onrender.com/api` | Render backend API base endpoint |

> [!IMPORTANT]
> The frontend application uses `VITE_API_BASE_URL` (NOT `VITE_API_URL`). Ensure this exact variable name is defined in your Vercel project environment settings.

### Backend Environment Variables (`backend/.env`)

| Variable Name | Environment | Example / Required | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Local / Prod | `postgresql://user:pass@host:5432/dbname?schema=public` | PostgreSQL connection string |
| `JWT_SECRET` | Local / Prod | `[secure_random_string_32+_chars]` | Secret key used for signing JWT auth tokens |
| `PORT` | Local / Prod | `5000` | Port for Express API server |
| `NODE_ENV` | Production | `production` | Node environment runtime flag |

---

## 🗄️ Database Provisioning & Prisma Deployment

> [!NOTE]
> **Prisma Deployment Strategy**: The repository does **NOT** use a Prisma migrations folder (`prisma/migrations`). The database schema is synchronized using `npx prisma db push` and `npx prisma generate`.

### Production Build & Database Sync Command (Render)

When building the backend on Render, use the following build command to automatically generate the Prisma Client, push the schema to the PostgreSQL database, and seed initial baseline data:

```bash
npm install --include=dev && npx prisma generate && npx prisma db push && npm run seed
```

### Production Start Command (Render)

```bash
npm start
```

---

## ☁️ Step-by-Step Deployment Instructions

### 1. Database Setup (PostgreSQL)

1. Provision a managed PostgreSQL instance (e.g., Supabase, Render PostgreSQL, Neon, or Railway).
2. Obtain the database connection URI string formatted as:
   ```text
   postgresql://<username>:<password>@<host>:<port>/<database_name>?sslmode=require
   ```

### 2. Backend Deployment (Render)

1. Create a new **Web Service** on [Render](https://render.com) connected to your GitHub repository.
2. Set the **Root Directory** to `backend`.
3. Configure the build and start settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install --include=dev && npx prisma generate && npx prisma db push && npm run seed`
   - **Start Command**: `npm start`
4. Configure Environment Variables in Render Dashboard:
   - `DATABASE_URL` = `<your_postgresql_connection_string>`
   - `JWT_SECRET` = `<your_secure_random_key>`
   - `NODE_ENV` = `production`
   - `PORT` = `5000` (or leave default assigned by Render)
5. Deploy Web Service and verify API status via the health check URL:
   `GET https://storerate-backend-nbjm.onrender.com/api/health`

### 3. Frontend Deployment (Vercel)

1. Create a new project on [Vercel](https://vercel.com) imported from your GitHub repository.
2. Set the **Root Directory** to `frontend`.
3. Select **Vite** as the Framework Preset.
4. Set Build Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://storerate-backend-nbjm.onrender.com/api`
6. Click **Deploy**.

---

## 🧪 Post-Deployment Verification Checklist

- [x] **Backend Health Check**: `GET /api/health` returns `200 OK` with JSON status payload.
- [x] **Database Connectivity**: Prisma successfully queries PostgreSQL tables (`User`, `Store`, `Rating`).
- [x] **Seeded Accounts**: Demo users (`admin@storerate.local`, `owner@storerate.local`, `user@storerate.local`) can authenticate.
- [x] **CORS Configuration**: Express API accepts requests originating from the Vercel domain.
- [x] **Frontend SPA Routing**: Direct navigation to `/login`, `/dashboard`, `/stores`, and `/owner` routes works without 404 errors.
