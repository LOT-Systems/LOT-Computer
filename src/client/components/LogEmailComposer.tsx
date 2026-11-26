/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email composer — lives under the primary Log editor.
 *
 *   /email to Hitomi.
 *   Coffee on Friday?
 *
 * Shows an EMAIL: block (TO / BODY / SEND). Nothing is sent until the
 * operator presses Send. On success the command line is replaced with
 * a receipt so the log keeps a record and the composer closes.
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { Block, Button, GhostButton } from '#client/components/ui'
import { getLotEmailRecipients, useSendLotEmail } from '#client/queries'
import { parseEmailCommand, emailReceipt } from '#client/utils/lotEmail'
import type { LotEmailSource } from '#client/stores/lotEmail'

type Candidate = { id: string; name: string }

const ROW: React.CSSProperties = { display: 'flex', gap: '1.5rem', padding: '3px 0', lineHeight: '1.5' }
const KEY: React.CSSProperties = { minWidth: '72px', opacity: 0.4, letterSpacing: '0.08em' }

export const LogEmailComposer: React.FC<{
  value: string
  source?: LotEmailSource
  onSent: (nextValue: string) => void
}> = ({ value, source = 'log', onSent }) => {
  const queryClient = useQueryClient()
  const cmd = React.useMemo(() => parseEmailCommand(value), [value])
  const to = cmd?.to || ''

  const [candidates, setCandidates] = React.useState<Candidate[] | null>(null)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  // Debounced recipient lookup inside the LOT community
  React.useEffect(() => {
    setCandidates(null)
    setSelectedId(null)
    setError(null)
    if (!to) return
    let alive = true
    const t = setTimeout(async () => {
      try {
        const list = await getLotEmailRecipients(to)
        if (!alive) return
        setCandidates(list)
        if (list.length === 1) setSelectedId(list[0].id)
      } catch {
        if (alive) setCandidates([])
      }
    }, 450)
    return () => { alive = false; clearTimeout(t) }
  }, [to])

  const { mutate: send, isLoading } = useSendLotEmail({
    onSuccess: (sent) => {
      if (!cmd) return
      queryClient.invalidateQueries(['/api/lot-email'])
      onSent(value.replace(cmd.line, emailReceipt(sent.receiverName)))
    },
    onError: (err: any) => {
      const data = err?.response?.data
      if (data?.candidates) setCandidates(data.candidates)
      setError(String(data?.error || 'LOT Email offline').toUpperCase())
    },
  })

  if (!cmd) return null

  const selected = candidates?.find((c) => c.id === selectedId) || null
  const canSend = !!selected && !!cmd.body.trim() && !isLoading

  const onSend = () => {
    if (!canSend || !selected) return
    setError(null)
    send({ receiverId: selected.id, body: cmd.body, source })
  }

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}>
          <div style={ROW}>
            <span style={KEY}>TO</span>
            <span className="flex flex-wrap gap-x-12">
              {candidates === null && <span className="opacity-40">RESOLVING {to.toUpperCase()}...</span>}
              {candidates && candidates.length > 1 && !selectedId && (
                <span className="opacity-40">CHOOSE:</span>
              )}
              {candidates?.length === 0 && <span className="opacity-40">NO LOT MEMBER NAMED {to.toUpperCase()}</span>}
              {candidates && candidates.length > 0 && candidates.map((c) =>
                candidates.length === 1 ? (
                  <span key={c.id}>{c.name}</span>
                ) : (
                  <GhostButton key={c.id} onClick={() => setSelectedId(c.id)}>
                    <span className={selectedId === c.id ? 'underline' : 'opacity-40'}>
                      {selectedId === c.id ? '✓ ' : ''}{c.name}
                    </span>
                  </GhostButton>
                )
              )}
            </span>
          </div>
          <div style={ROW}>
            <span style={KEY}>BODY</span>
            <span className="opacity-60">
              {cmd.body.trim()
                ? `${cmd.body.trim().split(/\s+/).length} words`
                : 'Write the message on the next line'}
            </span>
          </div>
          {source === 'cohort' && (
            <div style={ROW}>
              <span style={KEY}>VIA</span>
              <span className="opacity-60">Cohort · LOT Community</span>
            </div>
          )}
          {error && (
            <div style={ROW}>
              <span style={KEY}>STATUS</span>
              <span className="opacity-60">{error}</span>
            </div>
          )}
          <div className="mt-8 flex items-center gap-x-8">
            <Button kind="secondary" size="small" disabled={!canSend} onClick={onSend}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
            <span className="opacity-30">Delivered to Sync</span>
          </div>
        </div>
      </Block>
    </div>
  )
}
