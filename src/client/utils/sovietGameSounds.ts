/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// Soviet-era micro game sound effects
// Synthesized via Web Audio API — lo-fi, 8-bit character inspired by
// Soviet electronic instruments (ANS synthesizer, Elektronika consoles)

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx || ctx.state === 'closed') {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// Clamp gain to safe range
function vol(v: number) { return Math.max(0.001, Math.min(v, 0.25)) }

/**
 * Short percussive blip — button press / move
 * Square wave for that Soviet Elektronika feel
 */
export function playMoveSound() {
  const ac = getCtx()
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'square'
  osc.frequency.setValueAtTime(880, t)
  osc.frequency.exponentialRampToValueAtTime(660, t + 0.04)
  g.gain.setValueAtTime(vol(0.08), t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05)
  osc.connect(g).connect(ac.destination)
  osc.start(t)
  osc.stop(t + 0.06)
}

/**
 * Rotation sound — slightly different pitch sweep
 */
export function playRotateSound() {
  const ac = getCtx()
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(600, t)
  osc.frequency.exponentialRampToValueAtTime(1000, t + 0.05)
  g.gain.setValueAtTime(vol(0.09), t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
  osc.connect(g).connect(ac.destination)
  osc.start(t)
  osc.stop(t + 0.07)
}

/**
 * Score point — ascending two-tone Soviet fanfare
 * Line clear / food eaten / invader killed
 */
export function playScoreSound() {
  const ac = getCtx()
  const t = ac.currentTime

  // First tone — bright square
  const o1 = ac.createOscillator()
  const g1 = ac.createGain()
  o1.type = 'square'
  o1.frequency.setValueAtTime(523, t) // C5
  g1.gain.setValueAtTime(vol(0.10), t)
  g1.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
  o1.connect(g1).connect(ac.destination)
  o1.start(t)
  o1.stop(t + 0.1)

  // Second tone — higher, triumphant
  const o2 = ac.createOscillator()
  const g2 = ac.createGain()
  o2.type = 'square'
  o2.frequency.setValueAtTime(659, t + 0.08) // E5
  g2.gain.setValueAtTime(0, t + 0.07)
  g2.gain.linearRampToValueAtTime(vol(0.12), t + 0.09)
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
  o2.connect(g2).connect(ac.destination)
  o2.start(t + 0.08)
  o2.stop(t + 0.19)
}

/**
 * Drop / hard drop — thud
 */
export function playDropSound() {
  const ac = getCtx()
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(200, t)
  osc.frequency.exponentialRampToValueAtTime(60, t + 0.08)
  g.gain.setValueAtTime(vol(0.12), t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
  osc.connect(g).connect(ac.destination)
  osc.start(t)
  osc.stop(t + 0.11)
}

/**
 * Shoot — laser blip, invaders style
 * Descending sawtooth chirp
 */
export function playShootSound() {
  const ac = getCtx()
  const t = ac.currentTime
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(1200, t)
  osc.frequency.exponentialRampToValueAtTime(300, t + 0.08)
  g.gain.setValueAtTime(vol(0.09), t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
  osc.connect(g).connect(ac.destination)
  osc.start(t)
  osc.stop(t + 0.1)
}

/**
 * Enemy destroyed — satisfying crunch
 */
export function playEnemyHitSound() {
  const ac = getCtx()
  const t = ac.currentTime
  // Noise-like burst using detuned square waves
  for (let i = 0; i < 3; i++) {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(400 + i * 200, t)
    osc.frequency.exponentialRampToValueAtTime(100 + i * 50, t + 0.06)
    g.gain.setValueAtTime(vol(0.06), t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07)
    osc.connect(g).connect(ac.destination)
    osc.start(t)
    osc.stop(t + 0.08)
  }
}

/**
 * Game over — descending Soviet march fragment
 * Three descending tones like a defeated bugle
 */
export function playGameOverSound() {
  const ac = getCtx()
  const t = ac.currentTime
  const notes = [392, 330, 262] // G4, E4, C4 — minor-feel descent
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'square'
    const start = t + i * 0.2
    osc.frequency.setValueAtTime(freq, start)
    osc.frequency.exponentialRampToValueAtTime(freq * 0.9, start + 0.18)
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(vol(0.13), start + 0.02)
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.19)
    osc.connect(g).connect(ac.destination)
    osc.start(start)
    osc.stop(start + 0.2)
  })
}

/**
 * Game switch — quick ascending Soviet fanfare
 * Three rising tones
 */
export function playSwitchSound() {
  const ac = getCtx()
  const t = ac.currentTime
  const notes = [523, 659, 784] // C5, E5, G5 — major triad ascent
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'triangle'
    const start = t + i * 0.08
    osc.frequency.setValueAtTime(freq, start)
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(vol(0.11), start + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.09)
    osc.connect(g).connect(ac.destination)
    osc.start(start)
    osc.stop(start + 0.1)
  })
}

/**
 * Line clear — satisfying Soviet cascade
 * Rapid ascending arpeggio
 */
export function playLineClearSound() {
  const ac = getCtx()
  const t = ac.currentTime
  const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.type = 'square'
    const start = t + i * 0.05
    osc.frequency.setValueAtTime(freq, start)
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(vol(0.10), start + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.12)
    osc.connect(g).connect(ac.destination)
    osc.start(start)
    osc.stop(start + 0.13)
  })
}
