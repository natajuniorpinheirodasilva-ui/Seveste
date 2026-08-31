package router

import (
	"seveste-api/src/router/routes"

	"github.com/gin-gonic/gin"
)

func Gerar() *gin.Engine {
	router := gin.Default()

	return routes.Configurar(router)
}
