# Integração front-end ↔ API

Este documento resume as alterações feitas para conectar o front-end (Next.js) à API em Go: o que mudou no back-end, o que mudou no front-end, o que foi feito para a LGPD e o que falta para a integração com o MySQL.

> A lista completa de rotas, parâmetros e variáveis de ambiente está em [API.md](../API.md).

## Sumário

- [Como o front-end fala com a API](#como-o-front-end-fala-com-a-api)
- [Back-end](#back-end)
  - [Correções no código existente](#correções-no-código-existente)
  - [Mudanças que podem quebrar código existente](#mudanças-que-podem-quebrar-código-existente)
  - [Rotas novas](#rotas-novas)
  - [Arquivos novos](#arquivos-novos)
- [Front-end](#front-end)
- [LGPD](#lgpd)
- [O que foi removido do layout](#o-que-foi-removido-do-layout)
- [Próximo passo: MySQL](#próximo-passo-mysql)
- [Observações](#observações)

## Como o front-end fala com a API

```
navegador ──► Next.js (localhost:3000) ──/api/*──► API Go (localhost:8080)
```

- O `next.config.ts` tem um **rewrite** que repassa `/api/*` para a API (endereço configurável por `API_URL`). Para o navegador, front e API estão na mesma origem, então não é preciso configurar CORS.
- O **login grava o token JWT num cookie `httpOnly`** (`seveste_token`). O navegador envia o cookie sozinho e nenhum script da página consegue lê-lo. O cabeçalho `Authorization: Bearer <token>` continua funcionando, por exemplo para testar no Postman.
- No front, todas as chamadas passam por `src/lib/api.ts`, que monta a URL, envia JSON ou `FormData` e transforma o campo `erro` da API numa mensagem exibível.
- O usuário logado fica no `AuthProvider` (`src/components/AuthProvider.tsx`), que consulta `GET /usuarios/me` ao abrir o site. As páginas protegidas usam o hook `useRequireAuth()`, que redireciona para `/login`.

## Back-end

A estrutura do time foi mantida: `models` → `repositories` (interface + implementação em memória `*_mock.go`) → `controllers` → `router`.

### Correções no código existente

| Problema | Onde | Correção |
| :--- | :--- | :--- |
| `GET /usuarios` e `GET /usuarios/:id` eram públicos e devolviam **e-mail, telefone e hash da senha** | `controllers/usuario.go` | Agora devolvem apenas `UsuarioPublico` (nome, cidade, UF, tipo, bio, data de cadastro) |
| `PATCH /doacoes/:id` não verificava o dono: qualquer usuário logado editava doações dos outros | `controllers/doacao.go` | Verificação do dono via `buscarDoacaoDoUsuario` |
| `GET /doacoes/:id/solicitacoes` e `GET /solicitacoes/:id` não verificavam permissão | `controllers/solicitacao.go` | Só o dono da doação ou quem fez a solicitação têm acesso |
| `CriarSolicitacao` procurava a doação em `SolicitacaoRepo` em vez de `DoacaoRepo` e não tinha `return` após erro | `controllers/solicitacao.go` | Busca no repositório correto e retorno após erro |
| Era possível cadastrar o mesmo e-mail duas vezes, e o login diferenciava maiúsculas de minúsculas | `repo_usuario` | E-mail único (sem diferenciar maiúsculas), com resposta `409` |
| Rotas registradas com `"/"` geravam redirecionamento de barra final, o que entra em loop atrás do proxy | `router/router.go` | Rotas registradas sem barra (`/api/v1/doacoes`) |
| `AtualizarUsuario` respondia `500` para JSON inválido | `controllers/usuario.go` | Responde `400` |
| Chave do JWT fixa no código | `seguranca/token.go` | Lida de `JWT_SECRET`; sem a variável, usa a chave antiga e mostra um aviso no log |

### Mudanças que podem quebrar código existente

Quem tiver código ou testes (ex.: Postman) apontando para a API deve conferir:

- **Valores fixos:** a API agora só aceita estes valores, que são os mesmos dos selects do front:
  - `categoria`: `roupas`, `agasalhos`, `calcados`, `acessorios`, `infantil`;
  - `estado` (conservação da peça): `novo`, `usado_excelente`, `usado_marcas`.
- **Status da doação:** era `"criada"` na criação e `"disponivel"` nos dados de teste. Agora é sempre `disponivel` e muda para `doada` quando uma solicitação é aceita.
- **Senha:** o campo `senha` não aparece mais em nenhuma resposta (`json:"-"` no model). O cadastro recebe a senha por uma struct de entrada própria (`usuarioInput`), como já era feito em `doacaoInput`.
- **Cadastro:** agora exige `aceite_privacidade: true` e senha com pelo menos 8 caracteres. O usuário já sai logado (o cookie é gravado).
- **Login:** além de `token`, `tipo` e `nome`, devolve também `usuario` com os dados completos.
- **`Autorizacao()`:** passou a responder `403` (antes `401`) quando o usuário logado não é o dono.
- **Rotas sem barra final:** use `/api/v1/doacoes`, não `/api/v1/doacoes/`.
- **Dados de teste** (`inserir_dados.go`):
  - as categorias e os estados foram ajustados para os valores acima;
  - as UFs inválidas foram corrigidas (`BH` → `BA`/`MG`);
  - foram adicionadas mais doações, mensagens e uma avaliação;
  - as solicitações ficaram coerentes (só uma `ACEITA` por doação). **Os e-mails e senhas de teste não mudaram.**

### Rotas novas

| Método | Rota | Para quê |
| :--- | :--- | :--- |
| `POST` | `/logout` | Apaga o cookie de sessão |
| `GET` | `/usuarios/me` | Dados completos do usuário logado |
| `GET` | `/usuarios/me/dados` | Exportação dos dados pessoais em JSON (LGPD) |
| `GET` | `/usuarios/:id/avaliacoes` | Avaliações recebidas e média |
| `POST` / `DELETE` | `/doacoes/:id/fotos` e `/doacoes/:id/fotos/:nome` | Envio e remoção de fotos |
| `GET` | `/uploads/:nome` | Arquivo da foto |
| `GET` | `/solicitacoes/recebidas` | Solicitações recebidas nas doações do usuário logado |
| `PATCH` | `/solicitacoes/:id` | Doador aceita ou recusa (`ACEITA` / `RECUSADA`) |
| `GET` / `POST` | `/solicitacoes/:id/mensagens` | Chat entre doador e acolhido |
| `POST` | `/avaliacoes` | Avaliar a outra parte de uma doação concluída |
| `GET` / `POST` / `DELETE` | `/favoritos`, `/favoritos/:id` | Itens salvos |
| `GET` | `/saude` | Verificação simples de que a API está no ar |

`GET /doacoes` também ganhou filtros por query string: `status`, `categoria`, `estado`, `tamanho`, `uf`, `cidade`, `busca`, `usuario_id`, `excluir` e `limite`. As respostas de doação e solicitação passaram a vir com os dados públicos do doador e do solicitante, o número de interessados e a última mensagem, para o front não precisar fazer uma chamada por item.

### Regras de negócio adicionadas

- Só **doadores** criam doações e só **acolhidos** criam solicitações. Ninguém solicita a própria doação, e uma solicitação ativa duplicada não é criada (a existente é devolvida).
- Aceitar uma solicitação marca a doação como `doada` e recusa as outras pendentes.
- Uma solicitação aceita não pode ser cancelada.
- O chat só é acessível às duas partes e fica bloqueado em solicitações recusadas.
- Avaliação: nota de 1 a 5, apenas em solicitações aceitas, uma vez por pessoa.
- Fotos: até 4 por doação e 5MB cada, só JPG, PNG ou WEBP. O tipo é detectado pelo conteúdo do arquivo, não pela extensão, e o nome do arquivo é gerado aleatoriamente.
- Excluir uma doação apaga também as fotos, as solicitações, as mensagens e os favoritos dela.

### Arquivos novos

```
api/src/
├── controllers/
│   ├── avaliacao.go      # avaliações
│   ├── favorito.go       # itens salvos
│   ├── foto.go           # upload e remoção de fotos
│   └── respostas.go      # helpers: lerID, dados públicos e respostas "enriquecidas"
├── models/
│   ├── avaliacao.go
│   └── mensagem.go
└── repositories/
    ├── repo_avaliacao/   # interface + mock em memória
    ├── repo_favorito/
    └── repo_mensagem/
```

O middleware `AutenticarOpcional()` foi adicionado para rotas públicas que mostram algo a mais para quem está logado, como o coração de favorito na vitrine.

## Front-end

As páginas que antes só eram acessíveis pelo `DEV_NAVIGATOR` e tinham dados fixos agora usam a API. O layout e as classes existentes foram mantidos.

| Página | O que mudou |
| :--- | :--- |
| `/join` | Formulários de doador e acolhido enviam o cadastro. Quem já está logado é redirecionado. Link para "Entrar". |
| `/login` | **Nova**, no mesmo estilo do cadastro. Aceita `?next=` para voltar à página de origem. |
| `/products` | Lista real, com busca, categorias e filtros de condição, tamanho e região. Aceita `?cat=`. |
| `/products/[id]` | Detalhe real com fotos e favoritar. "Entrar em contato" cria a solicitação e abre o chat; o dono vê "Editar anúncio". Lista peças parecidas e permite compartilhar. |
| `/announce` | Cria e edita (`?editar=ID`) anúncios, com envio e remoção de fotos. Só para doadores. |
| `/dashboard` | Abas por tipo de conta: o **doador** vê anúncios ativos, solicitações (aceitar/recusar), histórico e salvos; o **acolhido** vê suas solicitações e os salvos. Os dois têm a aba nova **Meus dados** (`?aba=dados`). |
| `/success` | Avaliação real: `/success?solicitacao=ID`. |
| `/profile/[id]` | **Nova rota** (a antiga `/profile` estática virou esta): perfil público com anúncios, estatísticas e avaliações. |
| `/profile` | Redireciona para o perfil de quem está logado. |
| Chat (bolha) | Só aparece logado. Lista as conversas reais (uma por solicitação), atualizando por polling (15s a lista, 4s a conversa aberta). O aviso de não lidas fica salvo no navegador. |
| Navbar | Mostra "Entrar / Quero doar / Quero receber" para quem não está logado, e "Vitrine / Anunciar / Minha conta / Sair" para quem está. |
| `DEV_NAVIGATOR` | Oculto por padrão. Aparece ou some com o Konami code: ↑ ↑ ↓ ↓ ← → ← → B A. |
| Rodapé e 404 | Links quebrados corrigidos (`/about`, `/terms`, `/privacy`, `/produtos`, `/produto/...`, `/perfil/...`). |

Arquivos novos do front:

```
src/
├── lib/
│   ├── api.ts            # cliente da API
│   ├── types.ts          # tipos que espelham as respostas da API
│   ├── constants.ts      # categorias, condições, tamanhos, UFs e rótulos
│   ├── format.ts         # datas relativas, localização etc.
│   ├── chat.ts           # evento para abrir o chat a partir de qualquer página
│   └── useSignup.ts      # envio do cadastro
├── components/
│   ├── AuthProvider.tsx  # sessão + useAuth / useRequireAuth
│   ├── AccountSettings.tsx  # aba "Meus dados"
│   ├── DonationPhoto.tsx # foto ou placeholder
│   ├── Feedback.tsx      # Loading, ErrorMessage, EmptyState
│   └── Stars.tsx
└── app/
    ├── (auth)/login/page.tsx
    ├── (legal)/layout.tsx
    └── profile/page.tsx + profile/[id]/page.tsx
```

## LGPD

O básico implementado:

- **Consentimento:** o cadastro só é aceito com o checkbox marcado. A API registra a data e a versão da política aceita (`consentimento_em`, `versao_politica`). O checkbox também confirma 18 anos ou mais.
- **Minimização:**
  - e-mail, telefone e tamanhos nunca aparecem em rotas públicas;
  - o telefone é opcional;
  - doadores não guardam dados de tamanho;
  - o anúncio pede só o bairro ou a região, nunca o endereço completo.
- **Direitos do titular** (art. 18), na aba **Meus dados**:
  - corrigir os dados;
  - baixar uma cópia em JSON (`GET /usuarios/me/dados`);
  - excluir a conta, o que apaga cadastro, anúncios, fotos, solicitações, mensagens, favoritos e avaliações.
- **Segurança:** senha com bcrypt, sessão em cookie `httpOnly` / `SameSite=Lax`, verificação de dono em todas as rotas de escrita e validação do tipo das imagens.
- **Transparência:** as páginas `/privacy-policy`, `/terms-of-use` e `/cookie-policy` foram escritas (antes eram só um texto provisório). Ao mudar a política, atualize também `VersaoPoliticaPrivacidade` em `api/src/controllers/usuario.go`.

## O que foi removido do layout

Itens que mostravam informações que o sistema não tem:

- Contador de visualizações, "Responde em ~1 hora" e o selo "Identidade verificada".
- Filtro de "distância máxima", trocado por estado e cidade, já que não guardamos localização.
- Botão "Denunciar anúncio", que não tem rota na API. Se for necessário, dá para criar `POST /denuncias` no mesmo padrão.
- Botão "Enviar mensagem" no perfil: as conversas acontecem dentro de uma solicitação de doação.

## Próximo passo: MySQL

A API ainda não tem banco de dados: os repositórios `*_mock.go` guardam tudo em `map` na memória. A integração com **MySQL** não exige mudar controllers nem o front. O plano:

1. Criar um `schema.sql` com as tabelas `usuarios`, `doacoes`, `solicitacoes`, `mensagens`, `avaliacoes` e `favoritos`.
2. Implementar um `*_mysql.go` para cada interface de repositório, usando `database/sql` com o driver `github.com/go-sql-driver/mysql`.
3. Ler a conexão de uma variável de ambiente (ex.: `MYSQL_DSN`) e trocar a inicialização em `api/main.go`. Os mocks podem continuar para testes.

Pontos de atenção:

- **Listas nos models:** `Doacao.Fotos` e `Usuario.RoupasProcuradas` são listas. Podem virar colunas `JSON` ou tabelas separadas.
- **Filtros da vitrine:** hoje `GET /doacoes` filtra em Go depois de `BuscarTodas()`. Com MySQL, os filtros devem ir para o `WHERE`.
- **Exclusão de conta:** usar `FOREIGN KEY ... ON DELETE CASCADE` faz o banco apagar automaticamente o que é do usuário.
- **Fotos:** continuam em disco (`UPLOAD_DIR`, padrão `api/uploads/`); o banco guarda só o nome do arquivo.
- **Dados de teste:** `InserirDados()` só deve rodar com o banco vazio, senão duplica os dados a cada reinício.

## Observações

- Existe uma pasta `types/` na raiz do projeto, ignorada pelo git, com tipos antigos gerados pelo Next. Ela faz o `npm run build` falhar com `Cannot find module '../../src/app/page.js'`. Pode ser apagada com segurança, porque o Next gera esses tipos dentro de `.next/`.
- Em produção, defina `JWT_SECRET` e use `COOKIE_SECURE=true` (HTTPS).
- Verificado: o lint do front, o `go vet`, o build de produção do Next (com a pasta `types/` movida de lugar) e os fluxos principais por chamadas HTTP, passando pelo proxy do Next.
