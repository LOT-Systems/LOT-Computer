/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Usership Journey — the 12-month evolution, as data.
 *
 * Canonical source for month stages, glyphs, affirmations and evidence gates.
 * Spec: docs/technical/LOT-USERSHIP-12-MONTH-EVOLUTION.md
 *
 * Pure module (no imports) so it can be shared by client widgets, the
 * public profile API and the future Memory Capsule job.
 */

export type UsershipChapter = 1 | 2 | 3 | 4

export type UsershipMonthGrade = 'locked' | 'open' | 'unlocked' | 'sealed' | 'quiet'

export interface UsershipSignals {
  /** S1 — journal / Log entries (`note`, text > 20 chars) */
  notes: number
  /** S2 — Memory answers (`answer`) */
  answers: number
  /** S3 — morning check-ins (`emotional_checkin` before 12:00 local) */
  mornings: number
  /** S4 — self-care completions (`self_care_complete`) */
  selfCare: number
}

export interface UsershipMonth {
  month: number
  chapter: UsershipChapter
  /** Badge ID reserved for Codex v33 — The Usership Year */
  badgeId: string
  glyph: string
  name: string
  /** Twelve-stage monomyth stage */
  stage: string
  /** Headline line shown in the Usership Month widget */
  message: string
  /** Closing affirmation for the month's Memory Capsule */
  affirmation: string
  /** The single headline unlock of the month */
  headline: string
}

export interface UsershipChapterDef {
  chapter: UsershipChapter
  title: string
  subtitle: string
  seal: string
  sealBadgeId: string
  months: [number, number, number]
}

export const USERSHIP_TOTAL_MONTHS = 12

/** Usership month length in days (anniversary model from joinedAt). */
export const USERSHIP_MONTH_DAYS = 30

export const USERSHIP_MONTHS: readonly UsershipMonth[] = [
  { month: 1,  chapter: 1, badgeId: 'usership_m01_first_light',   glyph: '∘',   name: 'First Light',        stage: 'Ordinary World',        message: 'The first month. The system is beginning to know you.',             affirmation: 'You arrived, and you wrote it down.',                     headline: 'The first Memory Capsule' },
  { month: 2,  chapter: 1, badgeId: 'usership_m02_the_call',      glyph: '∘∘',  name: 'The Call',           stage: 'Call to Adventure',     message: 'Two months in. The questions have started to know you.',           affirmation: 'The pattern is forming. Keep going.',                     headline: 'Capsule view in Memory' },
  { month: 3,  chapter: 1, badgeId: 'usership_m03_threshold',     glyph: '∘∘∘', name: 'Threshold',          stage: 'Crossing the Threshold', message: 'Three months. You have crossed the threshold.',                   affirmation: 'The system sees who you are becoming.',                   headline: 'Archetype reveal' },
  { month: 4,  chapter: 2, badgeId: 'usership_m04_foundation',    glyph: '├─',  name: 'Foundation',         stage: 'Tests, Allies, Enemies', message: 'Four months. You are no longer visiting. You are building.',       affirmation: 'You are building something.',                             headline: 'Planner and Intentions' },
  { month: 5,  chapter: 2, badgeId: 'usership_m05_approach',      glyph: '╞═╡', name: 'Approach',           stage: 'Approach to the Inmost Cave', message: 'Five months. Consistency is its own reward.',             affirmation: 'What you repeat, you become.',                            headline: 'Correlated Indexes' },
  { month: 6,  chapter: 2, badgeId: 'usership_m06_half_declared', glyph: '◐',   name: 'Half-Declared',      stage: 'The Ordeal',            message: 'Six months. Half the journey, declared.',                          affirmation: 'You stayed. That is the whole secret.',                   headline: 'Letter from Month 1' },
  { month: 7,  chapter: 3, badgeId: 'usership_m07_reward',        glyph: '≈',   name: 'Reward',             stage: 'Reward',                message: 'Seven months. The system has been listening — here is what it heard.', affirmation: 'Here is something you did not have to say out loud.', headline: 'First insight line' },
  { month: 8,  chapter: 3, badgeId: 'usership_m08_rare_air',      glyph: '≋',   name: 'Rare Air',           stage: 'Allies',                message: 'Eight months. Rare air — and you are not alone in it.',            affirmation: 'Others are walking this road beside you.',                headline: 'Cohort Connect' },
  { month: 9,  chapter: 3, badgeId: 'usership_m09_habit_self',    glyph: '║·║', name: 'Habit Becomes Self', stage: 'Atonement',             message: 'Nine months. The practice is a habit now. The habit is you.',       affirmation: 'The ritual no longer needs reminding.',                   headline: 'Proactive self-care' },
  { month: 10, chapter: 4, badgeId: 'usership_m10_road_back',     glyph: '◎',   name: 'The Road Back',      stage: 'The Road Back',         message: 'Ten months. The road back runs through everything you wrote.',     affirmation: 'Everything you wrote is still here.',                     headline: 'Usership Board profile' },
  { month: 11, chapter: 4, badgeId: 'usership_m11_resurrection',  glyph: '◉·',  name: 'Resurrection',       stage: 'Resurrection',          message: 'Eleven months. One more. Look how far.',                           affirmation: 'Look at who wrote the first capsule. Look at who reads it now.', headline: 'Before / After' },
  { month: 12, chapter: 4, badgeId: 'usership_m12_elixir',        glyph: '◉',   name: 'The Elixir',         stage: 'Return with the Elixir', message: 'One year with LOT. The portrait is complete — and still evolving.', affirmation: 'The machine asks first now. You answer as yourself.',    headline: 'LOT® AI and The Year' },
]

