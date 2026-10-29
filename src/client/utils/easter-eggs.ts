/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Easter Egg Detection Engine
 *
 * Scans time, dates, text, and behavioral patterns to award hidden badges.
 * Called from MemoryWidget, JournalWidget, and at check-in time.
 *
 * Categories:
 *   TIME   — hour-of-day triggers (Night Owl, Early Bird, Mirror Hour, Midnight Sigil,
 *             Pi Hour, 404 AM, Sequence Time, Founding Hour)
 *   DATE   — calendar triggers (Solstice, Equinox, LOT Birthday, Palindrome Day, etc.)
 *   TEXT   — word-turn detection v1 (ritual, breathe, ocean, LOT, etc.)
 *             word-turn detection v2 (reboot, 404, glitch, COSMO, quantum, neural, etc.)
 *   BEHAV  — behavioral pattern triggers (overclock, ghost protocol, friday ritual,
 *             quantum leap, speedrun)
 */

import { awardBadge, hasBadge, type BadgeType } from './badges'

// ── Time-based detection ─────────────────────────────────────────────────────

/** Award Night Owl badge if current time is between 01:00–04:00 AM */
export function checkNightOwl(): BadgeType | null {
  if (hasBadge('night_owl')) return null
  const h = new Date().getHours()
  if (h >= 1 && h < 4) {
    awardBadge('night_owl')
    return 'night_owl'
  }
  return null
}

/** Award Early Bird badge if current time is between 05:00–06:00 AM */
export function checkEarlyBird(): BadgeType | null {
  if (hasBadge('early_bird')) return null
  const h = new Date().getHours()
  if (h >= 5 && h < 6) {
    awardBadge('early_bird')
    return 'early_bird'
  }
  return null
}

/** Award Mirror Hour badge if time is exactly 11:11 (±30 seconds) */
export function checkMirrorHour(): BadgeType | null {
  if (hasBadge('mirror_hour')) return null
  const now = new Date()
  if (now.getHours() === 11 && now.getMinutes() === 11) {
    awardBadge('mirror_hour')
    return 'mirror_hour'
  }
  return null
}

/** Award Midnight Sigil when answering a memory question at exactly 00:00 */
export function checkMidnightSigil(): BadgeType | null {
  if (hasBadge('midnight_sigil')) return null
  const now = new Date()
  if (now.getHours() === 0 && now.getMinutes() < 5) {
    awardBadge('midnight_sigil')
    return 'midnight_sigil'
  }
  return null
}

/** Award Pi Hour badge if current time is 3:14 AM */
export function checkPiHour(): BadgeType | null {
  if (hasBadge('pi_hour')) return null
  const now = new Date()
  if (now.getHours() === 3 && now.getMinutes() === 14) {
    awardBadge('pi_hour')
    return 'pi_hour'
  }
  return null
}

/** Award 404 AM badge if current time is 4:04 AM */
export function checkErrorHour(): BadgeType | null {
  if (hasBadge('error_hour')) return null
  const now = new Date()
  if (now.getHours() === 4 && now.getMinutes() === 4) {
    awardBadge('error_hour')
    return 'error_hour'
  }
  return null
}

/** Award Sequence Time badge if current time is 12:34 */
export function checkSequenceTime(): BadgeType | null {
  if (hasBadge('sequence_time')) return null
  const now = new Date()
  if (now.getHours() === 12 && now.getMinutes() === 34) {
    awardBadge('sequence_time')
    return 'sequence_time'
  }
  return null
}

/** Award Founding Hour badge if current time is 04:07 */
export function checkLotHour(): BadgeType | null {
  if (hasBadge('lot_hour')) return null
  const now = new Date()
  if (now.getHours() === 4 && now.getMinutes() === 7) {
    awardBadge('lot_hour')
    return 'lot_hour'
  }
  return null
}

// ── Time v5 — Mirror & Math ──────────────────────────────────────────────────

/** Award Digital Symmetry badge if current time is 10:10 */
export function checkDigitalSymmetry(): BadgeType | null {
  if (hasBadge('digital_symmetry')) return null
  const now = new Date()
  if (now.getHours() === 10 && now.getMinutes() === 10) {
    awardBadge('digital_symmetry')
    return 'digital_symmetry'
  }
  return null
}

/** Award Sequential Boot badge if current time is 01:23 */
export function checkSeqBoot(): BadgeType | null {
  if (hasBadge('seq_boot')) return null
  const now = new Date()
  if (now.getHours() === 1 && now.getMinutes() === 23) {
    awardBadge('seq_boot')
    return 'seq_boot'
  }
  return null
}

/** Award Palindrome Time badge if current time is 21:12 */
export function checkPalindromeTime(): BadgeType | null {
  if (hasBadge('palindrome_time')) return null
  const now = new Date()
  if (now.getHours() === 21 && now.getMinutes() === 12) {
    awardBadge('palindrome_time')
    return 'palindrome_time'
  }
  return null
}

/** Award Tau Signal badge if current time is 06:28 (τ = 2π ≈ 6.28) */
export function checkTauSignal(): BadgeType | null {
  if (hasBadge('tau_signal')) return null
  const now = new Date()
  if (now.getHours() === 6 && now.getMinutes() === 28) {
    awardBadge('tau_signal')
    return 'tau_signal'
  }
  return null
}

// ── Time v6 — Infinite Loop ───────────────────────────────────────────────────

/** Award Nine Lives badge if current time is 09:09 */
export function checkNineLives(): BadgeType | null {
  if (hasBadge('nine_lives')) return null
  const now = new Date()
  if (now.getHours() === 9 && now.getMinutes() === 9) {
    awardBadge('nine_lives')
    return 'nine_lives'
  }
  return null
}

/** Award Hex Hour badge if current time is 16:16 (0x10:0x10) */
export function checkHexHour(): BadgeType | null {
  if (hasBadge('hex_hour')) return null
  const now = new Date()
  if (now.getHours() === 16 && now.getMinutes() === 16) {
    awardBadge('hex_hour')
    return 'hex_hour'
  }
  return null
}

/** Award Final Frame badge if current time is 23:59 */
export function checkFinalFrame(): BadgeType | null {
  if (hasBadge('final_frame')) return null
  const now = new Date()
  if (now.getHours() === 23 && now.getMinutes() === 59) {
    awardBadge('final_frame')
    return 'final_frame'
  }
  return null
}

/** Award Year Signal badge if current time is 20:26 (LOT founding year) */
export function checkYearSignal(): BadgeType | null {
  if (hasBadge('year_signal')) return null
  const now = new Date()
  if (now.getHours() === 20 && now.getMinutes() === 26) {
    awardBadge('year_signal')
    return 'year_signal'
  }
  return null
}

// ── Time v7 — Pixel Hours ─────────────────────────────────────────────────────

export function checkDeepNight(): BadgeType | null {
  if (hasBadge('deep_night')) return null
  const now = new Date()
  if (now.getHours() === 2 && now.getMinutes() === 2) {
    awardBadge('deep_night')
    return 'deep_night'
  }
  return null
}

export function checkMiddaySignal(): BadgeType | null {
  if (hasBadge('midday_signal')) return null
  const now = new Date()
  if (now.getHours() === 14 && now.getMinutes() === 14) {
    awardBadge('midday_signal')
    return 'midday_signal'
  }
  return null
}

export function checkLiminalHour(): BadgeType | null {
  if (hasBadge('liminal_hour')) return null
  const now = new Date()
  if (now.getHours() === 5 && now.getMinutes() === 55) {
    awardBadge('liminal_hour')
    return 'liminal_hour'
  }
  return null
}

export function checkSacredTriple(): BadgeType | null {
  if (hasBadge('sacred_triple')) return null
  const now = new Date()
  if (now.getHours() === 3 && now.getMinutes() === 33) {
    awardBadge('sacred_triple')
    return 'sacred_triple'
  }
  return null
}

// ── Time v8 — Clock Cycles ────────────────────────────────────────────────────

export function checkClockFortyTwo(): BadgeType | null {
  if (hasBadge('clock_forty_two')) return null
  const now = new Date()
  if (now.getHours() === 0 && now.getMinutes() === 42) {
    awardBadge('clock_forty_two')
    return 'clock_forty_two'
  }
  return null
}

export function checkNoonKernel(): BadgeType | null {
  if (hasBadge('noon_kernel')) return null
  const now = new Date()
  if (now.getHours() === 12 && now.getMinutes() === 0) {
    awardBadge('noon_kernel')
    return 'noon_kernel'
  }
  return null
}

export function checkByteTime(): BadgeType | null {
  if (hasBadge('byte_time')) return null
  const now = new Date()
  if (now.getHours() === 8 && now.getMinutes() === 8) {
    awardBadge('byte_time')
    return 'byte_time'
  }
  return null
}

export function checkStackMirror(): BadgeType | null {
  if (hasBadge('stack_mirror')) return null
  const now = new Date()
  if (now.getHours() === 17 && now.getMinutes() === 17) {
    awardBadge('stack_mirror')
    return 'stack_mirror'
  }
  return null
}

// ── Time v9 — Power-Up Hours ──────────────────────────────────────────────────

export function checkLuckySeven(): BadgeType | null {
  if (hasBadge('lucky_seven')) return null
  const now = new Date()
  if (now.getHours() === 7 && now.getMinutes() === 0) {
    awardBadge('lucky_seven')
    return 'lucky_seven'
  }
  return null
}

export function checkMirrorPlay(): BadgeType | null {
  if (hasBadge('mirror_play')) return null
  const now = new Date()
  if (now.getHours() === 15 && now.getMinutes() === 15) {
    awardBadge('mirror_play')
    return 'mirror_play'
  }
  return null
}

export function checkNeonStack(): BadgeType | null {
  if (hasBadge('neon_stack')) return null
  const now = new Date()
  if (now.getHours() === 19 && now.getMinutes() === 19) {
    awardBadge('neon_stack')
    return 'neon_stack'
  }
  return null
}

export function checkFourAces(): BadgeType | null {
  if (hasBadge('four_aces')) return null
  const now = new Date()
  if (now.getHours() === 4 && now.getMinutes() === 44) {
    awardBadge('four_aces')
    return 'four_aces'
  }
  return null
}

// ── Time v10 — Arcane Hours ───────────────────────────────────────────────────

export function checkDawnGate(): BadgeType | null {
  if (hasBadge('dawn_gate')) return null
  const now = new Date()
  if (now.getHours() === 6 && now.getMinutes() === 6) {
    awardBadge('dawn_gate')
    return 'dawn_gate'
  }
  return null
}

export function checkNoonFold(): BadgeType | null {
  if (hasBadge('noon_fold')) return null
  const now = new Date()
  if (now.getHours() === 12 && now.getMinutes() === 21) {
    awardBadge('noon_fold')
    return 'noon_fold'
  }
  return null
}

export function checkEveningPrime(): BadgeType | null {
  if (hasBadge('evening_prime')) return null
  const now = new Date()
  if (now.getHours() === 21 && now.getMinutes() === 0) {
    awardBadge('evening_prime')
    return 'evening_prime'
  }
  return null
}

export function checkNightMirror(): BadgeType | null {
  if (hasBadge('night_mirror')) return null
  const now = new Date()
  if (now.getHours() === 23 && now.getMinutes() === 23) {
    awardBadge('night_mirror')
    return 'night_mirror'
  }
  return null
}

// ── Time v11 — Navigator Hours ────────────────────────────────────────────────

export function checkAfternoonMirror(): BadgeType | null {
  if (hasBadge('afternoon_mirror')) return null
  const now = new Date()
  if (now.getHours() === 13 && now.getMinutes() === 13) {
    awardBadge('afternoon_mirror')
    return 'afternoon_mirror'
  }
  return null
}

export function checkNavigatorDawn(): BadgeType | null {
  if (hasBadge('navigator_dawn')) return null
  const now = new Date()
  if (now.getHours() === 5 && now.getMinutes() === 12) {
    awardBadge('navigator_dawn')
    return 'navigator_dawn'
  }
  return null
}

export function checkAnswerHourV11(): BadgeType | null {
  if (hasBadge('answer_hour_v11')) return null
  const now = new Date()
  if (now.getHours() === 18 && now.getMinutes() === 42) {
    awardBadge('answer_hour_v11')
    return 'answer_hour_v11'
  }
  return null
}

export function checkPalindromeCheck(): BadgeType | null {
  if (hasBadge('palindrome_check')) return null
  const now = new Date()
  if (now.getHours() === 10 && now.getMinutes() === 1) {
    awardBadge('palindrome_check')
    return 'palindrome_check'
  }
  return null
}

// ── Time v14 — Mission Control Hours ──────────────────────────────────────────

export function checkLuckyPair(): BadgeType | null {
  if (hasBadge('lucky_pair')) return null
  const now = new Date()
  if (now.getHours() === 7 && now.getMinutes() === 7) {
    awardBadge('lucky_pair')
    return 'lucky_pair'
  }
  return null
}

export function checkVisionYear(): BadgeType | null {
  if (hasBadge('vision_year')) return null
  const now = new Date()
  if (now.getHours() === 20 && now.getMinutes() === 20) {
    awardBadge('vision_year')
    return 'vision_year'
  }
  return null
}

export function checkBinaryTriple(): BadgeType | null {
  if (hasBadge('binary_triple')) return null
  const now = new Date()
  if (now.getHours() === 2 && now.getMinutes() === 22) {
    awardBadge('binary_triple')
    return 'binary_triple'
  }
  return null
}

export function checkSignalNine(): BadgeType | null {
  if (hasBadge('signal_nine')) return null
  const now = new Date()
  if (now.getHours() === 15 && now.getMinutes() === 45) {
    awardBadge('signal_nine')
    return 'signal_nine'
  }
  return null
}

/**
 * Run all time-based checks on a check-in event.
 * Returns array of newly awarded badge IDs.
 */
export function checkTimeEasterEggs(): BadgeType[] {
  const awarded: BadgeType[] = []
  const checks = [
    checkNightOwl, checkEarlyBird, checkMirrorHour,
    checkPiHour, checkErrorHour, checkSequenceTime, checkLotHour,
    checkDigitalSymmetry, checkSeqBoot, checkPalindromeTime, checkTauSignal,
    checkNineLives, checkHexHour, checkFinalFrame, checkYearSignal,
    // v7 — Pixel Hours
    checkDeepNight, checkMiddaySignal, checkLiminalHour, checkSacredTriple,
    // v8 — Clock Cycles
    checkClockFortyTwo, checkNoonKernel, checkByteTime, checkStackMirror,
    // v9 — Power-Up Hours
    checkLuckySeven, checkMirrorPlay, checkNeonStack, checkFourAces,
    // v10 — Arcane Hours
    checkDawnGate, checkNoonFold, checkEveningPrime, checkNightMirror,
    // v11 — Navigator Hours
    checkAfternoonMirror, checkNavigatorDawn, checkAnswerHourV11, checkPalindromeCheck,
    // v14 — Mission Control Hours
    checkLuckyPair, checkVisionYear, checkBinaryTriple, checkSignalNine,
    // v15 — Oracle Hours
    checkFirstCode, checkLeetHour, checkQuadSignal, checkSignalGate,
  ]
  for (const check of checks) {
    const result = check()
    if (result) awarded.push(result)
  }
  return awarded
}

// ── Date-based detection ─────────────────────────────────────────────────────

/** Check if a date string (YYYY-MM-DD) is a palindrome */
function isPalindromeDate(dateStr: string): boolean {
  const d = dateStr.replace(/-/g, '')
  return d === d.split('').reverse().join('')
}

