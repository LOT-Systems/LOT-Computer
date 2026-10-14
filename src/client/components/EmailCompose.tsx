/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block, Button } from '#client/components/ui'
import { useSendMail } from '#client/queries'

/** Extracts "Hitomi" from "/email to Hitomi" (first name; also "/mail to Hitomi"). */
export function parseEmailRecipient(text: string): string {
  const m = /(?:^|\s)\/(?:email|mail)\s+to\s+@?([^\s/.,:;!?]+)/i.exec(text)
  return m ? m[1].trim() : ''
}

const fieldClass =
  'bg-transparent outline-none w-full border-b border-acc/20 focus:border-acc/60 py-2'

/**
 * LOT® Email composer — opened by the "/email to <Name>" Log command.
 * Delivered mail appears in the recipient's Sync tab.
 */
export const EmailCompose: React.FC<{
  logText: string
  onClose: () => void
}> = ({ logText, onClose }) => {
  const [to, setTo] = React.useState(() => parseEmailRecipient(logText))
  const [toEdited, setToEdited] = React.useState(false)
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')
  const [status, setStatus] = React.useState<string | null>(null)

  // Follow the Log text until the user edits the field by hand
  React.useEffect(() => {
    if (toEdited) return
    const parsed = parseEmailRecipient(logText)
    if (parsed) setTo(parsed)
  }, [logText, toEdited])

  const { mutate: send, isLoading } = useSendMail({
    onSuccess: (data) => {
      setStatus(`SENT TO ${data.to.toUpperCase()} · SYNC`)
      setBody('')
      setSubject('')
      setTimeout(onClose, 1800)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || 'Delivery failed'
      const c: string[] | undefined = err?.response?.data?.candidates
      setStatus(`${msg.toUpperCase()}${c?.length ? ` (${c.join(', ')})` : ''}`)
    },
  })

  const canSend = !!to.trim() && !!body.trim() && !isLoading

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        <div className="max-w-[560px]" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          <div className="flex gap-x-8 items-center">
            <span className="opacity-40 w-[64px]">TO</span>
            <input
              className={fieldClass}
              value={to}
              placeholder="Name"
              onChange={(e) => { setToEdited(true); setTo(e.target.value) }}
            />
          </div>
          <div className="flex gap-x-8 items-center">
            <span className="opacity-40 w-[64px]">SUBJECT</span>
            <input
              className={fieldClass}
              value={subject}
              maxLength={200}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <textarea
            className={`${fieldClass} mt-8 min-h-[96px] resize-y`}
            value={body}
            maxLength={5000}
            placeholder="Message"
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex items-center gap-x-8 mt-8">
            <Button
              kind="secondary"
              size="small"
              disabled={!canSend}
              onClick={() => { setStatus(null); send({ to, subject, body }) }}
            >
              Send
            </Button>
            <Button kind="secondary" size="small" onClick={onClose}>Close</Button>
            {status && <span className="opacity-60">{status}</span>}
          </div>
        </div>
      </Block>
    </div>
  )
}
