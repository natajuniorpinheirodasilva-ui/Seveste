# Integração front-end ↔ API ↔ banco de dados

Este documento resume as alterações feitas para conectar o front-end (Next.js) à API em Go e a API ao PostgreSQL: o que mudou no back-end, o que mudou no front-end, o que foi feito para a LGPD e como o banco foi modelado.

> A lista completa de rotas, parâmetros e variáveis de ambiente está em [API.md](../API.md). Como rodar o projeto está no [README](../README.md).

## Sumário

- [Visão geral](#visão-geral)
- [Banco de dados (PostgreSQL)](#banco-de-dados-postgresql)
- [Back-end](#back-end)
  - [Correções no código existente](#correções-no-código-existente)
  - [Mudanças que podem quebrar código existente](#mudanças-que-podem-quebrar-código-existente)
  - [Rotas novas](#rotas-novas)
  - [Regras de negócio](#regras-de-negócio)
  - [Estrutura de arquivos](#estrutura-de-arquivos)
- [Front-end](#front-end)
- [LGPD](#lgpd)
- [O que foi removido](#o-que-foi-removido)
- [Observações](#observações)

## Visão geral

```
navegador ──► Next.js (localhost:3000) ──/api/*──► API Go (localhost:8080) ──► PostgreSQL (Prisma Postgres)
```

- O `next.config.ts` tem um **rewrite** que repassa `/api/*` para a API (endereço configurável por `API_URL`). Para o navegador, front e API estão na mesma origem, então não é preciso configurar CORS.
- O **login grava o token JWT num cookie `httpOnly`** (`seveste_token`). O navegador envia o cookie sozinho e nenhum script da página consegue lê-lo. O cabeçalho `Authorization: Bearer <token>` continua funcionando, por exemplo para testar no Postman.
- No front, todas as chamadas passam por `src/lib/api.ts`. O usuário logado fica no `AuthProvider` (`src/components/AuthProvider.tsx`), e as páginas protegidas usam o hook `useRequireAuth()`, que redireciona para `/login`.
- **Fluxo de uma doação:**
  1. O doador anuncia a peça e escolhe o tipo de entrega: **ele leva** até a pessoa ou **envia por frete**.
  2. O acolhido solicita a peça.
  3. O doador aceita uma das solicitações.
  4. Só então os dois recebem o contato um do outro, e o doador recebe também o endereço completo do acolhido.
  5. Depois da entrega, cada um avalia o outro.

## Banco de dados (PostgreSQL)

O banco é **PostgreSQL**, hospedado no **Prisma Postgres**. O script fica em [`api/sql/setup.sql`](../api/sql/setup.sql), na mesma pasta que o Guilherme usou na branch dele, e segue a **versão final do diagrama** do projeto: `TipoUsuario`, `Cidade`, `Endereco`, `Usuario`, `Doacao`, `DoacaoImagem`, `Solicitacao` e `HistoricoDeListagem`.

> O diagrama foi feito no MySQL Workbench; na conversão para PostgreSQL, `INT AUTO_INCREMENT` virou `INT GENERATED ALWAYS AS IDENTITY`, `DATETIME`/`TIMESTAMP` virou `TIMESTAMPTZ` e `TINYINT` virou `SMALLINT`. Os nomes das tabelas foram mantidos sem aspas, então o PostgreSQL os guarda em minúsculas (`Usuario` → `usuario`); nas consultas, tanto faz escrever `Usuario` ou `usuario`.

- **Conexão** (`api/src/banco/banco.go`): pela variável `DATABASE_URL`, que é a connection string do Prisma Postgres (`postgres://USUARIO:SENHA@db.prisma.io:5432/postgres?sslmode=require`). Sem a variável, a API tenta um PostgreSQL local (`postgres://postgres@localhost:5432/seveste?sslmode=disable`). O driver é o `pgx`.
- **Criação automática:** o `sql/setup.sql` fica embutido no binário (`api/sql/setup.go`, com `go:embed`). Ao iniciar, a API verifica se as tabelas existem e, se não existirem, executa o script. Com o banco já criado, ela não roda o script de novo, para economizar operações.
- **Mudanças no schema:** depois do banco criado, aplique-as rodando o script à mão: `psql "$DATABASE_URL" -f sql/setup.sql`. Tudo usa `IF NOT EXISTS`/`ON CONFLICT`, então isso não apaga nem duplica dados.
- **Sem dados de teste:** o banco começa vazio. Os dados fictícios que a API inseria antes (`inserir_dados.go`) foram removidos.

### O que foi acrescentado ao diagrama

No arquivo, tudo o que não está no diagrama final aparece marcado com `[acrescentado]`.

| Tabela | Acréscimo | Motivo |
| :--- | :--- | :--- |
| `Usuario` | `id_endereco` | Endereço de quem doa ou recebe. No diagrama, o `Endereco` só se liga à `Doacao`, e o doador precisa do endereço de quem recebe para levar a peça ou enviá-la por frete |
| `Usuario` | `bio` | Texto do perfil público |
| `Usuario` | `roupas_procuradas` (JSONB), `tamanho_roupa`, `tamanho_calcado` | Cadastro de acolhido |
| `Usuario` | `consentimento_em`, `versao_politica` | Registro do consentimento (LGPD) |
| `Cidade` | índice único em `LOWER(cidade)` | Evita a mesma cidade cadastrada duas vezes ("Botucatu" e "botucatu") |
| `DoacaoImagem` | `dados` (BYTEA), `tipo_conteudo` | A imagem fica no banco (a Vercel não tem disco permanente) |
| `Doacao` | `categoria`, `tamanho` | Filtros da vitrine |
| `Doacao` | `cor`, `material` | Campos opcionais do anúncio |
| `Doacao` | `local` | Bairro ou região aproximada mostrada no anúncio (o endereço completo nunca aparece) |
| `Avaliacao` (nova) | — | Notas e comentários ao fim de uma doação |
| `Favorito` (nova) | — | Itens salvos |

### Como as tabelas são usadas

- **`TipoUsuario`:** o `setup.sql` já cadastra `doador` e `acolhido`. `Usuario.tipo_usuario` aponta para essa tabela; na API, o tipo continua aparecendo como texto (`"tipo": "doador"`).
- **`Cidade` e `Endereco`:** ao cadastrar ou editar um endereço, a cidade é procurada pelo nome e reaproveitada; se não existir, é criada. `Usuario.id_endereco` aponta para o endereço da pessoa, e a doação aponta para o mesmo endereço do doador (`Doacao.id_endereco`), que fornece a cidade e a UF mostradas na vitrine.
- **`DoacaoImagem`:** guarda as fotos em ordem (`posicao`). A primeira é a capa (`capa = 1`), e ao remover a capa a próxima foto assume. **A própria imagem fica no banco**, nas colunas acrescentadas `dados` (BYTEA) e `tipo_conteudo`, porque a Vercel não tem disco permanente. A coluna `url` guarda um nome aleatório e único, e a foto é servida em `/api/v1/uploads/<url>`.
- **`HistoricoDeListagem`:** ganha uma linha quando a doação é criada (`disponivel`) e a cada mudança de status (`doada`).
- **Exclusão de conta:** as chaves estrangeiras com `ON DELETE CASCADE` apagam as doações, imagens, histórico, solicitações, avaliações e favoritos da pessoa. O endereço, que não aponta para o usuário, é apagado pelo repositório na mesma transação. Os arquivos de foto são apagados pela API.

### Repositórios

A estrutura do Guilherme foi mantida:

- cada pasta `repo_*` tem a **interface** (`usuario.go`, `doacao.go`…), com a variável global (`UsuarioRepo`, `DoacaoRepo`…), e a implementação **PostgreSQL** (`usuario_postgres.go`…);
- a struct segue o mesmo padrão de nome (`RepositorioDeMemoriaUsuario` → `RepositorioDePostgresUsuario`) e o mesmo construtor (`NovoRepositorioDeUsuario`), que agora recebe a conexão do banco;
- os erros de "não encontrado" são escritos direto em cada função, como antes;
- as implementações em memória (`*_mock.go`) foram removidas; continuam no histórico do git.

As interfaces ganharam métodos para filtrar no próprio SQL, em vez de buscar tudo e filtrar em Go:

- `DoacaoRepo.Buscar(FiltroDoacao)`, que substitui o antigo `BuscarTodas()`;
- `SolicitacaoRepo.BuscarPorDoadorID()`;
- `UsuarioRepo.Contar()`.

Os controllers também seguem o estilo dele: cada função lê o `id` da rota (`strconv.ParseUint`), busca o registro e confere o dono por extenso, sem funções auxiliares escondendo essas etapas. Ficou de fora só a montagem das respostas com dados do doador/solicitante (`controllers/respostas.go`), que várias rotas compartilham.

## Back-end

### Correções no código existente

| Problema | Onde | Correção |
| :--- | :--- | :--- |
| `GET /usuarios` e `GET /usuarios/:id` eram públicos e devolviam **e-mail, telefone e hash da senha** | `controllers/usuario.go` | Agora devolvem apenas `UsuarioPublico` (nome, cidade, UF, tipo, bio, data de cadastro) |
| `PATCH /doacoes/:id` não verificava o dono: qualquer usuário logado editava doações dos outros | `controllers/doacao.go` | Verificação do dono via `buscarDoacaoDoUsuario` |
| `GET /doacoes/:id/solicitacoes` e `GET /solicitacoes/:id` não verificavam permissão | `controllers/solicitacao.go` | Só o dono da doação ou quem fez a solicitação têm acesso |
| `CriarSolicitacao` procurava a doação em `SolicitacaoRepo` em vez de `DoacaoRepo` e não tinha `return` após erro | `controllers/solicitacao.go` | Busca no repositório correto e retorno após erro |
| Era possível cadastrar o mesmo e-mail duas vezes, e o login diferenciava maiúsculas de minúsculas | repositório de usuário | E-mail único no banco (`UNIQUE`) e normalizado, com resposta `409` |
| Rotas registradas com `"/"` geravam redirecionamento de barra final, o que entra em loop atrás do proxy | `router/router.go` | Rotas registradas sem barra (`/api/v1/doacoes`) |
| `AtualizarUsuario` respondia `500` para JSON inválido | `controllers/usuario.go` | Responde `400` |
| Chave do JWT fixa no código | `seguranca/token.go` | Lida de `JWT_SECRET`; sem a variável, usa a chave antiga e mostra um aviso no log |

### Mudanças que podem quebrar código existente

Quem tiver código ou testes (ex.: Postman) apontando para a API deve conferir:

- **Doação:**
  - o campo `estado` agora se chama **`condicao`**, como no diagrama; o filtro da listagem também passou a ser `?condicao=`;
  - campo novo obrigatório: **`tipo_de_entrega`** (`levar` ou `frete`);
  - a descrição tem no máximo **300 caracteres**, pelo tamanho da coluna;
  - valores aceitos: `categoria` em `roupas`, `agasalhos`, `calcados`, `acessorios` ou `infantil`, e `condicao` em `novo`, `usado_excelente` ou `usado_marcas`;
  - o status é sempre `disponivel` na criação e muda para `doada` quando uma solicitação é aceita.
- **Cadastro:** agora exige o **endereço completo** (`rua`, `numero`, `cidade`, `uf`; `complemento` é opcional), `aceite_privacidade: true` e senha com pelo menos 8 caracteres. O usuário já sai logado.
- **Senha:** o campo `senha` não aparece mais em nenhuma resposta.
- **Login:** além de `token`, `tipo` e `nome`, devolve também `usuario` com os dados completos.
- **`Autorizacao()`:** passou a responder `403` (antes `401`) quando o usuário logado não é o dono.
- **Rotas sem barra final:** use `/api/v1/doacoes`, não `/api/v1/doacoes/`.
- **Dados de teste:** o `inserir_dados.go` foi removido; o banco começa vazio, e as contas são criadas pelo cadastro.

### Rotas novas

| Método | Rota | Para quê |
| :--- | :--- | :--- |
| `POST` | `/logout` | Apaga o cookie de sessão |
| `GET` | `/usuarios/me` | Dados completos do usuário logado (inclui endereço) |
| `GET` | `/usuarios/me/dados` | Exportação dos dados pessoais em JSON (LGPD) |
| `GET` | `/usuarios/:id/avaliacoes` | Avaliações recebidas e média |
| `POST` / `DELETE` | `/doacoes/:id/fotos` e `/doacoes/:id/fotos/:nome` | Envio e remoção de fotos |
| `GET` | `/uploads/:nome` | Arquivo da foto |
| `GET` | `/solicitacoes/recebidas` | Solicitações recebidas nas doações do usuário logado |
| `PATCH` | `/solicitacoes/:id` | Doador aceita ou recusa (`ACEITA` / `RECUSADA`) |
| `POST` | `/avaliacoes` | Avaliar a outra parte de uma doação concluída |
| `GET` / `POST` / `DELETE` | `/favoritos`, `/favoritos/:id` | Itens salvos |
| `GET` | `/saude` | Verificação simples de que a API está no ar |

`GET /doacoes` ganhou filtros (`status`, `categoria`, `condicao`, `tamanho`, `uf`, `cidade`, `busca`, `usuario_id`, `excluir`, `limite`), aplicados direto no SQL. As respostas de solicitação trazem o campo **`contato`**, preenchido só depois do aceite (veja [LGPD](#lgpd)).

### Regras de negócio

- Só **doadores** criam doações e só **acolhidos** criam solicitações. Ninguém solicita a própria doação, e uma solicitação ativa duplicada não é criada (a existente é devolvida).
- Aceitar uma solicitação marca a doação como `doada`, registra no histórico e recusa as outras pendentes.
- Uma solicitação aceita não pode ser cancelada.
- Avaliação: nota de 1 a 5, apenas em solicitações aceitas, uma vez por pessoa (`UNIQUE` no banco).
- Fotos: até 4 por doação, só JPG, PNG ou WEBP, com no máximo 1 MB cada depois de reduzidas. O tipo é detectado pelo conteúdo do arquivo, não pela extensão, e o nome é gerado aleatoriamente.

### Estrutura de arquivos

```
api/
├── main.go                     # roda a API localmente (go run .)
├── api/
│   └── index.go                # função serverless da Vercel
├── vercel.json                 # manda todas as rotas para a função
├── sql/
│   ├── setup.sql               # script do banco (baseado no diagrama)
│   └── setup.go                # embute o setup.sql no binário
└── src/
    ├── app/
    │   └── app.go              # monta a API (banco, repositórios, rotas); usado pelo main.go e pela Vercel
    ├── banco/
    │   └── banco.go            # conexão; executa o sql/setup.sql se as tabelas não existirem
    ├── controllers/
    │   ├── avaliacao.go        # novo
    │   ├── favorito.go         # novo
    │   ├── foto.go             # novo: upload e remoção de fotos
    │   └── respostas.go        # novo: dados públicos, contato e respostas com dados do doador/solicitante
    ├── models/
    │   └── avaliacao.go        # novo
    └── repositories/
        ├── repo_*/*_postgres.go  # implementações PostgreSQL (substituem os *_mock.go)
        ├── repo_avaliacao/     # novo
        └── repo_favorito/      # novo
```

## Front-end

As páginas que antes só eram acessíveis pelo `DEV_NAVIGATOR` e tinham dados fixos agora usam a API. O layout e as classes existentes foram mantidos.

| Página | O que mudou |
| :--- | :--- |
| `/join` | Formulários de doador e acolhido enviam o cadastro, com **endereço completo** (rua, número, complemento, cidade e UF). Quem já está logado é redirecionado. Link para "Entrar". |
| `/login` | **Nova**, no mesmo estilo do cadastro. Aceita `?next=` para voltar à página de origem. |
| `/products` | Lista real, com busca, categorias e filtros de condição, tamanho e região. Aceita `?cat=`. |
| `/products/[id]` | Detalhe real com fotos, favoritar, compartilhar e peças parecidas. "Solicitar doação" cria a solicitação e mostra o andamento ("Solicitação enviada" ou "O doador aceitou"). Mostra o tipo de entrega. O dono vê "Editar anúncio". |
| `/announce` | Cria e edita (`?editar=ID`) anúncios, com fotos e **tipo de entrega** (eu levo / envio por frete). Só para doadores. |
| `/dashboard` | Abas por tipo de conta: o **doador** vê anúncios ativos, solicitações (aceitar/recusar), histórico e salvos; o **acolhido** vê suas solicitações e os salvos. Em solicitações aceitas, o botão **"Ver contato"** mostra os dados da outra parte. Os dois têm a aba **Meus dados** (`?aba=dados`), onde também se edita o endereço. |
| `/success` | `/success?solicitacao=ID`: mostra o contato da outra parte ("Próximo passo: combinar a entrega") e o formulário de avaliação. |
| `/profile/[id]` | **Nova rota** (a antiga `/profile` estática virou esta): perfil público com anúncios, estatísticas e avaliações. |
| `/profile` | Redireciona para o perfil de quem está logado. |
| Navbar | Mostra "Entrar / Quero doar / Quero receber" para quem não está logado, e "Vitrine / Anunciar / Minha conta / Sair" para quem está. |
| `DEV_NAVIGATOR` | Oculto por padrão. Aparece ou some com o Konami code: ↑ ↑ ↓ ↓ ← → ← → B A. |
| Rodapé e 404 | Links quebrados corrigidos (`/about`, `/terms`, `/privacy`, `/produtos`, `/produto/...`, `/perfil/...`). |

Arquivos novos do front:

```
src/
├── lib/
│   ├── api.ts               # cliente da API
│   ├── types.ts             # tipos que espelham as respostas da API
│   ├── constants.ts         # categorias, condições, tamanhos, tipos de entrega, UFs e rótulos
│   ├── format.ts            # datas relativas, localização etc.
│   ├── imagem.ts            # reduz as fotos no navegador antes do envio
│   └── useSignup.ts         # envio do cadastro
├── components/
│   ├── AuthProvider.tsx     # sessão + useAuth / useRequireAuth
│   ├── AccountSettings.tsx  # aba "Meus dados"
│   ├── ContactCard.tsx      # contato da outra parte após o aceite
│   ├── DonationPhoto.tsx    # foto ou placeholder
│   ├── Feedback.tsx         # Loading, ErrorMessage, EmptyState
│   └── Stars.tsx
└── app/
    ├── (auth)/login/page.tsx
    ├── (legal)/layout.tsx
    └── profile/page.tsx + profile/[id]/page.tsx
```

## LGPD

- **Consentimento:** o cadastro só é aceito com o checkbox marcado. O banco registra a data e a versão da política aceita (`consentimento_em`, `versao_politica`; versão atual `2026-11.2`). O checkbox também confirma 18 anos ou mais.
- **Minimização e finalidade:**
  - o endereço completo é pedido porque a peça é levada ou enviada por frete até quem vai receber;
  - e-mail, telefone, endereço e tamanhos **nunca aparecem em rotas públicas**: a vitrine e o perfil mostram só cidade e UF;
  - o telefone é opcional;
  - doadores não guardam dados de tamanho.
- **Compartilhamento só quando necessário:** os dados de contato só são liberados depois que o doador **aceita** a solicitação, e só entre as duas partes.
  - O **doador** recebe nome, e-mail, telefone e endereço completo do acolhido.
  - O **acolhido** recebe nome, e-mail e telefone do doador, sem o endereço.
- **Direitos do titular** (art. 18), na aba **Meus dados**:
  - corrigir os dados (inclusive o endereço);
  - baixar uma cópia em JSON (`GET /usuarios/me/dados`);
  - excluir a conta, o que apaga tudo em cascata no banco, além dos arquivos de foto.
- **Segurança:** senha com bcrypt, sessão em cookie `httpOnly` / `SameSite=Lax`, verificação de dono em todas as rotas de escrita, consultas SQL parametrizadas e validação do tipo das imagens.
- **Transparência:** as páginas `/privacy-policy`, `/terms-of-use` e `/cookie-policy` descrevem tudo isso. Ao mudar a política de forma relevante, atualize também `VersaoPoliticaPrivacidade` em `api/src/controllers/usuario.go`.

## Hospedagem na Vercel e plano gratuito do Prisma

O front e a API são dois projetos na Vercel (o passo a passo está no [README](../README.md#deploy-na-vercel)):

- **Função Go:** a API roda como função serverless. O arquivo `api/api/index.go` monta a API uma vez por instância (pacote `src/app`, o mesmo usado pelo `main.go` local), e o `api/vercel.json` direciona todas as rotas para ela.
- **Front:** o projeto do Next.js aponta para a API pela variável `API_URL`. O proxy `/api/*` continua igual.

Para caber no plano gratuito do Prisma Postgres, que limita o armazenamento e o número de operações, e nos limites da Vercel:

| O quê | Como |
| :--- | :--- |
| **Fotos pequenas** | O navegador reduz cada foto antes de enviar (`src/lib/imagem.ts`): lado maior de até 1280px, em WEBP (ou JPEG), ficando em geral entre 100 e 300 KB. Isso também apaga os metadados da foto original, como a localização GPS. A API recusa acima de 1 MB. |
| **Uma foto por requisição** | A Vercel aceita no máximo 4,5 MB por requisição, então o front envia as fotos uma de cada vez. |
| **Cache das fotos** | `GET /uploads/:nome` responde com `Cache-Control: public, max-age=86400, s-maxage=86400`. A CDN da Vercel serve as visitas seguintes sem chamar a API nem o banco. |
| **Vitrine em 2 consultas** | Uma consulta só traz as doações com fotos, doador e número de interessados, e outra traz os favoritos de quem está logado. Antes eram cerca de 1 + 3 consultas por anúncio. |
| **Listas sem consultas repetidas** | Solicitações e avaliações usam um cache por requisição (`controllers/respostas.go`), e cada usuário ou doação é buscado uma única vez. Os itens salvos vêm numa consulta só (`FiltroDoacao.IDs`). |
| **Inicialização barata** | O `setup.sql` só roda com o banco vazio, e não a cada vez que a função "acorda". |
| **Poucas conexões** | No máximo 3 conexões por instância da função. |

## O que foi removido

- **Chat:** foi retirado do sistema por decisão do time. O contato passou a ser liberado depois do aceite (veja acima). Saíram o componente `ChatBubble`, o modelo e o repositório de mensagens e as rotas `/solicitacoes/:id/mensagens`.
- **Itens do layout que mostravam dados que o sistema não tem:**
  - contador de visualizações, "Responde em ~1 hora" e o selo "Identidade verificada";
  - filtro de "distância máxima", trocado por estado e cidade;
  - botão "Denunciar anúncio", que não tem rota na API (dá para criar `POST /denuncias` no mesmo padrão, se for necessário);
  - botão "Enviar mensagem" no perfil.
- **Repositórios em memória** (`*_mock.go`): substituídos pelos repositórios PostgreSQL.

## Observações

- Existe uma pasta `types/` na raiz do projeto, ignorada pelo git, com tipos antigos gerados pelo Next. Ela faz o `npm run build` falhar com `Cannot find module '../../src/app/page.js'`. Pode ser apagada com segurança, porque o Next gera esses tipos dentro de `.next/`.
- Em produção, defina `JWT_SECRET`, use `COOKIE_SECURE=true` (HTTPS) e nunca faça commit da `DATABASE_URL`, que contém a senha do banco.
- **Fotos em cache:** depois de removida, uma foto pode continuar aparecendo por até 24 horas para quem já a abriu, por causa do cache da CDN da Vercel.
- **Verificado:**
  - `go vet` e o lint do front passam;
  - o build de produção do Next passa (com a pasta `types/` movida de lugar);
  - 59 testes ponta a ponta da API contra um PostgreSQL 17 real passam. Eles cobrem: schema, tipos e cidades, filtros, fotos no banco (envio, capa, servir com cache, limite de 1 MB), aceite e contato, avaliações, favoritos, exportação e exclusões em cascata;
  - a API iniciada numa pasta sem o `sql/setup.sql` cria as tabelas mesmo assim (script embutido);
  - medição com o log do PostgreSQL: a vitrine fez 2 consultas no total;
  - depois de reiniciar a API, os dados continuam no banco.