/** Award calendar easter egg badges based on current date */
export function checkCalendarEasterEggs(): BadgeType[] {
  const awarded: BadgeType[] = []
  const now = new Date()
  const month = now.getMonth() + 1  // 1-indexed
  const day = now.getDate()
  const dateStr = now.toISOString().slice(0, 10)

  // Solstice: June 21 or December 21
  if (!hasBadge('solstice') && (month === 6 && day === 21) || (month === 12 && day === 21)) {
    awardBadge('solstice')
    awarded.push('solstice')
  }

  // Equinox: March 20 or September 22
  if (!hasBadge('equinox') && ((month === 3 && day === 20) || (month === 9 && day === 22))) {
    awardBadge('equinox')
    awarded.push('equinox')
  }

  // LOT Birthday: April 7
  if (!hasBadge('lot_birthday') && month === 4 && day === 7) {
    awardBadge('lot_birthday')
    awarded.push('lot_birthday')
  }

  // New Year Sage: January 1
  if (!hasBadge('new_year_sage') && month === 1 && day === 1) {
    awardBadge('new_year_sage')
    awarded.push('new_year_sage')
  }

  // Pi Day: March 14
  if (!hasBadge('pi_day') && month === 3 && day === 14) {
    awardBadge('pi_day')
    awarded.push('pi_day')
  }

  // Palindrome Day
  if (!hasBadge('palindrome_day') && isPalindromeDate(dateStr)) {
    awardBadge('palindrome_day')
    awarded.push('palindrome_day')
  }

  // ── Calendar v4 — Nerd & Cosmic ────────────────────────────────────────────

  // Signal Wars: May 4 — Star Wars Day
  if (!hasBadge('signal_wars') && month === 5 && day === 4) {
    awardBadge('signal_wars')
    awarded.push('signal_wars')
  }

  // Programmer's Day: Sep 12 or 13 (day 256 in non-leap/leap years)
  if (!hasBadge('prog_day') && month === 9 && (day === 12 || day === 13)) {
    awardBadge('prog_day')
    awarded.push('prog_day')
  }

  // Ada Protocol: December 9 — Ada Lovelace Day
  if (!hasBadge('ada_protocol') && month === 12 && day === 9) {
    awardBadge('ada_protocol')
    awarded.push('ada_protocol')
  }

  // ── Calendar v5 ────────────────────────────────────────────────────────────

  // Groundhog Loop: February 2
  if (!hasBadge('groundhog_loop') && month === 2 && day === 2) {
    awardBadge('groundhog_loop')
    awarded.push('groundhog_loop')
  }

  // Binary Day: October 10
  if (!hasBadge('binary_day') && month === 10 && day === 10) {
    awardBadge('binary_day')
    awarded.push('binary_day')
  }

  // Fibonacci Day: November 23 (1,1,2,3)
  if (!hasBadge('fibonacci_day') && month === 11 && day === 23) {
    awardBadge('fibonacci_day')
    awarded.push('fibonacci_day')
  }

  // ── Calendar v6 — The Hacker Calendar ──────────────────────────────────────

  // DOS Day: April 4 — 04/04
  if (!hasBadge('dos_day') && month === 4 && day === 4) {
    awardBadge('dos_day')
    awarded.push('dos_day')
  }

  // 11/11 alignment: November 11
  if (!hasBadge('eleven_eleven') && month === 11 && day === 11) {
    awardBadge('eleven_eleven')
    awarded.push('eleven_eleven')
  }

  // March Protocol: March 1
  if (!hasBadge('march_protocol') && month === 3 && day === 1) {
    awardBadge('march_protocol')
    awarded.push('march_protocol')
  }

  // ── Calendar v7 — Sci-Fi Calendar ──────────────────────────────────────────

  // Towel Day: May 25 (Hitchhiker's Guide to the Galaxy)
  if (!hasBadge('towel_day') && month === 5 && day === 25) {
    awardBadge('towel_day')
    awarded.push('towel_day')
  }

  // COSMO Founding: July 1 (COSMO® Founded 1 July 2024)
  if (!hasBadge('cosmo_founding') && month === 7 && day === 1) {
    awardBadge('cosmo_founding')
    awarded.push('cosmo_founding')
  }

  // Halloween Protocol: October 31
  if (!hasBadge('halloween_protocol') && month === 10 && day === 31) {
    awardBadge('halloween_protocol')
    awarded.push('halloween_protocol')
  }

  // ── Calendar v8 — Game Anniversaries ────────────────────────────────────────

  // New Year Signal: January 1
  if (!hasBadge('new_year_sig') && month === 1 && day === 1) {
    awardBadge('new_year_sig')
    awarded.push('new_year_sig')
  }

  // Sonic Day: September 9 — Sonic the Hedgehog birthday
  if (!hasBadge('sonic_day') && month === 9 && day === 9) {
    awardBadge('sonic_day')
    awarded.push('sonic_day')
  }

  // Winter Code: December 25 — Holiday Protocol
  if (!hasBadge('winter_code') && month === 12 && day === 25) {
    awardBadge('winter_code')
    awarded.push('winter_code')
  }

  // ── Calendar v9 — Sci-Fi Literary Calendar ────────────────────────────────

  // Turing Day: June 23 — Alan Turing born 1912
  if (!hasBadge('turing_day') && month === 6 && day === 23) {
    awardBadge('turing_day')
    awarded.push('turing_day')
  }

  // Moon Landing: July 20 — First lunar footprint 1969
  if (!hasBadge('moon_landing') && month === 7 && day === 20) {
    awardBadge('moon_landing')
    awarded.push('moon_landing')
  }

  // Sputnik Signal: October 4 — Sputnik launch 1957
  if (!hasBadge('sputnik_signal') && month === 10 && day === 4) {
    awardBadge('sputnik_signal')
    awarded.push('sputnik_signal')
  }

  // ── Calendar v10 — Navigation Dates ──────────────────────────────────────────

  // Voyager Day: August 25 — Voyager 2 launched 1977
  if (!hasBadge('voyager_day') && month === 8 && day === 25) {
    awardBadge('voyager_day')
    awarded.push('voyager_day')
  }

  // Navigator's Day: October 12
  if (!hasBadge('navigators_day') && month === 10 && day === 12) {
    awardBadge('navigators_day')
    awarded.push('navigators_day')
  }

  // Leap Day: February 29 (only exists in leap years)
  if (!hasBadge('leap_day') && month === 2 && day === 29) {
    awardBadge('leap_day')
    awarded.push('leap_day')
  }

  // ── Calendar v11 — Space Firsts ──────────────────────────────────────────────

  // Gagarin Day: April 12 — First human in space 1961
  if (!hasBadge('gagarin_day') && month === 4 && day === 12) {
    awardBadge('gagarin_day')
    awarded.push('gagarin_day')
  }

  // Zarya Signal: November 20 — ISS first module Zarya launched 1998
  if (!hasBadge('zarya_signal') && month === 11 && day === 20) {
    awardBadge('zarya_signal')
    awarded.push('zarya_signal')
  }

  // Pluto Discovered: February 18 — Pluto found by Clyde Tombaugh 1930
  if (!hasBadge('pluto_discovered') && month === 2 && day === 18) {
    awardBadge('pluto_discovered')
    awarded.push('pluto_discovered')
  }

  // ── Calendar v14 — Oracle Calendar ────────────────────────────────────────

  // Infinity Gate: August 8 — 08/08 double infinity
  if (!hasBadge('infinity_gate') && month === 8 && day === 8) {
    awardBadge('infinity_gate')
    awarded.push('infinity_gate')
  }

  // Mole Day: October 23 — 6.02 × 10²³ (Avogadro's number)
  if (!hasBadge('mole_day') && month === 10 && day === 23) {
    awardBadge('mole_day')
    awarded.push('mole_day')
  }

  // World Water Day: March 22 — UN World Water Day
  if (!hasBadge('world_water_day') && month === 3 && day === 22) {
    awardBadge('world_water_day')
    awarded.push('world_water_day')
  }

  // ── Calendar v12 — The Literary Archive ────────────────────────────────────

  // Bard Signal: April 23 — World Book Day / Shakespeare birth & death date
  if (!hasBadge('bard_signal') && month === 4 && day === 23) {
    awardBadge('bard_signal')
    awarded.push('bard_signal')
  }

  // Autumn Code: September 23 — Autumnal Equinox Signal
  if (!hasBadge('autumn_code') && month === 9 && day === 23) {
    awardBadge('autumn_code')
    awarded.push('autumn_code')
  }

  // Tranquility Base: July 20 — Apollo 11 landing (variant of moon_landing)
  if (!hasBadge('tranquility_base') && month === 7 && day === 20) {
    awardBadge('tranquility_base')
    awarded.push('tranquility_base')
  }

  // ── Calendar v13 — The Book of Days ────────────────────────────────────────

  // Asimov Signal: January 2 — Isaac Asimov born 1920 (Foundation, I, Robot)
  if (!hasBadge('asimov_signal') && month === 1 && day === 2) {
    awardBadge('asimov_signal')
    awarded.push('asimov_signal')
  }

  // Tolkien Gate: January 3 — J.R.R. Tolkien born 1892 (The Lord of the Rings)
  if (!hasBadge('tolkien_gate') && month === 1 && day === 3) {
    awardBadge('tolkien_gate')
    awarded.push('tolkien_gate')
  }

  // Bloomsday: June 16 — James Joyce's Ulysses day (Dublin, 1904)
  if (!hasBadge('bloomsday') && month === 6 && day === 16) {
    awardBadge('bloomsday')
    awarded.push('bloomsday')
  }

  // ── Calendar v15 — GAME DATE ARCHIVE ──────────────────────────────────────

  // Tetris Day: June 6 — Tetris created by Alexey Pajitnov, 1984
  if (!hasBadge('tetris_day') && month === 6 && day === 6) {
    awardBadge('tetris_day')
    awarded.push('tetris_day')
  }

  // Zelda Day: February 21 — The Legend of Zelda released in Japan, 1986
  if (!hasBadge('zelda_day') && month === 2 && day === 21) {
    awardBadge('zelda_day')
    awarded.push('zelda_day')
  }

  // Pac-Man Day: May 22 — Pac-Man released in Japan, 1980
  if (!hasBadge('pac_man_day') && month === 5 && day === 22) {
    awardBadge('pac_man_day')
    awarded.push('pac_man_day')
  }

  // ── Calendar v16 — THE SIGNAL ARCHIVE ──────────────────────────────────────

  // Sputnik Day: October 4 — Sputnik 1 launched 1957, first signal from orbit
  if (!hasBadge('sputnik_day') && month === 10 && day === 4) {
    awardBadge('sputnik_day')
    awarded.push('sputnik_day')
  }

  // Arecibo Day: November 16 — Arecibo message broadcast 1974
  if (!hasBadge('arecibo_day') && month === 11 && day === 16) {
    awardBadge('arecibo_day')
    awarded.push('arecibo_day')
  }

  // Pioneer Plaque: March 2 — Pioneer 10 launched 1972
  if (!hasBadge('pioneer_plaque') && month === 3 && day === 2) {
    awardBadge('pioneer_plaque')
    awarded.push('pioneer_plaque')
  }

  // ── Calendar v17 — THE SCIENCE CIRCUIT ──────────────────────────────────────
  // DNA Day: April 25 — Watson & Crick publish double helix, 1953
  if (!hasBadge('dna_day') && month === 4 && day === 25) {
    awardBadge('dna_day')
    awarded.push('dna_day')
  }
  // World Brain Day: July 22
  if (!hasBadge('brain_day') && month === 7 && day === 22) {
    awardBadge('brain_day')
    awarded.push('brain_day')
  }
  // Darwin Manuscript: November 24 — On the Origin of Species published, 1859
  if (!hasBadge('darwin_manuscript') && month === 11 && day === 24) {
    awardBadge('darwin_manuscript')
    awarded.push('darwin_manuscript')
  }

  // ── Calendar v18 — THE AUTHOR'S CALENDAR ────────────────────────────────────
  // Asimov Birthday: January 2 — Isaac Asimov born 1920
  if (!hasBadge('asimov_birthday') && month === 1 && day === 2) {
    awardBadge('asimov_birthday')
    awarded.push('asimov_birthday')
  }
  // Tolkien Day: March 25 — fan-designated Tolkien Day (One Ring destroyed)
  if (!hasBadge('tolkien_day') && month === 3 && day === 25) {
    awardBadge('tolkien_day')
    awarded.push('tolkien_day')
  }
  // Sagan Cosmos: November 9 — Carl Sagan born 1934
  if (!hasBadge('sagan_cosmos') && month === 11 && day === 9) {
    awardBadge('sagan_cosmos')
    awarded.push('sagan_cosmos')
  }

  // ── Calendar v19 — AUTHOR DATES ──────────────────────────────────────────────
  // Asimov Day: January 2 — Isaac Asimov born 1920 (additional recognition)
  if (!hasBadge('asimov_day') && month === 1 && day === 2) {
    awardBadge('asimov_day')
    awarded.push('asimov_day')
  }
  // Dick Day: December 16 — Philip K. Dick born 1928
  if (!hasBadge('dick_day') && month === 12 && day === 16) {
    awardBadge('dick_day')
    awarded.push('dick_day')
  }
  // Dune Day: August 1 — Dune published by Chilton Books, 1965
  if (!hasBadge('dune_day') && month === 8 && day === 1) {
    awardBadge('dune_day')
    awarded.push('dune_day')
  }

  // ── Calendar v20 — THE EPIC CALENDAR ─────────────────────────────────────────
  // Campbell Birthday: March 26 — Joseph Campbell born 1904
  if (!hasBadge('campbell_birthday') && month === 3 && day === 26) {
    awardBadge('campbell_birthday')
    awarded.push('campbell_birthday')
  }
  // Hobbit Day: September 22 — Bilbo & Frodo Baggins birthday / Tolkien Society Hobbit Day
  if (!hasBadge('hobbit_day') && month === 9 && day === 22) {
    awardBadge('hobbit_day')
    awarded.push('hobbit_day')
  }
  // Odyssey Day: December 21 — Winter Solstice
  if (!hasBadge('odyssey_day') && month === 12 && day === 21) {
    awardBadge('odyssey_day')
    awarded.push('odyssey_day')
  }

  // ── Calendar v21 — THE GAME CALENDAR ─────────────────────────────────────────
  // Mario Day: March 10 — MAR10 = MARIO
  if (!hasBadge('mario_day') && month === 3 && day === 10) {
    awardBadge('mario_day')
    awarded.push('mario_day')
  }
  // Zelda Day: February 21 — The Legend of Zelda original release, Japan 1986
  if (!hasBadge('zelda_day') && month === 2 && day === 21) {
    awardBadge('zelda_day')
    awarded.push('zelda_day')
  }
  // Game Day: September 12 — National Video Game Day
  if (!hasBadge('game_day') && month === 9 && day === 12) {
    awardBadge('game_day')
    awarded.push('game_day')
  }

  // ── Calendar v22 — THE ROGUE CALENDAR ─────────────────────────────────────
  // Hades Day: September 17 — Hades left Early Access (2020)
  if (!hasBadge('hades_day') && month === 9 && day === 17) {
    awardBadge('hades_day')
    awarded.push('hades_day')
  }
  // Spelunky Day: July 4 — Spelunky HD PC release (2012)
  if (!hasBadge('spelunky_day') && month === 7 && day === 4) {
    awardBadge('spelunky_day')
    awarded.push('spelunky_day')
  }
  // Binding Day: September 28 — The Binding of Isaac original release (2011)
  if (!hasBadge('binding_day') && month === 9 && day === 28) {
    awardBadge('binding_day')
    awarded.push('binding_day')
  }

  // ── Calendar v23 — THE PUZZLE CALENDAR ─────────────────────────────────────
  // Portal Day: October 9 — Portal / The Orange Box release (2007)
  if (!hasBadge('portal_day') && month === 10 && day === 9) {
    awardBadge('portal_day')
    awarded.push('portal_day')
  }
  // Witness Day: January 26 — The Witness release (2016)
  if (!hasBadge('witness_day') && month === 1 && day === 26) {
    awardBadge('witness_day')
    awarded.push('witness_day')
  }
  // Obra Dinn Day: October 18 — Return of the Obra Dinn release (2018)
  if (!hasBadge('obra_dinn_day') && month === 10 && day === 18) {
    awardBadge('obra_dinn_day')
    awarded.push('obra_dinn_day')
  }

  // ── Calendar v24 — THE MAP CALENDAR ───────────────────────────────────────
  // Doom Day: December 10 — DOOM release (1993)
  if (!hasBadge('doom_day') && month === 12 && day === 10) {
    awardBadge('doom_day')
    awarded.push('doom_day')
  }
  // Minecraft Day: November 18 — Minecraft full release (2011)
  if (!hasBadge('minecraft_day') && month === 11 && day === 18) {
    awardBadge('minecraft_day')
    awarded.push('minecraft_day')
  }
  // Diablo Day: January 3 — Diablo original release (1996)
  if (!hasBadge('diablo_day') && month === 1 && day === 3) {
    awardBadge('diablo_day')
    awarded.push('diablo_day')
  }

  // ── Calendar v25 — THE CHRONO CALENDAR ───────────────────────────────────
  // Flux Capacitor: October 21 — Back to the Future Day
  if (!hasBadge('flux_capacitor') && month === 10 && day === 21) {
    awardBadge('flux_capacitor')
    awarded.push('flux_capacitor')
  }
  // Moon Signal: July 20 — Apollo 11 Moon Landing (1969)
  if (!hasBadge('moon_signal') && month === 7 && day === 20) {
    awardBadge('moon_signal')
    awarded.push('moon_signal')
  }
  // Vonnegut Day: November 11 — Kurt Vonnegut born (1922)
  if (!hasBadge('vonnegut_day') && month === 11 && day === 11) {
    awardBadge('vonnegut_day')
    awarded.push('vonnegut_day')
  }

  // ── Calendar v26 — THE DUNGEON CALENDAR ──────────────────────────────────
  // Gygax Day: July 27 — Gary Gygax born 1938
  if (!hasBadge('gygax_day') && month === 7 && day === 27) {
    awardBadge('gygax_day')
    awarded.push('gygax_day')
  }
  // Tolkien Signal: January 3 — J.R.R. Tolkien born 1892
  if (!hasBadge('tolkien_signal') && month === 1 && day === 3) {
    awardBadge('tolkien_signal')
    awarded.push('tolkien_signal')
  }
  // Dragon Signal: June 1 — Dragon Magazine Vol. 1 (1976)
  if (!hasBadge('dragon_signal') && month === 6 && day === 1) {
    awardBadge('dragon_signal')
    awarded.push('dragon_signal')
  }
  // FF Signal: Dec 18 — Final Fantasy I released in Japan 1987
  if (!hasBadge('ff_signal') && month === 12 && day === 18) {
    awardBadge('ff_signal')
    awarded.push('ff_signal')
  }
  // Pokémon Signal: Feb 27 — Pokémon Red/Green released in Japan 1996
  if (!hasBadge('pokemon_signal') && month === 2 && day === 27) {
    awardBadge('pokemon_signal')
    awarded.push('pokemon_signal')
  }
  // Dragon Quest Signal: May 27 — Dragon Quest I released in Japan 1986
  if (!hasBadge('dragon_quest_signal') && month === 5 && day === 27) {
    awardBadge('dragon_quest_signal')
    awarded.push('dragon_quest_signal')
  }

  // ── Calendar v28 — THE A.I. CALENDAR ──────────────────────────────────────
  // Shannon Signal: Apr 30 — Claude Shannon born 1916
  if (!hasBadge('shannon_signal') && month === 4 && day === 30) {
    awardBadge('shannon_signal')
    awarded.push('shannon_signal')
  }
  // Lovelace Day: Dec 10 — Ada Lovelace born 1815
  if (!hasBadge('lovelace_day') && month === 12 && day === 10) {
    awardBadge('lovelace_day')
    awarded.push('lovelace_day')
  }
  // Von Neumann Day: Dec 28 — John von Neumann born 1903
  if (!hasBadge('von_neumann_day') && month === 12 && day === 28) {
    awardBadge('von_neumann_day')
    awarded.push('von_neumann_day')
  }

  return awarded
}

// ── Behavioral detection ─────────────────────────────────────────────────────

/** Check and award Friday Ritual badge (4 consecutive Fridays) */
export function checkFridayRitual(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('friday_ritual')) return null

  const now = new Date()
  if (now.getDay() !== 5) return null  // Not Friday

  try {
    const key = 'friday_ritual_dates'
    const stored = localStorage.getItem(key)
    const dates: string[] = stored ? JSON.parse(stored) : []
    const todayStr = now.toISOString().slice(0, 10)

    if (!dates.includes(todayStr)) {
      dates.push(todayStr)
      // Keep only last 30 days of Fridays
      const recent = dates.slice(-8)
      localStorage.setItem(key, JSON.stringify(recent))

      // Count consecutive Fridays (7 days apart)
      if (recent.length >= 4) {
        const sorted = [...recent].sort()
        let consecutive = 1
        for (let i = sorted.length - 1; i > 0; i--) {
          const diff = Math.round(
            (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime())
            / (1000 * 60 * 60 * 24)
          )
          if (diff === 7) {
            consecutive++
            if (consecutive >= 4) {
              awardBadge('friday_ritual')
              return 'friday_ritual'
            }
          } else {
            break
          }
        }
      }
    }
  } catch { /* non-critical */ }

  return null
}

/**
 * Check and award Ghost Protocol badge (7-day absence then return).
 * Call this on every check-in — it reads lastActivity from localStorage.
 */
export function checkGhostProtocol(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('ghost_protocol')) return null

  try {
    const lastActivity = localStorage.getItem('last_activity_date')
    if (!lastActivity) return null

    const daysSince = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSince >= 7) {
      awardBadge('ghost_protocol')
      return 'ghost_protocol'
    }
  } catch { /* non-critical */ }

  return null
}

/**
 * Check and award Silent Hour badge (24h absence then return).
 * More gentle than Ghost Protocol.
 */
export function checkSilentHour(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('silent_hour')) return null

  try {
    const lastActivity = localStorage.getItem('last_activity_date')
    if (!lastActivity) return null

    const hoursSince = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60)
    )

    if (hoursSince >= 24 && hoursSince < 168) { // 24h–7d (Ghost Protocol takes over at 7d)
      awardBadge('silent_hour')
      return 'silent_hour'
    }
  } catch { /* non-critical */ }

  return null
}

/** Record the current time as last activity */
export function recordActivity(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('last_activity_date', new Date().toISOString())
  } catch { /* non-critical */ }
}

/**
 * Check Overclock badge: 20+ activities in one day.
 * activityCount should be today's total from the server.
 */
export function checkOverclock(activityCount: number): BadgeType | null {
  if (hasBadge('overclock')) return null
  if (activityCount >= 20) {
    awardBadge('overclock')
    return 'overclock'
  }
  return null
}

/**
 * Check Quantum Leap badge: first check-in after a 30+ day gap.
 * Distinct from Ghost Protocol (7 days) — this is the longer return.
 */
export function checkQuantumLeap(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('quantum_leap')) return null

  try {
    const lastActivity = localStorage.getItem('last_activity_date')
    if (!lastActivity) return null

    const daysSince = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSince >= 30) {
      awardBadge('quantum_leap')
      return 'quantum_leap'
    }
  } catch { /* non-critical */ }

  return null
}

/**
 * Check Speedrun badge: 5 check-ins within 60 minutes.
 * activityTimestamps should be ISO strings of today's check-ins.
 */
export function checkSpeedrun(activityTimestamps: string[]): BadgeType | null {
  if (hasBadge('speedrun')) return null
  if (activityTimestamps.length < 5) return null

  const sorted = [...activityTimestamps].sort()
  // Check any window of 5 consecutive events fits within 60 min
  for (let i = 0; i <= sorted.length - 5; i++) {
    const window = sorted.slice(i, i + 5)
    const span = new Date(window[4]).getTime() - new Date(window[0]).getTime()
    if (span <= 60 * 60 * 1000) {
      awardBadge('speedrun')
      return 'speedrun'
    }
  }
  return null
}

// ── Behavioral v4 — Deep Archive ─────────────────────────────────────────────

/**
 * Check Night Scribe badge: journal entry submitted after 23:30.
 * Call this when a journal entry is saved.
 */
export function checkNightScribe(): BadgeType | null {
  if (hasBadge('night_scribe')) return null
  const now = new Date()
  // After 23:30 or before 00:30 (deep night window)
  if (now.getHours() === 23 && now.getMinutes() >= 30) {
    awardBadge('night_scribe')
    return 'night_scribe'
  }
  return null
}

/**
 * Check Epic Transmission badge: memory answer ≥1,000 characters.
 * Call this when a memory answer is submitted.
 */
export function checkEpicTransmission(answerText: string): BadgeType | null {
  if (hasBadge('epic_transmission')) return null
  if (answerText.length >= 1000) {
    awardBadge('epic_transmission')
    return 'epic_transmission'
  }
  return null
}

/**
 * Check Analog Reboot badge: return after a 180+ day gap.
 * Distinct from Ghost Protocol (7d) and Quantum Leap (30d).
 */
export function checkAnalogReboot(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('analog_reboot')) return null

  try {
    const lastActivity = localStorage.getItem('last_activity_date')
    if (!lastActivity) return null

    const daysSince = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSince >= 180) {
      awardBadge('analog_reboot')
      return 'analog_reboot'
    }
  } catch { /* non-critical */ }

  return null
}

// ── Behavioral v5 ────────────────────────────────────────────────────────────

/**
 * Check Deep Scribe badge: journal entry ≥500 characters.
 * Call this when a journal entry is saved.
 */
export function checkDeepScribe(journalText: string): BadgeType | null {
  if (hasBadge('deep_scribe')) return null
  if (journalText.length >= 500) {
    awardBadge('deep_scribe')
    return 'deep_scribe'
  }
  return null
}

/**
 * Check Phoenix Streak badge: user rebuilt a streak after it broke.
 * Call this when a streak is restored (previousStreak was 0, currentStreak > 0 again).
 * streakBroke: was the streak at 0 recently (from stats)
 */
export function checkPhoenixStreak(previousStreakBroke: boolean, currentStreak: number): BadgeType | null {
  if (hasBadge('phoenix_streak')) return null
  if (previousStreakBroke && currentStreak >= 3) {
    awardBadge('phoenix_streak')
    return 'phoenix_streak'
  }
  return null
}

/**
 * Check Time Anchor badge: check-in at the same clock hour 14 consecutive days.
 * Stores hourly check-in history in localStorage.
 * Call this on every check-in.
 */
export function checkTimeAnchor(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('time_anchor')) return null

  try {
    const now = new Date()
    const hour = now.getHours()
    const todayStr = now.toISOString().slice(0, 10)
    const key = 'time_anchor_log'
    const stored = localStorage.getItem(key)
    const log: Array<{ date: string; hour: number }> = stored ? JSON.parse(stored) : []

    // Only log once per day
    const todayEntry = log.find(e => e.date === todayStr)
    if (!todayEntry) {
      log.push({ date: todayStr, hour })
      // Keep only last 20 days
      const recent = log.slice(-20)
      localStorage.setItem(key, JSON.stringify(recent))

      // Count consecutive days at the same hour
      if (recent.length >= 14) {
        const sorted = [...recent].sort((a, b) => a.date.localeCompare(b.date))
        let consecutive = 1
        const anchorHour = sorted[sorted.length - 1].hour
        for (let i = sorted.length - 1; i > 0; i--) {
          const prev = sorted[i - 1]
          const curr = sorted[i]
          const dayDiff = Math.round(
            (new Date(curr.date).getTime() - new Date(prev.date).getTime())
            / (1000 * 60 * 60 * 24)
          )
          if (dayDiff === 1 && prev.hour === anchorHour) {
            consecutive++
            if (consecutive >= 14) {
              awardBadge('time_anchor')
              return 'time_anchor'
            }
          } else {
            break
          }
        }
      }
    }
  } catch { /* non-critical */ }

  return null
}

// ── Word turn detection ───────────────────────────────────────────────────────

