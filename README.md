# FocusSpark Frontend

FocusSpark Frontend is the web application for the FocusSpark project. It contains the public landing pages, authentication flows, onboarding, and the student dashboard (reports, analytics, achievements, profile, and settings).

This repo does NOT include the AI chat, quiz, or flashcard browser-extension frontend — those live in separate projects.

**Tech stack:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui components, Recharts, Axios

**Quick links:** [src/](src) — main app source, [build/](build) — production output

## Prerequisites

- Node.js 18+ (or the version specified in your `.nvmrc` if present)
- npm (or yarn/pnpm)

## Environment

Create a `.env` file in the project root containing at least:

```env
VITE_BACKEND_BASE_URL=http://127.0.0.1:8000
```

Use your production backend URL when deploying. The app expects `VITE_BACKEND_BASE_URL` to be set and will fail fast without it.

## Install & Run (local development)

Install dependencies:

```bash
npm install
```

Start the dev server (Vite):

```bash
npm run dev
```

Open the app at the URL Vite prints (usually `http://localhost:5173`).

## Build & Preview (production)

Build the production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The built files are placed in the `build/` directory — serve that folder from your static host or CDN.

## Available NPM scripts

- `npm run dev` — start Vite dev server
- `npm run build` — create production build
- `npm run preview` — preview production build locally

## Project structure (important folders)

```text
src/
  main.tsx              # React entry
  app/
    App.tsx            # App shell + routing
  components/           # Reusable UI components (layout, ui)
  pages/                # Route pages (auth, dashboard, home, onboarding, etc.)
  config/backend.ts     # Backend API helpers / base URL
  context/              # React contexts (FocusContext)
  hooks/                # Reusable hooks
  styles/               # global Tailwind/CSS
  utils/                # small utilities
```

## Backend integration

The frontend calls the backend using `VITE_BACKEND_BASE_URL`. Endpoints used by the app include authentication and profile endpoints (e.g., `/auth/login`, `/auth/signup`, `/auth/profile`). See `src/config/backend.ts` for client setup.

## Notes & tips

- If `npm run dev` exits with errors, check your `VITE_BACKEND_BASE_URL` and that the backend is reachable.
- Tailwind classes are managed in `src/styles` and through shadcn/ui component patterns.

## Contributing

If you want to contribute:

1. Fork and create a topic branch.
2. Run the app locally and verify pages you touched.
3. Open a pull request with a clear description.

## Next steps

- Add a `CONTRIBUTING.md` and CI checks if you want a stricter workflow.

---

If you'd like, I can also:

- add a short development checklist to `README.md`
- create a `docs/` folder with example requests for the backend


