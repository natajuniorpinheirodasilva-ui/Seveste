package models

import (
	"errors"
	"strings"
)

type Doacao struct {
	ID        uint64 `json:"id"`
	Titulo    string `json:"titulo" binding:"required"`
	Descricao string `json:"descricao" binding:"required"`
	Categoria string `json:"categoria" binding:"required"`
	Tamanho   string `json:"tamanho" binding:"required"`
	Estado    string `json:"estado" binding:"required"`
	Status    string `json:"status" binding:"required"`

	UsuarioID uint64 `json:"usuario_id" binding:"required"`
}

type AtualizacaoDoacao struct {
	Titulo    *string `json:"titulo"`
	Descricao *string `json:"descricao"`
	Categoria *string `json:"categoria"`
	Tamanho   *string `json:"tamanho"`
	Estado    *string `json:"estado"`
}

func (d *Doacao) Preparar() error {
	d.formatar()

	if err := d.validar(); err != nil {
		return err
	}

	return nil
}

// remove todos os espaços vazios no começo e final de strings
func (d *Doacao) formatar() {
	d.Titulo = strings.TrimSpace(d.Titulo)
	d.Descricao = strings.TrimSpace(d.Descricao)
	d.Categoria = strings.TrimSpace(d.Categoria)
	d.Tamanho = strings.TrimSpace(d.Tamanho)
	d.Estado = strings.TrimSpace(d.Estado)
	d.Status = strings.TrimSpace(d.Status)
}

// valida se campos obrigatórios estão preenchidos
func (d *Doacao) validar() error {
	if (d.Titulo == "") || (d.Descricao == "") || (d.Categoria == "") || (d.Tamanho == "") || (d.Estado == "") || (d.Status == "") {
		return errors.New("todos os campos sao obrigatorios e devem ser preenchidos")
	}

	return nil
}

// altera dos dados da doação se eles forem válidos
func (d *Doacao) Mesclar(dados AtualizacaoDoacao) error {
	alteracaoFeita := false

	if dados.Titulo != nil {
		titulo := strings.TrimSpace(*dados.Titulo)
		if titulo == "" {
			return errors.New("o campo 'Título' não pode estar vazio")
		}
		d.Titulo = titulo
		alteracaoFeita = true
	}

	if dados.Descricao != nil {
		descricao := strings.TrimSpace(*dados.Descricao)
		if descricao == "" {
			return errors.New("o campo 'Descrição' não pode estar vazio")
		}
		d.Descricao = descricao
		alteracaoFeita = true
	}

	if dados.Categoria != nil {
		categoria := strings.TrimSpace(*dados.Descricao)
		if categoria == "" {
			return errors.New("o campo 'Categoria' não pode estar vazio")
		}
		d.Categoria = categoria
		alteracaoFeita = true
	}

	if dados.Tamanho != nil {
		tamanho := strings.TrimSpace(*dados.Tamanho)
		if tamanho == "" {
			return errors.New("o campo 'Tamanho' não pode estar vazio")
		}
		d.Tamanho = tamanho
		alteracaoFeita = true
	}

	if dados.Estado != nil {
		estado := strings.TrimSpace(*dados.Estado)
		if estado == "" {
			return errors.New("o campo 'Estado' não pode estar vazio")
		}
		d.Estado = estado
		alteracaoFeita = true
	}

	if !alteracaoFeita {
		return errors.New("nenhum dado fornecido para atualização")
	}

	return nil
}
