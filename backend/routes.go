package main

import (
	"net/http"

	"github.com/jek821/dhall/handlers"
)

func registerRoutes(mux *http.ServeMux) {
	// Auth endpoints
	mux.HandleFunc("/auth/login", LoginHandler)
	mux.HandleFunc("/auth/callback", CallbackHandler)
	mux.HandleFunc("/auth/logout", LogoutHandler)
	mux.HandleFunc("/auth/user", GetUserHandler)

	// Legacy endpoints (for backward compatibility)
	mux.HandleFunc("/daily", handlers.GetDailyHandler)

	// Food CRUD endpoints
	mux.HandleFunc("/foods", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			// Public - anyone can view
			if r.URL.Query().Get("id") != "" {
				handlers.GetFoodHandler(w, r)
			} else {
				handlers.GetAllFoodsHandler(w, r)
			}
		case http.MethodPost:
			// Protected - requires auth
			RequireAuth(handlers.CreateFoodHandler)(w, r)
			// handlers.CreateFoodHandler(w, r)
		case http.MethodPut:
			// Protected - requires auth
			RequireAuth(handlers.UpdateFoodHandler)(w, r)
			// handlers.UpdateFoodHandler(w, r)
		case http.MethodDelete:
			// Protected - requires auth
			RequireAuth(handlers.DeleteFoodHandler)(w, r)
			// handlers.DeleteFoodHandler(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Cycle CRUD endpoints
	mux.HandleFunc("/cycles", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			// Public - anyone can view
			if r.URL.Query().Get("id") != "" {
				handlers.GetCycleHandler(w, r)
			} else {
				handlers.GetAllCyclesHandler(w, r)
			}
		case http.MethodPost:
			// Protected - requires auth
			RequireAuth(handlers.CreateCycleHandler)(w, r)
			// handlers.CreateCycleHandler(w, r)

		case http.MethodPut:
			// Protected - requires auth
			RequireAuth(handlers.UpdateCycleHandler)(w, r)
			// handlers.UpdateCycleHandler(w, r)

		case http.MethodDelete:
			// Protected - requires auth
			RequireAuth(handlers.DeleteCycleHandler)(w, r)
			// handlers.DeleteCycleHandler(w, r)


		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Hours endpoint
	mux.HandleFunc("/hours", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handlers.GetHoursHandler(w, r)
		case http.MethodPut:
			RequireAuth(handlers.UpdateHoursHandler)(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Serve uploaded images
	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir("data/uploads"))))

	// Slideshow endpoints
	mux.HandleFunc("/slideshow", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			handlers.GetSlideshowHandler(w, r)
		case http.MethodPost:
			RequireAuth(handlers.UploadSlideshowImageHandler)(w, r) // Changed to upload handler
		case http.MethodPut:
			RequireAuth(handlers.UpdateSlideshowImageHandler)(w, r)
		case http.MethodDelete:
			RequireAuth(handlers.DeleteSlideshowImageHandler)(w, r)
		default:
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		}
	})
}