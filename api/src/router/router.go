package router

import (
	"seveste-api/src/controllers"
	"seveste-api/src/middlewares"

	"github.com/gin-gonic/gin"
)

func Configurar() *gin.Engine {
	router := gin.Default()

	v1 := router.Group("/api/v1")
	{
		registrarRotasDeUsuario(v1)
		registrarRotasDeLogin(v1)
		registrarRotasDeDoacao(v1)
	}

	return router
}

func registrarRotasDeUsuario(rg *gin.RouterGroup) {
	usuarios := rg.Group("/usuarios")
	{
		usuarios.GET("/", controllers.GetUsuarios)
		usuarios.GET("/:id", controllers.GetUsuario)
		usuarios.POST("/", controllers.CriarUsuario)
		usuarios.Use(middlewares.Autenticar())
		{
			usuarios.Use(middlewares.Autorizacao())
			{
				usuarios.PATCH("/:id", controllers.AtualizarUsuario)
				usuarios.DELETE("/:id", controllers.DeletarUsuario)
			}
		}
	}
}

func registrarRotasDeLogin(rg *gin.RouterGroup) {
	login := rg.Group("/login")
	{
		login.POST("/", controllers.Login)
	}
}

func registrarRotasDeDoacao(rg *gin.RouterGroup) {
	doacoes := rg.Group("/doacoes")
	{
		doacoes.GET("/", controllers.BuscarDoacoes)
		doacoes.GET("/:id", controllers.BuscarDoacao)
		doacoes.Use(middlewares.Autenticar())
		{
			doacoes.POST("/", controllers.CriarDoacao)
			doacoes.Use(middlewares.Autorizacao())
			{
				doacoes.DELETE("/:id", controllers.DeletarDoacao)
			}
		}
	}
}
