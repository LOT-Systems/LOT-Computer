/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

// One AudioContext for every UI sound (chimes, keyboard clicks, game SFX,
// planner tones). Browsers cap concurrent contexts and each one carries its
// own output-latency + wake-up cost; sharing removes the first-click lag
// when switching between widgets that each lazily spun up their own.
let shared: AudioContext | null = null

export function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!shared || shared.state === 'closed') {
      shared = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    if (shared.state === 'suspended') shared.resume().catch(() => {})
    return shared
  } catch {
    return null
  }
}
