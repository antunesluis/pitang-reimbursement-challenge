# AGENTS.md

## Monorepo

Bun workspaces (`packages/*`). Install from root:

```bash
bun install
```

## Commands

| What            | Command (from root)                              |
| --------------- | ------------------------------------------------ |
| Backend dev     | `bun run --cwd packages/backend dev`             |
| Backend test    | `bun run --cwd packages/backend test`            |
| Backend lint    | `bun run --cwd packages/backend lint`            |
| Frontend dev    | `bun run --cwd packages/frontend dev`            |
| Frontend build  | `bun run --cwd packages/frontend build`          |
| Frontend lint   | `bun run --cwd packages/frontend lint`           |
| Root lint       | `bun run lint` (runs eslint from root config)    |
| Root format     | `bun run format`                                 |
| Prisma migrate  | `bun run --cwd packages/backend prisma:migrate`  |
| Prisma generate | `bun run --cwd packages/backend prisma:generate` |
| Prisma studio   | `bun run --cwd packages/backend prisma:studio`   |
| Prisma seed     | `bun run --cwd packages/backend prisma:seed`     |

Root-level `index.ts` is a `bun init` leftover — not a real entrypoint.

## Architecture

```
packages/backend/               — Express 5 + Prisma 7 + SQLite (libsql)
  src/index.ts                  —   entrypoint (starts server)
  src/app.ts                    —   Express app (exported for supertest)
  src/lib/prisma.ts             —   PrismaClient singleton (libsql adapter)
  src/lib/env.vars.ts           —   Zod-validated env vars
  src/controllers/              —   route handlers
  src/routes/                   —   route wiring
  src/schemas/                  —   Zod validation schemas
  src/middlewares/              —   auth, role, validate, error fallback
  prisma/schema.prisma          —   data model
  prisma.config.ts              —   Prisma 7 config (datasource URL from env)
  tests/setup.ts                —   cleanupDatabase() + seedAdmin() + helpers
packages/frontend/              — Vite 8 + React 19 + TanStack Router + Shadcn UI
  src/main.tsx                  —   entrypoint
DESAFIO.md                      — full project spec (requirements, entities, rules)
```

Backend route prefix map:

- `/auth` → auth routes (`/login`, `/me`)
- `/users` → user routes (ADMIN only)
- `/categories` → category routes (ADMIN for POST/PUT, auth required for GET)
- `/reimbursements` → reimbursement routes (role-gated)

## Project spec — spec vs implementation terminology

DESAFIO.md uses Portuguese terms. The implementation uses **English** throughout. Key mappings:

| Spec (PT)   | Code (EN) | Context                 |
| ----------- | --------- | ----------------------- |
| COLABORADOR | EMPLOYEE  | User role (Prisma enum) |
| GESTOR      | MANAGER   | User role (Prisma enum) |
| FINANCEIRO  | FINANCE   | User role (Prisma enum) |
| ADMIN       | ADMIN     | Same in both            |
| RASCUNHO    | DRAFT     | Reimbursement status    |
| ENVIADO     | SUBMITTED | Reimbursement status    |
| APROVADO    | APPROVED  | Reimbursement status    |
| REJEITADO   | REJECTED  | Reimbursement status    |
| PAGO        | PAID      | Reimbursement status    |
| CANCELADO   | CANCELLED | Reimbursement status    |

These mappings are critical when reading DESAFIO.md or writing tests. The API field names are also English (`amount` not `valor`, `description` not `descricao`, etc.).

## Business rules (from DESAFIO.md)

### Status transitions (enforced in `reimbursement.controller.ts`)

```
DRAFT → SUBMITTED  (EMPLOYEE/owner, via POST /reimbursements/:id/submit)
SUBMITTED → APPROVED  (MANAGER, via POST /reimbursements/:id/approve)
SUBMITTED → REJECTED  (MANAGER, via POST /reimbursements/:id/reject, rejectionReason required)
APPROVED → PAID  (FINANCE, via POST /reimbursements/:id/pay)
DRAFT → CANCELLED  (EMPLOYEE/owner, via POST /reimbursements/:id/cancel)
SUBMITTED → CANCELLED  (EMPLOYEE/owner, via POST /reimbursements/:id/cancel)
```

No other transitions are valid. The `transitionStatus()` helper returns 400 for invalid transitions.

### Role-based access

- **EMPLOYEE**: create, edit (own DRAFT only), submit, cancel (own DRAFT/SUBMITTED), view own reimbursements, add attachments to own
- **MANAGER**: view SUBMITTED reimbursements, approve, reject (with reason)
- **FINANCE**: view APPROVED reimbursements, mark as PAID
- **ADMIN**: manage users (POST/GET `/users`), manage categories (POST/PUT `/categories`), view all reimbursements via getById

### Audit trail

