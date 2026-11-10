// Package app monta a API (banco, repositórios e rotas). É usado tanto pelo main.go, para rodar localmente,
// quanto pela função da Vercel (api/index.go).
package app

import (
	"log"
	"seveste-api/src/banco"
	"seveste-api/src/repositories/repo_avaliacao"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_favorito"
	"seveste-api/src/repositories/repo_solicitacao"
	"seveste-api/src/repositories/repo_usuario"
	"seveste-api/src/router"

	"github.com/gin-gonic/gin"
)

// Iniciar conecta ao banco, cria os repositórios e devolve o router.
func Iniciar() (*gin.Engine, error) {
	db, bancoCriado, err := banco.Conectar()
	if err != nil {
		return nil, err
	}

	if bancoCriado {
		log.Println("tabelas criadas a partir do sql/setup.sql")
	}

	repo_usuario.UsuarioRepo = repo_usuario.NovoRepositorioDeUsuario(db)
	repo_doacao.DoacaoRepo = repo_doacao.NovoRepositorioDeDoacao(db)
	repo_solicitacao.SolicitacaoRepo = repo_solicitacao.NovoRepositorioDeSolicitacao(db)
	repo_avaliacao.AvaliacaoRepo = repo_avaliacao.NovoRepositorioDeAvaliacao(db)
	repo_favorito.FavoritoRepo = repo_favorito.NovoRepositorioDeFavorito(db)

	return router.Configurar(), nil
}
