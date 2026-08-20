package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/iamtheazizul/dhall-backend/models"
)

// CreateCycleHandler handles POST /cycles
func CreateCycleHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.CreateCycleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Validate required fields
	if req.Name == "" {
		respondWithError(w, http.StatusBadRequest, "name is required")
		return
	}

	if req.Order < 1 {
        respondWithError(w, http.StatusBadRequest, "order must be at least 1")
        return
    }

	cycle := models.GlobalStore.CreateCycle(req)
	respondWithJSON(w, http.StatusCreated, cycle)
}

// GetCycleHandler handles GET /cycles/{id}
func GetCycleHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "id parameter is required")
		return
	}

	// Check if we should include full food details
	includeFoods := r.URL.Query().Get("include_foods") == "true"

	if includeFoods {
		cycle, foodData, err := models.GlobalStore.GetCycleWithFoods(id)
		if err != nil {
			if errors.Is(err, models.ErrCycleNotFound) {
				respondWithError(w, http.StatusNotFound, "cycle not found")
				return
			}
			respondWithError(w, http.StatusInternalServerError, "failed to get cycle")
			return
		}

		response := map[string]interface{}{
			"cycle": cycle,
			"days_with_foods": foodData,
		}
		respondWithJSON(w, http.StatusOK, response)
		return
	}

	cycle, err := models.GlobalStore.GetCycle(id)
	if err != nil {
		if errors.Is(err, models.ErrCycleNotFound) {
			respondWithError(w, http.StatusNotFound, "cycle not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "failed to get cycle")
		return
	}

	respondWithJSON(w, http.StatusOK, cycle)
}

// GetAllCyclesHandler handles GET /cycles
func GetAllCyclesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cycles := models.GlobalStore.GetAllCycles()
	respondWithJSON(w, http.StatusOK, cycles)
}

// UpdateCycleHandler handles PUT /cycles/{id}
func UpdateCycleHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "id parameter is required")
		return
	}

	var req models.UpdateCycleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	cycle, err := models.GlobalStore.UpdateCycle(id, req)
	if err != nil {
		if errors.Is(err, models.ErrCycleNotFound) {
			respondWithError(w, http.StatusNotFound, "cycle not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "failed to update cycle")
		return
	}

	respondWithJSON(w, http.StatusOK, cycle)
}

// DeleteCycleHandler handles DELETE /cycles/{id}
func DeleteCycleHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "id parameter is required")
		return
	}

	err := models.GlobalStore.DeleteCycle(id)
	if err != nil {
		if errors.Is(err, models.ErrCycleNotFound) {
			respondWithError(w, http.StatusNotFound, "cycle not found")
			return
		}
		respondWithError(w, http.StatusInternalServerError, "failed to delete cycle")
		return
	}

	respondWithJSON(w, http.StatusOK, models.SuccessResponse{Message: "cycle deleted successfully"})
}
