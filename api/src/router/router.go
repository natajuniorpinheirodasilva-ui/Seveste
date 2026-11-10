package router

import (
	"seveste-api/src/controllers"
	"seveste-api/src/middlewares"

	"github.com/gin-gonic/gin"
)

// As rotas são registradas sem barra final (ex.: "/api/v1/doacoes") para evitar redirecionamentos,
// já que o front-end acessa a API através do proxy do Next.js (/api/* -> esta API).
func Configurar() *gin.Engine {
	router := gin.Default()
	router.MaxMultipartMemory = 8 << 20

	v1 := router.Group("/api/v1")
	{
		v1.GET("/saude", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

		// fotos das doações (guardadas no banco)
		v1.GET("/uploads/:nome", controllers.ServirFoto)

		registrarRotasDeUsuario(v1)
		registrarRotasDeLogin(v1)
		registrarRotasDeDoacao(v1)
		registrarRotasDeSolicitacao(v1)
		registrarRotasDeAvaliacao(v1)
		registrarRotasDeFavorito(v1)
	}

	return router
}

func registrarRotasDeUsuario(rg *gin.RouterGroup) {
	usuarios := rg.Group("/usuarios")
	{
		usuarios.GET("", controllers.GetUsuarios)
		usuarios.POST("", controllers.CriarUsuario)
		usuarios.GET("/:id", controllers.GetUsuario)
		usuarios.GET("/:id/avaliacoes", controllers.BuscarAvaliacoesDoUsuario)

		autenticado := usuarios.Group("", middlewares.Autenticar())
		{
			autenticado.GET("/me", controllers.BuscarUsuarioLogado)
			autenticado.GET("/me/dados", controllers.ExportarDados)

			dono := autenticado.Group("", middlewares.Autorizacao())
			{
				dono.PATCH("/:id", controllers.AtualizarUsuario)
				dono.DELETE("/:id", controllers.DeletarUsuario)
			}
		}
	}
}

func registrarRotasDeLogin(rg *gin.RouterGroup) {
	rg.POST("/login", controllers.Login)
	rg.POST("/logout", controllers.Logout)
}

func registrarRotasDeDoacao(rg *gin.RouterGroup) {
	doacoes := rg.Group("/doacoes")
	{
		publico := doacoes.Group("", middlewares.AutenticarOpcional())
		{
			publico.GET("", controllers.BuscarDoacoes)
			publico.GET("/:id", controllers.BuscarDoacao)
		}

		autenticado := doacoes.Group("", middlewares.Autenticar())
		{
			autenticado.GET("/:id/solicitacoes", controllers.BuscarSolicitacoesPorDoacao)

			autenticado.POST("", controllers.CriarDoacao)
			autenticado.PATCH("/:id", controllers.AtualizarDoacao)
			autenticado.DELETE("/:id", controllers.DeletarDoacao)

			autenticado.POST("/:id/fotos", controllers.AdicionarFotos)
			autenticado.DELETE("/:id/fotos/:nome", controllers.RemoverFoto)
		}
	}
}

func registrarRotasDeSolicitacao(rg *gin.RouterGroup) {
	solicitacoes := rg.Group("/solicitacoes", middlewares.Autenticar())
	{
		solicitacoes.GET("/minhas", controllers.BuscarSolicitacoesPorUsuario)
		solicitacoes.GET("/recebidas", controllers.BuscarSolicitacoesRecebidas)
		solicitacoes.GET("/:id", controllers.BuscarSolicitacao)
		solicitacoes.POST("", controllers.CriarSolicitacao)
		solicitacoes.PATCH("/:id", controllers.ResponderSolicitacao)
		solicitacoes.DELETE("/:id", controllers.DeletarSolicitacao)
	}
}

func registrarRotasDeAvaliacao(rg *gin.RouterGroup) {
	avaliacoes := rg.Group("/avaliacoes", middlewares.Autenticar())
	{
		avaliacoes.POST("", controllers.CriarAvaliacao)
	}
}

func registrarRotasDeFavorito(rg *gin.RouterGroup) {
	favoritos := rg.Group("/favoritos", middlewares.Autenticar())
	{
		favoritos.GET("", controllers.BuscarFavoritos)
		favoritos.POST("/:id", controllers.AdicionarFavorito)
		favoritos.DELETE("/:id", controllers.RemoverFavorito)
	}
}
