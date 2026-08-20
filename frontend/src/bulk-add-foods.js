import axios from 'axios';
import { API_BASE_URL } from './config/api.js';

const foods = [
  { name: 'Peruvian Fries with Spicy Chorizo Tofu & Pigeon Peas', restrictions: ['Spicy', 'Vegan', 'Soy'] },
  { name: 'Egg Sandwiches on a Bagel', restrictions: ['Eggs', 'Gluten', 'Dairy'] },
  { name: 'Egg Sandwiches on a Biscuit', restrictions: ['Eggs', 'Gluten', 'Dairy'] },
  { name: 'Texas French Toast', restrictions: ['Eggs', 'Gluten', 'Dairy'] },
  { name: 'Vegan & GF Pancakes', restrictions: ['Vegan'] },
  { name: 'Veggie Sausage', restrictions: ['Vegetarian', 'Soy'] },
  { name: 'Bacon', restrictions: ['Pork'] },
  { name: 'Chicken Sausage', restrictions: [] },
  { name: 'Bang Bang Chicken Sandwich', restrictions: ['Gluten', 'Spicy'] },
  { name: 'Tijuana Meatballs With Arroz Verde and Sweet Pepper Relish', restrictions: ['Spicy'] },
  { name: 'Griddled All Beef Hot Dogs with Chopped Onions and Relish', restrictions: ['Gluten'] },
  { name: 'Chicken Wing Bar', restrictions: [] },
  { name: 'Corn and Black Bean Quesadilla', restrictions: ['Gluten', 'Dairy', 'Vegetarian'] },
  { name: 'Beyond Mapo Ragu', restrictions: ['Vegan', 'Soy', 'Spicy'] },
  { name: 'Herb Marinated Grilled Chicken Breast with Chardonnay Jus', restrictions: [] },
  { name: 'Basil Pesto & Tomato Grilled Cheese', restrictions: ['Gluten', 'Dairy', 'Vegetarian'] },
  { name: 'Shrimp and Kimchee', restrictions: ['Shellfish', 'Spicy'] },
  { name: 'Vindaloo Tofu with Mango Lime Rice', restrictions: ['Vegan', 'Soy', 'Spicy'] },
  { name: 'Roasted Pork Verde', restrictions: ['Pork', 'Spicy'] },
  { name: 'Pollo Adobo', restrictions: ['Spicy'] },
  { name: 'Smoked Garlic Oregano Tofu', restrictions: ['Vegan', 'Soy'] },
  { name: 'Roasted Chicken with Mole Poblano', restrictions: ['Spicy'] },
  { name: 'Char Sui Chicken', restrictions: ['Soy'] },
  { name: 'Beyond Steak House Burger', restrictions: ['Vegan', 'Soy', 'Gluten'] },
  { name: 'Rosemary Garlic Pork Loin', restrictions: ['Pork'] },
  { name: 'Arctic Salmon Burgers with Lemon Aioli', restrictions: ['Fish', 'Eggs', 'Gluten'] },
  { name: 'Beef and Lamb Gyros', restrictions: ['Gluten', 'Dairy'] },
  { name: 'Carrot Choripan', restrictions: ['Vegan', 'Spicy'] },
  { name: 'Hudson Valley Steelhead Trout', restrictions: ['Fish'] },
  { name: 'Happy Valley Farms Local Beef Burgers', restrictions: ['Gluten'] },
  { name: 'Build Your Own Salmon or Tofu Poke Bowl', restrictions: ['Fish', 'Soy', 'Sesame'] },
  { name: 'Chicken-Less Tenders', restrictions: ['Vegan', 'Soy', 'Gluten'] },
  { name: 'Classic Chicken & Caesar Salads', restrictions: ['Eggs', 'Dairy'] },
  { name: 'Chicken Tender Friday', restrictions: ['Gluten'] },
  { name: 'Vegetable Fried Rice', restrictions: ['Vegetarian', 'Soy'] },
  { name: 'Chicken Fried Rice', restrictions: ['Soy', 'Eggs'] },
  { name: 'Steamed Rice', restrictions: ['Vegan'] },
  { name: 'Yellow Rice & Beans', restrictions: ['Vegan'] },
  { name: 'Arroz Verde', restrictions: ['Vegan'] },
  { name: 'Steamed Baby Yukons', restrictions: ['Vegan'] },
  { name: 'Roasted Vegetables', restrictions: ['Vegan'] },
  { name: 'Garlic Steamed Fingerlings', restrictions: ['Vegan'] },
  { name: 'Coconut Jasmine Rice', restrictions: ['Vegan'] },
  { name: 'Green Beans', restrictions: ['Vegan'] },
  { name: 'Herb Roasted Garnet Yams', restrictions: ['Vegan'] },
  { name: 'Baked Steak Fries', restrictions: ['Vegan'] },
  { name: 'BBQ Spiced Kettle Chips', restrictions: ['Vegan'] },
  { name: 'Spicy Black Beans', restrictions: ['Vegan', 'Spicy'] },
  { name: 'Plantain Chips', restrictions: ['Vegan'] },
  { name: 'Crispy Fries', restrictions: ['Vegan'] },
  { name: 'Jasmine Rice', restrictions: ['Vegan'] },
  { name: 'Olive Oil Tossed Pasta', restrictions: ['Vegan', 'Gluten'] },
  { name: 'Creamy Alfredo', restrictions: ['Vegetarian', 'Dairy', 'Gluten'] },
  { name: 'Marinara Sauce', restrictions: ['Vegan'] },
  { name: 'GF/Vegan Pasta with Sunday Sauce', restrictions: ['Vegan'] },
  { name: 'Soup Du Jour', restrictions: [] },
  { name: 'Pico De Gallo', restrictions: ['Vegan'] },
  { name: 'Guacamole', restrictions: ['Vegan'] },
  { name: 'Vegan Sour Cream', restrictions: ['Vegan', 'Soy'] },
  { name: 'Skidmore Mac N Cheese', restrictions: ['Vegetarian', 'Gluten', 'Dairy'] },
  { name: 'Vegan Mac N Chz', restrictions: ['Vegan', 'Gluten', 'Soy'] },
  { name: 'Garlic Bread', restrictions: ['Vegetarian', 'Gluten', 'Dairy'] },
  { name: 'Daily Vegan Smoothie', restrictions: ['Vegan'] }
];

async function addFoods() {
  console.log(`Starting to add ${foods.length} foods...`);
  
  for (let i = 0; i < foods.length; i++) {
    const food = foods[i];
    try {
      const payload = {
        Name: food.name,
        Ingredients: `Basic ingredients for ${food.name}`,
        Restrictions: food.restrictions
      };
      
      const response = await axios.post(`${API_BASE_URL}/foods`, payload);
      console.log(`✅ [${i + 1}/${foods.length}] Added: ${food.name}`);
    } catch (error) {
      console.error(`❌ [${i + 1}/${foods.length}] Failed: ${food.name}`, error.message);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n✨ Done!');
}

addFoods();