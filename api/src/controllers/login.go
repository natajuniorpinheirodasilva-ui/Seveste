package controllers

import (
	"net/http"
	"seveste-api/src/repositories"
	"seveste-api/src/seguranca"

	"github.com/gin-gonic/gin"
)

type credenciaisLogin struct {
	Email string `json:"email" binding:"required,email"`
	Senha string `json:"senha" binding:"required"`
}

func Login(c *gin.Context) {
	var credenciais credenciaisLogin

	if err := c.ShouldBindJSON(&credenciais); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var usuario, err = repositories.UsuarioRepo.BuscarPorEmail(credenciais.Email)
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

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"tipo":  usuario.Tipo,
		"nome":  usuario.Nome,
	})
}
