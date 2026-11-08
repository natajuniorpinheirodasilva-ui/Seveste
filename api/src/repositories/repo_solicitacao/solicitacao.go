package repo_solicitacao

import "seveste-api/src/models"

type SolicitacaoRepositorio interface {
	Criar(solicitacao *models.Solicitacao) (*models.Solicitacao, error)
	BuscarPorID(solicitacaoID uint64) (*models.Solicitacao, error)
	BuscarPorDoacaoID(doacaoID uint64) ([]models.Solicitacao, error)
	BuscarPorUsuarioID(usuarioID uint64) ([]models.Solicitacao, error)
	Salvar(solicitacaoID uint64, nova *models.Solicitacao) (*models.Solicitacao, error)
	Deletar(solicitacaoID uint64) error
}

var SolicitacaoRepo SolicitacaoRepositorio
