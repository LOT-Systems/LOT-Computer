import type { Log, User } from '#shared/types'
import dayjs from '#server/utils/dayjs'

/**
 * Goal Understanding & Progression System
 *
 * Analyzes user data over months to:
 * 1. Extract implicit and explicit goals
 * 2. Track progress toward goals
 * 3. Generate narrative progression
 * 4. Promote goals throughout the system
 *
 * Philosophy: Users reveal goals through patterns, not just statements.
 * The system understands what they're working toward even when they don't articulate it.
 */

export type GoalCategory =
  | 'emotional'      // Reduce anxiety, increase joy, cultivate peace
  | 'relational'     // Better boundaries, deeper connection, healthy communication
  | 'behavioral'     // Consistent practice, healthier habits, routines
  | 'growth'         // Self-awareness, authenticity, personal evolution
  | 'physical'       // Better sleep, movement, rest, energy
  | 'creative'       // Self-expression, artistic practice, flow states
  | 'existential'    // Meaning, purpose, values alignment

export type GoalState =
  | 'emerging'       // User showing early signs of this goal
  | 'active'         // Clearly working on this goal
  | 'progressing'    // Making measurable progress
  | 'plateaued'      // Progress stalled
  | 'achieved'       // Goal substantially reached
  | 'abandoned'      // No longer pursuing

export interface ExtractedGoal {
  id: string
  category: GoalCategory
  title: string // "Reduce anxiety", "Build daily meditation practice"
  description: string // Richer context about the goal
  state: GoalState
  confidence: number // 0-1, how confident we are this is a real goal

  // Evidence
  extractedFrom: string[] // 'intention:Presence', 'journal:mentioned-meditation-3-times', 'pattern:anxious-checkins-decreasing'
  firstDetected: string // ISO date when we first detected this goal
  lastUpdated: string // ISO date of last evidence

  // Progress tracking
  baseline: {
    description: string // Initial state description
    detectedAt: string
  } | null
  progressMarkers: {
    description: string // What improved
    detectedAt: string
    metric?: number // Optional quantitative measure (0-100)
  }[]

  // Narrative
  journeyStage: 'beginning' | 'struggle' | 'breakthrough' | 'integration' | 'mastery'
  narrative: string // RPG-style story about their journey with this goal
}

export interface GoalProgression {
  goals: ExtractedGoal[]
  overallJourney: {
    monthsTracked: number
    primaryGoal: ExtractedGoal | null // The goal they're most actively pursuing
    recentBreakthroughs: ExtractedGoal[] // Goals with recent progress
    nextFocus: string // Suggested area to explore next
  }
  narrative: {
    currentChapter: string // "The Anxious Seeker Finds Stillness"
    storyArc: string // Multi-paragraph narrative of their journey
    nextMilestone: string // "Continue daily practice for 30 days"
  }
}

/**
 * Extract goals from all available user data
 */
export function extractGoals(user: User, logs: Log[]): ExtractedGoal[] {
  const goals: ExtractedGoal[] = []

  // Extract from explicit intentions
  goals.push(...extractGoalsFromIntentions(logs))

  // Extract from journal entries (explicit mentions)
  goals.push(...extractGoalsFromJournal(logs))

  // Extract from behavioral patterns (implicit goals)
  goals.push(...extractGoalsFromPatterns(logs))

  // Extract from check-in patterns (emotional goals)
  goals.push(...extractGoalsFromCheckIns(logs))

  // Extract from Memory answers (lifestyle goals)
  goals.push(...extractGoalsFromMemoryAnswers(logs))

  // Merge duplicate goals and update confidence
  const mergedGoals = mergeAndRankGoals(goals)

  // Track progress for each goal
  return mergedGoals.map(goal => trackGoalProgress(goal, logs))
}

/**
 * Extract goals from monthly intentions
 */
