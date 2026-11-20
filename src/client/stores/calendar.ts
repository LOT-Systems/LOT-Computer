/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Calendar alert state — the on-screen notification queue and the per-device
 * "already shown" ledger. Server dedup (one log per entryId+level) is the
 * authority for the Log; this ledger only stops the same overlay popping
 * twice on one device (reloads, two tabs).
 *
 * The queue deliberately does NOT use a nanostores atom. nanostores 0.9 keeps
 * one module-global listener queue; if any listener anywhere in the app throws
 * during notify, that queue is never cleared and every later notification is
 * silently dropped. Alerts must keep working even when another widget has
 * crashed, so the queue has its own isolated emitter.
 */

import * as React from 'react'
import { persistentAtom } from '@nanostores/persistent'
import type { CalAlertLevel, CalEntry } from '#shared/utils/calendar'

export type CalOverlayAlert = {
  key: string
  level: CalAlertLevel
  entry: CalEntry
  firedAt: number
  /** true when the Log write has not been confirmed yet (offline) */
  pending: boolean
}

let queue: CalOverlayAlert[] = []
const subscribers = new Set<() => void>()

function setQueue(next: CalOverlayAlert[]) {
  queue = next
  subscribers.forEach(fn => {
    try { fn() } catch (err) { console.error('[calendar] alert subscriber failed', err) }
  })
}

export function getCalAlerts(): CalOverlayAlert[] {
  return queue
}

function subscribeCalAlerts(fn: () => void): () => void {
  subscribers.add(fn)
  return () => { subscribers.delete(fn) }
}

export function useCalAlerts(): CalOverlayAlert[] {
  return React.useSyncExternalStore(subscribeCalAlerts, getCalAlerts, getCalAlerts)
}

/** Device (OS) notifications — opt-in per device. */
export const isCalDeviceAlertsOn = persistentAtom<boolean>('lot_cal_device_alerts', false, {
  encode: (v) => String(v),
  decode: (v) => v === 'true',
})

const SHOWN_KEY = 'lot_cal_shown_v1'
const SHOWN_TTL = 3 * 24 * 60 * 60 * 1000

function readShown(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SHOWN_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function wasShown(key: string): boolean {
  return key in readShown()
}

export function markShown(key: string): void {
  try {
    const now = Date.now()
    const shown = readShown()
    shown[key] = now
    for (const k of Object.keys(shown)) if (now - shown[k] > SHOWN_TTL) delete shown[k]
    localStorage.setItem(SHOWN_KEY, JSON.stringify(shown))
  } catch {
    /* storage unavailable — server dedup still holds */
  }
}

export function pushCalAlert(alert: CalOverlayAlert): void {
  const existing = queue.find(a => a.key === alert.key)
  if (existing) {
    if (existing.pending !== alert.pending) {
      setQueue(queue.map(a => (a.key === alert.key ? { ...a, pending: alert.pending } : a)))
    }
    return
  }
  setQueue([...queue, alert])
}

export function dismissCalAlert(key: string): void {
  if (queue.some(a => a.key === key)) setQueue(queue.filter(a => a.key !== key))
}

/** Drop overlays for an entry that has been cleared/scrubbed. */
export function dismissCalAlertsForEntry(entryId: string): void {
  if (queue.some(a => a.entry.id === entryId)) setQueue(queue.filter(a => a.entry.id !== entryId))
}
