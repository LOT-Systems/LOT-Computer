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
        <div>Export your compiled behavioral data and quantum intent telemetry for AI integration.</div>
        <div className="opacity-60">LOT aggregates your patterns to deploy into humanoid systems, autonomous vehicles, or personal AI modules.</div>
      </div>

      <Block label="Export Training Data:" blockView>
        <div className="flex flex-col gap-y-16">
          <div className="opacity-60">
            Compile and download your complete psychological and quantum intent dataset as structured JSON.
          </div>

          <Button
            onClick={handleExportTrainingData}
            disabled={exportStatus === 'loading'}
          >
            {exportStatus === 'loading' ? 'Exporting...' :
             exportStatus === 'success' ? 'Exported' :
             exportStatus === 'error' ? 'Failed' :
             'Export Training Data (JSON)'}
          </Button>

          {lastExport && (
            <div className="opacity-60">
              Last export: {lastExport}
            </div>
          )}
        </div>
      </Block>

      <Block label="Included Modules:" blockView>
        <div className="flex flex-col gap-y-6">
          <div>Quantum Intent Signals. Energy, clarity, alignment, support vectors.</div>
          <div>Emotional Pattern Data. Mood check-ins, temporal emotional states.</div>
          <div>Behavioral Telemetry. Self-care routines, habit compilation.</div>
          <div>Memory Engine Output. Questions, responses, reflection depth.</div>
          <div>Goal Progression Index. Detected objectives, milestone tracking.</div>
        </div>
      </Block>

      <Block label="Integration Targets:" blockView>
        <div className="flex flex-col gap-y-6">
          <div>Humanoid companion systems. Emotional state recognition.</div>
          <div>Autonomous vehicle configuration. Preference calibration.</div>
          <div>Personal AI deployment. Context-aware assistant training.</div>
          <div>Behavioral research pipelines. Pattern analysis datasets.</div>
        </div>
      </Block>

      <Block label="Endpoints:" blockView>
        <Table
          data={apiEndpoints}
          columns={[
            {
              id: 'method',
              header: 'Method',
              accessor: (row) => <span className="opacity-90">{row.method}</span>
            },
            {
              id: 'endpoint',
              header: 'Endpoint',
              accessor: (row) => <span className="font-mono">{row.endpoint}</span>
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
