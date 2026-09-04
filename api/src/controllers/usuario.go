package controllers

import (
	"fmt"
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories"
	"strconv"

	"github.com/gin-gonic/gin"
)

type UsuarioController struct {
	repo repositories.UsuarioRepositorio
}

func NovoControllerDeUsuario(repo repositories.UsuarioRepositorio) *UsuarioController {
	return &UsuarioController{repo: repo}
}

func (controller *UsuarioController) GetUsuarios(c *gin.Context) {
	usuarios, err := controller.repo.BuscarTodos()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": fmt.Sprintf("%s", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"usuarios": usuarios})
}

func (controller *UsuarioController) GetUsuario(c *gin.Context) {
	var ID string = c.Param("id")
	var intID, err = strconv.Atoi(ID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("%s", err)})
		return
	}

	usuario, err := controller.repo.BuscarPorID(intID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": fmt.Sprintf("%s", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"usuario": usuario})
}

func (controller *UsuarioController) CriarUsuario(c *gin.Context) {
	var usuario models.Usuario

	if err := c.ShouldBindJSON(&usuario); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("%s", err)})
		return
	}

	criado, err := controller.repo.Criar(&usuario)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": fmt.Sprintf("%s", err)})
	}

	c.JSON(http.StatusCreated, gin.H{"criado": criado})
}
