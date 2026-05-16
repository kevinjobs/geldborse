<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Geldborse — developer quick reference

## Commands (bun only, never npm)

| Action | Command |
|--------|---------|
| Dev server (port 8888) | `bun dev` |
| Build | `bun run build` |
| Lint | `bun run lint` |
| Test (all) | `bun test` |
| Test (single file) | `bun test path/to/file.test.ts` |
| Test (watch) | `bun test --watch` |
| Test coverage | `bun test --coverage` |
| Test UI | `bun test:ui` |

No typecheck script exists. There are pre-existing lint errors (mostly `no-explicit-any` in test files) — do not introduce new ones.

## Database (Prisma 5 + PostgreSQL)

- Migration (dev): `bunx prisma migrate dev`
- Deploy (prod): `bunx prisma migrate deploy`
- Seed: `bunx prisma db seed` (runs `tsx prisma/seed.ts`)
- Client regenerate: `bunx prisma generate`
- DATABASE_URL goes in `.env` (also contains admin credentials — never commit)

Singleton client at `@/lib/prisma.ts`. Schema at `prisma/schema.prisma` (models: User, Account, Asset, Balance, Record, DailySnapshot, LoginHistory).

## Auth (custom, not next-auth)

- Auth context/provider at `@/lib/auth-context.tsx` — stores user in localStorage under key `geldborse_user`
- API auth: `getCurrentUserId(request)` from `@/lib/auth` extracts Bearer token from `Authorization` header (the token value IS the user ID — simplified, no JWT)
- Protected pages wrap content in `<ProtectedRoute>` component

## Project architecture

- Pages: `/app/` (App Router), flat routes: `/overview`, `/accounts`, `/record`, `/record/add`, `/snapshots`, `/export`, `/settings`, `/auth/login`, `/auth/register`
- API routes: `/app/api/` — RESTful pattern, `route.ts` files, no tRPC
- Components: `/components/` (app-level) + `/components/ui/` (Shadcn)
- Lib: `/lib/` — utils, auth, prisma, account-config, account-logos
- Path alias `@/` maps to project root

## Visual design (governed by `DESIGN.md`)

- Dark mode default (`#121212` bg, `#1E1E1E` cards, `#2C2C2E` borders)
- Accent: `#00E5FF` (cyan), success: `#32D74B` (green), alert: `#FF453A` (red)
- Cards: `rounded-[16px]`, `20px` padding, `1px solid #2C2C2E` border
- Table rows: `border-b border-[#2C2C2E]`, hover `bg-[#252525]`
- Avoid pastel/white backgrounds
- Use `font-mono` (Fira Code) for numeric data, `font-heading` (Inter 24px Semi Bold) for titles
- `lib/account-config.tsx` has per-brand bank colors (legacy Tailwind classes, keep in sync with design)

## Tech stack quirks

- **Shadcn v4** — style `radix-mira`, icon library `phosphor`. Use `shadcn add` not manual copy.
- **Tailwind CSS v4** — uses `@tailwindcss/postcss`, CSS-first config via `@theme` in `globals.css`
- **Two icon sets** — `@phosphor-icons/react` (preferred, matches shadcn config) + `lucide-react` (secondary)
- **Recharts** for charts (already used in overview area chart). Chart.js is also installed.
- **Testing**: Vitest + jsdom, setup file at `test/setup.ts` (has manual window/document mocks), all mocks in setup
- **Mobile**: breakpoint 768px, `use-mobile.ts` hook available
- **Package registry**: `bunfig.toml` sets mirror to `registry.npmmirror.com`
- **Bun config**: `bunfig.toml` in root — only sets registry mirror
