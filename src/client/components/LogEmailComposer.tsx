/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — composer block that appears under a Log entry when the
 * entry contains "/email to <Name>. <message>".
 *
 *   EMAIL:
 *   TO        Hitomi S.
 *   BODY      42 chars
 *   [Send]
 *
 * Sending is always explicit (button). On success the parent rewrites
 * "/email" → "✉" so autosave never re-sends and the log keeps a record.
 */

import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import {
  resolveLotEmailRecipient,
  useSendLotEmail,
  type LotEmailContact,
  type LotEmailResolve,
} from '#client/queries'
import { recordSignal } from '#client/stores/intentionEngine'
import { hasEmailCommand, parseEmailCommand } from '#shared/utils/lot-email'

const RESOLVE_DEBOUNCE_MS = 500

const shortName = (u: LotEmailContact) => {
  const first = (u.firstName || '').trim() || 'Member'
  const last = (u.lastName || '').trim()
  return last ? `${first} ${last.charAt(0)}.` : first
}

const Row: React.FC<{ k: string; children: React.ReactNode }> = ({ k, children }) => (
  <div className="flex gap-x-16">
    <span className="opacity-30 min-w-[80px]">{k}</span>
    <span>{children}</span>
  </div>
)

export const LogEmailComposer: React.FC<{
  text: string
  onSent: () => void
}> = ({ text, onSent }) => {
  const active = hasEmailCommand(text)
  const parsed = React.useMemo(() => (active ? parseEmailCommand(text) : null), [active, text])
  const to = parsed?.to || ''

  const [resolved, setResolved] = React.useState<LotEmailResolve | null>(null)
  const [resolving, setResolving] = React.useState(false)
  const [sentTo, setSentTo] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setResolved(null)
    setError(null)
    if (!to) return
    let cancelled = false
    setResolving(true)
    const t = setTimeout(async () => {
      try {
        const r = await resolveLotEmailRecipient(to)
        if (!cancelled) setResolved(r)
      } catch {
        if (!cancelled) setError('Directory unavailable')
      } finally {
        if (!cancelled) setResolving(false)
      }
    }, RESOLVE_DEBOUNCE_MS)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [to])

  const { mutate: send, isLoading: isSending } = useSendLotEmail({
    onSuccess: (email) => {
      setSentTo(shortName(email.to))
      setError(null)
      try {
        recordSignal('mood', 'lot_email_sent', { source: 'log', hour: new Date().getHours() })
      } catch {}
      onSent()
    },
    onError: (err: any) => setError(err?.response?.data?.error || 'Not sent'),
  })

  if (sentTo && !active) {
    return (
      <div className="mt-8">
        <Block label="EMAIL:" blockView>
          <Row k="SENT">→ {sentTo}</Row>
          <Row k="DELIVERY">Their Sync inbox</Row>
        </Block>
      </div>
    )
  }
  if (!active) return null

  const recipient = resolved?.status === 'ok' ? resolved.user : null
  const body = parsed?.body || ''
  const canSend = !!recipient && !!body.trim() && !isSending

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        {!parsed ? (
          <div className="opacity-60">FORMAT  /email to Name. message</div>
        ) : (
          <div className="flex flex-col gap-y-2">
            <Row k="TO">
              {resolving && 'RESOLVING...'}
              {!resolving && recipient && shortName(recipient)}
              {!resolving && resolved?.status === 'none' && (
                <span className="opacity-60">NO MEMBER NAMED {to.toUpperCase()}</span>
              )}
              {!resolving && resolved?.status === 'ambiguous' && (
                <span className="opacity-60">
                  {resolved.candidates.map(shortName).join(' · ')} — add an initial
                </span>
              )}
            </Row>
            <Row k="BODY">
              {body.trim() ? `${body.trim().length} chars` : <span className="opacity-60">WRITE AFTER THE NAME</span>}
            </Row>
            {error && <Row k="ERROR">{error.toUpperCase()}</Row>}
            <div className="mt-8">
              <Button
                size="small"
                kind="secondary"
                disabled={!canSend}
                onClick={() =>
                  recipient && send({ toUserId: recipient.id, body: body.trim(), source: 'log' })
                }
              >
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        )}
      </Block>
    </div>
  )
}
