/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * QI·46 admin read-out card. Read-only. Calls /admin-api/qi46/readout and
 * shows the HELD rate plus the three switch-on gates. Labels only: no text,
 * no user ids. Rendered for admins only (the route is admin-guarded too).
 */

import * as React from 'react'
import { Tag, TagsContainer, Unknown } from '#client/components/ui'
import {
  qi46ReadoutView,
  type Qi46ReadoutResponse,
} from '#shared/utils/qi46-readout-view'

const SOURCES = [
  { id: 'surface', name: 'Surface' },
  { id: 'admin-preview', name: 'Admin preview' },
] as const
const WINDOWS = [7, 14, 30, 90] as const

export const Qi46ReadoutPanel = () => {
  const [source, setSource] = React.useState<(typeof SOURCES)[number]['id']>('surface')
  const [days, setDays] = React.useState<number>(14)
  const [data, setData] = React.useState<Qi46ReadoutResponse | null>(null)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    let alive = true
    setError(false)
    fetch(`/admin-api/qi46/readout?days=${days}&source=${source}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => alive && setData(json))
      .catch(() => alive && setError(true))
    return () => {
      alive = false
    }
  }, [source, days])

  const view = React.useMemo(() => (data ? qi46ReadoutView(data) : null), [data])

  return (
    <div className="flex flex-col gap-y-8">
      <div>QI·46 read-out:</div>
      <div className="flex flex-wrap gap-x-16 gap-y-8">
        <TagsContainer
          items={SOURCES.map((s) => (
            <Tag key={s.id} fill={source === s.id} onClick={() => setSource(s.id)}>
              {s.name}
            </Tag>
          ))}
        />
        <TagsContainer
          items={WINDOWS.map((d) => (
            <Tag key={d} fill={days === d} onClick={() => setDays(d)}>
              {d}d
            </Tag>
          ))}
        />
      </div>

      {error ? (
        <Unknown>Read-out unavailable</Unknown>
      ) : !view ? (
        <Unknown>Loading...</Unknown>
      ) : (
        <>
          <div>{view.headline}</div>
          {view.note && <Unknown>{view.note}</Unknown>}
          {view.sections.map((s) => (
            <div key={s.title}>
              <div className="opacity-60">{s.title}</div>
              {s.rows.map((row) => (
                <div key={row.label} className="flex gap-x-16">
                  <span className="min-w-[12rem]">{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          ))}
          {!!view.gates.length && (
            <div>
              <div className="opacity-60">
                Switch-on ({view.gatesOpen ? `${view.gatesOpen} open` : 'all clear'})
              </div>
              {view.gates.map((g) => (
                <div key={g.label}>
                  {g.mark} {g.label}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
