package router

import (
	"seveste-api/src/controllers"

	"github.com/gin-gonic/gin"
)

func Configurar() *gin.Engine {
	router := gin.Default()

	v1 := router.Group("/api/v1")
	{
		registrarRotasDeUsuario(v1)
	}

	return router
}

func registrarRotasDeUsuario(rg *gin.RouterGroup) {
	usuarios := rg.Group("/usuarios")
	{
		usuarios.GET("/", controllers.GetUsuarios)
		usuarios.GET("/:id", controllers.GetUsuario)
		usuarios.POST("/", controllers.CriarUsuario)
		usuarios.DELETE("/:id", controllers.DeletarUsuario)
	}
}
