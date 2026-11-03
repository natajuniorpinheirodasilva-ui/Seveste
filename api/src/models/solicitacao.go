package models

import (
	"errors"
	"slices"
	"strings"
	"time"
)

type Solicitacao struct {
	ID        uint64    `json:"id_solicitacao"`
	Status    string    `json:"status" binding:"required"`
	CriadoEm  time.Time `json:"criado_em"`
	IDDoacao  uint64    `json:"id_doacao" binding:"required"`
	IDUsuario uint64    `json:"id_usuario"`
}

func (s *Solicitacao) Preparar() error {
	s.formatar()

	if err := s.validar(); err != nil {
		return err
	}

	return nil
}

func (s *Solicitacao) formatar() {
	s.Status = strings.ToUpper(strings.TrimSpace(s.Status))
}

func (s *Solicitacao) validar() error {
	if s.IDDoacao == 0 {
		return errors.New("o id_doacao e obrigatorio e deve ser valido")
	}

	if s.IDUsuario == 0 {
		return errors.New("o id_usuario e obrigatorio e deve ser valido")
	}

	if s.Status == "" {
		return errors.New("o campo 'status' e obrigatorio")
	}

	statusPermitidos := []string{"PENDENTE", "ACEITA", "RECUSADA"}
	if !slices.Contains(statusPermitidos, s.Status) {
		return errors.New(`status invalido para a solicitadao, permitidos: ["PENDENTE", "ACEITA", "RECUSADA"]`)
	}

	return nil
}
