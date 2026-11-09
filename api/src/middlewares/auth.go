package middlewares

import (
	"errors"
	"net/http"
	"seveste-api/src/seguranca"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// nome do cookie httpOnly usado pelo front-end para manter a sessão
const NomeCookieToken = "seveste_token"

// extrai o token do cabeçalho Authorization (Bearer) ou, se ausente, do cookie de sessão
func extrairToken(c *gin.Context) (string, error) {
	cabecalho := c.GetHeader("Authorization")
	if cabecalho != "" {
		partes := strings.Split(cabecalho, " ")
		if len(partes) != 2 || partes[0] != "Bearer" {
			return "", errors.New("o token de autenticacao fornecido e invalido")
		}
		return partes[1], nil
	}

	if cookie, err := c.Cookie(NomeCookieToken); err == nil && cookie != "" {
		return cookie, nil
	}

	return "", errors.New("o token de autenticacao e obrigatorio")
}

func Autenticar() gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := extrairToken(c)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"erro": err.Error()})
			c.Abort()
			return
		}

		claims, err := seguranca.ValidarToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"erro": "sessao expirada ou invalida"})
			c.Abort()
			return
		}

		c.Set("usuario_id", claims.UsuarioID)
		c.Set("usuario_tipo", claims.Tipo)

		c.Next()
	}
}

// AutenticarOpcional identifica o usuário quando houver um token válido, mas não bloqueia a requisição.
// Usado em rotas públicas que exibem informações extras para quem está logado (ex.: favoritos).
func AutenticarOpcional() gin.HandlerFunc {
	return func(c *gin.Context) {
		if token, err := extrairToken(c); err == nil {
			if claims, err := seguranca.ValidarToken(token); err == nil {
				c.Set("usuario_id", claims.UsuarioID)
				c.Set("usuario_tipo", claims.Tipo)
			}
		}

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

		var tokenID = c.GetUint64("usuario_id")
		if tokenID == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{"erro": "sessao nao identificada"})
			c.Abort()
			return
		}

		if targetID != tokenID {
			c.JSON(http.StatusForbidden, gin.H{"erro": "sem permissao para realizar esta operacao"})
			c.Abort()
			return
		}

		c.Set("target_usuario_id", targetID)
		c.Next()
	}
}
