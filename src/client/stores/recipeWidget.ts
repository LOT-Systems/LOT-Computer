/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { atom } from 'nanostores'
import { getMealTimeForHour, type MealTime } from '#shared/constants/recipes'
import axios from 'axios'
import {
  getFastingState,
  pickFastingSuggestion,
  formatFastingHeadline,
  type FastingTradition,
  type FastingMode,
} from '#client/utils/fasting'

type RecipeWidgetState = {
  isVisible: boolean
  recipe: string
  mealTime: MealTime | null
  showUntil: number // timestamp
  lastShownDate: string // YYYY-MM-DD to track daily shows
  /** When true, this suggestion is a fasting override, not a recipe. */
  isFasting: boolean
  fastingMode: FastingMode
  fastingHeadline: string // e.g., "Great Lent · day 12 of 48 · water"
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
  isFasting: false,
  fastingMode: 'normal',
  fastingHeadline: '',
})

/**
 * Read the user's fasting tradition preference from localStorage.
 * Defaults to 'orthodox' since it provides the richest gradual
 * calendar. Users can set 'catholic' for Roman Catholic rules, or
 * 'off' to disable fasting awareness entirely.
 */
function getFastingTradition(): FastingTradition {
  if (typeof window === 'undefined') return 'orthodox'
  try {
    const raw = localStorage.getItem('fasting-tradition')
    if (raw === 'orthodox' || raw === 'catholic' || raw === 'off') return raw
  } catch {}
  return 'orthodox'
}

export function setFastingTradition(tradition: FastingTradition) {
  try {
    localStorage.setItem('fasting-tradition', tradition)
  } catch {}
}

/** Re-exported so components can render fasting state directly. */
export { getFastingState, pickFastingSuggestion, formatFastingHeadline }

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

  // Only show once per meal time per day
  if (state.lastShownDate === todayMealKey || lastShownFromStorage === todayMealKey) {
    return
  }

  // --------------------------------------------------------------------
  // Fasting gate: check the Christian fasting calendar before calling
  // the server recipe generator. If today is a fasting day, we skip
  // the network request entirely and render a deterministic light
  // suggestion that matches the current strictness level. Fasting
  // guidance is always shown (not gated behind the 60% random check)
  // because the guidance is the whole point of the feature.
  // --------------------------------------------------------------------
  const tradition = getFastingTradition()
  const fasting = getFastingState(new Date(), tradition)

  if (fasting.isFastingDay && fasting.mode !== 'normal') {
    const suggestion = pickFastingSuggestion(fasting, mealTime)
    if (suggestion) {
      localStorage.setItem('lastRecipeShown', `${today}-${mealTime}`)
      recipeWidget.set({
        isVisible: true,
        recipe: suggestion,
        mealTime,
        showUntil: now + WIDGET_DURATION,
        lastShownDate: `${today}-${mealTime}`,
        isFasting: true,
        fastingMode: fasting.mode,
        fastingHeadline: formatFastingHeadline(fasting),
      })
      return
    }
  }

  // Random chance to show (60% probability) on non-fasting days
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
      isFasting: false,
      fastingMode: 'normal',
      fastingHeadline: '',
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
