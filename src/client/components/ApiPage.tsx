import React from 'react'
import { Block, Button } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'

/**
 * API Page - Export psychological data and quantum intent for AI training
 *
 * This page provides endpoints to export user data in formats suitable for:
 * - Humanoid robot training programs
 * - Autonomous vehicle behavior models
 * - Personal AI assistants
 * - Research and analysis
 */
export function ApiPage() {
  const me = useStore(stores.me)
  const [exportStatus, setExportStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [lastExport, setLastExport] = React.useState<string | null>(null)

  const handleExportTrainingData = async () => {
    setExportStatus('loading')
    try {
      const response = await fetch('/api/export/training-data')
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lot-training-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setExportStatus('success')
      setLastExport(new Date().toLocaleString())

      setTimeout(() => setExportStatus('idle'), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('error')
      setTimeout(() => setExportStatus('idle'), 3000)
    }
  }

  return (
    <div className="space-y-8">
      <Block label="API Documentation" blockView>
        <div className="space-y-8">
          <div>
            <h2 className="text-lg mb-4">Export Your Data for AI Training</h2>
            <p className="opacity-75 mb-6">
              LOT tracks your psychological patterns, quantum intent signals, and behavioral data.
              Export this data to train humanoid robots, autonomous vehicles, or personal AI assistants
              to understand and respond to your unique patterns.
            </p>
          </div>

          <div className="border-t border-acc-400/30 pt-8">
            <h3 className="mb-4">What's Included:</h3>
            <ul className="space-y-3 opacity-75">
              <li>• <strong>Quantum Intent Signals:</strong> Energy, clarity, alignment, needs support patterns</li>
              <li>• <strong>Emotional Patterns:</strong> Mood check-ins, emotional states over time</li>
              <li>• <strong>Behavioral Data:</strong> Self-care activities, habits, routines</li>
              <li>• <strong>Memory Questions & Answers:</strong> Personal reflections and insights</li>
              <li>• <strong>Goal & Progress Tracking:</strong> Intentions, aspirations, achievements</li>
              <li>• <strong>Contextual Metadata:</strong> Time of day, location, environmental factors</li>
            </ul>
          </div>

          <div className="border-t border-acc-400/30 pt-8">
            <h3 className="mb-4">Use Cases:</h3>
            <ul className="space-y-3 opacity-75">
              <li>
                <strong>Humanoid Companions:</strong> Train robots to recognize your emotional states
                and respond appropriately to your needs
              </li>
              <li>
                <strong>Autonomous Vehicles:</strong> Adjust driving style, music, climate based on
                your current quantum state and preferences
              </li>
              <li>
                <strong>Personal AI:</strong> Build AI assistants that understand your unique patterns
                and can provide personalized support
              </li>
              <li>
                <strong>Research:</strong> Contribute anonymized data to studies on human behavior
                and wellbeing patterns
              </li>
            </ul>
          </div>
        </div>
      </Block>

      <Block label="Export Training Data" blockView>
        <div className="space-y-6">
          <div>
            <p className="opacity-75 mb-6">
              Download your complete psychological and quantum intent data as a structured JSON file.
              This file contains all your tracked data formatted for machine learning training.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              onClick={handleExportTrainingData}
              disabled={exportStatus === 'loading'}
            >
              {exportStatus === 'loading' ? 'Exporting...' :
               exportStatus === 'success' ? '✓ Exported!' :
               exportStatus === 'error' ? '✗ Failed' :
               'Export Training Data (JSON)'}
            </Button>

            {lastExport && (
              <div className="text-sm opacity-60">
                Last export: {lastExport}
              </div>
            )}
          </div>

          <div className="border-t border-acc-400/30 pt-6 text-sm opacity-60">
            <p className="mb-2">
              <strong>Privacy Note:</strong> This export contains your personal data.
              Only share with trusted systems and ensure proper data protection measures.
            </p>
          </div>
        </div>
      </Block>

      <Block label="API Endpoints" blockView>
        <div className="space-y-6">
          <div>
            <h3 className="mb-4">Available Endpoints:</h3>
          </div>

          <div className="space-y-6 font-mono text-sm">
            <div className="border border-acc-400/30 rounded p-4">
              <div className="mb-2">
                <span className="text-green-500">GET</span> /api/export/training-data
              </div>
              <div className="opacity-75 font-sans">
                Complete dataset for AI training (JSON format)
              </div>
            </div>

            <div className="border border-acc-400/30 rounded p-4">
              <div className="mb-2">
                <span className="text-green-500">GET</span> /api/export/emotional-checkins
              </div>
              <div className="opacity-75 font-sans">
                Mood and emotional check-in history (CSV format)
              </div>
            </div>

            <div className="border border-acc-400/30 rounded p-4">
              <div className="mb-2">
                <span className="text-green-500">GET</span> /api/export/self-care
              </div>
              <div className="opacity-75 font-sans">
                Self-care activities and habits (CSV format)
              </div>
            </div>

            <div className="border border-acc-400/30 rounded p-4">
              <div className="mb-2">
                <span className="text-green-500">GET</span> /api/export/all-logs
              </div>
              <div className="opacity-75 font-sans">
                Complete activity log (CSV format)
              </div>
            </div>
          </div>

          <div className="border-t border-acc-400/30 pt-6 text-sm opacity-60">
            <p>
              All endpoints require authentication. Include your session cookie or API token.
            </p>
          </div>
        </div>
      </Block>

      <Block label="Data Format" blockView>
        <div className="space-y-4">
          <div>
            <h3 className="mb-4">Training Data JSON Structure:</h3>
          </div>

          <pre className="bg-acc-400/5 border border-acc-400/30 rounded p-4 overflow-x-auto text-xs opacity-75">
{`{
  "user": {
    "id": "...",
    "metadata": { ... }
  },
  "quantum_states": [
    {
      "timestamp": "2026-01-20T10:30:00Z",
      "energy": "moderate",
      "clarity": "clear",
      "alignment": "aligned",
      "needsSupport": "low"
    }
  ],
  "emotional_checkins": [
    {
      "timestamp": "2026-01-20T09:00:00Z",
      "emotion": "calm",
      "intensity": 7,
      "context": "morning routine"
    }
  ],
  "behaviors": [
    {
      "timestamp": "2026-01-20T08:00:00Z",
      "activity": "meditation",
      "duration_minutes": 15,
      "notes": "..."
    }
  ],
  "memory_qa": [
    {
      "question": "...",
      "answer": "...",
      "timestamp": "2026-01-19T20:00:00Z"
    }
  ]
}`}
          </pre>
        </div>
      </Block>
    </div>
  )
}
