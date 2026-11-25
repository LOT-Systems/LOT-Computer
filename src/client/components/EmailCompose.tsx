/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import { cn } from '#client/utils'
import { findEmailRecipients, useSendEmail, MailUser } from '#client/queries'
import { recordSignal } from '#client/stores/intentionEngine'
import type { EmailDraft } from '#client/utils/lotEmail'

/**
 * LOT® Email — compose block rendered under the primary Log entry
 * while a `/email to <name>` line is present. Resolves the recipient
 * against joined operators, then sends. Delivery lands in Sync.
 */

export const mailName = (u: MailUser) =>
  `${u.firstName || 'Operator'}${u.lastInitial ? ` ${u.lastInitial}.` : ''}`

type Resolve =
  | { state: 'idle' | 'resolving' | 'none' | 'error' }
  | { state: 'found'; recipients: MailUser[] }

const ROW: React.CSSProperties = { display: 'flex', gap: '1.5rem', fontSize: '14px', lineHeight: '1.6' }
const KEY: React.CSSProperties = { minWidth: '72px', opacity: 0.4, flexShrink: 0 }

export const EmailCompose: React.FC<{
  draft: EmailDraft
  onSent: (recipientName: string) => void
}> = ({ draft, onSent }) => {
  const [resolve, setResolve] = React.useState<Resolve>({ state: 'idle' })
  const [pickedId, setPickedId] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<string | null>(null)

  // Debounced recipient resolution — re-runs as the name is typed
  React.useEffect(() => {
    let cancelled = false
    setResolve({ state: 'resolving' })
    setPickedId(null)
    const t = setTimeout(async () => {
      try {
        const recipients = await findEmailRecipients(draft.to)
        if (cancelled) return
        setResolve(recipients.length ? { state: 'found', recipients } : { state: 'none' })
        if (recipients.length === 1) setPickedId(recipients[0].id)
      } catch {
        if (!cancelled) setResolve({ state: 'error' })
      }
    }, 600)
    return () => { cancelled = true; clearTimeout(t) }
  }, [draft.to])

  const { mutate: sendEmail, isLoading: isSending } = useSendEmail({
    onSuccess: (data) => {
      setStatus(null)
      try { recordSignal('mood', 'email_sent', { hour: new Date().getHours(), length: draft.body.length }) } catch {}
      onSent(mailName(data.to))
    },
    onError: (err) => {
      const code = err.response?.status
      setStatus(
        code === 429 ? 'HOURLY LIMIT REACHED — HOLD TRANSMISSION'
          : code === 404 ? 'NO OPERATOR FOUND'
          : code === 403 ? 'MAIL DISABLED FOR THIS ACCOUNT'
          : 'TRANSMISSION FAILED — RETRY'
      )
    },
  })

  const recipients = resolve.state === 'found' ? resolve.recipients : []
  const picked = recipients.find((r) => r.id === pickedId) || null
  const canSend = !!picked && draft.body.trim().length > 0 && !isSending

  const onSend = React.useCallback(() => {
    if (!picked || !draft.body.trim()) return
    setStatus(null)
    sendEmail({ receiverId: picked.id, body: draft.body })
  }, [picked, draft.body, sendEmail])

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          <div style={ROW}>
            <span style={KEY}>TO</span>
            <span className="opacity-80">
              {resolve.state === 'resolving' && <span className="opacity-40 tracking-widest">RESOLVING {draft.to.toUpperCase()}...</span>}
              {resolve.state === 'none' && <span className="opacity-60">NO OPERATOR NAMED {draft.to.toUpperCase()}</span>}
              {resolve.state === 'error' && <span className="opacity-60">DIRECTORY OFFLINE</span>}
              {resolve.state === 'found' && recipients.length === 1 && (
                <span>{mailName(recipients[0])}{recipients[0].city ? <span className="opacity-40"> · {recipients[0].city}</span> : null}</span>
              )}
              {resolve.state === 'found' && recipients.length > 1 && (
                <span className="flex flex-wrap gap-x-16 gap-y-4">
                  {recipients.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setPickedId(r.id)}
                      className={cn('transition-opacity', r.id === pickedId ? 'opacity-100 underline' : 'opacity-40 hover:opacity-80')}
                    >
                      {mailName(r)}{r.city ? ` · ${r.city}` : ''}
                    </button>
                  ))}
                </span>
              )}
            </span>
          </div>
          <div style={ROW}>
            <span style={KEY}>BODY</span>
            <span className="opacity-60" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {draft.body.trim()
                ? draft.body.length > 280 ? draft.body.slice(0, 280) + '…' : draft.body
                : 'WRITE BELOW THE COMMAND LINE'}
            </span>
          </div>
          <div style={ROW}>
            <span style={KEY}>ROUTE</span>
            <span className="opacity-40">LOG → SYNC · PRIVATE</span>
          </div>
          {status && (
            <div style={ROW}>
              <span style={KEY}>STATUS</span>
              <span className="opacity-80">{status}</span>
            </div>
          )}
          <div className="mt-8">
            <Button size="small" kind="secondary" disabled={!canSend} onClick={onSend}>
              {isSending ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </div>
      </Block>
    </div>
  )
}
