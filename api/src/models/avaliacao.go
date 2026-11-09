package models

import (
	"errors"
	"strings"
	"time"
)

// Avaliacao feita por uma das partes ao final de uma doação concluída (solicitação aceita)
type Avaliacao struct {
	ID            uint64    `json:"id_avaliacao"`
	SolicitacaoID uint64    `json:"id_solicitacao"`
	AutorID       uint64    `json:"id_autor"`
	AvaliadoID    uint64    `json:"id_avaliado"`
	Nota          uint8     `json:"nota"`
	Comentario    string    `json:"comentario"`
	CriadoEm      time.Time `json:"criado_em"`
}

func (a *Avaliacao) Preparar() error {
	a.Comentario = strings.TrimSpace(a.Comentario)

	if a.Nota < 1 || a.Nota > 5 {
		return errors.New("a nota deve estar entre 1 e 5")
	}

	if len(a.Comentario) > 500 {
		return errors.New("o comentario deve ter no maximo 500 caracteres")
	}

	if a.AutorID == a.AvaliadoID {
		return errors.New("nao e possivel avaliar a si mesmo")
	}

	return nil
}
