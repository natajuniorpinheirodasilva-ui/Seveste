package controllers

import (
	"fmt"
	"net/http"
	"seveste-api/src/models"

	"github.com/gin-gonic/gin"
)

func GetUsuarios(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "GET /usuarios",
	})
}

func GetUsuario(c *gin.Context) {
	var nome string = c.Param("nome")

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("GET /usuarios/%s", nome),
	})
}

func CriarUsuario(c *gin.Context) {
	var novo models.Doador

	if err := c.ShouldBindJSON(&novo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"mensagem": novo})
}