export const USERSHIP_CHAPTERS: readonly UsershipChapterDef[] = [
  { chapter: 1, title: 'Foundation',  subtitle: 'Being known', seal: '◇', sealBadgeId: 'usership_ch1_foundation',   months: [1, 2, 3] },
  { chapter: 2, title: 'Structure',   subtitle: 'Being built', seal: '◈', sealBadgeId: 'usership_ch2_structure',    months: [4, 5, 6] },
  { chapter: 3, title: 'Depth',       subtitle: 'Being seen',  seal: '◆', sealBadgeId: 'usership_ch3_depth',        months: [7, 8, 9] },
  { chapter: 4, title: 'Integration', subtitle: 'Becoming',    seal: '⊙', sealBadgeId: 'usership_year_compressed',  months: [10, 11, 12] },
]

/**
 * Evidence gates per 30-day window (Base unlocks, Full seals).
 * Thresholds rise gently each chapter so the practice deepens.
 */
export const USERSHIP_GATES: Record<UsershipChapter, { base: UsershipSignals; full: UsershipSignals }> = {
  1: { base: { notes: 6,  answers: 20, mornings: 8,  selfCare: 10 }, full: { notes: 15, answers: 60,  mornings: 20, selfCare: 30 } },
  2: { base: { notes: 8,  answers: 25, mornings: 10, selfCare: 12 }, full: { notes: 20, answers: 75,  mornings: 22, selfCare: 35 } },
  3: { base: { notes: 10, answers: 30, mornings: 12, selfCare: 15 }, full: { notes: 25, answers: 90,  mornings: 24, selfCare: 40 } },
  4: { base: { notes: 12, answers: 30, mornings: 12, selfCare: 15 }, full: { notes: 30, answers: 100, mornings: 25, selfCare: 45 } },
}

/** Signal weights for EvolutionScore — journal entries carry the most story. */
export const USERSHIP_SIGNAL_WEIGHTS: UsershipSignals = {
  notes: 0.40,
  answers: 0.25,
  mornings: 0.20,
  selfCare: 0.15,
}

const SIGNAL_KEYS: (keyof UsershipSignals)[] = ['notes', 'answers', 'mornings', 'selfCare']

export function getUsershipMonth(month: number): UsershipMonth | null {
  if (month < 1) return null
  return USERSHIP_MONTHS[Math.min(month, USERSHIP_TOTAL_MONTHS) - 1] ?? null
}

export function getUsershipChapter(month: number): UsershipChapterDef | null {
  const def = getUsershipMonth(month)
  if (!def) return null
  return USERSHIP_CHAPTERS[def.chapter - 1] ?? null
}

/** 1-based Usership month from days since joining (Day 0–29 = Month 1). */
export function usershipMonthFromDays(daysSinceJoin: number): number {
  if (!Number.isFinite(daysSinceJoin) || daysSinceJoin < 0) return 0
  return Math.floor(daysSinceJoin / USERSHIP_MONTH_DAYS) + 1
}

/** Weighted EvolutionScore — each signal normalized to Full = 1.0, capped at 1.2. */
export function usershipEvolutionScore(month: number, signals: UsershipSignals): number {
  const def = getUsershipMonth(month)
  if (!def) return 0
  const full = USERSHIP_GATES[def.chapter].full
  return SIGNAL_KEYS.reduce((sum, key) => {
    const ratio = full[key] > 0 ? Math.min(signals[key] / full[key], 1.2) : 0
    return sum + USERSHIP_SIGNAL_WEIGHTS[key] * ratio
  }, 0)
}

/**
 * Grade a month's 30-day window.
 * unlocked = 3 of 4 signals at Base · sealed = 4 of 4 at Full.
 * `windowClosed` false → still `open` (unless already sealed/unlocked).
 */
export function evaluateUsershipMonth(
  month: number,
  signals: UsershipSignals,
  windowClosed: boolean
): { grade: UsershipMonthGrade; baseMet: number; fullMet: number; score: number } {
  const def = getUsershipMonth(month)
  if (!def) return { grade: 'locked', baseMet: 0, fullMet: 0, score: 0 }
  const { base, full } = USERSHIP_GATES[def.chapter]
  const baseMet = SIGNAL_KEYS.filter((k) => signals[k] >= base[k]).length
  const fullMet = SIGNAL_KEYS.filter((k) => signals[k] >= full[k]).length
  const score = usershipEvolutionScore(month, signals)
  let grade: UsershipMonthGrade
  if (fullMet === 4) grade = 'sealed'
  else if (baseMet >= 3) grade = 'unlocked'
  else grade = windowClosed ? 'quiet' : 'open'
  return { grade, baseMet, fullMet, score }
}

/**
 * Render the 12-glyph month strip.
 * unlocked/sealed → month glyph · open → ▪ · quiet/locked → ○
 */
export function buildMonthStrip(grades: UsershipMonthGrade[]): string {
  return USERSHIP_MONTHS.map((m, i) => {
    const g = grades[i] ?? 'locked'
    if (g === 'unlocked' || g === 'sealed') return m.glyph
    if (g === 'open') return '▪'
    return '○'
  }).join(' ')
}

export function countMonthsUnlocked(grades: UsershipMonthGrade[]): number {
  return grades.filter((g) => g === 'unlocked' || g === 'sealed').length
}
