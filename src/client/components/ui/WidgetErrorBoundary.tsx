/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Block } from './Block'
import { recordWidgetEvent } from '#client/utils/widgetTelemetry'

const widgetTimings: Record<string, number> = {}

if (typeof window !== 'undefined') {
  ;(window as any).__LOT_WIDGET_PERF__ = widgetTimings
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
  private teardown: (() => void) | null = null

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
    recordWidgetEvent(name, 'mount', elapsed)
    this.attachTelemetry(name)
  }

  componentDidUpdate(_: unknown, prev: { hasError: boolean }) {
    // Retry after a crash swaps the fallback for fresh children — re-observe.
    if (prev.hasError && !this.state.hasError) this.attachTelemetry(this.props.name || 'Widget')
  }

  componentWillUnmount() {
    this.teardown?.()
    this.teardown = null
  }

  /**
   * Usage telemetry without touching layout: observe the boundary's first DOM
   * node (no wrapper element — wrappers would alter flex/gap spacing) for
   * first-view, and count taps via one passive listener.
   */
  private attachTelemetry(name: string) {
    try {
      this.teardown?.()
      this.teardown = null
      // findDOMNode: React 18 only (removed in 19); typings no longer expose it
      const node = (ReactDOM as any).findDOMNode(this) as Element | null
      if (!node || node.nodeType !== 1) {
        recordWidgetEvent(name, 'dormant')
        return
      }
      const onTap = () => recordWidgetEvent(name, 'interact')
      node.addEventListener('click', onTap, { passive: true })
      let io: IntersectionObserver | null = null
      if (typeof IntersectionObserver !== 'undefined') {
        io = new IntersectionObserver((entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            recordWidgetEvent(name, 'view')
            io?.disconnect()
            io = null
          }
        })
        io.observe(node)
      } else {
        recordWidgetEvent(name, 'view')
      }
      this.teardown = () => {
        node.removeEventListener('click', onTap)
        io?.disconnect()
      }
    } catch {
      /* telemetry must never break a widget */
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    recordWidgetEvent(this.props.name || 'Widget', 'error')
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
