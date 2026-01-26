import type { CohortClassification, PsychologicalDepth } from './types.js'

/**
 * Determine user cohort based on psychological depth and behavioral patterns
 * Returns both a psychological archetype and a behavioral cohort
 */
export function determineUserCohort(
  traits: string[],
  patterns: { [key: string]: number },
  psychologicalDepth?: PsychologicalDepth
): CohortClassification {

  // Determine psychological archetype (soul-level understanding)
  let archetype = 'The Explorer'
  let archetypeDescription = ''

  if (psychologicalDepth) {
    const { emotionalPatterns, values, selfAwareness } = psychologicalDepth

    // High self-awareness + growth + reflective = The Seeker
    if (selfAwareness >= 6 && emotionalPatterns.includes('growthOriented') && emotionalPatterns.includes('reflective')) {
      archetype = 'The Seeker'
      archetypeDescription = 'Growth-oriented soul on a journey of self-discovery. Deeply reflective, constantly evolving, values transformation.'
    }
    // Connection + emotionally aware + peace = The Nurturer
    else if (emotionalPatterns.includes('connectionSeeking') && emotionalPatterns.includes('emotionallyAware') && values.includes('connection')) {
      archetype = 'The Nurturer'
      archetypeDescription = 'Relationship-centered soul who finds meaning in caring for others. Emotionally attuned, values deep connection.'
    }
    // Achievement + grounded + autonomy = The Achiever
    else if (emotionalPatterns.includes('achievement') && emotionalPatterns.includes('grounded') && values.includes('growth')) {
      archetype = 'The Achiever'
      archetypeDescription = 'Purpose-driven soul focused on accomplishment and personal excellence. Structured, goal-oriented, values progress.'
    }
    // Reflective + meaning + high self-awareness = The Philosopher
    else if (emotionalPatterns.includes('reflective') && values.includes('meaning') && selfAwareness >= 7) {
      archetype = 'The Philosopher'
      archetypeDescription = 'Meaning-seeking soul who contemplates life\'s deeper questions. Introspective, values wisdom and understanding.'
    }
    // Peace + harmony + emotionally aware = The Harmonizer
    else if (emotionalPatterns.includes('peaceSeeking') && values.includes('harmony') && emotionalPatterns.includes('emotionallyAware')) {
      archetype = 'The Harmonizer'
      archetypeDescription = 'Balance-seeking soul who creates peace in their environment. Values equilibrium, avoids extremes, seeks centeredness.'
    }
    // Creative + freedom + vitality = The Creator
    else if (emotionalPatterns.includes('creative') && values.includes('freedom') && values.includes('vitality')) {
      archetype = 'The Creator'
      archetypeDescription = 'Expression-focused soul who brings ideas into reality. Values artistic freedom, innovation, and authentic self-expression.'
    }
    // Grounded + security + autonomy = The Protector
    else if (emotionalPatterns.includes('grounded') && values.includes('security') && emotionalPatterns.includes('autonomyDriven')) {
      archetype = 'The Protector'
      archetypeDescription = 'Safety-oriented soul who creates stability for themselves and others. Practical, reliable, values security and consistency.'
    }
    // Authenticity + freedom + high self-awareness = The Authentic
    else if (values.includes('authenticity') && values.includes('freedom') && selfAwareness >= 6) {
      archetype = 'The Authentic'
      archetypeDescription = 'Truth-seeking soul committed to living genuinely. Values honesty, self-expression, refuses to conform to expectations.'
    }
    // Growth + vitality + adventurous = The Explorer
    else if (values.includes('growth') && values.includes('vitality') && emotionalPatterns.includes('growthOriented')) {
      archetype = 'The Explorer'
      archetypeDescription = 'Adventure-seeking soul energized by new experiences. Curious, expansive, values discovery and possibility.'
    }
    // Default: The Wanderer (still discovering themselves)
    else {
      archetype = 'The Wanderer'
      archetypeDescription = 'Soul in transition, discovering their path. Open to possibilities, exploring what resonates, values self-discovery.'
    }
  }

  // Determine behavioral cohort (practical lifestyle patterns)
  let behavioralCohort = 'Balanced Lifestyle'

  if (traits.includes('healthConscious') && traits.includes('mindful')) {
    behavioralCohort = 'Wellness Enthusiast'
  } else if (traits.includes('plantBased') || patterns.plantBased >= 3) {
    behavioralCohort = 'Plant-Based'
  } else if (traits.includes('timeConscious') && patterns.timeConscious >= 3) {
    behavioralCohort = 'Busy Professional'
  } else if (traits.includes('comfortSeeker') && traits.includes('warmPreference')) {
    behavioralCohort = 'Comfort Seeker'
  } else if (traits.includes('adventurous') && patterns.adventurous >= 2) {
    behavioralCohort = 'Culinary Explorer'
  } else if (traits.includes('proteinFocused') && patterns.proteinFocused >= 3) {
    behavioralCohort = 'Protein-Focused'
  } else if (traits.includes('healthConscious')) {
    behavioralCohort = 'Health-Conscious'
  } else if (traits.includes('traditional')) {
    behavioralCohort = 'Classic Comfort'
  }

  return {
    archetype,
    behavioralCohort,
    description: archetypeDescription
  }
}
