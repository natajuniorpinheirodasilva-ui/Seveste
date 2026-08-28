package main

import "seveste-api/src/router"

func main() {
	router := router.Gerar()
	router.Run()
}
