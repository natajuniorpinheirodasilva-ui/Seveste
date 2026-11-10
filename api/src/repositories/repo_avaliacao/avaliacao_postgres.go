package repo_avaliacao

import (
	"database/sql"
	"errors"
	"seveste-api/src/models"

	"github.com/jackc/pgx/v5/pgconn"
)

type RepositorioDePostgresAvaliacao struct {
	db *sql.DB
}

func NovoRepositorioDeAvaliacao(db *sql.DB) *RepositorioDePostgresAvaliacao {
	return &RepositorioDePostgresAvaliacao{db: db}
}

const selectAvaliacao = `SELECT id_avaliacao, id_solicitacao, id_autor, id_avaliado, nota, comentario, criado_em FROM Avaliacao`

type leitor interface {
	Scan(dest ...any) error
}

func lerAvaliacao(linha leitor) (*models.Avaliacao, error) {
	var a models.Avaliacao
	err := linha.Scan(&a.ID, &a.SolicitacaoID, &a.AutorID, &a.AvaliadoID, &a.Nota, &a.Comentario, &a.CriadoEm)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

// retorna as avaliações mais recentes primeiro
func (r *RepositorioDePostgresAvaliacao) listar(condicao string, args ...any) ([]models.Avaliacao, error) {
	linhas, err := r.db.Query(selectAvaliacao+" WHERE "+condicao+" ORDER BY criado_em DESC, id_avaliacao DESC", args...)
	if err != nil {
		return nil, err
	}
	defer linhas.Close()

	avaliacoes := []models.Avaliacao{}
	for linhas.Next() {
		a, err := lerAvaliacao(linhas)
		if err != nil {
			return nil, err
		}
		avaliacoes = append(avaliacoes, *a)
	}

	return avaliacoes, linhas.Err()
}

func (r *RepositorioDePostgresAvaliacao) Criar(a *models.Avaliacao) (*models.Avaliacao, error) {
	criada, err := lerAvaliacao(r.db.QueryRow(`
		INSERT INTO Avaliacao (id_solicitacao, id_autor, id_avaliado, nota, comentario, criado_em)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id_avaliacao, id_solicitacao, id_autor, id_avaliado, nota, comentario, criado_em`,
		a.SolicitacaoID, a.AutorID, a.AvaliadoID, a.Nota, a.Comentario, a.CriadoEm,
	))
	if avaliacaoDuplicada(err) {
		return nil, ErrAvaliacaoDuplicada
	}
	return criada, err
}

func (r *RepositorioDePostgresAvaliacao) BuscarPorAvaliadoID(usuarioID uint64) ([]models.Avaliacao, error) {
	return r.listar("id_avaliado = $1", usuarioID)
}

func (r *RepositorioDePostgresAvaliacao) BuscarPorAutorID(usuarioID uint64) ([]models.Avaliacao, error) {
	return r.listar("id_autor = $1", usuarioID)
}

func (r *RepositorioDePostgresAvaliacao) BuscarPorSolicitacaoEAutor(solicitacaoID, autorID uint64) (*models.Avaliacao, error) {
	a, err := lerAvaliacao(r.db.QueryRow(selectAvaliacao+" WHERE id_solicitacao = $1 AND id_autor = $2", solicitacaoID, autorID))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("avaliacao nao encontrada")
	}
	return a, err
}

// erro 23505 do PostgreSQL: violação de UNIQUE
func avaliacaoDuplicada(err error) bool {
	var erroPostgres *pgconn.PgError
	return errors.As(err, &erroPostgres) && erroPostgres.Code == "23505"
}
