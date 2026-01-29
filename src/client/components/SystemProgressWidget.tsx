import React from 'react'
import { Block, Button } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'

type FeedbackStatus = 'operational' | 'resonating' | 'needs-calibration' | 'evolving'

interface Deployment {
  version: string
  timestamp: string
  protocol: string
  status: 'activated' | 'integrating' | 'synchronized'
  features: string[]
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
      case 'activated': return 'Protocol Activated'
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
            <span className="font-mono">{deployment.version}</span>
          </div>

          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-60">Protocol</span>
            <span className="capitalize">{deployment.protocol}</span>
          </div>

          <div className={`mb-12 ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>

        {/* Features */}
        {deployment.features.length > 0 && (
          <div className="border-t border-acc-400/30 pt-12">
            <div className="opacity-60 mb-8">Neural Enhancements Active:</div>
            <div className="flex flex-col gap-y-4 opacity-75">
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
                  <span className="font-mono">{option.symbol}</span>
                  <span className="text-sm">{option.label}</span>
                </div>
              </button>
            ))}
          </div>

          {feedback && (
            <div className="mt-12 text-sm opacity-60">
              Status logged. System calibration optimized.
            </div>
          )}
        </div>
      </div>
    </Block>
  )
}
