import { atom } from 'nanostores'
import { getRandomRecipe, getMealTimeForHour, type MealTime } from '#shared/constants/recipes'

type RecipeWidgetState = {
  isVisible: boolean
  recipe: string
  mealTime: MealTime | null
  showUntil: number // timestamp
  lastShownDate: string // YYYY-MM-DD to track daily shows
}

const WIDGET_DURATION = 30 * 60 * 1000 // 30 minutes

export const recipeWidget = atom<RecipeWidgetState>({
  isVisible: false,
  recipe: '',
  mealTime: null,
  showUntil: 0,
  lastShownDate: '',
})

// Check if widget should show (called on System tab mount and periodically)
export function checkRecipeWidget() {
  const now = Date.now()
  const state = recipeWidget.get()

  // If widget is visible and time is up, hide it
  if (state.isVisible && now >= state.showUntil) {
    recipeWidget.set({
      ...state,
      isVisible: false,
    })
    return
  }

  // If already visible and still within time, keep showing
  if (state.isVisible) {
    return
  }

  // Check if we should show a new recipe
  const currentHour = new Date().getHours()
  const mealTime = getMealTimeForHour(currentHour)

  if (!mealTime) return // Not a meal time

  const today = new Date().toISOString().split('T')[0]

  // Only show once per meal time per day (with 30% random chance)
  if (state.lastShownDate === `${today}-${mealTime}`) return

  // Random chance to show (30% probability)
  if (Math.random() > 0.3) return

  // Show the recipe widget!
  const recipe = getRandomRecipe(mealTime)
  recipeWidget.set({
    isVisible: true,
    recipe,
    mealTime,
    showUntil: now + WIDGET_DURATION,
    lastShownDate: `${today}-${mealTime}`,
  })
}

// Manually dismiss the widget
export function dismissRecipeWidget() {
  const state = recipeWidget.get()
  recipeWidget.set({
    ...state,
    isVisible: false,
  })
}

// Initialize periodic check (call this once on app start)
export function initRecipeWidget() {
  // Check every 5 minutes
  setInterval(checkRecipeWidget, 5 * 60 * 1000)
  // Check immediately on init
  checkRecipeWidget()
}
