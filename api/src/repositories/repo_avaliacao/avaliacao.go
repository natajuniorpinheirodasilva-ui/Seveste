package repo_avaliacao

import (
	"errors"
	"seveste-api/src/models"
)

var ErrAvaliacaoDuplicada = errors.New("voce ja avaliou esta doacao")

type AvaliacaoRepositorio interface {
	Criar(avaliacao *models.Avaliacao) (*models.Avaliacao, error)
	BuscarPorAvaliadoID(usuarioID uint64) ([]models.Avaliacao, error)
	BuscarPorAutorID(usuarioID uint64) ([]models.Avaliacao, error)
	BuscarPorSolicitacaoEAutor(solicitacaoID, autorID uint64) (*models.Avaliacao, error)
	DeletarPorUsuarioID(usuarioID uint64) error
}

var AvaliacaoRepo AvaliacaoRepositorio
