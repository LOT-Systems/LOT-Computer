/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { Block, Button } from '#client/components/ui'
import { useSendEmail } from '#client/queries'
import { parseEmailCommand } from '#client/utils/logTriggers'

/**
 * LOT® Email composer — shown under the Log editor while the text holds
 * "/email to Name <message>". Nothing is sent until SEND is pressed
 * (Log autosaves while typing, so sending on detection would misfire).
 */
export const EmailCompose: React.FC<{ text: string }> = ({ text }) => {
  const queryClient = useQueryClient()
  const parsed = React.useMemo(() => parseEmailCommand(text), [text])
  const [sentKey, setSentKey] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<string | null>(null)

  const key = parsed ? `${parsed.to}|${parsed.body}` : ''
  const { mutate, isLoading } = useSendEmail({
    onSuccess: (data) => {
      setSentKey(key)
      setStatus(`SENT → ${data.to.name.toUpperCase()}`)
      queryClient.invalidateQueries(['/api/email/inbox'])
    },
    onError: (err: any) => {
      const d = err?.response?.data
      if (d?.candidates?.length) {
        setStatus(
          `${d.candidates.length} MATCH: ` +
            d.candidates.map((c: any) => c.name).join(', ') +
            ' — USE First_Last'
        )
      } else {
        setStatus((d?.error || 'FAILED').toUpperCase())
      }
    },
  })

  React.useEffect(() => setStatus(null), [key])

  if (!parsed) return null
  const sent = sentKey === key
  const canSend = !!parsed.body && !sent && !isLoading

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: 1.6 }}>
          <div className="opacity-40">TO {parsed.to.toUpperCase()}</div>
          <div className="opacity-80 whitespace-pre-wrap">
            {parsed.body || 'Type your message after the name…'}
          </div>
          <div className="flex items-center gap-x-8 mt-4">
            <Button
              size="small"
              disabled={!canSend}
              onClick={() => mutate({ to: parsed.to, message: parsed.body })}
            >
              {sent ? 'Sent' : isLoading ? 'Sending…' : 'Send'}
            </Button>
            {status && <span className="opacity-60">{status}</span>}
          </div>
        </div>
      </Block>
    </div>
  )
}
