import type { Log } from '#shared/types'
import type { TraitExtractionResult, PsychologicalDepth } from './types.js'

/**
 * Extract user traits from their answer logs for cohort analysis
 * Analyzes both behavioral patterns AND psychological/emotional dimensions
 */
export function extractUserTraits(logs: Log[]): TraitExtractionResult {
  const answerLogs = logs.filter((log) => log.event === 'answer')
  const noteLogs = logs.filter((log) => log.event === 'note' && log.text && log.text.length > 20)

  if (answerLogs.length === 0) {
    return {
      traits: [],
      patterns: {},
      psychologicalDepth: {
        emotionalPatterns: [],
        values: [],
        selfAwareness: 0,
        emotionalRange: 0,
        reflectionQuality: 0,
        growthTrajectory: 'emerging',
        dominantNeeds: [],
        journalSentiment: { positive: 0, neutral: 0, challenging: 0 }
      }
    }
  }

  // Behavioral patterns (surface level)
  const patterns: { [key: string]: number } = {
    healthConscious: 0,    // salads, fresh, organic, wellness
    comfortSeeker: 0,      // warm, cozy, comfort, relaxing
    timeConscious: 0,      // quick, efficient, fast, easy
    plantBased: 0,         // vegetarian, vegan, plant-based
    proteinFocused: 0,     // meat, protein, eggs, chicken
    warmPreference: 0,     // hot, warm, tea, soup
    coldPreference: 0,     // cold, iced, chilled, fresh
    traditional: 0,        // classic, traditional, familiar
    adventurous: 0,        // new, try, different, variety
    mindful: 0,            // mindful, aware, intentional, present
  }

  // Psychological patterns (deep level)
  const psychPatterns: { [key: string]: number } = {
    reflective: 0,         // think, reflect, consider, ponder, wonder
    emotionallyAware: 0,   // feel, emotion, mood, sense, notice
    growthOriented: 0,     // learn, grow, improve, develop, evolve
    connectionSeeking: 0,  // together, connection, share, community, relate
    autonomyDriven: 0,     // independent, alone, self, own, personal
    anxietyPresent: 0,     // worry, stress, anxious, overwhelm, pressure
    peaceSeeking: 0,       // calm, peace, quiet, stillness, gentle
    achievement: 0,        // accomplish, succeed, achieve, goal, productive
    creative: 0,           // create, express, art, imagine, design
    grounded: 0,           // stable, steady, routine, consistent, reliable
  }

  // Value indicators (soul level)
  const valuePatterns: { [key: string]: number } = {
    authenticity: 0,       // real, authentic, genuine, true, honest
    harmony: 0,            // balance, harmony, equilibrium, centered
    freedom: 0,            // free, choice, open, flexible, spontaneous
    security: 0,           // safe, secure, protected, stable, certain
    growth: 0,             // grow, expand, develop, evolve, transform
    connection: 0,         // love, connect, belong, together, bond
    meaning: 0,            // purpose, meaning, why, matter, significance
    beauty: 0,             // beautiful, aesthetic, lovely, pleasing, elegant
    simplicity: 0,         // simple, minimal, essential, clear, pure
    vitality: 0,           // energy, alive, vibrant, dynamic, zest
  }

  // Keywords for behavioral traits
  const keywords = {
    healthConscious: ['salad', 'fresh', 'organic', 'healthy', 'wellness', 'nutritious', 'greens', 'vegetables'],
    comfortSeeker: ['warm', 'cozy', 'comfort', 'relax', 'soft', 'gentle', 'soothing', 'calm'],
    timeConscious: ['quick', 'fast', 'efficient', 'easy', 'simple', 'convenient', 'busy', 'short'],
    plantBased: ['vegetarian', 'vegan', 'plant', 'vegetables', 'beans', 'lentils', 'tofu'],
    proteinFocused: ['meat', 'protein', 'chicken', 'beef', 'fish', 'eggs', 'salmon'],
    warmPreference: ['hot', 'warm', 'tea', 'soup', 'heated', 'steaming', 'cooked'],
    coldPreference: ['cold', 'iced', 'chilled', 'cool', 'refrigerated', 'raw'],
    traditional: ['classic', 'traditional', 'familiar', 'usual', 'regular', 'standard'],
    adventurous: ['new', 'try', 'different', 'variety', 'explore', 'experiment', 'unique'],
    mindful: ['mindful', 'aware', 'intentional', 'present', 'conscious', 'deliberate'],
  }

  // Keywords for psychological patterns
  const psychKeywords = {
    reflective: ['think', 'reflect', 'consider', 'ponder', 'wonder', 'contemplate', 'realize', 'understand'],
    emotionallyAware: ['feel', 'feeling', 'emotion', 'mood', 'sense', 'notice', 'aware', 'experience'],
    growthOriented: ['learn', 'grow', 'improve', 'develop', 'evolve', 'better', 'progress', 'change'],
    connectionSeeking: ['together', 'connection', 'share', 'community', 'relate', 'friend', 'people', 'social'],
    autonomyDriven: ['independent', 'alone', 'self', 'own', 'personal', 'individual', 'myself', 'solo'],
    anxietyPresent: ['worry', 'stress', 'anxious', 'overwhelm', 'pressure', 'tense', 'nervous', 'uncertain'],
    peaceSeeking: ['calm', 'peace', 'peaceful', 'quiet', 'stillness', 'gentle', 'serene', 'tranquil'],
    achievement: ['accomplish', 'succeed', 'achieve', 'goal', 'productive', 'finish', 'complete', 'done'],
    creative: ['create', 'creative', 'express', 'art', 'imagine', 'design', 'craft', 'make'],
    grounded: ['stable', 'steady', 'routine', 'consistent', 'reliable', 'regular', 'predictable', 'grounded'],
  }

  // Keywords for values
  const valueKeywords = {
    authenticity: ['real', 'authentic', 'genuine', 'true', 'honest', 'sincere', 'actual', 'myself'],
    harmony: ['balance', 'balanced', 'harmony', 'harmonious', 'equilibrium', 'centered', 'middle', 'moderate'],
    freedom: ['free', 'freedom', 'choice', 'open', 'flexible', 'spontaneous', 'liberated', 'unrestricted'],
    security: ['safe', 'safety', 'secure', 'protected', 'stable', 'certain', 'sure', 'comfort'],
    growth: ['grow', 'growth', 'expand', 'develop', 'evolve', 'transform', 'become', 'potential'],
    connection: ['love', 'loving', 'connect', 'connection', 'belong', 'together', 'bond', 'relationship'],
    meaning: ['purpose', 'purposeful', 'meaning', 'meaningful', 'why', 'matter', 'significance', 'important'],
    beauty: ['beautiful', 'beauty', 'aesthetic', 'lovely', 'pleasing', 'elegant', 'graceful', 'pretty'],
    simplicity: ['simple', 'simplicity', 'minimal', 'essential', 'clear', 'pure', 'basic', 'uncomplicated'],
    vitality: ['energy', 'energetic', 'alive', 'vibrant', 'dynamic', 'zest', 'vigorous', 'lively'],
  }

  // Combine all text from answers AND notes for deeper analysis
  const allText = [
    ...answerLogs.map(log => `${log.metadata.question || ''} ${log.metadata.answer || ''}`),
    ...noteLogs.map(log => log.text || '')
  ].join(' ').toLowerCase()

  // Count behavioral matches in answers only
  answerLogs.forEach((log) => {
    const answer = (log.metadata.answer || '').toLowerCase()
    const question = (log.metadata.question || '').toLowerCase()
    const combinedText = `${question} ${answer}`

    Object.entries(keywords).forEach(([trait, words]) => {
      words.forEach((word) => {
        if (combinedText.includes(word)) {
          patterns[trait]++
        }
      })
    })
  })

  // Count psychological patterns across ALL logs (answers + notes)
  Object.entries(psychKeywords).forEach(([trait, words]) => {
    words.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi')
      const matches = allText.match(regex)
      if (matches) {
        psychPatterns[trait] += matches.length
      }
    })
  })

  // Count value indicators across ALL logs
  Object.entries(valueKeywords).forEach(([value, words]) => {
    words.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi')
      const matches = allText.match(regex)
      if (matches) {
        valuePatterns[value] += matches.length
      }
    })
  })

  // Calculate self-awareness score (0-100) for long-term growth tracking
  // This becomes 0-10% when divided by 10 in the frontend
  // Growth is gradual with decimal precision (e.g., 2.3%, 5.7%)
  const reflectiveScore = psychPatterns.reflective + psychPatterns.emotionallyAware
  const totalLogs = answerLogs.length + noteLogs.length

  // Components of awareness (each contributes to 0-100 scale):
  // 1. Volume of engagement (0-40 points): More interactions = deeper self-knowledge
  const volumeScore = Math.min(40, Math.sqrt(totalLogs) * 4) // Logarithmic growth

  // 2. Reflective quality (0-30 points): Ratio of reflective content
  const reflectiveRatio = reflectiveScore / Math.max(1, totalLogs)
  const qualityScore = reflectiveRatio * 30

  // 3. Consistency bonus (0-15 points): Regular engagement over time
  const daysSinceStart = logs.length > 0
    ? Math.floor((Date.now() - new Date(logs[logs.length - 1].createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const consistencyScore = Math.min(15, (totalLogs / Math.max(1, daysSinceStart)) * 100)

  // 4. Depth bonus (0-15 points): Long-form journaling and emotional check-ins
  const journalEntries = noteLogs.filter(log => log.text && log.text.length > 100).length
  const depthScore = Math.min(15, journalEntries * 1.5)

  // Combine all components (max 100)
  const rawScore = volumeScore + qualityScore + consistencyScore + depthScore

  // Return as 0-100 with 1 decimal precision (frontend will divide by 10 for %)
  const selfAwareness = Math.min(100, Number(rawScore.toFixed(1)))

  // Extract top behavioral traits (2+ matches required)
  const traits: string[] = Object.entries(patterns)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 4)
    .map(([trait, _]) => trait)

  // Extract top psychological patterns (3+ matches for significance)
  const emotionalPatterns: string[] = Object.entries(psychPatterns)
    .filter(([_, count]) => count >= 3)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([pattern, _]) => pattern)

  // Extract top values (2+ matches for significance)
  const values: string[] = Object.entries(valuePatterns)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([value, _]) => value)

  // ============================================================================
  // ENHANCED PSYCHOLOGICAL DEPTH METRICS
  // ============================================================================

  // 1. Emotional Range (0-10): Diversity of emotions expressed
  const uniqueEmotionKeywords = [
    'happy', 'sad', 'angry', 'anxious', 'peaceful', 'excited', 'frustrated',
    'grateful', 'overwhelmed', 'calm', 'energized', 'tired', 'hopeful',
    'worried', 'content', 'restless', 'joyful', 'fearful', 'confident', 'uncertain'
  ]
  const emotionsFound = uniqueEmotionKeywords.filter(emotion =>
    allText.includes(emotion)
  ).length
  const emotionalRange = Math.min(10, Math.round((emotionsFound / uniqueEmotionKeywords.length) * 10))

  // 2. Reflection Quality (0-10): Depth of introspection beyond surface word count
  const deepReflectionKeywords = [
    'realize', 'understand', 'discover', 'learn', 'notice', 'recognize',
    'aware', 'insight', 'reflection', 'wonder', 'question', 'explore',
    'meaning', 'purpose', 'truth', 'authentic', 'becoming', 'transform'
  ]
  const deepReflectionMatches = deepReflectionKeywords.filter(word =>
    allText.includes(word)
  ).length
  const avgJournalLength = noteLogs.length > 0
    ? noteLogs.reduce((sum, log) => sum + (log.text?.length || 0), 0) / noteLogs.length
    : 0
  const journalDepthBonus = avgJournalLength > 200 ? 2 : avgJournalLength > 100 ? 1 : 0
  const reflectionQuality = Math.min(10, deepReflectionMatches + journalDepthBonus)

  // 3. Growth Trajectory: Stage of self-discovery journey
  let growthTrajectory: 'emerging' | 'developing' | 'deepening' | 'integrated'
  const journeyDepth = answerLogs.length + (noteLogs.length * 2) // Notes count double
  if (journeyDepth < 10) {
    growthTrajectory = 'emerging'
  } else if (journeyDepth < 30) {
    growthTrajectory = 'developing'
  } else if (journeyDepth < 60) {
    growthTrajectory = 'deepening'
  } else {
    growthTrajectory = 'integrated'
  }

  // 4. Dominant Needs: Identify core psychological needs
  const needsKeywords = {
    security: ['safe', 'secure', 'stable', 'certain', 'predictable', 'reliable', 'grounded'],
    connection: ['connect', 'together', 'belong', 'relationship', 'love', 'friend', 'community'],
    growth: ['grow', 'learn', 'develop', 'improve', 'evolve', 'transform', 'change'],
    autonomy: ['independent', 'freedom', 'choice', 'own', 'self', 'control', 'decide'],
    meaning: ['purpose', 'meaning', 'matter', 'significance', 'why', 'value', 'important'],
    expression: ['creative', 'express', 'create', 'art', 'voice', 'authentic', 'unique']
  }
  const needCounts: { [key: string]: number } = {}
  Object.entries(needsKeywords).forEach(([need, keywords]) => {
    needCounts[need] = keywords.filter(word => allText.includes(word)).length
  })
  const dominantNeeds = Object.entries(needCounts)
    .filter(([_, count]) => count >= 2)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3)
    .map(([need, _]) => need)

  // 5. Journal Sentiment: Emotional tone analysis
  const positiveKeywords = [
    'grateful', 'happy', 'joy', 'love', 'peace', 'calm', 'content', 'hopeful',
    'excited', 'wonderful', 'beautiful', 'amazing', 'good', 'great', 'blessed'
  ]
  const challengingKeywords = [
    'difficult', 'hard', 'struggle', 'worry', 'stress', 'anxious', 'overwhelm',
    'tired', 'exhaust', 'frustrat', 'sad', 'angry', 'fear', 'pain', 'hurt'
  ]

  let positiveCount = 0
  let challengingCount = 0
  let totalSentimentWords = 0

  noteLogs.forEach(log => {
    const text = (log.text || '').toLowerCase()
    positiveKeywords.forEach(word => {
      if (text.includes(word)) {
        positiveCount++
        totalSentimentWords++
      }
    })
    challengingKeywords.forEach(word => {
      if (text.includes(word)) {
        challengingCount++
        totalSentimentWords++
      }
    })
  })

  const neutralCount = Math.max(0, noteLogs.length - (positiveCount + challengingCount))
  const totalForPercentage = Math.max(1, positiveCount + challengingCount + neutralCount)

  const journalSentiment = {
    positive: Math.round((positiveCount / totalForPercentage) * 100),
    neutral: Math.round((neutralCount / totalForPercentage) * 100),
    challenging: Math.round((challengingCount / totalForPercentage) * 100)
  }

  return {
    traits,
    patterns,
    psychologicalDepth: {
      emotionalPatterns,
      values,
      selfAwareness,
      emotionalRange,
      reflectionQuality,
      growthTrajectory,
      dominantNeeds,
      journalSentiment
    }
  }
}
