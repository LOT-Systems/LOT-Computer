import React from 'react'
import { Block, Button, Table } from '#client/components/ui'
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
      <div className="flex flex-col gap-y-16">
        <Block label="Authentication Required" blockView>
          <div className="flex flex-col gap-y-16">
            <div className="opacity-75">
              Please log in to access the API documentation and export your data.
            </div>
            <Button onClick={() => stores.goTo('system')}>
              Go to Home
            </Button>
          </div>
        </Block>
      </div>
    )
  }

  // API endpoints data for table
  const apiEndpoints = [
    {
      method: 'GET',
      endpoint: '/api/export/training-data',
      description: 'Complete dataset for AI training',
      format: 'JSON'
    },
    {
      method: 'GET',
      endpoint: '/api/export/emotional-checkins',
      description: 'Mood and emotional check-in history',
      format: 'CSV'
    },
    {
      method: 'GET',
      endpoint: '/api/export/self-care',
      description: 'Self-care activities and habits',
      format: 'CSV'
    },
    {
      method: 'GET',
      endpoint: '/api/export/all-logs',
      description: 'Complete activity log',
      format: 'CSV'
    }
  ]

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
    <div className="flex flex-col gap-y-16">
      <div>
        <div>Export your psychological data and quantum intent for AI training.</div>
        <div>LOT tracks your patterns to train humanoid robots, autonomous vehicles, or personal AI assistants.</div>
      </div>

      <Block label="Export Training Data" blockView>
        <div className="flex flex-col gap-y-16">
          <div className="opacity-75">
            Download your complete psychological and quantum intent data as a structured JSON file.
          </div>

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
            <div className="opacity-60">
              Last export: {lastExport}
            </div>
          )}
        </div>
      </Block>

      <Block label="What's Included" blockView>
        <div className="flex flex-col gap-y-6 opacity-75">
          <div>• Quantum Intent Signals (energy, clarity, alignment, needs support)</div>
          <div>• Emotional Patterns (mood check-ins, emotional states)</div>
          <div>• Behavioral Data (self-care activities, habits)</div>
          <div>• Memory Questions & Answers</div>
          <div>• Goal & Progress Tracking</div>
        </div>
      </Block>

      <Block label="Use Cases" blockView>
        <div className="flex flex-col gap-y-6 opacity-75">
          <div>• Train humanoid companions to recognize your emotional states</div>
          <div>• Configure autonomous vehicles based on your preferences</div>
          <div>• Build personalized AI assistants</div>
          <div>• Research on human behavior patterns</div>
        </div>
      </Block>

      <Block label="API Endpoints" blockView>
        <Table
          data={apiEndpoints}
          columns={[
            {
              id: 'method',
              header: 'Method',
              accessor: (row) => <span className="text-green opacity-75">{row.method}</span>
            },
            {
              id: 'endpoint',
              header: 'Endpoint',
              accessor: (row) => <span className="font-mono opacity-75">{row.endpoint}</span>
            },
            {
              id: 'description',
              header: 'Description',
              accessor: (row) => <span className="opacity-75">{row.description}</span>
            },
            {
              id: 'format',
              header: 'Format',
              accessor: (row) => <span className="opacity-75">{row.format}</span>
            }
          ]}
          paddingClassName="p-8"
          highlightFirstRow
        />
      </Block>
    </div>
  )
}