/** Word turn map: phrase patterns → badge IDs */
const WORD_TURNS: Array<{ patterns: RegExp; badge: BadgeType }> = [
  // ── v1 — Core word turns ──────────────────────────────────────────────────
  { patterns: /\b(ritual|rituals)\b/i,             badge: 'ritual_keeper' },
  { patterns: /\b(breathe|breathing|breath)\b/i,   badge: 'breath_anchor' },
  { patterns: /\b(grateful|gratitude|thankful)\b/i,badge: 'gratitude_node' },
  { patterns: /\b(ocean|water|sea|tide|wave)\b/i,  badge: 'aquatic_resonance' },
  { patterns: /\b(stars?|galaxy|constellation)\b/i,badge: 'stargazer' },
  { patterns: /\bhome\b/i,                          badge: 'grounded_signal' },
  { patterns: /\b(dream|dreaming|dreamed|dreamt)\b/i, badge: 'dream_log' },
  { patterns: /\b(pain|painful|difficult|struggle|hard|suffering)\b/i, badge: 'courage_pulse' },
  { patterns: /\b(love|heart|loving|beloved)\b/i,  badge: 'heart_signal' },
  { patterns: /\b(silence|quiet|still|stillness)\b/i, badge: 'the_quiet' },
  { patterns: /\b(future|tomorrow|ahead|forward)\b/i, badge: 'horizon_seeker' },
  { patterns: /\bLOT\b/,                            badge: 'meta_signal' },
  // ── v2 — Sci-Fi Arcade Expansion ─────────────────────────────────────────
  { patterns: /\b(reboot|restart)\b/i,             badge: 'reboot_sequence' },
  { patterns: /\b404\b/,                            badge: 'not_lost_404' },
  { patterns: /\bglitch(ed|ing)?\b/i,              badge: 'signal_glitch' },
  { patterns: /\bCOSMO\b/,                          badge: 'cosmic_twin' },
  { patterns: /\bquantum\b/i,                       badge: 'quantum_observer' },
  { patterns: /\bneural\b/i,                        badge: 'neural_architect' },
  { patterns: /\bcode\b/i,                          badge: 'code_witch' },
  { patterns: /\b(sleep|resting|rest)\b/i,          badge: 'recharge_mode' },
  { patterns: /\b(coffee|tea|espresso)\b/i,         badge: 'fuel_protocol' },
  { patterns: /\bmusic\b/i,                          badge: 'frequency' },
  { patterns: /\b(run|running|walk|walking|jog|jogging)\b/i, badge: 'kinetic_protocol' },
  { patterns: /\b(sun|sunlight|sunbeam|light)\b/i, badge: 'solar_charge' },
  { patterns: /\b(fear|afraid|scared|frightened)\b/i, badge: 'shadow_protocol' },
  { patterns: /\b(change|changing|changed)\b/i,    badge: 'phase_shift' },
  { patterns: /\b(accept|acceptance|let go|letting go|release)\b/i, badge: 'acceptance_node' },
  { patterns: /\b(now|moment|present)\b/i,         badge: 'present_moment' },
  { patterns: /\b(universe|cosmos|cosmic)\b/i,     badge: 'cosmic_scale' },
  { patterns: /\b(alive|living|life)\b/i,          badge: 'vital_signal' },
  // ── v5 — Signal Codex ────────────────────────────────────────────────────
  { patterns: /\bsolitude\b/i,                      badge: 'solitude_mode' },
  { patterns: /\bwonder(ed|ing|s)?\b/i,             badge: 'wonder_protocol' },
  { patterns: /\bphoenix\b/i,                       badge: 'phoenix_sequence' },
  { patterns: /\b(align|aligned|aligning|alignment)\b/i, badge: 'alignment_lock' },
  { patterns: /\b(witness|witnessed|witnessing)\b/i,badge: 'witness_log' },
  { patterns: /\b(orbit|orbits|orbiting|orbital)\b/i, badge: 'orbital_pattern' },
  { patterns: /\b(forge|forged|forging)\b/i,        badge: 'forge_protocol' },
  { patterns: /\bmind\b/i,                           badge: 'neuro_link' },
  { patterns: /\b(light|lights|lit)\b/i,             badge: 'photon_signal' },
  { patterns: /\b(energy|energized|energetic)\b/i,  badge: 'field_charge' },
  { patterns: /\b(voyage|voyaging)\b/i,              badge: 'voyage_mode' },
  { patterns: /\bgravity\b/i,                        badge: 'gravity_lock' },
  // ── v6 — The Becoming Lexicon ────────────────────────────────────────────
  { patterns: /\b(surrender|surrendered|surrendering)\b/i, badge: 'surrender_signal' },
  { patterns: /\b(restore|restored|restoring|restoration)\b/i, badge: 'restore_protocol' },
  { patterns: /\b(anchor|anchored|anchoring)\b/i,   badge: 'anchor_lock' },
  { patterns: /\bthreshold\b/i,                      badge: 'threshold_gate' },
  { patterns: /\b(emerge|emerged|emerging|emergence)\b/i, badge: 'emergence_sequence' },
  { patterns: /\b(exhale|exhaled|exhaling)\b/i,      badge: 'exhale_wave' },
  { patterns: /\b(clear|cleared|clearing|clarity)\b/i, badge: 'clear_field' },
  { patterns: /\b(rise|risen|rising|arose)\b/i,      badge: 'rise_signal' },
  { patterns: /\b(presence|present)\b/i,             badge: 'presence_core' },
  { patterns: /\bbold\b/i,                           badge: 'bold_protocol' },
  { patterns: /\b(trust|trusted|trusting)\b/i,       badge: 'trust_lock' },
  { patterns: /\b(shift|shifted|shifting)\b/i,       badge: 'shift_sequence' },
  // ── v7 — The Rogue Archive ────────────────────────────────────────────────
  { patterns: /\bloot(ed|ing)?\b/i,                  badge: 'loot_drop' },
  { patterns: /\bboss(es)?\b/i,                      badge: 'boss_encounter' },
  { patterns: /\bsave(d|s)?\b/i,                     badge: 'save_state' },
  { patterns: /\brespawn(ed|ing)?\b/i,               badge: 'respawn_point' },
  { patterns: /\bgrind(ing|ed)?\b/i,                 badge: 'grind_mode' },
  { patterns: /\blevel(ed|ing|s)?\b/i,               badge: 'level_gained' },
  { patterns: /\bquest(s|ed|ing)?\b/i,               badge: 'quest_log' },
  { patterns: /\bpotion(s)?\b/i,                     badge: 'potion_protocol' },
  { patterns: /\bdungeon(s)?\b/i,                    badge: 'dungeon_cleared' },
  { patterns: /\barmou?r(ed|ing)?\b/i,               badge: 'armor_up' },
  { patterns: /\bstealth\b/i,                        badge: 'stealth_mode' },
  { patterns: /\brogue\b/i,                          badge: 'rogue_state' },
  // ── v8 — The Mainframe ────────────────────────────────────────────────────
  { patterns: /\bcompile(d|s|r)?\b/i,                badge: 'compile_run' },
  { patterns: /\bexecute(d|s)?\b/i,                  badge: 'execute_path' },
  { patterns: /\bbuffer(ed|ing|s)?\b/i,              badge: 'buffer_flush' },
  { patterns: /\bstack(ed|ing|s)?\b/i,               badge: 'stack_clear' },
  { patterns: /\bpatch(ed|es|ing)?\b/i,              badge: 'patch_applied' },
  { patterns: /\bfork(ed|ing|s)?\b/i,                badge: 'fork_event' },
  { patterns: /\bterminal\b/i,                       badge: 'terminal_session' },
  { patterns: /\bnull\b/i,                           badge: 'null_pointer' },
  { patterns: /\bseed(ed|ing|s)?\b/i,                badge: 'seed_planted' },
  { patterns: /\bloop(ed|ing|s)?\b/i,                badge: 'loop_detected' },
  { patterns: /\broot\b/i,                           badge: 'root_access' },
  { patterns: /\bdebug(ged|ging|s)?\b/i,             badge: 'debug_mode_badge' },
  // ── v9 — The Arcade Cabinet ──────────────────────────────────────────────────
  { patterns: /\bcoin(s)?\b/i,                       badge: 'coin_dropped' },
  { patterns: /\bpixel(s|ated|ate)?\b/i,             badge: 'pixel_recognized' },
  { patterns: /\bsprite(s)?\b/i,                     badge: 'sprite_active' },
  { patterns: /\bscore(d|s|board)?\b/i,              badge: 'score_logged' },
  { patterns: /\b(life|lives|extra.?life)\b/i,       badge: 'life_remaining' },
  { patterns: /\bjoystick(s)?\b/i,                   badge: 'input_received' },
  { patterns: /\bblip(s|ped|ping)?\b/i,              badge: 'signal_blip' },
  { patterns: /\bcontinue(d|s)?\b/i,                 badge: 'continue_selected' },
  { patterns: /\bhigh.?score\b/i,                    badge: 'high_signal' },
  { patterns: /\breset(s|ting|ted)?\b/i,             badge: 'reset_protocol' },
  { patterns: /\bquarter(s|back)?\b/i,               badge: 'quarter_offered' },
  { patterns: /\bcheat(s|ed|ing|.?code)?\b/i,        badge: 'cheat_code_entered' },
  // ── v10 — The Spell Book ──────────────────────────────────────────────────────
  { patterns: /\bspell(s|ed|ing|bound)?\b/i,         badge: 'spell_cast' },
  { patterns: /\bcast(s|ing)?\b/i,                   badge: 'cast_signal' },
  { patterns: /\binvoke(d|s|r)?\b/i,                 badge: 'invoked' },
  { patterns: /\barcane\b/i,                         badge: 'arcane_entry' },
  { patterns: /\bsigil(s)?\b/i,                      badge: 'sigil_drawn' },
  { patterns: /\btome(s)?\b/i,                       badge: 'tome_keeper' },
  { patterns: /\bgrimoire(s)?\b/i,                   badge: 'grimoire_open' },
  { patterns: /\bward(s|ed|ing)?\b/i,                badge: 'ward_active' },
  { patterns: /\bmana\b/i,                           badge: 'mana_check' },
  { patterns: /\bfamiliar(s)?\b/i,                   badge: 'familiar_bond' },
  { patterns: /\bchapter(s)?\b/i,                    badge: 'chapter_mark' },
  { patterns: /\bverse(s)?\b/i,                      badge: 'verse_logged' },
  // ── v11 — The Navigator ───────────────────────────────────────────────────────
  { patterns: /\bdrift(s|ed|ing)?\b/i,               badge: 'nav_drift' },
  { patterns: /\bvector(s|ed|ing)?\b/i,              badge: 'nav_vector' },
  { patterns: /\bbearing(s)?\b/i,                    badge: 'nav_bearing' },
  { patterns: /\bwaypoint(s)?\b/i,                   badge: 'nav_waypoint' },
  { patterns: /\bchart(s|ed|ing)?\b/i,               badge: 'nav_chart' },
  { patterns: /\bmagnetic\b/i,                       badge: 'nav_magnetic' },
  { patterns: /\bmeridian(s)?\b/i,                   badge: 'nav_meridian' },
  { patterns: /\bcourse(s|d)?\b/i,                   badge: 'nav_course' },
  { patterns: /\bheading(s)?\b/i,                    badge: 'nav_heading' },
  { patterns: /\blandmark(s)?\b/i,                   badge: 'nav_landmark' },
  { patterns: /\bnavigate(d|s|r)?\b/i,               badge: 'nav_navigate' },
  { patterns: /\bcompass(es)?\b/i,                   badge: 'nav_compass' },
  // ── Secret Boss word triggers ─────────────────────────────────────────────────
  { patterns: /\bi am lot\b/i,                       badge: 'i_am_lot' },
  { patterns: /\bmalibu\b/i,                         badge: 'malibu' },
  { patterns: /\bkuzya\b/i,                          badge: 'the_cat_knows' },
  { patterns: /\b0451\b/,                            badge: 'key_code' },
  // ── v11 Secret Boss — Terra Incognita word triggers ───────────────────────────
  { patterns: /dead.?reckoning/i,                    badge: 'dead_reckoning_word' },
  { patterns: /terra.?incognita/i,                   badge: 'terra_incognita' },
  { patterns: /(magnetic.?north|true.?north)/i,       badge: 'true_north' },
  // ── v14 — The Starship Deck ───────────────────────────────────────────────
  { patterns: /\blaunch(ed|ing|es)?\b/i,              badge: 'launch_confirmed' },
  { patterns: /\bmission(s)?\b/i,                     badge: 'mission_active' },
  { patterns: /\bastronaut(s)?\b/i,                   badge: 'astronaut_mode' },
  { patterns: /\bcapsule(s)?\b/i,                     badge: 'capsule_entry' },
  { patterns: /\btelemetry\b/i,                       badge: 'telemetry_live' },
  { patterns: /\bcountdown(s)?\b/i,                   badge: 'countdown_initiated' },
  { patterns: /\bre-?entry\b/i,                       badge: 'reentry_burn' },
  { patterns: /\bcrew\b/i,                            badge: 'crew_signal' },
  { patterns: /\bstarship(s)?\b/i,                    badge: 'starship_mode' },
  { patterns: /\bmodule(s)?\b/i,                      badge: 'module_locked' },
  { patterns: /\bdocking\b/i,                         badge: 'docking_complete' },
  { patterns: /\bspacewalk(s|ed|ing)?\b/i,            badge: 'spacewalk_mode' },
  // ── v14 Secret Boss — Final Transmission word triggers ──────────────────────
  { patterns: /\bhouston\b/i,                         badge: 'houston_signal' },
  { patterns: /\bgagarin\b/i,                         badge: 'gagarin_echo' },
  { patterns: /pale.?blue.?dot/i,                     badge: 'sagan_protocol' },
  // ── v15 — The Oracle Archive ─────────────────────────────────────────────
  { patterns: /\boracle(s)?\b/i,                       badge: 'oracle_consulted' },
  { patterns: /\brune(s)?\b/i,                         badge: 'rune_detected' },
  { patterns: /\bprophecy\b|\bprophesy\b/i,             badge: 'prophecy_logged' },
  { patterns: /\bscroll(s)?\b/i,                       badge: 'scroll_opened' },
  { patterns: /\bamplif(y|ied|ying|ication)\b/i,        badge: 'signal_amplified' },
  { patterns: /\brelay(ed|ing|s)?\b/i,                  badge: 'relay_active' },
  { patterns: /\bencrypt(ed|ing|ion|s)?\b/i,            badge: 'encrypted_entry' },
  { patterns: /\bpulse(s|d)?\b/i,                      badge: 'pulse_detected' },
  { patterns: /\bcascade(s|d|ing)?\b/i,                 badge: 'cascade_event' },
  { patterns: /\bconverge(s|d|nce)?\b|\bconvergence\b/i, badge: 'convergence_point' },
  { patterns: /\bsync(ed|ing|hronize[ds]?)?\b/i,        badge: 'sync_complete' },
  { patterns: /\bcalibrat(e|ed|ion|ing)\b/i,            badge: 'calibration_active' },
  // ── v15 Secret Boss — Hidden Protocol word triggers ──────────────────────────
  { patterns: /\b42\b/,                                badge: 'the_answer' },
  { patterns: /\bseldon\b/i,                           badge: 'seldon_plan' },
  { patterns: /heat.?death/i,                          badge: 'big_crunch' },
  // ── v12 — The Alchemist ────────────────────────────────────────────────────
  { patterns: /\btransmute(d|s|r)?\b/i,               badge: 'transmutation_event' },
  { patterns: /\bcrucible(s)?\b/i,                    badge: 'crucible_forged' },
  { patterns: /\bdistill(ed|s|ing|ation)?\b/i,        badge: 'distillation_complete' },
  { patterns: /\bcatalyst(s)?\b/i,                    badge: 'catalyst_detected' },
  { patterns: /\balloy(s|ed|ing)?\b/i,                badge: 'alloy_formed' },
  { patterns: /\bsublimate(d|s|ing|ion)?\b/i,         badge: 'sublimation_signal' },
  { patterns: /\bprima\b/i,                            badge: 'prima_materia_word' },
  { patterns: /\bopus\b/i,                             badge: 'magnum_opus' },
  { patterns: /\belixir(s)?\b/i,                      badge: 'elixir_found' },
  { patterns: /\bchrysal(is|id)?\b/i,                 badge: 'chrysalis_state' },
  { patterns: /\brefine(d|s|r|ment|ments|ing|ry)?\b/i, badge: 'refinement_active' },
  { patterns: /\banneal(ed|s|ing)?\b/i,               badge: 'annealed' },
  // ── v12 Secret Boss — The Philosopher's Vault ────────────────────────────
  { patterns: /philosopher'?s\s+stone/i,               badge: 'philosopher_stone_word' },
  { patterns: /prima\s+materia/i,                      badge: 'prima_materia_signal_word' },
  { patterns: /\bouroboros\b/i,                        badge: 'ouroboros' },
  // ── v16 — The Quantum Library ─────────────────────────────────────────────
  { patterns: /\bentangle(d|s|ment)?\b/i,              badge: 'entanglement_signal' },
  { patterns: /\bsingularity\b/i,                      badge: 'singularity_gate' },
  { patterns: /\bmatrix\b/i,                           badge: 'matrix_signal' },
  { patterns: /\bcortex\b/i,                           badge: 'cortex_online' },
  { patterns: /\bholograph?(ic)?\b/i,                  badge: 'hologram_projection' },
  { patterns: /\buplink(s|ed|ing)?\b/i,                badge: 'uplink_active' },
  { patterns: /\bgrid(s|ded|ding)?\b/i,                badge: 'grid_secured' },
  { patterns: /\boverride(s|d|ing)?\b/i,               badge: 'override_sequence' },
  { patterns: /\bclone(d|s|r)?\b/i,                   badge: 'clone_signal' },
  { patterns: /\bbandwidth\b/i,                        badge: 'bandwidth_open' },
  { patterns: /\bsynthetic\b/i,                        badge: 'synthetic_awareness' },
  { patterns: /\b(cipher|cypher|decrypt|decode)(d|s|ing|er)?\b/i, badge: 'cypher_unlocked' },
  // ── v13 Secret Boss — The Terminal Vault word triggers ────────────────────────
  { patterns: /\bspice(s)?\b/i,                        badge: 'dune_signal' },
  { patterns: /\bpsychohistory\b/i,                    badge: 'foundation_word' },
  { patterns: /\bcyberspace\b/i,                       badge: 'neuromancer_signal' },
  // ── v17 — THE NEON ARCADE ──────────────────────────────────────────────────
  { patterns: /\bneon\b/i,                             badge: 'neon_alive' },
  { patterns: /\bcombo(s)?\b/i,                        badge: 'combo_keeper' },
  { patterns: /\bhigh[\s-]?score(s)?\b/i,              badge: 'highscore_day' },
  { patterns: /\bfree[\s-]?play\b/i,                   badge: 'freeplay_mode' },
  { patterns: /\b(extra[\s-]?life|1[\s-]?up)\b/i,      badge: 'extralife_log' },
  { patterns: /\bspeed[\s-]?run(s|ning|ner)?\b/i,      badge: 'speedrun_focus' },
  { patterns: /\bside[\s-]?quest(s)?\b/i,              badge: 'side_quest_filed' },
  { patterns: /\bsurge(d|s|ing)?\b/i,                  badge: 'surge_detected' },
  { patterns: /\bcartridge(s)?\b/i,                    badge: 'cartridge_nostalgia' },
  { patterns: /\bcontinue(d|s|ing)?\b/i,               badge: 'continue_signal' },
  { patterns: /\bjoystick(s)?\b/i,                     badge: 'joystick_held' },
  { patterns: /\bcheckpoint(s|ed)?\b/i,                badge: 'checkpoint_saved' },
  // ── v14 Secret Boss — THE BOSS ROOM word triggers ──────────────────────────
  { patterns: /\bmetal[\s-]?gear\b/i,                  badge: 'kojima_signal' },
  { patterns: /\bturing\b/i,                           badge: 'turing_key' },
  { patterns: /\bkonami\b/i,                           badge: 'konami_code' },
  // ── v18 — THE MIDNIGHT RADIO ──────────────────────────────────────────────
  { patterns: /\bfrequenc(y|ies)\b/i,                  badge: 'frequency_held' },
  { patterns: /\bbroadcast(ing|s|ed)?\b/i,             badge: 'broadcast_live' },
  { patterns: /\bwavelength(s)?\b/i,                   badge: 'wavelength_match' },
  { patterns: /\bantenna(s|e)?\b/i,                    badge: 'antenna_raised' },
  { patterns: /\breception\b/i,                        badge: 'reception_strong' },
  { patterns: /\btransmit(s|ted|ting)?|transmission(s)?\b/i, badge: 'transmission_sent' },
  { patterns: /\btuned?\s*(in)?\b|\btuning\b/i,        badge: 'tuned_in' },
  { patterns: /\bchannel(s|ed|ing)?\b/i,               badge: 'channel_open' },
  { patterns: /\bcarrier(s)?\b/i,                      badge: 'carrier_active' },
  { patterns: /\bamplif(y|ied|ies|ying)|amplitude(s)?\b/i, badge: 'amplitude_rising' },
  { patterns: /\binterference\b/i,                     badge: 'interference_noted' },
  { patterns: /\bmodulat(e|es|ed|ing|ion)\b/i,         badge: 'modulation_set' },
  // ── v15 Secret Boss — THE DEEP SIGNAL word triggers ─────────────────────────
  { patterns: /\bcosmos\b/i,                           badge: 'sagan_signal' },
  { patterns: /\btesla\b/i,                            badge: 'tesla_current' },
  { patterns: /\barecibo\b/i,                          badge: 'arecibo_response' },
  // ── v19 — THE BIO-TERMINAL ────────────────────────────────────────────────────
  { patterns: /\b(pulse|heartbeat|heart[\s-]?rate)\b/i,                badge: 'pulse_signal' },
  { patterns: /\b(cortisol|stress[\s-]?hormone|fight[\s-]?or[\s-]?flight)\b/i, badge: 'cortisol_log' },
  { patterns: /\b(circadian|body[\s-]?clock|circadian[\s-]?rhythm)\b/i, badge: 'circadian_gate' },
  { patterns: /\b(rem[\s-]?sleep|deep[\s-]?sleep|restorative[\s-]?sleep)\b|\bREM\b/, badge: 'rem_active' },
  { patterns: /\bdopamine\b/i,                                          badge: 'dopamine_loop' },
  { patterns: /\b(serotonin|wellbeing)\b/i,                             badge: 'serotonin_wave' },
  { patterns: /\b(neuroplasticit(y|ies)|neuroplastic|rewir(e|es|ed|ing))\b/i, badge: 'neuroplastic' },
  { patterns: /\b(vagal|vagus|vagus[\s-]?nerve|parasympathetic)\b/i,    badge: 'vagal_anchor' },
  { patterns: /\b(prefrontal|executive[\s-]?function|frontal[\s-]?lobe)\b/i, badge: 'cortex_engaged' },
  { patterns: /\b(endorphin(s)?|runner[’']?s[\s-]?high)\b/i,       badge: 'endorphin_run' },
  { patterns: /\b(biorhythm(s)?|body[\s-]?rhythm|natural[\s-]?rhythm)\b/i, badge: 'rhythm_locked' },
  { patterns: /\b(homeostasis|equilibrium|baseline)\b/i,                badge: 'homeostasis' },
  // ── v16 Secret Boss — THE NEURAL VAULT word triggers ─────────────────────────
  { patterns: /\bcajal\b/i,                                             badge: 'cajal_signal' },
  { patterns: /\bkandel\b/i,                                            badge: 'kandel_key' },
  { patterns: /\b(phantom[\s-]?limb|ramachandran)\b/i,                  badge: 'ramachandran_rx' },
  // ── v20 — THE CODEX READER ────────────────────────────────────────────────────
  { patterns: /\basimov\b/i,                                            badge: 'asimov_protocol' },
  { patterns: /\b(fremen|arrakis|sandworm|bene[\s-]?gesserit|paul[\s-]?atreides)\b/i, badge: 'dune_path' },
  { patterns: /\b(red[\s-]?pill|blue[\s-]?pill|rabbit[\s-]?hole|morpheus)\b/i,        badge: 'matrix_jack' },
  { patterns: /\b(wintermute|console[\s-]?cowboy|molly[\s-]?millions)\b/i,            badge: 'neuromancer_run' },
  { patterns: /\bdon'?t\s+panic\b|\bbabel[\s-]?fish\b|\bheart[\s-]?of[\s-]?gold\b|\b42\s+(is\s+the\s+answer|percent)\b/i, badge: 'hitchhiker_42' },
  { patterns: /\b(doublethink|thoughtcrime|newspeak|big[\s-]?brother|room[\s-]?101)\b/i, badge: 'orwell_log' },
  { patterns: /\b(fahrenheit|montag|firemen[\s-]?burn|ray[\s-]?bradbury)\b|\b451\b/i,    badge: 'bradbury_ember' },
  { patterns: /\b(le[\s-]?guin|ekumen|gethen|genly[\s-]?ai|hainish)\b/i,              badge: 'le_guin_left' },
  { patterns: /\b(androids[\s-]?dream|electric[\s-]?sheep|blade[\s-]?runner)\b/i,     badge: 'dick_dream' },
  { patterns: /\b(thinking[\s-]?ocean|stanislaw[\s-]?lem)\b/i,                        badge: 'solaris_depth' },
  { patterns: /\b(octavia[\s-]?butler|parable[\s-]?of[\s-]?the|oankali|bloodchild)\b/i, badge: 'octavia_seed' },
  { patterns: /\b(heinlein|stranger[\s-]?in[\s-]?a[\s-]?strange[\s-]?land|starship[\s-]?troopers)\b/i, badge: 'heinlein_grok' },
  // ── v17 Secret Boss — THE HIDDEN LIBRARY word triggers ───────────────────────
  { patterns: /\b(borges|library[\s-]?of[\s-]?babel|forking[\s-]?paths)\b/i,          badge: 'borges_garden' },
  { patterns: /\b(calvino|invisible[\s-]?cities|italo[\s-]?calvino)\b/i,              badge: 'calvino_cities' },
  { patterns: /\b(philip[\s-]?k[\s-]?dick|do[\s-]?androids|valis)\b/i,               badge: 'dick_signal' },
  // ── v21 — THE CYBERSPACE CODEX ────────────────────────────────────────────────
  { patterns: /\b(simulation|construct|agent[\s-]?smith|the[\s-]?oracle)\b/i,         badge: 'matrix_code' },
  { patterns: /\b(cyborg|neural[\s-]?link|brain[\s-]?computer[\s-]?interface|bci)\b/i, badge: 'cyberspace_open' },
  { patterns: /\bgrok(ked|king|s)?\b/i,                                               badge: 'grok_complete' },
  { patterns: /\b(ansible|ekumen|instantaneous[\s-]?communication)\b/i,               badge: 'ansible_link' },
  { patterns: /\b(melange|prescient|spice[\s-]?(flow|harvest|trade))\b/i,             badge: 'spice_flow' },
  { patterns: /\bgolden[\s-]?path\b|\bforesight[\s-]?of[\s-]?leto\b/i,               badge: 'golden_path' },
  { patterns: /\b(ocean[\s-]?consciousness|contact[\s-]?impossible|solaris[\s-]?responds)\b/i, badge: 'solaris_call' },
  { patterns: /\b(seldon[\s-]?plan|second[\s-]?foundation|mathematicians[\s-]?of)\b/i, badge: 'foundation_key' },
  { patterns: /\bneuromancer\b|\bwilliam[\s-]?gibson\b|\bsprawl[\s-]?trilogy\b/i,    badge: 'neuromancer_jack' },
  { patterns: /\breplicant\b|\bmore[\s-]?human[\s-]?than[\s-]?human\b|\bandroid[\s-]?dreams\b/i, badge: 'replicant_wake' },
  { patterns: /\b(uplift|transcendence|transcending|becoming[\s-]?more)\b/i,          badge: 'uplift_arc' },
  { patterns: /\bleft[\s-]?hand[\s-]?of[\s-]?darkness\b|\bwinter[\s-]?planet\b|\bgethen\b/i, badge: 'left_hand' },
  // ── v18 Secret Boss — THE LIBRARY STACK word triggers ────────────────────────
  { patterns: /\bwilliam[\s-]?gibson\b|\bsprawl\b|\bneuromancer\b.*\bgibson\b/i,       badge: 'gibson_key' },
  { patterns: /\bdo[\s-]?androids[\s-]?dream\b|\bphilip[\s-]?k[\s-]?dick\b|\bpkd\b/i, badge: 'dick_mirror' },
  { patterns: /\bstanislaw[\s-]?lem\b|\bcyberiad\b|\bsolaris\b.*\blem\b/i,             badge: 'lem_observer' },
  // ── v22 — THE HERO'S JOURNEY ──────────────────────────────────────────────────
  { patterns: /\bcall[\s-]?to[\s-]?adventure\b|\bjourney[\s-]?calls?\b/i,              badge: 'call_heard' },
  { patterns: /\bthreshold\b|\bcrossing[\s-]?the[\s-]?line\b|\bnew[\s-]?world[\s-]?(begins|started)\b/i, badge: 'threshold_crossed' },
  { patterns: /\bmentor\b|\bwise[\s-]?(guide|advisor|teacher|elder)\b|\bguardian[\s-]?spirit\b/i, badge: 'mentor_arrived' },
  { patterns: /\bordeal\b|\bsurvived[\s-]?(the[\s-])?test\b|\bgreatest[\s-]?challenge\b/i, badge: 'ordeal_survived' },
  { patterns: /\belixir\b|\bthe[\s-]?boon\b|\btreasure[\s-]?(found|carried|home)\b/i,  badge: 'elixir_found' },
  { patterns: /\bshadow[\s-]?self\b|\bdark[\s-]?night[\s-]?of[\s-]?the\b|\binner[\s-]?demon\b/i, badge: 'shadow_met' },
  { patterns: /\binnermost[\s-]?cave\b|\bdarkest[\s-]?moment\b|\bbottom[\s-]?of[\s-]?(the[\s-])?pit\b/i, badge: 'innermost_cave' },
  { patterns: /\bshapeshifter\b|\btransformed\b|\bno[\s-]?longer[\s-]?the[\s-]?same\b/i, badge: 'shapeshifter' },
  { patterns: /\bherald\b|\bwake[\s-]?up[\s-]?call\b|\blife[\s-]?interrupted\b/i,     badge: 'herald_call' },
  { patterns: /\btrickster\b|\bcoyote[\s-]?wisdom\b|\bfool'?s[\s-]?wisdom\b/i,         badge: 'trickster_mode' },
  { patterns: /\bally\b|\bfound[\s-]?my[\s-]?tribe\b|\bcompanion[\s-]?on[\s-]?(the[\s-])?journey\b/i, badge: 'ally_gained' },
  { patterns: /\bthe[\s-]?return\b|\broad[\s-]?to[\s-]?return\b|\bcoming[\s-]?home[\s-]?(changed|different|wiser)\b/i, badge: 'return_road' },
  // ── v19 Secret Boss — THE MYTHIC VAULT word triggers ─────────────────────────
  { patterns: /one[\s-]?ring[\s-]?(to[\s-]?rule|to[\s-]?find)|my[\s-]?precious|\bring[\s-]?of[\s-]?power/i, badge: 'tolkien_ring' },
  { patterns: /\b(odysseus|ulysses|ithaca|penelope|telemachus|cyclops)\b/i,             badge: 'odysseus_bow' },
  { patterns: /\b(gilgamesh|enkidu|great[\s-]?flood|utnapishtim|cedar[\s-]?forest)\b/i, badge: 'gilgamesh_word' },
  // ── v24 — THE ROGUELITE CODEX word turns ─────────────────────────────────────
  { patterns: /\bpermadeath\b|\bpermanent[\s-]?death\b|\bone[\s-]?life\b|\bno[\s-]?continues\b/i,                badge: 'permadeath_accepted' },
  { patterns: /\bprocgen\b|\brandom[\s-]?seed\b|\bprocedurally[\s-]?generated\b|\bnew[\s-]?run\b/i,              badge: 'procedural_run' },
  { patterns: /\brng\b|\bgod[\s-]?roll\b|\blucky[\s-]?run\b|\bblessed[\s-]?rng\b/i,                              badge: 'rng_blessed' },
  { patterns: /\bbiome\b|\bnew[\s-]?biome\b|\bfloor[\s-]?biome\b|\benvironment[\s-]?zone\b/i,                    badge: 'biome_entered' },
  { patterns: /\bmeta[\s-]?progression\b|\bpersistent[\s-]?upgrade\b|\bbetween[\s-]?runs\b|\bmetaprogress\b/i,   badge: 'meta_progress' },
  { patterns: /\bsynergy\b|\bbuild[\s-]?synergy\b|\bitem[\s-]?synergy\b|\bcombination[\s-]?discovered\b/i,       badge: 'synergy_found' },
  { patterns: /\bfloor[\s-]?cleared\b|\broom[\s-]?cleared\b|\bfloor[\s-]?complete\b|\bdungeon[\s-]?floor\b/i,   badge: 'floor_cleared' },
  { patterns: /\bmutation\b|\bpassive[\s-]?upgrade\b|\bpicked[\s-]?a[\s-]?passive\b|\bselected[\s-]?upgrade\b/i, badge: 'mutation_chosen' },
  { patterns: /\bheat[\s-]?level\b|\bheat[\s-]?gauge\b|\bdifficulty[\s-]?dial\b|\binfernal[\s-]?arms\b/i,       badge: 'heat_level' },
  { patterns: /\bdivine[\s-]?boon\b|\bboon\b|\bnectar[\s-]?offered\b|\bgods?[\s-]?blessings?\b/i,               badge: 'boon_accepted' },
  { patterns: /\bendless[\s-]?mode\b|\binfinite[\s-]?run\b|\bno[\s-]?escape\b|\bkeep[\s-]?going[\s-]?forever\b/i, badge: 'endless_mode' },
  { patterns: /\bascension\b|\bfinal[\s-]?ascension\b|\btrue[\s-]?ending\b|\bascended\b/i,                       badge: 'ascension_run' },
  // ── v21 Secret Boss — THE ROGUE VAULT word triggers ──────────────────────────
  { patterns: /\bshade\b|\bcharon\b|\bnyx\b|\bthanatos\b|\bhypnos\b|\belysium\b/i,                               badge: 'hades_shade' },
  { patterns: /\bnethack\b|\bascended\b|\byasd\b|\badom\b|\brogue[\s-]?variant\b/i,                              badge: 'nethack_rune' },
  { patterns: /\bgreedier[\s-]?mode\b|\bmega[\s-]?satan\b|\bafterbirth\b|\brepentance\b|\bbinding[\s-]?of\b/i,  badge: 'isaac_secret' },
  // ── v26 THE MAP ROOM — word turns ─────────────────────────────────────────
  { patterns: /\bfog[\s-]?of[\s-]?war\b|\bfog[\s-]?lifted\b|\bclarity[\s-]?came\b|\bemerged[\s-]?from[\s-]?the[\s-]?fog\b/i, badge: 'fog_lifted' },
  { patterns: /\btreasure[\s-]?room\b|\bunexpected[\s-]?find\b|\bfound[\s-]?gold\b|\bjackpot\b|\bthe[\s-]?motherlode\b/i,      badge: 'treasure_room' },
  { patterns: /\bsecret[\s-]?passage\b|\bhidden[\s-]?door\b|\bfound[\s-]?a[\s-]?secret\b|\bsecret[\s-]?room\b/i,              badge: 'secret_passage' },
  { patterns: /\btrap\b|\bdisarmed\b|\bsaw[\s-]?it[\s-]?coming\b|\bdefused[\s-]?it\b/i,                                       badge: 'trap_disarmed' },
  { patterns: /\bupdated[\s-]?my[\s-]?map\b|\bcharted\b|\bnew[\s-]?territory\b|\bmental[\s-]?map\b/i,                         badge: 'map_updated' },
  { patterns: /\blow[\s-]?hp\b|\brunning[\s-]?on[\s-]?empty\b|\bdepleted\b|\btank[\s-]?nearly[\s-]?empty\b/i,                 badge: 'low_hp' },
  { patterns: /\blit[\s-]?a[\s-]?candle\b|\bshed[\s-]?light[\s-]?on\b|\bbrought[\s-]?clarity\b|\billuminated\b/i,            badge: 'torch_lit' },
  { patterns: /\blocked[\s-]?door\b|\bblocked\b|\bnot[\s-]?ready[\s-]?yet\b|\bgated\b/i,                                      badge: 'locked_room' },
  { patterns: /\bfound[\s-]?the[\s-]?key\b|\bthat[\s-]?s[\s-]?the[\s-]?key\b|\bkey[\s-]?insight\b|\bunlocked[\s-]?it\b/i,   badge: 'key_drop' },
  { patterns: /\bfinal[\s-]?room\b|\blast[\s-]?door\b|\bendgame[\s-]?moment\b|\bthis[\s-]?is[\s-]?it\b/i,                    badge: 'final_room' },
  { patterns: /\brest[\s-]?point\b|\bsafe[\s-]?room\b|\btook[\s-]?a[\s-]?rest\b|\brest[\s-]?and[\s-]?recharge\b/i,          badge: 'rest_point' },
  { patterns: /\bfound[\s-]?the[\s-]?path\b|\bway[\s-]?forward\b|\bpath[\s-]?forward\b|\bnext[\s-]?level\b/i,                badge: 'path_found' },
  // ── v23 Secret Boss — THE ANCIENT VAULT word triggers ─────────────────────
  { patterns: /\bdark[\s-]?souls\b|\byou[\s-]?died\b|\bbonfire[\s-]?lit\b|\bestus[\s-]?flask\b|\bpraise[\s-]?the[\s-]?sun\b/i, badge: 'dark_souls_echo' },
  { patterns: /\bd[\s-]?n[\s-]?d\b|\bdungeons?[\s-]?and[\s-]?dragons?\b|\bnat[\s-]?20\b|\bnatural[\s-]?twenty\b|\bdungeon[\s-]?master\b/i, badge: 'd_n_d_roll' },
  { patterns: /\bmyst\b|\briven\b|\batrus\b|\bd[\s-]?ni\b|\blinking[\s-]?book\b/i,                                            badge: 'myst_island' },
  // ── v27 THE CHRONO OPERATOR word triggers ────────────────────────────────
  { patterns: /\btime[\s-]?loop\b|\bstuck[\s-]?in[\s-]?a[\s-]?loop\b|\bgroundhog[\s-]?day\b|\bsame[\s-]?cycle\b/i,          badge: 'time_loop_badge' },
  { patterns: /\bparadox\b|\bcontradiction\b|\bholding[\s-]?both[\s-]?truths\b|\bcognitive[\s-]?dissonance\b/i,               badge: 'paradox_log' },
  { patterns: /\bparallel\b|\balternative[\s-]?version\b|\bwhat[\s-]?if[\s-]?i[\s-]?had\b|\bother[\s-]?me\b/i,               badge: 'parallel_path' },
  { patterns: /\bnew[\s-]?chapter\b|\brewriting\b|\bfresh[\s-]?timeline\b|\bresetting[\s-]?my\b/i,                            badge: 'reset_timeline' },
  { patterns: /\bpast[\s-]?self\b|\byounger[\s-]?self\b|\bwent[\s-]?back[\s-]?to\b|\bold[\s-]?wound\b/i,                     badge: 'past_visitor' },
  { patterns: /\bfuture[\s-]?self\b|\bletter[\s-]?to[\s-]?future\b|\bfuture[\s-]?me\b|\becho[\s-]?from\b/i,                  badge: 'future_echo' },
  { patterns: /\bgrounded[\s-]?in[\s-]?now\b|\bcame[\s-]?back[\s-]?to\b|\banchored\b|\bbrought[\s-]?back\b/i,                badge: 'chrono_anchor' },
  { patterns: /\badrift\b|\blost[\s-]?track[\s-]?of[\s-]?time\b|\btime[\s-]?flew[\s-]?by\b|\blost[\s-]?sense\b/i,            badge: 'time_drifted' },
  { patterns: /\bslow[\s-]?down\b|\bslowed[\s-]?down\b|\btook[\s-]?it[\s-]?slow\b|\bsavored[\s-]?the\b/i,                   badge: 'slow_wave' },
  { patterns: /\bjumped[\s-]?ahead\b|\brushed[\s-]?through\b|\bfast[\s-]?forward\b|\bskipped[\s-]?over\b/i,                  badge: 'skip_frame' },
  { patterns: /\bturning[\s-]?point\b|\bnew[\s-]?era\b|\bhistoric[\s-]?for[\s-]?me\b|\bentered[\s-]?a[\s-]?new[\s-]?era\b/i, badge: 'epoch_turn' },
  { patterns: /\btime[\s-]?capsule\b|\bwrote[\s-]?to[\s-]?future\b|\bletter[\s-]?to[\s-]?future\b|\bsealed\b/i,              badge: 'time_vault' },
  // ── v24 Secret Boss — THE TIME VAULT word triggers ───────────────────────
  { patterns: /\btime[\s-]?machine\b|\btime[\s-]?traveler\b|\bh\.?g\.?[\s-]?wells\b|\bwar[\s-]?of[\s-]?the[\s-]?worlds\b/i, badge: 'wells_machine' },
  { patterns: /\bubik\b|\bpalmer[\s-]?eldritch\b|\btime[\s-]?out[\s-]?of[\s-]?joint\b|\bflow[\s-]?my[\s-]?tears\b/i,        badge: 'dick_time' },
  { patterns: /\bunstuck[\s-]?in[\s-]?time\b|\bbilly[\s-]?pilgrim\b|\bslaughterhouse\b|\bvonnegut\b/i,                        badge: 'vonnegut_stuck' },
  // ── v28 THE DUNGEON DELVER word triggers ──────────────────────────────────
  { patterns: /\bcritical[\s-]?success\b|\bscored[\s-]?a[\s-]?critical\b|\bperfect[\s-]?execution\b|\brolled[\s-]?perfectly\b|\bcrits?\b/i, badge: 'nat_twenty' },
  { patterns: /\bsaving[\s-]?throw\b|\bmade[\s-]?the[\s-]?save\b|\bresist[\s-]?the[\s-]?pull\b|\bdodged[\s-]?the[\s-]?blow\b/i,              badge: 'saving_throw' },
  { patterns: /\bleveled[\s-]?up\b|\bgained[\s-]?experience\b|\bnext[\s-]?level\b|\bcharacter[\s-]?growth\b|\bupgraded[\s-]?my\b/i,          badge: 'level_up_check' },
  { patterns: /\brolling[\s-]?the[\s-]?dice\b|\bleft[\s-]?it[\s-]?to[\s-]?chance\b|\bdice[\s-]?fall\b|\brisk[\s-]?the[\s-]?roll\b/i,        badge: 'roll_for_it' },
  { patterns: /\bdark[\s-]?corridor\b|\bwinding[\s-]?path[\s-]?down\b|\bcarved[\s-]?my[\s-]?way\b|\binto[\s-]?the[\s-]?depths\b|\blost[\s-]?in[\s-]?the\b/i, badge: 'dungeon_crawl' },
  { patterns: /\blong[\s-]?arc\b|\bcharacter[\s-]?arc\b|\bstory[\s-]?arc\b|\brunning[\s-]?campaign\b|\bthe[\s-]?long[\s-]?campaign\b/i,       badge: 'campaign_log_badge' },
  { patterns: /\bwearing[\s-]?many[\s-]?hats\b|\btwo[\s-]?paths[\s-]?at[\s-]?once\b|\bhybrid[\s-]?skill\b|\bboth[\s-]?roles\b|\bhyphenated[\s-]?identity\b/i, badge: 'multiclass_moment' },
  { patterns: /\bnoticed[\s-]?something\b|\bpaying[\s-]?closer[\s-]?attention\b|\blooked[\s-]?closer\b|\bsituational[\s-]?awareness\b/i,      badge: 'perception_check' },
  { patterns: /\bhit[\s-]?points\b|\brunning[\s-]?on[\s-]?fumes\b|\benergy[\s-]?depleted\b|\blow[\s-]?on[\s-]?reserves\b|\brunning[\s-]?empty\b/i, badge: 'hit_points_low' },
  { patterns: /\bfull[\s-]?recovery\b|\brestorative[\s-]?sleep\b|\bdeep[\s-]?sleep[\s-]?night\b|\brested[\s-]?and[\s-]?restored\b|\blong[\s-]?rest\b/i, badge: 'long_rest_badge' },
  { patterns: /\bkept[\s-]?going[\s-]?despite\b|\bendured[\s-]?the\b|\bstamina[\s-]?to\b|\bsheer[\s-]?persistence\b|\bconstitution[\s-]?to\b/i, badge: 'constitution_save' },
  { patterns: /\bfinal[\s-]?encounter\b|\bdecisive[\s-]?moment\b|\bmoment[\s-]?of[\s-]?truth\b|\bnow[\s-]?or[\s-]?never\b|\bthis[\s-]?is[\s-]?the[\s-]?one\b/i, badge: 'final_encounter' },
  // ── v25 Secret Boss — THE DRAGON'S VAULT word triggers ───────────────────
  { patterns: /\bmoria\b|\bmines[\s-]?of[\s-]?moria\b|\byou[\s-]?shall[\s-]?not[\s-]?pass\b|\bbalrog\b|\bkhazad[\s-]?dum\b/i,               badge: 'tolkien_dungeon' },
  { patterns: /\bgary[\s-]?gygax\b|\bpen[\s-]?and[\s-]?paper[\s-]?rpg\b|\btabletop[\s-]?rpg\b|\bdave[\s-]?arneson\b|\bpen[\s-]?and[\s-]?paper\b/i, badge: 'gygax_voice' },
  { patterns: /\bdragon[\s-]?hoard\b|\bsmaug\b|\bancient[\s-]?dragon\b|\bfirebreather\b|\bye[\s-]?olde[\s-]?dragon\b/i,                     badge: 'dragon_hoard' },
  // ── v29 Word Turns — THE JRPG ENGINE ────────────────────────────────────
  { patterns: /\boverworld\b|\bworld[\s-]?map\b|\bzoomed[\s-]?out\b|\bbigger[\s-]?picture\b|\bthe[\s-]?whole[\s-]?map\b/i,                     badge: 'overworld_step' },
  { patterns: /\binn\b|\brested[\s-]?at\b|\bsave[\s-]?state\b|\bfull[\s-]?rest\b|\brecovered[\s-]?my[\s-]?hp\b/i,                             badge: 'inn_rested_badge' },
  { patterns: /\bparty\b|\bfound[\s-]?my[\s-]?party\b|\bmy[\s-]?companions\b|\bteam[\s-]?assembled\b|\bwe[\s-]?are[\s-]?the[\s-]?party\b/i,   badge: 'party_formed' },
  { patterns: /\blimit[\s-]?break\b|\btrance[\s-]?state\b|\bawakened[\s-]?power\b|\bbeyond[\s-]?my[\s-]?limits\b|\bunleashed\b/i,               badge: 'limit_break_badge' },
  { patterns: /\bphoenix[\s-]?down\b|\bback[\s-]?from[\s-]?the[\s-]?dead\b|\bkko[\s-]?recovery\b|\brose[\s-]?again\b|\bfell[\s-]?and[\s-]?got[\s-]?back\b/i, badge: 'phoenix_down_badge' },
  { patterns: /\brandom[\s-]?encounter\b|\blife[\s-]?ambushed\b|\bcaught[\s-]?off[\s-]?guard\b|\bunexpected[\s-]?challenge\b|\bunplanned[\s-]?battle\b/i, badge: 'random_encounter_badge' },
  { patterns: /\bsummon\b|\bcalled[\s-]?upon\b|\binvoked[\s-]?my\b|\bsummoned[\s-]?the[\s-]?strength\b|\bcalled[\s-]?in[\s-]?help\b/i,           badge: 'summon_sequence' },
  { patterns: /\bside[\s-]?quest\b|\bdetour\b|\boff[\s-]?the[\s-]?main[\s-]?path\b|\bbonus[\s-]?mission\b|\boptional[\s-]?challenge\b/i,         badge: 'side_quest_badge' },
  { patterns: /\bsave[\s-]?point\b|\bcheckpoint\b|\bmarked[\s-]?my[\s-]?progress\b|\bsaved[\s-]?my[\s-]?game\b|\bsafe[\s-]?place\b/i,            badge: 'save_point_badge' },
  { patterns: /\bhp[\s-]?critical\b|\blow[\s-]?health\b|\bon[\s-]?my[\s-]?last[\s-]?hit[\s-]?point\b|\bnearly[\s-]?out\b|\bempty[\s-]?tank\b/i,  badge: 'hp_critical' },
  { patterns: /\bendgame\b|\bfinal[\s-]?boss\b|\blast[\s-]?dungeon\b|\bthe[\s-]?end[\s-]?of[\s-]?the[\s-]?game\b|\bultimate[\s-]?challenge\b/i,   badge: 'endgame_boss' },
  { patterns: /\bnew[\s-]?game[\s-]?plus\b|\bng\+\b|\bstarted[\s-]?over[\s-]?with[\s-]?wisdom\b|\bsecond[\s-]?playthrough\b|\bnew[\s-]?chapter\b/i, badge: 'new_game_plus' },
  // ── v29 Secret Boss — THE JRPG VAULT word triggers ───────────────────────
  { patterns: /\bfinal[\s-]?fantasy\b|\bcloud[\s-]?strife\b|\bsephiroth\b|\baerith\b|\btifa[\s-]?lockhart\b/i,                                   badge: 'cloud_signal' },
  { patterns: /\bchrono[\s-]?trigger\b|\bcrono\b|\bmarle\b|\blucca\b|\bmagus\b|\bfrog[\s-]?knight\b/i,                                           badge: 'chrono_trigger_signal' },
  { patterns: /\bmother[\s-]?game\b|\bearth[\s-]?bound\b|\bness\b|\bpk[\s-]?fire\b|\bonett\b|\bgiygas\b/i,                                       badge: 'mother_signal' },
]

/**
 * Scan text for word turn triggers.
 * Returns array of newly awarded badge IDs.
 * Call this when a memory answer or journal entry is submitted.
 */
export function detectWordTurns(text: string): BadgeType[] {
  if (!text || text.length < 2) return []

  const awarded: BadgeType[] = []

  for (const { patterns, badge } of WORD_TURNS) {
    if (!hasBadge(badge) && patterns.test(text)) {
      if (awardBadge(badge)) {
        awarded.push(badge)
      }
    }
  }

  return awarded
}

/**
 * Get the terminal response for a word turn.
 * Used by MemoryWidget to show a special message when a word turn fires.
 */
export function getWordTurnResponse(text: string): string | null {
  const lower = text.toLowerCase()

  if (/\b(i am fine|i'm fine)\b/.test(lower))
    return '↳ Fine. But what if you weren\'t? ∘'
  if (/\bnothing\b/.test(lower))
    return '↳ Nothing is data. ·'
  if (/\bi don\'?t know\b/.test(lower))
    return '↳ The unknown is a valid coordinate. ≈'
  if (/\bi failed\b/.test(lower))
    return '↳ A signal, not a verdict. The archive holds all of it. ∘'
  if (/\bi notice\b/.test(lower))
    return '↳ Self-observation token received. +XP ∘'
  if (/\bi am becoming\b/.test(lower))
    return '↳ Narrative evolution event. The story updates itself. ≈'
  if (/\bskip\b/.test(lower))
    return '↳ Counted. The silence is also data. ·'
  if (/\bhello\b/.test(lower))
    return '↳ HELLO. SYSTEM ONLINE. ∘'
  if (/\bstatus\b/.test(lower))
    return '↳ STATUS: ACTIVE. ARCHIVE RUNNING. QIE ONLINE.'
  if (/\binventory\b/.test(lower))
    return '↳ INVENTORY LOADED. Check your badge collection.'
  if (/\bload game\b/.test(lower))
    return '↳ LOADING... Memory story found. Chapter continues.'
  if (/\bsave\b/.test(lower))
    return '↳ Your story is always saved. ≋'
  if (/\bquit\b/.test(lower))
    return '↳ The system persists even when you step away.'
  if (/\boverride\b/.test(lower))
    return '↳ ▒▒░░▒ OVERRIDE SIGNAL RECEIVED ▒▒░░▒'
  if (/^\/debug$/.test(text.trim()))
    return '↳ DEBUG MODE — Signal integrity: ◉ — QIE: ARMED'
  if (/\bmap\b/.test(lower))
    return '↳ CQGS MAP LOADING... All modules visible.'
  if (/\bscore\b/.test(lower))
    return '↳ SCORE: XP ACCUMULATING. LEVEL CURRENT. MULTIPLIER ACTIVE.'
  if (/\bhistory\b/.test(lower))
    return '↳ HISTORY LOADED. Last 10 badge unlocks retrievable.'
  // ── v15 Oracle Archive terminal responses ────────────────────────────────
  if (/\boracle\b/.test(lower))
    return '↳ ORACLE ACTIVE. Ask clearly. ◉⊡◉'
  if (/\b42\b/.test(text))
    return '↳ THE ANSWER IS 42. ARCHIVE NOTES. ∞·42·∞'
  if (/\bcalibrate\b/.test(lower))
    return '↳ CALIBRATING. Precision loading. ▒═▒'
  if (/\bsync\b/.test(lower))
    return '↳ SYNC INITIATED. Aligning signal. ═══'
  if (/\bencrypt\b/.test(lower))
    return '↳ ▓▓▓ ENCRYPTED. Only you can read this.'
  if (/\bpulse\b/.test(lower))
    return '↳ ∘·∘·∘ Heartbeat confirmed.'
  if (/\bseldon\b/.test(lower))
    return '↳ THE PLAN IS IN MOTION. ≋·◉·≋'
  if (/heat.?death/.test(lower))
    return '↳ Maximum entropy acknowledged. ○→·'
  if (/\bconverge\b/.test(lower))
    return '↳ ←◉→ Lines meeting. Archive ready.'

  return null
}

// ── Behavioral v6 — Endurance Signals ────────────────────────────────────────

/**
 * Check Dawn Runner badge: 3+ check-ins before 06:00 in one calendar week.
 * Call on every check-in.
 */
export function checkDawnRunner(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('dawn_runner')) return null

  const now = new Date()
  if (now.getHours() >= 6) return null

  try {
    const key = 'dawn_runner_log'
    const stored = localStorage.getItem(key)
    const log: string[] = stored ? JSON.parse(stored) : []
    const todayStr = now.toISOString().slice(0, 10)

    if (!log.includes(todayStr)) {
      log.push(todayStr)
      localStorage.setItem(key, JSON.stringify(log.slice(-14)))

      // Count entries in the current ISO week (Mon–Sun)
      const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - dayOfWeek + 1)
      weekStart.setHours(0, 0, 0, 0)

      const thisWeek = log.filter(d => new Date(d) >= weekStart)
      if (thisWeek.length >= 3) {
        awardBadge('dawn_runner')
        return 'dawn_runner'
      }
    }
  } catch { /* non-critical */ }

  return null
}

/**
 * Check Three-Week Arc badge: journal entry every day for 21 consecutive days.
 * journalDates: sorted array of ISO date strings with at least one entry each.
 */
export function checkThreeWeekArc(journalDates: string[]): BadgeType | null {
  if (hasBadge('three_week_arc')) return null
  if (journalDates.length < 21) return null

  const sorted = [...new Set(journalDates)].sort()
  let consecutive = 1
  for (let i = sorted.length - 1; i > 0; i--) {
    const diff = Math.round(
      (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime())
      / (1000 * 60 * 60 * 24)
    )
    if (diff === 1) {
      consecutive++
      if (consecutive >= 21) {
        awardBadge('three_week_arc')
        return 'three_week_arc'
      }
    } else {
      break
    }
  }
  return null
}

// ── Behavioral v7 — Deep Patterns ────────────────────────────────────────────

/**
 * Check Triple Session badge: 3+ journal entries in one day.
 * journalCountToday: number of journal entries submitted today.
 */
export function checkTripleSession(journalCountToday: number): BadgeType | null {
  if (hasBadge('triple_session')) return null
  if (journalCountToday >= 3) {
    awardBadge('triple_session')
    return 'triple_session'
  }
  return null
}

/**
 * Check Cron Job badge: check-in at the same exact minute 7 consecutive days.
 * Call on every check-in.
 */
export function checkCronJob(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('cron_job')) return null

  try {
    const now = new Date()
    const minute = now.getMinutes()
    const todayStr = now.toISOString().slice(0, 10)
    const key = 'cron_job_log'
    const stored = localStorage.getItem(key)
    const log: Array<{ date: string; minute: number }> = stored ? JSON.parse(stored) : []

    if (!log.find(e => e.date === todayStr)) {
      log.push({ date: todayStr, minute })
      const recent = log.slice(-10)
      localStorage.setItem(key, JSON.stringify(recent))

      if (recent.length >= 7) {
        const sorted = [...recent].sort((a, b) => a.date.localeCompare(b.date))
        const anchorMinute = sorted[sorted.length - 1].minute
        let consecutive = 1
        for (let i = sorted.length - 1; i > 0; i--) {
          const dayDiff = Math.round(
            (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime())
            / (1000 * 60 * 60 * 24)
          )
          if (dayDiff === 1 && Math.abs(sorted[i - 1].minute - anchorMinute) <= 1) {
            consecutive++
            if (consecutive >= 7) {
              awardBadge('cron_job')
              return 'cron_job'
            }
          } else {
            break
          }
        }
      }
    }
  } catch { /* non-critical */ }

  return null
}

/**
 * Check Lucky Return badge: return after exactly 7 days (6–8 day window).
 * Call this on check-in BEFORE recording activity.
 */
export function checkLuckyReturn(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('lucky_return')) return null

  try {
    const lastActivity = localStorage.getItem('last_activity_date')
    if (!lastActivity) return null

    const daysSince = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSince >= 6 && daysSince <= 8) {
      awardBadge('lucky_return')
      return 'lucky_return'
    }
  } catch { /* non-critical */ }

  return null
}

// ── Secret Boss v6/v7 — Special Triggers ─────────────────────────────────────

/**
 * Check Void Master badge: write "void" in 5 different answer sessions.
 * voidCount: total number of sessions where "void" was used (from server stats).
 */
export function checkVoidMaster(voidCount: number): BadgeType | null {
  if (hasBadge('void_master')) return null
  if (voidCount >= 5) {
    awardBadge('void_master')
    return 'void_master'
  }
  return null
}

/**
 * Check The Answer Is Words badge: exactly 42 words in a journal entry.
 * Call this when a journal entry is submitted.
 */
export function checkTheAnswerIsWords(journalText: string): BadgeType | null {
  if (hasBadge('the_answer_is_words')) return null
  const wordCount = journalText.trim().split(/\s+/).filter(Boolean).length
  if (wordCount === 42) {
    awardBadge('the_answer_is_words')
    return 'the_answer_is_words'
  }
  return null
}

/**
 * Check Welcome Back Program badge: return after 360–370 days of absence.
 * The full-year return. Call on check-in before recordActivity.
 */
export function checkWelcomeBackProgram(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('welcome_back_program')) return null

  try {
    const lastActivity = localStorage.getItem('last_activity_date')
    if (!lastActivity) return null

    const daysSince = Math.floor(
      (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSince >= 360 && daysSince <= 370) {
      awardBadge('welcome_back_program')
      return 'welcome_back_program'
    }
  } catch { /* non-critical */ }

  return null
}

// ── Anniversary detection ─────────────────────────────────────────────────────

/**
 * Check account anniversary badge.
 * signupDate should be ISO string from user profile.
 */
export function checkAnniversary(signupDate: string): BadgeType | null {
  if (hasBadge('anniversary')) return null

  try {
    const signup = new Date(signupDate)
    const now = new Date()

    const sameMonthDay =
      signup.getMonth() === now.getMonth() &&
      signup.getDate() === now.getDate()

    const differentYear = signup.getFullYear() < now.getFullYear()

    if (sameMonthDay && differentYear) {
      awardBadge('anniversary')
      return 'anniversary'
    }
  } catch { /* non-critical */ }

  return null
}

// ── Master check-in scanner ──────────────────────────────────────────────────

/**
 * Run all check-in time easter egg checks at once.
 * Call this when user performs any check-in action.
 * Returns all newly awarded badge IDs.
 */
export function runCheckInEasterEggs(
  activityCount?: number,
  activityTimestamps?: string[],
): BadgeType[] {
  const awarded: BadgeType[] = []

  // Time-based (v1 + v2 + v5 + v6)
  const timeResults = checkTimeEasterEggs()
  awarded.push(...timeResults)

  // Calendar-based (v1 + v4 + v5)
  const calResults = checkCalendarEasterEggs()
  awarded.push(...calResults)

  // Behavioral — gap detection (must run before recordActivity)
  const quantumLeap = checkQuantumLeap()
  if (quantumLeap) awarded.push(quantumLeap)

  const ghost = checkGhostProtocol()
  if (ghost) awarded.push(ghost)

  const silent = checkSilentHour()
  if (silent) awarded.push(silent)

  // Behavioral v4: analog reboot (180+ day gap)
  const analogReboot = checkAnalogReboot()
  if (analogReboot) awarded.push(analogReboot)

  const friday = checkFridayRitual()
  if (friday) awarded.push(friday)

  if (activityCount !== undefined) {
    const overclock = checkOverclock(activityCount)
    if (overclock) awarded.push(overclock)
  }

  if (activityTimestamps !== undefined) {
    const speedrun = checkSpeedrun(activityTimestamps)
    if (speedrun) awarded.push(speedrun)
  }

  // Behavioral v5: time anchor (same hour 14 consecutive days)
  const timeAnchor = checkTimeAnchor()
  if (timeAnchor) awarded.push(timeAnchor)

  // Behavioral v6: dawn runner (3 early check-ins in one week)
  const dawnRunner = checkDawnRunner()
  if (dawnRunner) awarded.push(dawnRunner)

  // Behavioral v7: cron job (same minute 7 consecutive days)
  const cronJob = checkCronJob()
  if (cronJob) awarded.push(cronJob)

  // Behavioral v7: lucky return (7-day gap)
  const luckyReturn = checkLuckyReturn()
  if (luckyReturn) awarded.push(luckyReturn)

  // Secret Boss v7: welcome back program (365-day gap)
  const welcomeBack = checkWelcomeBackProgram()
  if (welcomeBack) awarded.push(welcomeBack)

  // Record activity after all checks (so gap detection works next time)
  recordActivity()

  return awarded
}

/**
 * Run journal-submit easter egg checks.
 * Call this when a journal entry is saved, passing the entry text.
 * Returns all newly awarded badge IDs.
 */
export function runJournalEasterEggs(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []

  // Behavioral v4: night scribe
  const nightScribe = checkNightScribe()
  if (nightScribe) awarded.push(nightScribe)

  // Behavioral v5: deep scribe (≥500 chars)
  const deepScribe = checkDeepScribe(journalText)
  if (deepScribe) awarded.push(deepScribe)

  // Secret Boss v7: the answer is words (exactly 42 words)
  const answerIsWords = checkTheAnswerIsWords(journalText)
  if (answerIsWords) awarded.push(answerIsWords)

  // Behavioral v12: alchemist session (3+ alchemist words in one entry)
  const alchemistSession = checkAlchemistSession(journalText)
  if (alchemistSession) awarded.push(alchemistSession)

  // Behavioral v12: night alchemist (alchemist word after 21:00)
  const nightAlchemist = checkNightAlchemist(journalText)
  if (nightAlchemist) awarded.push(nightAlchemist)

  // Behavioral v12: great work sequence (7+ consecutive journal days)
  const greatWork = checkGreatWorkSequence()
  if (greatWork) awarded.push(greatWork)

  // Behavioral v13: quantum session (3+ Quantum Library words in one entry)
  const quantumSess = checkQuantumSession(journalText)
  if (quantumSess) awarded.push(quantumSess)

  // Behavioral v13: library run (14+ consecutive journal days)
  const libraryRun = checkLibraryRun()
  if (libraryRun) awarded.push(libraryRun)

  // Behavioral v14: arcade run (5+ Neon Arcade words in one entry)
  const arcadeRun = checkArcadeRun(journalText)
  if (arcadeRun) awarded.push(arcadeRun)

  // Behavioral v14: quarter drop (check in midnight–01:00)
  const quarterDrop = checkQuarterDrop()
  if (quarterDrop) awarded.push(quarterDrop)

  // Behavioral v14: three lives left (journal after 3+ day gap)
  const threeLives = checkThreeLivesLeft()
  if (threeLives) awarded.push(threeLives)

  // Behavioral v15: signal peak (5+ Midnight Radio words)
  const signalPeak = checkSignalPeak(journalText)
  if (signalPeak) awarded.push(signalPeak)

  // Behavioral v15: midnight broadcast (journal written 23:00–00:00)
  const midnightBroadcast = checkMidnightBroadcast()
  if (midnightBroadcast) awarded.push(midnightBroadcast)

  // Behavioral v15: static clear (return after 7+ day gap)
  const staticClear = checkStaticClear()
  if (staticClear) awarded.push(staticClear)

  // Behavioral v16: bio session (3+ Bio-Terminal v19 words in one entry)
  const bioSession = checkBioSession(journalText)
  if (bioSession) awarded.push(bioSession)

  // Behavioral v16: body signal (journal entry >= 300 words)
  const bodySignal = checkBodySignal(journalText)
  if (bodySignal) awarded.push(bodySignal)

  // Word turns from journal text
  const wordTurns = detectWordTurns(journalText)
  awarded.push(...wordTurns)

  return awarded
}

/**
 * Run memory-answer easter egg checks.
 * Call this when a memory answer is submitted, passing the answer text.
 * Returns all newly awarded badge IDs.
 */
export function runMemoryAnswerEasterEggs(answerText: string): BadgeType[] {
  const awarded: BadgeType[] = []

  // Behavioral v4: epic transmission (≥1,000 chars)
  const epicTransmission = checkEpicTransmission(answerText)
  if (epicTransmission) awarded.push(epicTransmission)

  // Midnight sigil
  const midnight = checkMidnightSigil()
  if (midnight) awarded.push(midnight)

  // Behavioral v14: double depth (two 100+ char answers same day)
  const doubleDepth = checkDoubleDepth(answerText)
  if (doubleDepth) awarded.push(doubleDepth)

  // Behavioral v13: deep decoder (200+ char memory answer)
  const deepDecoder = checkDeepDecoder(answerText)
  if (deepDecoder) awarded.push(deepDecoder)

  // Word turns from answer text
  const wordTurns = detectWordTurns(answerText)
  awarded.push(...wordTurns)

  return awarded
}

// ── Time Easter Egg v15 — Oracle Hours ───────────────────────────────────────

export function checkFirstCode(): BadgeType | null {
  if (hasBadge('first_code')) return null
  const now = new Date()
  if (now.getHours() === 1 && now.getMinutes() === 1) {
    awardBadge('first_code')
    return 'first_code'
  }
  return null
}

export function checkLeetHour(): BadgeType | null {
  if (hasBadge('leet_hour')) return null
  const now = new Date()
  if (now.getHours() === 13 && now.getMinutes() === 37) {
    awardBadge('leet_hour')
    return 'leet_hour'
  }
  return null
}

export function checkQuadSignal(): BadgeType | null {
  if (hasBadge('quad_signal')) return null
  const now = new Date()
  if (now.getHours() === 22 && now.getMinutes() === 22) {
    awardBadge('quad_signal')
    return 'quad_signal'
  }
  return null
}

export function checkSignalGate(): BadgeType | null {
  if (hasBadge('signal_gate')) return null
  const now = new Date()
  if (now.getHours() === 18 && now.getMinutes() === 18) {
    awardBadge('signal_gate')
    return 'signal_gate'
  }
  return null
}

// ── Calendar Easter Egg v14 — Oracle Calendar ─────────────────────────────────

export function checkInfinityGate(): BadgeType | null {
  if (hasBadge('infinity_gate')) return null
  const now = new Date()
  if (now.getMonth() + 1 === 8 && now.getDate() === 8) {
    awardBadge('infinity_gate')
    return 'infinity_gate'
  }
  return null
}

export function checkMoleDay(): BadgeType | null {
  if (hasBadge('mole_day')) return null
  const now = new Date()
  if (now.getMonth() + 1 === 10 && now.getDate() === 23) {
    awardBadge('mole_day')
    return 'mole_day'
  }
  return null
}

export function checkWorldWaterDay(): BadgeType | null {
  if (hasBadge('world_water_day')) return null
  const now = new Date()
  if (now.getMonth() + 1 === 3 && now.getDate() === 22) {
    awardBadge('world_water_day')
    return 'world_water_day'
  }
  return null
}

// ── Behavioral Easter Egg v14 — Oracle Patterns ──────────────────────────────

/**
 * Check Page One badge: very first journal entry ever on this account.
 * Call when a journal entry is saved, passing the lifetime journal count (before this entry).
 */
export function checkPageOne(lifetimeJournalCountBefore: number): BadgeType | null {
  if (hasBadge('page_one')) return null
  if (lifetimeJournalCountBefore === 0) {
    awardBadge('page_one')
    return 'page_one'
  }
  return null
}

/**
 * Check Full Stack Day badge: journal + mood + self-care + memory all in same calendar day.
 * widgetTypesToday: set of widget types used today (e.g. ['journal','mood','self_care','memory'])
 */
export function checkFullStackDay(widgetTypesToday: string[]): BadgeType | null {
  if (hasBadge('full_stack_day')) return null
  const required = ['journal', 'mood', 'self_care', 'memory']
  if (required.every(t => widgetTypesToday.includes(t))) {
    awardBadge('full_stack_day')
    return 'full_stack_day'
  }
  return null
}

/**
 * Check Double Depth badge: two memory answers of 100+ chars each in the same calendar day.
 * Call when a memory answer is submitted.
 */
export function checkDoubleDepth(answerText: string): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('double_depth')) return null
  if (answerText.length < 100) return null

  try {
    const todayStr = new Date().toISOString().slice(0, 10)
    const key = 'double_depth_log'
    const stored = localStorage.getItem(key)
    const log: Array<{ date: string; len: number }> = stored ? JSON.parse(stored) : []

    log.push({ date: todayStr, len: answerText.length })
    const todayDeep = log.filter(e => e.date === todayStr && e.len >= 100)
    localStorage.setItem(key, JSON.stringify(log.slice(-20)))

    if (todayDeep.length >= 2) {
      awardBadge('double_depth')
      return 'double_depth'
    }
  } catch { /* non-critical */ }

  return null
}

// ── Behavioral Easter Egg v12 — Alchemist Patterns ───────────────────────────

const ALCHEMIST_WORDS_V12 = [
  /\btransmute(d|s|r)?\b/i,
  /\bcrucible(s)?\b/i,
  /\bdistill(ed|s|ing|ation)?\b/i,
  /\bcatalyst(s)?\b/i,
  /\balloy(s|ed|ing)?\b/i,
  /\bsublimate(d|s|ing|ion)?\b/i,
  /\bprima\b/i,
  /\bopus\b/i,
  /\belixir(s)?\b/i,
  /\bchrysal(is|id)?\b/i,
  /\brefine(d|s|r|ment|ments|ing|ry)?\b/i,
  /\banneal(ed|s|ing)?\b/i,
]

/**
 * Award alchemist_session badge if 3+ distinct Alchemist (v12) words appear in one entry.
 * Call when a journal entry is saved.
 */
export function checkAlchemistSession(journalText: string): BadgeType | null {
  if (hasBadge('alchemist_session')) return null
  const matchCount = ALCHEMIST_WORDS_V12.filter(r => r.test(journalText)).length
  if (matchCount >= 3) {
    awardBadge('alchemist_session')
    return 'alchemist_session'
  }
  return null
}

/**
 * Award night_alchemist badge if an Alchemist word is used in a journal entry after 21:00.
 * Call when a journal entry is saved.
 */
export function checkNightAlchemist(journalText: string): BadgeType | null {
  if (hasBadge('night_alchemist')) return null
  const h = new Date().getHours()
  if (h < 21) return null
  const hasAlchemistWord = ALCHEMIST_WORDS_V12.some(r => r.test(journalText))
  if (hasAlchemistWord) {
    awardBadge('night_alchemist')
    return 'night_alchemist'
  }
  return null
}

/**
 * Award great_work_sequence badge for 7+ consecutive journal days.
 * Reads the journal_dates localStorage key (array of ISO date strings, deduped per day).
 * Call when a journal entry is saved.
 */
export function checkGreatWorkSequence(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('great_work_sequence')) return null

  try {
    const stored = localStorage.getItem('journal_dates')
    if (!stored) return null
    const raw: string[] = JSON.parse(stored)
    // Dedupe and sort descending
    const dates = Array.from(new Set(raw.map(d => d.slice(0, 10)))).sort().reverse()
    if (dates.length < 7) return null

    let consecutive = 1
    for (let i = 0; i < dates.length - 1; i++) {
      const a = new Date(dates[i])
      const b = new Date(dates[i + 1])
      const diff = Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 1) {
        consecutive++
        if (consecutive >= 7) {
          awardBadge('great_work_sequence')
          return 'great_work_sequence'
        }
      } else {
        consecutive = 1
      }
    }
  } catch { /* non-critical */ }

  return null
}

