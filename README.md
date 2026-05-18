# FocusSpark Frontend

FocusSpark Frontend is the website/dashboard part of the FocusSpark FYP. It focuses on onboarding, authentication screens, productivity tracking, Pomodoro sessions, focus detection, achievements, reports, profile, settings, and general marketing pages.

The AI chat, quiz, and flashcard experiences are handled by the separate browser extension project, not this frontend.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS v4 style utilities
- Motion for animations
- shadcn/ui-style components
- Recharts
- Supabase/Hono server utilities

## Main Features

- Landing page with light/dark hero variants
- Sign in, sign up, and forgot password screens
- Guided onboarding flow
- Student dashboard
- Pomodoro timer
- Focus detection and webcam test screens
- Achievements and rewards
- Reports and analytics
- Profile and settings pages
- Notifications and toast feedback

## Project Structure

```text
src/
  App.tsx
  main.tsx
  components/
    Navigation.tsx
    HeroSection.tsx
    HeroSectionDark.tsx
    StudentDashboard.tsx
    DashboardSidebar.tsx
    DashboardNavbar.tsx
    PomodoroTimer.tsx
    ProgressStats.tsx
    AchievementsScreen.tsx
    ReportsAnalytics.tsx
    ProfileScreen.tsx
    SettingsScreen.tsx
    WebcamTestScreen.tsx
    ui/
  context/
  config/
  styles/
  utils/
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Notes

- The app builds to the `build/` directory.
- Package versions are managed through `package.json`; source imports and Vite aliases should not include version suffixes.
- The dashboard sidebar intentionally excludes quiz and flashcard pages because those flows live in the extension.
- Gemini/frontend AI client code is not part of this frontend anymore.
