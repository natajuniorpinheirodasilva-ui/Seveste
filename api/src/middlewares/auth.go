package middlewares

import (
	"net/http"
	"seveste-api/src/seguranca"
	"strings"

	"github.com/gin-gonic/gin"
)

func Autenticar() gin.HandlerFunc {
	return func(c *gin.Context) {
		cabecalho := c.GetHeader("Authorization")
		if cabecalho == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"erro": "o token de autenticacao e obrigatorio"})
			c.Abort()
			return
		}

		partes := strings.Split(cabecalho, " ")
		if len(partes) != 2 || partes[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"erro": "o token de autenticacao fornecido e invalido"})
			c.Abort()
			return
		}

		claims, err := seguranca.ValidarToken(partes[1])
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"erro": err.Error()})
			c.Abort()
			return
		}

		c.Set("usuario_id", claims.UsuarioID)
		c.Set("usuario_tipo", claims.Tipo)

		c.Next()
	}
}
