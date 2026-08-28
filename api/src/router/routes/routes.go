package routes

import (
	"github.com/gin-gonic/gin"
)

func Configurar(router *gin.Engine) *gin.Engine {
	ConfigurarRotasUsuario(router)

	return router
}
