package repo_doacao

import "seveste-api/src/models"

type DoacaoRepositorio interface {
	Criar(*models.Doacao) (*models.Doacao, error)
	BuscarTodas() ([]models.Doacao, error)
	BuscarPorID(ID uint64) (*models.Doacao, error)
}

var DoacaoRepo DoacaoRepositorio
