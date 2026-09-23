# Security Compliance System

A React front end for the Security Compliance System (SCS): register applications, scan them for security gaps, track findings through to a fix, and stay audit-ready — with a separate System Administrator dashboard to authorize applications and manage the platform.

The same responsive build serves as both the desktop web app and a mobile "app" experience — the layout switches from a sidebar to a bottom tab bar under 1024px, and the app is installable to a phone's home screen (PWA manifest + icons) for an app-like feel with no native build required.

## Stack

- [React 18](https://react.dev/) + [React Router](https://reactrouter.com/) (hash-based routing, so it deploys as static files with no server config)
- [Vite](https://vitejs.dev/) for dev server and bundling
- Plain CSS (`src/styles.css`), no CSS framework

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

Sign-in has a "Sign in as (demo)" selector — there's no real backend yet, so this picks which dashboard/role to preview: **Organization owner**, **Developer / security tester**, or **System administrator**.

## What's implemented

**Owner / Developer dashboard** (`/app/*`)
- Sign up (personal info → create-or-join organization → org details or join-by-code) and sign in
- Security Overview, Applications (card grid, add application), Assessment summary, Findings, Remediation, Members (Owner only)
- Application details → Scan Application (Quick / Standard / Full confirmation modal, or a full Custom Scan checklist) → live scan progress (cancellable) → Assessment History per application → Assessment details with a findings summary and a downloadable JSON report
- Finding details with description, evidence, and remediation steps
- Member management: view details, remove (confirm), and approve/decline join requests (confirm)

**System Administrator dashboard** (`/admin/*`)
- System Overview with a Total Pending Authorizations KPI
- User Management: search/filter, view details, suspend/reactivate (confirm)
- Organization Management: view details, suspend/reactivate (confirm)
- Application Management: Authorization Queue (approve, or reject with a required reason) and an Application Overview (filter by status, revoke authorization)
- Assessment Monitoring: running scans (cancel), completed/failed history
- System Activity: a filterable platform-wide audit log
- System Health: service status, queue depth, scan duration, failure rate, per-module status

Applications registered by an Owner start **Pending** and only become scannable once a System Administrator authorizes them from the Authorization Queue — the two dashboards share the same in-memory data, so approving there immediately unlocks scanning on the owner side.

## Project structure

```
src/
  components/     Reusable UI: icons, form fields, dialogs, confirm dialog, chips, org switcher, charts
  context/        App state (orgs/apps/assessments/findings/members + admin data) and toast notifications
  data/           Sample data, scan profile/check definitions, icon/nav config
  pages/
    auth/         Public pages: Landing, Sign in, Sign up — no role required
    owner/        Owner/Developer dashboard (/app/*) — AppShell + its route views
    admin/        System Administrator dashboard (/admin/*) — AdminShell + its route views
    shared/       Views reused by more than one role (currently: Assessment details,
                  mounted at both /app/assessments/:id and /admin/assessments/:id)
  App.jsx         Route table — the only file that imports across pages/* folders
  main.jsx        Entry point
```

Each role's pages only import from its own folder (plus `components/`, `context/`, `data/`) — `owner/` never reaches into `admin/` or vice versa. `App.jsx` is the single place that wires all three together into routes.

## Backend integration

This is currently a front-end prototype: all data lives in React state (see `src/context/AppContext.jsx`, `src/data/sampleData.js`, `src/data/adminData.js`) and the session is mocked via `sessionStorage`. Every place that needs a real API call is marked with a `TODO(backend)` comment — search for that string to find every integration point (auth, organizations, applications, scanning, findings, members, admin actions).
