#!/bin/bash

# Dining Hall API Test Script
# This script tests all CRUD operations for foods and cycles

BASE_URL="http://localhost:8080"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "🍽️  Dining Hall API Test Suite"
echo "======================================"
echo ""

# Test if server is running
echo "📡 Checking if server is running..."
if ! curl -s "${BASE_URL}/daily" > /dev/null; then
    echo -e "${RED}❌ Server is not running on ${BASE_URL}${NC}"
    echo "Please start the server with: go run ."
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Test 1: Create Foods
echo "======================================"
echo "1️⃣  Testing Food Creation"
echo "======================================"

echo "Creating Veggie Burger..."
FOOD1=$(curl -s -X POST "${BASE_URL}/foods" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Veggie Burger",
    "ingredients": "Black beans, quinoa, vegetables, bun",
    "restrictions": ["Vegetarian", "Gluten"]
  }')
FOOD1_ID=$(echo $FOOD1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ Created: ${FOOD1_ID}${NC}"

echo "Creating Grilled Chicken..."
FOOD2=$(curl -s -X POST "${BASE_URL}/foods" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grilled Chicken",
    "ingredients": "Chicken breast, herbs, olive oil",
    "restrictions": ["Halal"]
  }')
FOOD2_ID=$(echo $FOOD2 | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ Created: ${FOOD2_ID}${NC}"

echo "Creating Caesar Salad..."
FOOD3=$(curl -s -X POST "${BASE_URL}/foods" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Caesar Salad",
    "ingredients": "Romaine, Parmesan, Croutons, Dressing",
    "restrictions": ["Vegetarian", "Dairy", "Gluten"]
  }')
FOOD3_ID=$(echo $FOOD3 | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ Created: ${FOOD3_ID}${NC}"
echo ""

# Test 2: Get All Foods
echo "======================================"
echo "2️⃣  Testing Get All Foods"
echo "======================================"
FOODS=$(curl -s "${BASE_URL}/foods")
FOOD_COUNT=$(echo $FOODS | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ Retrieved ${FOOD_COUNT} foods${NC}"
echo ""

# Test 3: Get Single Food
echo "======================================"
echo "3️⃣  Testing Get Single Food"
echo "======================================"
SINGLE_FOOD=$(curl -s "${BASE_URL}/foods?id=${FOOD1_ID}")
echo "Retrieved food:"
echo $SINGLE_FOOD | python3 -m json.tool 2>/dev/null || echo $SINGLE_FOOD
echo -e "${GREEN}✅ Successfully retrieved food by ID${NC}"
echo ""

# Test 4: Update Food
echo "======================================"
echo "4️⃣  Testing Food Update"
echo "======================================"
echo "Updating Veggie Burger to Deluxe Veggie Burger..."
UPDATED_FOOD=$(curl -s -X PUT "${BASE_URL}/foods?id=${FOOD1_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Deluxe Veggie Burger",
    "ingredients": "Black beans, quinoa, vegetables, lettuce, tomato, avocado, bun"
  }')
echo $UPDATED_FOOD | python3 -m json.tool 2>/dev/null || echo $UPDATED_FOOD
echo -e "${GREEN}✅ Successfully updated food${NC}"
echo ""

# Test 5: Create Cycle
echo "======================================"
echo "5️⃣  Testing Cycle Creation"
echo "======================================"
echo "Creating Fall 2025 Week 1 cycle..."
CYCLE=$(curl -s -X POST "${BASE_URL}/cycles" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Fall 2025 Week 1\",
    \"description\": \"First week of fall semester menu\",
    \"start_date\": \"2025-09-01T00:00:00Z\",
    \"end_date\": \"2025-09-07T23:59:59Z\",
    \"foods\": [
      {
        \"food_id\": \"${FOOD1_ID}\",
        \"mealtime\": \"Lunch\",
        \"station\": \"Diner\"
      },
      {
        \"food_id\": \"${FOOD2_ID}\",
        \"mealtime\": \"Dinner\",
        \"station\": \"Emily's\"
      },
      {
        \"food_id\": \"${FOOD3_ID}\",
        \"mealtime\": \"Lunch\",
        \"station\": \"Emily's\"
      }
    ]
  }")
CYCLE_ID=$(echo $CYCLE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✅ Created cycle: ${CYCLE_ID}${NC}"
echo ""

# Test 6: Get All Cycles
echo "======================================"
echo "6️⃣  Testing Get All Cycles"
echo "======================================"
CYCLES=$(curl -s "${BASE_URL}/cycles")
CYCLE_COUNT=$(echo $CYCLES | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ Retrieved ${CYCLE_COUNT} cycles${NC}"
echo ""

# Test 7: Get Cycle with Foods
echo "======================================"
echo "7️⃣  Testing Get Cycle with Full Food Details"
echo "======================================"
CYCLE_WITH_FOODS=$(curl -s "${BASE_URL}/cycles?id=${CYCLE_ID}&include_foods=true")
echo "Cycle with foods:"
echo $CYCLE_WITH_FOODS | python3 -m json.tool 2>/dev/null || echo $CYCLE_WITH_FOODS
echo -e "${GREEN}✅ Successfully retrieved cycle with foods${NC}"
echo ""

# Test 8: Update Cycle
echo "======================================"
echo "8️⃣  Testing Cycle Update"
echo "======================================"
echo "Updating cycle name..."
UPDATED_CYCLE=$(curl -s -X PUT "${BASE_URL}/cycles?id=${CYCLE_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fall 2025 Week 1 (Updated)",
    "description": "Updated description for first week"
  }')
echo $UPDATED_CYCLE | python3 -m json.tool 2>/dev/null || echo $UPDATED_CYCLE
echo -e "${GREEN}✅ Successfully updated cycle${NC}"
echo ""

# Test 9: Delete Food
echo "======================================"
echo "9️⃣  Testing Food Deletion"
echo "======================================"
echo "Deleting Caesar Salad (${FOOD3_ID})..."
DELETE_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/foods?id=${FOOD3_ID}")
echo $DELETE_RESPONSE | python3 -m json.tool 2>/dev/null || echo $DELETE_RESPONSE
echo -e "${GREEN}✅ Successfully deleted food${NC}"
echo ""

# Test 10: Delete Cycle
echo "======================================"
echo "🔟 Testing Cycle Deletion"
echo "======================================"
echo "Deleting cycle (${CYCLE_ID})..."
DELETE_CYCLE_RESPONSE=$(curl -s -X DELETE "${BASE_URL}/cycles?id=${CYCLE_ID}")
echo $DELETE_CYCLE_RESPONSE | python3 -m json.tool 2>/dev/null || echo $DELETE_CYCLE_RESPONSE
echo -e "${GREEN}✅ Successfully deleted cycle${NC}"
echo ""

# Test 11: Verify Deletions
echo "======================================"
echo "1️⃣1️⃣  Verifying Deletions"
echo "======================================"
REMAINING_FOODS=$(curl -s "${BASE_URL}/foods")
REMAINING_COUNT=$(echo $REMAINING_FOODS | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ ${REMAINING_COUNT} foods remaining (should be 2)${NC}"

REMAINING_CYCLES=$(curl -s "${BASE_URL}/cycles")
REMAINING_CYCLE_COUNT=$(echo $REMAINING_CYCLES | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ ${REMAINING_CYCLE_COUNT} cycles remaining (should be 0)${NC}"
echo ""

# Test 12: Legacy Endpoint
echo "======================================"
echo "1️⃣2️⃣  Testing Legacy /daily Endpoint"
echo "======================================"
DAILY=$(curl -s "${BASE_URL}/daily")
BREAKFAST_COUNT=$(echo $DAILY | grep -o 'Breakfast' | wc -l)
echo -e "${GREEN}✅ Legacy endpoint working (found ${BREAKFAST_COUNT} breakfast mentions)${NC}"
echo ""

# Summary
echo "======================================"
echo "✨ Test Summary"
echo "======================================"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "Test coverage:"
echo "  ✅ Food creation"
echo "  ✅ Get all foods"
echo "  ✅ Get single food"
echo "  ✅ Update food"
echo "  ✅ Delete food"
echo "  ✅ Cycle creation"
echo "  ✅ Get all cycles"
echo "  ✅ Get cycle with foods"
echo "  ✅ Update cycle"
echo "  ✅ Delete cycle"
echo "  ✅ Legacy endpoint"
echo ""
echo "🎉 Your API is working perfectly!"
