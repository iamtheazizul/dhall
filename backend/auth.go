package main

import (
    "context"
    "crypto/rand"
    "encoding/base64"
    "encoding/json"
    "log"
    "net/http"
    "os"
    "strings"
    "time"
    "github.com/coreos/go-oidc/v3/oidc"
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/oauth2"
)

var (
    oauth2Config  *oauth2.Config
    oidcVerifier  *oidc.IDTokenVerifier
    jwtSecret     []byte
    frontendURL   string
)

type Claims struct {
    UserID string `json:"user_id"`
    Email  string `json:"email"`
    Name   string `json:"name"`
    jwt.RegisteredClaims
}

// Helper: Join URLs safely without double slashes
func joinURL(base, path string) string {
    base = strings.TrimSuffix(base, "/")
    path = strings.TrimPrefix(path, "/")
    return base + "/" + path
}

// Initialize Okta authentication
func InitAuth() {
    ctx := context.Background()
    frontendURL = os.Getenv("FRONTEND_URL")
    if frontendURL == "" {
        frontendURL = "http://localhost:3000"
    }
    // Normalize frontendURL by removing trailing slash
    frontendURL = strings.TrimSuffix(frontendURL, "/")
    
    // Load from environment variables
    oktaDomain := os.Getenv("OKTA_DOMAIN")
    clientID := os.Getenv("OKTA_CLIENT_ID")
    clientSecret := os.Getenv("OKTA_CLIENT_SECRET")
    redirectURL := os.Getenv("OKTA_REDIRECT_URL")
    jwtSecretStr := os.Getenv("JWT_SECRET")
    
    if oktaDomain == "" || clientID == "" || clientSecret == "" || redirectURL == "" {
        log.Fatal("Missing required Okta environment variables")
    }
    
    if jwtSecretStr == "" {
        jwtSecretStr = generateRandomString(32)
        log.Println("⚠️ Using auto-generated JWT secret. Set JWT_SECRET env var for production!")
    }
    jwtSecret = []byte(jwtSecretStr)
    
    // Set up OIDC provider
    provider, err := oidc.NewProvider(ctx, "https://"+oktaDomain)
    if err != nil {
        log.Fatalf("Failed to create OIDC provider: %v", err)
    }
    
    // Configure OAuth2
    oauth2Config = &oauth2.Config{
        ClientID:     clientID,
        ClientSecret: clientSecret,
        RedirectURL:  redirectURL,
        Endpoint:     provider.Endpoint(),
        Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
    }
    
    // Set up ID token verifier
    oidcVerifier = provider.Verifier(&oidc.Config{ClientID: clientID})
    
    isProduction := frontendURL != "http://localhost:3000"
    if isProduction {
        log.Println("✅ Okta JWT authentication initialized (Production mode)")
    } else {
        log.Println("✅ Okta JWT authentication initialized (Development mode)")
    }
}

// Login handler - redirects to Okta
func LoginHandler(w http.ResponseWriter, r *http.Request) {
    // Generate random state and store in cookie temporarily
    state := generateRandomString(32)
    
    // Store state in a temporary cookie (will be deleted after callback)
    http.SetCookie(w, &http.Cookie{
        Name:     "oauth_state",
        Value:    state,
        Path:     "/",
        MaxAge:   300, // 5 minutes
        HttpOnly: true,
        Secure:   frontendURL != "http://localhost:3000",
        SameSite: http.SameSiteLaxMode,
    })
    
    // Redirect to Okta login
    url := oauth2Config.AuthCodeURL(state)
    http.Redirect(w, r, url, http.StatusFound)
}

