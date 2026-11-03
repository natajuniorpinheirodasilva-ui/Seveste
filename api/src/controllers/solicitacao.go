package controllers

import (
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_solicitacao"
	"strconv"
	"time"

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

func CriarSolicitacao(c *gin.Context) {
	var novo models.Solicitacao

	if err := c.ShouldBindJSON(&novo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	novo.CriadoEm = time.Now()
	novo.IDUsuario = c.GetUint64("usuario_id")
	if _, err := repo_solicitacao.SolicitacaoRepo.BuscarPorID(novo.IDDoacao); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": "a doacao selecionada para essa solicitacao nao existe"})
		return
	}

	if err := novo.Preparar(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	criada, err := repo_solicitacao.SolicitacaoRepo.Criar(&novo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
	}

	c.JSON(http.StatusCreated, criada)
}
