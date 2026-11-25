/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * QI·46 per-person signal line on /us/:id. Read-only, admin only.
 * Calls the existing admin preview (/admin-api/users/:id/qi46) and shows
 * labels only: consent, signal count, confidence, risk level, risk signal
 * labels and lead register. The system prompt is never rendered.
 */

import * as React from 'react'
import { Block, Unknown } from '#client/components/ui'
import { qi46PersonView, type Qi46PersonResponse } from '#shared/utils/qi46-person-view'

export const Qi46PersonLine = ({ userId }: { userId: string }) => {
  const [data, setData] = React.useState<Qi46PersonResponse | null>(null)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    let alive = true
    setData(null)
    setError(false)
    fetch(`/admin-api/users/${encodeURIComponent(userId)}/qi46`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => alive && setData(json))
      .catch(() => alive && setError(true))
    return () => {
      alive = false
    }
  }, [userId])

  const view = React.useMemo(() => (data ? qi46PersonView(data) : null), [data])

  return (
    <Block label="QI·46:" blockView>
      {error ? (
        <Unknown>Signal line unavailable</Unknown>
      ) : !view ? (
        <Unknown>Loading...</Unknown>
      ) : (
        <div className="flex flex-col gap-y-8">
          <div>{view.line}</div>
          {!!view.signals.length && (
            <div className="opacity-60">Signals: {view.signals.join(' · ')}</div>
          )}
          {view.note && <Unknown>{view.note}</Unknown>}
        </div>
      )}
    </Block>
  )
}