// Callback handler - receives code from Okta and returns JWT
func CallbackHandler(w http.ResponseWriter, r *http.Request) {
    ctx := context.Background()
    
    // Get state from cookie
    cookie, err := r.Cookie("oauth_state")
    if err != nil {
        http.Error(w, "Missing state cookie", http.StatusBadRequest)
        return
    }
    storedState := cookie.Value
    
    // Verify state
    state := r.URL.Query().Get("state")
    if state != storedState {
        http.Error(w, "Invalid state parameter", http.StatusBadRequest)
        return
    }
    
    // Delete state cookie
    http.SetCookie(w, &http.Cookie{
        Name:   "oauth_state",
        Value:  "",
        Path:   "/",
        MaxAge: -1,
    })
    
    // Exchange code for token
    code := r.URL.Query().Get("code")
    oauth2Token, err := oauth2Config.Exchange(ctx, code)
    if err != nil {
        http.Error(w, "Failed to exchange token: "+err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Extract ID token
    rawIDToken, ok := oauth2Token.Extra("id_token").(string)
    if !ok {
        http.Error(w, "No id_token in token response", http.StatusInternalServerError)
        return
    }
    
    // Verify ID token
    idToken, err := oidcVerifier.Verify(ctx, rawIDToken)
    if err != nil {
        http.Error(w, "Failed to verify ID token: "+err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Extract claims
    var oktaClaims struct {
        Email string `json:"email"`
        Name  string `json:"name"`
        Sub   string `json:"sub"`
    }
    if err := idToken.Claims(&oktaClaims); err != nil {
        http.Error(w, "Failed to parse claims: "+err.Error(), http.StatusInternalServerError)
        return
    }
    
    // Create JWT token
    claims := Claims{
        UserID: oktaClaims.Sub,
        Email:  oktaClaims.Email,
        Name:   oktaClaims.Name,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString(jwtSecret)
    if err != nil {
        http.Error(w, "Failed to create token", http.StatusInternalServerError)
        return
    }
    
    log.Printf("✅ User logged in: %s (%s)", oktaClaims.Name, oktaClaims.Email)
    
    // Redirect to frontend with token as URL parameter - use joinURL helper
    redirectURL := joinURL(frontendURL, "/admin") + "?token=" + tokenString
    http.Redirect(w, r, redirectURL, http.StatusFound)
}

// Logout handler
func LogoutHandler(w http.ResponseWriter, r *http.Request) {
    log.Println("👋 User logged out")
    // With JWT, logout is client-side (delete token from localStorage)
    // Just redirect to home - use joinURL helper
    http.Redirect(w, r, joinURL(frontendURL, "/"), http.StatusFound)
}

// Middleware to require authentication
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // Get token from Authorization header
        authHeader := r.Header.Get("Authorization")
        if authHeader == "" {
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusUnauthorized)
            json.NewEncoder(w).Encode(map[string]string{
                "error":   "Unauthorized",
                "message": "Missing authorization token",
            })
            return
        }
        
        // Extract token (format: "Bearer <token>")
        parts := strings.Split(authHeader, " ")
        if len(parts) != 2 || parts[0] != "Bearer" {
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusUnauthorized)
            json.NewEncoder(w).Encode(map[string]string{
                "error":   "Unauthorized",
                "message": "Invalid authorization format",
            })
            return
        }
        
        tokenString := parts[1]
        
        // Parse and validate token
        token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
            return jwtSecret, nil
        }, jwt.WithValidMethods([]string{"HS256"}))
        if err != nil || !token.Valid {
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusUnauthorized)
            json.NewEncoder(w).Encode(map[string]string{
                "error":   "Unauthorized",
                "message": "Invalid or expired token",
            })
            return
        }
        
        next(w, r)
    }
}

// Get current user info
func GetUserHandler(w http.ResponseWriter, r *http.Request) {
    // Get token from Authorization header
    authHeader := r.Header.Get("Authorization")
    if authHeader == "" {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]interface{}{
            "authenticated": false,
        })
        return
    }
    
    // Extract token
    parts := strings.Split(authHeader, " ")
    if len(parts) != 2 || parts[0] != "Bearer" {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]interface{}{
            "authenticated": false,
        })
        return
    }
    
    tokenString := parts[1]
    
    // Parse token
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return jwtSecret, nil
    }, jwt.WithValidMethods([]string{"HS256"}))

    if err != nil || !token.Valid {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]interface{}{
            "authenticated": false,
        })
        return
    }
    
    claims, ok := token.Claims.(*Claims)
    if !ok {
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(map[string]interface{}{
            "authenticated": false,
        })
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "authenticated": true,
        "user_id":       claims.UserID,
        "email":         claims.Email,
        "name":          claims.Name,
    })
}

// Helper: Generate random string
func generateRandomString(length int) string {
    bytes := make([]byte, length)
    rand.Read(bytes)
    return base64.URLEncoding.EncodeToString(bytes)
}