# Matriz de Permissões

Tabela de referência rápida. Mantida manualmente, derivada de 3 fontes: `reimbursement.policy.ts`, `reimbursement.routes.ts`, e `use-permissions.ts`.

## Ações por Role e Status

| Ação | EMPLOYEE | MANAGER | FINANCE | ADMIN |
|------|----------|---------|---------|-------|
| **Create** | DRAFT | ✗ | ✗ | ✗ |
| **Edit** | DRAFT próprio | ✗ | ✗ | ✗ |
| **Submit** | DRAFT próprio | ✗ | ✗ | ✗ |
| **Approve** | ✗ | SUBMITTED | ✗ | ✗ |
| **Reject** | ✗ | SUBMITTED | ✗ | ✗ |
| **Pay** | ✗ | ✗ | APPROVED | ✗ |
| **Cancel** | DRAFT/SUBMITTED próprio | ✗ | ✗ | ✗ |
| **Upload** | DRAFT próprio | ✗ | ✗ | ✗ |

## Visibilidade (getById / getHistory)

| Status | EMPLOYEE (dono) | MANAGER | FINANCE | ADMIN |
|--------|:---:|:---:|:---:|:---:|
| DRAFT | ✅ | ❌ | ❌ | ✅ |
| SUBMITTED | ✅ | ✅ | ❌ | ✅ |
| APPROVED | ✅ | ❌ | ✅ | ✅ |
| PAID | ✅ | ❌ | ❌ | ✅ |
| REJECTED | ✅ | ❌ | ❌ | ✅ |
| CANCELLED | ✅ | ❌ | ❌ | ✅ |

## Listagem (GET /reimbursements)

| Role | Default | Pode filtrar por | Categoria | Ordenação |
|------|---------|:---:|:---:|:---:|
| EMPLOYEE | próprios (todos) | DRAFT, SUBMITTED, APPROVED, PAID, REJECTED, CANCELLED | ✅ | createdAt, amount, expenseDate |
| MANAGER | SUBMITTED | sem filtros | ✅ | createdAt, amount, expenseDate |
| FINANCE | APPROVED | sem filtros | ✅ | createdAt, amount, expenseDate |
| ADMIN | todos | todos | ✅ | createdAt, amount, expenseDate |

## Estatísticas (GET /reimbursements/stats)

| Role | Campos retornados |
|------|-------------------|
| EMPLOYEE | `total`, `draft`, `submitted`, `approved`, `paid` |
| MANAGER | `pending`, `approvedThisMonth`, `rejectedThisMonth` |
| FINANCE | `pending`, `paidThisMonth`, `paidAmountThisMonth` ($) |
| ADMIN | `reimbursements`, `users`, `categories`, `pendingReview` |

## Gerenciamento (Users / Categories)

| Ação | ADMIN |
|------|:-----:|
| Create user | ✅ |
| List users | ✅ |
| Create category | ✅ |
| Update category | ✅ |
| List categories | ✅ (qualquer autenticado) |

## Status do Frontend (usePermissions)

Todas as verificações abaixo retornam `boolean` e são usadas para controle condicional de UI:

| Hook | Condição |
|------|----------|
| `canEdit(status, ownerId)` | `user.id === ownerId && status === 'DRAFT'` |
| `canSubmit(status, ownerId)` | `user.id === ownerId && status === 'DRAFT'` |
| `canCancel(status, ownerId)` | `user.id === ownerId && (status === 'DRAFT' \|\| status === 'SUBMITTED')` |
| `canUpload(ownerId, status)` | `user.id === ownerId && status === 'DRAFT'` |
| `canApprove(status)` | `role === 'MANAGER' && status === 'SUBMITTED'` |
| `canReject(status)` | `role === 'MANAGER' && status === 'SUBMITTED'` |
| `canPay(status)` | `role === 'FINANCE' && status === 'APPROVED'` |
| `isAdmin` | `role === 'ADMIN'` |
| `isEmployee` | `role === 'EMPLOYEE'` |
| `isManager` | `role === 'MANAGER'` |
| `isFinance` | `role === 'FINANCE'` |
| `isOwner(ownerId)` | `user.id === ownerId` |

## Arquivos Fonte

| Camada | Arquivo |
|--------|---------|
| Policy | `packages/backend/src/policies/reimbursement.policy.ts` |
| Rotas (guards) | `packages/backend/src/routes/reimbursement.routes.ts` |
| Frontend RBAC | `packages/frontend/src/hooks/use-permissions.ts` |
| Frontend tabs | `packages/frontend/src/components/reimbursements/StatusTabs.tsx` |
| Testes RBAC | `packages/frontend/tests/usePermissions.test.tsx` (21 testes) |
| Testes integração | `packages/backend/tests/reimbursements.test.ts` (38 testes) |
