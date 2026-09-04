package repositories

import (
	"seveste-api/src/models"
)

type UsuarioRepositorio interface {
	Criar(usuario *models.Usuario) (*models.Usuario, error)
	BuscarTodos() ([]models.Usuario, error)
	BuscarPorID(ID uint64) (*models.Usuario, error)
	BuscarPorTipo(tipo models.TipoUsuario) ([]models.Usuario, error)
	Deletar(ID uint64) error
}

var UsuarioRepo UsuarioRepositorio
