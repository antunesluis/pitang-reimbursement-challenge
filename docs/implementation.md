# Detalhes da Implementação

Baseado no [DESAFIO.md](../DESAFIO.md). Terminologia: spec usa português, código usa inglês.

---

## Stack Real

| Camada | Spec | Implementado |
|--------|------|-------------|
| Linguagem | JavaScript + TypeScript | TypeScript 6.0.3 |
| Backend | Node.js + Express.js | **Express 5** + Bun runtime |
| Validação | Zod | Zod 4 (body, params, query) |
| Autenticação | JWT | jsonwebtoken + bcryptjs |
| Banco de dados | Prisma ou Sequelize | **Prisma 7** + SQLite (libsql adapter) |
| Datas | DayJS ou Intl | DayJS |
| Testes backend | Jest + Supertest | **bun:test** + supertest (68 testes) |
| Frontend | React + Functional Components | **React 19** |
| Navegação | React Router | **TanStack Router** (file-based, search params) |
| Estado global | Context API | Context API (AuthContext) |
| UI | Chakra, Bootstrap, Material ou ShadcnUI | **Shadcn UI + Tailwind v4** |
| Testes frontend | Jest + React Testing Library | **bun:test** + jsdom + @testing-library/react (66 testes) |
| Consumo de API | Axios ou Fetch | **Fetch API** (wrapper em `lib/api.ts`) |
| Postman | Opcional | Collection com 33 requisições |

**Decisões técnicas** que diferem da spec:
- **Bun** em vez de Node.js — runtime + package manager, compatível com todo o ecossistema Node
- **TanStack Router** em vez de React Router — file-based routing, search params tipados, code-splitting automático
- **bun:test** em vez de Jest — mesmo padrão `describe/it/expect`, mais rápido, sem configuração
- **Prisma 7** em vez de Prisma 5/6 — exige `@prisma/adapter-libsql`, `prisma.config.ts`, geração em `prisma/src/generated/`

---

## Funcionalidades Obrigatórias do Backend

| # | Spec | Status | Detalhe |
|---|------|:---:|---------|
| 1 | API RESTful com Node.js, Express.js e TypeScript | ✅ | Express 5 + Bun + TS 6 |
| 2 | Login com JWT | ✅ | `POST /auth/login` → token 24h |
| 3 | Cadastro de usuário | ✅ | `POST /users` (ADMIN only) |
| 4 | Middleware de autenticação | ✅ | `auth.middleware.ts` — Bearer token, JWT verify, Prisma lookup |
| 5 | Middleware de permissão por perfil | ✅ | `role.middleware.ts` — `[Role.EMPLOYEE]`, `[Role.MANAGER]`, etc. |
| 6 | Validação body/params/query com Zod | ✅ | `validate.middleware.ts` + 6 schemas com `.strict()` |
| 7 | CRUD de categorias | ✅ | `POST/GET/PUT /categories` (ADMIN) |
| 8 | CRUD de solicitações de reembolso | ✅ | `POST/GET/PUT /reimbursements` + actions |
| 9 | Modelagem com Prisma | ✅ | 5 entidades: User, Category, Reimbursement, Attachment, History |
| 10 | Manipulação de datas com DayJS | ✅ | `isFutureDate()`, `getStats()` month ranges |
| 11 | Upload/listagem de anexos | ✅ | multer diskStorage, 5MB, PDF/JPG/PNG |
| 12 | Envio da solicitação | ✅ | `POST /:id/submit` — DRAFT → SUBMITTED |
| 13 | Aprovação de solicitação | ✅ | `POST /:id/approve` — SUBMITTED → APPROVED |
| 14 | Rejeição com justificativa | ✅ | `POST /:id/reject` — `rejectionReason` obrigatório |
| 15 | Marcação como pago | ✅ | `POST /:id/pay` — APPROVED → PAID |
| 16 | Listagem do histórico | ✅ | `GET /:id/history` — array com action, user, createdAt, observation |
| 17 | Tratamento adequado de erros HTTP | ✅ | `AppError` + `errorFallbackMiddleware` — 400/401/403/404/409/500 |
| 18 | Testes de integração | ✅ | 68 testes em 5 arquivos |

---

## Funcionalidades Obrigatórias do Frontend

