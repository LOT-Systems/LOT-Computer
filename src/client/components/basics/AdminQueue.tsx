/**
 * LOT-FM-001 / S-2 DISPATCH QUEUE — admin only. Lists operators ON STRENGTH,
 * shows the NEXT ISSUE card, records tracking, advances NEXT ISSUE.
 */

import * as React from 'react'
import { Bar } from './Ledger'

type Row = { userId: string; issue: number; nextIssue: string | null; due: boolean; card: string | null }

export const AdminQueue: React.FC = () => {
  const [rows, setRows] = React.useState<Row[] | null>(null)
  const [track, setTrack] = React.useState<Record<string, string>>({})
  const [busy, setBusy] = React.useState(false)
  const [msg, setMsg] = React.useState('')

  const load = React.useCallback(async () => {
    try {
      const res = await fetch('/api/basics/admin/queue', { credentials: 'same-origin' })
      setRows(res.ok ? await res.json() : [])
    } catch {
      setRows([])
      setMsg('LINK DOWN')
    }
  }, [])
  React.useEffect(() => { load() }, [load])

  const dispatch = async (userId: string) => {
    const tracking = (track[userId] || '').trim()
    if (!tracking) return setMsg('TRACKING REQUIRED')
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch('/api/basics/admin/dispatch', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tracking }),
      })
      const data = await res.json().catch(() => ({}))
      setMsg(res.ok ? 'DISPATCHED' : String(data.error ?? 'REJECTED'))
      if (res.ok) await load()
    } catch {
      setMsg('LINK DOWN')
    }
    setBusy(false)
  }

  return (
    <div>
      <Bar>S-2 DISPATCH QUEUE ({rows?.length ?? '--'})</Bar>
      {msg && <div className="pt-4 uppercase font-bold">{msg}</div>}
      {rows?.length === 0 && <div className="pt-4">NO OPERATORS ON STRENGTH</div>}
      {rows?.map((r) => (
        <div key={r.userId} className="pt-8 border-b-2 border-acc pb-8">
          <div className="flex justify-between uppercase">
            <span>{r.userId.slice(0, 8)} / ISSUE {String(r.issue).padStart(2, '0')}</span>
            <span className={r.due ? 'font-bold' : ''}>{r.nextIssue}{r.due ? ' — DUE' : ''}</span>
          </div>
          <pre className="overflow-x-auto leading-[1.5rem]">{r.card}</pre>
          <div className="flex gap-x-8 pt-4">
            <input
              className="flex-1 bg-bac text-acc border-2 border-acc px-8 py-4 font-mono uppercase"
              placeholder="TRACKING"
              value={track[r.userId] || ''}
              onChange={(e) => setTrack({ ...track, [r.userId]: e.target.value })}
            />
            <button
              className="bg-acc text-bac px-16 uppercase disabled:opacity-50"
              disabled={busy}
              onClick={() => dispatch(r.userId)}
            >
              DISPATCH
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
