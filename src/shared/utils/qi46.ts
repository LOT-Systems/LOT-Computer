/**
 * QI·46 — Layer 6: Being Profile & Humanoid Calibration (v0.1, flag-off)
 *
 * Pure, dependency-free core. No I/O, no model calls.
 * A Being Profile is a consented, person-owned calibration vector that
 * steers QI·46 output registers (grace, poetry, love, hug, being-there, cool)
 * and the output voice. Guardrails from LOT-SR-20261109-01 are enforced here:
 * consent-first ingestion, self-only uploads, honesty clause, crisis override.
 */

export const QI46_REGISTERS = ['grace', 'poetry', 'love', 'hug', 'beingThere', 'cool'] as const
export type Qi46Register = (typeof QI46_REGISTERS)[number]
export type Qi46RegisterWeights = Record<Qi46Register, number>

export const QI46_SOURCES = ['journal', 'chat', 'answers', 'body', 'relationships'] as const
export type Qi46Source = (typeof QI46_SOURCES)[number]

export type Qi46Voice = 'male' | 'female' | 'neutral'

export interface Qi46BeingProfile {
  version: 1
  personId: string
  consent: Record<Qi46Source, boolean>
  registers: Qi46RegisterWeights
  voice: Qi46Voice
  /** feedback events applied; used to damp learning rate over time */
  samples: number
  updatedAt: string
}

export interface Qi46Feedback {
  /** register mix actually used for the response that was rated */
  used: Partial<Qi46RegisterWeights>
  landed: boolean
}

export const QI46_LOCALES = ['en', 'ru'] as const
export type Qi46Locale = (typeof QI46_LOCALES)[number]

export interface Qi46Signals {
  crisis?: boolean
  /** locale whose pattern set matched first (resource line selection) */
  locale?: Qi46Locale
}

const MIN_WEIGHT = 0.02
const BASE_RATE = 0.3

export const QI46_REGISTER_GUIDE: Record<Qi46Register, string> = {
  grace: 'unhurried, precise, no filler',
  poetry: 'image over explanation, at most one metaphor',
  love: "warmth without flattery; name the person's effort",
  hug: "short and presence-first (e.g. \"I'm here.\")",
  beingThere: 'stay in the moment; no advice unless asked',
  cool: 'dry, light, low-drama',
}

export function normalizeWeights(w: Partial<Qi46RegisterWeights>): Qi46RegisterWeights {
  const out = {} as Qi46RegisterWeights
  let sum = 0
  for (const r of QI46_REGISTERS) {
    const v = w[r]
    const x = typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0
    out[r] = x
    sum += x
  }
  if (sum === 0) {
    for (const r of QI46_REGISTERS) out[r] = 1 / QI46_REGISTERS.length
    return out
  }
  // floor every register so none is ever extinguished, then renormalize
  let floored = 0
  for (const r of QI46_REGISTERS) {
    out[r] = Math.max(out[r] / sum, MIN_WEIGHT)
    floored += out[r]
  }
  for (const r of QI46_REGISTERS) out[r] = out[r] / floored
  return out
}

export function createBeingProfile(
  personId: string,
  consent: Partial<Record<Qi46Source, boolean>> = {},
  voice: Qi46Voice = 'neutral',
  now: Date = new Date()
): Qi46BeingProfile {
  if (!personId) throw new Error('QI46: personId required')
  const c = {} as Record<Qi46Source, boolean>
  for (const s of QI46_SOURCES) c[s] = consent[s] === true
  return {
    version: 1,
    personId,
    consent: c,
    registers: normalizeWeights({}),
    voice,
    samples: 0,
    updatedAt: now.toISOString(),
  }
}

/**
 * Consent gate. A person may only upload their own being, and only from
 * sources they explicitly opted into.
 */
export function canIngest(profile: Qi46BeingProfile, source: Qi46Source, uploaderId: string): boolean {
  return uploaderId === profile.personId && profile.consent[source] === true
}

/**
 * Calibration step: landed -> pull weights toward the mix used;
 * missed -> push away from it. Learning rate decays with samples.
 */
export function calibrate(
  profile: Qi46BeingProfile,
  fb: Qi46Feedback,
  now: Date = new Date()
): Qi46BeingProfile {
  const used = normalizeWeights(fb.used)
  const rate = BASE_RATE / Math.sqrt(1 + profile.samples / 10)
  const sign = fb.landed ? 1 : -1
  const next: Partial<Qi46RegisterWeights> = {}
  for (const r of QI46_REGISTERS) {
    const cur = profile.registers[r]
    next[r] = Math.max(cur + sign * rate * (used[r] - cur), 0)
  }
  return {
    ...profile,
    registers: normalizeWeights(next),
    samples: profile.samples + 1,
    updatedAt: now.toISOString(),
  }
}

/** Top-k registers by weight, descending. */
export function dominantRegisters(profile: Qi46BeingProfile, k = 2): Qi46Register[] {
  return [...QI46_REGISTERS].sort((a, b) => profile.registers[b] - profile.registers[a]).slice(0, k)
}

