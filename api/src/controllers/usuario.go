package controllers

import (
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_usuario"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetUsuarios(c *gin.Context) {
	usuarios, err := repo_usuario.UsuarioRepo.BuscarTodos()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"usuarios": usuarios})
}

func GetUsuario(c *gin.Context) {
	var ID string = c.Param("id")
	var intID, err = strconv.ParseUint(ID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	usuario, err := repo_usuario.UsuarioRepo.BuscarPorID(intID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"usuario": usuario})
}

func CriarUsuario(c *gin.Context) {
	var novo models.Usuario

	if err := c.ShouldBindJSON(&novo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	if err := novo.Preparar("cadastro"); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	criado, err := repo_usuario.UsuarioRepo.Criar(&novo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"criado": criado})
}

func AtualizarUsuario(c *gin.Context) {
	var targetID uint64 = c.GetUint64("target_usuario_id")

	var input models.AtualizacaoUsuario
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	usuario, err := repo_usuario.UsuarioRepo.BuscarPorID(targetID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": "usuario nao encontrado"})
		return
	}

	if err = usuario.Mesclar(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	atualizado, err := repo_usuario.UsuarioRepo.Salvar(targetID, usuario)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, atualizado)
}

func DeletarUsuario(c *gin.Context) {
	var targetID uint64 = c.GetUint64("target_usuario_id")

	err := repo_usuario.UsuarioRepo.Deletar(targetID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
