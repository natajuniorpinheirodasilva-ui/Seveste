package controllers

import (
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_solicitacao"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type solicitacaoInput struct {
	DoacaoID uint64 `json:"id_doacao" binding:"required"`
}

type respostaSolicitacaoInput struct {
	Status string `json:"status" binding:"required"`
}

// exibe uma solicitação (apenas para quem solicitou ou para o dono da doação)
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
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	doacao, err := repo_doacao.DoacaoRepo.BuscarPorID(solicitacao.DoacaoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": "a doacao desta solicitacao nao existe mais"})
		return
	}

	var tokenID = c.GetUint64("usuario_id")
	if tokenID != solicitacao.UsuarioID && tokenID != doacao.UsuarioID {
		c.JSON(http.StatusForbidden, gin.H{"erro": "você não tem permissão para acessar essa solicitação"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"solicitacao": montarRespostaSolicitacao(*solicitacao, tokenID)})
}

// solicitações feitas pelo usuário logado
func BuscarSolicitacoesPorUsuario(c *gin.Context) {
	var tokenID = c.GetUint64("usuario_id")
	if tokenID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"erro": "sessão não identificada"})
		return
	}

	solicitacoes, err := repo_solicitacao.SolicitacaoRepo.BuscarPorUsuarioID(tokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": "erro ao buscar solicitações"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"solicitacoes": montarRespostasSolicitacoes(solicitacoes, tokenID)})
}

// solicitações recebidas nas doações do usuário logado
func BuscarSolicitacoesRecebidas(c *gin.Context) {
	var tokenID = c.GetUint64("usuario_id")
	if tokenID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"erro": "sessão não identificada"})
		return
	}

	recebidas, err := repo_solicitacao.SolicitacaoRepo.BuscarPorDoadorID(tokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": "erro ao buscar solicitações"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"solicitacoes": montarRespostasSolicitacoes(recebidas, tokenID)})
}

