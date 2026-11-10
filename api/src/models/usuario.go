package models

import (
	"errors"
	"fmt"
	"seveste-api/src/seguranca"
	"slices"
	"strings"
	"time"
)

const (
	TipoDoador   string = "doador"
	TipoAcolhido string = "acolhido"
)

type Usuario struct {
	ID       uint64 `json:"id_usuario"`
	Nome     string `json:"nome" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Senha    string `json:"-"`
	Telefone string `json:"telefone"`
	Tipo     string `json:"tipo" binding:"required"`
	Bio      string `json:"bio"`

	// endereço completo (tabela Endereco). Apenas cidade e UF são públicos.
	EnderecoID  uint64 `json:"-"`
	Rua         string `json:"rua"`
	Numero      string `json:"numero"`
	Complemento string `json:"complemento"`
	Cidade      string `json:"cidade" binding:"required"`
	UF          string `json:"uf" binding:"required"`

	RoupasProcuradas []string `json:"roupas_procuradas"`
	TamanhoRoupa     string   `json:"tamanho_roupa"`
	TamanhoCalcado   uint8    `json:"tamanho_calcado"`

	// LGPD: registro de quando e em qual versão da política o consentimento foi dado
	ConsentimentoEm time.Time `json:"consentimento_em"`
	VersaoPolitica  string    `json:"versao_politica"`
	CriadoEm        time.Time `json:"criado_em"`
	AtualizadoEm    time.Time `json:"atualizado_em"`
}

// UsuarioPublico contém apenas os dados que podem ser exibidos para outras pessoas.
// E-mail, telefone e dados de tamanho nunca são expostos publicamente (minimização de dados - LGPD).
type UsuarioPublico struct {
	ID       uint64    `json:"id_usuario"`
	Nome     string    `json:"nome"`
	UF       string    `json:"uf"`
	Cidade   string    `json:"cidade"`
	Tipo     string    `json:"tipo"`
	Bio      string    `json:"bio"`
	CriadoEm time.Time `json:"criado_em"`
}

type AtualizacaoUsuario struct {
	Nome             *string   `json:"nome"`
	Telefone         *string   `json:"telefone"`
	Rua              *string   `json:"rua"`
	Numero           *string   `json:"numero"`
	Complemento      *string   `json:"complemento"`
	UF               *string   `json:"uf"`
	Cidade           *string   `json:"cidade"`
	Bio              *string   `json:"bio"`
	RoupasProcuradas *[]string `json:"roupas_procuradas"`
	TamanhoRoupa     *string   `json:"tamanho_roupa"`
	TamanhoCalcado   *uint8    `json:"tamanho_calcado"`
}

const tamanhoMaximoBio = 500

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

func (u *Usuario) Publico() UsuarioPublico {
	return UsuarioPublico{
		ID:       u.ID,
		Nome:     u.Nome,
		UF:       u.UF,
		Cidade:   u.Cidade,
		Tipo:     u.Tipo,
		Bio:      u.Bio,
		CriadoEm: u.CriadoEm,
	}
}

// Tira todos os espaços em volta dos campos, necessário porque mesmo com a binding required, ele ainda
// considera " " como preenchido
func (u *Usuario) formatar(etapa string) error {
	u.Nome = strings.TrimSpace(u.Nome)
	u.Email = strings.ToLower(strings.TrimSpace(u.Email))
	u.Senha = strings.TrimSpace(u.Senha)
	u.Telefone = strings.TrimSpace(u.Telefone)
	u.UF = strings.ToUpper(strings.TrimSpace(u.UF))
	u.Cidade = strings.TrimSpace(u.Cidade)
	u.Rua = strings.TrimSpace(u.Rua)
	u.Numero = strings.TrimSpace(u.Numero)
	u.Complemento = strings.TrimSpace(u.Complemento)
	u.Tipo = strings.TrimSpace(u.Tipo)
	u.Tipo = strings.ToLower(u.Tipo)
	u.Bio = strings.TrimSpace(u.Bio)
	u.TamanhoRoupa = strings.ToUpper(strings.TrimSpace(u.TamanhoRoupa))

	for index, s := range u.RoupasProcuradas {
		s = strings.ToLower(strings.TrimSpace(s))
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
	if (u.Nome == "") || (u.UF == "") || (u.Cidade == "") || (u.Tipo == "") || (u.Rua == "") || (u.Numero == "") {
		return errors.New("todos os campos obrigatorios devem ser preenchidos")
	}

	if err := validarTamanhos(u); err != nil {
		return err
	}

	if len(u.UF) != 2 {
		return errors.New("o campo 'uf' deve ter exatamente 2 caracteres")
	}

	if etapa == "cadastro" && u.Senha == "" {
		return errors.New("a senha e obrigatoria e deve ser preenchida")
	}

	if len(u.Bio) > tamanhoMaximoBio {
		return errors.New("a bio deve ter no maximo 500 caracteres")
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
	} else {
		// doadores não precisam informar dados de tamanho (minimização de dados)
		u.RoupasProcuradas = nil
		u.TamanhoRoupa = ""
		u.TamanhoCalcado = 0
	}

	return nil
}

// altera dos dados do usuário se eles forem válidos
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

	if dados.Rua != nil {
		rua := strings.TrimSpace(*dados.Rua)
		if rua == "" {
			return errors.New("o campo 'rua' nao pode estar vazio")
		}
		u.Rua = rua
		alteracaoFeita = true
	}

	if dados.Numero != nil {
		numero := strings.TrimSpace(*dados.Numero)
		if numero == "" {
			return errors.New("o campo 'numero' nao pode estar vazio")
		}
		u.Numero = numero
		alteracaoFeita = true
	}

	if dados.Complemento != nil {
		u.Complemento = strings.TrimSpace(*dados.Complemento)
		alteracaoFeita = true
	}

	if dados.Bio != nil {
		bio := strings.TrimSpace(*dados.Bio)
		if len(bio) > tamanhoMaximoBio {
			return errors.New("a bio deve ter no maximo 500 caracteres")
		}
		u.Bio = bio
		alteracaoFeita = true
	}

	if u.Tipo == TipoAcolhido {
		if dados.RoupasProcuradas != nil {
			roupas := []string{}
			for _, r := range *dados.RoupasProcuradas {
				if r = strings.ToLower(strings.TrimSpace(r)); r != "" {
					roupas = append(roupas, r)
				}
			}
			if len(roupas) == 0 {
				return errors.New("pelo menos uma roupa deve ser selecionada")
			}
			u.RoupasProcuradas = roupas
			alteracaoFeita = true
		}

		if dados.TamanhoRoupa != nil {
			tamanho := strings.ToUpper(strings.TrimSpace(*dados.TamanhoRoupa))
			if tamanho == "" {
				return errors.New("o tamanho da roupa nao pode estar vazio")
			}
			u.TamanhoRoupa = tamanho
			alteracaoFeita = true
		}

		if dados.TamanhoCalcado != nil {
			if *dados.TamanhoCalcado == 0 {
				return errors.New("o tamanho do calcado deve ser valido")
			}
			u.TamanhoCalcado = *dados.TamanhoCalcado
			alteracaoFeita = true
		}
	}

	if !alteracaoFeita {
		return errors.New("nenhum dado fornecido para atualizacao")
	}

	return validarTamanhos(u)
}

// limites de tamanho das colunas no banco
func validarTamanhos(u *Usuario) error {
	limites := []struct {
		valor  string
		maximo int
		campo  string
	}{
		{u.Nome, 100, "nome"},
		{u.Email, 100, "email"},
		{u.Telefone, 20, "telefone"},
		{u.Cidade, 100, "cidade"},
		{u.Rua, 500, "rua"},
		{u.Numero, 20, "numero"},
		{u.Complemento, 100, "complemento"},
		{u.TamanhoRoupa, 10, "tamanho_roupa"},
	}

	for _, l := range limites {
		if len([]rune(l.valor)) > l.maximo {
			return fmt.Errorf("o campo '%s' deve ter no maximo %d caracteres", l.campo, l.maximo)
		}
	}

	return nil
}
