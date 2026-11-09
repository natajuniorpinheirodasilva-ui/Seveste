# Seveste

> [!WARNING]
> **Ainda sem banco de dados.** A API guarda tudo em memória: ao reiniciar, os dados voltam aos dados de teste. A integração com **MySQL** ainda vai ser feita: cada repositório (`api/src/repositories/repo_*`) vai ganhar uma implementação MySQL no lugar da atual em memória (`*_mock.go`), sem mudar controllers nem o front-end.
>
> As alterações feitas para conectar o front-end à API estão descritas em [docs/ALTERACOES.md](docs/ALTERACOES.md).

O **Seveste** é um projeto educacional desenvolvido como trabalho acadêmico na **FATEC Botucatu**. A proposta é criar uma plataforma voltada à doação e ao recebimento de roupas, aproximando pessoas que desejam contribuir de pessoas que precisam ser acolhidas.

O projeto busca aplicar a tecnologia em um contexto de impacto social, tornando o processo de doação mais simples, organizado e acessível. Além de atender aos objetivos acadêmicos, o Seveste representa uma oportunidade de desenvolver uma solução com potencial para ajudar a comunidade e incentivar o reaproveitamento consciente de roupas.

## Tecnologias

O frontend é desenvolvido com **Next.js**, **React**, **TypeScript** e **Tailwind CSS**. O backend utiliza **Go**, responsável pela API, regras de negócio e integração com os dados da aplicação.

O desenvolvimento também considera boas práticas de organização, responsividade, acessibilidade, segurança e proteção de dados pessoais conforme a LGPD.

## Contexto acadêmico

Este repositório faz parte de um trabalho da **FATEC Botucatu** e possui finalidade principalmente educacional. Seu desenvolvimento permite colocar em prática conhecimentos de frontend, backend, integração entre sistemas e trabalho colaborativo, utilizando tecnologias atuais em uma proposta direcionada ao bem social.

## Como rodar localmente

São dois processos: a API em Go e o front-end em Next.js. O front acessa a API pelo proxy `/api/*` configurado em `next.config.ts`, então basta subir os dois.

1. **API (Go 1.27+)** — porta `8080`:

   ```bash
   cd api
   go run .
   ```

   Por enquanto os dados ficam em memória (até a integração com MySQL) e são recriados a cada reinício com alguns usuários de teste (por exemplo, doador `teste@gmail.com` / senha `teste` e acolhida `marcinha123@gmail.com` / senha `dasd1233`). As variáveis de ambiente opcionais estão descritas em [API.md](API.md).

2. **Front-end** — porta `3000`:

   ```bash
   npm install
   npm run dev
   ```

   Se a API estiver em outro endereço, defina `API_URL` (padrão `http://localhost:8080`).

### Navegador de desenvolvimento

O `DEV_NAVIGATOR`, com atalhos para todas as páginas, fica oculto. Para mostrar ou esconder, digite o Konami code em qualquer página (fora de campos de texto): <kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>←</kbd> <kbd>→</kbd> <kbd>B</kbd> <kbd>A</kbd>.