// solicitações de uma doação (apenas o dono da doação)
func BuscarSolicitacoesPorDoacao(c *gin.Context) {
	paramID := c.Param("id")
	doacaoID, err := strconv.ParseUint(paramID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	doacao, err := repo_doacao.DoacaoRepo.BuscarPorID(doacaoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	var tokenID = c.GetUint64("usuario_id")
	if doacao.UsuarioID != tokenID {
		c.JSON(http.StatusForbidden, gin.H{"erro": "você não tem permissão para ver as solicitações dessa doação"})
		return
	}

	var solicitacoes []models.Solicitacao
	solicitacoes, err = repo_solicitacao.SolicitacaoRepo.BuscarPorDoacaoID(doacaoID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": "erro ao buscar solicitações"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"solicitacoes": montarRespostasSolicitacoes(solicitacoes, tokenID)})
}

func CriarSolicitacao(c *gin.Context) {
	var input solicitacaoInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var usuarioTipo string = c.GetString("usuario_tipo")
	if usuarioTipo != models.TipoAcolhido {
		c.JSON(http.StatusForbidden, gin.H{"erro": "somente acolhidos podem solicitar doacoes"})
		return
	}
	var tokenID = c.GetUint64("usuario_id")

	doacao, err := repo_doacao.DoacaoRepo.BuscarPorID(input.DoacaoID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": "a doacao selecionada para essa solicitacao nao existe"})
		return
	}

	if doacao.UsuarioID == tokenID {
		c.JSON(http.StatusBadRequest, gin.H{"erro": "voce nao pode solicitar a sua propria doacao"})
		return
	}

	// se já existir uma solicitação ativa, ela é retornada em vez de criar uma duplicada
	existentes, _ := repo_solicitacao.SolicitacaoRepo.BuscarPorDoacaoID(doacao.ID)
	for _, s := range existentes {
		if s.UsuarioID == tokenID && s.Status != models.StatusSolicitacaoRecusada {
			c.JSON(http.StatusOK, montarRespostaSolicitacao(s, tokenID))
			return
		}
	}

	if doacao.Status != models.StatusDoacaoDisponivel {
		c.JSON(http.StatusConflict, gin.H{"erro": "esta doacao nao esta mais disponivel"})
		return
	}

	var novo models.Solicitacao
	novo.Status = models.StatusSolicitacaoPendente
	novo.CriadoEm = time.Now()
	novo.DoacaoID = input.DoacaoID
	novo.UsuarioID = tokenID

	if err := novo.Preparar(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	criada, err := repo_solicitacao.SolicitacaoRepo.Criar(&novo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, montarRespostaSolicitacao(*criada, tokenID))
}

// ResponderSolicitacao permite ao dono da doação aceitar ou recusar uma solicitação pendente.
// Ao aceitar, a doação é marcada como doada e as demais solicitações pendentes são recusadas.
func ResponderSolicitacao(c *gin.Context) {
	paramID := c.Param("id")
	solicitacaoID, err := strconv.ParseUint(paramID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var solicitacao *models.Solicitacao
	solicitacao, err = repo_solicitacao.SolicitacaoRepo.BuscarPorID(solicitacaoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	doacao, err := repo_doacao.DoacaoRepo.BuscarPorID(solicitacao.DoacaoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": "a doacao desta solicitacao nao existe mais"})
		return
	}

	var tokenID = c.GetUint64("usuario_id")
	if doacao.UsuarioID != tokenID {
		c.JSON(http.StatusForbidden, gin.H{"erro": "somente o doador pode responder a solicitacao"})
		return
	}

	var input respostaSolicitacaoInput
	if err = c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	novoStatus := strings.ToUpper(strings.TrimSpace(input.Status))
	if novoStatus != models.StatusSolicitacaoAceita && novoStatus != models.StatusSolicitacaoRecusada {
		c.JSON(http.StatusBadRequest, gin.H{"erro": `status invalido, permitidos: ["ACEITA", "RECUSADA"]`})
		return
	}

	if solicitacao.Status != models.StatusSolicitacaoPendente {
		c.JSON(http.StatusConflict, gin.H{"erro": "esta solicitacao ja foi respondida"})
		return
	}

	if novoStatus == models.StatusSolicitacaoAceita {
		if doacao.Status != models.StatusDoacaoDisponivel {
			c.JSON(http.StatusConflict, gin.H{"erro": "esta doacao ja foi concluida"})
			return
		}

		doacao.Status = models.StatusDoacaoDoada
		if _, err = repo_doacao.DoacaoRepo.Salvar(doacao.ID, doacao); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
			return
		}

		outras, _ := repo_solicitacao.SolicitacaoRepo.BuscarPorDoacaoID(doacao.ID)
		for _, outra := range outras {
			if outra.ID != solicitacao.ID && outra.Status == models.StatusSolicitacaoPendente {
				outra.Status = models.StatusSolicitacaoRecusada
				_, _ = repo_solicitacao.SolicitacaoRepo.Salvar(outra.ID, &outra)
			}
		}
	}

	solicitacao.Status = novoStatus
	atualizada, err := repo_solicitacao.SolicitacaoRepo.Salvar(solicitacaoID, solicitacao)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, montarRespostaSolicitacao(*atualizada, tokenID))
}

func DeletarSolicitacao(c *gin.Context) {
	paramID := c.Param("id")
	solicitacaoID, err := strconv.ParseUint(paramID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var solicitacao *models.Solicitacao
	solicitacao, err = repo_solicitacao.SolicitacaoRepo.BuscarPorID(solicitacaoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	var tokenID = c.GetUint64("usuario_id")
	if tokenID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"erro": "sessão não identificada"})
		return
	}

	if solicitacao.UsuarioID != tokenID {
		c.JSON(http.StatusForbidden, gin.H{"erro": "você não tem permissão para deletar essa solicitação"})
		return
	}

	if solicitacao.Status == models.StatusSolicitacaoAceita {
		c.JSON(http.StatusConflict, gin.H{"erro": "uma solicitacao aceita nao pode ser cancelada"})
		return
	}

	if err = repo_solicitacao.SolicitacaoRepo.Deletar(solicitacaoID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
