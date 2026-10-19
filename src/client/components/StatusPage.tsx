/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Button, GhostButton, Page } from '#client/components/ui'
import { cn } from '#client/utils'
import { useDocumentTitle } from '#client/utils/hooks'
import dayjs from 'dayjs'
import { DATE_TIME_FORMAT } from '#shared/constants'

interface SystemCheck {
  name: string
  status: 'ok' | 'error' | 'unknown'
  message?: string
  duration?: number
}

interface StatusData {
  version: string
  timestamp: string
  buildDate: string
  environment: string
  checks: SystemCheck[]
  overall: 'ok' | 'degraded' | 'error'
  cached?: boolean
  cacheAge?: number
}

interface StatusPageProps {
  noWrapper?: boolean
}

interface MemoryStatus {
  currentTime: string
  currentHour: number
  isWeekend: boolean
  timeWindow: string
  shouldShowPrompt: boolean
  promptsShownToday: number
  promptQuotaToday: number
  remainingToday: number
  dayNumber: number
  answeredInLast2Hours: boolean
  nextPromptAvailable: boolean
  blockReason: string | null
}

const StatusDot = ({ status }: { status: 'ok' | 'degraded' | 'error' | 'unknown' }) => (
  <span
    className={cn(
      'inline-block w-8 h-8 rounded-full flex-shrink-0',
      status === 'ok' && 'bg-green',
      status === 'degraded' && 'bg-yellow',
      status === 'error' && 'bg-red',
      status === 'unknown' && 'bg-acc/30'
    )}
    aria-hidden="true"
  />
)

const CheckRow = ({ check }: { check: SystemCheck }) => (
  <div className="flex items-start justify-between py-8 border-b border-acc/10 last:border-0">
    <div className="flex items-center gap-x-12 min-w-0">
      <StatusDot status={check.status === 'ok' ? 'ok' : check.status === 'error' ? 'error' : 'unknown'} />
      <div className="min-w-0">
        <div className="text-acc/80">{check.name}</div>
        {check.message && (
          <div className="text-acc/40 text-[0.85em] mt-2 break-words">{check.message}</div>
        )}
      </div>
    </div>
    <div className="flex items-center gap-x-8 flex-shrink-0 ml-16">
      <span className={cn(
        'text-[0.85em]',
        check.status === 'ok' && 'text-green',
        check.status === 'error' && 'text-red',
        check.status === 'unknown' && 'text-acc/40'
      )}>
        {check.status === 'ok' ? 'Operational' : check.status === 'error' ? 'Degraded' : 'Unknown'}
      </span>
      {check.duration !== undefined && (
        <span className="text-acc/30 text-[0.8em] tabular-nums">{check.duration}ms</span>
      )}
    </div>
  </div>
)

const OverallBanner = ({ overall }: { overall: 'ok' | 'degraded' | 'error' }) => {
  const configs = {
    ok: {
      dot: 'bg-green',
      border: 'border-green/30',
      bg: 'bg-green/5',
      text: 'text-green',
      label: 'All systems operational',
    },
    degraded: {
      dot: 'bg-yellow',
      border: 'border-yellow/30',
      bg: 'bg-yellow/5',
      text: 'text-yellow-darker',
      label: 'Degraded performance',
    },
    error: {
      dot: 'bg-red',
      border: 'border-red/30',
      bg: 'bg-red/5',
      text: 'text-red',
      label: 'System issues detected',
    },
  }
  const c = configs[overall]
  return (
    <div className={cn('flex items-center gap-x-12 px-16 py-12 rounded border', c.border, c.bg)}>
      <span className={cn('w-10 h-10 rounded-full flex-shrink-0', c.dot)} aria-hidden="true" />
      <span className={cn('font-medium', c.text)}>{c.label}</span>
    </div>
  )
}

