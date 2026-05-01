# Desafio Técnico | Controle de Solicitações de Reembolso

> **Pitang** — React + Node.js | Estágio

---

## Sumário

1. [Visão geral do desafio](#1-visão-geral-do-desafio)
2. [Stack e tecnologias obrigatórias](#2-stack-e-tecnologias-obrigatórias)
3. [Restrições e itens fora de escopo](#3-restrições-e-itens-fora-de-escopo)
4. [Contexto do sistema](#4-contexto-do-sistema)
5. [Perfis de usuário](#5-perfis-de-usuário)
6. [Entidades do sistema](#6-entidades-do-sistema)
7. [Entidade Histórico da Solicitação](#7-entidade-histórico-da-solicitação)
8. [Status possíveis da solicitação](#8-status-possíveis-da-solicitação)
9. [Ações possíveis no histórico](#9-ações-possíveis-no-histórico)
10. [Regras de negócio detalhadas](#10-regras-de-negócio-detalhadas)
11. [Validações obrigatórias](#11-validações-obrigatórias)
12. [Transições de status](#12-transições-de-status)
13. [Tratamento de erros e boas práticas de API](#13-tratamento-de-erros-e-boas-práticas-de-api)
14. [Funcionalidades obrigatórias do backend](#14-funcionalidades-obrigatórias-do-backend)
15. [Funcionalidades obrigatórias do frontend](#15-funcionalidades-obrigatórias-do-frontend)
16. [Endpoints sugeridos](#16-endpoints-sugeridos)
17. [Plus / diferenciais](#17-plus--diferenciais)
18. [Critérios de avaliação](#18-critérios-de-avaliação)
19. [Entrega esperada](#19-entrega-esperada)

---

## 1. Visão geral do desafio

O objetivo deste desafio é construir uma aplicação fullstack para controle de solicitações de reembolso. A aplicação deve permitir que colaboradores criem pedidos, gestores aprovem ou rejeitem solicitações e o financeiro marque solicitações aprovadas como pagas.

O escopo foi ajustado para avaliar os conteúdos ensinados na ementa do curso: JavaScript, TypeScript, Node.js, Express, APIs RESTful, status HTTP, middlewares, JWT, Zod, ORM, manipulação de datas, testes, React, Hooks, React Router, Context API e bibliotecas de UI.

> **Importante:** As regras devem ser implementadas de forma clara, objetiva e sem ambiguidades. Sempre que uma ação for bloqueada, a API deve retornar o status HTTP adequado e o frontend deve exibir uma mensagem visual compreensível para o usuário.

**Pilares do desafio:**

- **Backend:** Node.js, Express, TypeScript, API RESTful, JWT, middlewares, Zod, ORM e status HTTP corretos.
- **Frontend:** React com Functional Components, React Router, Context API, UI library, formulários e tratamento visual de estados.
- **Boas práticas:** Jest, Supertest, React Testing Library, organização de código, tratamento de exceções e mensagens claras.

---

## 2. Stack e tecnologias obrigatórias

Para manter o desafio alinhado ao conteúdo ensinado durante o curso, os candidatos devem usar as tecnologias abaixo. O objetivo é avaliar exatamente os conhecimentos trabalhados em aula, evitando stacks muito diferentes ou soluções prontas que fujam da proposta.

| Camada              | Tecnologia esperada                                      | O que deve ser avaliado                                                                                                 |
| ------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Linguagem           | JavaScript e TypeScript                                  | Uso correto de tipos, objetos, arrays, funções, estruturas de controle, tratamento de exceções e organização do código. |
| Backend             | Node.js + Express.js                                     | Criação de API RESTful, rotas, controllers, middlewares, métodos HTTP e status codes adequados.                         |
| Validação           | Zod                                                      | Validação de body, params e query params antes de executar regras de negócio.                                           |
| Autenticação        | JWT                                                      | Login, geração de token, middleware de autenticação e proteção de rotas privadas.                                       |
| Banco de dados      | Prisma ou Sequelize                                      | Modelagem das entidades, relacionamentos, migrations/estrutura inicial e consultas básicas.                             |
| Datas               | DayJS ou Intl                                            | Manipulação e exibição correta de datas como data da despesa, criação, atualização e histórico.                         |
| Testes backend      | Jest + Supertest                                         | Testes de integração para rotas principais, autenticação, validações e regras de negócio.                               |
| Frontend            | React com Functional Components                          | Componentização, props, useState, useEffect, Hooks seguros e separação de responsabilidades.                            |
| Navegação           | React Router                                             | Rotas públicas, rotas privadas, navegação entre listagem, cadastro, edição, detalhe e login.                            |
| Estado global       | Context API                                              | Controle de usuário autenticado, token, perfil e permissões no frontend.                                                |
| UI e estilos        | Chakra UI, Bootstrap, Material UI ou ShadcnUI + SCSS/CSS | Uso consistente de componentes visuais, formulários, feedbacks, layout responsivo e design system básico.               |
| Testes frontend     | Jest + React Testing Library                             | Testes de componentes, formulários, renderização condicional por perfil e mensagens de erro.                            |
| Consumo de API      | Axios ou Fetch API                                       | Integração do frontend com a API, tratamento de loading, sucesso, erro e autenticação.                                  |
| Teste manual de API | Postman                                                  | Opcionalmente entregar collection ou documentação simples das rotas para facilitar avaliação.                           |

> O desafio não exige tecnologias avançadas além da ementa. A avaliação deve priorizar clareza, funcionamento correto, validações, permissões, tratamento de erros e organização do código.

---

## 3. Restrições e itens fora de escopo

Para evitar ambiguidades, os itens abaixo não devem ser exigidos como obrigatórios. Eles podem aparecer apenas como diferencial, desde que o candidato implemente primeiro o fluxo principal.

| Item                            | Orientação                                                                | Motivo                                                                          |
| ------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Upload real em storage externo  | Não obrigatório. Pode salvar apenas nome, tipo e URL simulada do arquivo. | Storage externo não foi foco da ementa.                                         |
| Refresh token                   | Não obrigatório. Pode ser considerado plus.                               | A ementa cobre JWT, mas não necessariamente fluxo completo de renovação.        |
| Docker Compose                  | Não obrigatório. Pode ser considerado plus.                               | Não consta como conteúdo central da ementa.                                     |
| Arquiteturas complexas          | Não exigir Clean Architecture, DDD ou microsserviços.                     | O foco é API REST, Express, validações, ORM, React e boas práticas básicas.     |
| Bibliotecas avançadas de estado | Preferir Context API. Jotai pode ser aceito, mas não deve ser exigido.    | Context API foi explicitamente ensinado.                                        |
| Integrações externas reais      | Não obrigatório. Pode haver consumo simples de API externa como plus.     | Foi ensinado consumo de APIs externas, mas o núcleo do desafio é CRUD e regras. |

> O candidato não deve ser penalizado por não implementar itens fora da ementa. A pontuação principal deve estar nos fundamentos: REST, JWT, RBAC, Zod, ORM, React, formulários, rotas, Context API e tratamento de erros.

---

## 4. Contexto do sistema

O sistema deve seguir o fluxo principal abaixo:

1. **Solicitação:** O colaborador cadastra uma solicitação de reembolso informando categoria, descrição, valor, data da despesa e anexos quando necessário.
2. **Análise:** O gestor visualiza solicitações enviadas e pode aprovar ou rejeitar. Em caso de rejeição, a justificativa é obrigatória.
3. **Pagamento:** O financeiro visualiza solicitações aprovadas e marca como pagas. Solicitações pagas não podem mais ser alteradas.

---

## 5. Perfis de usuário

Cada usuário deve possuir exatamente um perfil. O perfil define quais ações ele pode executar no sistema.

| Perfil        | Permissões esperadas                                                                                      | Restrições importantes                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `COLABORADOR` | Cria solicitações, edita solicitações próprias enquanto permitido e visualiza suas próprias solicitações. | Não pode aprovar, rejeitar, pagar ou visualizar solicitações de outros colaboradores.                                    |
| `GESTOR`      | Visualiza solicitações enviadas, aprova solicitações e rejeita solicitações com justificativa.            | Não pode marcar solicitações como pagas.                                                                                 |
| `FINANCEIRO`  | Visualiza solicitações aprovadas e marca solicitações aprovadas como pagas.                               | Não pode aprovar, rejeitar ou editar solicitações de reembolso.                                                          |
| `ADMIN`       | Gerencia usuários, gerencia categorias e pode visualizar dados gerais do sistema.                         | Não substitui automaticamente o papel operacional de gestor ou financeiro, salvo se o candidato documentar essa decisão. |

---

## 6. Entidades do sistema

O candidato deve modelar, no mínimo, as entidades abaixo.

### Usuário

- id
- nome
- email
- senha
- perfil
- criadoEm
- atualizadoEm

### Categoria

- id
- nome
- ativo
- criadoEm
- atualizadoEm

### Solicitação de Reembolso

- id
- solicitanteId
- categoriaId
- descricao
- valor
- dataDespesa
- status
- justificativaRejeicao
- criadoEm
- atualizadoEm

### Anexo

- id
- solicitacaoId
- nomeArquivo
- urlArquivo
- tipoArquivo
- criadoEm

### Histórico da Solicitação

- id
- solicitacaoId
- usuarioId
- acao
- observacao
- criadoEm

---

## 7. Entidade Histórico da Solicitação

Toda ação importante executada em uma solicitação deve gerar um registro de histórico. O histórico funciona como uma trilha de auditoria e deve permitir entender o que aconteceu, quem fez, quando fez e qual foi a observação associada.

> Todo registro de histórico deve armazenar: **quem fez**, **qual ação foi realizada**, **em qual momento** e **alguma observação sobre a ação**.

### Exemplos obrigatórios

```json
// Quando uma solicitação for aprovada:
{
  "solicitacaoId": "id-da-solicitacao",
  "usuarioId": "id-do-gestor-logado",
  "acao": "APPROVED",
  "criadoEm": "data/hora atual",
  "observacao": "Solicitação aprovada pelo gestor"
}

// Quando uma solicitação for paga:
{
  "solicitacaoId": "id-da-solicitacao",
  "usuarioId": "id-do-financeiro-logado",
  "acao": "PAID",
  "criadoEm": "data/hora atual",
  "observacao": "Pagamento realizado pelo financeiro"
}
```

---

## 8. Status possíveis da solicitação

| Status      | Descrição                                                              | Pode editar?                                                         |
| ----------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `RASCUNHO`  | Solicitação criada, mas ainda não enviada para análise.                | Sim, apenas pelo colaborador dono da solicitação.                    |
| `ENVIADO`   | Solicitação enviada para análise do gestor.                            | Não deve ser editada, salvo se o candidato justificar outra decisão. |
| `APROVADO`  | Solicitação aprovada pelo gestor.                                      | Não.                                                                 |
| `REJEITADO` | Solicitação rejeitada pelo gestor, obrigatoriamente com justificativa. | Não.                                                                 |
| `PAGO`      | Solicitação aprovada e marcada como paga pelo financeiro.              | Não.                                                                 |
| `CANCELADO` | Solicitação cancelada pelo colaborador, se ainda permitido.            | Não.                                                                 |

---

## 9. Ações possíveis no histórico

| Ação        | Quando registrar                                                                  |
| ----------- | --------------------------------------------------------------------------------- |
| `CREATED`   | Quando uma solicitação de reembolso for criada.                                   |
| `UPDATED`   | Quando uma solicitação em RASCUNHO for alterada pelo colaborador dono.            |
| `SUBMITTED` | Quando uma solicitação mudar de RASCUNHO para ENVIADO.                            |
| `APPROVED`  | Quando um gestor aprovar uma solicitação ENVIADA.                                 |
| `REJECTED`  | Quando um gestor rejeitar uma solicitação ENVIADA, com justificativa obrigatória. |
| `PAID`      | Quando o financeiro marcar uma solicitação APROVADA como PAGA.                    |
| `CANCELED`  | Quando o colaborador cancelar uma solicitação própria, se o status permitir.      |

---

## 10. Regras de negócio detalhadas

As regras abaixo devem ser implementadas de forma explícita no backend. O frontend também deve refletir essas restrições, escondendo ou desabilitando ações quando possível.

| Entidade                 | Ação                | Regra obrigatória                                                                                                                     | Perfil permitido | Erro esperado                                                                                     |
| ------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------- |
| Solicitação de Reembolso | Criar               | O valor deve ser maior que zero, a data da despesa é obrigatória e a categoria deve existir e estar ativa.                            | COLABORADOR      | 400 para campos inválidos; 401 se não autenticado.                                                |
| Solicitação de Reembolso | Editar              | O colaborador só pode editar solicitações próprias e apenas enquanto estiverem em status RASCUNHO.                                    | COLABORADOR      | 403 se não for dono; 400 se o status não permitir edição; 404 se não existir.                     |
| Solicitação de Reembolso | Enviar para análise | Apenas solicitações em RASCUNHO podem ser enviadas. Após envio, o status deve mudar para ENVIADO e gerar histórico SUBMITTED.         | COLABORADOR dono | 400 para transição inválida; 403 se não for dono; 404 se não existir.                             |
| Solicitação de Reembolso | Aprovar             | Apenas solicitações com status ENVIADO podem ser aprovadas. Ao aprovar, o status deve mudar para APROVADO e gerar histórico APPROVED. | GESTOR           | 403 para perfil inválido; 400 para status inválido; 404 se não existir.                           |
| Solicitação de Reembolso | Rejeitar            | Apenas solicitações com status ENVIADO podem ser rejeitadas. A justificativa de rejeição é obrigatória.                               | GESTOR           | 400 se faltar justificativa ou status for inválido; 403 para perfil inválido; 404 se não existir. |
| Solicitação de Reembolso | Marcar como paga    | Apenas solicitações com status APROVADO podem ser pagas. Ao pagar, o status deve mudar para PAGO e gerar histórico PAID.              | FINANCEIRO       | 403 para perfil inválido; 400 se não estiver aprovada; 404 se não existir.                        |
| Solicitação de Reembolso | Cancelar            | O colaborador só pode cancelar solicitações próprias em RASCUNHO. Opcionalmente, pode cancelar ENVIADO se a regra for documentada.    | COLABORADOR dono | 400 para status inválido; 403 se não for dono; 404 se não existir.                                |
| Categoria                | Criar/editar        | Categorias devem possuir nome obrigatório. Uma categoria inativa não pode ser usada em novas solicitações.                            | ADMIN            | 400 para campos inválidos; 403 para perfil inválido; 404 ao editar categoria inexistente.         |
| Categoria                | Usar em solicitação | A categoria informada em uma solicitação deve existir e estar ativa.                                                                  | COLABORADOR      | 400 para categoria inválida ou inativa.                                                           |
| Anexo                    | Upload              | O anexo deve estar vinculado a uma solicitação existente. Tipos permitidos devem ser definidos (ex.: PDF, JPG e PNG).                 | COLABORADOR dono | 404 se a solicitação não existir; 400 para tipo inválido; 403 se não for dono.                    |
| Histórico da Solicitação | Registrar ação      | Toda ação relevante deve gerar histórico contendo solicitação, usuário, ação, data/hora e observação.                                 | Sistema          | A ausência de histórico será considerada falha de implementação.                                  |

> **Atenção:** Não é aceitável retornar sucesso para ações inválidas. Exemplo: tentar pagar uma solicitação ENVIADA deve retornar erro, e não simplesmente ignorar a ação ou responder 200.

---

## 11. Validações obrigatórias

- `valor` deve ser maior que zero.
- `dataDespesa` é obrigatória.
- `categoriaId` deve ser válido.
- `status` deve ser válido.
- `justificativaRejeicao` é obrigatória ao rejeitar.
- Usuário autenticado é obrigatório para rotas privadas.
- Permissão adequada deve ser validada em cada ação.
- Anexos devem ter tipo de arquivo permitido.
- Transições inválidas de status devem ser bloqueadas.
- E-mail de usuário deve ter formato válido.
- Senha não deve ser salva em texto puro.
- IDs inexistentes devem retornar 404.

---

## 12. Transições de status

O sistema deve respeitar o fluxo abaixo. Transições fora desse fluxo devem ser bloqueadas.

| Origem   | Destino   | Ação                                           | Quem pode fazer  |
| -------- | --------- | ---------------------------------------------- | ---------------- |
| RASCUNHO | ENVIADO   | Enviar para análise                            | COLABORADOR dono |
| ENVIADO  | APROVADO  | Aprovar                                        | GESTOR           |
| ENVIADO  | REJEITADO | Rejeitar com justificativa                     | GESTOR           |
| APROVADO | PAGO      | Marcar como pago                               | FINANCEIRO       |
| RASCUNHO | CANCELADO | Cancelar                                       | COLABORADOR dono |
| ENVIADO  | CANCELADO | Cancelar, se permitido pela regra implementada | COLABORADOR dono |

---

## 13. Tratamento de erros e boas práticas de API

Além das funcionalidades principais, serão avaliadas boas práticas de backend e frontend, incluindo respostas HTTP coerentes, mensagens claras e tratamento visual dos erros na interface.

| Cenário                      | Status HTTP esperado        | Exemplo                                                                              |
| ---------------------------- | --------------------------- | ------------------------------------------------------------------------------------ |
| Campos inválidos             | `400 Bad Request`           | Valor menor ou igual a zero, data vazia, categoria inválida, justificativa ausente.  |
| Usuário não autenticado      | `401 Unauthorized`          | Token JWT ausente, inválido ou expirado.                                             |
| Usuário sem permissão        | `403 Forbidden`             | Colaborador tentando aprovar, gestor tentando pagar ou financeiro tentando rejeitar. |
| Recurso não encontrado       | `404 Not Found`             | Solicitação, usuário, categoria ou anexo inexistente.                                |
| Transição de status inválida | `400 Bad Request`           | Tentar pagar uma solicitação ENVIADA ou rejeitar uma solicitação PAGA.               |
| Erro inesperado              | `500 Internal Server Error` | Erro não tratado no servidor.                                                        |

### Formato sugerido de resposta de erro

```json
{
    "message": "Categoria não encontrada ou inativa",
    "statusCode": 400,
    "error": "Bad Request"
}
```

### Comportamento esperado no frontend

- Exibir mensagens de erro de forma visual e clara para o usuário.
- Destacar campos inválidos nos formulários.
- Exibir mensagens de sucesso após ações concluídas.
- Impedir ações não permitidas na interface quando possível.
- Tratar estados de carregamento, erro e lista vazia.
- Não deixar erros técnicos aparecerem de forma crua para o usuário final.
- Redirecionar para login quando o token estiver ausente ou expirado.

---

## 14. Funcionalidades obrigatórias do backend

- API RESTful com Node.js, Express.js e TypeScript.
- Login com JWT.
- Cadastro de usuário.
- Middleware de autenticação.
- Middleware de permissão por perfil.
- Validação de body, params e query params com Zod.
- CRUD de categorias.
- CRUD de solicitações de reembolso.
- Modelagem com Prisma ou Sequelize.
- Manipulação de datas com DayJS ou Intl.
- Upload/listagem simples de anexos, podendo ser simulado.
- Envio da solicitação.
- Aprovação de solicitação.
- Rejeição com justificativa.
- Marcação como pago.
- Listagem do histórico da solicitação.
- Tratamento adequado de erros HTTP.
- Testes de integração com Jest e Supertest para rotas principais.

---

## 15. Funcionalidades obrigatórias do frontend

O frontend deve ser implementado em React usando Functional Components, Hooks, React Router para navegação e Context API para autenticação/perfil. Para UI, o candidato pode usar Chakra UI, Bootstrap, Material UI, ShadcnUI ou SCSS/CSS próprio.

| Tela                   | Objetivo                                                                        | Cuidados esperados                                                                             |
| ---------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Login                  | Autenticar usuário, salvar token e atualizar o contexto global de autenticação. | Exibir erro para credenciais inválidas.                                                        |
| Cadastro               | Criar usuário.                                                                  | Validar campos obrigatórios e e-mail.                                                          |
| Dashboard/Listagem     | Listar solicitações conforme o perfil usando chamada à API com Axios ou Fetch.  | Exibir loading, erro e estado vazio.                                                           |
| Nova solicitação       | Criar solicitação de reembolso.                                                 | Validar valor, data, categoria e descrição no frontend e tratar erros retornados pelo backend. |
| Editar solicitação     | Editar solicitação própria em RASCUNHO.                                         | Bloquear edição quando o status não permitir.                                                  |
| Detalhe da solicitação | Visualizar dados completos, anexos e status.                                    | Mostrar ações disponíveis conforme perfil e status.                                            |
| Histórico              | Visualizar trilha de auditoria.                                                 | Exibir ação, usuário, data/hora e observação.                                                  |
| Aprovação/Rejeição     | Permitir ação do gestor.                                                        | Exigir justificativa ao rejeitar.                                                              |
| Pagamento              | Permitir marcação como pago pelo financeiro.                                    | Permitir apenas solicitações APROVADAS.                                                        |
| Gestão de categorias   | Admin cria, edita e inativa categorias.                                         | Não permitir uso de categoria inativa em novas solicitações.                                   |

---

## 16. Endpoints sugeridos

| Método | Rota                              | Descrição                                      |
| ------ | --------------------------------- | ---------------------------------------------- |
| POST   | `/auth/login`                     | Autentica usuário e retorna token JWT.         |
| POST   | `/users`                          | Cria usuário.                                  |
| GET    | `/users`                          | Lista usuários. Recomendado para ADMIN.        |
| GET    | `/categories`                     | Lista categorias.                              |
| POST   | `/categories`                     | Cria categoria. Recomendado para ADMIN.        |
| PUT    | `/categories/:id`                 | Atualiza categoria. Recomendado para ADMIN.    |
| GET    | `/reimbursements`                 | Lista solicitações conforme perfil do usuário. |
| POST   | `/reimbursements`                 | Cria solicitação de reembolso.                 |
| GET    | `/reimbursements/:id`             | Detalha solicitação específica.                |
| PUT    | `/reimbursements/:id`             | Edita solicitação quando permitido.            |
| POST   | `/reimbursements/:id/submit`      | Envia solicitação para análise.                |
| POST   | `/reimbursements/:id/approve`     | Aprova solicitação enviada.                    |
| POST   | `/reimbursements/:id/reject`      | Rejeita solicitação enviada com justificativa. |
| POST   | `/reimbursements/:id/pay`         | Marca solicitação aprovada como paga.          |
| GET    | `/reimbursements/:id/history`     | Lista histórico da solicitação.                |
| POST   | `/reimbursements/:id/attachments` | Faz upload de anexo.                           |
| GET    | `/reimbursements/:id/attachments` | Lista anexos da solicitação.                   |

---

## 17. Plus / diferenciais

Os itens abaixo não são obrigatórios, mas serão considerados diferenciais positivos desde que o fluxo principal esteja funcionando.

- Paginação.
- Filtro por status.
- Filtro por categoria.
- Busca por colaborador.
- Ordenação por data ou valor.
- Dashboard com totais.
- Preview/download de anexos.
- Soft delete.
- Seeds iniciais.
- Collection do Postman.
- Mais testes automatizados no backend.
- Mais testes automatizados no frontend.
- Consumo simples de API externa para demonstrar Axios/Fetch, desde que não atrapalhe o escopo principal.
- Refresh token.
- Docker Compose.
- Upload real de comprovantes.
- Limite de valor configurável por categoria.
- Bloqueio de despesas futuras.
- Bloqueio de solicitação sem anexo acima de determinado valor.

> Docker, refresh token e upload real não fazem parte do escopo obrigatório. Eles só devem contar como diferencial, não como critério eliminatório.

---

## 18. Critérios de avaliação

| Critério                   | O que será observado                                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| Modelagem de dados         | Entidades, relacionamentos, campos obrigatórios e coerência da estrutura.                 |
| CRUD funcionando           | Criação, leitura, atualização e listagem das entidades principais.                        |
| Autenticação JWT           | Login, proteção de rotas e identificação do usuário logado.                               |
| Express e REST             | Uso correto de rotas, controllers, middlewares, métodos HTTP e status codes.              |
| Zod                        | Validação clara de body, params e query antes das regras de negócio.                      |
| ORM                        | Uso adequado de Prisma ou Sequelize para persistência e relacionamentos.                  |
| RBAC                       | Controle correto de permissões por perfil.                                                |
| Validações                 | Validação de campos obrigatórios, tipos, regras e transições.                             |
| Regras de negócio          | Aplicação correta das regras por entidade, ação, status e perfil.                         |
| Histórico/auditoria        | Registro correto de quem fez, qual ação, quando e observação.                             |
| Tratamento de erros da API | Uso correto de 400, 401, 403, 404 e 500, com mensagens claras.                            |
| Tratamento visual de erros | Exibição de erros, validações, feedbacks de sucesso, loading e estados vazios.            |
| Organização do código      | Separação de responsabilidades, legibilidade, nomes claros e estrutura consistente.       |
| Interface funcional        | Telas usáveis, ações coerentes, formulários claros e navegação simples.                   |
| React Router e Context API | Rotas públicas/privadas, controle de usuário logado, perfil e permissões no frontend.     |
| Testes                     | Testes mínimos com Jest, Supertest e/ou React Testing Library cobrindo fluxos relevantes. |
| Clareza da entrega         | README, instruções de execução e dados de teste.                                          |

---

## 19. Entrega esperada

O candidato deve entregar:

- Código fonte em repositório Git.
- README com instruções claras.
- Script ou instrução para rodar o projeto.
- Informações de usuários de teste.
- Explicação das decisões técnicas.
- Informar quais tecnologias da ementa foram utilizadas.
- Opcional: collection do Postman para facilitar testes da API.
- Lista do que foi implementado e do que ficou pendente, se houver.

> A entrega será melhor avaliada se uma pessoa avaliadora conseguir clonar o projeto, rodar localmente e testar os principais fluxos sem precisar pedir explicações adicionais.

---

_Pitang — Desafio Técnico | React + Node.js | Controle de Solicitações de Reembolso_
