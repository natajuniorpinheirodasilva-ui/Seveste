package repo_doacao

import (
	"errors"
	"seveste-api/src/models"
	"sync"
)

type RepositorioDeMemoriaDocao struct {
	mu      sync.RWMutex
	doacoes map[uint64]models.Doacao
	proxID  uint64
}

func NovoRepositorioDeDoacao() *RepositorioDeMemoriaDocao {
	return &RepositorioDeMemoriaDocao{
		doacoes: make(map[uint64]models.Doacao),
		proxID:  1,
	}
}

func (r *RepositorioDeMemoriaDocao) Criar(d *models.Doacao) (*models.Doacao, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	d.ID = r.proxID
	r.doacoes[r.proxID] = *d
	r.proxID++

	return d, nil
}

func (r *RepositorioDeMemoriaDocao) BuscarTodas() ([]models.Doacao, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var doacoes = make([]models.Doacao, 0, len(r.doacoes))
	for _, d := range r.doacoes {
		doacoes = append(doacoes, d)
	}

	return doacoes, nil
}

func (r *RepositorioDeMemoriaDocao) BuscarPorID(ID uint64) (*models.Doacao, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var d, existe = r.doacoes[ID]
	if !existe {
		return nil, errors.New("doação não encontrada")
	}

	return &d, nil
}
