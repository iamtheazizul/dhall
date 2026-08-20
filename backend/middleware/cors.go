package middleware

import (
    "net/http"
    "os"
    "strings"
)

func WithCORS(next http.Handler) http.Handler {
    // Build the allowed set once at startup, not on every request
    allowed := map[string]bool{
        "http://dining.skidmore.edu":  true,
        "https://dining.skidmore.edu": true,
        "http://localhost:3000":        true,
        "http://localhost:3001":        true,
    }
    if url := os.Getenv("FRONTEND_URL"); url != "" {
        url = strings.TrimSuffix(url, "/")
        allowed[url] = true
    }

    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        origin := strings.TrimSuffix(r.Header.Get("Origin"), "/")

        if allowed[origin] {
            w.Header().Set("Access-Control-Allow-Origin", origin)
            w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
            w.Header().Set("Access-Control-Allow-Credentials", "true")
            w.Header().Set("Access-Control-Max-Age", "86400")
        }

        if r.Method == "OPTIONS" {
            w.WriteHeader(http.StatusNoContent)
            return
        }

        next.ServeHTTP(w, r)
    })
}