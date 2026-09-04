package routes

import (
	"seveste-api/src/controllers"
	"seveste-api/src/repositories"

	"github.com/gin-gonic/gin"
)

func ConfigurarRotasUsuario(route *gin.Engine) {
	var repo = repositories.NovoRepositorioDeUsuario()
	var controller = controllers.NovoControllerDeUsuario(repo)

	var usuarios *gin.RouterGroup = route.Group("/usuarios")
	usuarios.GET("/", controller.GetUsuarios)
	usuarios.GET("/:id", controller.GetUsuario)
	usuarios.POST("/", controller.CriarUsuario)
}
