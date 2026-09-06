package seguranca

import "golang.org/x/crypto/bcrypt"

func Hash(senha string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(senha), bcrypt.DefaultCost)
}

func VerificarSenha(senha, hash string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(senha))
}
