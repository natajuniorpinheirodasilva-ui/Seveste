package repo_doacao

import (
	"errors"
	"seveste-api/src/models"
	"sync"
)

type RepositorioDeMemoriaDoacao struct {
	mu      sync.RWMutex
	doacoes map[uint64]models.Doacao
	proxID  uint64
}

func NovoRepositorioDeDoacao() *RepositorioDeMemoriaDoacao {
	return &RepositorioDeMemoriaDoacao{
		doacoes: make(map[uint64]models.Doacao),
		proxID:  1,
	}
}

func (r *RepositorioDeMemoriaDoacao) Criar(d *models.Doacao) (*models.Doacao, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	d.ID = r.proxID
	r.doacoes[r.proxID] = *d
	r.proxID++

	return d, nil
}

func (r *RepositorioDeMemoriaDoacao) BuscarTodas() ([]models.Doacao, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var doacoes = make([]models.Doacao, 0, len(r.doacoes))
	for _, d := range r.doacoes {
		doacoes = append(doacoes, d)
	}

	return doacoes, nil
}

func (r *RepositorioDeMemoriaDoacao) BuscarPorID(ID uint64) (*models.Doacao, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var d, existe = r.doacoes[ID]
	if !existe {
		return nil, errors.New("doação não encontrada")
	}

	return &d, nil
}

func (r *RepositorioDeMemoriaDoacao) Deletar(ID uint64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	var _, existe = r.doacoes[ID]
	if !existe {
		return errors.New("doacao nao encontrada")
	}

	delete(r.doacoes, ID)
	return nil
}
