package repo_solicitacao

import (
	"database/sql"
	"errors"
	"seveste-api/src/models"
)

type RepositorioDePostgresSolicitacao struct {
	db *sql.DB
}

func NovoRepositorioDeSolicitacao(db *sql.DB) *RepositorioDePostgresSolicitacao {
	return &RepositorioDePostgresSolicitacao{db: db}
}

const selectSolicitacao = `SELECT s.id_solicitacao, s.status, s.criado_em, s.id_doacao, s.id_usuario FROM Solicitacao s`

type leitor interface {
	Scan(dest ...any) error
}

func lerSolicitacao(linha leitor) (*models.Solicitacao, error) {
	var s models.Solicitacao
	if err := linha.Scan(&s.ID, &s.Status, &s.CriadoEm, &s.DoacaoID, &s.UsuarioID); err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *RepositorioDePostgresSolicitacao) listar(complemento string, args ...any) ([]models.Solicitacao, error) {
	linhas, err := r.db.Query(selectSolicitacao+" "+complemento+" ORDER BY s.criado_em DESC, s.id_solicitacao DESC", args...)
	if err != nil {
		return nil, err
	}
	defer linhas.Close()

	solicitacoes := []models.Solicitacao{}
	for linhas.Next() {
		s, err := lerSolicitacao(linhas)
		if err != nil {
			return nil, err
		}
		solicitacoes = append(solicitacoes, *s)
	}

	return solicitacoes, linhas.Err()
}

func (r *RepositorioDePostgresSolicitacao) Criar(s *models.Solicitacao) (*models.Solicitacao, error) {
	var id uint64
	err := r.db.QueryRow(
		"INSERT INTO Solicitacao (status, criado_em, id_doacao, id_usuario) VALUES ($1, $2, $3, $4) RETURNING id_solicitacao",
		s.Status, s.CriadoEm, s.DoacaoID, s.UsuarioID,
	).Scan(&id)
	if err != nil {
		return nil, err
	}

	return r.BuscarPorID(id)
}

func (r *RepositorioDePostgresSolicitacao) BuscarPorID(solicitacaoID uint64) (*models.Solicitacao, error) {
	s, err := lerSolicitacao(r.db.QueryRow(selectSolicitacao+" WHERE s.id_solicitacao = $1", solicitacaoID))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("solicitacao nao encontrada")
	}
	return s, err
}

func (r *RepositorioDePostgresSolicitacao) BuscarPorDoacaoID(doacaoID uint64) ([]models.Solicitacao, error) {
	return r.listar("WHERE s.id_doacao = $1", doacaoID)
}

func (r *RepositorioDePostgresSolicitacao) BuscarPorUsuarioID(usuarioID uint64) ([]models.Solicitacao, error) {
	return r.listar("WHERE s.id_usuario = $1", usuarioID)
}

func (r *RepositorioDePostgresSolicitacao) BuscarPorDoadorID(doadorID uint64) ([]models.Solicitacao, error) {
	return r.listar("JOIN Doacao d ON d.id_doacao = s.id_doacao WHERE d.id_usuario = $1", doadorID)
}

func (r *RepositorioDePostgresSolicitacao) Salvar(solicitacaoID uint64, nova *models.Solicitacao) (*models.Solicitacao, error) {
	resultado, err := r.db.Exec("UPDATE Solicitacao SET status = $1 WHERE id_solicitacao = $2", nova.Status, solicitacaoID)
	if err != nil {
		return nil, err
	}
	if afetadas, _ := resultado.RowsAffected(); afetadas == 0 {
		return nil, errors.New("solicitacao nao encontrada")
	}

	return r.BuscarPorID(solicitacaoID)
}

func (r *RepositorioDePostgresSolicitacao) Deletar(solicitacaoID uint64) error {
	resultado, err := r.db.Exec("DELETE FROM Solicitacao WHERE id_solicitacao = $1", solicitacaoID)
	if err != nil {
		return err
	}
	if afetadas, _ := resultado.RowsAffected(); afetadas == 0 {
		return errors.New("solicitacao nao encontrada")
	}
	return nil
}
