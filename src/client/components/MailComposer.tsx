/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import { parseEmailDraft } from '#client/utils/logTriggers'
import {
  resolveMailRecipient,
  useSendMail,
  type MailMatch,
} from '#client/queries'

const MONO = { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: '1.6' }

/**
 * LOT® Email composer for the Log.
 *
 *   /email to Hitomi.
 *   Subject: Tea on Friday        (optional)
 *   Message body ...
 *
 * Nothing is sent while typing — the user presses SEND. The recipient is
 * resolved against LOT Community; ambiguous first names ask which one.
 */
export const MailComposer: React.FC<{
  text: string
  onSent: (toName: string) => void
}> = ({ text, onSent }) => {
  const draft = React.useMemo(() => parseEmailDraft(text), [text])
  const [matches, setMatches] = React.useState<MailMatch[] | null>(null)
  const [chosen, setChosen] = React.useState<MailMatch | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const { mutate: sendMail, isLoading } = useSendMail({
    onSuccess: (res) => {
      setError(null)
      onSent(res.toName)
    },
    onError: (err: any) => {
      const data = err?.response?.data
      if (data?.matches) setMatches(data.matches)
      setError(data?.error || 'Send failed')
    },
  })

  const to = draft?.to || ''
  React.useEffect(() => {
    setChosen(null)
    setError(null)
    if (to.length < 2) {
      setMatches(null)
      return
    }
    let cancelled = false
    const t = setTimeout(() => {
      resolveMailRecipient(to)
        .then((m) => { if (!cancelled) setMatches(m) })
        .catch(() => { if (!cancelled) setMatches([]) })
    }, 400)
    return () => { cancelled = true; clearTimeout(t) }
  }, [to])

  if (!draft) return null

  const recipient = chosen || (matches && matches.length === 1 ? matches[0] : null)
  const canSend = !!recipient && !!draft.body && !isLoading

  return (
    <div className="mt-8">
      <Block label="MAIL:" blockView>
        <div className="opacity-80" style={{ ...MONO, whiteSpace: 'pre-wrap' }}>
          <div>TO       {recipient ? recipient.name : draft.to}</div>
          {draft.subject && <div>SUBJECT  {draft.subject}</div>}
          <div className="opacity-60">
            {draft.body || 'Write the message below the command line.'}
          </div>
          {matches && matches.length === 0 && (
            <div className="opacity-60 mt-4">No LOT Community member named “{draft.to}”.</div>
          )}
          {matches && matches.length > 1 && !chosen && (
            <div className="mt-4">
              <div className="opacity-60">Which one?</div>
              {matches.map((m) => (
                <div key={m.id}>
                  <button className="underline" onClick={() => setChosen(m)}>{m.name}</button>
                </div>
              ))}
            </div>
          )}
          {error && <div className="opacity-60 mt-4">{error}</div>}
          <div className="mt-8">
            <Button
              kind="secondary"
              size="small"
              disabled={!canSend}
              onClick={() =>
                recipient &&
                sendMail({
                  toUserId: recipient.id,
                  subject: draft.subject,
                  body: draft.body,
                })
              }
            >
              {isLoading ? 'Sending…' : 'Send'}
            </Button>
          </div>
        </div>
      </Block>
    </div>
  )
}
