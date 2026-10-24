/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import type { Log } from '#shared/types'
import type { TraitExtractionResult, PsychologicalDepth, CorrelatedIndexSnapshot, TraumaIndicatorProfile } from './types.js'

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

/**
 * Calculate correlated indexes from logs and engagement data.
 *
 * Four dimensions measured on the same 0-100 scale:
 * - selfAwareness: Already calculated in extractUserTraits (journal reflection depth)
 * - userScore: Platform engagement & system usage breadth
 * - personScore: Psychological richness & human depth
 * - longevityScore: Sustained commitment over time
 */
export function calculateCorrelatedIndexes(
  logs: Log[],
  meta: {
    daysSinceStart: number
    streak: number
    answerCount: number
    logCount: number
  }
): CorrelatedIndexSnapshot {
  const analysis = extractUserTraits(logs)
  const { psychologicalDepth, patterns } = analysis

  // Self-awareness: use existing calculation directly
  const selfAwareness = psychologicalDepth.selfAwareness

  // ─── User Score (0-100) ──────────────────────────────────────────────
  // Measures how actively and broadly the user engages with the platform
  //
  // Components:
  //   Activity volume (0-30): Total interactions (answers + logs)
  //   Widget diversity (0-25): How many different event types are used
  //   Engagement rate (0-25): Interactions per day
  //   Data richness (0-20): Notes with meaningful content
  const totalInteractions = meta.answerCount + meta.logCount
  const activityVolume = Math.min(30, Math.sqrt(totalInteractions) * 3)

  const eventTypes = new Set(logs.map(l => l.event))
  const widgetDiversity = Math.min(25, (eventTypes.size / 6) * 25)

  const engagementRate = meta.daysSinceStart > 0
    ? Math.min(25, (totalInteractions / meta.daysSinceStart) * 25)
    : 0

  const meaningfulNotes = logs.filter(l => l.event === 'note' && l.text && l.text.length > 50).length
  const dataRichness = Math.min(20, Math.sqrt(meaningfulNotes) * 5)

  const userScore = Math.min(100, Number((activityVolume + widgetDiversity + engagementRate + dataRichness).toFixed(1)))

  // ─── Person Score (0-100) ────────────────────────────────────────────
  // Measures psychological richness — how much of the person has been revealed
  //
  // Components:
  //   Emotional range (0-25): Diversity of emotions expressed (from 0-10 scale)
  //   Reflection quality (0-25): Depth of introspection (from 0-10 scale)
  //   Value expression (0-25): How many distinct values surfaced
  //   Pattern depth (0-25): Total strength of behavioral patterns
  const emotionalRangeScore = (psychologicalDepth.emotionalRange / 10) * 25
  const reflectionScore = (psychologicalDepth.reflectionQuality / 10) * 25

  const valueCount = psychologicalDepth.values.length + psychologicalDepth.dominantNeeds.length
  const valueExpression = Math.min(25, (valueCount / 6) * 25)

  const totalPatternHits = Object.values(patterns).reduce((sum, count) => sum + count, 0)
  const patternDepth = Math.min(25, Math.sqrt(totalPatternHits) * 4)

  const personScore = Math.min(100, Number((emotionalRangeScore + reflectionScore + valueExpression + patternDepth).toFixed(1)))

  // ─── Longevity Score (0-100) ─────────────────────────────────────────
  // Measures sustained commitment over time — not just showing up, but staying
  //
  // Components:
  //   Tenure (0-30): Days since first activity (logarithmic — early days count more)
  //   Streak strength (0-30): Current consecutive day streak
  //   Consistency (0-20): Ratio of active days to total days
  //   Maturity (0-20): Growth trajectory stage bonus
  const tenure = Math.min(30, Math.log2(Math.max(1, meta.daysSinceStart)) * 5)
  const streakStrength = Math.min(30, Math.sqrt(meta.streak) * 6)

  const activeDayEstimate = Math.min(meta.daysSinceStart, totalInteractions)
  const consistencyRatio = meta.daysSinceStart > 0
    ? Math.min(20, (activeDayEstimate / meta.daysSinceStart) * 20)
    : 0

  const maturityBonus =
    psychologicalDepth.growthTrajectory === 'integrated' ? 20 :
    psychologicalDepth.growthTrajectory === 'deepening' ? 14 :
    psychologicalDepth.growthTrajectory === 'developing' ? 8 : 3

  const longevityScore = Math.min(100, Number((tenure + streakStrength + consistencyRatio + maturityBonus).toFixed(1)))

  // ─── Composite (weighted average) ────────────────────────────────────
  // Equal weight: each dimension matters equally
  const composite = Number(((selfAwareness + userScore + personScore + longevityScore) / 4).toFixed(1))

  return { selfAwareness, userScore, personScore, longevityScore, composite }
}