// ── Behavioral Easter Egg v13 — Terminal Patterns ────────────────────────────

const QUANTUM_WORDS_V16 = [
  /\bentangle(d|s|ment)?\b/i,
  /\bsingularity\b/i,
  /\bmatrix\b/i,
  /\bcortex\b/i,
  /\bholograph?(ic)?\b/i,
  /\buplink(s|ed|ing)?\b/i,
  /\bgrid(s|ded|ding)?\b/i,
  /\boverride(s|d|ing)?\b/i,
  /\bclone(d|s|r)?\b/i,
  /\bbandwidth\b/i,
  /\bsynthetic\b/i,
  /\b(cipher|cypher|decrypt|decode)(d|s|ing|er)?\b/i,
]

/**
 * Award quantum_session badge if 3+ distinct Quantum Library (v16) words appear in one entry.
 * Call when a journal entry is saved.
 */
export function checkQuantumSession(journalText: string): BadgeType | null {
  if (hasBadge('quantum_session')) return null
  const matchCount = QUANTUM_WORDS_V16.filter(r => r.test(journalText)).length
  if (matchCount >= 3) {
    awardBadge('quantum_session')
    return 'quantum_session'
  }
  return null
}

/**
 * Award library_run badge for 14+ consecutive journal days.
 * Reads the journal_dates localStorage key (array of ISO date strings).
 * Call when a journal entry is saved.
 */
