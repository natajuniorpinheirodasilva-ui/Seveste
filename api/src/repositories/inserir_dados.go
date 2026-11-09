package repositories

import (
	"log"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_avaliacao"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_mensagem"
	"seveste-api/src/repositories/repo_solicitacao"
	"seveste-api/src/repositories/repo_usuario"
	"time"
)

// dados fictícios usados apenas para desenvolvimento (os repositórios atuais são em memória)

var usuarios = []models.Usuario{
	{
		Nome:   "teste",
		Email:  "teste@gmail.com",
		Senha:  "teste",
		UF:     "SP",
		Cidade: "Botucatu",
		Tipo:   "Doador",
		Bio:    "Gosto de doar peças em ótimo estado que já não uso mais. Sempre lavo tudo antes de entregar.",
	},
	{
		Nome:             "Pedro",
		Email:            "pedrinho@gmail.com",
		Senha:            "pedrinho",
		Telefone:         "(11) 1111-1111",
		UF:               "BA",
		Cidade:           "Xique-Xique",
		Tipo:             "Acolhido",
		RoupasProcuradas: []string{"roupas", "calcados", "agasalhos"},
		TamanhoRoupa:     "GG",
		TamanhoCalcado:   37,
	},
	{
		Nome:             "Márcia",
		Email:            "marcinha123@gmail.com",
		Senha:            "dasd1233",
		Telefone:         "(22) 2222-2222",
		UF:               "MG",
		Cidade:           "Xaque-Xaque",
		Tipo:             "Acolhido",
		RoupasProcuradas: []string{"calcados", "roupas"},
		TamanhoRoupa:     "P",
		TamanhoCalcado:   34,
	},
	{
		Nome:   "Túlio",
		Email:  "talmeida32@gmail.com",
		Senha:  "tulinho",
		UF:     "MG",
		Cidade: "Canchas",
		Tipo:   "Doador",
	},
}

var doacoes = []models.Doacao{
	{
		Titulo:    "Camiseta azul",
		Descricao: "Camiseta azul tamanho G levemente usada",
		Categoria: "roupas",
		Tamanho:   "G",
		Estado:    "usado_excelente",
		Cor:       "Azul",
		Material:  "Algodão",
		Local:     "Centro",
		UsuarioID: 1,
	},
	{
		Titulo:    "Calça jeans preta",
		Descricao: "Eu comprei essa calça faz um tempo mas não coube em mim",
		Categoria: "roupas",
		Tamanho:   "M",
		Estado:    "novo",
		Cor:       "Preta",
		Material:  "Jeans",
		Local:     "Bairro Alto",
		UsuarioID: 4,
	},
	{
		Titulo:    "Casaco de lã azul marinho",
		Descricao: "Casaco quente e confortável, ideal para o inverno. Foi usado poucas vezes e não possui manchas ou rasgos.",
		Categoria: "agasalhos",
		Tamanho:   "M",
		Estado:    "usado_excelente",
		Cor:       "Azul marinho",
		Material:  "Lã",
		Local:     "Vila dos Lavradores",
		UsuarioID: 1,
	},
	{
		Titulo:    "Tênis infantil",
		Descricao: "Tênis infantil número 28, com pequenas marcas de uso na sola.",
		Categoria: "infantil",
		Tamanho:   "28",
		Estado:    "usado_marcas",
		Cor:       "Branco",
		Local:     "Centro",
		UsuarioID: 4,
	},
	{
		Titulo:    "Mochila escolar",
		Descricao: "Mochila resistente com dois compartimentos, zíperes funcionando perfeitamente.",
		Categoria: "acessorios",
		Tamanho:   "UNICO",
		Estado:    "usado_excelente",
		Cor:       "Vermelha",
		UsuarioID: 1,
	},
}

func InserirDados() {
	agora := time.Now()

	for i, usuario := range usuarios {
		usuario.ConsentimentoEm = agora
		usuario.VersaoPolitica = "seed"
		usuario.CriadoEm = agora.AddDate(0, -len(usuarios)+i, 0)

		err := usuario.Preparar("cadastro")
		if err != nil {
			log.Fatal(err)
		}

		if _, err = repo_usuario.UsuarioRepo.Criar(&usuario); err != nil {
			log.Fatal(err)
		}
	}

	for i, doacao := range doacoes {
		doador, err := repo_usuario.UsuarioRepo.BuscarPorID(doacao.UsuarioID)
		if err != nil {
			log.Fatal(err)
		}

		doacao.Status = models.StatusDoacaoDisponivel
		doacao.Cidade = doador.Cidade
		doacao.UF = doador.UF
		doacao.Fotos = []string{}
		doacao.CriadoEm = agora.Add(-time.Duration(len(doacoes)-i) * 6 * time.Hour)

		if err = doacao.Preparar(); err != nil {
			log.Fatal(err)
		}

		if _, err = repo_doacao.DoacaoRepo.Criar(&doacao); err != nil {
			log.Fatal(err)
		}
	}

	var solicitacoes = []models.Solicitacao{
		{Status: models.StatusSolicitacaoPendente, CriadoEm: agora.Add(-3 * time.Hour), DoacaoID: 1, UsuarioID: 2},
		{Status: models.StatusSolicitacaoPendente, CriadoEm: agora.Add(-2 * time.Hour), DoacaoID: 1, UsuarioID: 3},
		{Status: models.StatusSolicitacaoPendente, CriadoEm: agora.Add(-1 * time.Hour), DoacaoID: 2, UsuarioID: 3},
		{Status: models.StatusSolicitacaoAceita, CriadoEm: agora.Add(-48 * time.Hour), DoacaoID: 3, UsuarioID: 3},
	}

	for _, solicitacao := range solicitacoes {
		if _, err := repo_solicitacao.SolicitacaoRepo.Criar(&solicitacao); err != nil {
			log.Fatal(err)
		}
	}

	// a doação 3 já foi concluída (solicitação aceita)
	if doada, err := repo_doacao.DoacaoRepo.BuscarPorID(3); err == nil {
		doada.Status = models.StatusDoacaoDoada
		_, _ = repo_doacao.DoacaoRepo.Salvar(doada.ID, doada)
	}

	var mensagens = []models.Mensagem{
		{SolicitacaoID: 1, UsuarioID: 2, Texto: "Olá! A camiseta ainda está disponível?", EnviadaEm: agora.Add(-3 * time.Hour)},
		{SolicitacaoID: 1, UsuarioID: 1, Texto: "Está sim! Podemos combinar a entrega no centro.", EnviadaEm: agora.Add(-150 * time.Minute)},
		{SolicitacaoID: 4, UsuarioID: 3, Texto: "Muito obrigada pelo casaco!", EnviadaEm: agora.Add(-47 * time.Hour)},
	}

	for _, mensagem := range mensagens {
		if _, err := repo_mensagem.MensagemRepo.Criar(&mensagem); err != nil {
			log.Fatal(err)
		}
	}

	avaliacao := models.Avaliacao{
		SolicitacaoID: 4,
		AutorID:       3,
		AvaliadoID:    1,
		Nota:          5,
		Comentario:    "O casaco estava muito bem cuidado e a entrega foi pontual.",
		CriadoEm:      agora.Add(-40 * time.Hour),
	}
	if _, err := repo_avaliacao.AvaliacaoRepo.Criar(&avaliacao); err != nil {
		log.Fatal(err)
	}
}
