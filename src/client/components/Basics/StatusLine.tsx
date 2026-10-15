/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { RationState } from './constants'

type Props = {
  state: RationState
  nextIssue?: string | null
  issueCount?: number
}

export const StatusLine: React.FC<Props> = ({ state, nextIssue, issueCount }) => {
  const [now, setNow] = React.useState(() => new Date())

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')

  return (
    <div className="lb-status lb-no-print">
      <div className="lb-status-field">
        <span className="lb-status-key">LOT-FM-001</span>
        <span>BASIC</span>
      </div>
      <div className="lb-status-field">
        <span className="lb-status-key">STATUS</span>
        <span>{state}</span>
      </div>
      {nextIssue && (
        <div className="lb-status-field">
          <span className="lb-status-key">NEXT ISSUE</span>
          <span>{nextIssue}</span>
        </div>
      )}
      {typeof issueCount === 'number' && issueCount > 0 && (
        <div className="lb-status-field">
          <span className="lb-status-key">ISSUES</span>
          <span>{issueCount}</span>
        </div>
      )}
      <div className="lb-status-field" style={{ marginLeft: 'auto' }}>
        <span className="lb-status-key">DATE</span>
        <span>{dateStr}</span>
      </div>
    </div>
  )
}