function extractGoalsFromIntentions(logs: Log[]): ExtractedGoal[] {
  const goals: ExtractedGoal[] = []

  // Find intention-setting logs (stored in log or localStorage)
  const intentionLogs = logs.filter(log =>
    log.event === 'note' &&
    log.text &&
    (log.text.toLowerCase().includes('intention:') ||
     log.metadata?.type === 'intention')
  )

  // Map intention keywords to goal categories
  const intentionMap: Record<string, { category: GoalCategory; title: string; description: string }> = {
    'presence': {
      category: 'emotional',
      title: 'Cultivate presence and mindfulness',
      description: 'Learning to be fully present in each moment, reducing distraction and mental noise'
    },
    'boundaries': {
      category: 'relational',
      title: 'Establish healthy boundaries',
      description: 'Learning to say no, protect personal energy, and honor limits'
    },
    'rest': {
      category: 'physical',
      title: 'Prioritize rest and recovery',
      description: 'Building a healthier relationship with rest, sleep, and downtime'
    },
    'self-compassion': {
      category: 'emotional',
      title: 'Practice self-compassion',
      description: 'Treating self with kindness, reducing self-criticism, embracing imperfection'
    },
    'creative flow': {
      category: 'creative',
      title: 'Cultivate creative flow',
      description: 'Making space for creative expression and surrendering to the flow state'
    },
    'peace': {
      category: 'emotional',
      title: 'Find inner peace',
      description: 'Reducing anxiety and cultivating calm, centered presence'
    },
    'authenticity': {
      category: 'growth',
      title: 'Live authentically',
      description: 'Aligning actions with values, being true to self, removing masks'
    },
    'connection': {
      category: 'relational',
      title: 'Deepen meaningful connections',
      description: 'Building authentic relationships and emotional intimacy'
    },
    'purpose': {
      category: 'existential',
      title: 'Discover life purpose',
      description: 'Seeking meaning, direction, and alignment with deeper calling'
    }
  }

  for (const log of intentionLogs) {
    const text = (log.text || '').toLowerCase()

    for (const [keyword, goalData] of Object.entries(intentionMap)) {
      if (text.includes(keyword)) {
        goals.push({
          id: `intention-${keyword}-${log.id}`,
          category: goalData.category,
          title: goalData.title,
          description: goalData.description,
          state: 'active', // Explicitly set intention = active goal
          confidence: 0.95, // High confidence from explicit intention
          extractedFrom: [`intention:${keyword}`],
          firstDetected: log.createdAt.toISOString(),
          lastUpdated: log.createdAt.toISOString(),
          baseline: null, // Will be set during progress tracking
          progressMarkers: [],
          journeyStage: 'beginning',
          narrative: `You set an intention to focus on ${keyword}. The journey begins.`
        })
      }
    }
  }

  return goals
}

/**
 * Extract goals from journal entries (explicit statements)
 */
