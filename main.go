package main

import (
    "fmt"
    "net/http"
)

func hello(w http.ResponseWriter, req *http.Request) {

    fmt.Fprintf(w, "Por algo se empieza kinga ...\n")
}

func main() {

    http.HandleFunc("/", hello)

    http.ListenAndServe(":8090", nil)
}