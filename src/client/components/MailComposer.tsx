/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block, GhostButton } from '#client/components/ui'
import { parseEmailCommand } from '#client/utils/logTriggers'
import {
  resolveMailRecipient,
  useSendMail,
  MailRecipient,
} from '#client/queries'

const fullName = (r: MailRecipient) =>
  `${r.firstName || ''} ${r.lastName || ''}`.trim()

/**
 * LOT Email composer — lives under the Log editor.
 * "/email to Hitomi" + body lines  →  SEND  →  lands in Hitomi's Sync.
 */
export const MailComposer: React.FC<{
  text: string
  onSent: (recipientName: string) => void
}> = ({ text, onSent }) => {
  const cmd = React.useMemo(() => parseEmailCommand(text), [text])
  const [matches, setMatches] = React.useState<MailRecipient[]>([])
  const [pickedId, setPickedId] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<string | null>(null)
  const { mutate: send, isLoading } = useSendMail()

  const name = cmd?.name || ''
  React.useEffect(() => {
    setPickedId(null)
    setStatus(null)
    if (name.length < 2) {
      setMatches([])
      return
    }
    let stale = false
    const t = setTimeout(() => {
      resolveMailRecipient(name)
        .then((m) => !stale && setMatches(m))
        .catch(() => !stale && setMatches([]))
    }, 300)
    return () => {
      stale = true
      clearTimeout(t)
    }
  }, [name])

  if (!cmd) return null

  const target =
    matches.find((m) => m.id === pickedId) ||
    (matches.length === 1 ? matches[0] : null)
  const canSend = !!target && !!cmd.body && !isLoading

  const doSend = () => {
    if (!target || !cmd.body) return
    send(
      { receiverId: target.id, body: cmd.body },
      {
        onSuccess: () => onSent(fullName(target)),
        onError: () => setStatus('DELIVERY FAILED'),
      }
    )
  }

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        <div className="opacity-80" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: '1.6' }}>
          <div>TO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{target ? fullName(target).toUpperCase() : name.toUpperCase()}</div>
          {matches.length > 1 && !target && (
            <div className="opacity-60">
              {matches.map((m) => (
                <GhostButton key={m.id} onClick={() => setPickedId(m.id)} className="mr-8">
                  {fullName(m)}{m.city ? ` · ${m.city}` : ''}
                </GhostButton>
              ))}
            </div>
          )}
          {name.length >= 2 && matches.length === 0 && (
            <div className="opacity-60">NO MEMBER FOUND</div>
          )}
          <div className="opacity-60">
            {cmd.body
              ? `BODY   ${cmd.body.length} CHARS`
              : 'BODY   WRITE THE MESSAGE ON THE LINES BELOW THE COMMAND'}
          </div>
          {status && <div>{status}</div>}
          <div className="mt-4">
            {canSend ? (
              <GhostButton onClick={doSend}>{isLoading ? 'SENDING…' : 'SEND →'}</GhostButton>
            ) : (
              <span className="opacity-40">SEND →</span>
            )}
          </div>
        </div>
      </Block>
    </div>
  )
}
