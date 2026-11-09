package repo_usuario

import (
	"errors"
	"seveste-api/src/models"
)

var ErrEmailEmUso = errors.New("este e-mail ja esta cadastrado")

type UsuarioRepositorio interface {
	Criar(usuario *models.Usuario) (*models.Usuario, error)
	BuscarTodos() ([]models.Usuario, error)
	BuscarPorID(ID uint64) (*models.Usuario, error)
	BuscarPorTipo(tipo string) ([]models.Usuario, error)
	BuscarPorEmail(email string) (*models.Usuario, error)
	Salvar(ID uint64, novo *models.Usuario) (*models.Usuario, error)
	Deletar(ID uint64) error
}

var UsuarioRepo UsuarioRepositorio
