# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Static export to out/ (includes TypeScript checks)
npm run lint         # ESLint
npm run test         # Run vitest test suite
```

Build produces a fully static `out/` directory (~3.7MB). No Node.js runtime needed in production — serve with nginx, caddy, or any static file server.

## Architecture

Doby is a local-first home management SPA built with Next.js 16 (App Router, static export), React 19, TypeScript, and Tailwind CSS 4. All data persists in localStorage via Zustand — no backend, no auth, no API routes, no server-side rendering.

### State Management
- **Single Zustand store** at `src/store/index.ts` with `persist` middleware (localStorage key: `doby-store`)
- Types in `src/store/types.ts`, defaults/presets in `src/store/defaults.ts`
- Store has CRUD actions for: rooms, inventory, wishlist, systems, expenses, utilities, projects, contractors, documents
- Theme (`dark`/`light`) persisted in store, applied via `.light` class on `<html>`
- All components access store via `useDobyStore` hook

### Routing
- `/` — Client-side redirect to `/home`
- `/home` — Room cards grid with floor tabs
- `/room?roomId=xxx` — Room detail with Inventory/Wishlist/Materials/Systems tabs
- `/systems` — Systems dashboard with lifecycle tracking
- `/finances` — Sub-tabs: Overview/Mortgage/Expenses/Insurance/Property
- `/finances/mortgage` — Mortgage acceleration calculator
- `/upkeep` — Sub-tabs: Seasonal/Projects
- `/utilities` — Utility bill tracking with bar charts
- `/reference` — Sub-tabs: Emergency/Contractors/Documents
- `/admin` — Feature flags and theme toggle

Routes using query params (e.g. `/room`) wrap `useSearchParams()` in Suspense boundaries (required for static export).

### Navigation
- Desktop (≥md): Fixed left sidebar 200px (`Sidebar.tsx`)
- Mobile (<md): Top bar + fixed bottom nav (`MobileNav.tsx`)
- Wrapped by `AppShell.tsx` in root layout

### Utility Libraries
- `src/lib/mortgage.ts` — Amortization calculation, equity, home value
- `src/lib/dates.ts` — Date formatting helpers (date-fns)
- `src/lib/formatters.ts` — Currency, percent, dimensions formatting
- `src/lib/constants.ts` — Nav items, ID generation via `crypto.randomUUID()`

## Design System

Dark/light theme, utilitarian aesthetic. IBM Plex Mono exclusively.

- **Square corners everywhere** (all radius vars = 0px)
- **No shadows, gradients, or blurs** — flat rendering only
- **Colors defined as CSS variables** (`--d-*`) in `globals.css` with `:root` (dark) and `.light` overrides
- Semantic tokens: `carbon`, `panel`, `surface`, `surface-hover`, `surface-raised`, `surface-dim`, `border`, `border-bright`, `text-primary`, `text-secondary`, `text-tertiary`, `text-muted`, `text-dim`, `text-ghost`
- Accent colors: `azure` (#3083DC), `sea-green` (#058C42), `saffron` (#FE9000), `oxblood` (#95190C)
- **Typography:** Uppercase for labels/headers, weight 400 body / 600 data / 700 stats
- Tailwind theme defined via `@theme inline` in `globals.css` (Tailwind v4 pattern, no tailwind.config.ts)
- shadcn/ui components in `src/components/ui/` — customized via CSS variable mappings in globals.css
- **Never use hardcoded hex colors** in components — always use semantic Tailwind classes (`text-text-primary`, `bg-panel`, etc.) or `var(--d-*)` for inline styles

### Component Conventions
- `"use client"` on all interactive components (store access, state, event handlers)
- Dialogs use shadcn Dialog; forms use native FormData (not react-hook-form for simple CRUD)
- Save-on-blur pattern for inline editable fields (with toast confirmation via Sonner)
- Shared components: `StatBox`, `StatusBadge`, `LifecycleBar`, `EmptyState`, `PageHeader`

### Mobile Conventions
- `.touch-target` CSS class enforces 44x44px minimum on icon buttons
- `.safe-bottom` / `.safe-top` classes add `env(safe-area-inset-*)` padding for notched devices
- Viewport uses `viewportFit: "cover"` to enable safe area insets
- All inputs globally set to `font-size: 16px` to prevent iOS auto-zoom on focus
- Bottom nav has `pb-24` clearance in AppShell; toasts positioned `top-center` on mobile

## Key Patterns
- Status color derivation: lifecycle% > 80 = oxblood, > 50 = saffron, else sea-green
- Tab styling: underline active tab with azure, uppercase tracking-wider text
- Empty states: plain text guiding user to next action, never cute/anthropomorphic
- Tone: direct, helpful, action-oriented — "DOBY" only in branding, not in copy

## Gotchas
- Zod v4 is installed — import from `zod/v4` not `zod`. The `@hookform/resolvers` zodResolver has type inference issues with `z.coerce`; prefer plain interfaces with `useForm<T>` for form types.
- No separate `tailwind.config.ts` — all theme tokens live in `globals.css` via `@theme inline` (Tailwind v4).
- Static export (`output: "export"`) means no API routes, no server-side rendering, no `next/image` optimization. Use `<img>` tags directly.
- Pages using `useSearchParams()` must wrap the consuming component in `<Suspense>` for static export compatibility.
