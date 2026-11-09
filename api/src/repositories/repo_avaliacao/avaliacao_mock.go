package repo_avaliacao

import (
	"errors"
	"seveste-api/src/models"
	"sort"
	"sync"
)

type RepositorioDeMemoriaAvaliacao struct {
	mu         sync.RWMutex
	avaliacoes map[uint64]models.Avaliacao
	proxID     uint64
}

func NovoRepositorioDeAvaliacao() *RepositorioDeMemoriaAvaliacao {
	return &RepositorioDeMemoriaAvaliacao{
		avaliacoes: make(map[uint64]models.Avaliacao),
		proxID:     1,
	}
}

func (r *RepositorioDeMemoriaAvaliacao) Criar(a *models.Avaliacao) (*models.Avaliacao, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, existente := range r.avaliacoes {
		if existente.SolicitacaoID == a.SolicitacaoID && existente.AutorID == a.AutorID {
			return nil, ErrAvaliacaoDuplicada
		}
	}

	a.ID = r.proxID
	r.avaliacoes[a.ID] = *a
	r.proxID++

	return a, nil
}

// retorna as avaliações mais recentes primeiro
func (r *RepositorioDeMemoriaAvaliacao) BuscarPorAvaliadoID(usuarioID uint64) ([]models.Avaliacao, error) {
	return r.filtrar(func(a models.Avaliacao) bool { return a.AvaliadoID == usuarioID }), nil
}

func (r *RepositorioDeMemoriaAvaliacao) BuscarPorAutorID(usuarioID uint64) ([]models.Avaliacao, error) {
	return r.filtrar(func(a models.Avaliacao) bool { return a.AutorID == usuarioID }), nil
}

func (r *RepositorioDeMemoriaAvaliacao) BuscarPorSolicitacaoEAutor(solicitacaoID, autorID uint64) (*models.Avaliacao, error) {
	encontradas := r.filtrar(func(a models.Avaliacao) bool {
		return a.SolicitacaoID == solicitacaoID && a.AutorID == autorID
	})
	if len(encontradas) == 0 {
		return nil, errors.New("avaliacao nao encontrada")
	}

	return &encontradas[0], nil
}

func (r *RepositorioDeMemoriaAvaliacao) DeletarPorUsuarioID(usuarioID uint64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for id, a := range r.avaliacoes {
		if a.AutorID == usuarioID || a.AvaliadoID == usuarioID {
			delete(r.avaliacoes, id)
		}
	}

	return nil
}

func (r *RepositorioDeMemoriaAvaliacao) filtrar(condicao func(models.Avaliacao) bool) []models.Avaliacao {
	r.mu.RLock()
	defer r.mu.RUnlock()

	filtradas := []models.Avaliacao{}
	for _, a := range r.avaliacoes {
		if condicao(a) {
			filtradas = append(filtradas, a)
		}
	}

	sort.Slice(filtradas, func(i, j int) bool { return filtradas[i].ID > filtradas[j].ID })
	return filtradas
}
