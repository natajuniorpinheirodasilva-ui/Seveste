package models

import (
	"errors"
	"slices"
	"strings"
	"time"
)

const (
	StatusDoacaoDisponivel string = "disponivel"
	StatusDoacaoDoada      string = "doada"

	MaximoFotosPorDoacao int = 4
)

var (
	CategoriasPermitidas = []string{"roupas", "agasalhos", "calcados", "acessorios", "infantil"}
	EstadosPermitidos    = []string{"novo", "usado_excelente", "usado_marcas"}
)

type Doacao struct {
	ID        uint64 `json:"id_doacao"`
	Titulo    string `json:"titulo" binding:"required"`
	Descricao string `json:"descricao" binding:"required"`
	Categoria string `json:"categoria" binding:"required"`
	Tamanho   string `json:"tamanho" binding:"required"`
	Estado    string `json:"estado" binding:"required"`
	Status    string `json:"status" binding:"required"`

	// campos opcionais
	Cor      string `json:"cor"`
	Material string `json:"material"`
	// bairro ou região aproximada - nunca o endereço completo
	Local string `json:"local"`

	// copiados do doador no momento da criação para permitir filtros por região
	Cidade string `json:"cidade"`
	UF     string `json:"uf"`

	// nomes dos arquivos salvos na pasta de uploads
	Fotos []string `json:"fotos"`

	CriadoEm time.Time `json:"criado_em"`

	UsuarioID uint64 `json:"usuario_id" binding:"required"`
}

type AtualizacaoDoacao struct {
	Titulo    *string `json:"titulo"`
	Descricao *string `json:"descricao"`
	Categoria *string `json:"categoria"`
	Tamanho   *string `json:"tamanho"`
	Estado    *string `json:"estado"`
	Cor       *string `json:"cor"`
	Material  *string `json:"material"`
	Local     *string `json:"local"`
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
	d.Categoria = strings.ToLower(strings.TrimSpace(d.Categoria))
	d.Tamanho = strings.ToUpper(strings.TrimSpace(d.Tamanho))
	d.Estado = strings.ToLower(strings.TrimSpace(d.Estado))
	d.Status = strings.TrimSpace(d.Status)
	d.Cor = strings.TrimSpace(d.Cor)
	d.Material = strings.TrimSpace(d.Material)
	d.Local = strings.TrimSpace(d.Local)
}

// valida se campos obrigatórios estão preenchidos
func (d *Doacao) validar() error {
	if (d.Titulo == "") || (d.Descricao == "") || (d.Categoria == "") || (d.Tamanho == "") || (d.Estado == "") || (d.Status == "") {
		return errors.New("todos os campos sao obrigatorios e devem ser preenchidos")
	}

	if len(d.Titulo) > 80 {
		return errors.New("o titulo deve ter no maximo 80 caracteres")
	}

	if len(d.Descricao) > 1000 {
		return errors.New("a descricao deve ter no maximo 1000 caracteres")
	}

	if len(d.Tamanho) > 10 {
		return errors.New("o tamanho deve ter no maximo 10 caracteres")
	}

	if len(d.Cor) > 40 || len(d.Material) > 40 || len(d.Local) > 80 {
		return errors.New("cor, material ou local excedem o tamanho permitido")
	}

	if !slices.Contains(CategoriasPermitidas, d.Categoria) {
		return errors.New("categoria invalida")
	}

	if !slices.Contains(EstadosPermitidos, d.Estado) {
		return errors.New("estado de conservacao invalido")
	}

	return nil
}

// altera dos dados da doação se eles forem válidos
func (d *Doacao) Mesclar(dados AtualizacaoDoacao) error {
	alteracaoFeita := false

	campos := []struct {
		valor   *string
		destino *string
	}{
		{dados.Titulo, &d.Titulo},
		{dados.Descricao, &d.Descricao},
		{dados.Categoria, &d.Categoria},
		{dados.Tamanho, &d.Tamanho},
		{dados.Estado, &d.Estado},
		{dados.Cor, &d.Cor},
		{dados.Material, &d.Material},
		{dados.Local, &d.Local},
	}

	for _, campo := range campos {
		if campo.valor != nil {
			*campo.destino = *campo.valor
			alteracaoFeita = true
		}
	}

	if !alteracaoFeita {
		return errors.New("nenhum dado fornecido para atualização")
	}

	// reaproveita a mesma formatação e validação da criação
	return d.Preparar()
}
