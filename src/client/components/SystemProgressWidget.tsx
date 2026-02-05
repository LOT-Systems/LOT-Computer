import React from 'react'
import { Block, Button } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'

type FeedbackStatus = 'operational' | 'resonating' | 'needs-calibration' | 'evolving'

interface Deployment {
  version: string
  timestamp: string
  program: string
  status: 'activated' | 'integrating' | 'synchronized'
  features: string[]
}

interface FeedbackAnalytics {
  version: string
  period: string
  totalResponses: number
  feedbackPercentages: {
    operational: number
    resonating: number
    'needs-calibration': number
    evolving: number
  }
  systemHealth: {
    status: string
    message: string
    priority: string
  }
  insights: string[]
}

const FEEDBACK_OPTIONS = [
  { id: 'operational', label: 'Operational', symbol: '|' },
  { id: 'resonating', label: 'Resonating', symbol: '~' },
  { id: 'needs-calibration', label: 'Needs Calibration', symbol: '*' },
  { id: 'evolving', label: 'Evolving', symbol: '^' }
] as const

/**
 * SystemProgressWidget - Shows latest deployments with sci-fi terminology
 * Collects user feedback through word-buttons
 */
export function SystemProgressWidget() {
  const me = useStore(stores.me)
  const [feedback, setFeedback] = React.useState<FeedbackStatus | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [deployment, setDeployment] = React.useState<Deployment | null>(null)
  const [analytics, setAnalytics] = React.useState<FeedbackAnalytics | null>(null)
  const [showAnalytics, setShowAnalytics] = React.useState(false)

  // Load latest deployment info
  React.useEffect(() => {
    fetch('/api/system/deployment-status')
      .then(res => res.json())
      .then(data => setDeployment(data))
      .catch(err => console.error('Failed to load deployment status:', err))
  }, [])

  // Load user's feedback if exists
  React.useEffect(() => {
    if (!deployment) return

    fetch('/api/system/my-feedback')
      .then(res => res.json())
      .then(data => {
        if (data.feedback) {
          setFeedback(data.feedback)
        }
      })
      .catch(err => console.error('Failed to load feedback:', err))
  }, [deployment])

  // Load community feedback analytics
  React.useEffect(() => {
    if (!deployment) return

    fetch('/api/system/feedback-analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Failed to load analytics:', err))
  }, [deployment])

  const handleFeedback = async (status: FeedbackStatus) => {
    setIsSubmitting(true)
    try {
      await fetch('/api/system/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: deployment?.version,
          feedback: status
        })
      })
      setFeedback(status)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!deployment || !me) {
    return null
  }

  const getStatusColor = () => {
    switch (deployment.status) {
      case 'activated': return 'text-green'
      case 'integrating': return 'text-blue'
      case 'synchronized': return 'text-acc'
      default: return 'opacity-75'
    }
  }

  const getStatusText = () => {
    switch (deployment.status) {
      case 'activated': return 'Program Activated'
      case 'integrating': return '⟳ Neural Pathways Integrating'
      case 'synchronized': return '◈ Quantum Core Synchronized'
      default: return 'Status Unknown'
    }
  }

  return (
    <Block label="System Progress:" blockView>
      <div className="flex flex-col gap-y-16">
        {/* Deployment Info */}
        <div>
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-60">Build Version</span>
            <span>{deployment.version}</span>
          </div>

          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-60">Program</span>
            <span className="capitalize">{deployment.program}</span>
          </div>

          <div className={`mb-12 ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>

        {/* Features */}
        {deployment.features.length > 0 && (
          <div className="border-t border-acc-400/30 pt-12">
            <div className="opacity-60 mb-8">Neural Enhancements Active:</div>
            <div className="flex flex-col gap-y-4">
              {deployment.features.map((feature, idx) => (
                <div key={idx}>• {feature}</div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <div className="border-t border-acc-400/30 pt-12">
          <div className="opacity-60 mb-8">System Status Assessment:</div>

          <div className="grid grid-cols-2 gap-8">
            {FEEDBACK_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => handleFeedback(option.id as FeedbackStatus)}
                disabled={isSubmitting}
                className={`
                  px-12 py-8 rounded border transition-all
                  ${feedback === option.id
                    ? 'border-acc grid-fill text-acc'
                    : 'border-acc-400/30 hover:border-acc-400/60 grid-fill-hover'
                  }
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center gap-4">
                  <span>{option.symbol}</span>
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>

          {feedback && (
            <div className="mt-12 opacity-75">
              Status logged. System calibration optimized.
            </div>
          )}
        </div>

        {/* Community Feedback Analytics - Self-Evolution Insights */}
        {analytics && analytics.totalResponses > 0 && (
          <div className="border-t border-acc-400/30 pt-12">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="w-full flex justify-between items-center opacity-60 hover:opacity-100 transition-opacity mb-8"
            >
              <span>Community Feedback Evolution:</span>
              <span>{showAnalytics ? '▼' : '▶'}</span>
            </button>

            {showAnalytics && (
              <div className="flex flex-col gap-y-12">
                {/* System Health Status */}
                <div className={`p-12 rounded border ${
                  analytics.systemHealth.priority === 'high' ? 'border-red-500/50 bg-red-500/5' :
                  analytics.systemHealth.priority === 'healthy' ? 'border-green-500/50 bg-green-500/5' :
                  analytics.systemHealth.priority === 'medium' ? 'border-yellow-500/50 bg-yellow-500/5' :
                  'border-acc-400/30'
                }`}>
                  <div className="opacity-75 text-sm mb-4">System Health:</div>
                  <div className="font-medium">{analytics.systemHealth.message}</div>
                </div>

                {/* Feedback Distribution */}
                <div>
                  <div className="opacity-75 text-sm mb-8">Feedback Distribution ({analytics.totalResponses} responses):</div>
                  <div className="flex flex-col gap-y-6">
                    {FEEDBACK_OPTIONS.map(option => {
                      const percentage = analytics.feedbackPercentages[option.id as keyof typeof analytics.feedbackPercentages]
                      return (
                        <div key={option.id}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm opacity-75">{option.symbol} {option.label}</span>
                            <span className="text-sm">{percentage}%</span>
                          </div>
                          <div className="w-full bg-acc-400/20 rounded-full h-4">
                            <div
                              className="bg-acc h-4 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Evolution Insights */}
                {analytics.insights.length > 0 && (
                  <div>
                    <div className="opacity-75 text-sm mb-8">Self-Evolution Insights:</div>
                    <div className="flex flex-col gap-y-4">
                      {analytics.insights.map((insight, idx) => (
                        <div key={idx} className="flex gap-x-4">
                          <span className="opacity-50">•</span>
                          <span className="opacity-90">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs opacity-50 text-center pt-8">
                  Analytics based on {analytics.period} of community feedback
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Block>
  )
}
