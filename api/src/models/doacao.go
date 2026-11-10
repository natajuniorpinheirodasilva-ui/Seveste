package models

import (
	"errors"
	"fmt"
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
	CondicoesPermitidas  = []string{"novo", "usado_excelente", "usado_marcas"}
	// "levar": o doador leva até o acolhido; "frete": a peça é enviada por frete
	TiposDeEntregaPermitidos = []string{"levar", "frete"}
)

type Doacao struct {
	ID            uint64 `json:"id_doacao"`
	Titulo        string `json:"titulo" binding:"required"`
	Descricao     string `json:"descricao" binding:"required"`
	Categoria     string `json:"categoria" binding:"required"`
	Tamanho       string `json:"tamanho" binding:"required"`
	Condicao      string `json:"condicao" binding:"required"`
	TipoDeEntrega string `json:"tipo_de_entrega" binding:"required"`
	Status        string `json:"status" binding:"required"`

	// campos opcionais
	Cor      string `json:"cor"`
	Material string `json:"material"`
	// bairro ou região aproximada - nunca o endereço completo
	Local string `json:"local"`

	// endereço do doador (tabela Endereco); só cidade e UF são expostos
	EnderecoID uint64 `json:"-"`
	Cidade     string `json:"cidade"`
	UF         string `json:"uf"`

	// nomes dos arquivos salvos na pasta de uploads (tabela DoacaoImagem, a primeira é a capa)
	Fotos []string `json:"fotos"`

	CriadoEm     time.Time `json:"criado_em"`
	AtualizadoEm time.Time `json:"atualizado_em"`

	UsuarioID uint64 `json:"usuario_id" binding:"required"`

	// preenchidos pelo repositório na mesma consulta da doação (evita uma consulta extra por anúncio)
	Doador            *UsuarioPublico `json:"doador"`
	TotalSolicitacoes int             `json:"total_solicitacoes"`
}

type AtualizacaoDoacao struct {
	Titulo        *string `json:"titulo"`
	Descricao     *string `json:"descricao"`
	Categoria     *string `json:"categoria"`
	Tamanho       *string `json:"tamanho"`
	Condicao      *string `json:"condicao"`
	TipoDeEntrega *string `json:"tipo_de_entrega"`
	Cor           *string `json:"cor"`
	Material      *string `json:"material"`
	Local         *string `json:"local"`
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
	d.Condicao = strings.ToLower(strings.TrimSpace(d.Condicao))
	d.TipoDeEntrega = strings.ToLower(strings.TrimSpace(d.TipoDeEntrega))
	d.Status = strings.TrimSpace(d.Status)
	d.Cor = strings.TrimSpace(d.Cor)
	d.Material = strings.TrimSpace(d.Material)
	d.Local = strings.TrimSpace(d.Local)
}

// valida se campos obrigatórios estão preenchidos e respeitam os limites das colunas do banco
func (d *Doacao) validar() error {
	if (d.Titulo == "") || (d.Descricao == "") || (d.Categoria == "") || (d.Tamanho == "") ||
		(d.Condicao == "") || (d.TipoDeEntrega == "") || (d.Status == "") {
		return errors.New("todos os campos sao obrigatorios e devem ser preenchidos")
	}

	limites := []struct {
		valor  string
		maximo int
		campo  string
	}{
		{d.Titulo, 80, "titulo"},
		{d.Descricao, 300, "descricao"},
		{d.Tamanho, 10, "tamanho"},
		{d.Cor, 40, "cor"},
		{d.Material, 40, "material"},
		{d.Local, 80, "local"},
	}
	for _, l := range limites {
		if len([]rune(l.valor)) > l.maximo {
			return fmt.Errorf("o campo '%s' deve ter no maximo %d caracteres", l.campo, l.maximo)
		}
	}

	if !slices.Contains(CategoriasPermitidas, d.Categoria) {
		return errors.New("categoria invalida")
	}

	if !slices.Contains(CondicoesPermitidas, d.Condicao) {
		return errors.New("condicao da peca invalida")
	}

	if !slices.Contains(TiposDeEntregaPermitidos, d.TipoDeEntrega) {
		return errors.New(`tipo de entrega invalido, permitidos: ["levar", "frete"]`)
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
		{dados.Condicao, &d.Condicao},
		{dados.TipoDeEntrega, &d.TipoDeEntrega},
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
