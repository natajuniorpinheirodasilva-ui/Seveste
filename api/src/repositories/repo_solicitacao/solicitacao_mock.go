package repo_solicitacao

import (
	"errors"
	"seveste-api/src/models"
	"sync"
)

type RepositorioDeMemoriaSolicitacao struct {
	mu           sync.RWMutex
	solicitacoes map[uint64]models.Solicitacao
	proxID       uint64
}

func NovoRepositorioDeSolicitacao() *RepositorioDeMemoriaSolicitacao {
	return &RepositorioDeMemoriaSolicitacao{
		solicitacoes: make(map[uint64]models.Solicitacao),
		proxID:       1,
	}
}

func (r *RepositorioDeMemoriaSolicitacao) Criar(solicitacao *models.Solicitacao) (*models.Solicitacao, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	solicitacao.ID = r.proxID
	r.solicitacoes[solicitacao.ID] = *solicitacao
	r.proxID++

	return solicitacao, nil
}

func (r *RepositorioDeMemoriaSolicitacao) BuscarPorID(solicitacaoID uint64) (*models.Solicitacao, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var s, existe = r.solicitacoes[solicitacaoID]
	if !existe {
		return nil, errors.New("solicitacao nao encontrada")
	}

	return &s, nil
}

func (r *RepositorioDeMemoriaSolicitacao) BuscarPorDoacaoID(doacaoID uint64) ([]models.Solicitacao, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var filtrados []models.Solicitacao
	for _, s := range r.solicitacoes {
		if s.DoacaoID == doacaoID {
			filtrados = append(filtrados, s)
		}
	}

	return filtrados, nil
}

func (r *RepositorioDeMemoriaSolicitacao) BuscarPorUsuarioID(usuarioID uint64) ([]models.Solicitacao, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var filtrados []models.Solicitacao
	for _, s := range r.solicitacoes {
		if s.UsuarioID == usuarioID {
			filtrados = append(filtrados, s)
		}
	}

	return filtrados, nil
}

func (r *RepositorioDeMemoriaSolicitacao) Salvar(solicitacaoID uint64, nova *models.Solicitacao) (*models.Solicitacao, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	var _, existe = r.solicitacoes[solicitacaoID]
	if !existe {
		return nil, errors.New("solitacao nao encontrada")
	}

	r.solicitacoes[solicitacaoID] = *nova

	return nova, nil
}

func (r *RepositorioDeMemoriaSolicitacao) Deletar(solicitacaoID uint64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	var _, existe = r.solicitacoes[solicitacaoID]
	if !existe {
		return errors.New("solicitacao nao encontrada")
	}
	delete(r.solicitacoes, solicitacaoID)

	return nil
}
