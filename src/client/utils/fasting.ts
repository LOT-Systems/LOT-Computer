/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Christian Fasting Calendar & Gradual Light-Fasting Algorithm
 *
 * A pure utility with no side effects. Given a date and a tradition
 * (Orthodox or Roman Catholic), it returns whether the date is a
 * fasting day, which fast it belongs to, how far into the fast we are,
 * and — the sophisticated bit — a gradual strictness score used to
 * select what the Recipe widget should suggest instead of food.
 *
 * The strictness scale is continuous (0..1) and maps to suggestion
 * modes so the widget can degrade gracefully from a normal meal to a
 * light snack → dry plant food → water → silent rest with prayer,
 * following the rhythm of the Church fasting tradition but staying
 * gentle and light in practice. This is a wellness overlay, not
 * medical guidance.
 *
 * References
 *  - Orthodox Pascha calculation: Meeus/Jones/Butcher formulas,
 *    converted from Julian to Gregorian by adding 13 days (valid
 *    1900–2099).
 *  - Orthodox fasts: Great Lent (48 days incl. Holy Week), Apostles'
 *    Fast (Pentecost+8 → Jun 29), Dormition Fast (Aug 1–14), Nativity
 *    Fast (Nov 15 – Dec 24), weekly Wednesday/Friday year-round with
 *    the usual fast-free weeks.
 *  - Roman Catholic: Lent (Ash Wednesday – Holy Saturday), with strict
 *    days on Ash Wednesday and Good Friday, abstinence all Lenten
 *    Fridays.
 */

export type FastingTradition = 'orthodox' | 'catholic' | 'off'

export type FastName =
  | 'great-lent'
  | 'holy-week'
  | 'apostles-fast'
  | 'dormition-fast'
  | 'nativity-fast'
  | 'weekly-wednesday'
  | 'weekly-friday'
  | 'lent'                  // Catholic
  | 'ash-wednesday'         // Catholic strict day
  | 'good-friday'           // Catholic strict day
  | 'lenten-friday'         // Catholic Friday abstinence
  | 'feast-eve'
  | null

export type FastingMode =
  | 'normal'         // no fast — show regular recipe
  | 'light-snack'    // gentle: fruit / vegetables / bread
  | 'dry-food'       // xerophagy: dry plant food, no oil
  | 'water-only'     // water, herbal infusion, silent rest
  | 'prayer-rest'    // deepest: no food suggestion, water with intention

export interface FastingState {
  date: string                  // YYYY-MM-DD
  tradition: FastingTradition
  isFastingDay: boolean
  fast: FastName
  /** 1-based position inside the current fast period, or 0 if none. */
  dayIndex: number
  /** Total length of the current fast period (days), or 0 if none. */
  totalDays: number
  /** 0..1 continuous strictness score used to drive the suggestion. */
  strictness: number
  /** Discrete suggestion mode derived from strictness. */
  mode: FastingMode
  /** Short human-readable label for the widget. */
  label: string
  /** One-line description of what is being suggested and why. */
  rationale: string
}

// ---------------------------------------------------------------------------
// Pascha computation
// ---------------------------------------------------------------------------

function addDaysUTC(date: Date, days: number): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

function dayDiff(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  const aa = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())
  const bb = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate())
  return Math.round((aa - bb) / msPerDay)
}

function ymd(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  )
}

/**
 * Gregorian date of Orthodox Pascha (Easter) for the given year.
 * Meeus Julian formula + 13-day correction (valid 1900–2099).
 */
export function orthodoxPascha(year: number): Date {
  const a = year % 4
  const b = year % 7
  const c = year % 19
  const d = (19 * c + 15) % 30
  const e = (2 * a + 4 * b - d + 34) % 7
  const month = Math.floor((d + e + 114) / 31) // 3 = March, 4 = April (Julian)
  const day = ((d + e + 114) % 31) + 1
  // Julian date → Gregorian (add 13 for 20th–21st century)
  const julian = new Date(Date.UTC(year, month - 1, day))
  return addDaysUTC(julian, 13)
}

/**
 * Gregorian date of Western (Roman Catholic) Easter. Meeus/Butcher
 * "Anonymous" algorithm.
 */
export function westernEaster(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3 or 4
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(year, month - 1, day))
}

// ---------------------------------------------------------------------------
// Period lookups
// ---------------------------------------------------------------------------

interface FastPeriod {
  fast: NonNullable<FastName>
  start: Date
  end: Date // inclusive
  baseStrictness: number // base for the gradient; adjusted by dayIndex / dow
}

