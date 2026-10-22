/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Button } from '#client/components/ui'
import { findMailRecipients, useSendMail } from '#client/queries'
import type { MailRecipient } from '#shared/types'

type Props = {
  /** Typed name from `/email to <name>.` — resolved against the community. */
  query?: string
  /** Already-known recipient (reply, cohort "Send message"). */
  recipient?: MailRecipient
  source: 'log' | 'sync' | 'cohort'
  onDone?: () => void
}

const MAX = 2000

/**
 * LOT Email composer. Minimal by design: TO line, one body field, SEND.
 */
export const MailComposer: React.FC<Props> = ({ query, recipient, source, onDone }) => {
  const [matches, setMatches] = React.useState<MailRecipient[] | null>(
    recipient ? [recipient] : null
  )
  const [to, setTo] = React.useState<MailRecipient | null>(recipient || null)
  const [body, setBody] = React.useState('')
  const [sentTo, setSentTo] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (recipient || !query) return
    let cancelled = false
    setTo(null)
    setMatches(null)
    findMailRecipients(query)
      .then((r) => {
        if (cancelled) return
        setMatches(r)
        if (r.length === 1) setTo(r[0])
      })
      .catch(() => !cancelled && setMatches([]))
    return () => {
      cancelled = true
    }
  }, [query, recipient?.id])

  const { mutate: send, isLoading } = useSendMail({
    onSuccess: () => {
      setSentTo(to?.name || '')
      setBody('')
      onDone?.()
    },
    onError: () => setError('SEND FAILED'),
  })

  const onSend = () => {
    if (!to || !body.trim()) return
    setError(null)
    send({ recipientId: to.id, body: body.trim(), source })
  }

  const label = 'text-[11px] tracking-[0.08em] opacity-40'

  if (sentTo) {
    return <div className="opacity-60">SENT → {sentTo.toUpperCase()}</div>
  }

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div className="flex items-baseline gap-x-8 mb-8">
        <span className={label}>TO</span>
        {matches === null && <span className="opacity-40">...</span>}
        {matches && matches.length === 0 && (
          <span className="opacity-60">NO MATCH FOR “{(query || '').toUpperCase()}”</span>
        )}
        {to && <span>{to.name}</span>}
        {!to &&
          matches &&
          matches.length > 1 &&
          matches.map((m) => (
            <Button key={m.id} size="small" onClick={() => setTo(m)}>
              {m.name}
            </Button>
          ))}
      </div>
      {to && (
        <>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX))}
            rows={4}
            placeholder="Message..."
            autoFocus
            className="w-full bg-transparent outline-none resize-y placeholder:text-acc/40 mb-8"
          />
          <div className="flex items-center gap-x-8">
            <Button size="small" onClick={onSend} disabled={isLoading || !body.trim()}>
              Send
            </Button>
            <span className={label}>{body.length}/{MAX}</span>
            {error && <span className="opacity-60">{error}</span>}
          </div>
        </>
      )}
    </div>
  )
}
