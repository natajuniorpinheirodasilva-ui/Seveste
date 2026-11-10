package repo_usuario

import (
	"database/sql"
	"encoding/json"
	"errors"
	"seveste-api/src/models"
	"strings"

	"github.com/jackc/pgx/v5/pgconn"
)

type RepositorioDePostgresUsuario struct {
	db *sql.DB
}

func NovoRepositorioDeUsuario(db *sql.DB) *RepositorioDePostgresUsuario {
	return &RepositorioDePostgresUsuario{db: db}
}

// o tipo vem de TipoUsuario e a cidade de Cidade (via Endereco)
const selectUsuario = `
	SELECT u.id_usuario, u.nome, t.tipo, u.email, u.senha_hash, COALESCE(u.telefone, ''), u.bio,
	       u.roupas_procuradas, COALESCE(u.tamanho_roupa, ''), COALESCE(u.tamanho_calcado, 0),
	       u.consentimento_em, u.versao_politica, u.criado_em, u.atualizado_em,
	       e.id_endereco, e.rua, e.numero, COALESCE(e.complemento, ''), ci.cidade, e.uf
	FROM Usuario u
	JOIN TipoUsuario t ON t.id_tipo_usuario = u.tipo_usuario
	JOIN Endereco e ON e.id_endereco = u.id_endereco
	JOIN Cidade ci ON ci.id_cidade = e.id_cidade`

type leitor interface {
	Scan(dest ...any) error
}

func lerUsuario(linha leitor) (*models.Usuario, error) {
	var u models.Usuario
	var roupas []byte

	err := linha.Scan(
		&u.ID, &u.Nome, &u.Tipo, &u.Email, &u.Senha, &u.Telefone, &u.Bio,
		&roupas, &u.TamanhoRoupa, &u.TamanhoCalcado,
		&u.ConsentimentoEm, &u.VersaoPolitica, &u.CriadoEm, &u.AtualizadoEm,
		&u.EnderecoID, &u.Rua, &u.Numero, &u.Complemento, &u.Cidade, &u.UF,
	)
	if err != nil {
		return nil, err
	}

	if len(roupas) > 0 {
		if err = json.Unmarshal(roupas, &u.RoupasProcuradas); err != nil {
			return nil, err
		}
	}

	return &u, nil
}

func roupasJSON(u *models.Usuario) (any, error) {
	if len(u.RoupasProcuradas) == 0 {
		return nil, nil
	}
	dados, err := json.Marshal(u.RoupasProcuradas)
	return string(dados), err
}

// devolve o id da cidade, cadastrando-a se ainda não existir (sem diferenciar maiúsculas)
func obterCidadeID(tx *sql.Tx, nome string) (int64, error) {
	var id int64
	err := tx.QueryRow("SELECT id_cidade FROM Cidade WHERE LOWER(cidade) = LOWER($1)", nome).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		err = tx.QueryRow(
			`INSERT INTO Cidade (cidade) VALUES ($1)
			 ON CONFLICT (LOWER(cidade)) DO UPDATE SET cidade = Cidade.cidade
			 RETURNING id_cidade`, nome,
		).Scan(&id)
	}
	return id, err
}

