package banco

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	setup "seveste-api/sql"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// banco local usado quando DATABASE_URL não está definida
const urlPadrao = "postgres://postgres@localhost:5432/seveste?sslmode=disable"

// Conectar abre a conexão com o PostgreSQL. Se as tabelas ainda não existirem, executa o sql/setup.sql
// e devolve criado = true.
//
// A conexão vem da variável DATABASE_URL, por exemplo a connection string do Prisma Postgres:
// postgres://USUARIO:SENHA@db.prisma.io:5432/postgres?sslmode=require
//
// Para economizar operações no plano gratuito do Prisma, o setup só roda quando o banco está vazio.
// Ao mudar o schema depois, rode o sql/setup.sql manualmente (psql "$DATABASE_URL" -f sql/setup.sql).
func Conectar() (db *sql.DB, criado bool, err error) {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		url = urlPadrao
	}

	db, err = sql.Open("pgx", url)
	if err != nil {
		return nil, false, err
	}

	// na Vercel cada instância da função abre as próprias conexões; poucas bastam
	db.SetMaxOpenConns(3)
	db.SetMaxIdleConns(1)
	db.SetConnMaxIdleTime(time.Minute)

	var existe bool
	if err = db.QueryRow("SELECT to_regclass('usuario') IS NOT NULL").Scan(&existe); err != nil {
		db.Close()
		return nil, false, fmt.Errorf("nao foi possivel conectar ao PostgreSQL (verifique DATABASE_URL): %w", err)
	}

	if existe {
		return db, false, nil
	}

	if _, err = db.Exec(setup.SQL); err != nil {
		db.Close()
		return nil, false, fmt.Errorf("erro ao executar sql/setup.sql: %w", err)
	}

	return db, true, nil
}
