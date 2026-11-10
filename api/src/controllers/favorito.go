package controllers

import (
	"net/http"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_favorito"
	"strconv"

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

	// uma única consulta para todas as doações salvas
	doacoes, err := repo_doacao.DoacaoRepo.Buscar(repo_doacao.FiltroDoacao{IDs: ids})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": "erro ao buscar favoritos"})
		return
	}

	// mantém a ordem dos favoritos (salvos mais recentemente primeiro)
	porID := make(map[uint64]models.Doacao, len(doacoes))
	for _, d := range doacoes {
		porID[d.ID] = d
	}
	ordenadas := make([]models.Doacao, 0, len(doacoes))
	for _, id := range ids {
		if d, existe := porID[id]; existe {
			ordenadas = append(ordenadas, d)
		}
	}

	c.JSON(http.StatusOK, gin.H{"doacoes": montarRespostasDoacoes(ordenadas, tokenID)})
}

func AdicionarFavorito(c *gin.Context) {
	var stringID = c.Param("id")
	doacaoID, err := strconv.ParseUint(stringID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	if _, err = repo_doacao.DoacaoRepo.BuscarPorID(doacaoID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"erro": err.Error()})
		return
	}

	var tokenID = c.GetUint64("usuario_id")
	if err = repo_favorito.FavoritoRepo.Adicionar(tokenID, doacaoID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func RemoverFavorito(c *gin.Context) {
	var stringID = c.Param("id")
	doacaoID, err := strconv.ParseUint(stringID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"erro": err.Error()})
		return
	}

	var tokenID = c.GetUint64("usuario_id")
	if err = repo_favorito.FavoritoRepo.Remover(tokenID, doacaoID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"erro": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
