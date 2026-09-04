package repositories

import (
	"seveste-api/src/models"
)

type UsuarioRepositorio interface {
	Criar(usuario *models.Usuario) (*models.Usuario, error)
	BuscarTodos() ([]models.Usuario, error)
	BuscarPorID(ID int) (*models.Usuario, error)
	BuscarPorTipo(tipo models.TipoUsuario) ([]models.Usuario, error)
}
