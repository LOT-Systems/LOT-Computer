import { atom } from 'nanostores'

type PlanCategory = 'priority' | 'time' | 'energy' | 'care'

type PlannerWidgetState = {
  isVisible: boolean
  values: {
    priority: string
    time: string
    energy: string
    care: string
  }
  selectedCategory: PlanCategory
  showUntil: number
  lastShownDate: string
}

const WIDGET_DURATION = 20 * 60 * 1000 // 20 minutes
const CHECK_COOLDOWN = 5 * 60 * 1000 // 5 minutes between checks

let lastCheckTime = 0

export const plannerWidget = atom<PlannerWidgetState>({
  isVisible: false,
  values: {
    priority: '',
    time: '',
    energy: '',
    care: ''
  },
  selectedCategory: 'priority',
  showUntil: 0,
  lastShownDate: ''
})

// Contextual suggestions for each category
const PRIORITY_OPTIONS = [
  'Complete one meaningful task',
  'Make progress on the project',
  'Respond to important messages',
  'Organize and clarify next steps',
  'Focus on deep work',
  'Review and reflect on progress',
]

const TIME_OPTIONS = [
  'Morning focus block',
  'Afternoon deep work',
  'Evening wind-down',
  'First 2 hours of the day',
  'Before noon',
  'After lunch energy peak',
]

const ENERGY_OPTIONS = [
  'High focus required',
  'Steady, calm energy',
  'Low energy, gentle tasks',
  'Creative, exploratory',
  'Structured, methodical',
  'Flexible, adaptive',
]

const CARE_OPTIONS = [
  'Take breaks every hour',
  'Stay hydrated',
  'Step outside once',
  'Pause to breathe',
  'Check in with how I feel',
  'End before exhaustion',
]

function getRandomOption(options: string[]): string {
  return options[Math.floor(Math.random() * options.length)]
}

function generateContextualPlan(): PlannerWidgetState['values'] {
  const hour = new Date().getHours()

  // Adjust suggestions based on time of day
  let priority = getRandomOption(PRIORITY_OPTIONS)
  let time = getRandomOption(TIME_OPTIONS)
  let energy = getRandomOption(ENERGY_OPTIONS)
  let care = getRandomOption(CARE_OPTIONS)

  // Morning: focus on priority setting
  if (hour >= 6 && hour < 9) {
    priority = 'Complete one meaningful task'
    time = 'Morning focus block'
  }

  // Midday: adjust energy
  if (hour >= 12 && hour < 14) {
    time = 'After lunch energy peak'
    energy = 'Steady, calm energy'
  }

  // Evening: gentle tasks
  if (hour >= 18) {
    energy = 'Low energy, gentle tasks'
    time = 'Evening wind-down'
  }

  return { priority, time, energy, care }
}

export async function checkPlannerWidget() {
  const now = Date.now()

  // Prevent rapid successive checks
  if (now - lastCheckTime < CHECK_COOLDOWN) {
    return
  }
  lastCheckTime = now

  const state = plannerWidget.get()

  // If widget is visible and time is up, hide it
  if (state.isVisible && now >= state.showUntil) {
    plannerWidget.set({
      ...state,
      isVisible: false,
    })
    return
  }

  // If already visible, don't show again
  if (state.isVisible) {
    return
  }

  const hour = new Date().getHours()
  const day = new Date().getDay()
  const today = new Date().toISOString().split('T')[0]

  // Only show once per day
  if (state.lastShownDate === today) return

  // Show during planning times
  const isMorning = hour >= 6 && hour < 9
  const isAfternoon = hour >= 13 && hour < 15
  const isMondayMorning = day === 1 && hour >= 8 && hour < 11

  if (!isMorning && !isAfternoon && !isMondayMorning) return

  // 30% chance to show during these times
  if (Math.random() > 0.3) return

  // Generate contextual plan
  const values = generateContextualPlan()

  plannerWidget.set({
    isVisible: true,
    values,
    selectedCategory: 'priority',
    showUntil: now + WIDGET_DURATION,
    lastShownDate: today,
  })
}

// Navigate through suggestions
export function cycleValue(direction: 'up' | 'down') {
  const state = plannerWidget.get()
  const category = state.selectedCategory

  let options: string[]
  switch (category) {
    case 'priority': options = PRIORITY_OPTIONS; break
    case 'time': options = TIME_OPTIONS; break
    case 'energy': options = ENERGY_OPTIONS; break
    case 'care': options = CARE_OPTIONS; break
  }

  const currentIndex = options.indexOf(state.values[category])
  let newIndex: number

  if (direction === 'up') {
    newIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1
  } else {
    newIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1
  }

  plannerWidget.set({
    ...state,
    values: {
      ...state.values,
      [category]: options[newIndex]
    }
  })
}

// Navigate between categories
export function navigateCategory(direction: 'left' | 'right') {
  const state = plannerWidget.get()
  const categories: PlanCategory[] = ['priority', 'time', 'energy', 'care']
  const currentIndex = categories.indexOf(state.selectedCategory)

  let newIndex: number
  if (direction === 'left') {
    newIndex = currentIndex === 0 ? categories.length - 1 : currentIndex - 1
  } else {
    newIndex = currentIndex === categories.length - 1 ? 0 : currentIndex + 1
  }

  plannerWidget.set({
    ...state,
    selectedCategory: categories[newIndex]
  })
}

// Dismiss the widget
export function dismissPlannerWidget() {
  const state = plannerWidget.get()
  plannerWidget.set({
    ...state,
    isVisible: false,
  })
}
