import { atom } from 'nanostores'
import { getMealTimeForHour, type MealTime } from '#shared/constants/recipes'
import axios from 'axios'

type RecipeWidgetState = {
  isVisible: boolean
  recipe: string
  mealTime: MealTime | null
  showUntil: number // timestamp
  lastShownDate: string // YYYY-MM-DD to track daily shows
}

const WIDGET_DURATION = 30 * 60 * 1000 // 30 minutes
const CHECK_COOLDOWN = 2 * 60 * 1000 // 2 minutes between checks

let lastCheckTime = 0

export const recipeWidget = atom<RecipeWidgetState>({
  isVisible: false,
  recipe: '',
  mealTime: null,
  showUntil: 0,
  lastShownDate: '',
})

// Check if widget should show (called on System tab mount and periodically)
export async function checkRecipeWidget() {
  const now = Date.now()

  // Prevent rapid successive checks (e.g., from component re-mounting)
  if (now - lastCheckTime < CHECK_COOLDOWN) {
    return
  }
  lastCheckTime = now

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
  const todayMealKey = `${today}-${mealTime}`

  // Check localStorage for persistence across page refreshes
  const lastShownFromStorage = localStorage.getItem('lastRecipeShown')

  // Only show once per meal time per day (with 30% random chance)
  if (state.lastShownDate === todayMealKey || lastShownFromStorage === todayMealKey) {
    return
  }

  // Random chance to show (60% probability)
  if (Math.random() > 0.6) return

  // Fetch contextual recipe from server
  try {
    const response = await axios.get<{ recipe: string; mealTime: MealTime }>(
      `/api/recipe-suggestion?mealTime=${mealTime}`,
      { withCredentials: true }
    )

    const recipe = response.data.recipe

    // Persist to localStorage to prevent duplicates across page refreshes
    localStorage.setItem('lastRecipeShown', `${today}-${mealTime}`)

    // Show the recipe widget!
    recipeWidget.set({
      isVisible: true,
      recipe,
      mealTime,
      showUntil: now + WIDGET_DURATION,
      lastShownDate: `${today}-${mealTime}`,
    })
  } catch (error) {
    console.error('Failed to fetch recipe suggestion:', error)
    // Don't show widget if fetch fails
  }
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
