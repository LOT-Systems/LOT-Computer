import { atom } from 'nanostores'
import { shouldShowWidget } from './intentionEngine'

type PlanCategory = 'intent' | 'today' | 'how' | 'feeling'

type PlannerWidgetState = {
  isVisible: boolean
  values: {
    intent: string
    today: string
    how: string
    feeling: string
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
    today: '',
    how: '',
    feeling: ''
  },
  selectedCategory: 'intent',
  showUntil: 0,
  lastShownDate: ''
})

// Intent - Your deeper purpose for this time
const INTENT_OPTIONS = [
  'Move forward on what matters',
  'Create space for focus',
  'Complete one meaningful thing',
  'Make something real',
  'Understand what I need',
  'Follow what energizes me',
  'Honor my natural pace',
  'Express what\'s inside',
  'Connect with what calls',
  'Be present with the day',
]

// Today - What you'll actually do (next few hours)
const TODAY_OPTIONS = [
  'Work on one focused task',
  'Clear my physical space',
  'Have one important conversation',
  'Write or create for 30 minutes',
  'Review and organize my thoughts',
  'Take care of one pending thing',
  'Plan my next 3 hours',
  'Make progress on the project',
  'Read or learn something new',
  'Rest and restore energy',
]

// How - Your approach to the time ahead
const HOW_OPTIONS = [
  'With full attention, no rushing',
  'One thing at a time',
  'Following my energy, not force',
  'Taking breaks when needed',
  'Staying with what resonates',
  'Being honest about capacity',
  'Moving at my natural rhythm',
  'Protecting my focus time',
  'Letting go of perfection',
  'Trusting the process',
]

// Feeling - The state you're aiming for
const FEELING_OPTIONS = [
  'Centered and clear',
  'Engaged but not anxious',
  'Present with what is',
  'Calm and productive',
  'Creative and flowing',
  'Grounded and steady',
  'Energized but sustainable',
  'Peaceful and focused',
  'Honest and aligned',
  'Patient with myself',
]

function getRandomOption(options: string[]): string {
  return options[Math.floor(Math.random() * options.length)]
}

function generateContextualPlan(): PlannerWidgetState['values'] {
  const hour = new Date().getHours()
  const day = new Date().getDay()

  // Default random selection
  let intent = getRandomOption(INTENT_OPTIONS)
  let today = getRandomOption(TODAY_OPTIONS)
  let how = getRandomOption(HOW_OPTIONS)
  let feeling = getRandomOption(FEELING_OPTIONS)

  // Early morning (6-9am): Start fresh
  if (hour >= 6 && hour < 9) {
    intent = 'Create space for focus'
    today = 'Plan my next 3 hours'
    how = 'One thing at a time'
    feeling = 'Centered and clear'
  }

  // Morning peak (9-12pm): Deep work
  if (hour >= 9 && hour < 12) {
    intent = 'Move forward on what matters'
    today = 'Work on one focused task'
    how = 'With full attention, no rushing'
    feeling = 'Engaged but not anxious'
  }

  // Afternoon (12-3pm): Sustained energy
  if (hour >= 12 && hour < 15) {
    intent = 'Make something real'
    today = 'Make progress on the project'
    how = 'Following my energy, not force'
    feeling = 'Calm and productive'
  }

  // Late afternoon (3-6pm): Winding down
  if (hour >= 15 && hour < 18) {
    intent = 'Complete one meaningful thing'
    today = 'Take care of one pending thing'
    how = 'Being honest about capacity'
    feeling = 'Patient with myself'
  }

  // Evening (6-9pm): Reflection
  if (hour >= 18 && hour < 21) {
    intent = 'Honor my natural pace'
    today = 'Review and organize my thoughts'
    how = 'Staying with what resonates'
    feeling = 'Present with what is'
  }

  // Monday morning: Weekly planning
  if (day === 1 && hour >= 7 && hour < 11) {
    intent = 'Create space for focus'
    today = 'Plan my next 3 hours'
    how = 'One thing at a time'
    feeling = 'Centered and clear'
  }

  // Friday afternoon: Week completion
  if (day === 5 && hour >= 14 && hour < 18) {
    intent = 'Complete one meaningful thing'
    today = 'Take care of one pending thing'
    how = 'Letting go of perfection'
    feeling = 'Patient with myself'
  }

  return { intent, today, how, feeling }
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

  // Check if intention engine recognizes need for structure
  const intentionSuggestsPlanner = shouldShowWidget('planner')

  // Show during planning times
  const isMorning = hour >= 7 && hour < 9 // Morning planning
  const isMidday = hour >= 11 && hour < 13 // Midday check-in
  const isAfternoon = hour >= 14 && hour < 16 // Afternoon reset
  const isMondayMorning = day === 1 && hour >= 8 && hour < 11 // Weekly planning
  const isFridayAfternoon = day === 5 && hour >= 14 && hour < 17 // Week completion

  // Show if intention engine detects lack-of-structure pattern OR during planning times
  const isGoodTimingForPlanning = isMorning || isMidday || isAfternoon || isMondayMorning || isFridayAfternoon

  if (!intentionSuggestsPlanner && !isGoodTimingForPlanning) return

  // If intention engine suggests, show immediately (100% chance)
  // Otherwise, 50% chance during planning times
  if (!intentionSuggestsPlanner && Math.random() > 0.5) return

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

// Play click sound
function playClickSound() {
  // Create a short, satisfying click using Web Audio API
  if (typeof window === 'undefined') return

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

  // Create a short click sound with two oscillators for richness
  const oscillator1 = audioContext.createOscillator()
  const oscillator2 = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator1.connect(gainNode)
  oscillator2.connect(gainNode)
  gainNode.connect(audioContext.destination)

  // Frequencies for a pleasing click
  oscillator1.frequency.value = 800 // Higher frequency
  oscillator2.frequency.value = 400 // Lower frequency

  // Very short duration for a click
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)

  oscillator1.start(audioContext.currentTime)
  oscillator2.start(audioContext.currentTime)
  oscillator1.stop(audioContext.currentTime + 0.05)
  oscillator2.stop(audioContext.currentTime + 0.05)
}

// Navigate through suggestions
export function cycleValue(direction: 'up' | 'down') {
  const state = plannerWidget.get()
  const category = state.selectedCategory

  let options: string[]
  switch (category) {
    case 'intent': options = INTENT_OPTIONS; break
    case 'today': options = TODAY_OPTIONS; break
    case 'how': options = HOW_OPTIONS; break
    case 'feeling': options = FEELING_OPTIONS; break
  }

  const currentIndex = options.indexOf(state.values[category])
  let newIndex: number

  if (direction === 'up') {
    newIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1
  } else {
    newIndex = currentIndex === options.length - 1 ? 0 : currentIndex + 1
  }

  playClickSound()

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
  const categories: PlanCategory[] = ['intent', 'today', 'how', 'feeling']
  const currentIndex = categories.indexOf(state.selectedCategory)

  let newIndex: number
  if (direction === 'left') {
    newIndex = currentIndex === 0 ? categories.length - 1 : currentIndex - 1
  } else {
    newIndex = currentIndex === categories.length - 1 ? 0 : currentIndex + 1
  }

  playClickSound()

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
