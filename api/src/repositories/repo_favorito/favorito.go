package repo_favorito

type FavoritoRepositorio interface {
	Adicionar(usuarioID, doacaoID uint64) error
	Remover(usuarioID, doacaoID uint64) error
	BuscarPorUsuarioID(usuarioID uint64) ([]uint64, error)
	Existe(usuarioID, doacaoID uint64) bool
}

var FavoritoRepo FavoritoRepositorio
