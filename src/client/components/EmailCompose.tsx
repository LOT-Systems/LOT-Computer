/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import {
  EmailCandidate,
  resolveEmailRecipient,
  useSendEmail,
} from '#client/queries'
import { parseEmailCommand } from '#client/utils/logTriggers'

/**
 * Log-side composer for `/email to Hitomi.`
 * Shows the parsed draft under the log; SEND delivers it to the
 * recipient's Sync inbox.
 */
export const EmailCompose: React.FC<{ text: string }> = ({ text }) => {
  const cmd = React.useMemo(() => parseEmailCommand(text), [text])
  const name = cmd?.name.toLowerCase() ?? ''
  const body = cmd?.body ?? ''

  const [candidates, setCandidates] = React.useState<EmailCandidate[] | null>(null)
  const [pickedId, setPickedId] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<string | null>(null)
  const [sentKey, setSentKey] = React.useState<string | null>(null)

  const { mutate: sendEmail, isLoading: sending } = useSendEmail({
    onSuccess: () => setStatus('SENT'),
    onError: () => setStatus('FAILED — not delivered'),
  })

  // Resolve the addressee (debounced) whenever the name changes
  React.useEffect(() => {
    setCandidates(null)
    setPickedId(null)
    setStatus(null)
    if (!name) return
    let cancelled = false
    const t = setTimeout(() => {
      resolveEmailRecipient(name)
        .then((c) => {
          if (cancelled) return
          setCandidates(c)
          if (c.length === 1) setPickedId(c[0].id)
        })
        .catch(() => !cancelled && setCandidates([]))
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [name])

  if (!cmd) return null

  const picked = candidates?.find((c) => c.id === pickedId) || null
  const key = `${pickedId}:${body}`
  const alreadySent = sentKey === key
  const canSend = !!picked && !!body && !sending && !alreadySent

  const onSend = () => {
    if (!picked) return
    setSentKey(key)
    setStatus(null)
    sendEmail({ receiverId: picked.id, body })
  }

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        <div className="opacity-80" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          <div className="mb-8">
            TO{' '}
            {candidates === null
              ? `${cmd.name}…`
              : candidates.length === 0
                ? `${cmd.name} — not found in LOT Community`
                : picked
                  ? `${picked.firstName || ''} ${picked.lastName || ''}`.trim()
                  : 'select recipient:'}
          </div>
          {candidates && candidates.length > 1 && !picked && (
            <div className="mb-8">
              {candidates.map((c) => (
                <div key={c.id}>
                  <button className="underline" onClick={() => setPickedId(c.id)}>
                    {`${c.firstName || ''} ${c.lastName || ''}`.trim()}
                    {c.city ? ` · ${c.city}` : ''}
                    {c.country ? `, ${c.country}` : ''}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="whitespace-pre-wrap opacity-60 mb-8">
            {body || 'Keep typing the message after the period…'}
          </div>
          <div className="flex items-center gap-x-8">
            <Button kind="secondary" size="small" disabled={!canSend} onClick={onSend}>
              {sending ? 'Sending…' : 'Send'}
            </Button>
            {status && <span className="opacity-60">{status}</span>}
          </div>
        </div>
      </Block>
    </div>
  )
}
