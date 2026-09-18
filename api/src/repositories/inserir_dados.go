package repositories

import (
	"log"
	"seveste-api/src/models"
	"seveste-api/src/repositories/repo_doacao"
	"seveste-api/src/repositories/repo_usuario"
)

var usuarios = []models.Usuario{
	{
		Nome:   "teste",
		Email:  "teste@gmail.com",
		Senha:  "teste",
		UF:     "SP",
		Cidade: "Botucatu",
		Tipo:   "Doador",
	},
	{
		Nome:             "Pedro",
		Email:            "pedrinho@gmail.com",
		Senha:            "pedrinho",
		Telefone:         "(11) 1111-1111",
		UF:               "BH",
		Cidade:           "Xique-Xique",
		Tipo:             "Acolhido",
		RoupasProcuradas: []string{"calca", "sapato", "camiseta"},
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
		RoupasProcuradas: []string{"sapato", "blusa"},
		TamanhoRoupa:     "P",
		TamanhoCalcado:   34,
	},
	{
		Nome:   "Túlio",
		Email:  "talmeida32@gmail.com",
		Senha:  "tulinho",
		UF:     "BH",
		Cidade: "Canchas",
		Tipo:   "Doador",
	},
}

var doacoes = []models.Doacao{
	{
		Titulo:    "Camiseta azul",
		Descricao: "Camiseta azul tamanho G levemente usada",
		Categoria: "camiseta",
		Tamanho:   "G",
		Estado:    "usada",
		Status:    "disponivel",

		UsuarioID: 1,
	},
	{
		Titulo:    "Calça jeans preta",
		Descricao: "Eu comprei essa calça faz um tempo mas não coube em mim",
		Categoria: "calca",
		Tamanho:   "M",
		Estado:    "nova",
		Status:    "disponivel",

		UsuarioID: 4,
	},
}

func InserirDados() {
	for _, usuario := range usuarios {
		err := usuario.Preparar("cadastro")
		if err != nil {
			log.Fatal(err)
		}

		if _, err = repo_usuario.UsuarioRepo.Criar(&usuario); err != nil {
			log.Fatal(err)
		}
	}

	for _, doacao := range doacoes {
		if _, err := repo_doacao.DoacaoRepo.Criar(&doacao); err != nil {
			log.Fatal(err)
		}
	}
}
