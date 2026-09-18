package main

import (
	"seveste-api/src/repositories"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_usuario"
	"seveste-api/src/router"
)

func main() {
	repo_usuario.UsuarioRepo = repo_usuario.NovoRepositorioDeUsuario()
	repo_doacao.DoacaoRepo = repo_doacao.NovoRepositorioDeDoacao()
	repositories.InserirDados()

	router := router.Configurar()
	router.Run()
}
