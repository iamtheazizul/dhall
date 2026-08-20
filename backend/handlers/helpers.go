package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/iamtheazizul/dhall-backend/models"
)

// respondWithJSON sends a JSON response
func respondWithJSON(w http.ResponseWriter, statusCode int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(payload)
}

// respondWithError sends an error response
func respondWithError(w http.ResponseWriter, statusCode int, message string) {
	respondWithJSON(w, statusCode, models.ErrorResponse{Error: message})
}
