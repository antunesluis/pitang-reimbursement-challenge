# AGENTS.md

## Monorepo

Bun workspaces (`packages/*`). Install everything from root:

```bash
bun install
```

## Commands

| What           | Command (from root)                       |
| -------------- | ----------------------------------------- |
| Backend dev    | `bun run --cwd packages/backend index.ts` |
| Frontend dev   | `bun run --cwd packages/frontend dev`     |
| Frontend build | `bun run --cwd packages/frontend build`   |
| Frontend lint  | `bun run --cwd packages/frontend lint`    |

The backend now has scripts defined; run `bun run --cwd packages/backend dev` instead.
Root-level `index.ts` is a `bun init` leftover — not a real entrypoint.

## Architecture

```
packages/backend/        — Express 5 + Prisma 7 + SQLite (libsql)
  src/index.ts           —   entrypoint
  src/prisma.ts           —   PrismaClient singleton
packages/frontend/       — Vite 8 + React 19
  src/main.tsx           —   entrypoint
DESAFIO.md               — full project spec/requirements
```

## Prisma + SQLite

- **Prisma 7** uses driver adapters to connect. Schema: `prisma/schema.prisma`, client output: `prisma/src/generated/prisma/`.
- **Use `@prisma/adapter-libsql`** for SQLite in Bun. `@prisma/adapter-better-sqlite3` / `better-sqlite3` does **NOT** work in Bun (native addon — ERR_DLOPEN_FAILED).
- Migration commands: `bun run --cwd packages/backend prisma:migrate`, `prisma:generate`, `prisma:studio`.
- Environment: copy `.env-example` to `.env` and fill values (DATABASE_URL must point to a file path, e.g. `file:./dev.db`).

## TypeScript quirks

- **All configs use `verbatimModuleSyntax: true`** — type imports must use `import type { ... }`.
- **Frontend uses TS project references** — build runs `tsc -b` (references in `tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`).
- **Frontend `erasableSyntaxOnly: true`** — no enums, namespaces, or non-erasable TS syntax.
- **Two TS versions in use**: root/bun.lock shows TS 5.9.3; frontend workspace has its own TS 6.0.3.
- **Backend `tsconfig.json`** has `jsx: "react-jsx"` (copy-paste artifact from root). Backend doesn't use JSX — if you extend it, remove that line.

## Vite 8

Vite 8 uses **Rolldown** (not esbuild) as its bundler. The React plugin (`@vitejs/plugin-react`) uses Oxc, not Babel/SWC.

## Testing

No test framework configured yet. Do not try to run test commands.

## Environment

Uses **Bun** as runtime and package manager. No npm/pnpm/yarn. `.env` is gitignored.
`type: "module"` in all package.json files — all code is ESM.
