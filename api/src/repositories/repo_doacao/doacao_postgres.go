package repo_doacao

import (
	"database/sql"
	"errors"
	"fmt"
	"seveste-api/src/models"
	"slices"
	"strings"
)

type RepositorioDePostgresDoacao struct {
	db *sql.DB
}

func NovoRepositorioDeDoacao(db *sql.DB) *RepositorioDePostgresDoacao {
	return &RepositorioDePostgresDoacao{db: db}
}

// Uma única consulta traz a doação, a cidade/UF do endereço, as fotos (em ordem de posição; os nomes não
// contêm vírgula), os dados públicos do doador e o número de solicitações.
// Assim a vitrine faz uma consulta por página, e não várias por anúncio (economiza operações no Prisma).
const selectDoacao = `
	SELECT d.id_doacao, d.titulo, d.descricao, d.categoria, d.tamanho, d.condicao, d.tipo_de_entrega, d.status,
	       d.cor, d.material, d.local, d.id_endereco, ci.cidade, e.uf, d.criado_em, d.atualizado_em, d.id_usuario,
	       (SELECT string_agg(i.url, ',' ORDER BY i.posicao) FROM DoacaoImagem i WHERE i.id_doacao = d.id_doacao),
	       (SELECT COUNT(*) FROM Solicitacao s WHERE s.id_doacao = d.id_doacao),
	       u.nome, t.tipo, u.bio, u.criado_em
	FROM Doacao d
	JOIN Endereco e ON e.id_endereco = d.id_endereco
	JOIN Cidade ci ON ci.id_cidade = e.id_cidade
	JOIN Usuario u ON u.id_usuario = d.id_usuario
	JOIN TipoUsuario t ON t.id_tipo_usuario = u.tipo_usuario`

type leitor interface {
	Scan(dest ...any) error
}

func lerDoacao(linha leitor) (*models.Doacao, error) {
	var d models.Doacao
	var fotos sql.NullString
	var doador models.UsuarioPublico

	err := linha.Scan(
		&d.ID, &d.Titulo, &d.Descricao, &d.Categoria, &d.Tamanho, &d.Condicao, &d.TipoDeEntrega, &d.Status,
		&d.Cor, &d.Material, &d.Local, &d.EnderecoID, &d.Cidade, &d.UF, &d.CriadoEm, &d.AtualizadoEm, &d.UsuarioID,
		&fotos, &d.TotalSolicitacoes,
		&doador.Nome, &doador.Tipo, &doador.Bio, &doador.CriadoEm,
	)
	if err != nil {
		return nil, err
	}

	// o endereço da doação é o do doador, então cidade e UF são as mesmas
	doador.ID = d.UsuarioID
	doador.Cidade = d.Cidade
	doador.UF = d.UF
	d.Doador = &doador

	d.Fotos = []string{}
	if fotos.Valid && fotos.String != "" {
		d.Fotos = strings.Split(fotos.String, ",")
	}

	return &d, nil
}

func registrarHistorico(tx *sql.Tx, doacaoID uint64, status string) error {
	_, err := tx.Exec("INSERT INTO HistoricoDeListagem (id_doacao, status) VALUES ($1, $2)", doacaoID, status)
	return err
}

