package controllers

import (
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetUsuarios(c *gin.Context) {
	usuarios, err := repositories.UsuarioRepo.BuscarTodos()
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	usuario, err := repositories.UsuarioRepo.BuscarPorID(intID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"usuario": usuario})
}

func CriarUsuario(c *gin.Context) {
	var usuario models.Usuario

	if err := c.ShouldBindJSON(&usuario); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	criado, err := repositories.UsuarioRepo.Criar(&usuario)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"criado": criado})
}

func AtualizarUsuario(c *gin.Context) {
	var ID string = c.Param("id")
	var intID, err = strconv.ParseUint(ID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var novo models.Usuario
	if err = c.ShouldBindJSON(&novo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	atualizado, err := repositories.UsuarioRepo.Atualizar(intID, novo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, atualizado)
}

func DeletarUsuario(c *gin.Context) {
	var ID string = c.Param("id")
	var intID, err = strconv.ParseUint(ID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	err = repositories.UsuarioRepo.Deletar(intID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
