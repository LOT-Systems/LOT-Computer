/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import { useSendEmail } from '#client/queries'
import { parseEmailCommand } from '#shared/utils/email-command'
import { recordSignal } from '#client/stores/intentionEngine'

/**
 * LOT® Email composer — appears under a Log entry containing
 *   /email to Hitomi.
 *   Body lines…
 * Nothing is sent until SEND is pressed. Delivered messages land in the
 * recipient's Sync inbox (live over SSE).
 */
type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent'; to: string; key: string }
  | { kind: 'ambiguous'; candidates: { id: string; name: string }[] }
  | { kind: 'error'; message: string }

export const EmailComposer: React.FC<{ text: string }> = ({ text }) => {
  const cmd = React.useMemo(() => parseEmailCommand(text), [text])
  const [status, setStatus] = React.useState<Status>({ kind: 'idle' })
  const { mutate: sendEmail } = useSendEmail()

  const key = cmd ? `${cmd.to}\u0000${cmd.body}` : ''

  // Editing the draft after a send/err returns the composer to idle
  React.useEffect(() => {
    setStatus((s) =>
      s.kind === 'sent' && s.key === key ? s : s.kind === 'sending' ? s : { kind: 'idle' }
    )
  }, [key])

  const send = React.useCallback(
    (toUserId?: string) => {
      if (!cmd || !cmd.body) return
      setStatus({ kind: 'sending' })
      sendEmail(
        toUserId ? { toUserId, message: cmd.body } : { to: cmd.to, message: cmd.body },
        {
          onSuccess: (res) => {
            setStatus({ kind: 'sent', to: res.to.name, key })
            try {
              recordSignal('mood', 'lot_email_sent', { hour: new Date().getHours() })
            } catch {}
          },
          onError: (err: any) => {
            const data = err?.response?.data
            if (err?.response?.status === 409 && data?.candidates) {
              setStatus({ kind: 'ambiguous', candidates: data.candidates })
            } else {
              setStatus({ kind: 'error', message: data?.error || 'SEND FAILED' })
            }
          },
        }
      )
    },
    [cmd, key, sendEmail]
  )

  if (!cmd) return null

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        <div className="tabular-nums" style={{ whiteSpace: 'pre-wrap' }}>
          <div>
            <span className="opacity-40 inline-block min-w-[64px]">TO</span>
            {cmd.to.toUpperCase()}
          </div>
          <div className="mt-4">
            <span className="opacity-40 inline-block min-w-[64px] align-top">BODY</span>
            <span className={cmd.body ? 'opacity-80' : 'opacity-30'}>
              {cmd.body || 'Write the message on the next line…'}
            </span>
          </div>

          <div className="mt-8 flex items-center gap-x-8 flex-wrap">
            {status.kind === 'sent' ? (
              <span className="opacity-60">
                SENT → {status.to.toUpperCase()} · APPEARS IN SYNC
              </span>
            ) : status.kind === 'ambiguous' ? (
              <>
                <span className="opacity-40">WHICH {cmd.to.toUpperCase()}?</span>
                {status.candidates.map((c) => (
                  <Button key={c.id} kind="secondary" size="small" onClick={() => send(c.id)}>
                    {c.name}
                  </Button>
                ))}
              </>
            ) : (
              <>
                <Button
                  kind="secondary"
                  size="small"
                  disabled={!cmd.body || status.kind === 'sending'}
                  onClick={() => send()}
                >
                  {status.kind === 'sending' ? 'Sending…' : 'Send'}
                </Button>
                {status.kind === 'error' && (
                  <span className="opacity-60">{status.message}</span>
                )}
              </>
            )}
          </div>
        </div>
      </Block>
    </div>
  )
}
