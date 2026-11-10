package controllers

import (
	"errors"
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_avaliacao"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_favorito"
	"seveste-api/src/repositories/repo_solicitacao"
	"seveste-api/src/repositories/repo_usuario"
	"seveste-api/src/seguranca"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// versão da política de privacidade aceita no cadastro (atualize junto com a página /privacy-policy)
const VersaoPoliticaPrivacidade = "2026-11.2"

type usuarioInput struct {
	Nome     string `json:"nome" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Senha    string `json:"senha" binding:"required,min=8,max=72"`
	Telefone string `json:"telefone"`
	Tipo     string `json:"tipo" binding:"required"`

	// endereço completo (obrigatório)
	Rua         string `json:"rua" binding:"required"`
	Numero      string `json:"numero" binding:"required"`
	Complemento string `json:"complemento"`
	Cidade      string `json:"cidade" binding:"required"`
	UF          string `json:"uf" binding:"required"`

	RoupasProcuradas []string `json:"roupas_procuradas"`
	TamanhoRoupa     string   `json:"tamanho_roupa"`
	TamanhoCalcado   uint8    `json:"tamanho_calcado"`

	// LGPD: o cadastro só é aceito com o consentimento explícito do titular
	AceitePrivacidade bool `json:"aceite_privacidade"`
}

type estatisticasUsuario struct {
	DoacoesRealizadas int     `json:"doacoes_realizadas"`
	DoacoesRecebidas  int     `json:"doacoes_recebidas"`
	MediaAvaliacoes   float64 `json:"media_avaliacoes"`
	TotalAvaliacoes   int     `json:"total_avaliacoes"`
}

func calcularEstatisticas(usuarioID uint64) estatisticasUsuario {
	var estatisticas estatisticasUsuario

	doadas, err := repo_doacao.DoacaoRepo.Buscar(repo_doacao.FiltroDoacao{UsuarioID: usuarioID, Status: models.StatusDoacaoDoada})
	if err == nil {
		estatisticas.DoacoesRealizadas = len(doadas)
	}

	if solicitacoes, err := repo_solicitacao.SolicitacaoRepo.BuscarPorUsuarioID(usuarioID); err == nil {
		for _, s := range solicitacoes {
			if s.Status == models.StatusSolicitacaoAceita {
				estatisticas.DoacoesRecebidas++
			}
		}
	}

	if avaliacoes, err := repo_avaliacao.AvaliacaoRepo.BuscarPorAvaliadoID(usuarioID); err == nil {
		estatisticas.MediaAvaliacoes, estatisticas.TotalAvaliacoes = mediaDeAvaliacoes(avaliacoes)
	}

	return estatisticas
}

// lista pública de usuários: retorna apenas dados públicos (sem e-mail, telefone ou senha)
func GetUsuarios(c *gin.Context) {
	usuarios, err := repo_usuario.UsuarioRepo.BuscarTodos()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	publicos := make([]models.UsuarioPublico, 0, len(usuarios))
	for _, u := range usuarios {
		publicos = append(publicos, u.Publico())
	}

	c.JSON(http.StatusOK, gin.H{"usuarios": publicos})
}

// perfil público de um usuário
func GetUsuario(c *gin.Context) {
	var ID string = c.Param("id")
	var usuarioID, err = strconv.ParseUint(ID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	usuario, err := repo_usuario.UsuarioRepo.BuscarPorID(usuarioID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"usuario":      usuario.Publico(),
		"estatisticas": calcularEstatisticas(usuario.ID),
	})
}

// dados completos do usuário logado
func BuscarUsuarioLogado(c *gin.Context) {
	usuario, err := repo_usuario.UsuarioRepo.BuscarPorID(c.GetUint64("usuario_id"))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"erro": "usuario nao encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"usuario": usuario})
}

func CriarUsuario(c *gin.Context) {
	var input usuarioInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": "dados invalidos: verifique os campos obrigatorios (incluindo o endereco completo) e se a senha tem ao menos 8 caracteres"})
		return
	}

	if !input.AceitePrivacidade {
		c.JSON(http.StatusBadRequest, gin.H{"erro": "e necessario aceitar a politica de privacidade para se cadastrar"})
		return
	}

	agora := time.Now()
	novo := models.Usuario{
		Nome:             input.Nome,
		Email:            input.Email,
		Senha:            input.Senha,
		Telefone:         input.Telefone,
		Rua:              input.Rua,
		Numero:           input.Numero,
		Complemento:      input.Complemento,
		UF:               input.UF,
		Cidade:           input.Cidade,
		Tipo:             input.Tipo,
		RoupasProcuradas: input.RoupasProcuradas,
		TamanhoRoupa:     input.TamanhoRoupa,
		TamanhoCalcado:   input.TamanhoCalcado,
		ConsentimentoEm:  agora,
		VersaoPolitica:   VersaoPoliticaPrivacidade,
		CriadoEm:         agora,
	}

	if err := novo.Preparar("cadastro"); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	criado, err := repo_usuario.UsuarioRepo.Criar(&novo)
	if errors.Is(err, repo_usuario.ErrEmailEmUso) {
		c.JSON(http.StatusConflict, gin.H{"erro": err.Error()})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	// já inicia a sessão após o cadastro
	if token, err := seguranca.GerarToken(criado.ID, criado.Tipo); err == nil {
		definirCookieDeSessao(c, token, int(seguranca.DuracaoToken.Seconds()))
	}

	c.JSON(http.StatusCreated, gin.H{"criado": criado})
}

func AtualizarUsuario(c *gin.Context) {
	var targetID uint64 = c.GetUint64("target_usuario_id")

	var input models.AtualizacaoUsuario
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	usuario, err := repo_usuario.UsuarioRepo.BuscarPorID(targetID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": "usuario nao encontrado"})
		return
	}

	if err = usuario.Mesclar(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	atualizado, err := repo_usuario.UsuarioRepo.Salvar(targetID, usuario)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, atualizado)
}

// DeletarUsuario atende ao direito de eliminação da LGPD: remove a conta e todos os dados vinculados a ela.
// O banco apaga em cascata doações, fotos, solicitações, avaliações e favoritos; o repositório apaga o endereço.
func DeletarUsuario(c *gin.Context) {
	var targetID uint64 = c.GetUint64("target_usuario_id")

	if err := repo_usuario.UsuarioRepo.Deletar(targetID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	definirCookieDeSessao(c, "", -1)
	c.Status(http.StatusNoContent)
}

// ExportarDados atende ao direito de acesso e portabilidade da LGPD:
// devolve, em JSON, todos os dados pessoais que a plataforma mantém sobre o usuário logado
func ExportarDados(c *gin.Context) {
	tokenID := c.GetUint64("usuario_id")

	usuario, err := repo_usuario.UsuarioRepo.BuscarPorID(tokenID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": "usuario nao encontrado"})
		return
	}

	doacoes, _ := repo_doacao.DoacaoRepo.Buscar(repo_doacao.FiltroDoacao{UsuarioID: tokenID})
	solicitacoes, _ := repo_solicitacao.SolicitacaoRepo.BuscarPorUsuarioID(tokenID)
	favoritos, _ := repo_favorito.FavoritoRepo.BuscarPorUsuarioID(tokenID)
	avaliacoesFeitas, _ := repo_avaliacao.AvaliacaoRepo.BuscarPorAutorID(tokenID)
	avaliacoesRecebidas, _ := repo_avaliacao.AvaliacaoRepo.BuscarPorAvaliadoID(tokenID)

	c.Header("Content-Disposition", `attachment; filename="meus-dados-seveste.json"`)
	c.JSON(http.StatusOK, gin.H{
		"gerado_em":            time.Now(),
		"usuario":              usuario,
		"doacoes":              doacoes,
		"solicitacoes":         solicitacoes,
		"favoritos":            favoritos,
		"avaliacoes_feitas":    avaliacoesFeitas,
		"avaliacoes_recebidas": avaliacoesRecebidas,
	})
}
