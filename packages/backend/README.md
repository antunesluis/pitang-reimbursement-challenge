# Backend — Sistema de Controle de Reembolsos

API REST com Express 5, Prisma 7 + SQLite (libsql), JWT e Zod.

## Stack

| Tecnologia           | Uso                            |
| -------------------- | ------------------------------ |
| Express 5            | servidor HTTP, middlewares     |
| Prisma 7 + libsql    | ORM + SQLite                   |
| Zod                  | validação de body/params/query |
| JWT (jsonwebtoken)   | autenticação stateless         |
| bcryptjs             | hash de senhas                 |
| multer               | upload de arquivos             |
| dayjs                | manipulação de datas           |
| bun:test + supertest | testes de integração           |

## Comandos

```bash
bun install                          # instalar dependências (da raiz)
bun run --cwd packages/backend dev   # iniciar servidor (http://localhost:3000)
bun run --cwd packages/backend test  # rodar 68 testes de integração
bun run --cwd packages/backend lint  # ESLint
```

### Prisma

```bash
bun run --cwd packages/backend prisma:migrate   # aplicar migrations
bun run --cwd packages/backend prisma:generate  # gerar cliente
bun run --cwd packages/backend prisma:seed      # popular banco
bun run --cwd packages/backend prisma:studio    # interface gráfica
```

## Configuração

Crie `.env` a partir do `.env-example`:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="change-me"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
```

## Seed

| Role     | Email             | Senha     |
| -------- | ----------------- | --------- |
| ADMIN    | admin@example.com | admin123  |
| EMPLOYEE | employee@test.com | secret123 |
| MANAGER  | manager@test.com  | secret123 |
| FINANCE  | finance@test.com  | secret123 |

3 categorias são criadas: Transporte, Alimentação, Material de Escritório.
1 reembolso DRAFT de exemplo.

## Arquitetura

```
src/
  index.ts                    entrypoint
  app.ts                      Express app
  controllers/                auth, user, category, reimbursement, attachment
  routes/                     wiring de rotas
  schemas/                    Zod: body, params, query
  policies/                   reimbursement.policy.ts (RBAC centralizado)
  middlewares/                auth JWT, role guard, validate, error fallback
  lib/                        Prisma client, env vars, AppError, upload (multer)
prisma/
  schema.prisma               modelo de dados
  seed.ts                     seed users + categories + sample
  migrations/
tests/                        setup.ts + 5 arquivos (68 testes)
```

## Endpoints

| Método | Rota                                                                      | Role     | Descrição                     |
| ------ | ------------------------------------------------------------------------- | -------- | ----------------------------- |
| POST   | `/auth/login`                                                             | Público  | Login → JWT                   |
| GET    | `/auth/me`                                                                | Auth     | Dados do usuário logado       |
| POST   | `/users`                                                                  | ADMIN    | Criar usuário                 |
| GET    | `/users?page=1&sort=name`                                                 | ADMIN    | Listar (paginado)             |
| POST   | `/categories`                                                             | ADMIN    | Criar categoria               |
| PUT    | `/categories/:id`                                                         | ADMIN    | Atualizar (nome, active)      |
| GET    | `/categories`                                                             | Auth     | Listar todas                  |
| POST   | `/reimbursements`                                                         | EMPLOYEE | Criar (DRAFT)                 |
| GET    | `/reimbursements?page=1&sort=amount&order=desc&status=DRAFT&categoryId=x` | Auth     | Listar (filtrado por perfil)  |
| GET    | `/reimbursements/stats`                                                   | Auth     | Dashboard por role            |
| GET    | `/reimbursements/:id`                                                     | Auth     | Detalhe                       |
| PUT    | `/reimbursements/:id`                                                     | EMPLOYEE | Editar (DRAFT próprio)        |
| POST   | `/reimbursements/:id/submit`                                              | EMPLOYEE | Enviar                        |
| POST   | `/reimbursements/:id/approve`                                             | MANAGER  | Aprovar                       |
| POST   | `/reimbursements/:id/reject`                                              | MANAGER  | Rejeitar (reason obrigatório) |
| POST   | `/reimbursements/:id/pay`                                                 | FINANCE  | Marcar pago                   |
| POST   | `/reimbursements/:id/cancel`                                              | EMPLOYEE | Cancelar (DRAFT/SUBMITTED)    |
| GET    | `/reimbursements/:id/history`                                             | Auth     | Histórico de ações            |
| POST   | `/reimbursements/:id/attachments`                                         | EMPLOYEE | Upload (multipart/form-data)  |
| GET    | `/reimbursements/:id/attachments`                                         | Auth     | Listar anexos                 |

### Query params (listagem)

| Param        | Valores                                               | Default      |
| ------------ | ----------------------------------------------------- | ------------ |
| `page`       | int > 0                                               | 1            |
| `limit`      | int 1..50                                             | 10           |
| `sort`       | `createdAt`, `amount`, `expenseDate`                  | `createdAt`  |
| `order`      | `asc`, `desc`                                         | `desc`       |
| `status`     | DRAFT, SUBMITTED, APPROVED, PAID, REJECTED, CANCELLED | role-default |
| `categoryId` | UUID                                                  | nenhum       |

## Estado de máquina

```
DRAFT ─submit→ SUBMITTED ─approve→ APPROVED ─pay→ PAID
  │                  │
  ├─cancel──▶ CANCELLED
  │                  └─reject→ REJECTED
  └─cancel──────────▶ (CANCELLED)
```

Cada transição gera um registro de histórico.

## Permissões

| Role     | List (default)   | canView          | Ações                                |
| -------- | ---------------- | ---------------- | ------------------------------------ |
| EMPLOYEE | próprios (todos) | próprios + ADMIN | create, edit, submit, cancel, upload |
| MANAGER  | SUBMITTED        | SUBMITTED        | approve, reject                      |
| FINANCE  | APPROVED         | APPROVED         | pay                                  |
| ADMIN    | todos            | todos            | users, categories, getById           |

As regras são centralizadas em `src/policies/reimbursement.policy.ts`.

## Respostas de erro

Formato consistente via `AppError`:

```json
{
    "error": "Bad Request",
    "message": "Category not found or inactive",
    "statusCode": 400
}
```

Erros de validação incluem array `errors`:

```json
{
    "error": "Bad Request",
    "errors": [
        { "field": "amount", "message": "Amount must be greater than zero" }
    ],
    "message": "Validation error",
    "statusCode": 400
}
```

Em desenvolvimento, erros inesperados incluem `message` do erro original.
Em produção, mostram apenas "Internal server error".

## Testes

68 testes em 5 arquivos com `bun:test` + `supertest`:

| Arquivo                  | Testes | Cobertura                                                                                                               |
| ------------------------ | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| `auth.test.ts`           | 7      | login, me, token inválido                                                                                               |
| `users.test.ts`          | 6      | CRUD, duplicate, role guard                                                                                             |
| `categories.test.ts`     | 8      | CRUD, duplicate, role guard, 404                                                                                        |
| `reimbursements.test.ts` | 38     | full cycle, reject, cancel, filters, sort, pagination, stats, view restrictions, invalid transitions, inter-role blocks |
| `attachments.test.ts`    | 9      | upload PDF/PNG, invalid type, no file, 404, non-DRAFT, non-owner                                                        |
