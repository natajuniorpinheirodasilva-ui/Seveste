package repo_doacao

import "seveste-api/src/models"

// FiltroDoacao define os critérios de busca de doações; campos vazios são ignorados
type FiltroDoacao struct {
	Status     string // vazio = todos os status
	Categorias []string
	Condicoes  []string
	Tamanhos   []string
	UF         string
	Cidade     string
	Busca      string // texto no título ou na descrição
	UsuarioID  uint64
	IDs        []uint64 // busca apenas estas doações (ex.: itens salvos)
	Excluir    uint64   // id de uma doação que não deve aparecer no resultado
	Limite     int
}

type DoacaoRepositorio interface {
	Criar(*models.Doacao) (*models.Doacao, error)
	Buscar(filtro FiltroDoacao) ([]models.Doacao, error)
	BuscarPorID(ID uint64) (*models.Doacao, error)
	Salvar(ID uint64, nova *models.Doacao) (*models.Doacao, error)
	Deletar(ID uint64) error

	// fotos guardadas no banco (tabela DoacaoImagem)
	AdicionarFoto(doacaoID uint64, nome, tipoConteudo string, dados []byte) error
	BuscarFoto(nome string) (tipoConteudo string, dados []byte, err error)
}

var DoacaoRepo DoacaoRepositorio
