package controllers

import (
	"net/http"
	"os"
	"seveste-api/src/middlewares"
	"seveste-api/src/repositories/repo_usuario"
	"seveste-api/src/seguranca"
	"strings"

	"github.com/gin-gonic/gin"
)

type credenciaisLogin struct {
	Email string `json:"email" binding:"required,email"`
	Senha string `json:"senha" binding:"required"`
}

// em produção (HTTPS) defina COOKIE_SECURE=true para o cookie só trafegar por conexões seguras
var cookieSeguro = strings.EqualFold(os.Getenv("COOKIE_SECURE"), "true")

// grava o token em um cookie httpOnly, inacessível a scripts da página
func definirCookieDeSessao(c *gin.Context, token string, duracaoSegundos int) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(middlewares.NomeCookieToken, token, duracaoSegundos, "/", "", cookieSeguro, true)
}

func Login(c *gin.Context) {
	var credenciais credenciaisLogin

	if err := c.ShouldBindJSON(&credenciais); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": "informe um e-mail e uma senha validos"})
		return
	}

	var usuario, err = repo_usuario.UsuarioRepo.BuscarPorEmail(credenciais.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"erro": "credenciais invalidas"})
		return
	}

	if err = seguranca.VerificarSenha(credenciais.Senha, usuario.Senha); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"erro": "credenciais invalidas"})
		return
	}

	token, err := seguranca.GerarToken(usuario.ID, usuario.Tipo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": "erro ao gerar token"})
		return
	}

	definirCookieDeSessao(c, token, int(seguranca.DuracaoToken.Seconds()))

	c.JSON(http.StatusOK, gin.H{
		"token":   token,
		"tipo":    usuario.Tipo,
		"nome":    usuario.Nome,
		"usuario": usuario,
	})
}

func Logout(c *gin.Context) {
	definirCookieDeSessao(c, "", -1)
	c.Status(http.StatusNoContent)
}
