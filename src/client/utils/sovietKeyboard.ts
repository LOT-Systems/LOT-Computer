/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Soviet synth keyboard click
 *
 * A softer cousin of sovietGameSounds — designed to play on every
 * keystroke in the Log without becoming noise. The envelope is very
 * short (~25ms) and the gain is held below the game sounds so it
 * reads as a typewriter-with-electricity, not a Tetris replay.
 *
 * Inspired by the Elektronika MK series: square/triangle blips with
 * a touch of pitch jitter so consecutive presses don't sound robotic.
 *
 * The module is lazy — it only creates an AudioContext on the first
 * call, and it throttles to avoid overlapping clicks at fast typing
 * speeds (the ear interprets overlap as muddy buzz).
 */

let ctx: AudioContext | null = null
let lastClickAt = 0
const MIN_GAP_MS = 18 // cap to roughly 55 clicks/sec, still feels live

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!ctx || ctx.state === 'closed') {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    return ctx
  } catch {
    return null
  }
}

function vol(v: number) { return Math.max(0.001, Math.min(v, 0.12)) }

/**
 * Play a single typing click. `key` is the physical key pressed so
 * we can vary pitch slightly per character — letters cluster around
 * ~720Hz, digits sit higher, and whitespace gets a drier thunk.
 */
export function playKeyClick(key: string) {
  const now = Date.now()
  if (now - lastClickAt < MIN_GAP_MS) return
  lastClickAt = now

  const ac = getCtx()
  if (!ac) return

  const t = ac.currentTime

  // Pitch selection by key family — gentle, not gimmicky.
  let baseFreq = 720
  if (key === ' ') baseFreq = 320                  // space — muted thunk
  else if (key === 'Enter') baseFreq = 260         // carriage return — lowest
  else if (key === 'Backspace') baseFreq = 460     // erase — mid-low
  else if (/^[0-9]$/.test(key)) baseFreq = 880     // digits — bright
  else if (/^[A-Z]$/.test(key)) baseFreq = 760     // letters — mid-high
  else if (/^[.,;:!?]$/.test(key)) baseFreq = 620  // punctuation — mid

  // Jitter ±4% so two identical keypresses never sound identical
  const jitter = 1 + (Math.random() * 0.08 - 0.04)
  const freq = baseFreq * jitter

  // Core tone — square wave, very short
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = key === ' ' || key === 'Enter' ? 'triangle' : 'square'
  osc.frequency.setValueAtTime(freq, t)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.82, t + 0.022)

  // Envelope: instant attack, ~25ms decay
  g.gain.setValueAtTime(vol(0.055), t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.028)

  osc.connect(g).connect(ac.destination)
  osc.start(t)
  osc.stop(t + 0.03)
}

/**
 * A one-shot fanfare played when the user toggles the synth ON via
 * the secret 🎹 emoji or `/synth` keyword — a little wink of
 * acknowledgement so the user knows the trigger worked.
 */
export function playSynthActivationChime() {
  const ac = getCtx()
  if (!ac) return
  const t = ac.currentTime
  const notes = [523, 659, 784] // C5 E5 G5
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'triangle'
    const start = t + i * 0.06
    osc.frequency.setValueAtTime(freq, start)
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(vol(0.09), start + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.09)
    osc.connect(g).connect(ac.destination)
    osc.start(start)
    osc.stop(start + 0.1)
  })
}

/**
 * Soft descending doublet played when the user toggles the synth
 * OFF — a polite "noted, going quiet" signal.
 */
export function playSynthDeactivationChime() {
  const ac = getCtx()
  if (!ac) return
  const t = ac.currentTime
  const notes = [523, 392] // C5, G4
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'triangle'
    const start = t + i * 0.08
    osc.frequency.setValueAtTime(freq, start)
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(vol(0.08), start + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.12)
    osc.connect(g).connect(ac.destination)
    osc.start(start)
    osc.stop(start + 0.13)
  })
}