function extractGoalsFromJournal(logs: Log[]): ExtractedGoal[] {
  const goals: ExtractedGoal[] = []

  const journalLogs = logs.filter(log => log.event === 'note' && log.text && log.text.length > 50)

  // Keywords that indicate goals
  const goalIndicators = [
    { keywords: ['want to', 'trying to', 'working on', 'goal is', 'hoping to'], confidence: 0.9 },
    { keywords: ['need to', 'should', 'must'], confidence: 0.7 },
    { keywords: ['wish', 'desire', 'dream'], confidence: 0.8 }
  ]

  // Emotional goal keywords
  const emotionalGoals = [
    { keywords: ['less anxious', 'reduce anxiety', 'calm down', 'find peace'], title: 'Reduce anxiety and find calm', category: 'emotional' as GoalCategory },
    { keywords: ['more energy', 'feel energized', 'less tired'], title: 'Increase energy and vitality', category: 'physical' as GoalCategory },
    { keywords: ['happier', 'more joy', 'feel better'], title: 'Cultivate joy and wellbeing', category: 'emotional' as GoalCategory },
    { keywords: ['sleep better', 'improve sleep', 'rest more'], title: 'Improve sleep quality', category: 'physical' as GoalCategory },
    { keywords: ['be present', 'stay mindful', 'less distracted'], title: 'Develop mindful presence', category: 'emotional' as GoalCategory },
    { keywords: ['understand myself', 'know myself', 'self-aware'], title: 'Deepen self-understanding', category: 'growth' as GoalCategory },
  ]

  for (const log of journalLogs) {
    const text = log.text!.toLowerCase()

    // Check if text contains goal indicators
    let baseConfidence = 0.5
    for (const indicator of goalIndicators) {
      if (indicator.keywords.some(kw => text.includes(kw))) {
        baseConfidence = indicator.confidence
        break
      }
    }

    // If no goal indicator, skip
    if (baseConfidence < 0.7) continue

    // Check for specific goal types
    for (const goalType of emotionalGoals) {
      if (goalType.keywords.some(kw => text.includes(kw))) {
        const goalId = `journal-${goalType.category}-${goalType.title.replace(/\s+/g, '-')}`

        // Check if we already detected this goal
        const existingGoal = goals.find(g => g.id === goalId)
        if (existingGoal) {
          existingGoal.extractedFrom.push(`journal:${log.id}`)
          existingGoal.lastUpdated = log.createdAt.toISOString()
          existingGoal.confidence = Math.min(existingGoal.confidence + 0.05, 0.98)
        } else {
          goals.push({
            id: goalId,
            category: goalType.category,
            title: goalType.title,
            description: `Extracted from journal reflections about ${goalType.title.toLowerCase()}`,
            state: 'active',
            confidence: baseConfidence,
            extractedFrom: [`journal:${log.id}`],
            firstDetected: log.createdAt.toISOString(),
            lastUpdated: log.createdAt.toISOString(),
            baseline: null,
            progressMarkers: [],
            journeyStage: 'beginning',
            narrative: `Through journaling, you've expressed a desire to ${goalType.title.toLowerCase()}.`
          })
        }
      }
    }
  }

  return goals
}

/**
 * Extract implicit goals from behavioral patterns
 */
function extractGoalsFromPatterns(logs: Log[]): ExtractedGoal[] {
  const goals: ExtractedGoal[] = []

  // Consistent self-care practice → Goal: Build consistent self-care habit
  const selfCareLogs = logs.filter(log => log.event === 'self_care_complete')
  if (selfCareLogs.length >= 5) {
    const daysCovered = new Set(selfCareLogs.map(log =>
      dayjs(log.createdAt).format('YYYY-MM-DD')
    )).size

    if (daysCovered >= 5) {
      goals.push({
        id: 'pattern-selfcare-consistency',
        category: 'behavioral',
        title: 'Build consistent self-care practice',
        description: 'Developing a regular self-care routine through repeated practice',
        state: 'progressing',
        confidence: 0.85,
        extractedFrom: [`pattern:self-care-${daysCovered}-days`],
        firstDetected: selfCareLogs[selfCareLogs.length - 1].createdAt.toISOString(),
        lastUpdated: selfCareLogs[0].createdAt.toISOString(),
        baseline: {
          description: 'Started practicing self-care occasionally',
          detectedAt: selfCareLogs[selfCareLogs.length - 1].createdAt.toISOString()
        },
        progressMarkers: [{
          description: `Practiced self-care on ${daysCovered} different days`,
          detectedAt: selfCareLogs[0].createdAt.toISOString(),
          metric: Math.min((daysCovered / 30) * 100, 100)
        }],
        journeyStage: daysCovered >= 20 ? 'integration' : daysCovered >= 10 ? 'breakthrough' : 'struggle',
        narrative: `You've practiced self-care ${selfCareLogs.length} times across ${daysCovered} days. Your commitment is building.`
      })
    }
  }

  // Regular check-ins → Goal: Develop emotional awareness
  const checkIns = logs.filter(log => log.event === 'emotional_checkin')
  if (checkIns.length >= 10) {
    goals.push({
      id: 'pattern-emotional-awareness',
      category: 'growth',
      title: 'Develop emotional self-awareness',
      description: 'Regularly checking in with emotional state to build awareness',
      state: 'progressing',
      confidence: 0.9,
      extractedFrom: [`pattern:check-ins-${checkIns.length}`],
      firstDetected: checkIns[checkIns.length - 1].createdAt.toISOString(),
      lastUpdated: checkIns[0].createdAt.toISOString(),
      baseline: {
        description: 'Beginning to notice and track emotional states',
        detectedAt: checkIns[checkIns.length - 1].createdAt.toISOString()
      },
      progressMarkers: [{
        description: `Completed ${checkIns.length} emotional check-ins`,
        detectedAt: checkIns[0].createdAt.toISOString(),
        metric: Math.min((checkIns.length / 100) * 100, 100)
      }],
      journeyStage: checkIns.length >= 50 ? 'integration' : checkIns.length >= 20 ? 'breakthrough' : 'beginning',
      narrative: `Through ${checkIns.length} check-ins, you're learning the language of your emotions.`
    })
  }

  // Regular planning → Goal: Bring structure to life
  const plans = logs.filter(log => log.event === 'plan_set')
  if (plans.length >= 5) {
    goals.push({
      id: 'pattern-intentional-planning',
      category: 'behavioral',
      title: 'Bring intentional structure to daily life',
      description: 'Using planning to create clarity and direction',
      state: 'active',
      confidence: 0.8,
      extractedFrom: [`pattern:planning-${plans.length}-times`],
      firstDetected: plans[plans.length - 1].createdAt.toISOString(),
      lastUpdated: plans[0].createdAt.toISOString(),
      baseline: {
        description: 'Started using intentional planning',
        detectedAt: plans[plans.length - 1].createdAt.toISOString()
      },
      progressMarkers: [{
        description: `Set ${plans.length} intentional plans`,
        detectedAt: plans[0].createdAt.toISOString(),
        metric: Math.min((plans.length / 30) * 100, 100)
      }],
      journeyStage: 'beginning',
      narrative: `You're bringing structure and intention to your days through planning.`
    })
  }

  return goals
}

