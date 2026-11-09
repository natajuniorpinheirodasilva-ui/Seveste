package controllers

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_doacao"
	"slices"

	"github.com/gin-gonic/gin"
)

const tamanhoMaximoFoto = 5 << 20 // 5 MB

// pasta onde as fotos das doações são armazenadas (configurável pela variável UPLOAD_DIR)
var PastaUploads = pastaUploads()

func pastaUploads() string {
	if pasta := os.Getenv("UPLOAD_DIR"); pasta != "" {
		return pasta
	}
	return "uploads"
}

var extensoesPorTipo = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/webp": ".webp",
}

// AdicionarFotos recebe até 4 imagens (campo multipart "fotos") para uma doação do usuário logado
func AdicionarFotos(c *gin.Context) {
	doacao, ok := buscarDoacaoDoUsuario(c)
	if !ok {
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

	if err = os.MkdirAll(PastaUploads, 0o755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": "nao foi possivel salvar as fotos"})
		return
	}

	salvas := []string{}
	for _, arquivo := range arquivos {
		if arquivo.Size > tamanhoMaximoFoto {
			desfazerFotos(salvas)
			c.JSON(http.StatusBadRequest, gin.H{"erro": "cada foto deve ter no maximo 5MB"})
			return
		}

		aberto, err := arquivo.Open()
		if err != nil {
			desfazerFotos(salvas)
			c.JSON(http.StatusBadRequest, gin.H{"erro": "nao foi possivel ler a foto enviada"})
			return
		}

		conteudo, err := io.ReadAll(io.LimitReader(aberto, tamanhoMaximoFoto+1))
		aberto.Close()
		if err != nil {
			desfazerFotos(salvas)
			c.JSON(http.StatusBadRequest, gin.H{"erro": "nao foi possivel ler a foto enviada"})
			return
		}

		// o tipo é detectado pelo conteúdo do arquivo, e não pela extensão informada pelo cliente
		extensao, permitido := extensoesPorTipo[http.DetectContentType(conteudo)]
		if !permitido {
			desfazerFotos(salvas)
			c.JSON(http.StatusBadRequest, gin.H{"erro": "formato de imagem invalido, use JPG, PNG ou WEBP"})
			return
		}

		nome := nomeAleatorio() + extensao
		if err = os.WriteFile(filepath.Join(PastaUploads, nome), conteudo, 0o644); err != nil {
			desfazerFotos(salvas)
			c.JSON(http.StatusInternalServerError, gin.H{"erro": "nao foi possivel salvar as fotos"})
			return
		}
		salvas = append(salvas, nome)
	}

	doacao.Fotos = append(slices.Clone(doacao.Fotos), salvas...)
	atualizada, err := repo_doacao.DoacaoRepo.Salvar(doacao.ID, doacao)
	if err != nil {
		desfazerFotos(salvas)
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.JSON(http.StatusOK, montarRespostaDoacao(*atualizada, doacao.UsuarioID))
}

func RemoverFoto(c *gin.Context) {
	doacao, ok := buscarDoacaoDoUsuario(c)
	if !ok {
		return
	}

	nome := c.Param("nome")
	indice := slices.Index(doacao.Fotos, nome)
	if indice < 0 {
		c.JSON(http.StatusNotFound, gin.H{"erro": "foto nao encontrada"})
		return
	}

	doacao.Fotos = slices.Delete(slices.Clone(doacao.Fotos), indice, indice+1)
	if _, err := repo_doacao.DoacaoRepo.Salvar(doacao.ID, doacao); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	removerArquivoDeFoto(nome)
	c.Status(http.StatusNoContent)
}

func nomeAleatorio() string {
	bytes := make([]byte, 16)
	_, _ = rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func removerArquivoDeFoto(nome string) {
	// filepath.Base impede que um nome manipulado aponte para fora da pasta de uploads
	if err := os.Remove(filepath.Join(PastaUploads, filepath.Base(nome))); err != nil && !os.IsNotExist(err) {
		log.Printf("aviso: nao foi possivel remover a foto %s: %v", nome, err)
	}
}

func desfazerFotos(nomes []string) {
	for _, nome := range nomes {
		removerArquivoDeFoto(nome)
	}
}
