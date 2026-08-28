package routes

import (
	"seveste-api/src/controllers"

	"github.com/gin-gonic/gin"
)

func ConfigurarRotasUsuario(route *gin.Engine) {
	var usuarios *gin.RouterGroup = route.Group("/usuarios")
	usuarios.GET("/", controllers.GetUsuarios)
	usuarios.GET("/:nome", controllers.GetUsuario)
}