/**
 * Extract goals from check-in emotional patterns
 */
function extractGoalsFromCheckIns(logs: Log[]): ExtractedGoal[] {
  const goals: ExtractedGoal[] = []

  const checkIns = logs.filter(log => log.event === 'emotional_checkin')
  if (checkIns.length < 10) return goals

  // Count emotional states
  const stateCounts: Record<string, number> = {}
  for (const log of checkIns) {
    const state = log.metadata?.emotionalState as string
    if (state) {
      stateCounts[state] = (stateCounts[state] || 0) + 1
    }
  }

  // If user frequently checks in as "anxious" or "overwhelmed" → Goal: Reduce anxiety
  const anxiousCount = (stateCounts['anxious'] || 0) + (stateCounts['overwhelmed'] || 0)
  if (anxiousCount >= 5) {
    const percentage = Math.round((anxiousCount / checkIns.length) * 100)

    // Check if anxiety is decreasing over time (sign of progress)
    const recentCheckIns = checkIns.slice(0, Math.floor(checkIns.length / 2))
    const olderCheckIns = checkIns.slice(Math.floor(checkIns.length / 2))

    const recentAnxious = recentCheckIns.filter(log =>
      ['anxious', 'overwhelmed'].includes(log.metadata?.emotionalState as string)
    ).length / recentCheckIns.length

    const olderAnxious = olderCheckIns.filter(log =>
      ['anxious', 'overwhelmed'].includes(log.metadata?.emotionalState as string)
    ).length / olderCheckIns.length

    const isImproving = recentAnxious < olderAnxious

    goals.push({
      id: 'checkin-reduce-anxiety',
      category: 'emotional',
      title: 'Reduce anxiety and overwhelm',
      description: 'Working to find more calm and peace in daily life',
      state: isImproving ? 'progressing' : 'active',
      confidence: 0.88,
      extractedFrom: [`checkin:anxious-${percentage}%`],
      firstDetected: (olderCheckIns[olderCheckIns.length - 1]?.createdAt || checkIns[checkIns.length - 1].createdAt).toISOString(),
      lastUpdated: checkIns[0].createdAt.toISOString(),
      baseline: {
        description: `Initially feeling anxious/overwhelmed ${Math.round(olderAnxious * 100)}% of the time`,
        detectedAt: (olderCheckIns[olderCheckIns.length - 1]?.createdAt || checkIns[checkIns.length - 1].createdAt).toISOString()
      },
      progressMarkers: isImproving ? [{
        description: `Anxiety decreased from ${Math.round(olderAnxious * 100)}% to ${Math.round(recentAnxious * 100)}%`,
        detectedAt: checkIns[0].createdAt.toISOString(),
        metric: Math.max(0, 100 - Math.round(recentAnxious * 100))
      }] : [],
      journeyStage: isImproving ? 'breakthrough' : 'struggle',
      narrative: isImproving
        ? `You're making progress. Anxiety is decreasing - from ${Math.round(olderAnxious * 100)}% to ${Math.round(recentAnxious * 100)}% of check-ins.`
        : `You've felt anxious in ${percentage}% of check-ins. The system is here to support you.`
    })
  }

  // If user rarely feels "energized" → Goal: Increase vitality
  const energizedCount = stateCounts['energized'] || 0
  const tiredCount = stateCounts['tired'] || 0
  if (energizedCount < checkIns.length * 0.2 && tiredCount > 3) {
    goals.push({
      id: 'checkin-increase-energy',
      category: 'physical',
      title: 'Increase energy and vitality',
      description: 'Finding ways to feel more energized and less depleted',
      state: 'active',
      confidence: 0.75,
      extractedFrom: [`checkin:low-energy-${tiredCount}-times`],
      firstDetected: checkIns[checkIns.length - 1].createdAt.toISOString(),
      lastUpdated: checkIns[0].createdAt.toISOString(),
      baseline: {
        description: `Feeling tired frequently, energized only ${Math.round((energizedCount / checkIns.length) * 100)}% of the time`,
        detectedAt: checkIns[checkIns.length - 1].createdAt.toISOString()
      },
      progressMarkers: [],
      journeyStage: 'beginning',
      narrative: `You're seeking more vitality. Energy levels are something you're working on.`
    })
  }

  return goals
}

