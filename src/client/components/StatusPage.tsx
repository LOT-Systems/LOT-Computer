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

      // Fetch public system status
      const response = await fetch('/api/public/status')
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      setStatus(data)

      // Try to fetch memory status (authenticated)
      try {
        const localTime = btoa(dayjs().format(DATE_TIME_FORMAT))
        const memResponse = await fetch(`/api/memory-status?d=${localTime}`)
        if (memResponse.ok) {
          const memData = await memResponse.json()
          setMemoryStatus(memData)
        }
      } catch {
        // Not logged in or endpoint unavailable
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

  // Fetch status on mount
  React.useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Auto-refresh every 2 minutes
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus()
    }, 2 * 60 * 1000) // 2 minutes

    return () => clearInterval(interval)
  }, [fetchStatus])

  const getStatusIcon = (checkStatus: 'ok' | 'error' | 'unknown') => {
    switch (checkStatus) {
      case 'ok':
        return '✓'
      case 'error':
        return '✕'
      case 'unknown':
        return '?'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('en-US', {
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
    <div className="flex flex-col gap-y-16">
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
          <Button kind="secondary" size="small" onClick={fetchStatus}>
            Retry
          </Button>
        </div>
      )}

      {status && (
        <>
          <div className="mb-16">
            <Block label="Status:" labelClassName="!pl-0">
              {status.overall === 'ok' ? 'All systems operational' :
               status.overall === 'degraded' ? 'Degraded performance' :
               'System issues detected'}
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
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </Block>
          </div>

          <div className="mb-16">
            <div className="mb-16">System components:</div>
            {status.checks.map((check, index) => (
              <Block
                key={index}
                label={check.name + ':'}
                labelClassName="!pl-0"
                className="mb-8"
              >
                <div className="flex items-center gap-x-8">
                  <span>{getStatusIcon(check.status)}</span>
                  <span className={cn(
                    check.status === 'ok' && 'text-acc',
                    check.status === 'error' && 'text-acc/60'
                  )}>
                    {check.status === 'ok' ? 'Ok' :
                     check.status === 'error' ? 'Error' :
                     'Unknown'}
                  </span>
                  {check.duration !== undefined && (
                    <span className="text-acc/40">({check.duration}ms)</span>
                  )}
                </div>
                {check.message && (
                  <div className="text-acc/60 mt-4">{check.message}</div>
                )}
              </Block>
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
                  <span>{memoryStatus.nextPromptAvailable ? '✓' : '✕'}</span>
                  <span className={cn(
                    memoryStatus.nextPromptAvailable ? 'text-acc' : 'text-acc/60'
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
            <div className="mt-8">
              Status checks cached for 2 minutes
            </div>
          </div>
        </>
      )}
    </div>
  )

  return noWrapper ? content : <Page>{content}</Page>
}
