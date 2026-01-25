/**
 * Simple recipes and snacks for meal time suggestions
 */

export const RECIPES = [
  // Breakfast
  { time: 'breakfast', text: 'Greek yogurt with honey and berries' },
  { time: 'breakfast', text: 'Avocado toast with egg' },
  { time: 'breakfast', text: 'Oatmeal with banana and cinnamon' },
  { time: 'breakfast', text: 'Smoothie bowl with granola' },
  { time: 'breakfast', text: 'Scrambled eggs with toast' },
  { time: 'breakfast', text: 'Cottage cheese with fruit' },
  { time: 'breakfast', text: 'Peanut butter banana toast' },
  { time: 'breakfast', text: 'Chia pudding with berries' },

  // Lunch
  { time: 'lunch', text: 'Grilled chicken salad' },
  { time: 'lunch', text: 'Vegetable wrap with hummus' },
  { time: 'lunch', text: 'Quinoa bowl with roasted vegetables' },
  { time: 'lunch', text: 'Tuna sandwich on whole grain bread' },
  { time: 'lunch', text: 'Lentil soup with crusty bread' },
  { time: 'lunch', text: 'Caprese sandwich with basil' },
  { time: 'lunch', text: 'Buddha bowl with tahini dressing' },
  { time: 'lunch', text: 'Rice bowl with teriyaki chicken' },

  // Dinner
  { time: 'dinner', text: 'Baked salmon with asparagus' },
  { time: 'dinner', text: 'Pasta with marinara and vegetables' },
  { time: 'dinner', text: 'Stir-fry with brown rice' },
  { time: 'dinner', text: 'Grilled chicken with sweet potato' },
  { time: 'dinner', text: 'Vegetable curry with naan' },
  { time: 'dinner', text: 'Tacos with black beans and avocado' },
  { time: 'dinner', text: 'Roasted vegetables with quinoa' },
  { time: 'dinner', text: 'Spaghetti with garlic and olive oil' },

  // Late dinner / Snacks
  { time: 'snack', text: 'Apple slices with almond butter' },
  { time: 'snack', text: 'Handful of mixed nuts' },
  { time: 'snack', text: 'Carrots and hummus' },
  { time: 'snack', text: 'Greek yogurt with granola' },
  { time: 'snack', text: 'Cheese and whole grain crackers' },
  { time: 'snack', text: 'Trail mix with dried fruit' },
  { time: 'snack', text: 'Rice cake with avocado' },
  { time: 'snack', text: 'Banana with peanut butter' },
] as const

export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack'

export function getRandomRecipe(mealTime: MealTime): string {
  const recipes = RECIPES.filter(r => r.time === mealTime)
  if (recipes.length === 0) return ''
  const random = Math.floor(Math.random() * recipes.length)
  return recipes[random].text
}

export function getMealTimeForHour(hour: number): MealTime | null {
  // Breakfast: 6 AM - 11 AM (expanded to include mid-morning)
  if (hour >= 6 && hour < 11) return 'breakfast'
  // Lunch: 11 AM - 3 PM (expanded)
  if (hour >= 11 && hour < 15) return 'lunch'
  // Dinner: 4 PM - 9 PM (expanded to include early/late dinner)
  if (hour >= 16 && hour < 21) return 'dinner'
  // Snack: 9 PM - midnight (expanded)
  if (hour >= 21 && hour < 24) return 'snack'
  return null
}
