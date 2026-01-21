import React from 'react'
import { Block, Button } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'

/**
 * API Page - Export psychological data and quantum intent for AI training
 */
export function ApiPage() {
  const me = useStore(stores.me)
  const [exportStatus, setExportStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [lastExport, setLastExport] = React.useState<string | null>(null)

  // Require authentication
  if (!me) {
    return (
      <div className="space-y-8">
        <Block label="Authentication Required" blockView>
          <div className="space-y-4">
            <p className="opacity-75">
              Please log in to access the API documentation and export your data.
            </p>
            <Button onClick={() => stores.goTo('system')}>
              Go to Home
            </Button>
          </div>
        </Block>
      </div>
    )
  }

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
        <div className="space-y-6">
          <h2 className="text-lg mb-4">Export Your Data for AI Training</h2>
          <p className="opacity-75">
            LOT tracks your psychological patterns, quantum intent signals, and behavioral data.
            Export this data to train humanoid robots, autonomous vehicles, or personal AI assistants.
          </p>
        </div>
      </Block>

      <Block label="Export Training Data" blockView>
        <div className="space-y-6">
          <p className="opacity-75">
            Download your complete psychological and quantum intent data as a structured JSON file.
          </p>

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
      </Block>

      <Block label="What's Included" blockView>
        <ul className="space-y-2 opacity-75">
          <li>• Quantum Intent Signals (energy, clarity, alignment, needs support)</li>
          <li>• Emotional Patterns (mood check-ins, emotional states)</li>
          <li>• Behavioral Data (self-care activities, habits)</li>
          <li>• Memory Questions & Answers</li>
          <li>• Goal & Progress Tracking</li>
        </ul>
      </Block>

      <Block label="Use Cases" blockView>
        <ul className="space-y-2 opacity-75">
          <li>• Train humanoid companions to recognize your emotional states</li>
          <li>• Configure autonomous vehicles based on your preferences</li>
          <li>• Build personalized AI assistants</li>
          <li>• Research on human behavior patterns</li>
        </ul>
      </Block>

      <Block label="API Endpoints" blockView>
        <div className="space-y-4">
          <div className="border border-acc-400/30 rounded p-4">
            <div className="font-mono text-sm mb-2">
              <span className="text-green">GET</span> /api/export/training-data
            </div>
            <div className="text-sm opacity-75">
              Complete dataset for AI training (JSON format)
            </div>
          </div>

          <div className="border border-acc-400/30 rounded p-4">
            <div className="font-mono text-sm mb-2">
              <span className="text-green">GET</span> /api/export/emotional-checkins
            </div>
            <div className="text-sm opacity-75">
              Mood and emotional check-in history (CSV format)
            </div>
          </div>

          <div className="border border-acc-400/30 rounded p-4">
            <div className="font-mono text-sm mb-2">
              <span className="text-green">GET</span> /api/export/self-care
            </div>
            <div className="text-sm opacity-75">
              Self-care activities and habits (CSV format)
            </div>
          </div>

          <div className="border border-acc-400/30 rounded p-4">
            <div className="font-mono text-sm mb-2">
              <span className="text-green">GET</span> /api/export/all-logs
            </div>
            <div className="text-sm opacity-75">
              Complete activity log (CSV format)
            </div>
          </div>
        </div>
      </Block>
    </div>
  )
}
