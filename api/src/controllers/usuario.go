package controllers

import (
	"fmt"
	"net/http"

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
