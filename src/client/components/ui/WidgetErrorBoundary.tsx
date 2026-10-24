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

// Widget usage log: per-widget mounts, crashes and slowest mount, kept in
// localStorage so it survives reloads. Read via getWidgetUsage() or
// window.__LOT_WIDGET_USAGE__.
export interface WidgetUsageEntry {
  mounts: number
  crashes: number
  slowestMountMs: number
  lastSeen: number
}

const USAGE_KEY = 'lot-widget-usage'
let usageCache: Record<string, WidgetUsageEntry> | null = null
let usageTimer: ReturnType<typeof setTimeout> | undefined

function loadUsage(): Record<string, WidgetUsageEntry> {
  if (usageCache) return usageCache
  try {
    usageCache = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}') || {}
  } catch {
    usageCache = {}
  }
  return usageCache!
}

function bumpUsage(name: string, patch: (e: WidgetUsageEntry) => void) {
  if (typeof window === 'undefined') return
  const all = loadUsage()
  const entry = all[name] || { mounts: 0, crashes: 0, slowestMountMs: 0, lastSeen: 0 }
  patch(entry)
  entry.lastSeen = Date.now()
  all[name] = entry
  ;(window as any).__LOT_WIDGET_USAGE__ = all
  // Coalesce writes: many widgets mount in the same tick.
  if (usageTimer) return
  usageTimer = setTimeout(() => {
    usageTimer = undefined
    try {
      localStorage.setItem(USAGE_KEY, JSON.stringify(usageCache))
    } catch {}
  }, 1000)
}

export function getWidgetUsage(): Record<string, WidgetUsageEntry> {
  return { ...loadUsage() }
}

export function getWidgetTimings(): Record<string, number> {
  return { ...widgetTimings }
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
    bumpUsage(name, (e) => {
      e.mounts += 1
      e.slowestMountMs = Math.max(e.slowestMountMs, elapsed)
    })
    if (elapsed > 50) {
      console.warn(`[Perf] ${name} took ${elapsed}ms to mount`)
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    bumpUsage(this.props.name || 'Widget', (e) => {
      e.crashes += 1
    })
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
