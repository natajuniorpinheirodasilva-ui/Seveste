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