export const StatusPage = ({ noWrapper = false }: StatusPageProps) => {
  const [status, setStatus] = React.useState<StatusData | null>(null)
  const [memoryStatus, setMemoryStatus] = React.useState<MemoryStatus | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date())

  useDocumentTitle('Systems Status')

  const fetchStatus = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/public/status')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setStatus(data)

      try {
        const localTime = btoa(dayjs().format(DATE_TIME_FORMAT))
        const memResponse = await fetch(`/api/memory-status?d=${localTime}`)
        if (memResponse.ok) {
          const memData = await memResponse.json()
          setMemoryStatus(memData)
        }
      } catch {
        setMemoryStatus(null)
      }

      setLastUpdate(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to fetch status')
      console.error('Status fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  React.useEffect(() => {
    const interval = setInterval(fetchStatus, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      })
    } catch {
      return dateString
    }
  }

  const operationalCount = status ? status.checks.filter(c => c.status === 'ok').length : 0
  const totalCount = status ? status.checks.length : 0

  const content = (
    <div className="flex flex-col gap-y-32">
      <div className="flex items-center justify-between">
        <div className="text-acc/80 text-[0.85em] tracking-widest uppercase">LOT Systems</div>
        <GhostButton href="/">← Home</GhostButton>
      </div>

      {loading && !status && (
        <div className="text-acc/30 text-[0.85em]">Checking systems…</div>
      )}

      {error && !status && (
        <div className="flex flex-col gap-y-12">
          <div className="text-red text-[0.9em]">{error}</div>
          <div>
            <Button kind="secondary" size="small" onClick={fetchStatus}>Retry</Button>
          </div>
        </div>
      )}

      {status && (
        <>
          <div>
            <OverallBanner overall={status.overall} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-16">
              <div className="text-acc/50 text-[0.8em] uppercase tracking-widest">
                Components — {operationalCount}/{totalCount} operational
              </div>
              <div className="flex items-center gap-x-12">
                {status.cached && status.cacheAge !== undefined && (
                  <span className="text-acc/30 text-[0.75em]">cached {status.cacheAge}s ago</span>
                )}
                <Button
                  kind="secondary"
                  size="small"
                  onClick={fetchStatus}
                  disabled={loading}
                >
                  {loading ? 'Refreshing…' : 'Refresh'}
                </Button>
              </div>
            </div>
            <div className="border border-acc/15 rounded overflow-hidden">
              {status.checks.map((check, index) => (
                <div key={index} className={cn(index > 0 && 'border-t border-acc/10')}>
                  <CheckRow check={check} />
                </div>
              ))}
            </div>
          </div>

          {memoryStatus && (
            <div>
              <div className="text-acc/50 text-[0.8em] uppercase tracking-widest mb-16">
                Memory Engine — Your Session
              </div>
              <div className="border border-acc/15 rounded overflow-hidden">
                {[
                  { label: 'Time window', value: memoryStatus.timeWindow, muted: memoryStatus.timeWindow === 'OUTSIDE TIME WINDOWS' },
                  { label: 'Day', value: `Day ${memoryStatus.dayNumber}` },
                  { label: "Today's quota", value: `${memoryStatus.promptsShownToday} / ${memoryStatus.promptQuotaToday}${memoryStatus.remainingToday > 0 ? ` (${memoryStatus.remainingToday} remaining)` : ''}` },
                  {
                    label: 'Next prompt',
                    value: memoryStatus.nextPromptAvailable ? 'Available' : memoryStatus.blockReason || 'Unavailable',
                    status: memoryStatus.nextPromptAvailable ? ('ok' as const) : ('error' as const),
                  },
                ].map((row, i) => (
                  <div key={i} className={cn('flex items-center justify-between px-16 py-8', i > 0 && 'border-t border-acc/10')}>
                    <span className="text-acc/50 text-[0.85em]">{row.label}</span>
                    <span className={cn(
                      'text-[0.85em]',
                      row.status === 'ok' && 'text-green',
                      row.status === 'error' && 'text-acc/40',
                      !row.status && (row.muted ? 'text-acc/40' : 'text-acc/80')
                    )}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-16 border-t border-acc/10 flex items-center justify-between text-acc/25 text-[0.75em]">
            <span>v{status.version} · {status.environment}</span>
            <span>
              Updated {formatDate(lastUpdate.toISOString())}
            </span>
          </div>
        </>
      )}
    </div>
  )

  return noWrapper ? content : <Page>{content}</Page>
}
