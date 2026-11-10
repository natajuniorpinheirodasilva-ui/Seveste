-- Schema do banco Seveste (PostgreSQL / Prisma Postgres).
-- Baseado na versão final do diagrama do projeto. Itens marcados com "[acrescentado]" não estão no
-- diagrama e são usados pelo front-end / regras de negócio atuais.
--
-- A API executa este arquivo automaticamente quando as tabelas ainda não existem (banco vazio).
-- Ao mudar o schema, rode à mão (tudo usa IF NOT EXISTS, então não apaga dados):
--   psql "$DATABASE_URL" -f sql/setup.sql
--
-- Observações sobre a conversão do diagrama (MySQL Workbench) para PostgreSQL:
--   INT AUTO_INCREMENT -> INT GENERATED ALWAYS AS IDENTITY
--   DATETIME/TIMESTAMP -> TIMESTAMPTZ
--   TINYINT            -> SMALLINT
--   Nomes sem aspas: o PostgreSQL guarda as tabelas em minúsculas (Usuario -> usuario).

CREATE TABLE IF NOT EXISTS TipoUsuario (
    id_tipo_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tipo            VARCHAR(50) NOT NULL UNIQUE
);

-- tipos de usuário aceitos pela API
INSERT INTO TipoUsuario (tipo) VALUES ('doador'), ('acolhido') ON CONFLICT (tipo) DO NOTHING;

CREATE TABLE IF NOT EXISTS Cidade (
    id_cidade INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cidade    VARCHAR(200) NOT NULL
);

-- [acrescentado] evita cidades repetidas, sem diferenciar maiúsculas de minúsculas
CREATE UNIQUE INDEX IF NOT EXISTS uk_cidade_cidade ON Cidade (LOWER(cidade));

-- Endereço completo. Nunca é exibido publicamente: apenas cidade/UF aparecem nos anúncios,
-- e o endereço só é compartilhado com o doador depois que ele aceita a solicitação.
CREATE TABLE IF NOT EXISTS Endereco (
    id_endereco INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rua         VARCHAR(500) NOT NULL,
    numero      VARCHAR(20)  NOT NULL,
    uf          CHAR(2)      NOT NULL,
    complemento VARCHAR(100) NULL,
    id_cidade   INT          NOT NULL REFERENCES Cidade (id_cidade)
);

CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome              VARCHAR(100) NOT NULL,
    email             VARCHAR(100) NOT NULL UNIQUE,
    senha_hash        VARCHAR(300) NOT NULL,
    telefone          VARCHAR(20)  NULL,
    criado_em         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    tipo_usuario      INT          NOT NULL REFERENCES TipoUsuario (id_tipo_usuario),
    id_endereco       INT          NOT NULL REFERENCES Endereco (id_endereco), -- [acrescentado] endereço de quem doa/recebe
    bio               VARCHAR(500) NOT NULL DEFAULT '',          -- [acrescentado] perfil público
    roupas_procuradas JSONB        NULL,                         -- [acrescentado] apenas acolhidos
    tamanho_roupa     VARCHAR(10)  NULL,                         -- [acrescentado] apenas acolhidos
    tamanho_calcado   SMALLINT     NULL,                         -- [acrescentado] apenas acolhidos
    consentimento_em  TIMESTAMPTZ  NOT NULL,                     -- [acrescentado] LGPD
    versao_politica   VARCHAR(20)  NOT NULL                      -- [acrescentado] LGPD
);

CREATE TABLE IF NOT EXISTS Doacao (
    id_doacao       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario      INT          NOT NULL REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    descricao       VARCHAR(300) NOT NULL,
    titulo          VARCHAR(80)  NOT NULL,
    condicao        VARCHAR(45)  NOT NULL,
    tipo_de_entrega VARCHAR(45)  NOT NULL,
    status          VARCHAR(100) NOT NULL,
    criado_em       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    atualizado_em   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    -- a doação usa o endereço do doador (o mesmo registro apontado por Usuario.id_endereco)
    id_endereco     INT          NOT NULL REFERENCES Endereco (id_endereco),
    categoria       VARCHAR(45)  NOT NULL,                       -- [acrescentado] filtros da vitrine
    tamanho         VARCHAR(10)  NOT NULL,                       -- [acrescentado] filtros da vitrine
    cor             VARCHAR(40)  NOT NULL DEFAULT '',            -- [acrescentado] opcional
    material        VARCHAR(40)  NOT NULL DEFAULT '',            -- [acrescentado] opcional
    local           VARCHAR(80)  NOT NULL DEFAULT ''             -- [acrescentado] bairro/região aproximada exibida no anúncio
);

CREATE INDEX IF NOT EXISTS idx_doacao_status_criado ON Doacao (status, criado_em);

-- As fotos ficam no próprio banco (a Vercel não tem disco permanente). O navegador reduz cada foto antes
-- do envio (máx. 1280px, ~100-300 KB) e a API recusa arquivos acima de 1 MB.
-- "url" guarda um nome aleatório e único; a foto é servida em /api/v1/uploads/<url>.
CREATE TABLE IF NOT EXISTS DoacaoImagem (
    id_doacao_imagem INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_doacao        INT          NOT NULL REFERENCES Doacao (id_doacao) ON DELETE CASCADE,
    posicao          INT          NOT NULL,
    criado_em        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    capa             SMALLINT     NOT NULL DEFAULT 0,
    url              VARCHAR(300) NOT NULL UNIQUE,
    tipo_conteudo    VARCHAR(50)  NOT NULL,                      -- [acrescentado] image/jpeg, image/png ou image/webp
    dados            BYTEA        NOT NULL                       -- [acrescentado] conteúdo da imagem
);

CREATE INDEX IF NOT EXISTS idx_doacao_imagem_doacao ON DoacaoImagem (id_doacao, posicao);

CREATE TABLE IF NOT EXISTS Solicitacao (
    id_solicitacao INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    status         VARCHAR(50) NOT NULL,
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    id_doacao      INT         NOT NULL REFERENCES Doacao (id_doacao) ON DELETE CASCADE,
    id_usuario     INT         NOT NULL REFERENCES Usuario (id_usuario) ON DELETE CASCADE
);

-- Registro de cada mudança de status de uma doação (disponivel -> doada)
CREATE TABLE IF NOT EXISTS HistoricoDeListagem (
    id_historico_de_listagem INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_doacao                INT         NOT NULL REFERENCES Doacao (id_doacao) ON DELETE CASCADE,
    status                   VARCHAR(60) NOT NULL,
    criado_em                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [acrescentado] avaliações feitas ao final de uma doação concluída
CREATE TABLE IF NOT EXISTS Avaliacao (
    id_avaliacao   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_solicitacao INT          NOT NULL REFERENCES Solicitacao (id_solicitacao) ON DELETE CASCADE,
    id_autor       INT          NOT NULL REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    id_avaliado    INT          NOT NULL REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    nota           SMALLINT     NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario     VARCHAR(500) NOT NULL DEFAULT '',
    criado_em      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (id_solicitacao, id_autor)
);

-- [acrescentado] itens salvos
CREATE TABLE IF NOT EXISTS Favorito (
    id_usuario INT         NOT NULL REFERENCES Usuario (id_usuario) ON DELETE CASCADE,
    id_doacao  INT         NOT NULL REFERENCES Doacao (id_doacao) ON DELETE CASCADE,
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id_usuario, id_doacao)
);
