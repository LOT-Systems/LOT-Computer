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
import { parseEmailCommand, subjectFromBody } from '#shared/utils'

/**
 * Shown under a Log entry that contains `/email to <Name>. <body>`.
 * Nothing is sent while typing — the operator confirms with SEND.
 */
export const EmailCommandBlock: React.FC<{ text: string }> = ({ text }) => {
  const parsed = React.useMemo(() => parseEmailCommand(text), [text])
  const [status, setStatus] = React.useState<string | null>(null)
  const [sentFor, setSentFor] = React.useState<string | null>(null)

  const { mutate: send, isLoading } = useSendEmail({
    onSuccess: (res) => {
      setStatus(`SENT TO ${[res.to?.firstName, res.to?.lastName].filter(Boolean).join(' ').toUpperCase()}`)
      setSentFor(`${parsed?.to}|${parsed?.body}`)
    },
    onError: (err: any) => {
      setStatus((err?.response?.data?.error || 'SEND FAILED').toString().toUpperCase())
    },
  })

  // Editing the entry after a send re-arms the button
  const alreadySent = !!parsed && sentFor === `${parsed.to}|${parsed.body}`

  if (!parsed) {
    return (
      <div className="mt-8">
        <Block label="EMAIL:" blockView>
          <div className="opacity-60">/email to Name. Your message</div>
        </Block>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        <div className="flex flex-col gap-y-4">
          <div className="opacity-60">TO {parsed.to.toUpperCase()}</div>
          <div className="opacity-60">
            SUBJECT {parsed.body ? subjectFromBody(parsed.body) : '—'}
          </div>
          <div className="flex items-center gap-x-8">
            <Button
              kind="secondary"
              size="small"
              disabled={!parsed.body || isLoading || alreadySent}
              onClick={() => {
                setStatus(null)
                send({ to: parsed.to, body: parsed.body })
              }}
            >
              {isLoading ? 'Sending…' : alreadySent ? 'Sent' : 'Send'}
            </Button>
            {status && <span className="opacity-60">{status}</span>}
          </div>
        </div>
      </Block>
    </div>
  )
}
