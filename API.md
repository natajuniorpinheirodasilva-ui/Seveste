# Documentação da API - Seveste

[🇧🇷 Português](#-português) | [🇺🇸 English](#-english)

---

## Português

Esta documentação descreve os endpoints disponíveis na API do projeto Seveste, indicando os métodos HTTP, as rotas, a necessidade de autenticação e uma breve descrição de cada funcionalidade.

### Autenticação

O login devolve um token JWT (válido por 6 horas) e também o grava em um cookie `httpOnly` chamado `seveste_token`.
As rotas autenticadas aceitam o token tanto pelo cabeçalho `Authorization: Bearer <token>` quanto pelo cookie.
O front-end usa o cookie: ele acessa a API através do proxy do Next.js (`/api/*` → API), então o navegador nunca precisa ler o token.

As rotas são registradas **sem barra no final** (ex.: `/api/v1/doacoes`).

### Valores aceitos

| Campo | Valores |
| :--- | :--- |
| `tipo` (usuário) | `doador`, `acolhido` |
| `categoria` (doação) | `roupas`, `agasalhos`, `calcados`, `acessorios`, `infantil` |
| `condicao` (doação) | `novo`, `usado_excelente`, `usado_marcas` |
| `tipo_de_entrega` (doação) | `levar` (o doador leva até o acolhido), `frete` (envio por frete) |
| `status` (doação) | `disponivel`, `doada` (gerenciado pelo sistema) |
| `status` (solicitação) | `PENDENTE`, `ACEITA`, `RECUSADA` (gerenciado pelo sistema) |

## Endpoints da API

### 1. Usuários e Autenticação
| Método | Endpoint | Autenticação | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/usuarios` | Não | Cadastra um novo usuário. Exige endereço completo (`rua`, `numero`, `cidade`, `uf`; `complemento` opcional), `aceite_privacidade: true` e senha com 8+ caracteres. Já inicia a sessão. |
| `POST` | `/api/v1/login` | Não | Realiza o login, retorna o token JWT e grava o cookie de sessão. |
| `POST` | `/api/v1/logout` | Não | Apaga o cookie de sessão. |
| `GET` | `/api/v1/usuarios` | Não | Lista os usuários (somente dados públicos). |
| `GET` | `/api/v1/usuarios/:id` | Não | Perfil público e estatísticas de um usuário. |
| `GET` | `/api/v1/usuarios/:id/avaliacoes` | Não | Avaliações recebidas por um usuário e a média das notas. |
| `GET` | `/api/v1/usuarios/me` | Sim | Dados completos do usuário logado, incluindo o endereço. |
| `GET` | `/api/v1/usuarios/me/dados` | Sim | Exporta todos os dados pessoais do usuário logado em JSON (LGPD). |
| `PATCH` | `/api/v1/usuarios/:id` | Sim | Atualiza os dados de um usuário (Apenas o dono). |
| `DELETE` | `/api/v1/usuarios/:id` | Sim | Exclui a conta e todos os dados vinculados (Apenas o dono). |

### 2. Doações
| Método | Endpoint | Autenticação | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/doacoes` | Sim | Cria uma nova postagem de doação (apenas doadores). |
| `GET` | `/api/v1/doacoes` | Não | Lista as doações. Filtros opcionais: `status` (padrão `disponivel`, use `todas` para todas), `categoria`, `condicao`, `tamanho` (listas separadas por vírgula), `uf`, `cidade`, `busca`, `usuario_id`, `excluir` e `limite` (máx. 100). A resposta traz só cidade e UF do doador, nunca o endereço completo. |
| `GET` | `/api/v1/doacoes/:id` | Não | Exibe os dados de uma doação. |
| `GET` | `/api/v1/doacoes/:id/solicitacoes` | Sim | Exibe todas as solicitações de uma doação (Apenas o dono). |
| `PATCH` | `/api/v1/doacoes/:id` | Sim | Atualiza os dados de uma doação (Apenas o dono). |
| `DELETE` | `/api/v1/doacoes/:id` | Sim | Deleta uma doação junto com suas fotos e solicitações (Apenas o dono). |
| `POST` | `/api/v1/doacoes/:id/fotos` | Sim | Envia fotos (`multipart/form-data`, campo `fotos`; JPG, PNG ou WEBP; até 1MB cada; máx. 4 por doação). O front-end reduz as fotos antes e envia uma por requisição (limite de 4,5 MB da Vercel) (Apenas o dono). |
| `DELETE` | `/api/v1/doacoes/:id/fotos/:nome` | Sim | Remove uma foto (Apenas o dono). |
| `GET` | `/api/v1/uploads/:nome` | Não | Imagem de uma foto (guardada no banco), com cache de 1 dia. |

### 3. Solicitações
| Método | Endpoint | Autenticação | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/solicitacoes` | Sim | Cria uma solicitação para receber uma doação (apenas acolhidos): `{"id_doacao": 1}`. |
| `GET` | `/api/v1/solicitacoes/:id` | Sim | Exibe os dados de uma solicitação (apenas participantes). |
| `GET` | `/api/v1/solicitacoes/minhas` | Sim | Histórico de solicitações feitas pelo usuário logado. |
| `GET` | `/api/v1/solicitacoes/recebidas` | Sim | Solicitações recebidas nas doações do usuário logado. |
| `PATCH` | `/api/v1/solicitacoes/:id` | Sim | Aceita ou recusa uma solicitação pendente: `{"status": "ACEITA" \| "RECUSADA"}` (apenas o doador). Ao aceitar, a doação vira `doada` e as outras pendentes são recusadas. |
| `DELETE` | `/api/v1/solicitacoes/:id` | Sim | Cancela uma solicitação que ainda não foi aceita (Apenas o dono). |

As respostas de solicitação trazem o campo `contato`, que só é preenchido depois que a solicitação é **aceita** e só para as duas partes: o doador recebe nome, e-mail, telefone e endereço completo do acolhido (para levar ou enviar a peça), e o acolhido recebe nome, e-mail e telefone do doador. Antes disso, `contato` é `null`.

### 4. Avaliações e Favoritos
| Método | Endpoint | Autenticação | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/avaliacoes` | Sim | Avalia a outra parte de uma doação concluída: `{"id_solicitacao", "nota" (1-5), "comentario"}`. Uma vez por pessoa. |
| `GET` | `/api/v1/favoritos` | Sim | Doações salvas pelo usuário logado. |
| `POST` | `/api/v1/favoritos/:id` | Sim | Salva uma doação. |
| `DELETE` | `/api/v1/favoritos/:id` | Sim | Remove uma doação dos salvos. |

### Variáveis de ambiente

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `PORT` | `8080` | Porta da API. |
| `DATABASE_URL` | `postgres://postgres@localhost:5432/seveste?sslmode=disable` | Connection string do PostgreSQL (ex.: a do Prisma Postgres, com `sslmode=require`). |
| `JWT_SECRET` | chave de desenvolvimento | Chave usada para assinar os tokens. **Defina em produção.** |
| `COOKIE_SECURE` | `false` | Use `true` quando a aplicação estiver em HTTPS. |

---

## English

This document describes the available endpoints in the Seveste project API, indicating the HTTP methods, routes, authentication requirements and a brief description of each feature.

### Authentication

Login returns a JWT (valid for 6 hours) and also stores it in an `httpOnly` cookie named `seveste_token`.
Authenticated routes accept the token either in the `Authorization: Bearer <token>` header or in the cookie.
The front-end uses the cookie, reaching the API through the Next.js proxy (`/api/*` → API).

Routes are registered **without a trailing slash** (e.g. `/api/v1/doacoes`).

## API Endpoints

### 1. Users and Authentication
| Method | Endpoint | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/usuarios` | No | Creates a new user. Requires a full address (`rua`, `numero`, `cidade`, `uf`; optional `complemento`), `aceite_privacidade: true` and an 8+ character password. Starts a session. |
| `POST` | `/api/v1/login` | No | Performs the login, returns the JWT and sets the session cookie. |
| `POST` | `/api/v1/logout` | No | Clears the session cookie. |
| `GET` | `/api/v1/usuarios` | No | Lists users (public data only). |
| `GET` | `/api/v1/usuarios/:id` | No | A user's public profile and stats. |
| `GET` | `/api/v1/usuarios/:id/avaliacoes` | No | Reviews received by a user and the average rating. |
| `GET` | `/api/v1/usuarios/me` | Yes | Full data of the logged-in user. |
| `GET` | `/api/v1/usuarios/me/dados` | Yes | Exports all personal data of the logged-in user as JSON (LGPD). |
| `PATCH` | `/api/v1/usuarios/:id` | Yes | Updates a user's data (Owner only). |
| `DELETE` | `/api/v1/usuarios/:id` | Yes | Deletes the account and all related data (Owner only). |

### 2. Donations
| Method | Endpoint | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/doacoes` | Yes | Creates a new donation (donors only). |
| `GET` | `/api/v1/doacoes` | No | Lists donations, with optional filters (see the Portuguese section). |
| `GET` | `/api/v1/doacoes/:id` | No | Displays a donation's data. |
| `GET` | `/api/v1/doacoes/:id/solicitacoes` | Yes | Displays all requests for a donation (Owner only). |
| `PATCH` | `/api/v1/doacoes/:id` | Yes | Updates the details of a donation (Owner only). |
| `DELETE` | `/api/v1/doacoes/:id` | Yes | Deletes a donation with its photos and requests (Owner only). |
| `POST` | `/api/v1/doacoes/:id/fotos` | Yes | Uploads photos (`multipart/form-data`, field `fotos`; JPG, PNG or WEBP; up to 1MB each; max 4) (Owner only). |
| `DELETE` | `/api/v1/doacoes/:id/fotos/:nome` | Yes | Removes a photo (Owner only). |
| `GET` | `/api/v1/uploads/:nome` | No | A photo's image (stored in the database), cached for 1 day. |

### 3. Requests
| Method | Endpoint | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/solicitacoes` | Yes | Creates a request for a donation (recipients only). |
| `GET` | `/api/v1/solicitacoes/:id` | Yes | Displays a request's details (participants only). |
| `GET` | `/api/v1/solicitacoes/minhas` | Yes | Requests made by the logged-in user. |
| `GET` | `/api/v1/solicitacoes/recebidas` | Yes | Requests received on the logged-in user's donations. |
| `PATCH` | `/api/v1/solicitacoes/:id` | Yes | Accepts or rejects a pending request (donor only). |
| `DELETE` | `/api/v1/solicitacoes/:id` | Yes | Cancels a request that wasn't accepted (Owner only). |

The `contato` field of a request is only filled after the request is **accepted**, and only for the two parties (the donor also gets the recipient's full address). Otherwise it is `null`.

### 4. Reviews and Favorites
| Method | Endpoint | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/avaliacoes` | Yes | Reviews the other party of a completed donation. Once per person. |
| `GET` | `/api/v1/favoritos` | Yes | Donations saved by the logged-in user. |
| `POST` | `/api/v1/favoritos/:id` | Yes | Saves a donation. |
| `DELETE` | `/api/v1/favoritos/:id` | Yes | Removes a donation from the saved list. |
