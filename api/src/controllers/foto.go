package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_doacao"
	"slices"
	"strconv"

	"github.com/gin-gonic/gin"
)

// As fotos ficam no banco (tabela DoacaoImagem), porque a Vercel não tem disco permanente.
// O front-end reduz cada foto antes do envio (máx. 1280px, ~100-300 KB); o limite aqui é uma proteção.
// Cada requisição na Vercel aceita no máximo 4,5 MB, então o front envia uma foto por vez.
const tamanhoMaximoFoto = 1 << 20 // 1 MB

var tiposPermitidos = []string{"image/jpeg", "image/png", "image/webp"}

// AdicionarFotos recebe imagens (campo multipart "fotos") para uma doação do usuário logado
func AdicionarFotos(c *gin.Context) {
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
	if doacao.UsuarioID != tokenID {
		c.JSON(http.StatusForbidden, gin.H{"erro": "você não tem permissão para alterar essa doação"})
		return
	}

	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": "envie as fotos no campo 'fotos' (multipart/form-data)"})
		return
	}

	arquivos := form.File["fotos"]
	if len(arquivos) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"erro": "nenhuma foto enviada"})
		return
	}

	if len(doacao.Fotos)+len(arquivos) > models.MaximoFotosPorDoacao {
		c.JSON(http.StatusBadRequest, gin.H{"erro": "cada doacao pode ter no maximo 4 fotos"})
		return
	}

	for _, arquivo := range arquivos {
		if arquivo.Size > tamanhoMaximoFoto {
			c.JSON(http.StatusBadRequest, gin.H{"erro": "cada foto deve ter no maximo 1MB"})
			return
		}

		aberto, err := arquivo.Open()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"erro": "nao foi possivel ler a foto enviada"})
			return
		}

		conteudo, err := io.ReadAll(io.LimitReader(aberto, tamanhoMaximoFoto+1))
		aberto.Close()
		if err != nil || len(conteudo) > tamanhoMaximoFoto {
			c.JSON(http.StatusBadRequest, gin.H{"erro": "nao foi possivel ler a foto enviada"})
			return
		}

		// o tipo é detectado pelo conteúdo do arquivo, e não pela extensão informada pelo cliente
		tipoConteudo := http.DetectContentType(conteudo)
		if !slices.Contains(tiposPermitidos, tipoConteudo) {
			c.JSON(http.StatusBadRequest, gin.H{"erro": "formato de imagem invalido, use JPG, PNG ou WEBP"})
			return
		}

		if err = repo_doacao.DoacaoRepo.AdicionarFoto(doacaoID, nomeAleatorio(), tipoConteudo, conteudo); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"erro": "nao foi possivel salvar a foto"})
			return
		}
	}

	atualizada, err := repo_doacao.DoacaoRepo.BuscarPorID(doacaoID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, montarRespostaDoacao(*atualizada, tokenID))
}

func RemoverFoto(c *gin.Context) {
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
	if doacao.UsuarioID != tokenID {
		c.JSON(http.StatusForbidden, gin.H{"erro": "você não tem permissão para alterar essa doação"})
		return
	}

	nome := c.Param("nome")
	indice := slices.Index(doacao.Fotos, nome)
	if indice < 0 {
		c.JSON(http.StatusNotFound, gin.H{"erro": "foto nao encontrada"})
		return
	}

	// salvar a doação sem a foto apaga a imagem do banco e reorganiza as posições (a próxima vira capa)
	doacao.Fotos = slices.Delete(slices.Clone(doacao.Fotos), indice, indice+1)
	if _, err = repo_doacao.DoacaoRepo.Salvar(doacao.ID, doacao); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// ServirFoto entrega a imagem guardada no banco. Como o nome de cada foto é único e a foto nunca muda,
// a resposta pode ficar em cache: a CDN da Vercel responde as próximas visitas sem consultar o banco.
func ServirFoto(c *gin.Context) {
	tipoConteudo, dados, err := repo_doacao.DoacaoRepo.BuscarFoto(c.Param("nome"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": "foto nao encontrada"})
		return
	}

	// um dia de cache: uma foto removida deixa de aparecer em até 24 horas
	c.Header("Cache-Control", "public, max-age=86400, s-maxage=86400")
	c.Data(http.StatusOK, tipoConteudo, dados)
}

func nomeAleatorio() string {
	bytes := make([]byte, 16)
	_, _ = rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
