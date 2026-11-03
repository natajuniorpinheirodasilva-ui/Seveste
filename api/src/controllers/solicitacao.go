package controllers

import (
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_solicitacao"
	"strconv"

	"github.com/gin-gonic/gin"
)

func BuscarSolicitacao(c *gin.Context) {
	paramID := c.Param("id")
	solicitacaoID, err := strconv.ParseUint(paramID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var solicitacao *models.Solicitacao
	solicitacao, err = repo_solicitacao.SolicitacaoRepo.BuscarPorID(solicitacaoID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"solicitacao": solicitacao})
}
