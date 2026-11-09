package controllers

import (
	"net/http"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_favorito"

	"github.com/gin-gonic/gin"
)

// doações salvas pelo usuário logado
func BuscarFavoritos(c *gin.Context) {
	tokenID := c.GetUint64("usuario_id")

	ids, err := repo_favorito.FavoritoRepo.BuscarPorUsuarioID(tokenID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": "erro ao buscar favoritos"})
		return
	}

	respostas := make([]respostaDoacao, 0, len(ids))
	for _, id := range ids {
		if doacao, err := repo_doacao.DoacaoRepo.BuscarPorID(id); err == nil {
			respostas = append(respostas, montarRespostaDoacao(*doacao, tokenID))
		}
	}

	c.JSON(http.StatusOK, gin.H{"doacoes": respostas})
}

func AdicionarFavorito(c *gin.Context) {
	doacaoID, ok := lerID(c, "id")
	if !ok {
		return
	}

	if _, err := repo_doacao.DoacaoRepo.BuscarPorID(doacaoID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	if err := repo_favorito.FavoritoRepo.Adicionar(c.GetUint64("usuario_id"), doacaoID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func RemoverFavorito(c *gin.Context) {
	doacaoID, ok := lerID(c, "id")
	if !ok {
		return
	}

	if err := repo_favorito.FavoritoRepo.Remover(c.GetUint64("usuario_id"), doacaoID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
