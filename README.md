# AFMS Dashboard (Admin)

Admin dashboard for AFMS (AI powered Flood Management System), developed as part of an **MSc Information Technology project at National Open University of Nigeria**. The application enables authorized administrators to monitor users, review flood reports, create and dispatch flood alerts, and track operational activity.

## Table of Contents

- [Project Context](#project-context)
- [Repositories](#repositories)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment Notes](#deployment-notes)
- [API Integration Summary](#api-integration-summary)
- [Current Limitations](#current-limitations)

## Project Context

This repository contains the frontend admin interface for AFMS. It was created to support academic and practical requirements of an MSc Information Technology research/build project focused on flood reporting and emergency response coordination.

## Repositories

This AFMS MSc project spans multiple repositories:

- Mobile app repository (citizen/user app): `https://github.com/talk2dennis/afms`
- Admin dashboard repository (this repo): `https://github.com/talk2dennis/afms-dashboard`

How they relate:

- The mobile app is used by end users to register, submit and track flood reports, and consume weather/flood guidance.
- The admin dashboard is used by administrators to review reports, manage users, and create/send alerts.
- Both clients integrate with a shared backend API domain.

## Features

- Secure admin sign-in flow backed by API authentication.
- Protected routes for dashboard-only access.
- Dashboard overview metrics (users, reports, alerts).
- User management:
  - List/search/filter users.
  - Update user role.
  - Delete user records.
- Flood report management:
  - List/search/filter reports.
  - Approve reports.
  - Delete reports.
- Flood alert management:
  - List/search/filter alerts.
  - Create and edit alerts.
  - Send alerts.
  - Delete alerts.
- Global UI feedback system:
  - Shared loading overlay.
  - Timed notification toasts (success/error/info/warning).

## Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Routing:** React Router
- **HTTP Client:** Axios
- **Linting:** ESLint
- **Deployment (SPA rewrite):** Vercel (`vercel.json`)

## Project Structure

```text
afms-dashboard/
|- vercel.json
|- README.md
`- afms-admin/
   |- package.json
   |- .env
   |- src/
   |  |- api/
   |  |- components/
   |  |- context/
   |  `- pages/
   `- vite.config.ts
```

## Getting Started

### 1. Prerequisites

- Node.js 20+ (recommended)
- npm 10+ (or equivalent package manager)

### 2. Install Dependencies

```bash
cd afms-admin
npm install
```

### 3. Configure Environment

Create/update `afms-admin/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/
```

If your backend is hosted, replace with its base API URL.

### 4. Start Development Server

```bash
npm run dev
```

Open the app at the local URL printed by Vite (typically `http://localhost:5173`).

## Environment Variables

| Variable            | Required | Description                                           |
| ------------------- | -------- | ----------------------------------------------------- |
| `VITE_API_BASE_URL` | Yes      | Base URL for AFMS backend API (used by Axios client). |

Notes:

- If `VITE_API_BASE_URL` is not set, the client falls back to `http://localhost:5000/api`.
- Ensure the backend allows CORS requests from your frontend origin during development.

## Available Scripts

Run from `afms-admin/`:

- `npm run dev`: Start Vite dev server.
- `npm run build`: Type-check and build production assets.
- `npm run preview`: Preview production build locally.
- `npm run lint`: Run ESLint checks.

## Deployment Notes

- The project includes a root-level `vercel.json` rewrite configuration:
  - All routes are rewritten to `index.html`.
  - This ensures React Router routes work correctly on refresh/direct navigation.

## API Integration Summary

The frontend currently integrates with endpoints such as:

- `POST /auth/admin/login`
- `GET /auth/admin/statistics`
- `GET /auth/admin/users`
- `PUT /auth/admin/users/:id/role`
- `DELETE /auth/admin/users/:id`
- `GET /reports/`
- `PUT /reports/:id/verify`
- `DELETE /reports/:id`
- `GET /alerts/`
- `POST /alerts/`
- `PUT /alerts/:id`
- `POST /alerts/:id/send`
- `DELETE /alerts/:id`

Authentication token handling:

- Token is attached as `Authorization: Bearer <token>` via Axios request interceptor.

## Current Limitations

- `NotificationsPage` is currently driven by local/static data and not yet connected to backend endpoints.
- Some labels/status options in UI may require alignment with backend enum casing depending on API responses.

---

For academic reporting, this README can be referenced as the implementation-facing documentation for the AFMS admin module within the broader MSc Information Technology project deliverables.
