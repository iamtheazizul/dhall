package data

import (
	"time"

	"github.com/google/uuid"
)

type Restriction string

const (
	RestrictionFish       Restriction = "Fish"
	RestrictionSoy        Restriction = "Soy"
	RestrictionGluten     Restriction = "Gluten"
	RestrictionSesame     Restriction = "Sesame"
	RestrictionPork       Restriction = "Pork"
	RestrictionShellfish  Restriction = "Shellfish"
	RestrictionEggs       Restriction = "Eggs"
	RestrictionDairy      Restriction = "Dairy"
	RestrictionHalal      Restriction = "Halal"
	RestrictionSpicy      Restriction = "Spicy"
	RestrictionVegetarian Restriction = "Vegetarian"
	RestrictionVegan      Restriction = "Vegan"
)

type Station string

const (
	StationEmily  Station = "Emily's Garden"
	StationDiner  Station = "Diner"
	StationGlobal Station = "Global/Noodle Bar"
	StationMinus Station = "Minus 9"
	StationDeli Station = "The Corner Deli"
	StationPizza Station = "Supremo's"
)

type Mealtime string

const (
	MealtimeBreakfast Mealtime = "Breakfast"
	MealtimeLunch     Mealtime = "Lunch"
	MealtimeDinner    Mealtime = "Dinner"
	MealtimeLateNight Mealtime = "Late Night"
)

// Food represents a single food item with a unique ID
type Food struct {
	ID           string        `json:"id"`
	Name         string        `json:"name"`
	Ingredients  string        `json:"ingredients"`
	Restrictions []Restriction `json:"restrictions"`
	CreatedAt    time.Time     `json:"created_at"`
	UpdatedAt    time.Time     `json:"updated_at"`
}

// NewFood creates a new Food with a generated UUID
func NewFood(name, ingredients string, restrictions []Restriction) Food {
	now := time.Now()
	return Food{
		ID:           uuid.New().String(),
		Name:         name,
		Ingredients:  ingredients,
		Restrictions: restrictions,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
}

// DayMenu represents the menu for a single day
type DayMenu struct {
	DayNumber int                           `json:"day_number"` // 1-7
	Meals     map[Mealtime]map[Station][]string `json:"meals"`      // Mealtime -> Station -> []FoodID
}

// Cycle represents a 7-day menu cycle template
type Cycle struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IsActive    bool      `json:"is_active"`
    Order       int       `json:"order"`       
	Days        []DayMenu `json:"days"` // Array of 7 days
    ActivatedAt string    `json:"activated_at"` // NEW - timestamp when it became active
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// NewCycle creates a new Cycle with a generated UUID and empty 7 days
func NewCycle(name, description string, order int) Cycle {
	now := time.Now()
	
	// Initialize 7 empty days
	days := make([]DayMenu, 7)
	for i := 0; i < 7; i++ {
		days[i] = DayMenu{
			DayNumber: i + 1,
			Meals:     make(map[Mealtime]map[Station][]string),
		}
	}
	
	return Cycle{
		ID:          uuid.New().String(),
		Name:        name,
		Description: description,
        Order:       order,  // ← ADD THIS
        IsActive:    false,  // ← CHANGE: New cycles start inactive
		Days:        days,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// DailyData represents the menu for a specific day (legacy format)
type DailyData struct {
	Today time.Time                      `json:"today"`
	Data  map[Mealtime]map[Station][]Food `json:"data"`
}

// CreateFoodRequest is the request body for creating a food
type CreateFoodRequest struct {
	Name         string        `json:"name"`
	Ingredients  string        `json:"ingredients"`
	Restrictions []Restriction `json:"restrictions"`
}

// UpdateFoodRequest is the request body for updating a food
type UpdateFoodRequest struct {
	Name         *string        `json:"name,omitempty"`
	Ingredients  *string        `json:"ingredients,omitempty"`
	Restrictions *[]Restriction `json:"restrictions,omitempty"`
}

// CreateCycleRequest is the request body for creating a cycle
type CreateCycleRequest struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	IsActive    *bool     `json:"is_active,omitempty"` // Optional, defaults to true if not provided
	Days        []DayMenu `json:"days,omitempty"`      // Optional, will create empty if not provided
    Order       int       `json:"order"`                  
}

// UpdateCycleRequest is the request body for updating a cycle
type UpdateCycleRequest struct {
	Name        *string    `json:"name,omitempty"`
	Description *string    `json:"description,omitempty"`
	IsActive    *bool      `json:"is_active,omitempty"`
	Days        *[]DayMenu `json:"days,omitempty"`
    Order       *int       `json:"order,omitempty"`  // ← ADD THIS LINE
    ActivatedAt *string    `json:"activated_at,omitempty"`  // ← ADD THIS TOO

}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// SuccessResponse represents a success message
type SuccessResponse struct {
	Message string `json:"message"`
}
