package repo_favorito

import (
	"database/sql"
)

type RepositorioDePostgresFavorito struct {
	db *sql.DB
}

func NovoRepositorioDeFavorito(db *sql.DB) *RepositorioDePostgresFavorito {
	return &RepositorioDePostgresFavorito{db: db}
}

func (r *RepositorioDePostgresFavorito) Adicionar(usuarioID, doacaoID uint64) error {
	_, err := r.db.Exec(
		"INSERT INTO Favorito (id_usuario, id_doacao) VALUES ($1, $2) ON CONFLICT (id_usuario, id_doacao) DO NOTHING",
		usuarioID, doacaoID,
	)
	return err
}

func (r *RepositorioDePostgresFavorito) Remover(usuarioID, doacaoID uint64) error {
	_, err := r.db.Exec("DELETE FROM Favorito WHERE id_usuario = $1 AND id_doacao = $2", usuarioID, doacaoID)
	return err
}

// retorna os ids das doações favoritadas, das mais recentes para as mais antigas
func (r *RepositorioDePostgresFavorito) BuscarPorUsuarioID(usuarioID uint64) ([]uint64, error) {
	linhas, err := r.db.Query("SELECT id_doacao FROM Favorito WHERE id_usuario = $1 ORDER BY criado_em DESC", usuarioID)
	if err != nil {
		return nil, err
	}
	defer linhas.Close()

	ids := []uint64{}
	for linhas.Next() {
		var id uint64
		if err = linhas.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}

	return ids, linhas.Err()
}

func (r *RepositorioDePostgresFavorito) Existe(usuarioID, doacaoID uint64) bool {
	var existe bool
	err := r.db.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM Favorito WHERE id_usuario = $1 AND id_doacao = $2)", usuarioID, doacaoID,
	).Scan(&existe)
	return err == nil && existe
}
