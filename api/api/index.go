// Função serverless da Vercel. O vercel.json redireciona todas as rotas para cá,
// e o Gin cuida do roteamento normalmente (/api/v1/...).
package handler

import (
	"net/http"
	"seveste-api/src/app"
	"sync"

	"github.com/gin-gonic/gin"
)

var (
	inicializar sync.Once
	router      *gin.Engine
	erroInicio  error
)

func Handler(w http.ResponseWriter, r *http.Request) {
	// a API é montada uma única vez por instância da função (no "cold start")
	inicializar.Do(func() {
		gin.SetMode(gin.ReleaseMode)
		router, erroInicio = app.Iniciar()
	})

	if erroInicio != nil {
		http.Error(w, `{"erro":"servidor indisponivel"}`, http.StatusServiceUnavailable)
		return
	}

	router.ServeHTTP(w, r)
}
