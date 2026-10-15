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

function useQuantumNumber(record = true) {
  const [number, setNumber] = React.useState(() => quantumRandom(0, 99))
  const [remaining, setRemaining] = React.useState(() => pickCountdown())
  const remainingRef = React.useRef(remaining)

  React.useEffect(() => {
    // Side effects live outside the state updater: updaters must be pure
    // (StrictMode double-invokes them, which duplicated recordSignal).
    const iv = setInterval(() => {
      if (document.hidden) return
      if (remainingRef.current <= 1) {
        const next = quantumRandom(0, 99)
        const nextCountdown = pickCountdown()
        remainingRef.current = nextCountdown
        setNumber(next)
        setRemaining(nextCountdown)
        if (record) recordSignal('calculator', 'quantum_random', { value: next, interval: nextCountdown })
      } else {
        remainingRef.current -= 1
        setRemaining(remainingRef.current)
      }
    }, 1000)

    return () => clearInterval(iv)
  }, [record])

  return { number, remaining }
}

export function QuantumRandomWidget() {
  const a = useQuantumNumber()
  const b = useQuantumNumber()
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