function getOrthodoxPeriods(year: number): FastPeriod[] {
  const pascha = orthodoxPascha(year)
  const periods: FastPeriod[] = []

  // Great Lent: 48 days up to and including Holy Saturday
  // (Clean Monday is 48 days before Pascha)
  const cleanMonday = addDaysUTC(pascha, -48)
  const holySaturday = addDaysUTC(pascha, -1)
  const holyMonday = addDaysUTC(pascha, -6)
  periods.push({
    fast: 'great-lent',
    start: cleanMonday,
    end: addDaysUTC(holyMonday, -1),
    baseStrictness: 0.55,
  })
  // Holy Week — strictest stretch of Great Lent
  periods.push({
    fast: 'holy-week',
    start: holyMonday,
    end: holySaturday,
    baseStrictness: 0.85,
  })

  // Apostles' Fast: starts Monday after All Saints (Pentecost + 8),
  // ends on June 28 (day before Saints Peter & Paul)
  const pentecost = addDaysUTC(pascha, 49)
  const allSaints = addDaysUTC(pentecost, 7)
  const apostlesStart = addDaysUTC(allSaints, 1) // Monday after All Saints
  const apostlesEnd = new Date(Date.UTC(year, 5, 28)) // Jun 28
  if (apostlesStart.getTime() <= apostlesEnd.getTime()) {
    periods.push({
      fast: 'apostles-fast',
      start: apostlesStart,
      end: apostlesEnd,
      baseStrictness: 0.35,
    })
  }

  // Dormition Fast: Aug 1 – Aug 14 inclusive
  periods.push({
    fast: 'dormition-fast',
    start: new Date(Date.UTC(year, 7, 1)),
    end: new Date(Date.UTC(year, 7, 14)),
    baseStrictness: 0.6,
  })

  // Nativity Fast: Nov 15 – Dec 24 inclusive
  periods.push({
    fast: 'nativity-fast',
    start: new Date(Date.UTC(year, 10, 15)),
    end: new Date(Date.UTC(year, 11, 24)),
    baseStrictness: 0.45,
  })

  return periods
}

function getCatholicPeriods(year: number): FastPeriod[] {
  const easter = westernEaster(year)
  // Ash Wednesday is 46 days before Easter (excluding Sundays makes 40)
  const ashWednesday = addDaysUTC(easter, -46)
  const holySaturday = addDaysUTC(easter, -1)
  return [
    {
      fast: 'lent',
      start: ashWednesday,
      end: holySaturday,
      baseStrictness: 0.35,
    },
  ]
}

// Fast-free weeks in the Orthodox calendar — Wed/Fri abstinence is lifted.
// We derive them from Pascha so that they track the moving feast.
function getFastFreeRanges(year: number): Array<[Date, Date]> {
  const pascha = orthodoxPascha(year)
  const bright = [addDaysUTC(pascha, 0), addDaysUTC(pascha, 6)] as [Date, Date] // Bright Week
  // Week after Pentecost (Trinity Week)
  const pentecost = addDaysUTC(pascha, 49)
  const trinity = [pentecost, addDaysUTC(pentecost, 6)] as [Date, Date]
  // Publican & Pharisee week (11 days before Clean Monday): 17 days before Pascha? Actually it's the week starting 70 days before Pascha.
  // For simplicity we use the classical "no fast" weeks: Bright Week, Trinity
  // Week, Svyatki (Dec 25 – Jan 4). More can be added later.
  const svyatki = [
    new Date(Date.UTC(year, 11, 25)),
    new Date(Date.UTC(year + 1, 0, 4)),
  ] as [Date, Date]
  return [bright, trinity, svyatki]
}

function inRange(date: Date, start: Date, end: Date): boolean {
  const t = date.getTime()
  return t >= start.getTime() && t <= end.getTime()
}

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/**
 * Analyze a date and return the full fasting state for it. This is the
 * single entry point used by the recipe widget. Returns a neutral
 * `normal` state when the tradition is 'off' or the date falls outside
 * any fasting period, so callers can use a single code path.
 */
