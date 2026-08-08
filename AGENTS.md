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

No typecheck script exists. There are pre-existing lint errors (mostly `no-explicit-any` in test files) — do not introduce new ones. Type errors are caught by `bun run build` (runs TypeScript type checking).

## Git

- **Always ask for confirmation before creating any commit.** Present the diff and commit message draft, then wait for approval.

## Database (Prisma 5 + PostgreSQL)

- Migration (dev): `bunx prisma migrate dev`
- Deploy (prod): `bunx prisma migrate deploy`
- Seed: `bunx prisma db seed` (runs `tsx prisma/seed.ts`)
- Client regenerate: `bunx prisma generate` — **schema 变更后必须运行**，否则 `bun run build` 会因 stale 类型定义失败（生成的 client 不会自动跟随 schema 更新）
- DATABASE_URL goes in `.env` (also contains admin credentials — never commit)

Singleton client at `@/lib/prisma.ts`. Schema at `prisma/schema.prisma` (models: User, Account, AccountMember, Asset, Balance, Record, DailySnapshot, LoginHistory, ApiKey).

> **坑**: 若改了 `prisma/schema.prisma` 后 `bun run build` 报 "Object literal may only specify known properties" 之类类型错误，先 `bunx prisma generate` 再构建即可。

## Auth (custom, not next-auth)

- Auth context/provider at `@/lib/auth-context.tsx` — stores user in localStorage under key `geldborse_user`
- API auth:
  - `authenticateRequest(request, { requiredScope })` from `@/lib/auth` — 标准 API 路由鉴权，返回 `{ userId, scopes }` 或 `NextResponse` 错误，支持 scope 检查和 API Key
  - `getCurrentUserId(request)` — 轻量鉴权，仅验证 session token（优先 cookie，其次 Bearer），返回 `string | null`。用于无需 scope 检查的简单场景（如 auth 路由、工具函数）
  - Token 值即用户 ID（简化 JWT，payload 仅含 userId）
- Protected pages wrap content in `<ProtectedRoute>` component

## Project architecture

- Pages: `/app/` (App Router), flat routes: `/overview`, `/accounts`, `/record`, `/record/add`, `/snapshots`, `/export`, `/settings`, `/help`, `/auth/login`, `/auth/register`
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

## Vercel deployment

- **Prisma 事务超时**: 云数据库（Neon / Prisma Postgres）网络延迟高于本地，`prisma.$transaction(async (tx) => {...})` 交互事务默认超时 5s 在数据量大时可能失败。关键路由（如快照生成）已调至 `{ timeout: 15000 }`
- **Prisma client**: schema 变更后需确保 `bunx prisma generate` 在构建前运行（Vercel 会自动检测 Prisma 并运行，但本地构建需要手动执行）
- **Sentry**: 配置在 `next.config.ts`，`onRequestError` 自动捕获未处理异常。被 catch 接住的预期错误不上报，通过 Vercel Function Logs 查看

## IMPORTANT RULES

 - DO NOT RUN `bun run build` when you're done a small fix
- **API 错误处理**: API route handler 应使用 try/catch，返回 `{ error: "描述" }` + 对应 HTTP status code，避免未捕获异常导致模糊的 "Request failed"
  - 所有 catch 块必须绑定 `(error)` 并调用 `console.error("描述:", error)`，将原始异常写入 stderr — 这是 Vercel Function Logs 中唯一的错误来源
  - 被 catch 接住的错误**不上报 Sentry**（预期处理路径），未捕获的异常由 `Sentry.onRequestError` 自动捕获
  - 调试线上 API 错误时，查看 **Vercel → Project → Functions → Logs**，搜索 catch 中的错误描述即可找到原始 Prisma 异常堆栈
- **数据更新流程**: 前端修改数据时先调用 API，成功后更新本地 state 并全量刷新（如 `fetchAccounts()`）；失败时 toast 提示，本地 state 保持不变
- **Balance 备注**: 备注字段 `note String? @db.VarChar(20)`，前端 `Input` 限制 `maxLength={20}`，空备注存为 `null`