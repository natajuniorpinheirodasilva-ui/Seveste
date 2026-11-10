package controllers

import (
	"errors"
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_avaliacao"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_solicitacao"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type avaliacaoInput struct {
	SolicitacaoID uint64 `json:"id_solicitacao" binding:"required"`
	Nota          uint8  `json:"nota" binding:"required"`
	Comentario    string `json:"comentario"`
}

type respostaAvaliacao struct {
	models.Avaliacao
	Autor *models.UsuarioPublico `json:"autor"`
}

// CriarAvaliacao permite que cada participante de uma doação concluída avalie a outra parte uma única vez
func CriarAvaliacao(c *gin.Context) {
	var input avaliacaoInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	solicitacao, err := repo_solicitacao.SolicitacaoRepo.BuscarPorID(input.SolicitacaoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	doacao, err := repo_doacao.DoacaoRepo.BuscarPorID(solicitacao.DoacaoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": "a doacao desta solicitacao nao existe mais"})
		return
	}

	if solicitacao.Status != models.StatusSolicitacaoAceita {
		c.JSON(http.StatusConflict, gin.H{"erro": "so e possivel avaliar doacoes concluidas"})
		return
	}

	tokenID := c.GetUint64("usuario_id")
	var avaliadoID uint64
	switch tokenID {
	case solicitacao.UsuarioID:
		avaliadoID = doacao.UsuarioID
	case doacao.UsuarioID:
		avaliadoID = solicitacao.UsuarioID
	default:
		c.JSON(http.StatusForbidden, gin.H{"erro": "você não participou desta doação"})
		return
	}

	nova := models.Avaliacao{
		SolicitacaoID: solicitacao.ID,
		AutorID:       tokenID,
		AvaliadoID:    avaliadoID,
		Nota:          input.Nota,
		Comentario:    input.Comentario,
		CriadoEm:      time.Now(),
	}

	if err = nova.Preparar(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	criada, err := repo_avaliacao.AvaliacaoRepo.Criar(&nova)
	if errors.Is(err, repo_avaliacao.ErrAvaliacaoDuplicada) {
		c.JSON(http.StatusConflict, gin.H{"erro": err.Error()})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, criada)
}

// avaliações recebidas por um usuário, com a média das notas
func BuscarAvaliacoesDoUsuario(c *gin.Context) {
	var ID string = c.Param("id")
	var usuarioID, err = strconv.ParseUint(ID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	avaliacoes, err := repo_avaliacao.AvaliacaoRepo.BuscarPorAvaliadoID(usuarioID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": "erro ao buscar avaliacoes"})
		return
	}

	// cada autor é buscado uma única vez, mesmo que tenha feito várias avaliações
	cache := novoCache()
	respostas := make([]respostaAvaliacao, 0, len(avaliacoes))
	for _, a := range avaliacoes {
		respostas = append(respostas, respostaAvaliacao{Avaliacao: a, Autor: cache.usuarioPublico(a.AutorID)})
	}

	media, total := mediaDeAvaliacoes(avaliacoes)
	c.JSON(http.StatusOK, gin.H{"avaliacoes": respostas, "media": media, "total": total})
}

func mediaDeAvaliacoes(avaliacoes []models.Avaliacao) (float64, int) {
	if len(avaliacoes) == 0 {
		return 0, 0
	}

	soma := 0
	for _, a := range avaliacoes {
		soma += int(a.Nota)
	}

	return float64(soma) / float64(len(avaliacoes)), len(avaliacoes)
}
