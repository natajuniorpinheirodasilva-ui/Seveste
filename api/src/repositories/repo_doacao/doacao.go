package repo_doacao

import "seveste-api/src/models"

type DoacaoRepositorio interface {
	Criar(*models.Doacao) (*models.Doacao, error)
	BuscarTodas() ([]models.Doacao, error)
	BuscarPorID(ID uint64) (*models.Doacao, error)
	Salvar(ID uint64, nova *models.Doacao) (*models.Doacao, error)
	Deletar(ID uint64) error
}

var DoacaoRepo DoacaoRepositorio
