package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/jek821/dhall/data"
)

// GetDailyHandler handles GET /daily (legacy endpoint)
// This endpoint returns the old fake data structure for backward compatibility
func GetDailyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	dailyData := data.FakeDailyData()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dailyData)
}
