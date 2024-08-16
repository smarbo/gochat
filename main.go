package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
)

var PORT = 8888

func main() {
	setupAPI()
	fmt.Printf("NEW server :%d\n", PORT)
	log.Fatal(http.ListenAndServe(":"+strconv.Itoa(PORT), nil))
}

func setupAPI() {
	Manager := NewManager()
	http.Handle("/", http.FileServer(http.Dir("./frontend")))
	http.HandleFunc("/ws", Manager.serveWS)
}
