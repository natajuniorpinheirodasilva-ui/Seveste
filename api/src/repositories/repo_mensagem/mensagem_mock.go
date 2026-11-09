package repo_mensagem

import (
	"seveste-api/src/models"
	"sort"
	"sync"
)

type RepositorioDeMemoriaMensagem struct {
	mu        sync.RWMutex
	mensagens map[uint64]models.Mensagem
	proxID    uint64
}

func NovoRepositorioDeMensagem() *RepositorioDeMemoriaMensagem {
	return &RepositorioDeMemoriaMensagem{
		mensagens: make(map[uint64]models.Mensagem),
		proxID:    1,
	}
}

func (r *RepositorioDeMemoriaMensagem) Criar(m *models.Mensagem) (*models.Mensagem, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	m.ID = r.proxID
	r.mensagens[m.ID] = *m
	r.proxID++

	return m, nil
}

// retorna as mensagens em ordem cronológica
func (r *RepositorioDeMemoriaMensagem) BuscarPorSolicitacaoID(solicitacaoID uint64) ([]models.Mensagem, error) {
	return r.filtrar(func(m models.Mensagem) bool { return m.SolicitacaoID == solicitacaoID }), nil
}

func (r *RepositorioDeMemoriaMensagem) BuscarPorUsuarioID(usuarioID uint64) ([]models.Mensagem, error) {
	return r.filtrar(func(m models.Mensagem) bool { return m.UsuarioID == usuarioID }), nil
}

func (r *RepositorioDeMemoriaMensagem) DeletarPorSolicitacaoID(solicitacaoID uint64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for id, m := range r.mensagens {
		if m.SolicitacaoID == solicitacaoID {
			delete(r.mensagens, id)
		}
	}

	return nil
}

func (r *RepositorioDeMemoriaMensagem) filtrar(condicao func(models.Mensagem) bool) []models.Mensagem {
	r.mu.RLock()
	defer r.mu.RUnlock()

	filtradas := []models.Mensagem{}
	for _, m := range r.mensagens {
		if condicao(m) {
			filtradas = append(filtradas, m)
		}
	}

	sort.Slice(filtradas, func(i, j int) bool { return filtradas[i].ID < filtradas[j].ID })
	return filtradas
}
