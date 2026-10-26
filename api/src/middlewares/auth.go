package middlewares

import (
	"net/http"
	"seveste-api/src/seguranca"
	"strconv"
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

func Autorizacao() gin.HandlerFunc {
	return func(c *gin.Context) {
		var ID string = c.Param("id")
		var targetID, err = strconv.ParseUint(ID, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
			c.Abort()
			return
		}

		var tokenID, existe = c.Get("usuario_id")
		if !existe {
			c.JSON(http.StatusUnauthorized, gin.H{"erro": "sessao nao identificada"})
			c.Abort()
			return
		}

		if targetID != tokenID {
			c.JSON(http.StatusUnauthorized, gin.H{"erro": "sem permissao para realizar esta operacao"})
			c.Abort()
			return
		}

		c.Set("target_usuario_id", targetID)
		c.Next()
	}
}