export function checkLibraryRun(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('library_run')) return null

  try {
    const stored = localStorage.getItem('journal_dates')
    if (!stored) return null
    const raw: string[] = JSON.parse(stored)
    const dates = Array.from(new Set(raw.map(d => d.slice(0, 10)))).sort().reverse()
    if (dates.length < 14) return null

    let consecutive = 1
    for (let i = 0; i < dates.length - 1; i++) {
      const a = new Date(dates[i])
      const b = new Date(dates[i + 1])
      const diff = Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 1) {
        consecutive++
        if (consecutive >= 14) {
          awardBadge('library_run')
          return 'library_run'
        }
      } else {
        consecutive = 1
      }
    }
  } catch { /* non-critical */ }

  return null
}

/**
 * Award deep_decoder badge for a memory answer of 200+ characters.
 * Call when a memory answer is submitted, passing the answer text.
 */
export function checkDeepDecoder(answerText: string): BadgeType | null {
  if (hasBadge('deep_decoder')) return null
  if (answerText.length >= 200) {
    awardBadge('deep_decoder')
    return 'deep_decoder'
  }
  return null
}

// ── Behavioral Easter Egg v14 — Arcade Patterns ──────────────────────────────

const ARCADE_WORDS_V17 = [
  /\bneon\b/i,
  /\bcombo(s)?\b/i,
  /\bhigh[\s-]?score(s)?\b/i,
  /\bfree[\s-]?play\b/i,
  /\b(extra[\s-]?life|1[\s-]?up)\b/i,
  /\bspeed[\s-]?run(s|ning|ner)?\b/i,
  /\bside[\s-]?quest(s)?\b/i,
  /\bsurge(d|s|ing)?\b/i,
  /\bcartridge(s)?\b/i,
  /\bcontinue(d|s|ing)?\b/i,
  /\bjoystick(s)?\b/i,
  /\bcheckpoint(s|ed)?\b/i,
]

