# Reimbursement Control System

Fullstack reimbursement management app — employees submit expenses, managers
approve/reject, finance marks as paid, and admins manage users and categories.

## Tech Stack

| Layer    | Technology                                               |
| -------- | -------------------------------------------------------- |
| Backend  | Express 5 + Prisma 7 + SQLite (libsql) + Zod             |
| Frontend | React 19 + TanStack Router + Shadcn UI + Tailwind        |
| Runtime  | Bun (package manager + runtime)                          |
| Auth     | JWT (jsonwebtoken) + bcryptjs                            |
| Testing  | bun:test + supertest (BE) / jsdom + testing-library (FE) |

## Quick Start

**Prerequisites:** [Bun](https://bun.com) >= 1.3

```bash
# 1. Install dependencies
bun install

# 2. Configure backend environment
cp packages/backend/.env-example packages/backend/.env

# 3. Create database and run migrations
bun run --cwd packages/backend prisma:migrate
bun run --cwd packages/backend prisma:generate

# 4. Seed the database (test users + categories)
bun run --cwd packages/backend prisma:seed

# 5. Start backend (http://localhost:3000)
bun run --cwd packages/backend dev

# 6. Start frontend (http://localhost:5173)
bun run --cwd packages/frontend dev
```

### Seed Users

| Role     | Email                | Password  |
| -------- | -------------------- | --------- |
| ADMIN    | admin@example.com    | admin123  |
| EMPLOYEE | employee@example.com | secret123 |
| MANAGER  | manager@example.com  | secret123 |
| FINANCE  | finance@example.com  | secret123 |

Override credentials via `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `EMPLOYEE_PASSWORD`,
`MANAGER_PASSWORD`, `FINANCE_PASSWORD`) and re-run `prisma:seed`.

## Commands

| What            | Command (from root)                              |
| --------------- | ------------------------------------------------ |
| Backend dev     | `bun run --cwd packages/backend dev`             |
| Backend test    | `bun run --cwd packages/backend test`            |
| Backend lint    | `bun run --cwd packages/backend lint`            |
| Frontend dev    | `bun run --cwd packages/frontend dev`            |
| Frontend build  | `bun run --cwd packages/frontend build`          |
| Frontend test   | `bun run --cwd packages/frontend test`           |
| Frontend lint   | `bun run --cwd packages/frontend lint`           |
| Prisma migrate  | `bun run --cwd packages/backend prisma:migrate`  |
| Prisma generate | `bun run --cwd packages/backend prisma:generate` |
| Prisma seed     | `bun run --cwd packages/backend prisma:seed`     |
| Prisma studio   | `bun run --cwd packages/backend prisma:studio`   |
| Root lint       | `bun run lint`                                   |
| Root format     | `bun run format`                                 |

## Architecture

```
packages/backend/
  src/
    index.ts                    Entrypoint (starts server)
    app.ts                      Express app (exported for supertest)
    controllers/                Route handlers (auth, user, category, reimbursement, attachment)
    routes/                     Route wiring
    schemas/                    Zod validation schemas
    middlewares/                Auth JWT, role guard, validation, error fallback
    lib/                        Prisma client, env vars, upload config, date utils
  prisma/
    schema.prisma               Data model (User, Category, Reimbursement, Attachment, History)
    seed.ts                     Seeds users + categories + sample reimbursement
  tests/                        Integration tests (52 tests, 5 files)

packages/frontend/
  src/
    main.tsx                    Entrypoint
    routes/                     File-based routing (_authenticated.tsx layout, dashboard, reimbursements, users, categories)
    components/                 domain-based: auth/, layout/, reimbursements/, categories/, shared/, ui/
    contexts/                   AuthContext (cookie-based JWT, /me validation)
    hooks/                      use-permissions.ts, use-breadcrumb.ts
    lib/                        api.ts (Fetch wrapper with 401 redirect)
    services/                   API service functions
    types/                      Shared types and constants
  tests/                        45 component/form/permission tests (11 files)
```

## API Endpoints

| Method | Path                                            | Role     | Description            |
| ------ | ----------------------------------------------- | -------- | ---------------------- |
| POST   | `/auth/login`                                   | Public   | Login, returns JWT     |
| GET    | `/auth/me`                                      | Auth     | Current user info      |
| POST   | `/users`                                        | ADMIN    | Create user            |
| GET    | `/users`                                        | ADMIN    | List users (paginated) |
| POST   | `/categories`                                   | ADMIN    | Create category        |
| PUT    | `/categories/:id`                               | ADMIN    | Update category        |
| GET    | `/categories`                                   | Auth     | List categories        |
| POST   | `/reimbursements`                               | Auth     | Create reimbursement   |
| GET    | `/reimbursements`                               | Auth     | List (role-filtered)   |
| GET    | `/reimbursements/stats`                         | Auth     | Dashboard statistics   |
| GET    | `/reimbursements/:id`                           | Auth     | Get by ID              |
| PUT    | `/reimbursements/:id`                           | Auth     | Update (own DRAFT)     |
| POST   | `/reimbursements/:id/submit`                    | EMPLOYEE | Submit for approval    |
| POST   | `/reimbursements/:id/approve`                   | MANAGER  | Approve                |
| POST   | `/reimbursements/:id/reject`                    | MANAGER  | Reject (reason needed) |
| POST   | `/reimbursements/:id/pay`                       | FINANCE  | Mark as paid           |
| POST   | `/reimbursements/:id/cancel`                    | EMPLOYEE | Cancel own             |
| POST   | `/reimbursements/:id/attachments`               | Auth     | Upload file            |
| GET    | `/reimbursements/:id/attachments/:attachmentId` | Auth     | Download file          |

## Status Machine

```
DRAFT ──submit─▶ SUBMITTED ──approve─▶ APPROVED ──pay─▶ PAID
  │                 │
  └─cancel──┐       ├──reject─▶ REJECTED
            │       │
            │       └─cancel──┐
            ▼                 ▼
          CANCELLED ◀────────┘
```

Every transition creates an audit history record (action, user, observation, timestamp).

## Business Rules

- **EMPLOYEE**: create, edit own DRAFT, submit, cancel own DRAFT/SUBMITTED, view own, upload attachments
- **MANAGER**: view SUBMITTED, approve, reject (with mandatory reason)
- **FINANCE**: view APPROVED, mark as PAID
- **ADMIN**: manage users, manage categories, view any reimbursement by ID
- **Validation**: amount > 0, category must be active, future expense dates blocked, rejection reason required
- **Pagination**: `?page=1&limit=10` on `/reimbursements` and `/users`

## Testing

```bash
# Backend — 52 integration tests
bun run --cwd packages/backend test

# Frontend — 45 component/form/permission tests
bun run --cwd packages/frontend test

# Run a single backend test file
bun run --cwd packages/backend test tests/auth.test.ts
```

Backend tests share the dev database — each test cleans up and re-seeds admin.
Frontend tests run against jsdom with preload scripts for DOM globals and React helpers.
