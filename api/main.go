package main

import (
	"seveste-api/src/controllers"
	"seveste-api/src/repositories"
	"seveste-api/src/router"
)

func main() {
	repo := repositories.NovoRepositorioDeUsuario()
	usuarioCtrl := controllers.NovoControllerDeUsuario(repo)

	router := router.Configurar(router.Controllers{
		Usuario: usuarioCtrl,
	})
	router.Run()
}
