/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import dayjs from '#client/utils/dayjs'

/**
 * Community Pulse — Atmosphere layer for the dashboard
 *
 * Creates a sense of communal rhythm around the 8am peak hour.
 * Like a stoic coach's opening line: minimal, powerful, time-aware.
 *
 * Three elements:
 * 1. Daily Stoic Anchor — one line, stable all day, seeded by date
 * 2. Convergence Signal — proximity narrative to peak hour
 * 3. Ambient Intensity — CSS pulse strength (0-1) based on peak proximity
 */

const PEAK_HOUR = 8 // 8:00 AM community peak — the hour the originals gather

/**
 * Daily Stoic Anchors — one per day, seeded by date
 *
 * Short, powerful lines. The kind that stay with you.
 * Aligned with CQGS Bioethics: cleanness, routine, nutrition, laughter.
 */
const STOIC_ANCHORS = [
  'You are not behind. You are exactly where your routine placed you.',
  'The obstacle is the way. Today, begin.',
  'Discipline is choosing between what you want now and what you want most.',
  'What stands in the way becomes the way.',
  'A calm mind is the ultimate weapon against your challenges.',
  'You have power over your mind, not outside events. Realize this.',
  'The best time to plant a tree was twenty years ago. The second best time is now.',
  'Waste no more time arguing about what a good person should be. Be one.',
  'It is not that we have a short time to live, but that we waste a great deal of it.',
  'The happiness of your life depends upon the quality of your thoughts.',
  'No person is free who is not master of themselves.',
  'He who fears death will never do anything worthy of a living person.',
  'Begin at once to live, and count each separate day as a separate life.',
  'First say to yourself what you would be; and then do what you have to do.',
  'Difficulty shows what people are.',
  'How long are you going to wait before you demand the best for yourself?',
  'The soul becomes dyed with the color of its thoughts.',
  'It is not because things are difficult that we do not dare. It is because we do not dare that they are difficult.',
  'If it is not right, do not do it. If it is not true, do not say it.',
  'The mind that is anxious about future events is miserable.',
  'We suffer more in imagination than in reality.',
  'Attach yourself to what is spiritually superior. This is the routine.',
  'What we do now echoes in eternity.',
  'Be tolerant with others and strict with yourself.',
  'The key is to keep company only with people who uplift you.',
  'Throw me to the wolves and I will return leading the pack.',
  'A gem cannot be polished without friction, nor a person perfected without trials.',
  'You could leave life right now. Let that determine what you do and say and think.',
  'The best revenge is not to be like your enemy.',
  'To be calm is the highest achievement of the self.',
  'Choose not to be harmed — and you will not feel harmed.',
]

/**
 * Get the daily stoic anchor — stable for the entire day
 */
export function getDailyStoicAnchor(): string {
  const dayOfYear = dayjs().dayOfYear()
  const year = dayjs().year()
  // Seed by date so it's stable all day, different each day
  const seed = (dayOfYear * 7 + year * 13) % STOIC_ANCHORS.length
  return STOIC_ANCHORS[seed]
}

/**
 * Convergence signal — narrative about proximity to peak hour
 */
export function getConvergenceSignal(): {
  narrative: string
  phase: 'approaching' | 'peak' | 'carrying' | 'distant'
} {
  const now = dayjs()
  const hour = now.hour()
  const minute = now.minute()
  const currentMinutes = hour * 60 + minute
  const peakMinutes = PEAK_HOUR * 60 // 8:00 = 480

  // Peak window: 7:45 - 8:15
  if (currentMinutes >= peakMinutes - 15 && currentMinutes <= peakMinutes + 15) {
    return {
      narrative: '◉ Peak hour. The collective is here.',
      phase: 'peak',
    }
  }

  // Approaching: 6:00 - 7:44
  if (currentMinutes >= peakMinutes - 120 && currentMinutes < peakMinutes - 15) {
    const minutesUntilPeak = peakMinutes - currentMinutes
    if (minutesUntilPeak <= 30) {
      return {
        narrative: `→ The community gathers in ${minutesUntilPeak}m`,
        phase: 'approaching',
      }
    }
    if (minutesUntilPeak <= 60) {
      return {
        narrative: '⇢ The community is waking. Convergence soon.',
        phase: 'approaching',
      }
    }
    return {
      narrative: '↗ Early hours. Building toward convergence.',
      phase: 'approaching',
    }
  }

  // Carrying momentum: 8:16 - 10:00
  if (currentMinutes > peakMinutes + 15 && currentMinutes <= peakMinutes + 120) {
    const minutesSincePeak = currentMinutes - peakMinutes
    if (minutesSincePeak <= 45) {
      return {
        narrative: '↗ Momentum carries. The collective disperses with purpose.',
        phase: 'carrying',
      }
    }
    return {
      narrative: '→ Post-convergence. Carry the energy forward.',
      phase: 'carrying',
    }
  }

  // Distant: rest of the day
  if (hour >= 20 || hour < 4) {
    return {
      narrative: '↓ Rest. The collective reconvenes at dawn.',
      phase: 'distant',
    }
  }

  if (hour >= 16) {
    return {
      narrative: '↘ The day winds. Tomorrow the collective gathers again.',
      phase: 'distant',
    }
  }

  return {
    narrative: '· Between convergences. Individual work carries weight.',
    phase: 'distant',
  }
}

/**
 * Ambient pulse intensity (0 to 1) based on proximity to peak hour
 *
 * Used for CSS animation strength:
 * - 0 = no pulse (distant from peak)
 * - 0.3 = subtle pulse (approaching)
 * - 0.7 = strong pulse (near peak)
 * - 1.0 = full pulse (peak hour)
 */
export function getAmbientIntensity(): number {
  const now = dayjs()
  const hour = now.hour()
  const minute = now.minute()
  const currentMinutes = hour * 60 + minute
  const peakMinutes = PEAK_HOUR * 60

  const distance = Math.abs(currentMinutes - peakMinutes)

  // At peak: full intensity
  if (distance <= 15) return 1.0

  // Within 30 min: strong
  if (distance <= 30) return 0.7

  // Within 1 hour: moderate
  if (distance <= 60) return 0.5

  // Within 2 hours: subtle
  if (distance <= 120) return 0.3

  // Within 3 hours: faint
  if (distance <= 180) return 0.15

  // Distant: minimal
  return 0.05
}

/**
 * Get the convergence phase CSS class suffix
 */
export function getConvergencePhaseClass(): string {
  const { phase } = getConvergenceSignal()
  return `convergence-${phase}`
}