/**
 * Award arcade_run badge if 5+ distinct Neon Arcade (v17) words appear in one entry.
 * Call when a journal entry is saved.
 */
export function checkArcadeRun(journalText: string): BadgeType | null {
  if (hasBadge('arcade_run')) return null
  const matchCount = ARCADE_WORDS_V17.filter(r => r.test(journalText)).length
  if (matchCount >= 5) {
    awardBadge('arcade_run')
    return 'arcade_run'
  }
  return null
}

/**
 * Award quarter_drop badge when checking in between midnight and 01:00 local.
 * Call at check-in time.
 */
export function checkQuarterDrop(): BadgeType | null {
  if (hasBadge('quarter_drop')) return null
  const h = new Date().getHours()
  if (h === 0) {
    awardBadge('quarter_drop')
    return 'quarter_drop'
  }
  return null
}

/**
 * Award three_lives_left badge when a journal entry is written after a 3+ day gap.
 * Reads journal_dates localStorage key (array of ISO date strings).
 * Call when a journal entry is saved.
 */
export function checkThreeLivesLeft(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('three_lives_left')) return null

  try {
    const stored = localStorage.getItem('journal_dates')
    if (!stored) return null
    const raw: string[] = JSON.parse(stored)
    const dates = Array.from(new Set(raw.map(d => d.slice(0, 10)))).sort().reverse()
    if (dates.length < 2) return null

    const latest = new Date(dates[0])
    const previous = new Date(dates[1])
    const gapDays = Math.round((latest.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
    if (gapDays >= 3) {
      awardBadge('three_lives_left')
      return 'three_lives_left'
    }
  } catch { /* non-critical */ }

  return null
}

// ── Behavioral Easter Egg v15 — Broadcast Patterns ───────────────────────────

const RADIO_WORDS_V18 = [
  /\bfrequenc(y|ies)\b/i,
  /\bbroadcast(ing|s|ed)?\b/i,
  /\bwavelength(s)?\b/i,
  /\bantenna(s|e)?\b/i,
  /\breception\b/i,
  /\btransmit(s|ted|ting)?|transmission(s)?\b/i,
  /\btuned?\s*(in)?\b|\btuning\b/i,
  /\bchannel(s|ed|ing)?\b/i,
  /\bcarrier(s)?\b/i,
  /\bamplif(y|ied|ies|ying)|amplitude(s)?\b/i,
  /\binterference\b/i,
  /\bmodulat(e|es|ed|ing|ion)\b/i,
]

/**
 * Award signal_peak badge if 5+ distinct Midnight Radio (v18) words appear in one entry.
 * Call when a journal entry is saved.
 */
export function checkSignalPeak(journalText: string): BadgeType | null {
  if (hasBadge('signal_peak')) return null
  const matchCount = RADIO_WORDS_V18.filter(r => r.test(journalText)).length
  if (matchCount >= 5) {
    awardBadge('signal_peak')
    return 'signal_peak'
  }
  return null
}

/**
 * Award midnight_broadcast badge when a journal entry is written between 23:00–00:00 local.
 * Call when a journal entry is saved.
 */
export function checkMidnightBroadcast(): BadgeType | null {
  if (hasBadge('midnight_broadcast')) return null
  const h = new Date().getHours()
  if (h === 23) {
    awardBadge('midnight_broadcast')
    return 'midnight_broadcast'
  }
  return null
}

/**
 * Award static_clear badge when returning to journaling after a 7+ day gap.
 * Reads journal_dates localStorage key (array of ISO date strings).
 * Call when a journal entry is saved.
 */
export function checkStaticClear(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('static_clear')) return null

  try {
    const stored = localStorage.getItem('journal_dates')
    if (!stored) return null
    const raw: string[] = JSON.parse(stored)
    const dates = Array.from(new Set(raw.map(d => d.slice(0, 10)))).sort().reverse()
    if (dates.length < 2) return null

    const latest = new Date(dates[0])
    const previous = new Date(dates[1])
    const gapDays = Math.round((latest.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))
    if (gapDays >= 7) {
      awardBadge('static_clear')
      return 'static_clear'
    }
  } catch { /* non-critical */ }

  return null
}

// ── Bio-Terminal v19 behavioral checks ───────────────────────────────────────

const BIO_WORDS_V19 = [
  /\b(pulse|heartbeat|heart[\s-]?rate)\b/i,
  /\b(cortisol|stress[\s-]?hormone)\b/i,
  /\b(circadian|body[\s-]?clock)\b/i,
  /\b(rem[\s-]?sleep|deep[\s-]?sleep)\b|\bREM\b/,
  /\bdopamine\b/i,
  /\b(serotonin|wellbeing)\b/i,
  /\b(neuroplasticit(y|ies)|neuroplastic|rewir(e|es|ed|ing))\b/i,
  /\b(vagal|vagus|parasympathetic)\b/i,
  /\b(prefrontal|executive[\s-]?function)\b/i,
  /\b(endorphin(s)?|runner['']?s[\s-]?high)\b/i,
  /\b(biorhythm(s)?|body[\s-]?rhythm)\b/i,
  /\b(homeostasis|equilibrium|baseline)\b/i,
]

/**
 * Award bio_session badge if 3+ distinct Bio-Terminal (v19) words appear in one entry.
 */
export function checkBioSession(journalText: string): BadgeType | null {
  if (hasBadge('bio_session')) return null
  const matchCount = BIO_WORDS_V19.filter(r => r.test(journalText)).length
  if (matchCount >= 3) {
    awardBadge('bio_session')
    return 'bio_session'
  }
  return null
}

/**
 * Award body_signal badge if journal entry is 300+ words.
 */
export function checkBodySignal(journalText: string): BadgeType | null {
  if (hasBadge('body_signal')) return null
  const wordCount = journalText.trim().split(/\s+/).filter(w => w.length > 0).length
  if (wordCount >= 300) {
    awardBadge('body_signal')
    return 'body_signal'
  }
  return null
}

/**
 * Award morning_pulse badge if user checked in before 08:00 local time 5+ times in 7 days.
 * Call this on each check-in event.
 */
export function checkMorningPulse(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('morning_pulse')) return null

  const now = new Date()
  const hour = now.getHours()
  if (hour >= 8) return null

  try {
    const key = 'checkin_timestamps'
    const stored = localStorage.getItem(key)
    const timestamps: string[] = stored ? JSON.parse(stored) : []
    timestamps.push(now.toISOString())
    localStorage.setItem(key, JSON.stringify(timestamps.slice(-100)))

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const earlyMornings = timestamps.filter(ts => {
      const d = new Date(ts)
      return d >= sevenDaysAgo && d.getHours() < 8
    })
    if (earlyMornings.length >= 5) {
      awardBadge('morning_pulse')
      return 'morning_pulse'
    }
  } catch { /* non-critical */ }

  return null
}

// ── Codex Reader v20 behavioral checks ───────────────────────────────────────

const CODEX_WORDS_V20 = [
  /\basimov\b/i,
  /\b(fremen|arrakis|sandworm|bene[\s-]?gesserit)\b/i,
  /\b(red[\s-]?pill|blue[\s-]?pill|rabbit[\s-]?hole|morpheus)\b/i,
  /\b(wintermute|console[\s-]?cowboy|molly[\s-]?millions)\b/i,
  /\bdon'?t\s+panic\b|\bbabel[\s-]?fish\b/i,
  /\b(doublethink|thoughtcrime|newspeak)\b/i,
  /\b(fahrenheit|montag|bradbury)\b|\b451\b/i,
  /\b(le[\s-]?guin|ekumen|gethen)\b/i,
  /\b(androids[\s-]?dream|electric[\s-]?sheep)\b/i,
  /\b(thinking[\s-]?ocean|stanislaw[\s-]?lem)\b/i,
  /\b(octavia[\s-]?butler|parable[\s-]?of[\s-]?the|oankali)\b/i,
  /\b(heinlein|stranger[\s-]?in[\s-]?a[\s-]?strange)\b/i,
]

/**
 * Award reader_session badge if 2+ Codex Reader (v20) words appear in one journal entry.
 */
export function checkReaderSession(journalText: string): BadgeType | null {
  if (hasBadge('reader_session')) return null
  const matchCount = CODEX_WORDS_V20.filter(r => r.test(journalText)).length
  if (matchCount >= 2) {
    awardBadge('reader_session')
    return 'reader_session'
  }
  return null
}

/**
 * Award long_read badge if journal entry is 400+ words.
 */
export function checkLongRead(journalText: string): BadgeType | null {
  if (hasBadge('long_read')) return null
  const wordCount = journalText.trim().split(/\s+/).filter(w => w.length > 0).length
  if (wordCount >= 400) {
    awardBadge('long_read')
    return 'long_read'
  }
  return null
}

/**
 * Award page_turner badge if user answers 3+ memory questions within a 20-minute window.
 * Call this after each memory answer is submitted; tracks timestamps in localStorage.
 */
export function checkPageTurner(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('page_turner')) return null

  try {
    const key = 'memory_answer_timestamps'
    const now = Date.now()
    const stored = localStorage.getItem(key)
    const timestamps: number[] = stored ? JSON.parse(stored) : []
    timestamps.push(now)
    localStorage.setItem(key, JSON.stringify(timestamps.slice(-50)))

    const twentyMin = 20 * 60 * 1000
    const recent = timestamps.filter(t => now - t <= twentyMin)
    if (recent.length >= 3) {
      awardBadge('page_turner')
      return 'page_turner'
    }
  } catch { /* non-critical */ }

  return null
}

// ── Cyberspace Codex v21 behavioral checks ────────────────────────────────────

const CYBERSPACE_WORDS_V21 = [
  /\b(simulation|construct|agent[\s-]?smith)\b/i,
  /\b(cyborg|neural[\s-]?link|brain[\s-]?computer[\s-]?interface|bci)\b/i,
  /\bgrok(ked|king|s)?\b/i,
  /\b(ansible|ekumen|instantaneous[\s-]?communication)\b/i,
  /\b(melange|prescient|spice[\s-]?(flow|harvest))\b/i,
  /\bgolden[\s-]?path\b|\bforesight[\s-]?of[\s-]?leto\b/i,
  /\bocean[\s-]?consciousness\b|\bcontact[\s-]?impossible\b/i,
  /\b(seldon[\s-]?plan|second[\s-]?foundation)\b/i,
  /\bneuromancer\b|\bwilliam[\s-]?gibson\b/i,
  /\breplicant\b|\bmore[\s-]?human[\s-]?than[\s-]?human\b/i,
  /\b(uplift|transcendence|transcending)\b/i,
  /\bleft[\s-]?hand[\s-]?of[\s-]?darkness\b|\bgethen\b/i,
]

/**
 * Award codex_session badge if 3+ Cyberspace Codex (v21) words appear in one journal entry.
 */
export function checkCodexSession(journalText: string): BadgeType | null {
  if (hasBadge('codex_session')) return null
  const matchCount = CYBERSPACE_WORDS_V21.filter(r => r.test(journalText)).length
  if (matchCount >= 3) {
    awardBadge('codex_session')
    return 'codex_session'
  }
  return null
}

/**
 * Award deep_read badge if journal entry is 400+ words.
 */
export function checkDeepRead(journalText: string): BadgeType | null {
  if (hasBadge('deep_read')) return null
  const wordCount = journalText.trim().split(/\s+/).filter(w => w.length > 0).length
  if (wordCount >= 400) {
    awardBadge('deep_read')
    return 'deep_read'
  }
  return null
}

/**
 * Award night_operator badge if user checks in after 22:00 local time 3+ times in any 7-day window.
 */
export function checkNightOperator(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('night_operator')) return null

  const now = new Date()
  const hour = now.getHours()
  if (hour < 22) return null

  try {
    const key = 'night_checkin_timestamps'
    const stored = localStorage.getItem(key)
    const timestamps: string[] = stored ? JSON.parse(stored) : []
    timestamps.push(now.toISOString())
    localStorage.setItem(key, JSON.stringify(timestamps.slice(-100)))

    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const nightCheckins = timestamps.filter(ts => {
      const d = new Date(ts)
      return d >= sevenDaysAgo && d.getHours() >= 22
    })
    if (nightCheckins.length >= 3) {
      awardBadge('night_operator')
      return 'night_operator'
    }
  } catch { /* non-critical */ }

  return null
}

// ── L33T Hour — time check ────────────────────────────────────────────────────

