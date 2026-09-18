package controllers

import (
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_doacao"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DoacaoInput struct {
	Titulo    string `json:"titulo" binding:"required"`
	Descricao string `json:"descricao" binding:"required"`
	Categoria string `json:"categoria" binding:"required"`
	Tamanho   string `json:"tamanho" binding:"required"`
	Estado    string `json:"estado" binding:"required"`
}

func BuscarDoacoes(c *gin.Context) {
	doacoes, err := repo_doacao.DoacaoRepo.BuscarTodas()
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{"doacoes": doacoes})
}

func BuscarDoacao(c *gin.Context) {
	var ID string = c.Param("id")
	intID, err := strconv.ParseUint(ID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var doacao *models.Doacao
	doacao, err = repo_doacao.DoacaoRepo.BuscarPorID(intID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"doacao": doacao})
}

func CriarDoacao(c *gin.Context) {
	var input DoacaoInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var nova models.Doacao
	nova.Titulo = input.Titulo
	nova.Descricao = input.Descricao
	nova.Categoria = input.Categoria
	nova.Tamanho = input.Tamanho
	nova.Estado = input.Estado
	nova.Status = "criada"

	var usuarioID uint64 = c.GetUint64("usuario_id")
	nova.UsuarioID = usuarioID

	err := nova.Preparar()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	criado, err := repo_doacao.DoacaoRepo.Criar(&nova)
	if err != nil {
		c.JSON(http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusCreated, gin.H{"criado": criado})
}
