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

// Signal throttle — the counters tick every 1–72s, but the QIE signal bus is
// capped at MAX_SIGNALS (1000). Recording every cycle (~320/hr with two
// counters) evicted real journal/mood/selfcare history within ~3h of an open
// tab and re-rendered every intentionEngine subscriber on each tick.
// One ambient sample per 15 min is enough for the calculator module.
const QR_SIGNAL_MIN_INTERVAL_MS = 15 * 60 * 1000
let lastQuantumSignalAt = 0

function useQuantumNumber(recordSignals: boolean) {
  const [number, setNumber] = React.useState(() => quantumRandom(0, 99))
  const [remaining, setRemaining] = React.useState(() => pickCountdown())
  const remainingRef = React.useRef(remaining)

  React.useEffect(() => {
    const iv = setInterval(() => {
      // Background-work-off-tab doctrine: no ticks while hidden.
      if (typeof document !== 'undefined' && document.hidden) return
      if (remainingRef.current <= 1) {
        const next = quantumRandom(0, 99)
        const nextCountdown = pickCountdown()
        remainingRef.current = nextCountdown
        setNumber(next)
        setRemaining(nextCountdown)
        const now = Date.now()
        if (recordSignals && now - lastQuantumSignalAt >= QR_SIGNAL_MIN_INTERVAL_MS) {
          lastQuantumSignalAt = now
          recordSignal('calculator', 'quantum_random', { value: next, interval: nextCountdown })
        }
      } else {
        remainingRef.current -= 1
        setRemaining(remainingRef.current)
      }
    }, 1000)

    return () => clearInterval(iv)
  }, [recordSignals])

  return { number, remaining }
}

export function QuantumRandomWidget() {
  const a = useQuantumNumber(true)
  const b = useQuantumNumber(false)
  const [showPair, setShowPair] = React.useState(() => Math.random() < 0.5)

  React.useEffect(() => {
    const iv = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
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
