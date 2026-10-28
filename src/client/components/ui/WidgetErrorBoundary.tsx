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

// Widget usage log — per-widget mount / error counters persisted on device.
// Local-only: nothing leaves the browser until a caller reads getWidgetUsage().
const USAGE_KEY = 'lot-widget-usage-v1'

export interface WidgetUsageEntry {
  mounts: number
  errors: number
  lastMountAt: number
  lastMountMs: number
  maxMountMs: number
}

function readUsage(): Record<string, WidgetUsageEntry> {
  try {
    return JSON.parse(localStorage.getItem(USAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function recordUsage(name: string, patch: (e: WidgetUsageEntry) => void) {
  try {
    const all = readUsage()
    const entry = all[name] || { mounts: 0, errors: 0, lastMountAt: 0, lastMountMs: 0, maxMountMs: 0 }
    patch(entry)
    all[name] = entry
    localStorage.setItem(USAGE_KEY, JSON.stringify(all))
  } catch {}
}

export function getWidgetUsage(): Record<string, WidgetUsageEntry> {
  return readUsage()
}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_USAGE__ = getWidgetUsage
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
    if (elapsed > 50) {
      console.warn(`[Perf] ${name} took ${elapsed}ms to mount`)
    }
    recordUsage(name, (e) => {
      e.mounts += 1
      e.lastMountAt = Date.now()
      e.lastMountMs = elapsed
      e.maxMountMs = Math.max(e.maxMountMs, elapsed)
    })
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      `[WidgetErrorBoundary] ${this.props.name || 'Widget'} crashed:`,
      error,
      info.componentStack
    )
    recordUsage(this.props.name || 'Widget', (e) => {
      e.errors += 1
    })
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
