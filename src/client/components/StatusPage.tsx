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

// Animated pulse dot for live-ok status
const PulseDot = ({ color }: { color: string }) => (
  <span className="relative inline-flex items-center justify-center" style={{ width: 10, height: 10 }}>
    <span
      className="absolute inline-flex rounded-full opacity-75"
      style={{
        width: 10,
        height: 10,
        backgroundColor: color,
        animation: 'lot-ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
      }}
    />
    <span
      className="relative inline-flex rounded-full"
      style={{ width: 6, height: 6, backgroundColor: color }}
    />
  </span>
)

// Static dot for non-ok states
const StaticDot = ({ color }: { color: string }) => (
  <span
    className="inline-flex rounded-full flex-shrink-0"
    style={{ width: 6, height: 6, backgroundColor: color }}
  />
)

const CHECK_COLORS = {
  ok: 'var(--lot-green, #22c55e)',
  error: 'var(--lot-red, #ef4444)',
  unknown: 'var(--lot-muted, rgba(128,128,128,0.5))',
}

const OVERALL_META: Record<string, { label: string; color: string; pulse: boolean }> = {
  ok:       { label: 'All systems operational',   color: CHECK_COLORS.ok,      pulse: true  },
  degraded: { label: 'Partial system degradation', color: 'var(--lot-amber, #f59e0b)', pulse: false },
  error:    { label: 'System issues detected',     color: CHECK_COLORS.error,  pulse: false },
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
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchStatus() }, [fetchStatus])

  React.useEffect(() => {
    const interval = setInterval(fetchStatus, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        timeZoneName: 'short',
      })
    } catch {
      return dateString
    }
  }

  const content = (
    <div className="flex flex-col gap-y-16">
      {/* Keyframe injection */}
      <style>{`
        @keyframes lot-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      <div>
        <div className="mb-16">LOT Systems Status</div>
        <GhostButton href="/">← Home</GhostButton>
      </div>

      {loading && !status && (
        <div className="text-acc/40">Loading...</div>
      )}

      {error && !status && (
        <div className="mb-32">
          <div className="mb-16 text-acc/80">Error: {error}</div>
          <Button kind="secondary" size="small" onClick={fetchStatus}>Retry</Button>
        </div>
      )}

      {status && (() => {
        const meta = OVERALL_META[status.overall] ?? OVERALL_META.error
        return (
          <>
            {/* Overall status banner */}
            <div className="mb-16">
              <Block label="Status:" labelClassName="!pl-0">
                <div className="flex items-center gap-x-10">
                  {meta.pulse
                    ? <PulseDot color={meta.color} />
                    : <StaticDot color={meta.color} />}
                  <span style={{ color: meta.color }}>{meta.label}</span>
                </div>
              </Block>
              <Block label="Version:" labelClassName="!pl-0">v{status.version}</Block>
              <Block label="Environment:" labelClassName="!pl-0">{status.environment}</Block>
              <Block label="Last updated:" labelClassName="!pl-0" containsSmallButton>
                <div className="flex items-center gap-x-16">
                  <span>
                    {formatDate(lastUpdate.toISOString())}
                    {status.cached && status.cacheAge != null && (
                      <span className="text-acc/40"> (cached {status.cacheAge}s ago)</span>
                    )}
                  </span>
                  <Button kind="secondary" size="small" onClick={fetchStatus} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>
              </Block>
            </div>

            {/* Component checks */}
            <div className="mb-16">
              <div className="mb-16">System components:</div>
              {status.checks.map((check, index) => (
                <Block
                  key={index}
                  label={check.name + ':'}
                  labelClassName="!pl-0"
                  className="mb-8"
                >
                  <div className="flex items-center gap-x-10">
                    {check.status === 'ok'
                      ? <PulseDot color={CHECK_COLORS.ok} />
                      : <StaticDot color={check.status === 'error' ? CHECK_COLORS.error : CHECK_COLORS.unknown} />}
                    <span
                      className={cn(
                        check.status === 'ok'    && 'text-acc',
                        check.status === 'error' && 'text-acc/60',
                        check.status === 'unknown' && 'text-acc/40'
                      )}
                    >
                      {check.status === 'ok' ? 'Operational' : check.status === 'error' ? 'Error' : 'Unknown'}
                    </span>
                    {check.duration !== undefined && (
                      <span className="text-acc/30">{check.duration}ms</span>
                    )}
                  </div>
                  {check.message && (
                    <div className="text-acc/60 mt-4 text-sm">{check.message}</div>
                  )}
                </Block>
              ))}
            </div>

            {/* Memory status (authenticated) */}
            {memoryStatus && (
              <div className="mb-16 pt-32 border-t border-acc/20">
                <div className="mb-16">Memory Prompts (Your Status):</div>
                <Block label="Current time:" labelClassName="!pl-0">{memoryStatus.currentTime}</Block>
                <Block label="Time window:" labelClassName="!pl-0">
                  <span className={cn(memoryStatus.timeWindow === 'OUTSIDE TIME WINDOWS' && 'text-acc/60')}>
                    {memoryStatus.timeWindow}
                  </span>
                </Block>
                <Block label="Day number:" labelClassName="!pl-0">Day {memoryStatus.dayNumber}</Block>
                <Block label="Today's quota:" labelClassName="!pl-0">
                  {memoryStatus.promptsShownToday} / {memoryStatus.promptQuotaToday} prompts
                  {memoryStatus.remainingToday > 0 && (
                    <span className="text-acc/60"> ({memoryStatus.remainingToday} remaining)</span>
                  )}
                </Block>
                <Block label="Next prompt:" labelClassName="!pl-0">
                  <div className="flex items-center gap-x-10">
                    {memoryStatus.nextPromptAvailable
                      ? <PulseDot color={CHECK_COLORS.ok} />
                      : <StaticDot color={CHECK_COLORS.error} />}
                    <span className={cn(memoryStatus.nextPromptAvailable ? 'text-acc' : 'text-acc/60')}>
                      {memoryStatus.nextPromptAvailable ? 'Available now' : 'Not available'}
                    </span>
                  </div>
                  {memoryStatus.blockReason && (
                    <div className="text-acc/60 mt-4">Reason: {memoryStatus.blockReason}</div>
                  )}
                </Block>
              </div>
            )}

            {/* Footer */}
            <div className="text-acc/40 pt-32 border-t border-acc/20">
              <div>Build: {formatDate(status.buildDate)}</div>
              <div className="mt-8">Status checks cached for 2 minutes</div>
            </div>
          </>
        )
      })()}
    </div>
  )

  return noWrapper ? content : <Page>{content}</Page>
}
