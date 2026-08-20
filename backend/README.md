# Dining Hall API Backend 🍽️

A simple Go backend for managing dining hall menus with foods and 7-day menu cycles.

## Quick Start

1. **Install Go** (version 1.24.5 or higher)
2. **Download dependencies:**
   ```bash
   go mod download
   ```
3. **Run the server:**
   ```bash
   go run .
   ```
4. Server starts on `http://localhost:8080`

## What This Does

This API lets you:
- **Manage Foods**: Create, read, update, and delete food items with ingredients and dietary restrictions
- **Manage Cycles**: Create 7-day menu templates that assign foods to specific days, meals, and stations
- **Persist Data**: All data automatically saves to `foods.json` and `cycles.json` files

## File Structure

```
dhall-backend/
├── main.go                # Server entry point
├── routes.go              # Route definitions
├── go.mod                 # Go dependencies
├── foods.json             # Food data (created automatically)
├── cycles.json            # Cycle data (created automatically)
├── data/
│   ├── structs.go        # Data models
│   ├── store.go          # File storage
│   └── testing.go        # Fake data (for /daily endpoint)
├── handlers/
│   ├── foods.go          # Food CRUD
│   ├── cycles.go         # Cycle CRUD
│   ├── helpers.go        # Response helpers
│   └── legacy.go         # Legacy /daily endpoint
└── middleware/
    └── cors.go           # CORS setup
```

## API Endpoints

### Foods
- `POST /foods` - Create a food
- `GET /foods` - Get all foods
- `GET /foods?id={id}` - Get specific food
- `PUT /foods?id={id}` - Update food
- `DELETE /foods?id={id}` - Delete food

### Cycles
- `POST /cycles` - Create a 7-day cycle
- `GET /cycles` - Get all cycles
- `GET /cycles?id={id}` - Get specific cycle
- `GET /cycles?id={id}&include_foods=true` - Get cycle with full food details
- `PUT /cycles?id={id}` - Update cycle
- `DELETE /cycles?id={id}` - Delete cycle

### Legacy
- `GET /daily` - Get fake daily menu (for testing)

## Data Models

### Food
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Veggie Burger",
  "ingredients": "Black beans, quinoa, vegetables, bun",
  "restrictions": ["Vegetarian", "Gluten"],
  "created_at": "2025-01-05T10:30:00Z",
  "updated_at": "2025-01-05T10:30:00Z"
}
```

### Cycle (7-Day Menu Template)
A cycle is a 7-day menu template that your frontend can assign to any week.

```json
{
  "id": "cycle-uuid-here",
  "name": "Week 1",
  "description": "Standard weekly menu",
  "days": [
    {
      "day_number": 1,
      "meals": {
        "Breakfast": {
          "Emily's": ["food-id-1", "food-id-2"],
          "Diner": ["food-id-3"],
          "Global": ["food-id-4"]
        },
        "Lunch": {
          "Emily's": ["food-id-5"],
          "Diner": ["food-id-6", "food-id-7"],
          "Global": ["food-id-8"]
        },
        "Dinner": {
          "Emily's": ["food-id-9"],
          "Diner": ["food-id-10"],
          "Global": ["food-id-11", "food-id-12"]
        }
      }
    },
    {
      "day_number": 2,
      "meals": { /* ... */ }
    }
    /* ... days 3-7 ... */
  ],
  "created_at": "2025-01-05T10:30:00Z",
  "updated_at": "2025-01-05T10:30:00Z"
}
```

**Key Points:**
- Each cycle has exactly **7 days** (day_number 1-7)
- Each day has **3 meals**: Breakfast, Lunch, Dinner
- Each meal has **3 stations**: Emily's, Diner, Global
- Foods are referenced by their IDs (not embedded)
- Your frontend decides which dates to assign each cycle to

## Usage Examples

### 1. Create a Food

```bash
curl -X POST http://localhost:8080/foods \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Veggie Burger",
    "ingredients": "Black beans, quinoa, vegetables, bun",
    "restrictions": ["Vegetarian", "Gluten"]
  }'
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Veggie Burger",
  ...
}
```

**Save this ID!** You'll use it when creating cycles.

### 2. Create a Cycle

**Option A: Create empty cycle (fill in later)**
```bash
curl -X POST http://localhost:8080/cycles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Week 1",
    "description": "Standard weekly menu"
  }'
```

Returns a cycle with 7 empty days that you can populate later.

**Option B: Create cycle with foods**
```bash
curl -X POST http://localhost:8080/cycles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Week 1",
    "description": "Standard weekly menu",
    "days": [
      {
        "day_number": 1,
        "meals": {
          "Breakfast": {
            "Emily'"'"'s": ["550e8400-e29b-41d4-a716-446655440000"],
            "Diner": [],
            "Global": []
          },
          "Lunch": {
            "Emily'"'"'s": [],
            "Diner": ["550e8400-e29b-41d4-a716-446655440000"],
            "Global": []
          },
          "Dinner": {
            "Emily'"'"'s": [],
            "Diner": [],
            "Global": []
          }
        }
      }
      // ... repeat for days 2-7
    ]
  }'