/**
 * PTSD/C-PTSD Trauma Indicator Detection
 *
 * Based on:
 * - PCL-5 (PTSD Checklist for DSM-5) — 4 symptom clusters
 * - ICD-11 C-PTSD criteria — 3 additional disturbance-in-self-organization domains
 * - ACE (Adverse Childhood Experiences) — childhood trauma indicators
 * - VA behavioral marker research — daily life impact patterns
 *
 * This is NOT a diagnostic tool. It detects behavioral language patterns
 * that may indicate trauma exposure, to guide the Memory engine toward
 * supportive, trauma-informed questioning.
 *
 * Civilian trauma sources detected: abandonment, divorce, job loss, grief,
 * abuse, neglect, domestic violence, accident, illness, displacement.
 */
export function detectTraumaIndicators(logs: Log[]): TraumaIndicatorProfile {
  const answerLogs = logs.filter(l => l.event === 'answer' || l.event === 'medical_record')
  const noteLogs = logs.filter(l => l.event === 'note' && l.text && l.text.length > 20)
  const checkinLogs = logs.filter(l => l.event === 'emotional_checkin')

  if (answerLogs.length < 3 && noteLogs.length < 2) {
    return {
      score: 0,
      clusters: { hyperarousal: 0, avoidance: 0, negativeAlterations: 0, reExperiencing: 0 },
      cptsdIndicators: { affectDysregulation: 0, negativeSelfConcept: 0, interpersonalDifficulty: 0 },
      eatingDisorder: { restriction: 0, bingeing: 0, purging: 0, bodyDissatisfaction: 0, foodAnxiety: 0, recoverySignals: 0 },
      possibleSources: [],
      trajectory: 'unknown',
      recoveryIndicators: [],
      riskLevel: 'none',
    }
  }

  const allText = [
    ...answerLogs.map(l => `${l.metadata.question || ''} ${l.metadata.answer || ''}`),
    ...noteLogs.map(l => l.text || ''),
    ...checkinLogs.map(l => `${l.metadata.mood || ''} ${l.metadata.state || ''} ${l.text || ''}`),
  ].join(' ').toLowerCase()

  // ─── PCL-5 CLUSTER B: Re-experiencing ─────────────────────────────────
  const reExperiencingKeywords = [
    'nightmare', 'nightmares', 'flashback', 'flashbacks', 'intrusive',
    'can\'t stop thinking', 'keeps coming back', 'haunted', 'reliving',
    'triggered', 'reminder', 'sudden memory', 'out of nowhere',
    'dream about', 'wake up scared', 'feels like it\'s happening again',
  ]

  // ─── PCL-5 CLUSTER C: Avoidance ───────────────────────────────────────
  const avoidanceKeywords = [
    'avoid', 'avoiding', 'can\'t face', 'don\'t want to think about',
    'push away', 'numb', 'shut down', 'withdrawn', 'isolate', 'isolation',
    'hide', 'hiding', 'don\'t go there', 'stay away', 'can\'t talk about',
    'block it out', 'pretend', 'distract myself', 'don\'t want to feel',
  ]

  // ─── PCL-5 CLUSTER D: Negative alterations in cognition/mood ──────────
  const negativeAlterationsKeywords = [
    'worthless', 'hopeless', 'broken', 'damaged', 'nothing matters',
    'can\'t trust', 'don\'t trust', 'blame myself', 'my fault',
    'no one understands', 'empty', 'hollow', 'detached', 'numb',
    'lost interest', 'don\'t enjoy', 'nothing feels good', 'pointless',
    'what\'s the point', 'doesn\'t matter', 'never get better',
    'guilt', 'guilty', 'shame', 'ashamed', 'deserve',
  ]

  // ─── PCL-5 CLUSTER E: Hyperarousal ────────────────────────────────────
  const hyperarousalKeywords = [
    'can\'t sleep', 'insomnia', 'startle', 'jumpy', 'on edge',
    'hypervigilant', 'watching', 'alert', 'angry', 'rage', 'irritable',
    'explosive', 'snapped', 'restless', 'can\'t relax', 'tense',
    'racing thoughts', 'racing heart', 'panic', 'anxious all the time',
    'always tired', 'exhausted', 'wired', 'can\'t concentrate',
  ]

  // ─── ICD-11 C-PTSD: Affect Dysregulation ──────────────────────────────
  const affectDysregulationKeywords = [
    'out of control', 'can\'t control', 'overwhelmed', 'meltdown',
    'emotional outburst', 'crying for no reason', 'sudden anger',
    'mood swings', 'unpredictable', 'erupted', 'lost control',
    'can\'t calm down', 'spiraling', 'dissociate', 'dissociation',
    'shut down completely', 'frozen', 'went blank', 'checked out',
  ]

  // ─── ICD-11 C-PTSD: Negative Self-Concept ─────────────────────────────
  const negativeSelfConceptKeywords = [
    'i\'m broken', 'i\'m damaged', 'something wrong with me', 'unlovable',
    'defective', 'i deserve this', 'my fault', 'i\'m the problem',
    'never good enough', 'failure', 'i ruin everything', 'toxic',
    'burden', 'i\'m a burden', 'they\'d be better without me',
    'permanently changed', 'not who i used to be', 'lost myself',
  ]

  // ─── ICD-11 C-PTSD: Interpersonal Difficulties ────────────────────────
  const interpersonalDifficultyKeywords = [
    'can\'t trust anyone', 'everyone leaves', 'abandoned', 'abandonment',
    'push people away', 'alone', 'isolated', 'no real friends',
    'relationships fail', 'scared of getting close', 'betrayed',
    'used', 'manipulated', 'afraid of being hurt', 'don\'t let people in',
    'walls up', 'guard up', 'can\'t connect', 'feel disconnected',
  ]

  // ─── Eating Disorder Detection (PTSD-comorbid) ─────────────────────────
  const restrictionKeywords = [
    'skip meals', 'skipping meals', 'don\'t eat', 'not eating', 'restrict',
    'restricting', 'fast', 'fasting', 'calories', 'counting calories',
    'afraid to eat', 'fear of food', 'won\'t eat', 'barely eat', 'starving',
    'thin enough', 'too much food', 'eat less', 'cutting food', 'food rules',
  ]
  const bingeingKeywords = [
    'binge', 'bingeing', 'can\'t stop eating', 'ate too much', 'lost control',
    'overate', 'overeating', 'stuffed', 'eat everything', 'emotional eating',
    'comfort eating', 'eat my feelings', 'food is my comfort', 'eat when stressed',
    'secret eating', 'hide food', 'eat alone', 'shame about eating',
  ]
  const purgingKeywords = [
    'purge', 'purging', 'throw up', 'vomit', 'make myself sick',
    'laxative', 'exercise to burn', 'compensate', 'undo eating',
    'over-exercise', 'excessive exercise', 'punish myself for eating',
  ]
  const bodyDissatisfactionKeywords = [
    'hate my body', 'body image', 'fat', 'too big', 'too small', 'ugly',
    'disgusting', 'mirror', 'avoid mirrors', 'weigh myself', 'scale',
    'weight', 'don\'t like how i look', 'body dysmorphia', 'wish i looked',
    'body shame', 'comparing my body', 'not thin enough', 'body checking',
  ]
  const foodAnxietyKeywords = [
    'anxious about food', 'food anxiety', 'scared to eat', 'meal stress',
    'dread eating', 'panic at meals', 'can\'t eat around people',
    'nervous about food', 'safe foods', 'fear of gaining', 'afraid of weight',
    'obsess about food', 'food obsession', 'think about food all the time',
  ]
  const nutritionRecoveryKeywords = [
    'nourish', 'nourishing', 'fuel my body', 'regular meals', 'balanced meal',
    'enjoying food', 'food is fuel', 'healthy relationship with food',
    'eat when hungry', 'intuitive eating', 'body acceptance', 'body kindness',
    'feeding myself', 'three meals', 'nutrition', 'grateful for food',
  ]

  // ─── Trauma Source Detection ───────────────────────────────────────────
  const traumaSourceKeywords: Record<string, string[]> = {
    'childhood adversity': ['childhood', 'growing up', 'parents', 'parent', 'raised', 'abused', 'neglected', 'foster', 'orphan'],
    'abandonment': ['abandoned', 'left me', 'walked out', 'left behind', 'rejected', 'unwanted', 'alone as a child'],
    'divorce or separation': ['divorce', 'divorced', 'separated', 'custody', 'split up', 'marriage ended', 'ex-partner', 'ex-wife', 'ex-husband'],
    'job loss or financial': ['fired', 'laid off', 'lost my job', 'bankrupt', 'debt', 'homeless', 'can\'t afford', 'financial ruin'],
    'grief or loss': ['died', 'death', 'lost someone', 'funeral', 'grief', 'grieving', 'passed away', 'gone forever'],
    'domestic violence': ['hit me', 'abusive', 'domestic', 'violent partner', 'controlled me', 'trapped', 'escape'],
    'accident or injury': ['accident', 'crash', 'injured', 'hospital', 'surgery', 'almost died', 'near death'],
    'military or combat': ['combat', 'deployment', 'war', 'military', 'service', 'veteran', 'active duty', 'firefight'],
    'sexual trauma': ['assault', 'violated', 'rape', 'molested', 'coerced', 'inappropriate', 'boundary crossed'],
    'displacement': ['refugee', 'displaced', 'lost home', 'moved constantly', 'nowhere to go', 'uprooted', 'immigration'],
    'eating disorder': ['anorexia', 'bulimia', 'eating disorder', 'binge eating', 'purging', 'restriction', 'body dysmorphia', 'disordered eating'],
  }

  // ─── Recovery Indicators ───────────────────────────────────────────────
  const recoveryKeywords: Record<string, string[]> = {
    'therapy engagement': ['therapy', 'therapist', 'counseling', 'counselor', 'session', 'treatment', 'processing'],
    'self-awareness growing': ['realize', 'understand now', 'learning', 'healing', 'recovery', 'getting better', 'progress'],
    'social reconnection': ['reconnecting', 'opened up', 'support group', 'trusted someone', 'let someone in', 'community'],
    'routine stabilization': ['routine', 'structure', 'consistent', 'stable', 'predictable', 'safe space', 'grounded'],
    'emotional regulation': ['breathing', 'meditation', 'grounding', 'coping', 'regulate', 'managing', 'tools'],
    'meaning-making': ['purpose', 'meaning', 'growth', 'stronger', 'survived', 'resilient', 'learned from'],
    'nutrition recovery': ['nourish', 'regular meals', 'balanced meal', 'intuitive eating', 'body acceptance', 'healthy relationship with food', 'fuel my body'],
  }

  // ─── Count matches ─────────────────────────────────────────────────────
  function countMatches(text: string, keywords: string[]): number {
    return keywords.filter(kw => text.includes(kw)).length
  }

  const reExperiencing = countMatches(allText, reExperiencingKeywords)
  const avoidance = countMatches(allText, avoidanceKeywords)
  const negativeAlterations = countMatches(allText, negativeAlterationsKeywords)
  const hyperarousal = countMatches(allText, hyperarousalKeywords)

  const affectDysregulation = countMatches(allText, affectDysregulationKeywords)
  const negativeSelfConcept = countMatches(allText, negativeSelfConceptKeywords)
  const interpersonalDifficulty = countMatches(allText, interpersonalDifficultyKeywords)

  const restriction = countMatches(allText, restrictionKeywords)
  const bingeing = countMatches(allText, bingeingKeywords)
  const purging = countMatches(allText, purgingKeywords)
  const bodyDissatisfaction = countMatches(allText, bodyDissatisfactionKeywords)
  const foodAnxiety = countMatches(allText, foodAnxietyKeywords)
  const nutritionRecovery = countMatches(allText, nutritionRecoveryKeywords)

  // Normalize cluster scores to 0-100
  const maxPerCluster = 8
  const clusters = {
    hyperarousal: Math.min(100, Math.round((hyperarousal / maxPerCluster) * 100)),
    avoidance: Math.min(100, Math.round((avoidance / maxPerCluster) * 100)),
    negativeAlterations: Math.min(100, Math.round((negativeAlterations / maxPerCluster) * 100)),
    reExperiencing: Math.min(100, Math.round((reExperiencing / maxPerCluster) * 100)),
  }

  const cptsdIndicators = {
    affectDysregulation: Math.min(100, Math.round((affectDysregulation / 6) * 100)),
    negativeSelfConcept: Math.min(100, Math.round((negativeSelfConcept / 6) * 100)),
    interpersonalDifficulty: Math.min(100, Math.round((interpersonalDifficulty / 6) * 100)),
  }

  // Detect possible sources
  const possibleSources: string[] = []
  Object.entries(traumaSourceKeywords).forEach(([source, keywords]) => {
    if (countMatches(allText, keywords) >= 2) {
      possibleSources.push(source)
    }
  })

  // Detect recovery indicators
  const recoveryIndicators: string[] = []
  Object.entries(recoveryKeywords).forEach(([indicator, keywords]) => {
    if (countMatches(allText, keywords) >= 2) {
      recoveryIndicators.push(indicator)
    }
  })

  const edMaxPerDim = 6
  const eatingDisorder = {
    restriction: Math.min(100, Math.round((restriction / edMaxPerDim) * 100)),
    bingeing: Math.min(100, Math.round((bingeing / edMaxPerDim) * 100)),
    purging: Math.min(100, Math.round((purging / edMaxPerDim) * 100)),
    bodyDissatisfaction: Math.min(100, Math.round((bodyDissatisfaction / edMaxPerDim) * 100)),
    foodAnxiety: Math.min(100, Math.round((foodAnxiety / edMaxPerDim) * 100)),
    recoverySignals: Math.min(100, Math.round((nutritionRecovery / edMaxPerDim) * 100)),
  }

  // Composite score (weighted: clusters + C-PTSD + eating disorder indicators)
  const clusterAvg = (clusters.hyperarousal + clusters.avoidance + clusters.negativeAlterations + clusters.reExperiencing) / 4
  const cptsdAvg = (cptsdIndicators.affectDysregulation + cptsdIndicators.negativeSelfConcept + cptsdIndicators.interpersonalDifficulty) / 3
  const edAvg = (eatingDisorder.restriction + eatingDisorder.bingeing + eatingDisorder.purging + eatingDisorder.bodyDissatisfaction + eatingDisorder.foodAnxiety) / 5
  const score = Math.round(clusterAvg * 0.5 + cptsdAvg * 0.3 + edAvg * 0.2)

  // Determine trajectory from mood check-in patterns over time
  let trajectory: TraumaIndicatorProfile['trajectory'] = 'unknown'
  if (checkinLogs.length >= 5) {
    const recentMoods = checkinLogs.slice(0, 5).map(l => (l.metadata.mood || l.metadata.state || '').toString().toLowerCase())
    const olderMoods = checkinLogs.slice(5, 10).map(l => (l.metadata.mood || l.metadata.state || '').toString().toLowerCase())
    const negativeMoods = ['anxious', 'overwhelmed', 'exhausted', 'restless', 'uncertain', 'tired', 'numb', 'detached']
    const recentNeg = recentMoods.filter(m => negativeMoods.some(nm => m.includes(nm))).length
    const olderNeg = olderMoods.length > 0 ? olderMoods.filter(m => negativeMoods.some(nm => m.includes(nm))).length : recentNeg
    if (recentNeg < olderNeg) trajectory = 'improving'
    else if (recentNeg > olderNeg) trajectory = 'declining'
    else if (score > 20) trajectory = 'stable'
    else trajectory = 'stable'
  } else if (score > 15) {
    trajectory = 'emerging'
  }

  // Risk level determination
  let riskLevel: TraumaIndicatorProfile['riskLevel'] = 'none'
  if (score >= 60) riskLevel = 'elevated'
  else if (score >= 35) riskLevel = 'moderate'
  else if (score >= 15) riskLevel = 'low'

  return {
    score,
    clusters,
    cptsdIndicators,
    eatingDisorder,
    possibleSources,
    trajectory,
    recoveryIndicators,
    riskLevel,
  }
}