func (r *RepositorioDePostgresUsuario) Criar(u *models.Usuario) (*models.Usuario, error) {
	roupas, err := roupasJSON(u)
	if err != nil {
		return nil, err
	}

	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	cidadeID, err := obterCidadeID(tx, u.Cidade)
	if err != nil {
		return nil, err
	}

	var enderecoID int64
	err = tx.QueryRow(
		`INSERT INTO Endereco (rua, numero, uf, complemento, id_cidade) VALUES ($1, $2, $3, $4, $5) RETURNING id_endereco`,
		u.Rua, u.Numero, u.UF, u.Complemento, cidadeID,
	).Scan(&enderecoID)
	if err != nil {
		return nil, err
	}

	var id int64
	err = tx.QueryRow(`
		INSERT INTO Usuario (nome, email, senha_hash, telefone, criado_em, tipo_usuario, id_endereco, bio,
		                     roupas_procuradas, tamanho_roupa, tamanho_calcado, consentimento_em, versao_politica)
		VALUES ($1, $2, $3, $4, $5, (SELECT id_tipo_usuario FROM TipoUsuario WHERE tipo = $6), $7, $8, $9, $10, $11, $12, $13)
		RETURNING id_usuario`,
		u.Nome, u.Email, u.Senha, u.Telefone, u.CriadoEm, u.Tipo, enderecoID, u.Bio,
		roupas, u.TamanhoRoupa, u.TamanhoCalcado, u.ConsentimentoEm, u.VersaoPolitica,
	).Scan(&id)
	if emailDuplicado(err) {
		return nil, ErrEmailEmUso
	}
	if err != nil {
		return nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return r.BuscarPorID(uint64(id))
}

func (r *RepositorioDePostgresUsuario) BuscarTodos() ([]models.Usuario, error) {
	linhas, err := r.db.Query(selectUsuario + " ORDER BY u.id_usuario")
	if err != nil {
		return nil, err
	}
	defer linhas.Close()

	usuarios := []models.Usuario{}
	for linhas.Next() {
		u, err := lerUsuario(linhas)
		if err != nil {
			return nil, err
		}
		usuarios = append(usuarios, *u)
	}

	return usuarios, linhas.Err()
}

func (r *RepositorioDePostgresUsuario) BuscarPorID(ID uint64) (*models.Usuario, error) {
	u, err := lerUsuario(r.db.QueryRow(selectUsuario+" WHERE u.id_usuario = $1", ID))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("usuario nao encontrado")
	}
	return u, err
}

func (r *RepositorioDePostgresUsuario) BuscarPorEmail(email string) (*models.Usuario, error) {
	u, err := lerUsuario(r.db.QueryRow(selectUsuario+" WHERE u.email = $1", strings.ToLower(strings.TrimSpace(email))))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("usuario nao encontrado")
	}
	return u, err
}

func (r *RepositorioDePostgresUsuario) Salvar(ID uint64, novo *models.Usuario) (*models.Usuario, error) {
	roupas, err := roupasJSON(novo)
	if err != nil {
		return nil, err
	}

	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	resultado, err := tx.Exec(`
		UPDATE Usuario SET nome = $1, telefone = $2, bio = $3, roupas_procuradas = $4, tamanho_roupa = $5,
		                   tamanho_calcado = $6, atualizado_em = NOW()
		WHERE id_usuario = $7`,
		novo.Nome, novo.Telefone, novo.Bio, roupas, novo.TamanhoRoupa, novo.TamanhoCalcado, ID,
	)
	if err != nil {
		return nil, err
	}
	if afetadas, _ := resultado.RowsAffected(); afetadas == 0 {
		return nil, errors.New("usuario nao encontrado")
	}

	cidadeID, err := obterCidadeID(tx, novo.Cidade)
	if err != nil {
		return nil, err
	}

	if _, err = tx.Exec(
		`UPDATE Endereco SET rua = $1, numero = $2, uf = $3, complemento = $4, id_cidade = $5 WHERE id_endereco = $6`,
		novo.Rua, novo.Numero, novo.UF, novo.Complemento, cidadeID, novo.EnderecoID,
	); err != nil {
		return nil, err
	}

	if err = tx.Commit(); err != nil {
		return nil, err
	}

	return r.BuscarPorID(ID)
}

// Remove o usuário. Doações, imagens, histórico, solicitações, avaliações e favoritos saem em cascata
// pelas chaves estrangeiras; o endereço (que não aponta para o usuário) é apagado em seguida.
func (r *RepositorioDePostgresUsuario) Deletar(ID uint64) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var enderecoID int64
	err = tx.QueryRow("DELETE FROM Usuario WHERE id_usuario = $1 RETURNING id_endereco", ID).Scan(&enderecoID)
	if errors.Is(err, sql.ErrNoRows) {
		return errors.New("usuario nao encontrado")
	}
	if err != nil {
		return err
	}

	if _, err = tx.Exec("DELETE FROM Endereco WHERE id_endereco = $1", enderecoID); err != nil {
		return err
	}

	return tx.Commit()
}

// erro 23505 do PostgreSQL: violação de UNIQUE
func emailDuplicado(err error) bool {
	var erroPostgres *pgconn.PgError
	return errors.As(err, &erroPostgres) && erroPostgres.Code == "23505"
}
