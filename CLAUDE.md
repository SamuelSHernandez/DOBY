# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (also runs TypeScript checks)
npm run lint         # ESLint
npm run start        # Serve production build
```

No test runner is configured yet. Use `npm run build` as the primary correctness check (includes TypeScript type checking).

## Architecture

Doby is a local-first home management SPA built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4. All data persists in localStorage via Zustand — no backend, no auth, no API routes.

### State Management
- **Single Zustand store** at `src/store/index.ts` with `persist` middleware (localStorage key: `doby-store`)
- Types in `src/store/types.ts`, defaults/presets in `src/store/defaults.ts`
- Store has CRUD actions for: rooms, inventory, wishlist, systems, expenses, utilities, projects, contractors, documents
- All components access store via `useDobyStore` hook

### Routing
- `/` redirects to `/home`
- `/home` — Room cards grid with floor tabs
- `/home/[roomId]` — Room detail with Inventory/Wishlist/Materials/Systems tabs
- `/systems` — Systems dashboard with lifecycle tracking
- `/finances` — Sub-tabs: Overview/Mortgage/Expenses/Insurance/Property
- `/upkeep` — Sub-tabs: Seasonal/Projects/Utilities
- `/reference` — Sub-tabs: Emergency/Contractors/Documents
- `/setup` — Onboarding wizard (stub)

### Navigation
- Desktop (≥md): Fixed left sidebar 200px (`Sidebar.tsx`)
- Mobile (<md): Top bar + fixed bottom nav (`MobileNav.tsx`)
- Wrapped by `AppShell.tsx` in root layout

### Utility Libraries
- `src/lib/mortgage.ts` — Amortization calculation, equity, home value
- `src/lib/dates.ts` — Date formatting helpers (date-fns)
- `src/lib/formatters.ts` — Currency, percent, dimensions formatting
- `src/lib/constants.ts` — Nav items, blueprint scaling, ID generation via `crypto.randomUUID()`

## Design System

Dark-only, utilitarian aesthetic. IBM Plex Mono exclusively.

- **Square corners everywhere** (all radius vars = 0px)
- **No shadows, gradients, or blurs** — flat rendering only
- **Colors:** carbon (#1C1D21), panel (#222327), surface (#28292e), azure (#3083DC), sea-green (#058C42), saffron (#FE9000), oxblood (#95190C)
- **Typography:** Uppercase for labels/headers, weight 400 body / 600 data / 700 stats
- Tailwind theme defined via `@theme inline` in `globals.css` (Tailwind v4 pattern, no tailwind.config.ts)
- shadcn/ui components in `src/components/ui/` — customized via CSS variable mappings in globals.css

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
