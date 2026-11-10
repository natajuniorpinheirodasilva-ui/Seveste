package controllers

import (
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_usuario"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type doacaoInput struct {
	Titulo    string `json:"titulo" binding:"required"`
	Descricao string `json:"descricao" binding:"required"`
	Categoria string `json:"categoria" binding:"required"`
	Tamanho   string `json:"tamanho" binding:"required"`
	Condicao  string `json:"condicao" binding:"required"`
	// "levar" (o doador leva) ou "frete" (enviada por frete)
	TipoDeEntrega string `json:"tipo_de_entrega" binding:"required"`
	Cor           string `json:"cor"`
	Material      string `json:"material"`
	Local         string `json:"local"`
}

// separa um parâmetro de query do tipo "a,b,c" em uma lista
func listaDaQuery(c *gin.Context, nome string) []string {
	valor := strings.TrimSpace(c.Query(nome))
	if valor == "" {
		return nil
	}

	var itens []string
	for _, item := range strings.Split(valor, ",") {
		if item = strings.ToLower(strings.TrimSpace(item)); item != "" {
			itens = append(itens, item)
		}
	}

	return itens
}

// BuscarDoacoes lista as doações aceitando filtros opcionais via query string:
// status (padrão "disponivel"; use "todas" para todas), categoria, condicao, tamanho (listas separadas por vírgula),
// uf, cidade, busca (texto no título/descrição), usuario_id, excluir e limite.
func BuscarDoacoes(c *gin.Context) {
	filtro := repo_doacao.FiltroDoacao{
		Status:     strings.ToLower(c.DefaultQuery("status", models.StatusDoacaoDisponivel)),
		Categorias: listaDaQuery(c, "categoria"),
		Condicoes:  listaDaQuery(c, "condicao"),
		Tamanhos:   listaDaQuery(c, "tamanho"),
		UF:         strings.ToUpper(strings.TrimSpace(c.Query("uf"))),
		Cidade:     strings.TrimSpace(c.Query("cidade")),
		Busca:      strings.TrimSpace(c.Query("busca")),
	}
	if filtro.Status == "todas" {
		filtro.Status = ""
	}
	filtro.UsuarioID, _ = strconv.ParseUint(c.Query("usuario_id"), 10, 64)
	filtro.Excluir, _ = strconv.ParseUint(c.Query("excluir"), 10, 64)
	if limite, err := strconv.Atoi(c.Query("limite")); err == nil && limite > 0 {
		filtro.Limite = min(limite, 100)
	}

	doacoes, err := repo_doacao.DoacaoRepo.Buscar(filtro)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": "erro ao buscar doacoes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"doacoes": montarRespostasDoacoes(doacoes, c.GetUint64("usuario_id"))})
}

func BuscarDoacao(c *gin.Context) {
	var ID string = c.Param("id")
	doacaoID, err := strconv.ParseUint(ID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var doacao *models.Doacao
	doacao, err = repo_doacao.DoacaoRepo.BuscarPorID(doacaoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"doacao": montarRespostaDoacao(*doacao, c.GetUint64("usuario_id"))})
}

func CriarDoacao(c *gin.Context) {
	var input doacaoInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var usuarioTipo string = c.GetString("usuario_tipo")
	if usuarioTipo != models.TipoDoador {
		c.JSON(http.StatusForbidden, gin.H{"erro": "somente doadores podem cadastrar uma nova doação"})
		return
	}

	var usuarioID uint64 = c.GetUint64("usuario_id")
	doador, err := repo_usuario.UsuarioRepo.BuscarPorID(usuarioID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"erro": "usuario nao encontrado"})
		return
	}

	var nova models.Doacao
	nova.Titulo = input.Titulo
	nova.Descricao = input.Descricao
	nova.Categoria = input.Categoria
	nova.Tamanho = input.Tamanho
	nova.Condicao = input.Condicao
	nova.TipoDeEntrega = input.TipoDeEntrega
	nova.Cor = input.Cor
	nova.Material = input.Material
	nova.Local = input.Local
	nova.Status = models.StatusDoacaoDisponivel
	// a doação fica vinculada ao endereço do doador (tabela Endereco)
	nova.EnderecoID = doador.EnderecoID
	nova.Fotos = []string{}
	nova.CriadoEm = time.Now()
	nova.UsuarioID = usuarioID

	if err = nova.Preparar(); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	criado, err := repo_doacao.DoacaoRepo.Criar(&nova)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"criado": montarRespostaDoacao(*criado, usuarioID)})
}

func AtualizarDoacao(c *gin.Context) {
	var stringID = c.Param("id")
	doacaoID, err := strconv.ParseUint(stringID, 10, 64)
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
	if tokenID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"erro": "sessão não identificada"})
		return
	}

	if doacao.UsuarioID != tokenID {
		c.JSON(http.StatusForbidden, gin.H{"erro": "você não tem permissão para alterar essa doação"})
		return
	}

	var input models.AtualizacaoDoacao
	if err = c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	if err = doacao.Mesclar(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	atualizada, err := repo_doacao.DoacaoRepo.Salvar(doacaoID, doacao)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, montarRespostaDoacao(*atualizada, doacao.UsuarioID))
}

func DeletarDoacao(c *gin.Context) {
	var stringID string = c.Param("id")
	doacaoID, err := strconv.ParseUint(stringID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var doacao *models.Doacao
	doacao, err = repo_doacao.DoacaoRepo.BuscarPorID(doacaoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	var tokenID = c.GetUint64("usuario_id")
	if tokenID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"erro": "sessão não identificada"})
		return
	}

	if doacao.UsuarioID != tokenID {
		c.JSON(http.StatusForbidden, gin.H{"erro": "você não tem permissão para fazer essa solicitação"})
		return
	}

	// o banco apaga em cascata imagens (fotos), histórico, solicitações e favoritos da doação
	if err = repo_doacao.DoacaoRepo.Deletar(doacaoID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
