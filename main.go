package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"github.com/joho/godotenv"
)

var PORT int

func main() {
	godotenv.Load()
	PORT, _ := strconv.Atoi(os.Getenv("PORT"))
	setupAPI()
	fmt.Printf("NEW server :%d\n", PORT)
	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(PORT), nil))
}

func setupAPI() {
	Manager := NewManager()
	http.Handle("/", http.FileServer(http.Dir("./frontend")))
	http.HandleFunc("/ws", Manager.serveWS)
}
