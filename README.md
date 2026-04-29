# DOBY

Local-first home management system. Track rooms, systems, finances, maintenance, and utilities. State lives in `localStorage` for offline use and syncs to Supabase (single JSONB row per user, RLS-locked) for cross-device persistence.

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
| State | Zustand + localStorage cache + Supabase sync |
| Auth | Supabase magic-link (email) |
| Language | TypeScript (strict) |
| Font | IBM Plex Mono |
| Tests | Vitest (114 tests) |

## Run

```bash
npm install
cp .env.local.example .env.local   # then fill in Supabase URL + anon key
npm run dev                        # Dev server at localhost:3000
npm run build                      # Static export to out/
npm run check                      # Lint + typecheck + tests + build
```

The app runs without `.env.local` — sync is just disabled and everything stays in `localStorage`.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/001_app_state.sql` in the SQL editor (or via the Supabase CLI).
3. Auth → Providers → Email: enable, leave the default magic-link config.
4. Auth → URL Configuration → add your site URL (`http://localhost:3000` for dev, plus your prod origin) to "Site URL" and "Redirect URLs".
5. Project Settings → API: copy `URL` and `anon public key` into `.env.local`.

First sign-in seeds the user's row from existing `localStorage` data; later loads pull from Supabase.

## Deploy

Build produces a static `out/` directory. Serve with any static file server — no Node.js runtime required.

```bash
# Raspberry Pi with Caddy
caddy file-server --root ./out --listen :8080

# Or nginx, serve, etc.
npx serve out
```

## Architecture

Single-page app with client-side routing. State lives in `localStorage` under the key `doby-store` for offline use and is mirrored to a single `app_state` row in Supabase (JSONB blob, RLS) for cross-device sync. No API routes, no server-side rendering — the Supabase JS client talks directly from the browser.

## License

MIT
