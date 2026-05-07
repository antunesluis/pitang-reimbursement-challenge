# Frontend — Sistema de Controle de Reembolsos

SPA com React 19, TanStack Router, Shadcn UI + Tailwind CSS v4.

## Stack

| Tecnologia                         | Uso                                                  |
| ---------------------------------- | ---------------------------------------------------- |
| React 19                           | componentes funcionais, hooks                        |
| TanStack Router                    | roteamento file-based, search params, code-splitting |
| Shadcn UI + Tailwind v4            | componentes de UI, tema claro/escuro                 |
| React Hook Form + Zod              | formulários com validação onBlur                     |
| Context API                        | estado global de autenticação                        |
| Fetch API                          | chamadas HTTP (wrapper em `lib/api.ts`)              |
| js-cookie                          | armazenamento do token JWT                           |
| sonner                             | toasts de feedback                                   |
| bun:test + jsdom + Testing Library | testes de componentes                                |

## Comandos

```bash
bun run --cwd packages/frontend dev    # dev server (http://localhost:5173)
bun run --cwd packages/frontend build  # tsc + vite build (erros de tipo bloqueiam)
bun run --cwd packages/frontend test   # 41 testes com jsdom + testing-library
bun run --cwd packages/frontend lint   # ESLint
```

## Configuração

`VITE_API_URL` define a URL do backend (default: `http://localhost:3000`).

Crie `.env` se necessário:

```env
VITE_API_URL=http://localhost:3000
```

## Arquitetura

```
src/
  main.tsx                    entrypoint
  routes/                     file-based (TanStack Router)
  components/
    auth/                     LoginForm
    categories/               CategoriesPage, CategorySelect
    layout/                   AppSidebar, AppHeader, NotFound
    reimbursements/           StatusBadge, StatusTabs, HistoryTimeline,
                              RejectDialog, ConfirmActionDialog, AttachmentUpload
    shared/                   Delayed, ErrorAlert, FieldError, Pagination,
                              SortableHeader, StatsCard
    ui/                       Shadcn (button, card, dialog, input, table, etc.)
    users/                    NewUserPage
  contexts/                   AuthContext (JWT cookie, /me, login, logout)
  hooks/                      use-permissions (RBAC), use-breadcrumb
  lib/                        api.ts (Fetch wrapper + 401 redirect)
  schemas/                    Zod: auth, user, category, reimbursement
  services/                   auth, user, category, reimbursement, attachment
  types/                      Role, Status, Action const arrays + tipos TS
public/                       favicon, logo, insignia
tests/                        dom.ts, setup.tsx, helpers.tsx + 7 arquivos (41 testes)
```

## Telas

| Rota                       | Perfil   | Descrição                                   |
| -------------------------- | -------- | ------------------------------------------- |
| `/`                        | Público  | Login                                       |
| `/dashboard`               | Auth     | Cards de estatísticas + recentes (por role) |
| `/reimbursements`          | Auth     | List paginada com filtro/sort               |
| `/reimbursements/new`      | EMPLOYEE | Formulário de criação                       |
| `/reimbursements/$id`      | Auth     | Detalhe, ações, anexos, histórico           |
| `/reimbursements/$id/edit` | EMPLOYEE | Editar DRAFT próprio                        |
| `/users`                   | ADMIN    | Listar usuários                             |
| `/users/new`               | ADMIN    | Criar usuário                               |
| `/categories`              | ADMIN    | Gerenciar categorias                        |

## Funcionalidades

### Autenticação

- Login com RHF + Zod (onBlur)
- Token JWT armazenado em cookie (js-cookie)
- AuthContext expõe `user`, `login()`, `logout()`, `isAuthenticated`
- `api.ts` injeta Bearer token automaticamente e redireciona para `/` em 401

### RBAC (`use-permissions.ts`)

```ts
canEdit(status, ownerId)     → owner + DRAFT
canSubmit(status, ownerId)   → owner + DRAFT
canCancel(status, ownerId)   → owner + (DRAFT or SUBMITTED)
canUpload(ownerId, status)   → owner + DRAFT
canApprove(status)           → MANAGER + SUBMITTED
canReject(status)            → MANAGER + SUBMITTED
canPay(status)               → FINANCE + APPROVED
isAdmin, isEmployee, isManager, isFinance, isOwner
```

### Formulários

Todos os formulários usam React Hook Form + Zod com `mode: "onBlur"`:

- LoginForm — email + senha
- NewReimbursement — descrição, valor, data, categoria
- EditReimbursement — pré-preenchido com dados atuais
- RejectDialog — justificativa obrigatória
- CreateUser — nome, email, senha, role
- Categories — nome (com validação inline de rename)

### Listagem com filtros

```
/reimbursements?page=1&sort=amount&order=desc&status=DRAFT&categoryId=xyz
```

- `SortableHeader`: clique em Amount ou Date para ordenar
- `StatusTabs`: filtra por status (disponível conforme perfil)
- `CategorySelect`: filtra por categoria
- `Pagination`: navegação entre páginas
- Estado completo na URL (refresh, back/forward, compartilhamento preservam tudo)

### Detalhe e ações

- Diálogo de confirmação antes de approve, pay, cancel e submit
- Após approve/reject/pay, redireciona para listagem (perde visibilidade)
- Após submit, recarrega dados na página (mantém visibilidade)
- Reject exige justificativa via RejectDialog

### Feedback visual

| Estado              | Componente                              |
| ------------------- | --------------------------------------- |
| Loading inicial     | `Delayed` (150ms) → Skeleton            |
| Loading subsequente | dados antigos visíveis, troca sem flash |
| Erro                | `ErrorAlert`                            |
| Campo inválido      | `FieldError` (onBlur)                   |
| Ação concluída      | `toast.success()` (sonner)              |
| Tabela vazia        | "No reimbursements found" inline        |
| Não autorizado      | `ErrorAlert` + redirect 401             |

## Testes

41 testes em 10 arquivos com `bun:test` + `jsdom` + `@testing-library/react`:

| Arquivo                     | Testes                           | Cobertura |
| --------------------------- | -------------------------------- | --------- |
| `LoginForm.test.tsx`        | validação visual, botão submit   |
| `CreateUser.test.tsx`       | validação de campos              |
| `CreateCategory.test.tsx`   | validação de nome curto          |
| `AttachmentUpload.test.tsx` | renderização do componente       |
| `Delayed.test.tsx`          | não renderiza antes de 150ms     |
| `EmptyState.test.tsx`       | removido                         |
| `ErrorAlert.test.tsx`       | renderiza mensagem               |
| `FieldError.test.tsx`       | condicional (null se sem erro)   |
| `StatsCard.test.tsx`        | renderiza props                  |
| `StatusBadge.test.tsx`      | cores e textos por status        |
| `usePermissions.test.tsx`   | 20 testes de permissões por role |
