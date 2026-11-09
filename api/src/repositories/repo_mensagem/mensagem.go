package repo_mensagem

import "seveste-api/src/models"

type MensagemRepositorio interface {
	Criar(mensagem *models.Mensagem) (*models.Mensagem, error)
	BuscarPorSolicitacaoID(solicitacaoID uint64) ([]models.Mensagem, error)
	BuscarPorUsuarioID(usuarioID uint64) ([]models.Mensagem, error)
	DeletarPorSolicitacaoID(solicitacaoID uint64) error
}

var MensagemRepo MensagemRepositorio