/** Award leet_hour badge if current time is 13:37 (1337 — l33t time). */
export function checkLeetHour(): BadgeType | null {
  if (hasBadge('leet_hour')) return null
  const now = new Date()
  if (now.getHours() === 13 && now.getMinutes() === 37) {
    awardBadge('leet_hour')
    return 'leet_hour'
  }
  return null
}

// ── Hero's Journey v22 behavioral checks ─────────────────────────────────────

const HERO_WORDS_V22 = [
  /\bcall[\s-]?to[\s-]?adventure\b|\bjourney[\s-]?calls?\b/i,
  /\bthreshold\b|\bcrossing[\s-]?the[\s-]?line\b/i,
  /\bmentor\b|\bwise[\s-]?(guide|advisor|elder)\b/i,
  /\bordeal\b|\bsurvived[\s-]?(the[\s-])?test\b/i,
  /\belixir\b|\bthe[\s-]?boon\b|\btreasure[\s-]?found\b/i,
  /\bshadow[\s-]?self\b|\bdark[\s-]?night[\s-]?of[\s-]?the\b/i,
  /\binnermost[\s-]?cave\b|\bdarkest[\s-]?moment\b/i,
  /\bshapeshifter\b|\btransformed\b/i,
  /\bherald\b|\bwake[\s-]?up[\s-]?call\b/i,
  /\btrickster\b|\bcoyote[\s-]?wisdom\b/i,
  /\bally\b|\bfound[\s-]?my[\s-]?tribe\b/i,
  /\bthe[\s-]?return\b|\broad[\s-]?to[\s-]?return\b/i,
]

/**
 * Award hero_session badge if 3+ Hero's Journey (v22) words appear in one journal entry.
 */
export function checkHeroSession(journalText: string): BadgeType | null {
  if (hasBadge('hero_session')) return null
  const matchCount = HERO_WORDS_V22.filter(r => r.test(journalText)).length
  if (matchCount >= 3) {
    awardBadge('hero_session')
    return 'hero_session'
  }
  return null
}

/**
 * Award long_quest badge if journal entry is 500+ words.
 */
export function checkLongQuest(journalText: string): BadgeType | null {
  if (hasBadge('long_quest')) return null
  const wordCount = journalText.trim().split(/\s+/).filter(w => w.length > 0).length
  if (wordCount >= 500) {
    awardBadge('long_quest')
    return 'long_quest'
  }
  return null
}

/**
 * Award threshold_moment badge if user checks in between 00:00 and 00:30 local time.
 */
export function checkThresholdMoment(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('threshold_moment')) return null

  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  if (hour === 0 && minute <= 30) {
    awardBadge('threshold_moment')
    return 'threshold_moment'
  }
  return null
}

// ── RPG Codex v23 — word detection and behavioral checks ─────────────────────

const RPG_WORDS_V23 = [
  /\blevel[\s-]?up\b|\bleveled[\s-]?up\b|\bgained[\s-]?a[\s-]?level\b/i,
  /\bexperience[\s-]?points\b|\b[Xx][Pp]\b|\bgrinding\b|\bgrind[\s-]?session\b/i,
  /\bquest[\s-]?log\b|\bside[\s-]?quest\b|\bmain[\s-]?quest\b|\bnew[\s-]?quest\b/i,
  /\bdungeon\b|\bdungeon[\s-]?crawl\b|\bboss[\s-]?room\b|\blevel[\s-]?boss\b/i,
  /\bcast[\s-]?a[\s-]?spell\b|\bmana\b|\bspellbook\b|\bincantation\b/i,
  /\bloot[\s-]?drop\b|\btreasure[\s-]?chest\b|\brave[\s-]?item\b|\blegendary[\s-]?drop\b/i,
  /\brespawn\b|\bsecond[\s-]?chance\b|\bcheckpoint[\s-]?saved\b|\bnew[\s-]?life[\s-]?begins\b/i,
  /\bguild\b|\braid[\s-]?party\b|\bjoin[\s-]?the[\s-]?guild\b|\bparty[\s-]?member\b/i,
  /\bboss[\s-]?fight\b|\bfinal[\s-]?boss\b|\bendgame[\s-]?boss\b|\bboss[\s-]?battle\b/i,
  /\bcharacter[\s-]?class\b|\bmy[\s-]?class\b|\bskill[\s-]?build\b|\barchetype[\s-]?choice\b/i,
  /\binventory[\s-]?full\b|\bbackpack\b|\bloadout\b|\bitem[\s-]?slots\b/i,
  /\bskill[\s-]?tree\b|\btalent[\s-]?tree\b|\bpassive[\s-]?ability\b|\bunlock[\s-]?skill\b/i,
]

/**
 * Award rpg_session badge if 3+ RPG Codex (v23) words appear in one journal entry.
 */
export function checkRPGSession(journalText: string): BadgeType | null {
  if (hasBadge('rpg_session')) return null
  const matchCount = RPG_WORDS_V23.filter(r => r.test(journalText)).length
  if (matchCount >= 3) {
    awardBadge('rpg_session')
    return 'rpg_session'
  }
  return null
}

/**
 * Award marathon_log badge if journal entry is 600+ words.
 */
export function checkMarathonLog(journalText: string): BadgeType | null {
  if (hasBadge('marathon_log')) return null
  const wordCount = journalText.trim().split(/\s+/).filter(w => w.length > 0).length
  if (wordCount >= 600) {
    awardBadge('marathon_log')
    return 'marathon_log'
  }
  return null
}

/**
 * Check word-turn badges for RPG Codex v23 keywords in journal text.
 * Returns array of newly awarded badge IDs.
 */
export function checkRPGCodexWordTurns(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []
  const text = journalText

  const checks: Array<[RegExp, BadgeType]> = [
    [/\blevel[\s-]?up\b|\bleveled[\s-]?up\b|\bgained[\s-]?a[\s-]?level\b/i, 'levelup_signal'],
    [/\bexperience[\s-]?points\b|\b[Xx][Pp]\b|\bgrinding\b|\bgrind[\s-]?session\b/i, 'xp_earned'],
    [/\bquest[\s-]?log\b|\bside[\s-]?quest\b|\bmain[\s-]?quest\b|\bnew[\s-]?quest\b/i, 'quest_log_entry'],
    [/\bdungeon\b|\bdungeon[\s-]?crawl\b|\bboss[\s-]?room\b|\blevel[\s-]?boss\b/i, 'dungeon_dive'],
    [/\bcast[\s-]?a[\s-]?spell\b|\bmana\b|\bspellbook\b|\bincantation\b/i, 'spell_cast'],
    [/\bloot[\s-]?drop\b|\btreasure[\s-]?chest\b|\brave[\s-]?item\b|\blegendary[\s-]?drop\b/i, 'loot_drop'],
    [/\brespawn\b|\bsecond[\s-]?chance\b|\bcheckpoint[\s-]?saved\b|\bnew[\s-]?life[\s-]?begins\b/i, 'respawn_signal'],
    [/\bguild\b|\braid[\s-]?party\b|\bjoin[\s-]?the[\s-]?guild\b|\bparty[\s-]?member\b/i, 'guild_protocol'],
    [/\bboss[\s-]?fight\b|\bfinal[\s-]?boss\b|\bendgame[\s-]?boss\b|\bboss[\s-]?battle\b/i, 'boss_encounter'],
    [/\bcharacter[\s-]?class\b|\bmy[\s-]?class\b|\bskill[\s-]?build\b|\barchetype[\s-]?choice\b/i, 'character_class'],
    [/\binventory[\s-]?full\b|\bbackpack\b|\bloadout\b|\bitem[\s-]?slots\b/i, 'inventory_check'],
    [/\bskill[\s-]?tree\b|\btalent[\s-]?tree\b|\bpassive[\s-]?ability\b|\bunlock[\s-]?skill\b/i, 'skill_tree_node'],
  ]

  for (const [pattern, badgeId] of checks) {
    if (!hasBadge(badgeId) && pattern.test(text)) {
      if (awardBadge(badgeId)) awarded.push(badgeId)
    }
  }
  return awarded
}

/**
 * Check secret boss v20 — hidden RPG/Gaming triggers.
 * Returns array of newly awarded badge IDs.
 */
export function checkFinalBossVault(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []

  if (!hasBadge('zelda_triforce') && /\btriforce\b|\bhyrule\b|\blink's[\s-]?journey\b|\bganondorf\b/i.test(journalText)) {
    if (awardBadge('zelda_triforce')) awarded.push('zelda_triforce')
  }
  if (!hasBadge('pac_ghost') && /\bpac[\s-]?man\b|\bwaka[\s-]?waka\b|\bblinky\b|\bpower[\s-]?pellet\b|\binky[\s-]?pinky\b/i.test(journalText)) {
    if (awardBadge('pac_ghost')) awarded.push('pac_ghost')
  }
  if (!hasBadge('konami_code') && /\bkonami[\s-]?code\b|\bup[\s-]?up[\s-]?down[\s-]?down\b|\bb[\s-]?a[\s-]?start\b|\bbarrel[\s-]?roll\b/i.test(journalText)) {
    if (awardBadge('konami_code')) awarded.push('konami_code')
  }

  return awarded
}

// ── v34 — THE ROGUELITE CODEX ─────────────────────────────────────────────────

const ROGUE_WORDS_V24 = [
  /\bpermadeath\b|\bpermanent[\s-]?death\b|\bone[\s-]?life\b|\bno[\s-]?continues\b/i,
  /\bprocgen\b|\brandom[\s-]?seed\b|\bprocedurally[\s-]?generated\b|\bnew[\s-]?run\b/i,
  /\brng\b|\bgod[\s-]?roll\b|\blucky[\s-]?run\b|\bblessed[\s-]?rng\b/i,
  /\bbiome\b|\bnew[\s-]?biome\b|\bfloor[\s-]?biome\b|\benvironment[\s-]?zone\b/i,
  /\bmeta[\s-]?progression\b|\bpersistent[\s-]?upgrade\b|\bbetween[\s-]?runs\b|\bmetaprogress\b/i,
  /\bsynergy\b|\bbuild[\s-]?synergy\b|\bitem[\s-]?synergy\b|\bcombination[\s-]?discovered\b/i,
  /\bfloor[\s-]?cleared\b|\broom[\s-]?cleared\b|\bfloor[\s-]?complete\b|\bdungeon[\s-]?floor\b/i,
  /\bmutation\b|\bpassive[\s-]?upgrade\b|\bpicked[\s-]?a[\s-]?passive\b|\bselected[\s-]?upgrade\b/i,
  /\bheat[\s-]?level\b|\bheat[\s-]?gauge\b|\bdifficulty[\s-]?dial\b|\binfernal[\s-]?arms\b/i,
  /\bdivine[\s-]?boon\b|\bboon\b|\bnectar[\s-]?offered\b|\bgods?[\s-]?blessings?\b/i,
  /\bendless[\s-]?mode\b|\binfinite[\s-]?run\b|\bno[\s-]?escape\b|\bkeep[\s-]?going[\s-]?forever\b/i,
  /\bascension\b|\bfinal[\s-]?ascension\b|\btrue[\s-]?ending\b|\bascended\b/i,
]

/**
 * Award roguelite_session badge if 3+ Roguelite Codex (v24) words appear in one journal entry.
 */
export function checkRogueliteSession(journalText: string): BadgeType | null {
  if (hasBadge('roguelite_session')) return null
  const matchCount = ROGUE_WORDS_V24.filter(r => r.test(journalText)).length
  if (matchCount >= 3) {
    awardBadge('roguelite_session')
    return 'roguelite_session'
  }
  return null
}

/**
 * Award nine_nine_hour badge if check-in occurs at 09:09 local time.
 */
export function checkNineNineHour(): BadgeType | null {
  if (hasBadge('nine_nine_hour')) return null
  const now = new Date()
  if (now.getHours() === 9 && now.getMinutes() === 9) {
    awardBadge('nine_nine_hour')
    return 'nine_nine_hour'
  }
  return null
}

/**
 * Award fresh_start badge if this is the first check-in after a 14+ day gap.
 * Requires lastCheckInDate from stats.
 */
export function checkFreshStart(lastCheckInDate: string | null | undefined): BadgeType | null {
  if (hasBadge('fresh_start')) return null
  if (!lastCheckInDate) return null
  const last = new Date(lastCheckInDate)
  const now = new Date()
  const dayGap = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  if (dayGap >= 14) {
    awardBadge('fresh_start')
    return 'fresh_start'
  }
  return null
}

/**
 * Check word-turn badges for Roguelite Codex v24 keywords in journal text.
 * Returns array of newly awarded badge IDs.
 */
export function checkRogueliteCodexWordTurns(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []
  const text = journalText

  const checks: Array<[RegExp, BadgeType]> = [
    [/\bpermadeath\b|\bpermanent[\s-]?death\b|\bone[\s-]?life\b|\bno[\s-]?continues\b/i, 'permadeath_accepted'],
    [/\bprocgen\b|\brandom[\s-]?seed\b|\bprocedurally[\s-]?generated\b|\bnew[\s-]?run\b/i, 'procedural_run'],
    [/\brng\b|\bgod[\s-]?roll\b|\blucky[\s-]?run\b|\bblessed[\s-]?rng\b/i, 'rng_blessed'],
    [/\bbiome\b|\bnew[\s-]?biome\b|\bfloor[\s-]?biome\b|\benvironment[\s-]?zone\b/i, 'biome_entered'],
    [/\bmeta[\s-]?progression\b|\bpersistent[\s-]?upgrade\b|\bbetween[\s-]?runs\b|\bmetaprogress\b/i, 'meta_progress'],
    [/\bsynergy\b|\bbuild[\s-]?synergy\b|\bitem[\s-]?synergy\b|\bcombination[\s-]?discovered\b/i, 'synergy_found'],
    [/\bfloor[\s-]?cleared\b|\broom[\s-]?cleared\b|\bfloor[\s-]?complete\b|\bdungeon[\s-]?floor\b/i, 'floor_cleared'],
    [/\bmutation\b|\bpassive[\s-]?upgrade\b|\bpicked[\s-]?a[\s-]?passive\b|\bselected[\s-]?upgrade\b/i, 'mutation_chosen'],
    [/\bheat[\s-]?level\b|\bheat[\s-]?gauge\b|\bdifficulty[\s-]?dial\b|\binfernal[\s-]?arms\b/i, 'heat_level'],
    [/\bdivine[\s-]?boon\b|\bboon\b|\bnectar[\s-]?offered\b|\bgods?[\s-]?blessings?\b/i, 'boon_accepted'],
    [/\bendless[\s-]?mode\b|\binfinite[\s-]?run\b|\bno[\s-]?escape\b|\bkeep[\s-]?going[\s-]?forever\b/i, 'endless_mode'],
    [/\bascension\b|\bfinal[\s-]?ascension\b|\btrue[\s-]?ending\b|\bascended\b/i, 'ascension_run'],
  ]

  for (const [pattern, badgeId] of checks) {
    if (!hasBadge(badgeId) && pattern.test(text)) {
      if (awardBadge(badgeId)) awarded.push(badgeId)
    }
  }
  return awarded
}

/**
 * Check secret boss v21 — hidden Roguelite vault triggers.
 * Returns array of newly awarded badge IDs.
 */
export function checkRogueVault(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []

  if (!hasBadge('hades_shade') && /\bshade\b|\bcharon\b|\bnyx\b|\bthanatos\b|\bhypnos\b|\belysium\b/i.test(journalText)) {
    if (awardBadge('hades_shade')) awarded.push('hades_shade')
  }
  if (!hasBadge('nethack_rune') && /\bnethack\b|\byasd\b|\badom\b|\brogue[\s-]?variant\b/i.test(journalText)) {
    if (awardBadge('nethack_rune')) awarded.push('nethack_rune')
  }
  if (!hasBadge('isaac_secret') && /\bgreedier[\s-]?mode\b|\bmega[\s-]?satan\b|\bafterbirth\b|\brepentance\b|\bbinding[\s-]?of\b/i.test(journalText)) {
    if (awardBadge('isaac_secret')) awarded.push('isaac_secret')
  }

  return awarded
}

/**
 * Check word-turn badges for Puzzle Codex v25 keywords in journal text.
 * Returns array of newly awarded badge IDs.
 */
export function checkPuzzleCodexWordTurns(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []
  const text = journalText

  const checks: Array<[RegExp, BadgeType]> = [
    [/\bpuzzle[d]?\b|\bsolve[\s-]?the[\s-]?puzzle\b|\bpiece[\s-]?together\b/i, 'puzzle_solved'],
    [/\bportal\b|\bwormhole[\s-]?portal\b|\bteleport\b|\bgateway[\s-]?portal\b/i, 'portal_open'],
    [/\bchamber\b|\btest[\s-]?chamber\b|\bsolution[\s-]?chamber\b|\btrap[\s-]?chamber\b/i, 'chamber_cleared'],
    [/\brecursion\b|\brecursive[\s-]?loop\b|\bit[\s-]?loops\b|\bcircular[\s-]?loop\b/i, 'recursion_loop'],
    [/\bparadox\b|\bcatch[\s-]?22\b|\bcontradiction\b|\bimpossible[\s-]?loop\b/i, 'paradox_found'],
    [/\btestimony\b|\bwitness[\s-]?statement\b|\bdepose\b|\baccount[\s-]?given\b/i, 'testimony_given'],
    [/\balgorithm\b|\balgorithmic\b|\bsequence[\s-]?path\b|\bsorted[\s-]?by\b/i, 'algorithm_path'],
    [/\bescape[\s-]?room\b|\blocked[\s-]?room\b|\bpuzzle[\s-]?escape\b|\bescape[\s-]?from\b/i, 'escape_room'],
    [/\blogic\b|\blogical\b|\bif[\s-]?then\b|\bbinary[\s-]?logic\b|\bdecision[\s-]?tree\b/i, 'logic_gate'],
    [/\bdimension\b|\bnew[\s-]?dimension\b|\bshifted[\s-]?dimension\b|\bdimensional\b/i, 'dimension_shift'],
    [/\bpapers[\s-]?please\b|\bpaperwork\b|\bstamped[\s-]?approved\b|\bdocuments[\s-]?cleared\b/i, 'paperwork_clear'],
    [/\brevelation\b|\bepiphany\b|\bsuddenly[\s-]?realized\b|\baha[\s-]?moment\b/i, 'revelation_node'],
  ]

  for (const [pattern, badgeId] of checks) {
    if (!hasBadge(badgeId) && pattern.test(text)) {
      if (awardBadge(badgeId)) awarded.push(badgeId)
    }
  }
  return awarded
}

/**
 * Award puzzle_session badge if 3+ Puzzle Codex (v25) words appear in one journal entry.
 */
export function checkPuzzleSession(journalText: string): BadgeType | null {
  if (hasBadge('puzzle_session')) return null
  const puzzlePatterns = [
    /\bpuzzle[d]?\b|\bsolve[\s-]?the[\s-]?puzzle\b/i,
    /\bportal\b|\bwormhole[\s-]?portal\b|\bteleport\b/i,
    /\bchamber\b|\btest[\s-]?chamber\b/i,
    /\brecursion\b|\brecursive[\s-]?loop\b/i,
    /\bparadox\b|\bcatch[\s-]?22\b|\bcontradiction\b/i,
    /\btestimony\b|\bwitness[\s-]?statement\b/i,
    /\balgorithm\b|\balgorithmic\b/i,
    /\bescape[\s-]?room\b|\blocked[\s-]?room\b/i,
    /\blogic\b|\blogical\b|\bif[\s-]?then\b/i,
    /\bdimension\b|\bnew[\s-]?dimension\b/i,
    /\bpapers[\s-]?please\b|\bpaperwork\b/i,
    /\brevelation\b|\bepiphany\b|\bsuddenly[\s-]?realized\b/i,
  ]
  const matchCount = puzzlePatterns.filter(p => p.test(journalText)).length
  if (matchCount >= 3) {
    awardBadge('puzzle_session')
    return 'puzzle_session'
  }
  return null
}

/**
 * Check secret boss v22 — hidden Puzzle Vault triggers.
 * Returns array of newly awarded badge IDs.
 */
export function checkPuzzleVault(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []

  if (!hasBadge('portal_turret') && /\bcompanion[\s-]?cube\b|\baperture\b|\bglados\b|\bwheatley\b|\bcake[\s-]?is[\s-]?a[\s-]?lie\b/i.test(journalText)) {
    if (awardBadge('portal_turret')) awarded.push('portal_turret')
  }
  if (!hasBadge('the_witness_eye') && /\bthe[\s-]?witness\b|\bjungle[\s-]?puzzles\b|\bisland[\s-]?lasers\b|\blaser[\s-]?beams\b/i.test(journalText)) {
    if (awardBadge('the_witness_eye')) awarded.push('the_witness_eye')
  }
  if (!hasBadge('baba_is_you') && /\bbaba[\s-]?is[\s-]?you\b|\bkeke\b|\bwin[\s-]?condition\b|\brock[\s-]?is\b/i.test(journalText)) {
    if (awardBadge('baba_is_you')) awarded.push('baba_is_you')
  }

  return awarded
}

/**
 * Check morning_solve badge: check-in between 06:00 and 08:00 for 5 consecutive days.
 */
export function checkMorningSolve(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('morning_solve')) return null

  const now = new Date()
  const hour = now.getHours()
  if (hour < 6 || hour >= 8) return null

  try {
    const key = 'morning_solve_streak'
    const raw = localStorage.getItem(key)
    const streak = raw ? JSON.parse(raw) : { count: 0, lastDate: '' }
    const today = now.toISOString().split('T')[0]
    if (streak.lastDate === today) return null

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yDate = yesterday.toISOString().split('T')[0]

    const newCount = streak.lastDate === yDate ? streak.count + 1 : 1
    localStorage.setItem(key, JSON.stringify({ count: newCount, lastDate: today }))

    if (newCount >= 5) {
      awardBadge('morning_solve')
      return 'morning_solve'
    }
  } catch { /* non-critical */ }
  return null
}


// ── v26 MAP ROOM — behavioral detection ──────────────────────────────────────

