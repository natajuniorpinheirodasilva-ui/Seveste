package controllers

import (
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_avaliacao"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_favorito"
	"seveste-api/src/repositories/repo_usuario"
)

// As funções deste arquivo montam as respostas "enriquecidas" (doação + doador, solicitação + contato...).
// Elas evitam repetir consultas ao banco: no plano gratuito do Prisma Postgres cada consulta conta.

type respostaDoacao struct {
	models.Doacao
	Favoritada bool `json:"favoritada"`
}

// O doador e o número de solicitações já vêm do repositório; aqui só falta marcar os favoritos,
// buscados com uma única consulta para a lista inteira.
func montarRespostasDoacoes(lista []models.Doacao, usuarioLogadoID uint64) []respostaDoacao {
	favoritos := map[uint64]bool{}
	if usuarioLogadoID != 0 && len(lista) > 0 {
		if ids, err := repo_favorito.FavoritoRepo.BuscarPorUsuarioID(usuarioLogadoID); err == nil {
			for _, id := range ids {
				favoritos[id] = true
			}
		}
	}

	respostas := make([]respostaDoacao, 0, len(lista))
	for _, d := range lista {
		if d.Fotos == nil {
			d.Fotos = []string{}
		}
		respostas = append(respostas, respostaDoacao{Doacao: d, Favoritada: favoritos[d.ID]})
	}

	return respostas
}

func montarRespostaDoacao(d models.Doacao, usuarioLogadoID uint64) respostaDoacao {
	return montarRespostasDoacoes([]models.Doacao{d}, usuarioLogadoID)[0]
}

type resumoDoacao struct {
	ID            uint64   `json:"id_doacao"`
	Titulo        string   `json:"titulo"`
	Status        string   `json:"status"`
	TipoDeEntrega string   `json:"tipo_de_entrega"`
	Fotos         []string `json:"fotos"`
	UsuarioID     uint64   `json:"usuario_id"`
}

// Contato da outra parte, liberado somente depois que o doador aceita a solicitação.
// O doador recebe também o endereço completo do acolhido, para levar ou enviar a peça.
type contatoParticipante struct {
	Nome        string `json:"nome"`
	Email       string `json:"email"`
	Telefone    string `json:"telefone"`
	Rua         string `json:"rua,omitempty"`
	Numero      string `json:"numero,omitempty"`
	Complemento string `json:"complemento,omitempty"`
	Cidade      string `json:"cidade"`
	UF          string `json:"uf"`
}

type respostaSolicitacao struct {
	models.Solicitacao
	Doacao         *resumoDoacao          `json:"doacao"`
	Solicitante    *models.UsuarioPublico `json:"solicitante"`
	Doador         *models.UsuarioPublico `json:"doador"`
	Contato        *contatoParticipante   `json:"contato"`
	AvaliadaPorMim bool                   `json:"avaliada_por_mim"`
}

// cache usado durante uma requisição: cada usuário e cada doação são buscados no banco uma única vez
type cacheDeConsultas struct {
	usuarios map[uint64]*models.Usuario
	doacoes  map[uint64]*models.Doacao
}

func novoCache() *cacheDeConsultas {
	return &cacheDeConsultas{usuarios: map[uint64]*models.Usuario{}, doacoes: map[uint64]*models.Doacao{}}
}

func (c *cacheDeConsultas) usuario(id uint64) *models.Usuario {
	if u, existe := c.usuarios[id]; existe {
		return u
	}
	u, err := repo_usuario.UsuarioRepo.BuscarPorID(id)
	if err != nil {
		u = nil
	}
	c.usuarios[id] = u
	return u
}

func (c *cacheDeConsultas) usuarioPublico(id uint64) *models.UsuarioPublico {
	if u := c.usuario(id); u != nil {
		publico := u.Publico()
		return &publico
	}
	return nil
}

func (c *cacheDeConsultas) doacao(id uint64) *models.Doacao {
	if d, existe := c.doacoes[id]; existe {
		return d
	}
	d, err := repo_doacao.DoacaoRepo.BuscarPorID(id)
	if err != nil {
		d = nil
	}
	c.doacoes[id] = d
	return d
}

func montarContato(usuario *models.Usuario, incluirEndereco bool) *contatoParticipante {
	if usuario == nil {
		return nil
	}

	contato := &contatoParticipante{
		Nome:     usuario.Nome,
		Email:    usuario.Email,
		Telefone: usuario.Telefone,
		Cidade:   usuario.Cidade,
		UF:       usuario.UF,
	}
	if incluirEndereco {
		contato.Rua = usuario.Rua
		contato.Numero = usuario.Numero
		contato.Complemento = usuario.Complemento
	}

	return contato
}

func montarRespostasSolicitacoes(lista []models.Solicitacao, usuarioLogadoID uint64) []respostaSolicitacao {
	cache := novoCache()

	// solicitações que o usuário logado já avaliou (uma consulta para a lista inteira)
	avaliadas := map[uint64]bool{}
	if usuarioLogadoID != 0 && len(lista) > 0 {
		if feitas, err := repo_avaliacao.AvaliacaoRepo.BuscarPorAutorID(usuarioLogadoID); err == nil {
			for _, a := range feitas {
				avaliadas[a.SolicitacaoID] = true
			}
		}
	}

	respostas := make([]respostaSolicitacao, 0, len(lista))
	for _, s := range lista {
		resposta := respostaSolicitacao{
			Solicitacao:    s,
			Solicitante:    cache.usuarioPublico(s.UsuarioID),
			AvaliadaPorMim: avaliadas[s.ID],
		}

		if doacao := cache.doacao(s.DoacaoID); doacao != nil {
			resposta.Doacao = &resumoDoacao{
				ID:            doacao.ID,
				Titulo:        doacao.Titulo,
				Status:        doacao.Status,
				TipoDeEntrega: doacao.TipoDeEntrega,
				Fotos:         doacao.Fotos,
				UsuarioID:     doacao.UsuarioID,
			}
			resposta.Doador = doacao.Doador

			// LGPD: os dados de contato só são compartilhados entre as duas partes de uma doação aceita
			if s.Status == models.StatusSolicitacaoAceita {
				switch usuarioLogadoID {
				case doacao.UsuarioID:
					resposta.Contato = montarContato(cache.usuario(s.UsuarioID), true)
				case s.UsuarioID:
					resposta.Contato = montarContato(cache.usuario(doacao.UsuarioID), false)
				}
			}
		}

		respostas = append(respostas, resposta)
	}

	return respostas
}

func montarRespostaSolicitacao(s models.Solicitacao, usuarioLogadoID uint64) respostaSolicitacao {
	return montarRespostasSolicitacoes([]models.Solicitacao{s}, usuarioLogadoID)[0]
}
