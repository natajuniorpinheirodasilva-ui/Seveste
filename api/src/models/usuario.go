package models

type TipoUsuario string

const (
	TipoDoador   TipoUsuario = "doador"
	TipoAcolhido TipoUsuario = "acolhido"
)

type Usuario struct {
	ID       uint64      `json:"id"`
	Nome     string      `json:"nome" binding:"required"`
	Email    string      `json:"email" binding:"required,email"`
	Senha    string      `json:"senha,omitempty" binding:"required"`
	Telefone string      `json:"telefone"`
	UF       string      `json:"uf" binding:"required"`
	Cidade   string      `json:"cidade" binding:"required"`
	Tipo     TipoUsuario `json:"tipo" binding:"required"`

	RoupasProcuradas []string `json:"roupas_procuradas"`
	TamanhoRoupa     string   `json:"tamanho_roupa"`
	TamanhoCalcado   uint8    `json:"tamanho_calcado"`
}
