package main

import (
	"log"
	"net/http"
    "github.com/iamtheazizul/dhall-backend/data"
	"github.com/iamtheazizul/dhall-backend/middleware"
)

func main() {
    // Initialize Okta authentication
    InitAuth()

    data.StartCycleScheduler()
	mux := http.NewServeMux()
	registerRoutes(mux)

	// wrap with CORS middleware
	handler := middleware.WithCORS(mux)

	addr := ":8080"
	log.Printf("Server running on %s", addr)
	log.Fatal(http.ListenAndServe(addr, handler))
}
