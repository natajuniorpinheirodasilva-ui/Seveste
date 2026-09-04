package repositories

import (
	"errors"
	"seveste-api/src/models"
	"sync"
)

type RepositorioDeMemoriaUsuario struct {
	mu       sync.RWMutex
	usuarios map[int]models.Usuario
	proxID   int
}

func NovoRepositorioDeUsuario() *RepositorioDeMemoriaUsuario {
	return &RepositorioDeMemoriaUsuario{
		usuarios: make(map[int]models.Usuario),
		proxID:   1,
	}
}

func (r *RepositorioDeMemoriaUsuario) Criar(u *models.Usuario) (*models.Usuario, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	u.ID = r.proxID
	r.usuarios[u.ID] = *u
	r.proxID++

	return u, nil
}

func (r *RepositorioDeMemoriaUsuario) BuscarTodos() ([]models.Usuario, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var lista = make([]models.Usuario, 0, len(r.usuarios))
	for _, usuario := range r.usuarios {
		lista = append(lista, usuario)
	}

	if len(lista) <= 0 {
		return nil, errors.New("nenhum usuario encontrado")
	}

	return lista, nil
}

func (r *RepositorioDeMemoriaUsuario) BuscarPorID(ID int) (*models.Usuario, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var u, existe = r.usuarios[ID]
	if !existe {
		return nil, errors.New("usuario nao encontrado")
	}

	return &u, nil
}

func (r *RepositorioDeMemoriaUsuario) BuscarPorTipo(tipo models.TipoUsuario) ([]models.Usuario, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var filtrados []models.Usuario
	for _, u := range r.usuarios {
		if u.Tipo == tipo {
			filtrados = append(filtrados, u)
		}
	}

	return filtrados, nil
}
