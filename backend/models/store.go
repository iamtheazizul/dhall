package models

import (
	"encoding/json"
	"errors"
	"os"
	"sync"
	"time"
)

var (
	ErrFoodNotFound  = errors.New("food not found")
	ErrCycleNotFound = errors.New("cycle not found")
)

const (
	FoodsFile  = "data/foods.json"
	CyclesFile = "data/cycles.json"
)

// Store provides file-based storage for foods and cycles
type Store struct {
	mu     sync.RWMutex
	foods  map[string]Food
	cycles map[string]Cycle
}

// NewStore creates a new store and loads data from files
func NewStore() *Store {
	s := &Store{
		foods:  make(map[string]Food),
		cycles: make(map[string]Cycle),
	}
	
	// Load existing data from files
	s.loadFromFiles()
	
	return s
}

// loadFromFiles loads data from JSON files
func (s *Store) loadFromFiles() {
	// Load foods
	if data, err := os.ReadFile(FoodsFile); err == nil {
		var foods []Food
		if err := json.Unmarshal(data, &foods); err == nil {
			for _, food := range foods {
				s.foods[food.ID] = food
			}
		}
	}
	
	// Load cycles
	if data, err := os.ReadFile(CyclesFile); err == nil {
		var cycles []Cycle
		if err := json.Unmarshal(data, &cycles); err == nil {
			for _, cycle := range cycles {
				s.cycles[cycle.ID] = cycle
			}
		}
	}
}

// saveFoodsToFile saves all foods to the JSON file
func (s *Store) saveFoodsToFile() error {
	foods := make([]Food, 0, len(s.foods))
	for _, food := range s.foods {
		foods = append(foods, food)
	}
	
	data, err := json.MarshalIndent(foods, "", "  ")
	if err != nil {
		return err
	}
	
	return os.WriteFile(FoodsFile, data, 0644)
}

// saveCyclesToFile saves all cycles to the JSON file
func (s *Store) saveCyclesToFile() error {
	cycles := make([]Cycle, 0, len(s.cycles))
	for _, cycle := range s.cycles {
		cycles = append(cycles, cycle)
	}
	
	data, err := json.MarshalIndent(cycles, "", "  ")
	if err != nil {
		return err
	}
	
	return os.WriteFile(CyclesFile, data, 0644)
}

// Food operations

func (s *Store) CreateFood(req CreateFoodRequest) Food {
	s.mu.Lock()
	defer s.mu.Unlock()

	food := NewFood(req.Name, req.Ingredients, req.Restrictions)
	s.foods[food.ID] = food
	
	// Save to file
	s.saveFoodsToFile()
	
	return food
}

func (s *Store) GetFood(id string) (Food, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	food, exists := s.foods[id]
	if !exists {
		return Food{}, ErrFoodNotFound
	}
	return food, nil
}

func (s *Store) GetAllFoods() []Food {
	s.mu.RLock()
	defer s.mu.RUnlock()

	foods := make([]Food, 0, len(s.foods))
	for _, food := range s.foods {
		foods = append(foods, food)
	}
	return foods
}

func (s *Store) UpdateFood(id string, req UpdateFoodRequest) (Food, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	food, exists := s.foods[id]
	if !exists {
		return Food{}, ErrFoodNotFound
	}

	if req.Name != nil {
		food.Name = *req.Name
	}
	if req.Ingredients != nil {
		food.Ingredients = *req.Ingredients
	}
	if req.Restrictions != nil {
		food.Restrictions = *req.Restrictions
	}
	food.UpdatedAt = time.Now()

	s.foods[id] = food
	
	// Save to file
	s.saveFoodsToFile()
	
	return food, nil
}

func (s *Store) DeleteFood(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.foods[id]; !exists {
		return ErrFoodNotFound
	}

	delete(s.foods, id)
	
	// Save to file
	s.saveFoodsToFile()
	
	return nil
}

// Cycle operations

func (s *Store) CreateCycle(req CreateCycleRequest) Cycle {
	s.mu.Lock()
	defer s.mu.Unlock()

	cycle := NewCycle(req.Name, req.Description, req.Order)

	// If IsActive is provided, use it; otherwise use the default (true) from NewCycle
	if req.IsActive != nil {
		cycle.IsActive = *req.IsActive
	}

	// If days are provided, use them; otherwise use the empty 7 days from NewCycle
	if req.Days != nil && len(req.Days) > 0 {
		cycle.Days = req.Days
	}

	s.cycles[cycle.ID] = cycle

	// Save to file
	s.saveCyclesToFile()

	return cycle
}

func (s *Store) GetCycle(id string) (Cycle, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	cycle, exists := s.cycles[id]
	if !exists {
		return Cycle{}, ErrCycleNotFound
	}
	return cycle, nil
}

func (s *Store) GetAllCycles() []Cycle {
	s.mu.RLock()
	defer s.mu.RUnlock()

	cycles := make([]Cycle, 0, len(s.cycles))
	for _, cycle := range s.cycles {
		cycles = append(cycles, cycle)
	}
	return cycles
}

func (s *Store) UpdateCycle(id string, req UpdateCycleRequest) (Cycle, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	cycle, exists := s.cycles[id]
	if !exists {
		return Cycle{}, ErrCycleNotFound
	}

	if req.Name != nil {
		cycle.Name = *req.Name
	}
	if req.Description != nil {
		cycle.Description = *req.Description
	}
	if req.IsActive != nil {
		cycle.IsActive = *req.IsActive
	}
	if req.Days != nil {
		cycle.Days = *req.Days
	}
    if req.Order != nil {  // ← ADD THIS
        cycle.Order = *req.Order
    }
    if req.ActivatedAt != nil {  // ← ADD THIS
        cycle.ActivatedAt = *req.ActivatedAt
    }
	cycle.UpdatedAt = time.Now()

	s.cycles[id] = cycle
	
	// Save to file
	s.saveCyclesToFile()
	
	return cycle, nil
}

func (s *Store) DeleteCycle(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.cycles[id]; !exists {
		return ErrCycleNotFound
	}

	delete(s.cycles, id)
	
	// Save to file
	s.saveCyclesToFile()
	
	return nil
}

// GetCycleWithFoods returns a cycle with full food details populated for each day
func (s *Store) GetCycleWithFoods(id string) (Cycle, []map[Mealtime]map[Station][]Food, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	cycle, exists := s.cycles[id]
	if !exists {
		return Cycle{}, nil, ErrCycleNotFound
	}

	// Build food details for each day
	daysWithFoods := make([]map[Mealtime]map[Station][]Food, len(cycle.Days))
	
	for dayIdx, day := range cycle.Days {
		dayData := make(map[Mealtime]map[Station][]Food)
		
		for mealtime, stations := range day.Meals {
			if dayData[mealtime] == nil {
				dayData[mealtime] = make(map[Station][]Food)
			}
			
			for station, foodIDs := range stations {
				foods := make([]Food, 0, len(foodIDs))
				for _, foodID := range foodIDs {
					if food, exists := s.foods[foodID]; exists {
						foods = append(foods, food)
					}
				}
				dayData[mealtime][station] = foods
			}
		}
		
		daysWithFoods[dayIdx] = dayData
	}

	return cycle, daysWithFoods, nil
}

// Global store instance
var GlobalStore = NewStore()
