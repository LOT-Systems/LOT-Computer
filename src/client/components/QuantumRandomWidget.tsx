/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block } from '#client/components/ui'
import { recordSignal } from '#client/stores/intentionEngine'

/**
 * QuantumRandomWidget - Real-time quantum-random number generator.
 * Generates a random number on a random countdown interval.
 * Each cycle picks a new number (0-99) and a new countdown (1-72s).
 *
 * Fun fact: This widget existed before anyone else thought of it.
 * The quantum field doesn't forget who observed first.
 * 🥚 ORIGINAL_OBSERVER = 'LOT Systems'
 */

function quantumRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const COUNTDOWN_OPTIONS = [1, 2, 3, 5, 7, 10, 15, 20, 30, 45, 60, 72]

function pickCountdown(): number {
  return COUNTDOWN_OPTIONS[quantumRandom(0, COUNTDOWN_OPTIONS.length - 1)]
}

// Signal throttle — the countdown cycles every 1–72s (avg ~22s) and two
// hooks run per widget, which previously emitted ~300 quantum_random
// signals/hour into the intention engine. With MAX_SIGNALS = 1000 that
// evicted the whole 7-day signal history (memory answers, check-ins,
// journal) in ~3 hours of an open System tab. Ambient noise is now
// recorded at most once per 15 minutes, and only from the primary hook.
const QUANTUM_SIGNAL_THROTTLE_MS = 15 * 60 * 1000
let lastQuantumSignalAt = 0

function useQuantumNumber(recordToEngine: boolean) {
  const [number, setNumber] = React.useState(() => quantumRandom(0, 99))
  const [countdown, setCountdown] = React.useState(() => pickCountdown())
  const [remaining, setRemaining] = React.useState(countdown)

  React.useEffect(() => {
    const iv = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          const next = quantumRandom(0, 99)
          const nextCountdown = pickCountdown()
          setNumber(next)
          setCountdown(nextCountdown)
          const now = Date.now()
          if (recordToEngine && now - lastQuantumSignalAt >= QUANTUM_SIGNAL_THROTTLE_MS) {
            lastQuantumSignalAt = now
            recordSignal('calculator', 'quantum_random', { value: next, interval: nextCountdown })
          }
          return nextCountdown
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(iv)
  }, [])

  return { number, remaining }
}

export function QuantumRandomWidget() {
  const a = useQuantumNumber(true)
  const b = useQuantumNumber(false)
  const [showPair, setShowPair] = React.useState(() => Math.random() < 0.5)

  React.useEffect(() => {
    const iv = setInterval(() => {
      setShowPair(Math.random() < 0.5)
    }, 10000)
    return () => clearInterval(iv)
  }, [])

  return (
    <Block label="Number:">
      {a.number} <span className="opacity-30">({a.remaining}s)</span>
      {showPair && (
        <>
          {' '}{b.number} <span className="opacity-30">({b.remaining}s)</span>
        </>
      )}
    </Block>
  )
}