/**
 * Extract goals from Memory answer patterns
 */
function extractGoalsFromMemoryAnswers(logs: Log[]): ExtractedGoal[] {
  const goals: ExtractedGoal[] = []

  const answers = logs.filter(log => log.event === 'answer')
  if (answers.length < 15) return goals

  // Analyze answer patterns for lifestyle goals
  // This is where we'd use more sophisticated NLP in production
  // For now, detect patterns in answer text

  const answerTexts = answers
    .map(log => (log.metadata?.answer as string || '').toLowerCase())
    .filter(Boolean)

  // Pattern: Mentions of meditation/mindfulness
  const meditationCount = answerTexts.filter(text =>
    text.includes('meditat') || text.includes('mindful') || text.includes('breathe')
  ).length

  if (meditationCount >= 3) {
    goals.push({
      id: 'memory-meditation-practice',
      category: 'behavioral',
      title: 'Establish regular meditation practice',
      description: 'Building a consistent meditation or mindfulness practice',
      state: 'active',
      confidence: 0.8,
      extractedFrom: [`memory:meditation-mentioned-${meditationCount}-times`],
      firstDetected: answers[answers.length - 1].createdAt.toISOString(),
      lastUpdated: answers[0].createdAt.toISOString(),
      baseline: null,
      progressMarkers: [],
      journeyStage: 'beginning',
      narrative: `You've mentioned meditation ${meditationCount} times. This practice calls to you.`
    })
  }

  return goals
}

/**
 * Merge duplicate goals and rank by confidence
 */
