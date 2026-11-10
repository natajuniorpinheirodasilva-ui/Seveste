package main

import (
	"log"
	"seveste-api/src/app"
)

// Executa a API localmente (go run .). Na Vercel, quem inicia a API é o api/index.go.
func main() {
	router, err := app.Iniciar()
	if err != nil {
		log.Fatal(err)
	}

	router.Run()
}
