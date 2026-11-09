/**
 * LOT SYSTEMS CORPORATION
 * Made in the USA | brand.lot-systems.com
 *
 * LOT Email — Log composer. Reads "/email to Hitomi. body…" from the log text,
 * shows the parsed recipient + body, sends on click.
 */
import * as React from 'react'
import { useSendEmail } from '#client/queries'

/** "/email to Hitomi. Hello" | "/email to Hitomi Tanaka: Hello" -> { to, body } */
export function parseEmailCommand(text: string): { to: string; body: string } | null {
  const m = text.match(/\/email\s+to\s+([^\s.,:;!?]+(?:[ \t]+[^\s.,:;!?]+)?)?([.,:;]?)([\s\S]*)$/i)
  if (!m) return null
  let to = (m[1] || '').trim()
  let rest = m[3] || ''
  // "to Hitomi hello there" (no punctuation) — first word is the name
  if (!m[2] && to.includes(' ')) {
    const [first, ...tail] = to.split(/[ \t]+/)
    to = first
    rest = tail.join(' ') + rest
  }
  return { to, body: rest.trim() }
}

export const EmailComposeBlock: React.FC<{
  logText: string
  onSent: () => void
}> = ({ logText, onSent }) => {
  const parsed = React.useMemo(() => parseEmailCommand(logText), [logText])
  const [status, setStatus] = React.useState<string | null>(null)
  const { mutate, isLoading } = useSendEmail({
    onSuccess: (data) => {
      setStatus(`SENT TO ${(data.to.firstName || '').toUpperCase()} — SEE SYNC`)
      onSent()
    },
    onError: (err: any) =>
      setStatus(String(err?.response?.data?.error || 'SEND FAILED').toUpperCase()),
  })
  const canSend = !!parsed?.to && !!parsed?.body && !isLoading
  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: '1.6' }}>
      <div className="opacity-60">TO&nbsp;&nbsp;&nbsp;{parsed?.to || 'type: /email to Name. your message'}</div>
      <div className="opacity-60 whitespace-pre-wrap">
        {parsed?.body ? parsed.body : 'MSG  …'}
      </div>
      <div className="mt-8 flex items-center gap-x-8">
        <button
          type="button"
          className="underline disabled:opacity-30"
          disabled={!canSend}
          onClick={() => parsed && mutate({ to: parsed.to, body: parsed.body })}
        >
          Send email
        </button>
        {status && <span className="opacity-60">{status}</span>}
      </div>
    </div>
  )
}
