# Fluxo da Aplicação

## Modelo de Comunicação

A aplicação segue uma arquitetura cliente-servidor com comunicação via HTTP REST. O
frontend (React + TanStack Router) consome a API do backend (Express 5) usando Fetch
API com tokens JWT enviados via header `Authorization: Bearer <token>`. O token é
armazenado em cookie (js-cookie) e injetado automaticamente pelo wrapper `api.ts`.

Toda resposta de erro do backend segue o formato:

```json
{ "error": "Bad Request", "message": "...", "statusCode": 400 }
```

No frontend, erros são capturados pelo wrapper `api.ts` que os converte para instâncias
de `ApiError`. O status 401 dispara automaticamente um redirect para `/` (login).

## Ciclo de Vida de um Reembolso

### 1. Criação

Um EMPLOYEE acessa `/reimbursements/new` e preenche o formulário com descrição,
valor, data da despesa e categoria. O formulário usa React Hook Form + Zod com
validação `onBlur`. Cada campo inválido mostra uma mensagem de erro inline.

Ao submeter, o frontend envia `POST /reimbursements` com o corpo validado. O
backend valida novamente via Zod, verifica que a categoria existe e está ativa,
confirma que a data não é futura, e cria o registro com status `DRAFT`. Um
registro de histórico com ação `CREATED` é gerado. A resposta retorna o
reembolso criado com status 201.

Enquanto o reembolso está em `DRAFT`, o EMPLOYEE dono pode editá-lo
(`PUT /reimbursements/:id`) e anexar arquivos (`POST /reimbursements/:id/attachments`).
Cada edição gera um histórico `UPDATED`.

### 2. Envio para Análise

O EMPLOYEE clica "Submit for Review" na página de detalhe. Um diálogo de
confirmação é exibido alertando que a edição será bloqueada. Ao confirmar, o
frontend chama `POST /reimbursements/:id/submit`.

O backend verifica que o reembolso está em `DRAFT` e que o usuário é o dono.
O status muda para `SUBMITTED` e um histórico `SUBMITTED` é gerado. Após o
envio, o frontend recarrega os dados na página — o EMPLOYEE ainda pode ver o
reembolso pois é o dono, mas os botões de edição desaparecem.

### 3. Análise do Gestor

Um MANAGER acessa `/reimbursements`. Por padrão, a listagem mostra apenas
reembolsos com status `SUBMITTED`. A URL reflete o estado da busca:
`/reimbursements?page=1&sort=createdAt&order=desc`.

Ao clicar em um reembolso, o MANAGER vê os detalhes em `/reimbursements/$id`.
A página mostra os dados completos e oferece dois botões: **Approve** e **Reject**.

#### Aprovação

O MANAGER clica "Approve". Um diálogo de confirmação avisa que após aprovar o
reembolso não será mais visível. Ao confirmar, o frontend chama
`POST /reimbursements/:id/approve`.

O backend verifica que o usuário tem perfil `MANAGER` e que o status é
`SUBMITTED`. O status muda para `APPROVED`, um histórico `APPROVED` é gerado, e
o frontend redireciona para `/reimbursements`. O MANAGER não vê mais esse
reembolso pois seu escopo é apenas `SUBMITTED`.

#### Rejeição

O MANAGER clica "Reject". Um diálogo com campo de texto exige a justificativa.
O formulário é validado com Zod — o campo `rejectionReason` não pode estar
vazio. Ao submeter, o frontend chama `POST /reimbursements/:id/reject` com a
justificativa no corpo.

O backend valida a justificativa, confirma que o status é `SUBMITTED` e que o
perfil é `MANAGER`. O status muda para `REJECTED`, a justificativa é salva, um
histórico `REJECTED` é gerado, e o frontend redireciona para `/reimbursements`.

### 4. Pagamento

Um FINANCE acessa `/reimbursements`. Por padrão, a listagem mostra apenas
reembolsos com status `APPROVED`.

Ao clicar em um reembolso e clicar "Mark as Paid", um diálogo de confirmação
avisa que após o pagamento o reembolso não será mais visível. Ao confirmar, o
frontend chama `POST /reimbursements/:id/pay`.

O backend verifica que o perfil é `FINANCE` e o status é `APPROVED`. O status
muda para `PAID`, um histórico `PAID` é gerado, e o frontend redireciona. O
FINANCE não vê mais o reembolso pois seu escopo é apenas `APPROVED`.

### 5. Cancelamento

A qualquer momento enquanto o reembolso está em `DRAFT` ou `SUBMITTED`, o
EMPLOYEE dono pode cancelá-lo. O botão "Cancel" na página de detalhe abre um
diálogo de confirmação. Ao confirmar, o backend muda o status para `CANCELLED`
e gera histórico. O EMPLOYEE continua podendo ver o reembolso cancelado pois é
o dono.

## Fluxo de Autenticação

O login acontece em uma única chamada: `POST /auth/login` com email e senha.
O backend busca o usuário no banco, compara a senha com bcrypt, e retorna um
token JWT (válido por 24h) com payload `{ userId, email, role }`.

O frontend armazena o token em cookie via js-cookie e o injeta automaticamente
em todas as chamadas subsequentes via header `Authorization: Bearer <token>`.

A validação do token acontece em duas camadas:

