# FocusSpark Frontend

Public web application for FocusSpark, an AI-assisted study platform that helps students manage focus sessions, goals, analytics, achievements, profile settings, and account preferences.

The Chrome-extension study workspace lives in `FocusSpark-Extension`.

For the complete multi-project setup, start with the root `README.md`.

## Quick Start

```bash
cd FocusSpark-Frontend
npm install
npm run dev
```

Before starting, create `.env` with `VITE_BACKEND_BASE_URL=http://127.0.0.1:8000` and make sure the backend is running.

Expected result: Vite prints a local URL, normally `http://localhost:3000`, and the web app loads in the browser.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- shadcn/ui-style components
- Radix UI primitives
- Recharts
- Axios
- Motion
- Sonner

## Features

- Public landing, About, Contact, and Science pages
- Public Science white paper download at `/focusspark-white-paper.pdf`
- Signup, signin, forgot-password flow, server-backed logout, and protected routes
- Onboarding flow
- Student dashboard with study overview, profile avatar support, and bootstrap loading from one backend route
- Profile page with Cloudinary-backed profile picture upload/remove through the backend
- Achievements, analytics, goals, and focus reports backed by study APIs
- Reports CSV export and browser-generated PDF export
- Notifications page and dashboard notification dropdown
- Settings for account, last login, Pomodoro timings, focus detection, extension notifications, appearance, accessibility, and privacy

## Environment

Create `.env` in `FocusSpark-Frontend/`.

```env
VITE_BACKEND_BASE_URL=http://127.0.0.1:8000
```

The frontend expects the FastAPI backend to be running and reachable at this URL.

`VITE_BACKEND_BASE_URL` is required. The app throws during startup if it is missing.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer

## Install And Run

From this folder:

```bash
cd FocusSpark-Frontend
npm install
npm run dev
```

Open the URL printed by Vite. The project is configured for `http://localhost:3000`.

Expected result: the Vite dev server starts successfully and the public home page loads.

## Build And Preview

From this folder:

```bash
cd FocusSpark-Frontend
npm run build
npm run preview
```

The production output is written to `build/`.

## App Routes

Public routes:

- `/`
- `/science`
- `/about`
- `/contact`
- `/signin`
- `/signup`
- `/forgot-password`
- `/verify-email`

Protected routes:

- `/onboarding`
- `/dashboard`
- `/goals`
- `/goals/history`
- `/achievements`
- `/reports`
- `/profile`
- `/settings`
- `/analytics`
- `/notifications`

## Scripts

```bash
npm run dev      # Start the Vite development server
npm run build    # Type-check and build for production
npm run lint     # Run ESLint
npm run preview  # Preview the production build locally
```

## Backend Integration

The app calls the FastAPI backend through `src/config/backend.ts`.

The backend should be running before using authenticated dashboard pages. The extension also depends on this web app for web-only handoffs such as signup, forgot password, achievements, profile, settings, and notifications.

Main route groups used:

- `/auth/login`
- `/auth/signup`
- `/auth/logout`
- `/auth/profile`
- `/auth/profile/avatar`
- `/auth/password`
- `/study/settings`
- `/study/notifications`
- `/study/sessions/history`
- `/study/stats/summary`
- `/study/stats/analytics`
- `/study/stats/dashboard`
- `/study/dashboard/frontend`
- `/study/goals`
- `/study/achievements`
- `/study/export`
- `/study/data`

The web dashboard uses `GET /study/dashboard/frontend` to receive dashboard stats, profile data, settings, notification summary, and unlocked achievement popup data in one request. The dashboard navbar consumes that bootstrap response first and only refetches when a user action requires fresh data.

Profile pictures are uploaded from the web profile page to `POST /auth/profile/avatar`. The backend validates and processes the image, uploads it to Cloudinary, and returns the final `avatar_url`. The frontend resolves and displays that URL in the profile page and dashboard navbar.

Reports use backend study analytics and export APIs. Browser-generated PDF export is handled client-side with `html2canvas` and `jspdf`.

Logout calls `POST /auth/logout` to invalidate the current token on the backend, then clears local auth data while preserving the saved theme.

## Important Files

```text
src/app/App.tsx                         # Routing and app shell
src/config/backend.ts                   # Backend route map and URL helper
src/pages/auth/SignUpPage.tsx           # Signup flow
src/pages/auth/SignInPage.tsx           # Signin flow
src/pages/onboarding/OnboardingFlow.tsx # First-run onboarding
src/pages/profile/ProfileScreen.tsx     # Profile and profile-picture management
src/pages/settings/SettingsScreen.tsx   # Account and user preferences
src/pages/reports/ReportsAnalytics.tsx  # Reports, analytics, exports
src/pages/static/SciencePage.tsx        # Public Science page and PDF download
src/pages/notifications/NotificationsPage.tsx
src/components/layout/DashboardNavbar.tsx
public/focusspark-white-paper.pdf
```

## Demo Checklist

- Backend is running at `VITE_BACKEND_BASE_URL`
- User can sign up and sign in
- Logout invalidates the current backend token and returns the user to the public home screen
- Dashboard loads user profile data
- Profile picture upload displays a Cloudinary URL-backed avatar
- Settings save successfully
- Goals can be created, updated, completed, deleted, and viewed in history
- Reports and analytics pages load backend data
- Notifications page and dashboard dropdown work
- CSV/PDF report exports work from the reports screen

## Notes

- The Science white paper is public and can be downloaded without login.
- The web dashboard notification dropdown is separate from the extension notification preference.
- Achievement unlock popups show one achievement-specific popup for a single unlock and one grouped popup when multiple achievements unlock together. Dismissing or viewing the popup marks every represented achievement as seen locally.
- The settings label "Extension Notifications" controls extension behavior through the backend `notifications_enabled` setting.
- Signup styling uses shared dark input rules plus local `shake` and `confetti` animation classes from `src/styles/globals.css`.
- Keep website-only pages in this project and extension-only study workspace screens in `FocusSpark-Extension`.
