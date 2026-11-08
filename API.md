# Documentação da API - Seveste

[🇧🇷 Português](#-português) | [🇺🇸 English](#-english)

---

## Português

Esta documentação descreve os endpoints disponíveis na API do projeto Seveste, indicando os métodos HTTP, as rotas, a necessidade de autenticação e uma breve descrição de cada funcionalidade.

## Endpoints da API

### 1. Usuários e Autenticação
| Método | Endpoint | Autenticação | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/usuarios` | Não | Cadastra um novo usuário no sistema. |
| `POST` | `/api/v1/login` | Não | Realiza o login e retornar o token JWT. |
| `GET` | `/api/v1/usuarios` | Não | Exibe todos os usuários cadastrados. |
| `GET` | `/api/v1/usuarios/:id` | Não | Exibe dados de um usuário. |
| `PATCH` | `/api/v1/usuarios/:id` | Sim | Atualiza os dados de um usuário (Apenas o dono). |
| `DELETE` | `/api/v1/usuarios/:id` | Sim | Deleta os dados de um usuário (Apenas o dono). |

### 2. Doacões
| Método | Endpoint | Autenticação | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/doacoes` | Sim | Cria uma nova postagem de doação. |
| `GET` | `/api/v1/doacoes` | Não | Exibe todas as doações do sistema. |
| `GET` | `/api/v1/doacoes/:id` | Não | Exibe os dados de uma doação. |
| `GET` | `/api/v1/doacoes/:id/solicitacoes` | Sim | Exibe todas as solicitações de uma doação (Apenas o dono). |
| `PATCH` | `/api/v1/doacoes/:id` | Sim | Atualiza os dados de uma doação (Apenas o dono). |
| `DELETE` | `/api/v1/doacoes/:id` | Sim | Deleta os dados de uma doação (Apenas o dono). |

### 3. Solicitações
| Método | Endpoint | Autenticação | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/solicitacoes` | Sim | Cria uma nova solicitação para receber uma doação. |
| `GET` | `/api/v1/solicitacoes/:id` | Sim | Exibe os dados de uma solicitação. |
| `GET` | `/api/v1/solicitacoes/minhas` | Sim | Exibe o histórico de solicitações do usuário logado. |
| `DELETE` | `/api/v1/solicitacoes/:id` | Sim | Cancela uma solicitação (Apenas o dono). |

---

## English

This document describes the available endpoints in the Seveste project API, indicating the HTTP methods, routes, authentication requirements and a brief description of each feature.

## API Endpoints

### 1. Users and Authentication
| Method | Endpoint | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/usuarios` | No | Creates a new user. |
| `POST` | `/api/v1/login` | No | Performs the login and returns the JWT token. |
| `GET` | `/api/v1/usuarios` | No | Displays all registered users. |
| `GET` | `/api/v1/usuarios/:id` | No | Displays a user's data. |
| `PATCH` | `/api/v1/usuarios/:id` | Yes | Updates a user's data (Owner only). |
| `DELETE` | `/api/v1/usuarios/:id` | Yes | Deletes a user's data (Owner only). |

### 2. Donations
| Method | Endpoint | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/doacoes` | Yes | Creates a new donation. |
| `GET` | `/api/v1/doacoes` | No | Displays all registered donations. |
| `GET` | `/api/v1/doacoes/:id` | No | Display a donation's data. |
| `GET` | `/api/v1/doacoes/:id/solicitacoes` | Yes | Displays all requests for a donation (Owner only). |
| `PATCH` | `/api/v1/doacoes/:id` | Yes | Updates the details of a donation (Owner only). |
| `DELETE` | `/api/v1/doacoes/:id` | Yes | Deletes a donation (Owner only). |

### 3. Requests
| Method | Endpoint | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/solicitacoes` | Yes | Creates a new request for a donation. |
| `GET` | `/api/v1/solicitacoes/:id` | Yes | Displays a request's details. |
| `GET` | `/api/v1/solicitacoes/minhas` | Yes | Displays the history of a user's requests. |
| `DELETE` | `/api/v1/solicitacoes/:id` | Yes | Cancels a request (Owner only). |