1. **Backend** — `auth.middleware.ts` extrai o token, verifica a assinatura JWT,
   busca o usuário no banco e popula `req.user` com `{ id, email, name, role }`.
   Se o token for inválido ou expirado, retorna 401.

2. **Frontend** — `AuthContext` chama `GET /auth/me` ao carregar para validar o
   token. Se falhar, redireciona para `/`. O `api.ts` também detecta respostas
   401 e dispara o callback `onUnauthorized` que limpa o cookie e redireciona.

## Fluxo de Permissão

A verificação de permissão opera em três níveis independentes que se complementam:

**1. Middleware de rota (backend)** — `roleMiddleware([Role.MANAGER])` bloqueia
a requisição antes que o controller execute. Por exemplo, um EMPLOYEE tentando
`POST /:id/approve` recebe 403 antes mesmo do controller rodar.

**2. Policy (backend)** — `reimbursement.policy.ts` centraliza as regras em
um único arquivo. Controllers como `getById` e `getHistory` chamam `canView()`
para verificar se o usuário atual pode acessar um reembolso específico. As
ações `submit`, `cancel`, `approve`, `reject` e `pay` também passam pela policy
para verificar ownership e status.

**3. RBAC no frontend** — `use-permissions.ts` expõe funções booleanas como
`canEdit(status, ownerId)` e `canApprove(status)`. Componentes usam essas
funções para condicionar a renderização de botões e links, prevenindo que o
usuário veja ações que não pode executar.

## Fluxo de Erro

Quando um controller detecta uma condição de erro, ele lança `throw new AppError(statusCode, message)`.
O Express 5 captura automaticamente a exceção de handlers async e a passa para o
`errorFallbackMiddleware`, que formata a resposta no padrão `{ error, message, statusCode }`.

Erros de validação (Zod) incluem o array `errors` com cada campo e sua mensagem.
Em ambiente de desenvolvimento, erros inesperados (500) mostram a mensagem real
do erro. Em produção, mostram apenas "Internal server error".

No frontend, o wrapper `api.ts` intercepta a resposta. Se o status for `4xx`
ou `5xx`, lança um `ApiError` com a mensagem e status code. Os componentes
capturam esse erro e exibem via `toast.error()` (sonner) ou `setError()` para
exibição inline.

## Dashboard e Estatísticas

`GET /reimbursements/stats` retorna dados agregados que variam por perfil:

- **EMPLOYEE** vê contagens de seus reembolsos por status (total, drafts, submitted, approved, paid).
- **MANAGER** vê a fila pendente (`SUBMITTED`) e os totais aprovados e rejeitados no mês atual.
- **FINANCE** vê a fila pendente (`APPROVED`), quantos pagou no mês e o valor total pago.
- **ADMIN** vê totais globais do sistema: reembolsos, usuários, categorias e pendentes de revisão.

No frontend, a página `/dashboard` carrega as estatísticas e os 5 reembolsos
mais recentes em paralelo. Se o perfil for EMPLOYEE, também mostra um botão
"New Reimbursement".

## Listagem com Filtros

A página `/reimbursements` exibe uma tabela paginada com filtros interativos.
O estado completo (página, ordenação, filtros) é mantido nos search params da
URL via TanStack Router. Isso significa que:

- Clicar em uma coluna (ex: Amount) atualiza a URL para `?sort=amount&order=desc`
- Selecionar um status nos tabs atualiza para `?status=DRAFT`
- Escolher uma categoria atualiza para `?categoryId=xyz`
- Mudar de página atualiza `?page=2`
- Ao alterar qualquer filtro, a página reseta para 1

No primeiro carregamento, a página mostra um skeleton de loading. Em navegações
subsequentes (mudança de filtro ou página), os dados antigos permanecem visíveis
até os novos chegarem — sem flash de skeleton.

## Máquina de Estados do Backend

O reembolso possui 6 estados possíveis. Cada transição entre estados é validada
pela função `transitionStatus()` que consulta o estado atual no banco e compara
com o estado esperado. Transições fora da sequência resultam em erro 400.

As transições válidas são: `DRAFT → SUBMITTED`, `SUBMITTED → APPROVED`,
`SUBMITTED → REJECTED`, `APPROVED → PAID`, `DRAFT → CANCELLED` e
`SUBMITTED → CANCELLED`. Toda transição gera um registro na tabela `History`
com o usuário que executou a ação, a ação realizada, o timestamp e uma
observação descritiva.

## Visibilidade por Perfil e Status

Nem todo perfil pode ver um reembolso em qualquer status. A função `canView()`
em `reimbursement.policy.ts` determina a visibilidade:

- O **dono** do reembolso sempre pode vê-lo, independente do status.
- O **ADMIN** sempre pode ver qualquer reembolso.
- O **MANAGER** pode ver apenas reembolsos com status `SUBMITTED`. Após aprovar
  ou rejeitar, o reembolso sai do seu escopo e não é mais visível.
- O **FINANCE** pode ver apenas reembolsos com status `APPROVED`. Após marcar
  como pago, o reembolso sai do seu escopo e não é mais visível.

Isso se aplica tanto à listagem (`GET /reimbursements`) quanto ao detalhe
(`GET /reimbursements/:id`), ao histórico (`GET /reimbursements/:id/history`)
e aos anexos (`GET /reimbursements/:id/attachments`).