Every status transition must create a History record (action + userId + observation + timestamp). The `recordHistory()` helper in `reimbursement.controller.ts` handles this. Actions: `CREATED`, `UPDATED`, `SUBMITTED`, `APPROVED`, `REJECTED`, `PAID`, `CANCELLED`.

### Validation rules

- `amount` must be > 0 (Zod schema enforces `.positive()`)
- `rejectionReason` is required when rejecting (Zod schema enforces `.min(1)`)
- Category must exist and be `active` to be used in a reimbursement
- Passwords are hashed with bcryptjs (see `seedAdmin()` in tests/setup.ts)
- JWT payload: `{ userId, email, role }`

## Prisma + SQLite

- **Prisma 7** uses driver adapters. Schema: `prisma/schema.prisma`, generated client output: `prisma/src/generated/prisma/`.
- **Must use `@prisma/adapter-libsql`**. `better-sqlite3` does NOT work in Bun (native addon — ERR_DLOPEN_FAILED).
- prisma.config.ts (Prisma 7) reads `DATABASE_URL` from env; Prisma commands must use `bunx --bun prisma`.
- Environment: copy `packages/backend/.env-example` to `packages/backend/.env`. `DATABASE_URL` must be a file path like `file:./dev.db`.
- Prisma enums define the canonical values (`Role`, `Status`, `Action`). Frontend mirrors them as const arrays in `src/types/index.ts`.

## TypeScript quirks

- **`verbatimModuleSyntax: true`** everywhere — type imports must use `import type { ... }`.
- **Frontend uses TS project references** — `tsc -b` via `tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`.
- **Frontend `erasableSyntaxOnly: true`** — no enums, namespaces, or parameter properties. Prisma enum values are used as string literals instead.
- **Two TS versions**: root/lock has TS 5.9.3; frontend workspace has TS ~6.0.2.

## ESLint + Prettier

Root `eslint.config.js` applies to the whole monorepo:

- **perfectionist** plugin enforces sorted imports, exports, object keys, interface keys, union types, JSX props.
- Imports sorted: side-effect → builtin → external → internal (`@/`) → parent/sibling/index → type.
- Frontend files also get react-hooks and react-refresh rules; route/context files suppress `only-export-components`.
- Prettier: tabs=4 spaces, single quotes, trailing commas, 80char width. Prettier-plugin-tailwindcss is active (sorts class names).

## Frontend stack

- **TanStack Router** with file-based routes in `src/routes/` and auto-code-splitting (NOT React Router).
- **Shadcn UI** + Tailwind CSS v4 (components in `src/components/ui/`).
- **Context API** for auth state (`src/contexts/auth.context.tsx`).
- **Fetch API** wrapper (`src/lib/api.ts`) — injects Bearer token from cookies, 401 redirect via `setOnUnauthorized`.
- **React Hook Form + Zod** for forms (`@hookform/resolvers`, `react-hook-form`, `zod`).
- **Cookies** (`js-cookie`) for token storage, not localStorage.
- **Path alias** `@/` → `src/` in both Vite and tsconfig.
- `VITE_API_URL` env var sets backend URL (defaults to `http://localhost:3000`).

## Backend patterns

- Validation: Zod schemas in `src/schemas/`, applied via `validate()` middleware supporting `body`, `params`, `query`. Validation errors return `{ errors: [...], message, statusCode: 400 }`.
- Auth: JWT middleware at `src/middlewares/auth.middleware.ts`, role guard at `src/middlewares/role.middleware.ts`.
- Env vars: validated at startup via Zod in `src/lib/env.vars.ts` (PORT, DATABASE_URL, JWT_SECRET, NODE_ENV).
- Port defaults to 3000.
- Error responses always include `{ message, statusCode }`. Validation errors add `{ errors: [...] }`.

## Testing

- **Bun test runner** (`bun:test`) + **supertest** against the Express app (`app` export from `src/app.ts`).
- Run: `bun run --cwd packages/backend test` (or `bun test` from the backend dir).
- 36 tests across 5 files: `tests/{auth,users,categories,reimbursements,attachments}.test.ts`.
- Tests share `dev.db` — `cleanupDatabase()` deletes all rows in order (history → attachments → reimbursements → categories → users); `seedAdmin()` creates admin user.
- Admin credentials in tests: `admin@example.com` / `admin123` (role: ADMIN).
- Helpers in `tests/setup.ts`: `getAdminToken()`, `loginAs()`, `createCategory()`.
- All API field names in tests are English (e.g. `amount`, `description`, `categoryId`, `expenseDate`, `rejectionReason`).

## Vite 8

Vite 8 uses **Rolldown** (not esbuild). The React plugin (`@vitejs/plugin-react`) uses Oxc, not Babel/SWC.

## Environment

Uses **Bun** as runtime and package manager. No npm/pnpm/yarn. `.env` is gitignored.
`type: "module"` in all package.json files — all code is ESM.
