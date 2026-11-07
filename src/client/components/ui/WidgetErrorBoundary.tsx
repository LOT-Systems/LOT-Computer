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

// ── Widget usage ledger ─────────────────────────────────────────────────────
// Local-only, bounded record of every widget boundary that mounted or crashed.
// Nothing leaves the device: this is the transparent "data log" a user (or the
// LOT® AI diagnostics page) can read via window.__LOT_WIDGET_USAGE__() or
// localStorage['lot_widget_usage_v1'].
type WidgetUsageEntry = {
  mounts: number
  crashes: number
  lastMountMs: number
  maxMountMs: number
  slowMounts: number // mounts over the 50ms budget
  lastSeen: number
}
const USAGE_KEY = 'lot_widget_usage_v1'
const USAGE_MAX_WIDGETS = 64
let usageLedger: Record<string, WidgetUsageEntry> | null = null
let usageFlushTimer: ReturnType<typeof setTimeout> | null = null

function loadUsage(): Record<string, WidgetUsageEntry> {
  if (usageLedger) return usageLedger
  try {
    const raw = localStorage.getItem(USAGE_KEY)
    usageLedger = raw ? JSON.parse(raw) : {}
  } catch {
    usageLedger = {}
  }
  return usageLedger!
}

function recordUsage(name: string, patch: (e: WidgetUsageEntry) => void) {
  const ledger = loadUsage()
  if (!ledger[name] && Object.keys(ledger).length >= USAGE_MAX_WIDGETS) return
  const entry = (ledger[name] ??= {
    mounts: 0, crashes: 0, lastMountMs: 0, maxMountMs: 0, slowMounts: 0, lastSeen: 0,
  })
  patch(entry)
  entry.lastSeen = Date.now()
  // Debounced flush — never write to storage on the render path.
  if (usageFlushTimer) return
  usageFlushTimer = setTimeout(() => {
    usageFlushTimer = null
    try { localStorage.setItem(USAGE_KEY, JSON.stringify(usageLedger)) } catch { /* quota / private mode */ }
  }, 2000)
}

export function getWidgetUsage(): Record<string, WidgetUsageEntry> {
  return JSON.parse(JSON.stringify(loadUsage()))
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_USAGE__ = getWidgetUsage
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
    if (elapsed > 50) {
      console.warn(`[Perf] ${name} took ${elapsed}ms to mount`)
    }
    recordUsage(name, (e) => {
      e.mounts += 1
      e.lastMountMs = elapsed
      e.maxMountMs = Math.max(e.maxMountMs, elapsed)
      if (elapsed > 50) e.slowMounts += 1
    })
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    recordUsage(this.props.name || 'Widget', (e) => { e.crashes += 1 })
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
              onClick={() => this.setState({ hasError: false, error: null })}
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
