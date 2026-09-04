package router

import (
	"seveste-api/src/controllers"

	"github.com/gin-gonic/gin"
)

type Controllers struct {
	Usuario *controllers.UsuarioController
}

func Configurar(c Controllers) *gin.Engine {
	router := gin.Default()

	v1 := router.Group("/api/v1")
	{
		registrarRotasDeUsuario(v1, c.Usuario)
	}

	return router
}

func registrarRotasDeUsuario(rg *gin.RouterGroup, c *controllers.UsuarioController) {
	usuarios := rg.Group("/usuarios")
	{
		usuarios.GET("/", c.GetUsuarios)
		usuarios.GET("/:id", c.GetUsuario)
		usuarios.POST("/", c.CriarUsuario)
	}
}