| # | Tela | Status | Detalhe |
|---|------|:---:|---------|
| 1 | Login | ✅ | RHF + Zod onBlur, erro visual para credenciais inválidas |
| 2 | Cadastro | ✅ | RHF + Zod, valida name/email/password/role |
| 3 | Dashboard/Listagem | ✅ | Stats cards por role, tabela com loading/erro/vazio |
| 4 | Nova solicitação | ✅ | RHF + Zod, category select, attachment upload |
| 5 | Editar solicitação | ✅ | DRAFT only, preenchido com dados atuais |
| 6 | Detalhe da solicitação | ✅ | Ações condicionais, anexos, histórico |
| 7 | Histórico | ✅ | HistoryTimeline: avatar, ação, observação, data |
| 8 | Aprovação/Rejeição | ✅ | Botões no detalhe + RejectDialog com justificativa |
| 9 | Pagamento | ✅ | Botão no detalhe (FINANCE, APPROVED only) |
| 10 | Gestão de categorias | ✅ | Criar, renomear, toggle active |

### Comportamento visual (spec seção 13)

| Requisito | Status | Implementação |
|-----------|:---:|--------------|
| Exibir mensagens de erro visuais | ✅ | `FieldError` + `ErrorAlert` + `toast.error()` |
| Destacar campos inválidos | ✅ | `FieldError` inline em todos os 5 formulários (onBlur) |
| Exibir mensagens de sucesso | ✅ | `toast.success()` via sonner |
| Impedir ações não permitidas | ✅ | `usePermissions` — botões condicionais |
| Loading, erro, lista vazia | ✅ | `Delayed` (150ms skeleton), `ErrorAlert`, "No X found" no tbody |
| Redirecionar 401 para login | ✅ | `api.ts` → `setOnUnauthorized` → `window.location.href = "/"` |

---

## Entidades (spec seção 6)

| Spec (PT) | Implementado (EN) | Campos extras |
|-----------|-------------------|---------------|
| Usuário | User | `password` (bcrypt hashed) |
| Categoria | Category | `active` (boolean) |
| Solicitação de Reembolso | Reimbursement | `rejectionReason` (opcional) |
| Anexo | Attachment | `fileType` (mimetype) |
| Histórico da Solicitação | History | `observation` |

---

## Estados e Transições (spec seções 8, 12)

Todas as 6 transições foram implementadas:

| # | Origem → Destino | Status | Detalhe |
|---|-----------------|:---:|---------|
| 1 | RASCUNHO → ENVIADO | ✅ | `POST /:id/submit` (COLABORADOR dono) |
| 2 | ENVIADO → APROVADO | ✅ | `POST /:id/approve` (GESTOR) |
| 3 | ENVIADO → REJEITADO | ✅ | `POST /:id/reject` + `rejectionReason` (GESTOR) |
| 4 | APROVADO → PAGO | ✅ | `POST /:id/pay` (FINANCEIRO) |
| 5 | RASCUNHO → CANCELADO | ✅ | `POST /:id/cancel` (COLABORADOR dono) |
| 6 | ENVIADO → CANCELADO | ✅ | `POST /:id/cancel` (COLABORADOR dono) |

---

## Validações Obrigatórias (spec seção 11)

| # | Validação | Status | Onde |
|---|-----------|:---:|------|
| 1 | `valor` > 0 | ✅ | `z.number().positive()` (backend) |
| 2 | `dataDespesa` obrigatória | ✅ | `z.string().min(1)` (frontend), `z.coerce.date()` (backend) |
| 3 | `categoriaId` válido | ✅ | Prisma check + ativa |
| 4 | `status` válido | ✅ | Zod enum + `transitionStatus()` |
| 5 | `justificativaRejeicao` obrigatória | ✅ | `z.string().min(1)` (backend + frontend) |
| 6 | Usuário autenticado | ✅ | `auth.middleware.ts` |
| 7 | Permissão adequada | ✅ | `role.middleware.ts` + policy + `usePermissions` |
| 8 | Anexos tipo permitido | ✅ | multer `fileFilter`: PDF, JPG, PNG |
| 9 | Transições inválidas bloqueadas | ✅ | `transitionStatus()` → 400 |
| 10 | Email formato válido | ✅ | `z.string().email()` |
| 11 | Senha não em texto puro | ✅ | `bcrypt.hash(10)` |
| 12 | IDs inexistentes → 404 | ✅ | `findUnique` + `if (!x) throw AppError(404)` |

---

## Plus / Diferenciais (spec seção 17)

