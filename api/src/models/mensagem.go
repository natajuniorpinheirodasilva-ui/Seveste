package models

import (
	"errors"
	"strings"
	"time"
)

// Mensagem trocada entre o acolhido e o doador dentro de uma solicitação
type Mensagem struct {
	ID            uint64    `json:"id_mensagem"`
	SolicitacaoID uint64    `json:"id_solicitacao"`
	UsuarioID     uint64    `json:"id_usuario"`
	Texto         string    `json:"texto"`
	EnviadaEm     time.Time `json:"enviada_em"`
}

func (m *Mensagem) Preparar() error {
	m.Texto = strings.TrimSpace(m.Texto)

	if m.Texto == "" {
		return errors.New("a mensagem nao pode estar vazia")
	}

	if len(m.Texto) > 1000 {
		return errors.New("a mensagem deve ter no maximo 1000 caracteres")
	}

	if m.SolicitacaoID == 0 || m.UsuarioID == 0 {
		return errors.New("mensagem sem solicitacao ou remetente")
	}

	return nil
}
