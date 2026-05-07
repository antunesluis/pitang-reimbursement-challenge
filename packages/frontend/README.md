# Frontend — Sistema de Controle de Reembolsos

SPA com React 19, TanStack Router, Shadcn UI + Tailwind CSS v4.

## Stack

| Tecnologia | Uso |
|-----------|-----|
| React 19 | componentes funcionais, hooks |
| TanStack Router | roteamento file-based, search params, code-splitting |
| Shadcn UI + Tailwind v4 | componentes de UI, tema claro/escuro |
| React Hook Form + Zod | formulários com validação onBlur |
| Context API | estado global de autenticação |
| Fetch API | chamadas HTTP (wrapper em `lib/api.ts`) |
| js-cookie | armazenamento do token JWT |
| sonner | toasts de feedback |
| bun:test + jsdom + Testing Library | testes de componentes |

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
  main.tsx                      entrypoint
  index.css                     Tailwind v4 base + Inter font + CSS variables
  routeTree.gen.ts              gerado pelo TanStack Router plugin
  routes/
    __root.tsx
    index.tsx                   login page
    _authenticated.tsx          layout: sidebar + header + loading skeleton
    _authenticated/
      dashboard.tsx             stats cards por role + recentes
      reimbursements/
        index.tsx               list com sort, filtro status, filtro categoria, paginação
        new.tsx                 formulário de criação
        $id/
          index.tsx             detalhe com ações, anexos, histórico
          edit.tsx              edição (DRAFT apenas)
      users/
        index.tsx               list
        new.tsx                 formulário de criação
      categories/
        index.tsx               list, criar, renomear, toggle active
  components/
    auth/
      LoginForm.tsx             formulário RHF + Zod
    categories/
      CategoriesPage.tsx        gestão de categorias
      CategorySelect.tsx        select de categorias ativas
    layout/
      AppHeader.tsx             breadcrumb
      AppSidebar.tsx            navegação, avatar, logout
      NotFound.tsx              404
    reimbursements/
      AttachmentUpload.tsx      upload de arquivos
      ConfirmActionDialog.tsx   diálogo de confirmação (aprove/pay/cancel/submit)
      HistoryTimeline.tsx       trilha de auditoria
      RejectDialog.tsx          diálogo com justificativa
      StatusBadge.tsx           badge colorido por status
      StatusTabs.tsx            tabs de filtro por status
    shared/
      Delayed.tsx               evita flash de skeleton (< 150ms)
      ErrorAlert.tsx            banner de erro
      FieldError.tsx            erro inline de campo
      Pagination.tsx            navegação entre páginas
      SortableHeader.tsx        cabeçalho de tabela clicável com seta ▲/▼
      StatsCard.tsx             card com ícone, label e valor
    ui/                         componentes Shadcn (button, card, dialog, input, etc.)
    users/
      NewUserPage.tsx           formulário de criação de usuário
  contexts/
    auth.context.tsx            AuthContext (token em cookie, /me, login, logout)
  hooks/
    use-breadcrumb.ts           breadcrumb via route staticData
    use-permissions.ts          RBAC: canEdit, canApprove, canPay, etc.
  lib/
    api.ts                      wrapper Fetch (Bearer token, 401 redirect)
    cookies.ts                  js-cookie helpers
    utils.ts                    cn() de tailwind-merge + clsx
  schemas/
    auth.schema.ts              login
    user.schema.ts              create user
    category.schema.ts          create/update category
    reimbursement.schema.ts     create/update/reject reimbursement
  services/
    auth.service.ts
    user.service.ts
    category.service.ts
    reimbursement.service.ts
    attachment.service.ts
  styles/
    globals.css                 custom properties, @theme, @layer
  types/
    index.ts                    Role, Status, Action const arrays + tipos TS
public/
  favicon.ico
  insigna-pitang.png            watermark na tela de login
  logo_sem_texto_pitang.png     logo na sidebar
tests/
  dom.ts                        jsdom globals preload
  setup.tsx                     React helpers preload
  helpers.tsx                   mockAuthProvider
  AttachmentUpload.test.tsx
  CreateCategory.test.tsx
  CreateUser.test.tsx
  Delayed.test.tsx
  ErrorAlert.test.tsx
  FieldError.test.tsx
  LoginForm.test.tsx
  StatsCard.test.tsx
  StatusBadge.test.tsx
  usePermissions.test.tsx
```

## Telas

| Rota | Perfil | Descrição |
|------|--------|-----------|
| `/` | Público | Login |
| `/dashboard` | Auth | Cards de estatísticas + recentes (por role) |
| `/reimbursements` | Auth | List paginada com filtro/sort |
| `/reimbursements/new` | EMPLOYEE | Formulário de criação |
| `/reimbursements/$id` | Auth | Detalhe, ações, anexos, histórico |
| `/reimbursements/$id/edit` | EMPLOYEE | Editar DRAFT próprio |
| `/users` | ADMIN | Listar usuários |
| `/users/new` | ADMIN | Criar usuário |
| `/categories` | ADMIN | Gerenciar categorias |

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

| Estado | Componente |
|--------|-----------|
| Loading inicial | `Delayed` (150ms) → Skeleton |
| Loading subsequente | dados antigos visíveis, troca sem flash |
| Erro | `ErrorAlert` |
| Campo inválido | `FieldError` (onBlur) |
| Ação concluída | `toast.success()` (sonner) |
| Tabela vazia | "No reimbursements found" inline |
| Não autorizado | `ErrorAlert` + redirect 401 |

## Testes

41 testes em 10 arquivos com `bun:test` + `jsdom` + `@testing-library/react`:

| Arquivo | Testes | Cobertura |
|---------|--------|-----------|
| `LoginForm.test.tsx` | validação visual, botão submit |
| `CreateUser.test.tsx` | validação de campos |
| `CreateCategory.test.tsx` | validação de nome curto |
| `AttachmentUpload.test.tsx` | renderização do componente |
| `Delayed.test.tsx` | não renderiza antes de 150ms |
| `EmptyState.test.tsx` | removido |
| `ErrorAlert.test.tsx` | renderiza mensagem |
| `FieldError.test.tsx` | condicional (null se sem erro) |
| `StatsCard.test.tsx` | renderiza props |
| `StatusBadge.test.tsx` | cores e textos por status |
| `usePermissions.test.tsx` | 20 testes de permissões por role |
