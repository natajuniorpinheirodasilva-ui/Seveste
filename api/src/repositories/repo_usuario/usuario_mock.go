package repo_usuario

import (
	"errors"
	"seveste-api/src/models"
	"strings"
	"sync"
)

type RepositorioDeMemoriaUsuario struct {
	mu       sync.RWMutex
	usuarios map[uint64]models.Usuario
	proxID   uint64
}

func NovoRepositorioDeUsuario() *RepositorioDeMemoriaUsuario {
	return &RepositorioDeMemoriaUsuario{
		usuarios: make(map[uint64]models.Usuario),
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

	return lista, nil
}

func (r *RepositorioDeMemoriaUsuario) BuscarPorID(ID uint64) (*models.Usuario, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var u, existe = r.usuarios[ID]
	if !existe {
		return nil, errors.New("usuario nao encontrado")
	}

	return &u, nil
}

func (r *RepositorioDeMemoriaUsuario) BuscarPorTipo(tipo string) ([]models.Usuario, error) {
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

func (r *RepositorioDeMemoriaUsuario) BuscarPorEmail(email string) (*models.Usuario, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, u := range r.usuarios {
		if u.Email == email {
			return &u, nil
		}
	}

	return nil, errors.New("usuario nao encontrado")
}

func (r *RepositorioDeMemoriaUsuario) Atualizar(ID uint64, input models.AtualizarUsuarioInput) (*models.Usuario, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	var usuario, existe = r.usuarios[ID]
	if !existe {
		return nil, errors.New("usuario nao encontrado")
	}

	if input.Nome != nil {
		usuario.Nome = strings.TrimSpace(*input.Nome)
	}
	if input.Email != nil {
		usuario.Email = strings.TrimSpace(*input.Email)
	}
	if input.Telefone != nil {
		usuario.Telefone = strings.TrimSpace(*input.Telefone)
	}
	if input.UF != nil {
		usuario.UF = strings.TrimSpace(*input.UF)
	}
	if input.Cidade != nil {
		usuario.Cidade = strings.TrimSpace(*input.Cidade)
	}
	if input.RoupasProcuradas != nil {
		usuario.RoupasProcuradas = *input.RoupasProcuradas
	}
	if input.TamanhoRoupa != nil {
		usuario.TamanhoRoupa = strings.TrimSpace(*input.TamanhoRoupa)
	}
	if input.TamanhoCalcado != nil {
		usuario.TamanhoCalcado = *input.TamanhoCalcado
	}

	r.usuarios[ID] = usuario

	return &usuario, nil
}

func (r *RepositorioDeMemoriaUsuario) Deletar(ID uint64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	var _, existe = r.usuarios[ID]
	if !existe {
		return errors.New("usuario nao encontrado")
	}
	delete(r.usuarios, ID)

	return nil
}