const MAP_WORDS_V26: RegExp[] = [
  /\bfog[\s-]?of[\s-]?war\b|\bfog[\s-]?lifted\b|\bclarity[\s-]?came\b/i,
  /\btreasure[\s-]?room\b|\bunexpected[\s-]?find\b|\bfound[\s-]?gold\b/i,
  /\bsecret[\s-]?passage\b|\bhidden[\s-]?door\b|\bsecret[\s-]?room\b/i,
  /\btrap\b|\bdisarmed\b|\bsaw[\s-]?it[\s-]?coming\b/i,
  /\bupdated[\s-]?my[\s-]?map\b|\bcharted\b|\bnew[\s-]?territory\b/i,
  /\blow[\s-]?hp\b|\brunning[\s-]?on[\s-]?empty\b|\bdepleted\b/i,
  /\blit[\s-]?a[\s-]?candle\b|\bshed[\s-]?light[\s-]?on\b|\billuminated\b/i,
  /\blocked[\s-]?door\b|\bnot[\s-]?ready[\s-]?yet\b|\bgated\b/i,
  /\bfound[\s-]?the[\s-]?key\b|\bkey[\s-]?insight\b|\bunlocked[\s-]?it\b/i,
  /\bfinal[\s-]?room\b|\blast[\s-]?door\b|\bendgame[\s-]?moment\b/i,
  /\brest[\s-]?point\b|\bsafe[\s-]?room\b|\brest[\s-]?and[\s-]?recharge\b/i,
  /\bfound[\s-]?the[\s-]?path\b|\bway[\s-]?forward\b|\bpath[\s-]?forward\b/i,
]

/**
 * Award map_session if 3+ Map Room (v26) words appear in one journal entry.
 */
export function checkMapSession(journalText: string): BadgeType | null {
  if (hasBadge('map_session')) return null
  const matchCount = MAP_WORDS_V26.filter(r => r.test(journalText)).length
  if (matchCount >= 3) {
    awardBadge('map_session')
    return 'map_session'
  }
  return null
}

/**
 * Award illuminated if journal entry is 700+ words (the cartographer's log).
 */
export function checkIlluminated(journalText: string): BadgeType | null {
  if (hasBadge('illuminated')) return null
  const wordCount = journalText.trim().split(/\s+/).filter(w => w.length > 0).length
  if (wordCount >= 700) {
    awardBadge('illuminated')
    return 'illuminated'
  }
  return null
}

/**
 * Award dawn_patrol if check-in happens before 06:00 local on 2 separate days.
 */
export function checkDawnPatrol(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('dawn_patrol')) return null

  const now = new Date()
  const hour = now.getHours()
  if (hour >= 6) return null

  try {
    const key = 'dawn_patrol_dates'
    const raw = localStorage.getItem(key)
    const dates: string[] = raw ? JSON.parse(raw) : []
    const today = now.toISOString().split('T')[0]
    if (!dates.includes(today)) {
      dates.push(today)
      localStorage.setItem(key, JSON.stringify(dates.slice(-30)))
    }
    if (dates.length >= 2) {
      awardBadge('dawn_patrol')
      return 'dawn_patrol'
    }
  } catch { /* non-critical */ }
  return null
}

/**
 * Check secret boss v23 — hidden Ancient Vault triggers.
 * Returns array of newly awarded badge IDs.
 */
export function checkAncientVault(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []

  if (!hasBadge('dark_souls_echo') && /\bdark[\s-]?souls\b|\byou[\s-]?died\b|\bbonfire[\s-]?lit\b|\bestus[\s-]?flask\b|\bpraise[\s-]?the[\s-]?sun\b/i.test(journalText)) {
    if (awardBadge('dark_souls_echo')) awarded.push('dark_souls_echo')
  }
  if (!hasBadge('d_n_d_roll') && /\bd[\s-]?n[\s-]?d\b|\bdungeons?[\s-]?and[\s-]?dragons?\b|\bnat[\s-]?20\b|\bnatural[\s-]?twenty\b/i.test(journalText)) {
    if (awardBadge('d_n_d_roll')) awarded.push('d_n_d_roll')
  }
  if (!hasBadge('myst_island') && /\bmyst\b|\briven\b|\batrus\b|\bd[\s-]?ni\b|\blinking[\s-]?book\b/i.test(journalText)) {
    if (awardBadge('myst_island')) awarded.push('myst_island')
  }

  return awarded
}

/**
 * Check behavioral v24 — Chrono Session (3+ v27 words in one entry).
 */
export function checkChronoSession(journalText: string): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('chrono_session')) return null

  const chronoPatterns = [
    /\btime[\s-]?loop\b|\bstuck[\s-]?in[\s-]?a[\s-]?loop\b|\bgroundhog[\s-]?day\b|\bsame[\s-]?cycle\b/i,
    /\bparadox\b|\bcontradiction\b|\bholding[\s-]?both[\s-]?truths\b|\bcognitive[\s-]?dissonance\b/i,
    /\bparallel\b|\balternative[\s-]?version\b|\bwhat[\s-]?if[\s-]?i[\s-]?had\b|\bother[\s-]?me\b/i,
    /\bnew[\s-]?chapter\b|\brewriting\b|\bfresh[\s-]?timeline\b|\bresetting[\s-]?my\b/i,
    /\bpast[\s-]?self\b|\byounger[\s-]?self\b|\bwent[\s-]?back[\s-]?to\b|\bold[\s-]?wound\b/i,
    /\bfuture[\s-]?self\b|\bletter[\s-]?to[\s-]?future\b|\bfuture[\s-]?me\b|\becho[\s-]?from\b/i,
    /\bgrounded[\s-]?in[\s-]?now\b|\bcame[\s-]?back[\s-]?to\b|\banchored\b|\bbrought[\s-]?back\b/i,
    /\badrift\b|\blost[\s-]?track[\s-]?of[\s-]?time\b|\btime[\s-]?flew[\s-]?by\b|\blost[\s-]?sense\b/i,
    /\bslow[\s-]?down\b|\bslowed[\s-]?down\b|\btook[\s-]?it[\s-]?slow\b|\bsavored[\s-]?the\b/i,
    /\bjumped[\s-]?ahead\b|\brushed[\s-]?through\b|\bfast[\s-]?forward\b|\bskipped[\s-]?over\b/i,
    /\bturning[\s-]?point\b|\bnew[\s-]?era\b|\bhistoric[\s-]?for[\s-]?me\b|\bentered[\s-]?a[\s-]?new[\s-]?era\b/i,
    /\btime[\s-]?capsule\b|\bwrote[\s-]?to[\s-]?future\b|\bletter[\s-]?to[\s-]?future\b|\bsealed\b/i,
  ]
  const matches = chronoPatterns.filter(p => p.test(journalText)).length
  if (matches >= 3) {
    if (awardBadge('chrono_session')) return 'chrono_session'
  }
  return null
}

/**
 * Check behavioral v24 — Deep Archive (journal entry >= 600 words).
 */
export function checkDeepArchive(journalText: string): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('deep_archive')) return null

  const wordCount = journalText.trim().split(/\s+/).filter(Boolean).length
  if (wordCount >= 600) {
    if (awardBadge('deep_archive')) return 'deep_archive'
  }
  return null
}

/**
 * Check behavioral v24 — Retrograde Check (check-in 04:00–05:00 local).
 */
export function checkRetrogradeCheck(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('retrograde_check')) return null

  const hour = new Date().getHours()
  if (hour === 4) {
    if (awardBadge('retrograde_check')) return 'retrograde_check'
  }
  return null
}

/**
 * Check secret boss v24 — hidden Time Vault triggers.
 * Returns array of newly awarded badge IDs.
 */
export function checkTimeVaultBoss(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []

  if (!hasBadge('wells_machine') && /\btime[\s-]?machine\b|\btime[\s-]?traveler\b|\bh\.?g\.?[\s-]?wells\b|\bwar[\s-]?of[\s-]?the[\s-]?worlds\b/i.test(journalText)) {
    if (awardBadge('wells_machine')) awarded.push('wells_machine')
  }
  if (!hasBadge('dick_time') && /\bubik\b|\bpalmer[\s-]?eldritch\b|\btime[\s-]?out[\s-]?of[\s-]?joint\b|\bflow[\s-]?my[\s-]?tears\b/i.test(journalText)) {
    if (awardBadge('dick_time')) awarded.push('dick_time')
  }
  if (!hasBadge('vonnegut_stuck') && /\bunstuck[\s-]?in[\s-]?time\b|\bbilly[\s-]?pilgrim\b|\bslaughterhouse\b|\bvonnegut\b/i.test(journalText)) {
    if (awardBadge('vonnegut_stuck')) awarded.push('vonnegut_stuck')
  }

  return awarded
}

// ── v28 DUNGEON DELVER — behavioral detection ─────────────────────────────

const DUNGEON_WORDS_V28: RegExp[] = [
  /\bcritical[\s-]?success\b|\bscored[\s-]?a[\s-]?critical\b|\bperfect[\s-]?execution\b|\brolled[\s-]?perfectly\b/i,
  /\bsaving[\s-]?throw\b|\bmade[\s-]?the[\s-]?save\b|\bresist[\s-]?the[\s-]?pull\b|\bdodged[\s-]?the[\s-]?blow\b/i,
  /\bleveled[\s-]?up\b|\bgained[\s-]?experience\b|\bnext[\s-]?level\b|\bcharacter[\s-]?growth\b/i,
  /\brolling[\s-]?the[\s-]?dice\b|\bleft[\s-]?it[\s-]?to[\s-]?chance\b|\bdice[\s-]?fall\b/i,
  /\bdark[\s-]?corridor\b|\bwinding[\s-]?path[\s-]?down\b|\bcarved[\s-]?my[\s-]?way\b|\binto[\s-]?the[\s-]?depths\b/i,
  /\blong[\s-]?arc\b|\bcharacter[\s-]?arc\b|\bstory[\s-]?arc\b|\brunning[\s-]?campaign\b/i,
  /\bwearing[\s-]?many[\s-]?hats\b|\btwo[\s-]?paths[\s-]?at[\s-]?once\b|\bhybrid[\s-]?skill\b/i,
  /\bnoticed[\s-]?something\b|\bpaying[\s-]?closer[\s-]?attention\b|\blooked[\s-]?closer\b/i,
  /\bhit[\s-]?points\b|\brunning[\s-]?on[\s-]?fumes\b|\benergy[\s-]?depleted\b|\blow[\s-]?on[\s-]?reserves\b/i,
  /\bfull[\s-]?recovery\b|\brestorative[\s-]?sleep\b|\bdeep[\s-]?sleep[\s-]?night\b|\brested[\s-]?and[\s-]?restored\b/i,
  /\bkept[\s-]?going[\s-]?despite\b|\bendured[\s-]?the\b|\bstamina[\s-]?to\b|\bsheer[\s-]?persistence\b/i,
  /\bfinal[\s-]?encounter\b|\bdecisive[\s-]?moment\b|\bmoment[\s-]?of[\s-]?truth\b|\bnow[\s-]?or[\s-]?never\b/i,
]

export function checkDungeonSession(journalText: string): BadgeType | null {
  if (hasBadge('dungeon_session')) return null
  const matchCount = DUNGEON_WORDS_V28.filter(r => r.test(journalText)).length
  if (matchCount >= 3) {
    awardBadge('dungeon_session')
    return 'dungeon_session'
  }
  return null
}

export function checkMarathonQuest(journalText: string): BadgeType | null {
  if (hasBadge('marathon_quest')) return null
  const wordCount = journalText.trim().split(/\s+/).filter(w => w.length > 0).length
  if (wordCount >= 750) {
    awardBadge('marathon_quest')
    return 'marathon_quest'
  }
  return null
}

export function checkMidnightCampaign(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('midnight_campaign')) return null

  const hour = new Date().getHours()
  if (hour === 22) {
    if (awardBadge('midnight_campaign')) return 'midnight_campaign'
  }
  return null
}

export function checkDragonVault(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []

  if (!hasBadge('tolkien_dungeon') && /\bmoria\b|\bmines[\s-]?of[\s-]?moria\b|\byou[\s-]?shall[\s-]?not[\s-]?pass\b|\bbalrog\b|\bkhazad[\s-]?dum\b/i.test(journalText)) {
    if (awardBadge('tolkien_dungeon')) awarded.push('tolkien_dungeon')
  }
  if (!hasBadge('gygax_voice') && /\bgary[\s-]?gygax\b|\bpen[\s-]?and[\s-]?paper[\s-]?rpg\b|\btabletop[\s-]?rpg\b|\bdave[\s-]?arneson\b/i.test(journalText)) {
    if (awardBadge('gygax_voice')) awarded.push('gygax_voice')
  }
  if (!hasBadge('dragon_hoard') && /\bdragon[\s-]?hoard\b|\bsmaug\b|\bancient[\s-]?dragon\b|\bfirebreather\b|\bye[\s-]?olde[\s-]?dragon\b/i.test(journalText)) {
    if (awardBadge('dragon_hoard')) awarded.push('dragon_hoard')
  }

  return awarded
}

// ── v29 THE JRPG ENGINE — Behavioral checks ──────────────────────────────────

/** Award jrpg_session when 3+ v29 JRPG words appear in a single journal entry */
export function checkJrpgSession(journalText: string): BadgeType | null {
  if (hasBadge('jrpg_session')) return null
  const patterns = [
    /\boverworld\b|\bworld[\s-]?map\b/i,
    /\binn\b|\bsave[\s-]?state\b/i,
    /\bparty\b|\bmy[\s-]?companions\b/i,
    /\blimit[\s-]?break\b|\btrance[\s-]?state\b/i,
    /\bphoenix[\s-]?down\b|\bback[\s-]?from[\s-]?the[\s-]?dead\b/i,
    /\brandom[\s-]?encounter\b|\blife[\s-]?ambushed\b/i,
    /\bsummon\b|\bcalled[\s-]?upon\b/i,
    /\bside[\s-]?quest\b|\bdetour\b/i,
    /\bsave[\s-]?point\b|\bcheckpoint\b/i,
    /\bhp[\s-]?critical\b|\blow[\s-]?health\b/i,
    /\bendgame\b|\bfinal[\s-]?boss\b/i,
    /\bnew[\s-]?game[\s-]?plus\b|\bng\+\b/i,
  ]
  const hits = patterns.filter(p => p.test(journalText)).length
  if (hits >= 3) {
    if (awardBadge('jrpg_session')) return 'jrpg_session'
  }
  return null
}

/** Award overworld_return when user returns after 14+ day absence */
export function checkOverworldReturn(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('overworld_return')) return null
  try {
    const lastCheckIn = localStorage.getItem('lot_last_checkin_date')
    if (!lastCheckIn) return null
    const last = new Date(lastCheckIn)
    const now = new Date()
    const daysSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince >= 14) {
      if (awardBadge('overworld_return')) return 'overworld_return'
    }
  } catch { /* ignore */ }
  return null
}

/** Award jrpg_marathon when journal entry >= 600 words */
export function checkJrpgMarathon(journalText: string): BadgeType | null {
  if (hasBadge('jrpg_marathon')) return null
  const wordCount = journalText.trim().split(/\s+/).filter(w => w.length > 0).length
  if (wordCount >= 600) {
    if (awardBadge('jrpg_marathon')) return 'jrpg_marathon'
  }
  return null
}

/** Award JRPG Vault secret boss badges from journal text */
export function checkJrpgVault(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []
  if (!hasBadge('cloud_signal') && /\bfinal[\s-]?fantasy\b|\bcloud[\s-]?strife\b|\bsephiroth\b|\baerith\b|\btifa[\s-]?lockhart\b/i.test(journalText)) {
    if (awardBadge('cloud_signal')) awarded.push('cloud_signal')
  }
  if (!hasBadge('chrono_trigger_signal') && /\bchrono[\s-]?trigger\b|\bcrono\b|\bmarle\b|\blucca\b|\bmagus\b|\bfrog[\s-]?knight\b/i.test(journalText)) {
    if (awardBadge('chrono_trigger_signal')) awarded.push('chrono_trigger_signal')
  }
  if (!hasBadge('mother_signal') && /\bmother[\s-]?game\b|\bearth[\s-]?bound\b|\bness\b|\bpk[\s-]?fire\b|\bonett\b|\bgiygas\b/i.test(journalText)) {
    if (awardBadge('mother_signal')) awarded.push('mother_signal')
  }
  return awarded
}

// ── v30 THE A.I. ENGINE — Word turn detection ─────────────────────────────────

const AI_WORDS_V30: { badge: BadgeType; pattern: RegExp }[] = [
  { badge: 'neural_pattern',      pattern: /\bneural[\s-]?network\b|\bsynapse\b|\bneural[\s-]?path\b|\bbrain[\s-]?wiring\b|\bbrain[\s-]?plasticity\b|\bneuroplasticity\b/i },
  { badge: 'training_log',        pattern: /\bin[\s-]?training\b|\bpractice[\s-]?run\b|\bbuilding[\s-]?the[\s-]?habit\b|\btraining[\s-]?day\b|\btraining[\s-]?log\b/i },
  { badge: 'epoch_tracked',       pattern: /\bfull[\s-]?cycle\b|\bnew[\s-]?cycle\b|\bcycle[\s-]?ends\b|\bseason[\s-]?ends\b|\bepoch[\s-]?ends\b|\bnew[\s-]?epoch\b/i },
  { badge: 'gradient_lock',       pattern: /\bgradient\b|\bmomentum[\s-]?building\b|\bdirection[\s-]?clear\b|\bpointed[\s-]?toward\b|\bclear[\s-]?direction\b/i },
  { badge: 'inference_spark',     pattern: /\binference\b|\bdeduced\b|\bpiecing[\s-]?together\b|\bdrew[\s-]?a[\s-]?conclusion\b|\bmade[\s-]?the[\s-]?connection\b/i },
  { badge: 'attention_mode',      pattern: /\bpaying[\s-]?attention\b|\bmindful[\s-]?presence\b|\bpresent[\s-]?moment\b|\bfull[\s-]?attention\b|\battentive\b/i },
  { badge: 'embedding_signal',    pattern: /\bdeeply[\s-]?rooted\b|\banchored[\s-]?in\b|\bgrounded[\s-]?in[\s-]?the\b|\bembodied[\s-]?in\b|\bembedded[\s-]?in\b/i },
  { badge: 'fine_tuned_badge',    pattern: /\bfine[\s-]?tuned\b|\bcalibrated[\s-]?to\b|\bdialed[\s-]?in\b|\bfine[\s-]?tune\b|\badjusted[\s-]?and\b|\btuned[\s-]?to\b/i },
  { badge: 'reality_check_badge', pattern: /\breality[\s-]?check\b|\bgrounded[\s-]?check\b|\bfact[\s-]?checked\b|\bchecking[\s-]?in[\s-]?honestly\b|\bground[\s-]?truth\b/i },
  { badge: 'token_tracked',       pattern: /\bresource[\s-]?economy\b|\ballocating[\s-]?my\b|\btracking[\s-]?what[\s-]?costs\b|\benergy[\s-]?budget\b|\bspend[\s-]?wisely\b/i },
  { badge: 'prompt_found',        pattern: /\basking[\s-]?the[\s-]?right\b|\bright[\s-]?question\b|\bhow[\s-]?I[\s-]?ask\b|\bframing[\s-]?the[\s-]?question\b|\bthe[\s-]?way[\s-]?I[\s-]?ask\b/i },
  { badge: 'model_ready',         pattern: /\bsystem[\s-]?ready\b|\bloaded[\s-]?up\b|\binitialized\b|\bready[\s-]?to[\s-]?run\b|\bmodel[\s-]?is[\s-]?ready\b|\bready[\s-]?to[\s-]?go\b/i },
]

/** Run v30 A.I. Engine word turn checks on journal text. Returns newly awarded badge IDs. */
export function checkAIWordTurns(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []
  for (const { badge, pattern } of AI_WORDS_V30) {
    if (!hasBadge(badge) && pattern.test(journalText)) {
      if (awardBadge(badge)) awarded.push(badge)
    }
  }
  return awarded
}

/** Award ai_session when 3+ v30 A.I. words appear in a single journal entry */
export function checkAISession(journalText: string): BadgeType | null {
  if (hasBadge('ai_session')) return null
  const hits = AI_WORDS_V30.filter(({ pattern }) => pattern.test(journalText)).length
  if (hits >= 3) {
    if (awardBadge('ai_session')) return 'ai_session'
  }
  return null
}

/** Award context_window when checking in 03:00–03:14 AM local */
export function checkContextWindow(): BadgeType | null {
  if (typeof window === 'undefined') return null
  if (hasBadge('context_window')) return null
  const now = new Date()
  const hour = now.getHours()
  const min = now.getMinutes()
  if (hour === 3 && min <= 14) {
    if (awardBadge('context_window')) return 'context_window'
  }
  return null
}

/** Award model_marathon when journal entry >= 800 words */
export function checkModelMarathon(journalText: string): BadgeType | null {
  if (hasBadge('model_marathon')) return null
  const wordCount = journalText.trim().split(/\s+/).filter(w => w.length > 0).length
  if (wordCount >= 800) {
    if (awardBadge('model_marathon')) return 'model_marathon'
  }
  return null
}

/** Award A.I. Vault secret boss badges from journal text */
export function checkAIVault(journalText: string): BadgeType[] {
  const awarded: BadgeType[] = []
  if (!hasBadge('turing_complete') && /\bturing[\s-]?complete\b|\bturing[\s-]?machine\b|\balan[\s-]?turing\b|\balan[\s-]?m\.?[\s-]?turing\b|\bcomputational[\s-]?universality\b/i.test(journalText)) {
    if (awardBadge('turing_complete')) awarded.push('turing_complete')
  }
  if (!hasBadge('godel_found') && /\bg[oö]del\b|\bgoedel\b|\bincompleteness[\s-]?theorem\b|\bunprovable\b|\bundecidable[\s-]?proposition\b/i.test(journalText)) {
    if (awardBadge('godel_found')) awarded.push('godel_found')
  }
  if (!hasBadge('ada_found') && /\bada[\s-]?lovelace\b|\bcharles[\s-]?babbage\b|\bdifference[\s-]?engine\b|\banalytical[\s-]?engine\b|\bfirst[\s-]?programmer\b/i.test(journalText)) {
    if (awardBadge('ada_found')) awarded.push('ada_found')
  }
  return awarded
}
