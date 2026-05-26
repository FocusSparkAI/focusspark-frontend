# FocusSpark Frontend

FocusSpark Frontend is the public web application for the FocusSpark project. It includes the marketing pages, authentication, onboarding, dashboard, achievements, reports, analytics, notifications, profile, and settings screens.

The browser-extension study workspace lives in `FocusSpark-Extension`.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- shadcn/ui-style components
- Recharts
- Axios
- Motion
- Sonner

## Current Features

- Public landing, About, Contact, and Science pages
- Public Science white paper download at `/focusspark-science-white-paper.pdf`
- Sign up, sign in, forgot password, and protected routes
- Onboarding flow
- Student dashboard with profile avatar support
- Achievements, analytics, and focus reports backed by study APIs
- Reports CSV export and browser-generated PDF export
- Notifications page and web dashboard bell dropdown
- Settings for account, last login display, Pomodoro timings, focus detection, extension notifications, appearance, and privacy

## Environment

Create a `.env` file in this project root:

```env
VITE_BACKEND_BASE_URL=http://127.0.0.1:8000
```

The frontend expects `VITE_BACKEND_BASE_URL` to be set.

## Install and Run

```bash
npm install
npm run dev
```

Open the URL printed by Vite. This project configures Vite to use `http://localhost:3000`.

## Build and Preview

```bash
npm run build
npm run preview
```

The production output is written to `build/`.

## Important Files

```text
src/app/App.tsx                         # Routing and app shell
src/config/backend.ts                   # Backend route map and URL helper
src/pages/auth/SignUpPage.tsx           # Signup flow
src/pages/static/SciencePage.tsx        # Public Science page and PDF download
src/pages/settings/SettingsScreen.tsx   # Account and user preferences
src/pages/notifications/NotificationsPage.tsx
src/pages/reports/ReportsAnalytics.tsx
src/components/layout/DashboardNavbar.tsx
public/focusspark-science-white-paper.pdf
```

## Backend Integration

The app calls the FastAPI backend through `src/config/backend.ts`.

Main route groups used:

- `/auth/login`
- `/auth/signup`
- `/auth/profile`
- `/auth/password`
- `/study/settings`
- `/study/notifications`
- `/study/sessions/history`
- `/study/stats/summary`
- `/study/stats/analytics`
- `/study/stats/dashboard`
- `/study/goals`
- `/study/achievements`

## Notes

- The Science white paper is public and can be downloaded without login.
- The web dashboard bell dropdown is independent from the extension notification setting.
- The settings page label "Extension Notifications" controls extension notification behavior through the backend `notifications_enabled` setting.
- Signup styling uses the shared dark input rules plus local `shake` and `confetti` animation classes from `src/styles/globals.css`.
