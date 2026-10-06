/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block } from './Block'

const widgetTimings: Record<string, number> = {}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_PERF__ = widgetTimings
}

export function getWidgetTimings(): Record<string, number> {
  return { ...widgetTimings }
}

/**
 * Widget usage ledger — per-widget mount / crash / retry counters persisted
 * locally (lot.widgetLedger.v1). Writes are coalesced into one deferred save.
 * Read via getWidgetLedger() or window.__LOT_WIDGET_LEDGER__().
 */
export interface WidgetLedgerEntry {
  mounts: number
  crashes: number
  retries: number
  lastMountMs: number
  maxMountMs: number
  lastSeen: number
}

const LEDGER_KEY = 'lot.widgetLedger.v1'
let ledgerCache: Record<string, WidgetLedgerEntry> | null = null
let ledgerSaveTimer: ReturnType<typeof setTimeout> | null = null

export function getWidgetLedger(): Record<string, WidgetLedgerEntry> {
  if (ledgerCache) return { ...ledgerCache }
  try {
    ledgerCache = JSON.parse(localStorage.getItem(LEDGER_KEY) || '{}')
  } catch {
    ledgerCache = {}
  }
  return { ...ledgerCache! }
}

function recordWidgetEvent(name: string, kind: 'mount' | 'crash' | 'retry', ms = 0) {
  if (typeof window === 'undefined') return
  getWidgetLedger()
  const e = (ledgerCache![name] ||= {
    mounts: 0, crashes: 0, retries: 0, lastMountMs: 0, maxMountMs: 0, lastSeen: 0,
  })
  if (kind === 'mount') {
    e.mounts++
    e.lastMountMs = ms
    e.maxMountMs = Math.max(e.maxMountMs, ms)
  } else if (kind === 'crash') e.crashes++
  else e.retries++
  e.lastSeen = Date.now()
  if (ledgerSaveTimer) return
  ledgerSaveTimer = setTimeout(() => {
    ledgerSaveTimer = null
    try { localStorage.setItem(LEDGER_KEY, JSON.stringify(ledgerCache)) } catch {}
  }, 2000)
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_LEDGER__ = getWidgetLedger
}

/**
 * WidgetErrorBoundary - Isolates widget crashes so they don't take down the whole app.
 * When a widget throws during render, this boundary catches it and shows a minimal
 * fallback instead of propagating the error up to the AppErrorBoundary.
 */
export class WidgetErrorBoundary extends React.Component<
  { children: React.ReactNode; name?: string },
  { hasError: boolean; error: Error | null }
> {
  private mountStart: number

  constructor(props: { children: React.ReactNode; name?: string }) {
    super(props)
    this.state = { hasError: false, error: null }
    this.mountStart = performance.now()
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidMount() {
    const elapsed = Math.round((performance.now() - this.mountStart) * 100) / 100
    const name = this.props.name || 'Widget'
    widgetTimings[name] = elapsed
    recordWidgetEvent(name, 'mount', elapsed)
    if (elapsed > 50) {
      console.warn(`[Perf] ${name} took ${elapsed}ms to mount`)
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    recordWidgetEvent(this.props.name || 'Widget', 'crash')
    console.error(
      `[WidgetErrorBoundary] ${this.props.name || 'Widget'} crashed:`,
      error,
      info.componentStack
    )
  }

  render() {
    if (this.state.hasError) {
      return (
        <Block label={`${this.props.name || 'Widget'}:`} blockView>
          <div className="opacity-30">
            Failed to load.{' '}
            <button
              onClick={() => {
                recordWidgetEvent(this.props.name || 'Widget', 'retry')
                this.setState({ hasError: false, error: null })
              }}
              className="underline cursor-pointer"
              style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', padding: 0 }}
            >
              Retry
            </button>
          </div>
        </Block>
      )
    }
    return this.props.children
  }
}
