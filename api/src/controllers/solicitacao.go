package controllers

import (
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_mensagem"
	"seveste-api/src/repositories/repo_solicitacao"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type solicitacaoInput struct {
	DoacaoID uint64 `json:"id_doacao" binding:"required"`
	// mensagem opcional enviada ao doador junto com a solicitação
	Mensagem string `json:"mensagem"`
}

type respostaSolicitacaoInput struct {
	Status string `json:"status" binding:"required"`
}

type mensagemInput struct {
	Texto string `json:"texto" binding:"required"`
}

// busca a solicitação da rota e garante que o usuário logado participa dela
// (é quem solicitou ou é o dono da doação)
func buscarSolicitacaoDoParticipante(c *gin.Context) (*models.Solicitacao, *models.Doacao, bool) {
	solicitacaoID, ok := lerID(c, "id")
	if !ok {
		return nil, nil, false
	}

	solicitacao, err := repo_solicitacao.SolicitacaoRepo.BuscarPorID(solicitacaoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return nil, nil, false
	}

	doacao, err := repo_doacao.DoacaoRepo.BuscarPorID(solicitacao.DoacaoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": "a doacao desta solicitacao nao existe mais"})
		return nil, nil, false
	}

	tokenID := c.GetUint64("usuario_id")
	if tokenID != solicitacao.UsuarioID && tokenID != doacao.UsuarioID {
		c.JSON(http.StatusForbidden, gin.H{"erro": "você não tem permissão para acessar essa solicitação"})
		return nil, nil, false
	}

	return solicitacao, doacao, true
}

func ordenarSolicitacoes(lista []models.Solicitacao) {
	sort.Slice(lista, func(i, j int) bool { return lista[i].CriadoEm.After(lista[j].CriadoEm) })
}

func BuscarSolicitacao(c *gin.Context) {
	solicitacao, _, ok := buscarSolicitacaoDoParticipante(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, gin.H{"solicitacao": montarRespostaSolicitacao(*solicitacao, c.GetUint64("usuario_id"))})
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

	ordenarSolicitacoes(solicitacoes)
	c.JSON(http.StatusOK, gin.H{"solicitacoes": montarRespostasSolicitacoes(solicitacoes, tokenID)})
}

// solicitações recebidas nas doações do usuário logado
func BuscarSolicitacoesRecebidas(c *gin.Context) {
	var tokenID = c.GetUint64("usuario_id")

	doacoes, err := repo_doacao.DoacaoRepo.BuscarTodas()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": "erro ao buscar solicitações"})
		return
	}

	recebidas := []models.Solicitacao{}
	for _, d := range doacoes {
		if d.UsuarioID != tokenID {
			continue
		}
		daDoacao, _ := repo_solicitacao.SolicitacaoRepo.BuscarPorDoacaoID(d.ID)
		recebidas = append(recebidas, daDoacao...)
	}

	ordenarSolicitacoes(recebidas)
	c.JSON(http.StatusOK, gin.H{"solicitacoes": montarRespostasSolicitacoes(recebidas, tokenID)})
}

// solicitações de uma doação (apenas o dono da doação)
func BuscarSolicitacoesPorDoacao(c *gin.Context) {
	doacao, ok := buscarDoacaoDoUsuario(c)
	if !ok {
		return
	}

	solicitacoes, err := repo_solicitacao.SolicitacaoRepo.BuscarPorDoacaoID(doacao.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": "erro ao buscar solicitações"})
		return
	}

	ordenarSolicitacoes(solicitacoes)
	c.JSON(http.StatusOK, gin.H{"solicitacoes": montarRespostasSolicitacoes(solicitacoes, doacao.UsuarioID)})
}

func CriarSolicitacao(c *gin.Context) {
	var input solicitacaoInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var tokenID = c.GetUint64("usuario_id")
	if c.GetString("usuario_tipo") != models.TipoAcolhido {
		c.JSON(http.StatusForbidden, gin.H{"erro": "somente acolhidos podem solicitar doacoes"})
		return
	}

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

	texto := strings.TrimSpace(input.Mensagem)
	if len(texto) > 1000 {
		c.JSON(http.StatusBadRequest, gin.H{"erro": "a mensagem deve ter no maximo 1000 caracteres"})
		return
	}

	criada, err := repo_solicitacao.SolicitacaoRepo.Criar(&novo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	if texto != "" {
		mensagem := models.Mensagem{SolicitacaoID: criada.ID, UsuarioID: tokenID, Texto: texto, EnviadaEm: time.Now()}
		if mensagem.Preparar() == nil {
			_, _ = repo_mensagem.MensagemRepo.Criar(&mensagem)
		}
	}

	c.JSON(http.StatusCreated, montarRespostaSolicitacao(*criada, tokenID))
}

// ResponderSolicitacao permite ao dono da doação aceitar ou recusar uma solicitação pendente.
// Ao aceitar, a doação é marcada como doada e as demais solicitações pendentes são recusadas.
func ResponderSolicitacao(c *gin.Context) {
	solicitacao, doacao, ok := buscarSolicitacaoDoParticipante(c)
	if !ok {
		return
	}

	tokenID := c.GetUint64("usuario_id")
	if doacao.UsuarioID != tokenID {
		c.JSON(http.StatusForbidden, gin.H{"erro": "somente o doador pode responder a solicitacao"})
		return
	}

	var input respostaSolicitacaoInput
	if err := c.ShouldBindJSON(&input); err != nil {
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
		if _, err := repo_doacao.DoacaoRepo.Salvar(doacao.ID, doacao); err != nil {
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
	atualizada, err := repo_solicitacao.SolicitacaoRepo.Salvar(solicitacao.ID, solicitacao)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, montarRespostaSolicitacao(*atualizada, tokenID))
}

func DeletarSolicitacao(c *gin.Context) {
	solicitacaoID, ok := lerID(c, "id")
	if !ok {
		return
	}

	var solicitacao *models.Solicitacao
	solicitacao, err := repo_solicitacao.SolicitacaoRepo.BuscarPorID(solicitacaoID)
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

	_ = repo_mensagem.MensagemRepo.DeletarPorSolicitacaoID(solicitacaoID)
	if err = repo_solicitacao.SolicitacaoRepo.Deletar(solicitacaoID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// mensagens trocadas dentro de uma solicitação (apenas participantes)
func BuscarMensagens(c *gin.Context) {
	solicitacao, _, ok := buscarSolicitacaoDoParticipante(c)
	if !ok {
		return
	}

	mensagens, err := repo_mensagem.MensagemRepo.BuscarPorSolicitacaoID(solicitacao.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": "erro ao buscar mensagens"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensagens": mensagens})
}

func EnviarMensagem(c *gin.Context) {
	solicitacao, _, ok := buscarSolicitacaoDoParticipante(c)
	if !ok {
		return
	}

	if solicitacao.Status == models.StatusSolicitacaoRecusada {
		c.JSON(http.StatusConflict, gin.H{"erro": "esta solicitacao foi recusada e a conversa foi encerrada"})
		return
	}

	var input mensagemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	nova := models.Mensagem{
		SolicitacaoID: solicitacao.ID,
		UsuarioID:     c.GetUint64("usuario_id"),
		Texto:         input.Texto,
		EnviadaEm:     time.Now(),
	}

	if err := nova.Preparar(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	criada, err := repo_mensagem.MensagemRepo.Criar(&nova)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, criada)
}
