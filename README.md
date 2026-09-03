# Claw Grab - Random Name Picker

Arcade-style claw machine for picking random student names. Multiple lists, passcode-protected saves, backed by Convex.

## Quick Start

### Windows - Double-click to run
1. Double-click **`run.bat`**
2. Browser opens at **http://localhost:3000**
3. That's it! Backend is already on Convex Cloud (`bright-mink-448.convex.cloud`)

### macOS / Linux
```bash
./run.sh
# or
npm install && npm run dev
```

### Manual (any OS)
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build to dist/
npm run preview    # preview production build
```

## Configuration

| Env var | Purpose | Default |
|---------|---------|---------|
| `VITE_CONVEX_URL` | Convex backend URL | `https://bright-mink-448.convex.cloud` |
| `VITE_CONVEX_SITE_URL` | Convex site URL | `https://bright-mink-448.convex.site` |
| `GEMINI_API_KEY` | Optional - Gemini AI | - |

- First run creates `.env.local` from `.env.example` automatically (via `run.bat`/`run.sh`).
- Passcode for saving lists: `nexgen2026` (change in app settings, stored hashed in Convex `app` table).
- No local Convex install needed - uses hosted Convex Cloud.

## Backend (Convex)

Tables: `app` (passcode), `lists` (multiple name lists), `names` (entries per list), `history` (winners).
Functions: `auth.verify`/`change`, `lists.listAll`/`getByCode`, `listsMutations.create/saveNames/saveHistory/remove/rename`, `seed.ensureDefault`.

Seed on first load: 3 lists including "BACK TO SCHOOL RAFFLE" with 20 names.

## Deploy to Vercel

1. Import `https://github.com/devaibz81-SENTRY/clay-grab` in Vercel
2. Set env vars `VITE_CONVEX_URL` + `VITE_CONVEX_SITE_URL` in Vercel dashboard
3. Deploy (build: `npm run build`, output: `dist`)

---

Original AI Studio: https://ai.studio/apps/8978a215-7af6-4c99-b2e7-2b17fd24e4bd
