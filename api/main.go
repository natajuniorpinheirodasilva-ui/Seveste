package main

import (
	"seveste-api/src/repositories"
	"seveste-api/src/router"
)

func main() {
	repositories.UsuarioRepo = repositories.NovoRepositorioDeUsuario()

	router := router.Configurar()
	router.Run()
}