// Sincroniza a tabela DoacaoImagem com a lista de fotos (a primeira é a capa): apaga as que saíram da lista
// e atualiza a posição das demais. Fotos novas entram por AdicionarFoto, que recebe os bytes da imagem.
func salvarImagens(tx *sql.Tx, doacaoID uint64, fotos []string) error {
	linhas, err := tx.Query("SELECT url FROM DoacaoImagem WHERE id_doacao = $1", doacaoID)
	if err != nil {
		return err
	}

	existentes := []string{}
	for linhas.Next() {
		var url string
		if err = linhas.Scan(&url); err != nil {
			linhas.Close()
			return err
		}
		existentes = append(existentes, url)
	}
	linhas.Close()

	for _, url := range existentes {
		if !slices.Contains(fotos, url) {
			if _, err = tx.Exec("DELETE FROM DoacaoImagem WHERE id_doacao = $1 AND url = $2", doacaoID, url); err != nil {
				return err
			}
		}
	}

	for posicao, url := range fotos {
		capa := 0
		if posicao == 0 {
			capa = 1
		}

		if slices.Contains(existentes, url) {
			_, err = tx.Exec("UPDATE DoacaoImagem SET posicao = $1, capa = $2 WHERE id_doacao = $3 AND url = $4", posicao, capa, doacaoID, url)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func (r *RepositorioDePostgresDoacao) Criar(d *models.Doacao) (*models.Doacao, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	var id uint64
	err = tx.QueryRow(`
		INSERT INTO Doacao (id_usuario, descricao, titulo, condicao, tipo_de_entrega, status, criado_em, id_endereco,
		                    categoria, tamanho, cor, material, local)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id_doacao`,
		d.UsuarioID, d.Descricao, d.Titulo, d.Condicao, d.TipoDeEntrega, d.Status, d.CriadoEm, d.EnderecoID,
		d.Categoria, d.Tamanho, d.Cor, d.Material, d.Local,
	).Scan(&id)
	if err != nil {
		return nil, err
	}

	if err = salvarImagens(tx, id, d.Fotos); err != nil {
		return nil, err
	}
	if err = registrarHistorico(tx, id, d.Status); err != nil {
		return nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return r.BuscarPorID(id)
}

// Buscar aplica os filtros direto no SQL; resultados mais recentes primeiro
func (r *RepositorioDePostgresDoacao) Buscar(f FiltroDoacao) ([]models.Doacao, error) {
	condicoes := []string{}
	args := []any{}

	// adiciona um valor à lista de argumentos e devolve o marcador correspondente ($1, $2...)
	marcador := func(valor any) string {
		args = append(args, valor)
		return fmt.Sprintf("$%d", len(args))
	}
	lista := func(valores []string) string {
		marcadores := make([]string, len(valores))
		for i, v := range valores {
			marcadores[i] = marcador(v)
		}
		return strings.Join(marcadores, ", ")
	}

	if f.Status != "" {
		condicoes = append(condicoes, "d.status = "+marcador(f.Status))
	}
	if len(f.Categorias) > 0 {
		condicoes = append(condicoes, "d.categoria IN ("+lista(f.Categorias)+")")
	}
	if len(f.Condicoes) > 0 {
		condicoes = append(condicoes, "d.condicao IN ("+lista(f.Condicoes)+")")
	}
	if len(f.Tamanhos) > 0 {
		condicoes = append(condicoes, "LOWER(d.tamanho) IN ("+lista(f.Tamanhos)+")")
	}
	if f.UF != "" {
		condicoes = append(condicoes, "e.uf = "+marcador(f.UF))
	}
	if f.Cidade != "" {
		condicoes = append(condicoes, "ci.cidade ILIKE "+marcador(contemLike(f.Cidade)))
	}
	if f.Busca != "" {
		padrao := marcador(contemLike(f.Busca))
		condicoes = append(condicoes, "(d.titulo ILIKE "+padrao+" OR d.descricao ILIKE "+padrao+")")
	}
	if f.UsuarioID != 0 {
		condicoes = append(condicoes, "d.id_usuario = "+marcador(f.UsuarioID))
	}
	if f.IDs != nil {
		if len(f.IDs) == 0 {
			return []models.Doacao{}, nil
		}
		ids := make([]string, len(f.IDs))
		for i, id := range f.IDs {
			ids[i] = marcador(id)
		}
		condicoes = append(condicoes, "d.id_doacao IN ("+strings.Join(ids, ", ")+")")
	}
	if f.Excluir != 0 {
		condicoes = append(condicoes, "d.id_doacao <> "+marcador(f.Excluir))
	}

	consulta := selectDoacao
	if len(condicoes) > 0 {
		consulta += " WHERE " + strings.Join(condicoes, " AND ")
	}
	consulta += " ORDER BY d.criado_em DESC, d.id_doacao DESC"
	if f.Limite > 0 {
		consulta += " LIMIT " + marcador(f.Limite)
	}

	linhas, err := r.db.Query(consulta, args...)
	if err != nil {
		return nil, err
	}
	defer linhas.Close()

	doacoes := []models.Doacao{}
	for linhas.Next() {
		d, err := lerDoacao(linhas)
		if err != nil {
			return nil, err
		}
		doacoes = append(doacoes, *d)
	}

	return doacoes, linhas.Err()
}

func (r *RepositorioDePostgresDoacao) BuscarPorID(ID uint64) (*models.Doacao, error) {
	d, err := lerDoacao(r.db.QueryRow(selectDoacao+" WHERE d.id_doacao = $1", ID))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("doação não encontrada")
	}
	return d, err
}

func (r *RepositorioDePostgresDoacao) Salvar(ID uint64, nova *models.Doacao) (*models.Doacao, error) {
	atual, err := r.BuscarPorID(ID)
	if err != nil {
		return nil, err
	}

	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	if _, err = tx.Exec(`
		UPDATE Doacao SET descricao = $1, titulo = $2, condicao = $3, tipo_de_entrega = $4, status = $5, categoria = $6,
		                  tamanho = $7, cor = $8, material = $9, local = $10, atualizado_em = NOW()
		WHERE id_doacao = $11`,
		nova.Descricao, nova.Titulo, nova.Condicao, nova.TipoDeEntrega, nova.Status, nova.Categoria,
		nova.Tamanho, nova.Cor, nova.Material, nova.Local, ID,
	); err != nil {
		return nil, err
	}

	if err = salvarImagens(tx, ID, nova.Fotos); err != nil {
		return nil, err
	}

	if atual.Status != nova.Status {
		if err = registrarHistorico(tx, ID, nova.Status); err != nil {
			return nil, err
		}
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return r.BuscarPorID(ID)
}

// remove a doação; imagens, histórico, solicitações e favoritos saem em cascata
func (r *RepositorioDePostgresDoacao) Deletar(ID uint64) error {
	resultado, err := r.db.Exec("DELETE FROM Doacao WHERE id_doacao = $1", ID)
	if err != nil {
		return err
	}
	if afetadas, _ := resultado.RowsAffected(); afetadas == 0 {
		return errors.New("doação não encontrada")
	}
	return nil
}

func (r *RepositorioDePostgresDoacao) AdicionarFoto(doacaoID uint64, nome, tipoConteudo string, dados []byte) error {
	// a nova foto vai para o fim da lista; se for a primeira, vira a capa
	_, err := r.db.Exec(`
		INSERT INTO DoacaoImagem (id_doacao, posicao, capa, url, tipo_conteudo, dados)
		SELECT $1, COUNT(*), CASE WHEN COUNT(*) = 0 THEN 1 ELSE 0 END, $2, $3, $4
		FROM DoacaoImagem WHERE id_doacao = $1`,
		doacaoID, nome, tipoConteudo, dados,
	)
	return err
}

func (r *RepositorioDePostgresDoacao) BuscarFoto(nome string) (string, []byte, error) {
	var tipoConteudo string
	var dados []byte
	err := r.db.QueryRow("SELECT tipo_conteudo, dados FROM DoacaoImagem WHERE url = $1", nome).Scan(&tipoConteudo, &dados)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil, errors.New("foto nao encontrada")
	}
	return tipoConteudo, dados, err
}

// monta o padrão "%texto%" escapando os curingas do LIKE
func contemLike(texto string) string {
	substituto := strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`)
	return "%" + substituto.Replace(texto) + "%"
}
