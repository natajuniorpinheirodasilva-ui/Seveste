package models

type Usuario struct {
	ID       int    `json:"id"`
	Nome     string `json:"nome" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Senha    string `json:"senha,omitempty" binding:"required"`
	Telefone string `json:"telefone"`
	UF       string `json:"uf" binding:"required"`
	Cidade   string `json:"cidade" binding:"required"`
}

type Doador struct {
	Usuario
}

type Acolhido struct {
	Usuario
	RoupasProcuradas []string `json:"roupas_procuradas"`
	TamanhoRoupa     string   `json:"tamanho_roupa"`
	TamanhoCalcado   uint8    `json:"tamanho_calcado"`
}