```

### 3. Update a Cycle

To add/remove foods from a cycle, you update the entire `days` array:

```bash
curl -X PUT "http://localhost:8080/cycles?id=CYCLE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "days": [
      {
        "day_number": 1,
        "meals": {
          "Breakfast": {
            "Emily'"'"'s": ["food-id-1", "food-id-2"],
            "Diner": ["food-id-3"],
            "Global": []
          },
          "Lunch": { /* ... */ },
          "Dinner": { /* ... */ }
        }
      }
      // ... days 2-7
    ]
  }'
```

**Important:** When updating days, send the complete days array (all 7 days).

### 4. Get Cycle with Food Details

```bash
curl "http://localhost:8080/cycles?id=CYCLE_ID&include_foods=true"
```

Response includes full food objects instead of just IDs:
```json
{
  "cycle": { /* cycle info */ },
  "days_with_foods": [
    {
      "Breakfast": {
        "Emily's": [
          {
            "id": "550e8400-...",
            "name": "Veggie Burger",
            "ingredients": "...",
            "restrictions": [...]
          }
        ],
        "Diner": [ /* foods */ ],
        "Global": [ /* foods */ ]
      },
      "Lunch": { /* ... */ },
      "Dinner": { /* ... */ }
    }
    // ... for all 7 days
  ]
}
```

## Valid Values

### Restrictions
```
Fish, Soy, Gluten, Sesame, Pork, Shellfish, 
Eggs, Dairy, Halal, Spicy, Vegetarian, Vegan
```

### Mealtimes
```
Breakfast, Lunch, Dinner
```

### Stations
```
Emily's, Diner, Global
```

## Data Persistence

All data automatically saves to JSON files:
- **`foods.json`** - All food items
- **`cycles.json`** - All menu cycles

### Backup Your Data
```bash
# Simple backup
cp foods.json foods_backup.json
cp cycles.json cycles_backup.json

# Or both at once
tar -czf backup_$(date +%Y%m%d).tar.gz foods.json cycles.json
```

### Reset Everything
```bash
# Stop the server
# Delete the files
rm foods.json cycles.json
# Restart the server
```

## Frontend Integration

Your frontend should:

1. **Fetch all foods** to build a food library
2. **Create or fetch cycles** (7-day templates)
3. **Display cycle selector** - let user pick which cycle to view
4. **Assign dates** - your frontend decides "Show Week 1 for Sept 1-7"
5. **Edit cycles** - build UI to assign foods to days/meals/stations

The backend only stores the 7-day templates. Your frontend handles:
- Which dates each cycle applies to
- Current day highlighting
- Date navigation
- Calendar views

## How Cycles Work

Think of cycles like this:

```
Backend (This API):
├── Food Library (all available foods)
└── Cycle Templates (7-day menus)
    ├── "Week 1" (7 days of meals)
    ├── "Week 2" (7 days of meals)
    └── "Vegetarian Week" (7 days of meals)

Frontend (Your App):
├── Shows cycles with actual dates
│   ├── "Week 1" → Sept 1-7
│   ├── "Week 2" → Sept 8-14
│   └── "Week 1" → Sept 15-21 (reusing!)
└── Displays "Today's Menu" based on current date
```

## Common Patterns

### Building a Menu Editor

1. **Load all foods** (`GET /foods`)
2. **Load or create a cycle** (`POST /cycles` or `GET /cycles?id=...`)
3. **Display 7 days × 3 meals × 3 stations grid**
4. **Let user assign foods to each slot**
5. **Save with** `PUT /cycles?id=...`

### Displaying Today's Menu

1. **Frontend calculates** which cycle and day number to show
2. **Fetch cycle with foods** (`GET /cycles?id=...&include_foods=true`)
3. **Extract the day** from `days_with_foods[dayNumber - 1]`
4. **Display** the meals for that day

## Testing

Test all endpoints:
```bash
# Install and run server first
go run .

# In another terminal, test endpoints:

# Create a food
curl -X POST http://localhost:8080/foods \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Food", "ingredients": "test", "restrictions": []}'

# Get all foods
curl http://localhost:8080/foods

# Create a cycle
curl -X POST http://localhost:8080/cycles \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Week", "description": "Testing"}'

# Get all cycles
curl http://localhost:8080/cycles
```

## Error Responses

All errors return JSON:
```json
{
  "error": "descriptive error message"
}
```

Common status codes:
- `400` - Bad request (invalid data)
- `404` - Not found (invalid ID)
- `405` - Method not allowed (wrong HTTP method)
- `500` - Internal server error

## Future Enhancements

- Add image URLs for foods
- Database integration (PostgreSQL/MySQL)
- Authentication
- Search and filtering
- Nutritional information
- Bulk operations

## Questions?

The key concept: **Cycles are 7-day templates without specific dates**. Your frontend assigns cycles to actual calendar weeks.

Example:
- Backend: "Week 1 has veggie burgers on Day 3 lunch"
- Frontend: "Show Week 1 for Sept 1-7, so Day 3 = Sept 3"
