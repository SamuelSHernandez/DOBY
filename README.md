# DOBY

Local-first home management system. Track rooms, systems, finances, maintenance, and utilities — all data stays in your browser via localStorage. No accounts, no cloud, no backend.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Zustand. Exports as a fully static site (~3MB) for self-hosting on a Raspberry Pi or any static file server.

## Features

- **Rooms** — Dimensions, inventory, wishlist (with purchase conversion), photos, maintenance log, notes
- **Systems** — HVAC, plumbing, electrical, appliances with lifecycle tracking, service dates, warranty monitoring
- **Finances** — Mortgage calculator with amortization charts, expense tracking, cost breakdown, room cost attribution, property appreciation
- **Upkeep** — Seasonal maintenance checklists, project tracker with budget vs actual
- **Utilities** — Monthly bill tracking with bar charts and trending
- **Reference** — Emergency info (shutoffs, security codes), contractor directory with ratings, document index
- **Admin** — 15 feature flags, dark/light theme toggle, data reset

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, static export) |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Recharts |
| State | Zustand with localStorage persistence |
| Language | TypeScript (strict) |
| Font | IBM Plex Mono |
| Tests | Vitest (97 tests) |

## Run

```bash
npm install
npm run dev          # Dev server at localhost:3000
npm run build        # Static export to out/
npm run test         # Run test suite
```

## Deploy

Build produces a static `out/` directory. Serve with any static file server — no Node.js runtime required.

```bash
# Raspberry Pi with Caddy
caddy file-server --root ./out --listen :8080

# Or nginx, serve, etc.
npx serve out
```

## Architecture

Single-page app with client-side routing. All data persists in `localStorage` under the key `doby-store`. No API routes, no server-side rendering, no database.

## License

MIT