| # | Diferencial | Status | Detalhe |
|---|-------------|:---:|---------|
| 1 | Paginação | ✅ | `?page=1&limit=10` em `/users` e `/reimbursements` |
| 2 | Filtro por status | ✅ | `?status=DRAFT` com validação por role |
| 3 | Filtro por categoria | ✅ | `?categoryId=xyz` |
| 4 | Busca por colaborador | ❌ | |
| 5 | Ordenação por data ou valor | ✅ | `?sort=amount&order=desc` |
| 6 | Dashboard com totais | ✅ | `GET /reimbursements/stats` por role |
| 7 | Preview/download de anexos | ✅ | `target="_blank"` link + `express.static('/uploads')` |
| 8 | Soft delete | ❌ | |
| 9 | Seeds iniciais | ✅ | 4 users + 3 categories + sample |
| 10 | Collection do Postman | ✅ | 33 requests, 8 folders |
| 11 | Mais testes backend | ✅ | 70 testes |
| 12 | Mais testes frontend | ✅ | 66 testes |
| 13 | Consumo de API externa | ❌ | |
| 14 | Refresh token | ❌ | |
| 15 | Docker Compose | ✅ | `docker compose up --build` (dev, hot-reload) |
| 16 | Upload real de comprovantes | ✅ | multer diskStorage |
| 17 | Limite de valor configurável | ❌ | |
| 18 | Bloqueio de despesas futuras | ✅ | `isFutureDate()` → 400 |
| 19 | Bloqueio sem anexo acima de valor | ✅ | `ATTACHMENT_REQUIRED_THRESHOLD` (default 100) |

**Total: 14 de 19 diferenciais implementados**

---

## Decisões Arquiteturais

### Backend

| Decisão | Motivo |
|---------|--------|
| **Express 5** em vez de 4 | Async error handling nativo, sem `express-async-errors` |
| **AppError** + throw pattern | Controllers nunca chamam `res.status().json()` para erros — jogam `AppError` e o `errorFallbackMiddleware` formata a resposta. Elimina try-catch em 19 handlers |
| **reimbursement.policy.ts** | Single source of truth para RBAC — controllers e `use-permissions.ts` derivam da mesma lógica |
| **validatedQuery** em vez de `req.query` | Evita `req.query` readonly do Express, permite coerção de tipos do Zod |
| **`.strict()`** em todos os schemas | Rejeita campos desconhecidos — previne bugs silenciosos |
| **MANAGER → SUBMITTED, FINANCE → APPROVED** | Escopo reduzido por spec. Auditoria pós-ação (APPROVED/REJECTED/PAID) não acessível ao executor |
| **`findUnique` + early return** em vez de `findUniqueOrThrow` | Mensagens de erro customizadas |

### Frontend

| Decisão | Motivo |
|---------|--------|
| **TanStack Router** em vez de React Router | File-based routing, search params tipados (Zod), code-splitting automático |
| **Search params na URL** (`?page=1&sort=amount`) | Estado preservado em refresh/back/forward/compartilhamento. Paginação + filtros + ordenação tudo na URL |
| **`useRef` para loading inicial** | Evita flash de skeleton ao mudar filtro — dados antigos visíveis até novos chegarem |
| **ConfirmActionDialog + redirect** | Após approve/pay, role perde visibilidade — redirect evita tela de 403 |
| **Componentes extraídos de rotas** | Route files exportam apenas `Route` — code-splitting funciona, TanStack Router não reclama |
| **Inter 4 (Google Fonts)** | Legibilidade superior em tabelas e formulários |
| **Cor primária #F37021** (laranja Pitang) | Identidade visual da empresa |

---

## Entrega (spec seção 19)

| Item | Status | Detalhe |
|------|:---:|---------|
| Código fonte em repositório Git | ✅ | |
| README com instruções claras | ✅ | Raiz + `packages/backend/README.md` + `packages/frontend/README.md` |
| Usuários de teste | ✅ | 4 usuários no seed |
| Explicação das decisões técnicas | ✅ | Este documento + READMEs |
| Tecnologias da ementa utilizadas | ✅ | Todas, com adaptações documentadas |
| Collection do Postman | ✅ | `postman/` |
| Documentação de testes | ✅ | `docs/tests.md` |
| Documentação de fluxo | ✅ | `docs/flow.md` |
| Matriz de permissões | ✅ | `docs/permissions.md` |
