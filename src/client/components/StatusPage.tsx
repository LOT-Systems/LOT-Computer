/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block, Button, GhostButton, Page } from '#client/components/ui'
import { cn } from '#client/utils'
import { useDocumentTitle } from '#client/utils/hooks'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { DATE_TIME_FORMAT } from '#shared/constants'

dayjs.extend(relativeTime)

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

const REFRESH_INTERVAL_MS = 2 * 60 * 1000

function useRelativeTime(date: Date | null) {
  const [, tick] = React.useState(0)
  React.useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 15000)
    return () => clearInterval(id)
  }, [])
  if (!date) return ''
  return dayjs(date).fromNow()
}

function useRefreshCountdown(lastUpdate: Date, onRefresh: () => void) {
  const [remaining, setRemaining] = React.useState(REFRESH_INTERVAL_MS)

  React.useEffect(() => {
    setRemaining(REFRESH_INTERVAL_MS)
    const id = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1000
        if (next <= 0) {
          onRefresh()
          return REFRESH_INTERVAL_MS
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [lastUpdate, onRefresh])

  const progress = (REFRESH_INTERVAL_MS - remaining) / REFRESH_INTERVAL_MS
  const secs = Math.ceil(remaining / 1000)
  return { progress, secs }
}

const OVERALL_LABELS: Record<string, string> = {
  ok: 'All systems operational',
  degraded: 'Degraded performance',
  error: 'System issues detected',
}

function StatusDot({ status }: { status: 'ok' | 'degraded' | 'error' | 'loading' }) {
  const colorMap: Record<string, string> = {
    ok: '#22c55e',
    degraded: '#f59e0b',
    error: '#ef4444',
    loading: 'rgb(var(--acc-color-default) / 0.2)',
  }
  const color = colorMap[status] ?? colorMap.loading
  const animate = status === 'ok' || status === 'error' || status === 'degraded'

  return (
    <span className="relative inline-flex items-center justify-center w-[10px] h-[10px]">
      {animate && (
        <span
          className="absolute inline-flex rounded-full opacity-75"
          style={{
            width: 10,
            height: 10,
            backgroundColor: color,
            animation: 'lot-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
      )}
      <span
        className="relative inline-flex rounded-full"
        style={{ width: 8, height: 8, backgroundColor: color }}
      />
      <style>{`
        @keyframes lot-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </span>
  )
}

function CheckRow({ check }: { check: SystemCheck }) {
  const isOk = check.status === 'ok'
  const isErr = check.status === 'error'

  return (
    <div
      className={cn(
        'flex items-start gap-x-16 py-8',
        'border-b border-acc/[0.07] last:border-b-0'
      )}
    >
      <div className="flex items-center gap-x-8 w-[180px] phone:w-[200px] flex-shrink-0">
        <StatusDot status={isOk ? 'ok' : isErr ? 'error' : 'loading'} />
        <span className={cn('text-[13px]', isErr && 'text-acc/60')}>
          {check.name}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-x-8">
          <span
            className={cn(
              'text-[13px] font-[500]',
              isOk && 'text-acc',
              isErr && 'text-acc/50',
              !isOk && !isErr && 'text-acc/40'
            )}
          >
            {isOk ? 'Operational' : isErr ? 'Error' : 'Unknown'}
          </span>
          {check.duration !== undefined && (
            <span className="text-acc/30 text-[12px]">{check.duration}ms</span>
          )}
        </div>
        {check.message && (
          <div className="text-acc/50 text-[12px] mt-2 truncate">{check.message}</div>
        )}
      </div>
    </div>
  )
}

function RefreshBar({
  progress,
  secsUntilRefresh,
  loading,
  onRefresh,
}: {
  progress: number
  secsUntilRefresh: number
  loading: boolean
  onRefresh: () => void
}) {
  return (
    <div className="flex flex-col gap-y-8">
      <div
        className="h-[2px] w-full rounded-full overflow-hidden"
        style={{ background: 'rgb(var(--acc-color-default) / 0.08)' }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-linear"
          style={{
            width: `${progress * 100}%`,
            background: loading
              ? 'rgb(var(--acc-color-default) / 0.3)'
              : 'rgb(var(--acc-color-default) / 0.18)',
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-acc/30">
          {loading ? 'Refreshing…' : `Refreshes in ${secsUntilRefresh}s`}
        </span>
        <button
          className="text-[12px] text-acc/40 hover:text-acc/70 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh now
        </button>
      </div>
    </div>
  )
}

export const StatusPage = ({ noWrapper = false }: StatusPageProps) => {
  const [status, setStatus] = React.useState<StatusData | null>(null)
  const [memoryStatus, setMemoryStatus] = React.useState<MemoryStatus | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date())
  const [firstLoad, setFirstLoad] = React.useState(true)

  useDocumentTitle('Systems Status')

  const fetchStatus = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/public/status')
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const data = await response.json()
      setStatus(data)

      try {
        const localTime = btoa(dayjs().format(DATE_TIME_FORMAT))
        const memResponse = await fetch(`/api/memory-status?d=${localTime}`)
        if (memResponse.ok) setMemoryStatus(await memResponse.json())
      } catch {
        setMemoryStatus(null)
      }

      setLastUpdate(new Date())
      setFirstLoad(false)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch status')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchStatus() }, [fetchStatus])

  const { progress, secs } = useRefreshCountdown(lastUpdate, fetchStatus)
  const relativeLastUpdate = useRelativeTime(lastUpdate)

  const overallStatus: 'ok' | 'degraded' | 'error' | 'loading' =
    firstLoad ? 'loading' : (status?.overall ?? 'loading') as any

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

  const content = (
    <div className="flex flex-col gap-y-32">

      {/* Header */}
      <div className="flex items-start justify-between gap-x-16">
        <div>
          <div className="text-acc/40 text-[12px] tracking-widest uppercase mb-8">
            LOT Systems
          </div>
          <div className="text-[22px] leading-1.25 font-[500]">
            Status
          </div>
        </div>
        <GhostButton href="/">← Home</GhostButton>
      </div>

      {/* Overall Status Banner */}
      <div
        className={cn(
          'flex items-center gap-x-16 px-16 py-16 rounded-[4px]',
          'border border-acc/[0.12]',
          'transition-opacity duration-500',
          firstLoad && 'opacity-40'
        )}
      >
        <StatusDot status={overallStatus} />
        <div className="flex-1">
          <div className={cn(
            'font-[500]',
            overallStatus === 'error' && 'text-acc/70',
            overallStatus === 'loading' && 'text-acc/40',
          )}>
            {firstLoad
              ? 'Checking systems…'
              : OVERALL_LABELS[status?.overall ?? 'ok']}
          </div>
          {!firstLoad && (
            <div className="text-[12px] text-acc/30 mt-2">
              Updated {relativeLastUpdate}
              {status?.cached && status.cacheAge ? ` · cached ${status.cacheAge}s ago` : ''}
            </div>
          )}
        </div>
        {!firstLoad && status && (
          <div className="text-[12px] text-acc/30 text-right flex-shrink-0">
            <div>v{status.version}</div>
            <div className="mt-2 text-acc/20">{status.environment}</div>
          </div>
        )}
      </div>

      {/* Error state */}
      {error && !status && (
        <div className="border border-acc/[0.12] rounded-[4px] px-16 py-16">
          <div className="text-acc/60 text-[13px] mb-12">{error}</div>
          <Button kind="secondary" size="small" onClick={fetchStatus}>
            Retry
          </Button>
        </div>
      )}

      {/* Component Checks */}
      {status && (
        <div>
          <div className="text-[11px] text-acc/30 tracking-widest uppercase mb-16">
            Components
          </div>
          <div className="border border-acc/[0.12] rounded-[4px] px-16 divide-y-0">
            {status.checks.map((check, i) => (
              <CheckRow key={i} check={check} />
            ))}
          </div>
        </div>
      )}

      {/* Refresh bar */}
      <RefreshBar
        progress={progress}
        secsUntilRefresh={secs}
        loading={loading}
        onRefresh={fetchStatus}
      />

      {/* Memory Prompt Status */}
      {memoryStatus && (
        <div>
          <div className="text-[11px] text-acc/30 tracking-widest uppercase mb-16">
            Memory Engine · Day {memoryStatus.dayNumber}
          </div>
          <div className="border border-acc/[0.12] rounded-[4px] divide-y divide-acc/[0.07]">
            <div className="flex items-center gap-x-16 px-16 py-8">
              <span className="text-[13px] text-acc/40 w-[160px] flex-shrink-0">Time window</span>
              <span className={cn(
                'text-[13px]',
                memoryStatus.timeWindow === 'OUTSIDE TIME WINDOWS' ? 'text-acc/40' : 'text-acc'
              )}>
                {memoryStatus.timeWindow}
              </span>
            </div>
            <div className="flex items-center gap-x-16 px-16 py-8">
              <span className="text-[13px] text-acc/40 w-[160px] flex-shrink-0">Quota today</span>
              <span className="text-[13px]">
                {memoryStatus.promptsShownToday}
                <span className="text-acc/40">/{memoryStatus.promptQuotaToday}</span>
                {memoryStatus.remainingToday > 0 && (
                  <span className="text-acc/40"> · {memoryStatus.remainingToday} remaining</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-x-16 px-16 py-8">
              <span className="text-[13px] text-acc/40 w-[160px] flex-shrink-0">Next prompt</span>
              <span className="flex items-center gap-x-8">
                <StatusDot status={memoryStatus.nextPromptAvailable ? 'ok' : 'error'} />
                <span className={cn(
                  'text-[13px]',
                  memoryStatus.nextPromptAvailable ? 'text-acc' : 'text-acc/50'
                )}>
                  {memoryStatus.nextPromptAvailable ? 'Available now' : 'Not available'}
                </span>
              </span>
            </div>
            {memoryStatus.blockReason && (
              <div className="flex items-start gap-x-16 px-16 py-8">
                <span className="text-[13px] text-acc/40 w-[160px] flex-shrink-0">Block reason</span>
                <span className="text-[13px] text-acc/50">{memoryStatus.blockReason}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      {status && (
        <div className="text-[12px] text-acc/25 pt-16 border-t border-acc/[0.07]">
          <div>Build: {formatDate(status.buildDate)}</div>
          <div className="mt-4">Cache TTL: 2 minutes</div>
        </div>
      )}

    </div>
  )

  return noWrapper ? content : <Page>{content}</Page>
}
