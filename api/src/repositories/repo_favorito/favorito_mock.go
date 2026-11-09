package repo_favorito

import (
	"sort"
	"sync"
	"time"
)

type RepositorioDeMemoriaFavorito struct {
	mu sync.RWMutex
	// usuarioID -> doacaoID -> data em que foi favoritada
	favoritos map[uint64]map[uint64]time.Time
}

func NovoRepositorioDeFavorito() *RepositorioDeMemoriaFavorito {
	return &RepositorioDeMemoriaFavorito{
		favoritos: make(map[uint64]map[uint64]time.Time),
	}
}

func (r *RepositorioDeMemoriaFavorito) Adicionar(usuarioID, doacaoID uint64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.favoritos[usuarioID] == nil {
		r.favoritos[usuarioID] = make(map[uint64]time.Time)
	}
	if _, existe := r.favoritos[usuarioID][doacaoID]; !existe {
		r.favoritos[usuarioID][doacaoID] = time.Now()
	}

	return nil
}

func (r *RepositorioDeMemoriaFavorito) Remover(usuarioID, doacaoID uint64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.favoritos[usuarioID], doacaoID)
	return nil
}

// retorna os ids das doações favoritadas, das mais recentes para as mais antigas
func (r *RepositorioDeMemoriaFavorito) BuscarPorUsuarioID(usuarioID uint64) ([]uint64, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	ids := make([]uint64, 0, len(r.favoritos[usuarioID]))
	for id := range r.favoritos[usuarioID] {
		ids = append(ids, id)
	}

	datas := r.favoritos[usuarioID]
	sort.Slice(ids, func(i, j int) bool { return datas[ids[i]].After(datas[ids[j]]) })

	return ids, nil
}

func (r *RepositorioDeMemoriaFavorito) Existe(usuarioID, doacaoID uint64) bool {
	r.mu.RLock()
	defer r.mu.RUnlock()

	_, existe := r.favoritos[usuarioID][doacaoID]
	return existe
}

func (r *RepositorioDeMemoriaFavorito) RemoverPorDoacaoID(doacaoID uint64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	for _, doacoes := range r.favoritos {
		delete(doacoes, doacaoID)
	}

	return nil
}

func (r *RepositorioDeMemoriaFavorito) RemoverPorUsuarioID(usuarioID uint64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.favoritos, usuarioID)
	return nil
}