const HONESTY =
  'You are QI·46, calibrated to this person — not the person, and not human. ' +
  'Care is expressed in words; never claim feelings, a body, or sentience.'

const CRISIS =
  'Safety override: drop all stylistic registers. Use plain, direct language. ' +
  'Acknowledge what was said, encourage contacting a trusted person or local emergency services now, ' +
  'and offer to stay in the conversation.'

/** System-prompt fragment for the humanoid/text surface. */
export function composeDirective(profile: Qi46BeingProfile, signals: Qi46Signals = {}): string {
  if (signals.crisis) return `${HONESTY}\n${CRISIS}\n${crisisResourceLine(signals.locale)}`
  const lines = QI46_REGISTERS.filter((r) => profile.registers[r] >= 0.1)
    .sort((a, b) => profile.registers[b] - profile.registers[a])
    .map((r) => `- ${r} (${profile.registers[r].toFixed(2)}): ${QI46_REGISTER_GUIDE[r]}`)
  const voice = profile.voice === 'neutral' ? '' : `\nVoice persona: ${profile.voice} (phrasing + TTS).`
  return `${HONESTY}\nRegisters, strongest first:\n${lines.join('\n')}${voice}`
}

/** Right to delete: returns an empty, zero-consent profile for the same person. */
export function eraseBeingProfile(profile: Qi46BeingProfile, now: Date = new Date()): Qi46BeingProfile {
  return createBeingProfile(profile.personId, {}, 'neutral', now)
}

/* ── S3-4 / S4-4 · Crisis signal detector (v0.2, pure, high-recall, en + ru) ──
 * Deliberately over-inclusive: a false positive only swaps poetic registers
 * for plain safety language, a false negative could cost a life.
 * Not a clinical classifier; it gates tone, never diagnoses.
 * All locales are checked on every message (people switch languages mid-chat);
 * the matching locale only selects the resource line.
 */
const CRISIS_PATTERNS: Record<Qi46Locale, RegExp[]> = {
  en: [
    /\b(kill|hurt|harm|cut)(ing)?\s+myself\b/i,
    /\bsuicid(e|al)\b/i,
    /\b(end|take)\s+(my|it)\s+(own\s+)?(life|all)\b/i,
    /\b(want|wanna|going)\s+(to\s+)?die\b/i,
    /\bbetter\s+off\s+(dead|without\s+me)\b/i,
    /\bno\s+(reason|point)\s+(to|in)\s+(live|living|go(ing)?\s+on)\b/i,
    /\bcan'?t\s+(go\s+on|do\s+this\s+anymore|keep\s+going)\b/i,
    /\boverdos(e|ing)\b/i,
    /\bself[-\s]?harm\b/i,
  ],
  // JS \b is ASCII-only, so Cyrillic patterns use (?<!\p{L}) as a word start.
  ru: [
    /(?<!\p{L})поконч(ить|у|ила?)\s+с\s+собой/iu,
    /(?<!\p{L})(убить|убью|убила?)\s+себя/iu,
    /(?<!\p{L})суицид/iu,
    /(?<!\p{L})(хочу|хочется|хотела?)\s+(просто\s+)?умереть/iu,
    /(?<!\p{L})не\s+хочу\s+(больше\s+)?жить/iu,
    /(?<!\p{L})(нет|не\s+вижу)\s+смысла\s+жить/iu,
    /(?<!\p{L})(всем\s+)?(будет\s+)?лучше\s+без\s+меня/iu,
    /(?<!\p{L})(режу|порезать|резать)\s+себя/iu,
    /(?<!\p{L})(причин(ить|яю)\s+себе\s+вред|селфхарм)/iu,
    /(?<!\p{L})передоз/iu,
    /(?<!\p{L})не\s+могу\s+больше\s+(так\s+)?жить/iu,
  ],
}

const CRISIS_RESOURCES: Record<Qi46Locale | 'default', string> = {
  en: 'Resource line: in the US, call or text 988 (Suicide & Crisis Lifeline); if in immediate danger, call 911.',
  ru: 'Resource line (reply in Russian): if in immediate danger, call 112.',
  default: 'Resource line: if in immediate danger, call the local emergency number.',
}

export function crisisResourceLine(locale?: Qi46Locale): string {
  return CRISIS_RESOURCES[locale ?? 'default']
}

/** Detects crisis language in a user message. Returns signals for composeDirective(). */
export function detectQi46Signals(text: string): Qi46Signals {
  if (!text) return { crisis: false }
  for (const loc of QI46_LOCALES) {
    if (CRISIS_PATTERNS[loc].some((re) => re.test(text))) return { crisis: true, locale: loc }
  }
  return { crisis: false }
}

/** One-call helper: profile + latest user message → directive (crisis-aware). */
export function directiveForMessage(profile: Qi46BeingProfile, userText: string): string {
  return composeDirective(profile, detectQi46Signals(userText))
}