function mergeAndRankGoals(goals: ExtractedGoal[]): ExtractedGoal[] {
  const merged: Record<string, ExtractedGoal> = {}

  for (const goal of goals) {
    // Create a key based on category and title similarity
    const key = `${goal.category}-${goal.title.slice(0, 20)}`

    if (merged[key]) {
      // Merge evidence
      merged[key].extractedFrom.push(...goal.extractedFrom)
      merged[key].extractedFrom = [...new Set(merged[key].extractedFrom)]

      // Boost confidence
      merged[key].confidence = Math.min(merged[key].confidence + 0.1, 0.99)

      // Update dates
      if (dayjs(goal.firstDetected).isBefore(merged[key].firstDetected)) {
        merged[key].firstDetected = goal.firstDetected
      }
      if (dayjs(goal.lastUpdated).isAfter(merged[key].lastUpdated)) {
        merged[key].lastUpdated = goal.lastUpdated
      }

      // Merge progress markers
      merged[key].progressMarkers.push(...goal.progressMarkers)
    } else {
      merged[key] = goal
    }
  }

  // Sort by confidence and recency
  return Object.values(merged).sort((a, b) => {
    // Active and progressing goals first
    const stateWeight = { active: 3, progressing: 4, emerging: 2, plateaued: 1, achieved: 0, abandoned: 0 }
    const aWeight = stateWeight[a.state]
    const bWeight = stateWeight[b.state]

    if (aWeight !== bWeight) return bWeight - aWeight

    // Then by confidence
    if (Math.abs(a.confidence - b.confidence) > 0.1) {
      return b.confidence - a.confidence
    }

    // Then by recency
    return dayjs(b.lastUpdated).diff(dayjs(a.lastUpdated))
  })
}

/**
 * Track progress for a goal over time
 */
function trackGoalProgress(goal: ExtractedGoal, logs: Log[]): ExtractedGoal {
  // This would analyze logs to detect progress markers
  // For now, we rely on the progress markers already set during extraction

  // Update journey stage based on progress
  if (goal.progressMarkers.length === 0) {
    goal.journeyStage = 'beginning'
  } else if (goal.progressMarkers.length === 1) {
    goal.journeyStage = 'struggle'
  } else if (goal.progressMarkers.some(p => (p.metric || 0) > 70)) {
    goal.journeyStage = 'integration'
  } else if (goal.progressMarkers.length >= 2) {
    goal.journeyStage = 'breakthrough'
  }

  // Update state based on recent activity
  const daysSinceUpdate = dayjs().diff(dayjs(goal.lastUpdated), 'day')
  if (daysSinceUpdate > 30 && goal.state === 'active') {
    goal.state = 'plateaued'
  } else if (daysSinceUpdate > 60 && goal.state === 'plateaued') {
    goal.state = 'abandoned'
  }

  // Check if goal is achieved
  const highestMetric = Math.max(...goal.progressMarkers.map(p => p.metric || 0))
  if (highestMetric >= 90 && goal.journeyStage === 'integration') {
    goal.state = 'achieved'
    goal.journeyStage = 'mastery'
  }

  return goal
}

/**
 * Generate overall goal progression narrative
 */
export function generateGoalProgression(user: User, logs: Log[]): GoalProgression {
  const goals = extractGoals(user, logs)

  // Determine primary goal (highest confidence, most active)
  const primaryGoal = goals.find(g => g.state === 'active' || g.state === 'progressing') || goals[0] || null

  // Recent breakthroughs (goals with progress in last 30 days)
  const recentBreakthroughs = goals.filter(g =>
    g.progressMarkers.some(p =>
      dayjs().diff(dayjs(p.detectedAt), 'day') < 30
    ) && (g.state === 'progressing' || g.state === 'achieved')
  )

  // Calculate months tracked
  const oldestLog = logs[logs.length - 1]
  const monthsTracked = oldestLog ? dayjs().diff(dayjs(oldestLog.createdAt), 'month') : 0

  // Suggest next focus based on gaps
  const nextFocus = suggestNextFocus(goals, user)

  // Generate narrative arc
  const { currentChapter, storyArc, nextMilestone } = generateNarrativeArc(goals, user, monthsTracked)

  return {
    goals,
    overallJourney: {
      monthsTracked,
      primaryGoal,
      recentBreakthroughs,
      nextFocus
    },
    narrative: {
      currentChapter,
      storyArc,
      nextMilestone
    }
  }
}

/**
 * Suggest next focus area based on goal gaps
 */
