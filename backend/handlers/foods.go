package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/jek821/dhall/data"
)

// CreateFoodHandler handles POST /foods
func CreateFoodHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req data.CreateFoodRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Validate required fields
	if req.Name == "" {
		respondWithError(w, http.StatusBadRequest, "name is required")
		return
	}

	food := data.GlobalStore.CreateFood(req)
	respondWithJSON(w, http.StatusCreated, food)
}

// GetFoodHandler handles GET /foods/{id}
func GetFoodHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "id parameter is required")
		return
	}

	food, err := data.GlobalStore.GetFood(id)
	if err != nil {
		if errors.Is(err, data.ErrFoodNotFound) {
			respondWithError(w, http.StatusNotFound, "food not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "failed to get food")
		return
	}

	respondWithJSON(w, http.StatusOK, food)
}

// GetAllFoodsHandler handles GET /foods
func GetAllFoodsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	foods := data.GlobalStore.GetAllFoods()
	respondWithJSON(w, http.StatusOK, foods)
}

// UpdateFoodHandler handles PUT /foods/{id}
func UpdateFoodHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "id parameter is required")
		return
	}

	var req data.UpdateFoodRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	food, err := data.GlobalStore.UpdateFood(id, req)
	if err != nil {
		if errors.Is(err, data.ErrFoodNotFound) {
			respondWithError(w, http.StatusNotFound, "food not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "failed to update food")
		return
	}

	respondWithJSON(w, http.StatusOK, food)
}

// DeleteFoodHandler handles DELETE /foods/{id}
func DeleteFoodHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "id parameter is required")
		return
	}

	err := data.GlobalStore.DeleteFood(id)
	if err != nil {
		if errors.Is(err, data.ErrFoodNotFound) {
			respondWithError(w, http.StatusNotFound, "food not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "failed to delete food")
		return
	}

	respondWithJSON(w, http.StatusOK, data.SuccessResponse{Message: "food deleted successfully"})
}