export function getFastingState(
  input: Date = new Date(),
  tradition: FastingTradition = 'orthodox'
): FastingState {
  const date = new Date(Date.UTC(input.getFullYear(), input.getMonth(), input.getDate()))
  const hour = input.getHours()
  const dow = date.getUTCDay() // 0 = Sunday

  // `off` → short-circuit to normal
  if (tradition === 'off') {
    return buildNormalState(date, tradition)
  }

  // --- Tradition-specific multi-day periods --------------------------------
  const periods =
    tradition === 'orthodox'
      ? getOrthodoxPeriods(date.getUTCFullYear())
      : getCatholicPeriods(date.getUTCFullYear())

  // Also look back to the previous year's Nativity Fast (Nov 15 – Dec 24)
  // since it straddles no boundary but is only relevant for Orthodox.
  if (tradition === 'orthodox') {
    const prev = getOrthodoxPeriods(date.getUTCFullYear() - 1)
    for (const p of prev) {
      if (inRange(date, p.start, p.end)) periods.unshift(p)
    }
  }

  // Fast-free windows (Orthodox only)
  const freeRanges =
    tradition === 'orthodox' ? getFastFreeRanges(date.getUTCFullYear()) : []
  const isFastFree = freeRanges.some(([s, e]) => inRange(date, s, e))

  // Find the active period (first match wins; holy-week is placed after
  // great-lent in the list and will match for the final week).
  let active: FastPeriod | null = null
  for (const p of periods) {
    if (inRange(date, p.start, p.end)) {
      if (!active || p.baseStrictness > active.baseStrictness) active = p
    }
  }

  if (active) {
    const totalDays = dayDiff(active.end, active.start) + 1
    const dayIndex = dayDiff(date, active.start) + 1

    // --- Gradual strictness algorithm --------------------------------------
    // Combine four inputs so the ramp is smooth and feels alive:
    //   1. base strictness of the fast period
    //   2. progression through the period (early = gentler)
    //   3. weekday (Sat/Sun are mitigated in Orthodox tradition; oil+wine)
    //   4. time of day (pre-noon gentler, evening strictest)
    const progression = dayIndex / totalDays // 0..1
    // Ease-in curve: earlier days are noticeably gentler than a linear ramp
    const eased = Math.pow(progression, 0.7)

    // Day-of-week mitigation (Orthodox)
    const weekendMitigation =
      tradition === 'orthodox' && (dow === 0 || dow === 6) ? -0.18 : 0

    // Time-of-day mitigation — mornings are gentlest, strictest after 18h
    const tod =
      hour < 11 ? -0.08 : hour < 14 ? -0.04 : hour < 18 ? 0.02 : 0.08

    // Wed/Fri inside a period reinforces (double fast)
    const dowReinforce = dow === 3 || dow === 5 ? 0.05 : 0

    let strictness =
      active.baseStrictness * (0.7 + 0.5 * eased) +
      weekendMitigation +
      tod +
      dowReinforce

    // Holy Week ramps aggressively toward Good Friday
    if (active.fast === 'holy-week') {
      strictness = Math.max(strictness, 0.75 + 0.05 * (dayIndex - 1))
    }

    // Ash Wednesday and Good Friday — Catholic strict days
    if (tradition === 'catholic') {
      const easter = westernEaster(date.getUTCFullYear())
      if (sameDay(date, addDaysUTC(easter, -46))) {
        strictness = 0.85
      } else if (sameDay(date, addDaysUTC(easter, -2))) {
        strictness = 0.9
      } else if (dow === 5) {
        // Lenten Friday abstinence
        strictness = Math.max(strictness, 0.5)
      }
    }

    strictness = Math.max(0, Math.min(1, strictness))

    return finalize(date, tradition, active.fast, dayIndex, totalDays, strictness)
  }

  // --- Weekly Wed/Fri fast (Orthodox) --------------------------------------
  if (tradition === 'orthodox' && !isFastFree && (dow === 3 || dow === 5)) {
    // Light weekly fast. Still gradual by hour of day.
    const base = 0.25
    const tod =
      hour < 11 ? -0.05 : hour < 14 ? 0 : hour < 18 ? 0.05 : 0.12
    const strictness = Math.max(0, Math.min(1, base + tod))
    return finalize(
      date,
      tradition,
      dow === 3 ? 'weekly-wednesday' : 'weekly-friday',
      1,
      1,
      strictness
    )
  }

  // --- Not a fasting day ---------------------------------------------------
  return buildNormalState(date, tradition)
}

function buildNormalState(date: Date, tradition: FastingTradition): FastingState {
  return {
    date: ymd(date),
    tradition,
    isFastingDay: false,
    fast: null,
    dayIndex: 0,
    totalDays: 0,
    strictness: 0,
    mode: 'normal',
    label: '',
    rationale: '',
  }
}

