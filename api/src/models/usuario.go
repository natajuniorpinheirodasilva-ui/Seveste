package models

import (
	"errors"
	"seveste-api/src/seguranca"
	"slices"
	"strings"
)

const (
	TipoDoador   string = "doador"
	TipoAcolhido string = "acolhido"
)

type Usuario struct {
	ID       uint64 `json:"id"`
	Nome     string `json:"nome" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Senha    string `json:"senha,omitempty" binding:"required"`
	Telefone string `json:"telefone"`
	UF       string `json:"uf" binding:"required"`
	Cidade   string `json:"cidade" binding:"required"`
	Tipo     string `json:"tipo" binding:"required"`

	RoupasProcuradas []string `json:"roupas_procuradas"`
	TamanhoRoupa     string   `json:"tamanho_roupa"`
	TamanhoCalcado   uint8    `json:"tamanho_calcado"`
}

type AtualizacaoUsuario struct {
	Nome     *string `json:"nome"`
	Telefone *string `json:"telefone"`
	UF       *string `json:"uf"`
	Cidade   *string `json:"cidade"`
}

// formata os campos e valida se eles estão corretos
func (u *Usuario) Preparar(etapa string) error {
	if err := u.formatar(etapa); err != nil {
		return err
	}

	if err := u.validar(etapa); err != nil {
		return err
	}

	return nil
}

// Tira todos os espaços em volta dos campos, necessário porque mesmo com a binding required, ele ainda
// considera " " como preenchido
func (u *Usuario) formatar(etapa string) error {
	u.Nome = strings.TrimSpace(u.Nome)
	u.Email = strings.TrimSpace(u.Email)
	u.Senha = strings.TrimSpace(u.Senha)
	u.Telefone = strings.TrimSpace(u.Telefone)
	u.UF = strings.TrimSpace(u.UF)
	u.Cidade = strings.TrimSpace(u.Cidade)
	u.Tipo = strings.TrimSpace(u.Tipo)
	u.Tipo = strings.ToLower(u.Tipo)

	for index, s := range u.RoupasProcuradas {
		s = strings.TrimSpace(s)
		u.RoupasProcuradas[index] = s
	}

	if etapa == "cadastro" {
		hash, err := seguranca.Hash(u.Senha)
		if err != nil {
			return err
		}

		u.Senha = string(hash)
	}

	return nil
}

// Valida se os campos obrigatórios estão preenchidos e se o tipo de usuário é um dos tipos aceitados
func (u *Usuario) validar(etapa string) error {
	if (u.Nome == "") || (u.UF == "") || (u.Cidade == "") || (u.Tipo == "") {
		return errors.New("todos os campos obrigatorios devem ser preenchidos")
	}

	if len(u.UF) != 2 {
		return errors.New("o campo 'uf' deve ter exatamente 2 caracteres")
	}

	if etapa == "cadastro" && u.Senha == "" {
		return errors.New("a senha e obrigatoria e deve ser preenchida")
	}

	if u.Tipo != TipoDoador && u.Tipo != TipoAcolhido {
		return errors.New("tipo de usuario invalido. por favor selecione um tipo valido")
	}

	if u.Tipo == TipoAcolhido {
		if u.TamanhoRoupa == "" {
			return errors.New("o tamanho da roupa e obrigatorio e deve ser preenchido")
		}
		if u.TamanhoCalcado == 0 {
			return errors.New("o tamanho do calcado e obrigatorio e deve ser preenchido")
		}

		roupasSemVazias := slices.DeleteFunc(u.RoupasProcuradas, func(s string) bool {
			return s == ""
		})
		if len(roupasSemVazias) <= 0 {
			return errors.New("pelo menos uma roupa deve ser selecionada")
		}

		u.RoupasProcuradas = roupasSemVazias
	}

	return nil
}

func (u *Usuario) Mesclar(dados AtualizacaoUsuario) error {
	alteracaoFeita := false

	if dados.Nome != nil {
		nome := strings.TrimSpace(*dados.Nome)
		if nome == "" {
			return errors.New("o campo 'nome' nao pode estar vazio")
		}
		u.Nome = nome
		alteracaoFeita = true
	}

	if dados.Telefone != nil {
		u.Telefone = strings.TrimSpace(*dados.Telefone)
		alteracaoFeita = true
	}

	if dados.UF != nil {
		uf := strings.ToUpper(strings.TrimSpace(*dados.UF))
		if len(uf) != 2 {
			return errors.New("o campo 'uf' deve conter exatamente 2 caracteres")
		}
		u.UF = uf
		alteracaoFeita = true
	}

	if dados.Cidade != nil {
		cidade := strings.TrimSpace(*dados.Cidade)
		if cidade == "" {
			return errors.New("o campo 'cidade' nao pode estar vazio")
		}
		u.Cidade = cidade
		alteracaoFeita = true
	}

	if !alteracaoFeita {
		return errors.New("nenhum dado fornecido para atualizacao")
	}

	return nil
}
