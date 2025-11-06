import * as React from 'react'
import { Page, Link } from '#client/components/ui'

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

export const StatusPage = () => {
  const [status, setStatus] = React.useState<StatusData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date())

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
        return '✅'
      case 'error':
        return '❌'
      case 'unknown':
        return '❓'
    }
  }

  const getOverallStatusColor = () => {
    if (!status) return 'text-gray-500'
    switch (status.overall) {
      case 'ok':
        return 'text-green-600'
      case 'degraded':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-500'
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

  return (
    <Page className="max-w-4xl mx-auto p-16 sm:p-32 md:p-64">
      <div className="mb-32">
        <h1 className="text-32 font-bold mb-16">System Status</h1>
        <div className="text-14 opacity-60 mb-16">
          <Link href="/">← Back to Home</Link>
        </div>
      </div>

      {loading && !status && (
        <div className="text-center py-64">
          <div className="text-16 opacity-60">Loading status...</div>
        </div>
      )}

      {error && !status && (
        <div className="bg-red-50 border border-red-200 rounded-8 p-16 mb-32">
          <div className="text-14 text-red-800">
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={fetchStatus}
            className="mt-16 px-16 py-8 bg-red-600 text-white rounded-8 text-14 hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {status && (
        <>
          {/* Overall Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-8 p-24 mb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div>
                <div className="text-12 opacity-60 mb-4">Overall Status</div>
                <div className={`text-24 font-bold ${getOverallStatusColor()}`}>
                  {status.overall === 'ok' ? '✅ All Systems Operational' :
                   status.overall === 'degraded' ? '⚠️ Degraded Performance' :
                   '❌ System Issues Detected'}
                </div>
              </div>
              <div>
                <div className="text-12 opacity-60 mb-4">Version</div>
                <div className="text-16 font-mono">v{status.version}</div>
                <div className="text-12 opacity-60 mt-8">
                  Environment: {status.environment}
                </div>
              </div>
            </div>
            <div className="mt-16 pt-16 border-t border-gray-300">
              <div className="text-12 opacity-60 mb-4">Last Updated</div>
              <div className="text-14">
                {formatDate(lastUpdate.toISOString())}
                {status.cached && status.cacheAge && (
                  <span className="ml-8 opacity-60">
                    (cached {status.cacheAge}s ago)
                  </span>
                )}
              </div>
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="mt-8 px-12 py-6 bg-gray-600 text-white rounded-6 text-12 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>
          </div>

          {/* System Checks */}
          <div className="mb-32">
            <h2 className="text-20 font-bold mb-16">System Components</h2>
            <div className="space-y-8">
              {status.checks.map((check, index) => (
                <div
                  key={index}
                  className={`border rounded-8 p-16 ${
                    check.status === 'ok'
                      ? 'bg-green-50 border-green-200'
                      : check.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-8">
                        <span className="text-20">{getStatusIcon(check.status)}</span>
                        <span className="font-medium">{check.name}</span>
                      </div>
                      {check.message && (
                        <div className="ml-28 mt-4 text-14 opacity-75">
                          {check.message}
                        </div>
                      )}
                    </div>
                    {check.duration !== undefined && (
                      <div className="text-12 opacity-60 ml-16">
                        {check.duration}ms
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Build Info */}
          <div className="text-12 opacity-60 text-center pt-32 border-t border-gray-200">
            <div>Build Date: {formatDate(status.buildDate)}</div>
            <div className="mt-8">
              Status checks are cached for 2 minutes to optimize performance
            </div>
          </div>
        </>
      )}
    </Page>
  )
}