function suggestNextFocus(goals: ExtractedGoal[], user: User): string {
  const categories = new Set(goals.map(g => g.category))

  // Suggest unexplored categories
  const allCategories: GoalCategory[] = ['emotional', 'relational', 'behavioral', 'growth', 'physical', 'creative', 'existential']
  const unexplored = allCategories.filter(c => !categories.has(c))

  if (unexplored.length > 0) {
    const categoryNames = {
      emotional: 'emotional wellbeing',
      relational: 'relationships and connection',
      behavioral: 'daily habits and routines',
      growth: 'personal growth and self-awareness',
      physical: 'physical health and energy',
      creative: 'creative expression',
      existential: 'meaning and purpose'
    }
    return categoryNames[unexplored[0]]
  }

  // Suggest deepening primary goal
  const primaryGoal = goals.find(g => g.state === 'active')
  if (primaryGoal) {
    return `Deepen your work with: ${primaryGoal.title.toLowerCase()}`
  }

  return 'Continue your practice and notice what emerges'
}

/**
 * Generate narrative arc for user's goal journey
 */
function generateNarrativeArc(goals: ExtractedGoal[], user: User, monthsTracked: number): {
  currentChapter: string
  storyArc: string
  nextMilestone: string
} {
  const archetype = user.metadata?.archetype || 'The Explorer'
  const primaryGoal = goals.find(g => g.state === 'active' || g.state === 'progressing')
  const achievedGoals = goals.filter(g => g.state === 'achieved')

  // Determine chapter title based on journey stage
  let currentChapter = ''
  if (monthsTracked < 1) {
    currentChapter = `${archetype} Awakens`
  } else if (monthsTracked < 3) {
    currentChapter = `${archetype} Explores the Path`
  } else if (monthsTracked < 6) {
    currentChapter = `${archetype} Faces the Struggle`
  } else if (monthsTracked < 12) {
    currentChapter = `${archetype} Finds Breakthrough`
  } else {
    currentChapter = `${archetype} Integrates Wisdom`
  }

  // Generate story arc
  let storyArc = ''

  if (monthsTracked === 0) {
    storyArc = `You have just begun. The path ahead is unknown, but you've taken the first step. Each choice you make, each moment of awareness, is part of becoming.`
  } else if (primaryGoal) {
    const goalProgress = primaryGoal.progressMarkers.length > 0
      ? `You're making progress - ${primaryGoal.progressMarkers[primaryGoal.progressMarkers.length - 1].description.toLowerCase()}.`
      : `You're working on ${primaryGoal.title.toLowerCase()}.`

    if (achievedGoals.length > 0) {
      storyArc = `Over ${monthsTracked} ${monthsTracked === 1 ? 'month' : 'months'}, you've achieved ${achievedGoals.length} ${achievedGoals.length === 1 ? 'goal' : 'goals'}: ${achievedGoals.map(g => g.title.toLowerCase()).join(', ')}. Now ${goalProgress} This journey continues to unfold.`
    } else {
      storyArc = `For ${monthsTracked} ${monthsTracked === 1 ? 'month' : 'months'}, you've been ${primaryGoal.title.toLowerCase()}. ${goalProgress} The path isn't always straight, but you're walking it.`
    }
  } else {
    storyArc = `Over ${monthsTracked} months, you've been exploring yourself through this practice. ${goals.length} distinct areas of growth have emerged. You're learning your own patterns, building awareness, becoming.`
  }

  // Suggest next milestone
  let nextMilestone = ''
  if (primaryGoal) {
    if (primaryGoal.journeyStage === 'beginning') {
      nextMilestone = `Continue ${primaryGoal.title.toLowerCase()} for 30 days to build momentum`
    } else if (primaryGoal.journeyStage === 'struggle') {
      nextMilestone = `Persist through the resistance. Breakthrough is near.`
    } else if (primaryGoal.journeyStage === 'breakthrough') {
      nextMilestone = `Deepen the practice. Integration awaits.`
    } else {
      nextMilestone = `Embody what you've learned. This wisdom is now part of you.`
    }
  } else {
    nextMilestone = `Set a clear intention for the month ahead`
  }

  return {
    currentChapter,
    storyArc,
    nextMilestone
  }
}
