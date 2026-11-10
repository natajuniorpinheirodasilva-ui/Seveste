# Seveste

> [!NOTE]
> **Banco de dados: PostgreSQL (Prisma Postgres).** A API se conecta pela variável `DATABASE_URL` e cria sozinha as tabelas na primeira execução (script em [api/sql/setup.sql](api/sql/setup.sql), baseado na versão final do diagrama do projeto).
>
> As alterações feitas para conectar o front-end à API e integrar o banco estão descritas em [docs/ALTERACOES.md](docs/ALTERACOES.md).

O **Seveste** é um projeto educacional desenvolvido como trabalho acadêmico na **FATEC Botucatu**. A proposta é criar uma plataforma voltada à doação e ao recebimento de roupas, aproximando pessoas que desejam contribuir de pessoas que precisam ser acolhidas.

O projeto busca aplicar a tecnologia em um contexto de impacto social, tornando o processo de doação mais simples, organizado e acessível. Além de atender aos objetivos acadêmicos, o Seveste representa uma oportunidade de desenvolver uma solução com potencial para ajudar a comunidade e incentivar o reaproveitamento consciente de roupas.

## Tecnologias

O frontend é desenvolvido com **Next.js**, **React**, **TypeScript** e **Tailwind CSS**. O backend utiliza **Go**, responsável pela API, regras de negócio e integração com os dados da aplicação.

O desenvolvimento também considera boas práticas de organização, responsividade, acessibilidade, segurança e proteção de dados pessoais conforme a LGPD.

## Contexto acadêmico

Este repositório faz parte de um trabalho da **FATEC Botucatu** e possui finalidade principalmente educacional. Seu desenvolvimento permite colocar em prática conhecimentos de frontend, backend, integração entre sistemas e trabalho colaborativo, utilizando tecnologias atuais em uma proposta direcionada ao bem social.

## Como rodar localmente

São três peças: o banco PostgreSQL, a API em Go e o front-end em Next.js. O front acessa a API pelo proxy `/api/*` configurado em `next.config.ts`.

1. **Banco PostgreSQL.** Use a connection string do Prisma Postgres (no painel do Prisma: *Connect to your database* → connection string do tipo `postgres://...`) ou um PostgreSQL local. Se `DATABASE_URL` não for definida, a API tenta `postgres://postgres@localhost:5432/seveste?sslmode=disable`.

2. **API (Go 1.27+)** — porta `8080`. Rode de dentro da pasta `api/` (a API lê o `sql/setup.sql` de lá):

   ```powershell
   # PowerShell
   cd api
   $env:DATABASE_URL = "postgres://USUARIO:SENHA@db.prisma.io:5432/postgres?sslmode=require"
   go run .
   ```

   ```bash
   # bash
   cd api
   DATABASE_URL="postgres://USUARIO:SENHA@db.prisma.io:5432/postgres?sslmode=require" go run .
   ```

   A connection string tem a senha do banco: não a coloque no código nem faça commit dela.

   Na primeira execução a API cria as tabelas, e o banco começa vazio: crie as contas pela tela de cadastro (`/join`).

3. **Front-end** — porta `3000`:

   ```bash
   npm install
   npm run dev
   ```

   Se a API estiver em outro endereço, defina `API_URL` (padrão `http://localhost:8080`).

## Deploy na Vercel

O front-end e a API são publicados como **dois projetos na Vercel**, a partir deste mesmo repositório. O banco é o Prisma Postgres.

1. **Banco:** crie o banco no Prisma Postgres e copie a connection string (`postgres://...`). Na primeira requisição, a API cria as tabelas sozinha.
2. **Projeto da API:** *Add New → Project*, escolha o repositório e, em **Root Directory**, selecione `api`. O framework fica como *Other*: a Vercel encontra a função Go em `api/api/index.go`, e o `api/vercel.json` manda todas as rotas para ela. Variáveis de ambiente:
   - `DATABASE_URL`: a connection string do Prisma Postgres;
   - `JWT_SECRET`: um texto longo e aleatório;
   - `COOKIE_SECURE`: `true`.
3. **Projeto do front-end:** *Add New → Project* de novo, com o mesmo repositório e **Root Directory** na raiz (framework Next.js). Variável de ambiente:
   - `API_URL`: o endereço do projeto da API (ex.: `https://seveste-api.vercel.app`).

   O navegador só fala com o front; o Next repassa `/api/*` para a API, então o cookie de login funciona sem configurar CORS.
4. Teste a API em `https://<projeto-da-api>.vercel.app/api/v1/saude`; a resposta deve ser `{"status":"ok"}`.

> O `api/go.mod` pede Go 1.27. Se o build da API na Vercel reclamar da versão do Go, baixe a linha `go` do `go.mod` para a versão mais nova que a Vercel aceitar. O código não depende de nada específico do 1.27.

### Navegador de desenvolvimento

O `DEV_NAVIGATOR`, com atalhos para todas as páginas, fica oculto. Para mostrar ou esconder, digite o Konami code em qualquer página (fora de campos de texto): <kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>B</kbd> <kbd>A</kbd>.
