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

const REFRESH_INTERVAL = 2 * 60 * 1000

const StatusDot: React.FC<{ status: 'ok' | 'degraded' | 'error' | 'unknown' }> = ({ status }) => {
  const label =
    status === 'ok' ? 'Operational' :
    status === 'degraded' ? 'Degraded' :
    status === 'error' ? 'Error' :
    'Unknown'

  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        'inline-block w-8 h-8 rounded-full flex-shrink-0 mt-4',
        status === 'ok' && 'bg-green',
        status === 'degraded' && 'bg-yellow',
        status === 'error' && 'bg-red',
        status === 'unknown' && 'bg-acc/30'
      )}
    />
  )
}

const CheckRow: React.FC<{ check: SystemCheck }> = ({ check }) => (
  <Block
    label={check.name + ':'}
    labelClassName="!pl-0"
    className="mb-8"
  >
    <div className="flex items-center gap-x-8">
      <StatusDot status={check.status === 'error' ? 'error' : check.status === 'ok' ? 'ok' : 'unknown'} />
      <span
        className={cn(
          check.status === 'ok' && 'text-acc',
          check.status === 'error' && 'text-red',
          check.status === 'unknown' && 'text-acc/50'
        )}
      >
        {check.status === 'ok' ? 'Operational' :
         check.status === 'error' ? 'Error' :
         'Unknown'}
      </span>
      {check.duration !== undefined && (
        <span className="text-acc/40 text-sm">({check.duration}ms)</span>
      )}
    </div>
    {check.message && (
      <div className="text-acc/60 mt-4 text-sm">{check.message}</div>
    )}
  </Block>
)

const SkeletonRow: React.FC = () => (
  <div className="flex mb-8 animate-pulse">
    <div className="w-[150px] phone:w-[170px] mr-12 phone:mr-24 flex-shrink-0">
      <div className="h-16 bg-acc/10 rounded w-24" />
    </div>
    <div className="flex-1">
      <div className="h-16 bg-acc/10 rounded w-32" />
    </div>
  </div>
)

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch status'
      setError(message)
      console.error('Status fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  React.useEffect(() => {
    const interval = setInterval(fetchStatus, REFRESH_INTERVAL)
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

  const overallLabel =
    status?.overall === 'ok' ? 'All systems operational' :
    status?.overall === 'degraded' ? 'Degraded performance' :
    status?.overall === 'error' ? 'System issues detected' :
    null

  const content = (
    <div className="flex flex-col gap-y-16">
      <div>
        <div className="mb-16">LOT Systems Status</div>
        <GhostButton href="/">← Home</GhostButton>
      </div>

      {loading && !status && (
        <div aria-busy="true" aria-label="Loading system status">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      )}

      {error && !status && (
        <div className="mb-32" role="alert">
          <div className="mb-16 text-red/80">Error: {error}</div>
          <Button kind="secondary" size="small" onClick={fetchStatus}>
            Retry
          </Button>
        </div>
      )}

      {status && (
        <div aria-live="polite" aria-atomic="true">
          <div className="mb-16">
            <Block label="Status:" labelClassName="!pl-0">
              <div className="flex items-center gap-x-8">
                <StatusDot status={status.overall} />
                <span
                  className={cn(
                    status.overall === 'ok' && 'text-green',
                    status.overall === 'degraded' && 'text-yellow-darker',
                    status.overall === 'error' && 'text-red'
                  )}
                >
                  {overallLabel}
                </span>
              </div>
            </Block>
            <Block label="Version:" labelClassName="!pl-0">v{status.version}</Block>
            <Block label="Environment:" labelClassName="!pl-0">{status.environment}</Block>
            <Block label="Last updated:" labelClassName="!pl-0" containsSmallButton>
              <div className="flex items-center gap-x-16">
                <span>
                  {formatDate(lastUpdate.toISOString())}
                  {status.cached && status.cacheAge && (
                    <span className="text-acc/40">
                      {' '}(cached {status.cacheAge}s ago)
                    </span>
                  )}
                </span>
                <Button
                  kind="secondary"
                  size="small"
                  onClick={fetchStatus}
                  disabled={loading}
                >
                  {loading ? 'Refreshing…' : 'Refresh'}
                </Button>
              </div>
            </Block>
          </div>

          <div className="mb-16">
            <div className="mb-16">System components:</div>
            {status.checks.map((check, index) => (
              <CheckRow key={index} check={check} />
            ))}
          </div>

          {memoryStatus && (
            <div className="mb-16 pt-32 border-t border-acc/20">
              <div className="mb-16">Memory Prompts (Your Status):</div>
              <Block label="Current time:" labelClassName="!pl-0">
                {memoryStatus.currentTime}
              </Block>
              <Block label="Time window:" labelClassName="!pl-0">
                <span className={cn(
                  memoryStatus.timeWindow === 'OUTSIDE TIME WINDOWS' && 'text-acc/60'
                )}>
                  {memoryStatus.timeWindow}
                </span>
              </Block>
              <Block label="Day number:" labelClassName="!pl-0">
                Day {memoryStatus.dayNumber}
              </Block>
              <Block label="Today's quota:" labelClassName="!pl-0">
                {memoryStatus.promptsShownToday} / {memoryStatus.promptQuotaToday} prompts
                {memoryStatus.remainingToday > 0 && (
                  <span className="text-acc/60"> ({memoryStatus.remainingToday} remaining)</span>
                )}
              </Block>
              <Block label="Next prompt:" labelClassName="!pl-0">
                <div className="flex items-center gap-x-8">
                  <StatusDot status={memoryStatus.nextPromptAvailable ? 'ok' : 'error'} />
                  <span className={cn(
                    memoryStatus.nextPromptAvailable ? 'text-green' : 'text-acc/60'
                  )}>
                    {memoryStatus.nextPromptAvailable ? 'Available now' : 'Not available'}
                  </span>
                </div>
                {memoryStatus.blockReason && (
                  <div className="text-acc/60 mt-4">Reason: {memoryStatus.blockReason}</div>
                )}
              </Block>
            </div>
          )}

          <div className="text-acc/40 pt-32 border-t border-acc/20">
            <div>Build: {formatDate(status.buildDate)}</div>
            <div className="mt-8">Status checks cached for 2 minutes.</div>
          </div>
        </div>
      )}
    </div>
  )

  return noWrapper ? content : <Page>{content}</Page>
}
