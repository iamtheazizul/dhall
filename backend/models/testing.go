package models

import "time"

// FakeDailyData returns a realistic DailyData struct
// representing a full day's menu with foods for each
// station and mealtime.
func FakeDailyData() DailyData {
	data := map[Mealtime]map[Station][]Food{
		MealtimeBreakfast: {
			StationEmily: {
				{
					Name:        "Veggie Omelet",
					Ingredients: "Eggs, Peppers, Onions, Cheese",
					Restrictions: []Restriction{
						RestrictionEggs, RestrictionDairy, RestrictionVegetarian,
					},
				},
				{
					Name:        "French Toast",
					Ingredients: "Bread, Eggs, Cinnamon, Maple Syrup",
					Restrictions: []Restriction{
						RestrictionEggs, RestrictionGluten, RestrictionVegetarian,
					},
				},
				{
					Name:        "Fruit Parfait",
					Ingredients: "Yogurt, Granola, Berries",
					Restrictions: []Restriction{
						RestrictionDairy, RestrictionGluten, RestrictionVegetarian,
					},
				},
			},
			StationDiner: {
				{
					Name:        "Pancake Stack",
					Ingredients: "Flour, Eggs, Milk, Butter",
					Restrictions: []Restriction{
						RestrictionGluten, RestrictionDairy, RestrictionEggs, RestrictionVegetarian,
					},
				},
				{
					Name:        "Breakfast Burrito",
					Ingredients: "Eggs, Sausage, Tortilla, Cheese",
					Restrictions: []Restriction{
						RestrictionEggs, RestrictionDairy, RestrictionGluten, RestrictionPork,
					},
				},
				{
					Name:        "Hash Browns",
					Ingredients: "Potatoes, Oil, Salt",
					Restrictions: []Restriction{
						RestrictionVegan, RestrictionVegetarian,
					},
				},
			},
			StationGlobal: {
				{
					Name:        "Shakshuka",
					Ingredients: "Eggs, Tomato Sauce, Spices",
					Restrictions: []Restriction{
						RestrictionEggs, RestrictionVegetarian,
					},
				},
				{
					Name:        "Congee",
					Ingredients: "Rice, Broth, Scallions",
					Restrictions: []Restriction{
						RestrictionHalal, RestrictionGluten,
					},
				},
				{
					Name:        "Miso Soup",
					Ingredients: "Tofu, Miso Paste, Seaweed",
					Restrictions: []Restriction{
						RestrictionSoy, RestrictionVegan, RestrictionVegetarian,
					},
				},
			},
		},

		MealtimeLunch: {
			StationEmily: {
				{
					Name:        "Caprese Sandwich",
					Ingredients: "Mozzarella, Tomato, Basil, Ciabatta",
					Restrictions: []Restriction{
						RestrictionDairy, RestrictionGluten, RestrictionVegetarian,
					},
				},
				{
					Name:        "Caesar Salad",
					Ingredients: "Romaine, Parmesan, Croutons, Dressing",
					Restrictions: []Restriction{
						RestrictionDairy, RestrictionGluten, RestrictionVegetarian,
					},
				},
				{
					Name:        "Tomato Basil Soup",
					Ingredients: "Tomato, Cream, Basil",
					Restrictions: []Restriction{
						RestrictionDairy, RestrictionVegetarian,
					},
				},
			},
			StationDiner: {
				{
					Name:        "Cheeseburger",
					Ingredients: "Beef, Cheese, Bun, Lettuce, Tomato",
					Restrictions: []Restriction{
						RestrictionDairy, RestrictionGluten,
					},
				},
				{
					Name:        "Grilled Chicken Wrap",
					Ingredients: "Chicken, Lettuce, Tortilla, Ranch",
					Restrictions: []Restriction{
						RestrictionDairy, RestrictionGluten, RestrictionHalal,
					},
				},
				{
					Name:        "Fries",
					Ingredients: "Potatoes, Oil, Salt",
					Restrictions: []Restriction{
						RestrictionVegan, RestrictionVegetarian,
					},
				},
			},
			StationGlobal: {
				{
					Name:        "Chicken Tikka Masala",
					Ingredients: "Chicken, Tomato Sauce, Spices",
					Restrictions: []Restriction{
						RestrictionSpicy, RestrictionHalal,
					},
				},
				{
					Name:        "Falafel Plate",
					Ingredients: "Falafel, Hummus, Pita",
					Restrictions: []Restriction{
						RestrictionGluten, RestrictionVegan, RestrictionVegetarian, RestrictionSesame,
					},
				},
				{
					Name:        "Vegetable Fried Rice",
					Ingredients: "Rice, Vegetables, Soy Sauce",
					Restrictions: []Restriction{
						RestrictionSoy, RestrictionVegan, RestrictionVegetarian, RestrictionGluten,
					},
				},
			},
		},

		MealtimeDinner: {
			StationEmily: {
				{
					Name:        "Grilled Salmon",
					Ingredients: "Salmon, Lemon, Herbs",
					Restrictions: []Restriction{
						RestrictionFish, RestrictionHalal,
					},
				},
				{
					Name:        "Mushroom Risotto",
					Ingredients: "Arborio Rice, Mushrooms, Parmesan",
					Restrictions: []Restriction{
						RestrictionDairy, RestrictionVegetarian,
					},
				},
				{
					Name:        "Caesar Salad",
					Ingredients: "Romaine, Dressing, Croutons",
					Restrictions: []Restriction{
						RestrictionGluten, RestrictionDairy, RestrictionVegetarian,
					},
				},
			},
			StationDiner: {
				{
					Name:        "BBQ Ribs",
					Ingredients: "Pork Ribs, BBQ Sauce",
					Restrictions: []Restriction{
						RestrictionPork, RestrictionSpicy,
					},
				},
				{
					Name:        "Mac and Cheese",
					Ingredients: "Pasta, Cheddar, Milk",
					Restrictions: []Restriction{
						RestrictionDairy, RestrictionGluten, RestrictionVegetarian,
					},
				},
				{
					Name:        "Roasted Vegetables",
					Ingredients: "Carrots, Zucchini, Olive Oil",
					Restrictions: []Restriction{
						RestrictionVegan, RestrictionVegetarian,
					},
				},
			},
			StationGlobal: {
				{
					Name:        "Pad Thai",
					Ingredients: "Noodles, Shrimp, Peanuts, Tamarind Sauce",
					Restrictions: []Restriction{
						RestrictionShellfish, RestrictionGluten, RestrictionSpicy,
					},
				},
				{
					Name:        "Beef Stir-Fry",
					Ingredients: "Beef, Broccoli, Soy Sauce",
					Restrictions: []Restriction{
						RestrictionSoy, RestrictionGluten, RestrictionHalal,
					},
				},
				{
					Name:        "Lentil Curry",
					Ingredients: "Lentils, Coconut Milk, Spices",
					Restrictions: []Restriction{
						RestrictionVegan, RestrictionVegetarian, RestrictionSpicy,
					},
				},
			},
		},
	}

	return DailyData{
		Today: time.Now(),
		Data:  data,
	}
}
