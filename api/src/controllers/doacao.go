package controllers

import (
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_favorito"
	"seveste-api/src/repositories/repo_mensagem"
	"seveste-api/src/repositories/repo_solicitacao"
	"seveste-api/src/repositories/repo_usuario"
	"slices"
	"sort"
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
	Estado    string `json:"estado" binding:"required"`
	Cor       string `json:"cor"`
	Material  string `json:"material"`
	Local     string `json:"local"`
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
// status (padrão "disponivel"; use "todas" para todas), categoria, estado, tamanho (listas separadas por vírgula),
// uf, cidade, busca (texto no título/descrição), usuario_id e limite.
func BuscarDoacoes(c *gin.Context) {
	doacoes, err := repo_doacao.DoacaoRepo.BuscarTodas()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	status := strings.ToLower(c.DefaultQuery("status", models.StatusDoacaoDisponivel))
	categorias := listaDaQuery(c, "categoria")
	estados := listaDaQuery(c, "estado")
	tamanhos := listaDaQuery(c, "tamanho")
	uf := strings.ToUpper(strings.TrimSpace(c.Query("uf")))
	cidade := strings.ToLower(strings.TrimSpace(c.Query("cidade")))
	busca := strings.ToLower(strings.TrimSpace(c.Query("busca")))
	usuarioID, _ := strconv.ParseUint(c.Query("usuario_id"), 10, 64)
	excluir, _ := strconv.ParseUint(c.Query("excluir"), 10, 64)

	filtradas := []models.Doacao{}
	for _, d := range doacoes {
		if status != "todas" && d.Status != status {
			continue
		}
		if len(categorias) > 0 && !slices.Contains(categorias, d.Categoria) {
			continue
		}
		if len(estados) > 0 && !slices.Contains(estados, d.Estado) {
			continue
		}
		if len(tamanhos) > 0 && !slices.Contains(tamanhos, strings.ToLower(d.Tamanho)) {
			continue
		}
		if uf != "" && d.UF != uf {
			continue
		}
		if cidade != "" && !strings.Contains(strings.ToLower(d.Cidade), cidade) {
			continue
		}
		if busca != "" && !strings.Contains(strings.ToLower(d.Titulo+" "+d.Descricao), busca) {
			continue
		}
		if usuarioID != 0 && d.UsuarioID != usuarioID {
			continue
		}
		if excluir != 0 && d.ID == excluir {
			continue
		}
		filtradas = append(filtradas, d)
	}

	// mais recentes primeiro
	sort.Slice(filtradas, func(i, j int) bool {
		if filtradas[i].CriadoEm.Equal(filtradas[j].CriadoEm) {
			return filtradas[i].ID > filtradas[j].ID
		}
		return filtradas[i].CriadoEm.After(filtradas[j].CriadoEm)
	})

	if limite, err := strconv.Atoi(c.Query("limite")); err == nil && limite > 0 && limite < len(filtradas) {
		filtradas = filtradas[:limite]
	}

	usuarioLogado := c.GetUint64("usuario_id")
	respostas := make([]respostaDoacao, 0, len(filtradas))
	for _, d := range filtradas {
		respostas = append(respostas, montarRespostaDoacao(d, usuarioLogado))
	}

	c.JSON(http.StatusOK, gin.H{"doacoes": respostas})
}

func BuscarDoacao(c *gin.Context) {
	doacaoID, ok := lerID(c, "id")
	if !ok {
		return
	}

	doacao, err := repo_doacao.DoacaoRepo.BuscarPorID(doacaoID)
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
	nova.Estado = input.Estado
	nova.Cor = input.Cor
	nova.Material = input.Material
	nova.Local = input.Local
	nova.Status = models.StatusDoacaoDisponivel
	nova.Cidade = doador.Cidade
	nova.UF = doador.UF
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

// busca a doação da rota e garante que o usuário logado é o dono dela
func buscarDoacaoDoUsuario(c *gin.Context) (*models.Doacao, bool) {
	doacaoID, ok := lerID(c, "id")
	if !ok {
		return nil, false
	}

	doacao, err := repo_doacao.DoacaoRepo.BuscarPorID(doacaoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return nil, false
	}

	var tokenID = c.GetUint64("usuario_id")
	if tokenID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"erro": "sessão não identificada"})
		return nil, false
	}

	if doacao.UsuarioID != tokenID {
		c.JSON(http.StatusForbidden, gin.H{"erro": "você não tem permissão para alterar essa doação"})
		return nil, false
	}

	return doacao, true
}

func AtualizarDoacao(c *gin.Context) {
	doacao, ok := buscarDoacaoDoUsuario(c)
	if !ok {
		return
	}

	var input models.AtualizacaoDoacao
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	if err := doacao.Mesclar(input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	atualizada, err := repo_doacao.DoacaoRepo.Salvar(doacao.ID, doacao)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, montarRespostaDoacao(*atualizada, doacao.UsuarioID))
}

func DeletarDoacao(c *gin.Context) {
	doacao, ok := buscarDoacaoDoUsuario(c)
	if !ok {
		return
	}

	if err := removerDoacaoEmCascata(doacao); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// remove a doação junto com as solicitações, mensagens, favoritos e fotos vinculadas a ela
func removerDoacaoEmCascata(doacao *models.Doacao) error {
	solicitacoes, _ := repo_solicitacao.SolicitacaoRepo.BuscarPorDoacaoID(doacao.ID)
	for _, s := range solicitacoes {
		_ = repo_mensagem.MensagemRepo.DeletarPorSolicitacaoID(s.ID)
		_ = repo_solicitacao.SolicitacaoRepo.Deletar(s.ID)
	}

	_ = repo_favorito.FavoritoRepo.RemoverPorDoacaoID(doacao.ID)

	for _, foto := range doacao.Fotos {
		removerArquivoDeFoto(foto)
	}

	return repo_doacao.DoacaoRepo.Deletar(doacao.ID)
}