function finalize(
  date: Date,
  tradition: FastingTradition,
  fast: NonNullable<FastName>,
  dayIndex: number,
  totalDays: number,
  strictness: number
): FastingState {
  const mode = strictnessToMode(strictness)
  const label = FAST_LABEL[fast] || 'Fast'
  const rationale = RATIONALE[mode]
  return {
    date: ymd(date),
    tradition,
    isFastingDay: true,
    fast,
    dayIndex,
    totalDays,
    strictness: Math.round(strictness * 100) / 100,
    mode,
    label,
    rationale,
  }
}

export function strictnessToMode(strictness: number): FastingMode {
  if (strictness < 0.12) return 'normal'
  if (strictness < 0.38) return 'light-snack'
  if (strictness < 0.62) return 'dry-food'
  if (strictness < 0.85) return 'water-only'
  return 'prayer-rest'
}

const FAST_LABEL: Record<NonNullable<FastName>, string> = {
  'great-lent': 'Great Lent',
  'holy-week': 'Holy Week',
  'apostles-fast': "Apostles' Fast",
  'dormition-fast': 'Dormition Fast',
  'nativity-fast': 'Nativity Fast',
  'weekly-wednesday': 'Wednesday fast',
  'weekly-friday': 'Friday fast',
  lent: 'Lent',
  'ash-wednesday': 'Ash Wednesday',
  'good-friday': 'Good Friday',
  'lenten-friday': 'Lenten Friday',
  'feast-eve': 'Feast eve',
}

const RATIONALE: Record<FastingMode, string> = {
  normal: 'Regular meal',
  'light-snack': 'Light plant-based snack',
  'dry-food': 'Dry plant food — bread, fruit, vegetables',
  'water-only': 'Water or herbal infusion',
  'prayer-rest': 'A small cup of water, with intention',
}

// ---------------------------------------------------------------------------
// Suggestion pools
// ---------------------------------------------------------------------------

const LIGHT_SNACKS = [
  'An apple and a few walnuts',
  'A handful of dried apricots',
  'A pear with a slice of rye bread',
  'Sliced cucumber with sea salt',
  'A small bowl of grapes',
  'A plum and a cup of herbal tea',
  'A ripe tomato on black bread',
  'A small bowl of olives',
  'A fig and a few almonds',
  'Watermelon, a few small slices',
]

const DRY_FOODS = [
  'A slice of black bread and a handful of olives',
  'Raw carrot and a piece of flatbread',
  'A small bowl of lentils, no oil',
  'Beetroot salad, lemon only',
  'Chickpeas with herbs, no oil',
  'A rice cake and an apple',
  'Cabbage salad with apple, lemon only',
  'A few prunes and a slice of rye bread',
]

const WATERS = [
  'A glass of spring water',
  'Warm water with a slice of lemon',
  'Linden tea, unsweetened',
  'Chamomile infusion',
  'Mint tea, unsweetened',
  'A glass of water. Slow sips.',
  'Rosehip infusion, warm',
  'Sage tea, unsweetened',
]

const PRAYER_REST = [
  'A small cup of water. Sit with it.',
  'Water and a still moment.',
  'Water. Silence. Intention.',
  'A few slow breaths. Water after.',
  'A single cup of water, held and received.',
]

/**
 * Pick a suggestion string for a fasting state. Deterministic per-day
 * per-meal so the user isn't surprised by a new text on every render.
 */
export function pickFastingSuggestion(
  state: FastingState,
  mealSlot: 'breakfast' | 'lunch' | 'dinner' | 'snack'
): string {
  const pool =
    state.mode === 'light-snack' ? LIGHT_SNACKS :
    state.mode === 'dry-food' ? DRY_FOODS :
    state.mode === 'water-only' ? WATERS :
    state.mode === 'prayer-rest' ? PRAYER_REST :
    []
  if (pool.length === 0) return ''
  // Stable index from (date + meal slot + fast name)
  const key = `${state.date}:${mealSlot}:${state.fast || ''}`
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0
  const idx = Math.abs(hash) % pool.length
  return pool[idx]
}

/**
 * Convenience label: "Great Lent · day 12 of 48 · water"
 */
export function formatFastingHeadline(state: FastingState): string {
  if (!state.isFastingDay) return ''
  const parts: string[] = [state.label]
  if (state.totalDays > 1) parts.push(`day ${state.dayIndex} of ${state.totalDays}`)
  parts.push(state.rationale.toLowerCase())
  return parts.join(' · ')
}
