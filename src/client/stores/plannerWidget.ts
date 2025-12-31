import { atom } from 'nanostores'

type PlanCategory = 'intent' | 'expression' | 'alignment' | 'admiration'

type PlannerWidgetState = {
  isVisible: boolean
  values: {
    intent: string
    expression: string
    alignment: string
    admiration: string
  }
  selectedCategory: PlanCategory
  showUntil: number
  lastShownDate: string
}

const WIDGET_DURATION = 30 * 60 * 1000 // 30 minutes
const CHECK_COOLDOWN = 5 * 60 * 1000 // 5 minutes between checks

let lastCheckTime = 0

export const plannerWidget = atom<PlannerWidgetState>({
  isVisible: false,
  values: {
    intent: '',
    expression: '',
    alignment: '',
    admiration: ''
  },
  selectedCategory: 'intent',
  showUntil: 0,
  lastShownDate: ''
})

// Intent - Your deeper purpose calling
const INTENT_OPTIONS = [
  'To create something meaningful',
  'To be fully present',
  'To understand myself more deeply',
  'To contribute to others',
  'To express what\'s inside me',
  'To discover what I\'m here for',
  'To live with more clarity',
  'To align with what matters',
  'To follow what calls me',
  'To honor my inner truth',
]

// Expression - How intent wants to manifest
const EXPRESSION_OPTIONS = [
  'Through focused attention',
  'Through gentle presence',
  'Through creative work',
  'Through conversation',
  'Through quiet reflection',
  'Through making something real',
  'Through honest engagement',
  'Through patient observation',
  'Through deliberate practice',
  'Through being who I am',
]

// Alignment - What supports your intent
const ALIGNMENT_OPTIONS = [
  'Saying no to what doesn\'t serve this',
  'Creating space for what does',
  'Following curiosity over obligation',
  'Trusting the timing',
  'Letting go of forcing',
  'Honoring my natural rhythm',
  'Staying with what resonates',
  'Releasing what doesn\'t',
  'Moving at my own pace',
  'Being honest about readiness',
]

// Admiration - What you notice and appreciate
const ADMIRATION_OPTIONS = [
  'I notice I\'m willing to try',
  'I see the pattern emerging',
  'I appreciate my consistency',
  'I recognize my courage here',
  'I observe my honesty',
  'I witness my patience',
  'I value this commitment',
  'I respect this choice',
  'I honor this direction',
  'I acknowledge my growth',
]

function getRandomOption(options: string[]): string {
  return options[Math.floor(Math.random() * options.length)]
}

function generateContextualPlan(): PlannerWidgetState['values'] {
  const hour = new Date().getHours()
  const day = new Date().getDay()

  // Default random selection
  let intent = getRandomOption(INTENT_OPTIONS)
  let expression = getRandomOption(EXPRESSION_OPTIONS)
  let alignment = getRandomOption(ALIGNMENT_OPTIONS)
  let admiration = getRandomOption(ADMIRATION_OPTIONS)

  // Morning: focus on discovery and presence
  if (hour >= 6 && hour < 9) {
    intent = 'To be fully present'
    expression = 'Through quiet reflection'
    admiration = 'I notice I\'m willing to try'
  }

  // Midday: focus on creation and engagement
  if (hour >= 12 && hour < 15) {
    intent = 'To create something meaningful'
    expression = 'Through focused attention'
  }

  // Evening: focus on understanding and honoring
  if (hour >= 18 && hour < 21) {
    intent = 'To understand myself more deeply'
    expression = 'Through patient observation'
    alignment = 'Honoring my natural rhythm'
  }

  // Monday morning: weekly intention setting
  if (day === 1 && hour >= 7 && hour < 10) {
    intent = 'To discover what I\'m here for'
    alignment = 'Following curiosity over obligation'
    admiration = 'I recognize my courage here'
  }

  // Sunday evening: reflection and honoring
  if (day === 0 && hour >= 17) {
    intent = 'To honor my inner truth'
    expression = 'Through gentle presence'
    alignment = 'Trusting the timing'
    admiration = 'I appreciate my consistency'
  }

  return { intent, expression, alignment, admiration }
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

  // Show during contemplative times
  const isMorning = hour >= 7 && hour < 9 // Morning reflection
  const isMidAfternoon = hour >= 14 && hour < 16 // Afternoon pause
  const isMondayMorning = day === 1 && hour >= 8 && hour < 11 // Weekly intention
  const isSundayEvening = day === 0 && hour >= 17 && hour < 20 // Weekly reflection

  if (!isMorning && !isMidAfternoon && !isMondayMorning && !isSundayEvening) return

  // 40% chance to show during these times (higher than other widgets - this is important)
  if (Math.random() > 0.4) return

  // Generate contextual plan
  const values = generateContextualPlan()

  plannerWidget.set({
    isVisible: true,
    values,
    selectedCategory: 'intent',
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
    case 'intent': options = INTENT_OPTIONS; break
    case 'expression': options = EXPRESSION_OPTIONS; break
    case 'alignment': options = ALIGNMENT_OPTIONS; break
    case 'admiration': options = ADMIRATION_OPTIONS; break
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
  const categories: PlanCategory[] = ['intent', 'expression', 'alignment', 'admiration']
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
