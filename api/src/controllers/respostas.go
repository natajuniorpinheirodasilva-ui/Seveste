package controllers

import (
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_avaliacao"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_favorito"
	"seveste-api/src/repositories/repo_mensagem"
	"seveste-api/src/repositories/repo_solicitacao"
	"seveste-api/src/repositories/repo_usuario"
	"strconv"

	"github.com/gin-gonic/gin"
)

// lê um parâmetro numérico da rota, respondendo 400 se ele for inválido
func lerID(c *gin.Context, nome string) (uint64, bool) {
	id, err := strconv.ParseUint(c.Param(nome), 10, 64)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"erro": "o id informado e invalido"})
		return 0, false
	}

	return id, true
}

// busca os dados públicos de um usuário; retorna nil se ele não existir mais
func usuarioPublico(id uint64) *models.UsuarioPublico {
	usuario, err := repo_usuario.UsuarioRepo.BuscarPorID(id)
	if err != nil {
		return nil
	}

	publico := usuario.Publico()
	return &publico
}

type respostaDoacao struct {
	models.Doacao
	Doador            *models.UsuarioPublico `json:"doador"`
	TotalSolicitacoes int                    `json:"total_solicitacoes"`
	Favoritada        bool                   `json:"favoritada"`
}

func montarRespostaDoacao(d models.Doacao, usuarioLogadoID uint64) respostaDoacao {
	if d.Fotos == nil {
		d.Fotos = []string{}
	}

	solicitacoes, _ := repo_solicitacao.SolicitacaoRepo.BuscarPorDoacaoID(d.ID)

	return respostaDoacao{
		Doacao:            d,
		Doador:            usuarioPublico(d.UsuarioID),
		TotalSolicitacoes: len(solicitacoes),
		Favoritada:        usuarioLogadoID != 0 && repo_favorito.FavoritoRepo.Existe(usuarioLogadoID, d.ID),
	}
}

type resumoDoacao struct {
	ID        uint64   `json:"id_doacao"`
	Titulo    string   `json:"titulo"`
	Status    string   `json:"status"`
	Fotos     []string `json:"fotos"`
	UsuarioID uint64   `json:"usuario_id"`
}

type respostaSolicitacao struct {
	models.Solicitacao
	Doacao         *resumoDoacao          `json:"doacao"`
	Solicitante    *models.UsuarioPublico `json:"solicitante"`
	Doador         *models.UsuarioPublico `json:"doador"`
	UltimaMensagem *models.Mensagem       `json:"ultima_mensagem"`
	AvaliadaPorMim bool                   `json:"avaliada_por_mim"`
}

func montarRespostaSolicitacao(s models.Solicitacao, usuarioLogadoID uint64) respostaSolicitacao {
	resposta := respostaSolicitacao{
		Solicitacao: s,
		Solicitante: usuarioPublico(s.UsuarioID),
	}

	if doacao, err := repo_doacao.DoacaoRepo.BuscarPorID(s.DoacaoID); err == nil {
		fotos := doacao.Fotos
		if fotos == nil {
			fotos = []string{}
		}
		resposta.Doacao = &resumoDoacao{
			ID:        doacao.ID,
			Titulo:    doacao.Titulo,
			Status:    doacao.Status,
			Fotos:     fotos,
			UsuarioID: doacao.UsuarioID,
		}
		resposta.Doador = usuarioPublico(doacao.UsuarioID)
	}

	if mensagens, _ := repo_mensagem.MensagemRepo.BuscarPorSolicitacaoID(s.ID); len(mensagens) > 0 {
		ultima := mensagens[len(mensagens)-1]
		resposta.UltimaMensagem = &ultima
	}

	if _, err := repo_avaliacao.AvaliacaoRepo.BuscarPorSolicitacaoEAutor(s.ID, usuarioLogadoID); err == nil {
		resposta.AvaliadaPorMim = true
	}

	return resposta
}

func montarRespostasSolicitacoes(lista []models.Solicitacao, usuarioLogadoID uint64) []respostaSolicitacao {
	respostas := make([]respostaSolicitacao, 0, len(lista))
	for _, s := range lista {
		respostas = append(respostas, montarRespostaSolicitacao(s, usuarioLogadoID))
	}

	return respostas
}
