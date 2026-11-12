/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useQueryClient } from 'react-query'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block, Button, GhostButton } from '#client/components/ui'
import { useDebounce } from '#client/utils/hooks'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import {
  useLotEmailRecipients,
  useSendLotEmail,
  useLotEmailInbox,
  LotEmailRecipient,
} from '#client/queries'
import { parseEmailCommand, markEmailSent } from '#client/utils/lotEmail'
import { recordSignal } from '#client/stores/intentionEngine'
import { sync } from '../sync'

const ROW: React.CSSProperties = {
  display: 'flex',
  gap: '1.5rem',
  padding: '2px 0',
  fontSize: '14px',
  lineHeight: '1.5',
}
const KEY: React.CSSProperties = { minWidth: '72px', opacity: 0.4 }

const fullName = (r: Pick<LotEmailRecipient, 'firstName' | 'lastName'>) =>
  `${r.firstName || ''} ${r.lastName || ''}`.trim() || 'Unknown'

/**
 * Compose panel rendered under a Log entry while it contains
 * "/email to <Name>". Everything after the command line is the body.
 */
export const LotEmailCompose: React.FC<{
  value: string
  onSent: (nextText: string) => void
}> = ({ value, onSent }) => {
  const queryClient = useQueryClient()
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const cmd = React.useMemo(() => parseEmailCommand(value), [value])
  const to = useDebounce(cmd?.to || '', 400) as string
  const { data, isLoading } = useLotEmailRecipients(to)
  const [pickedId, setPickedId] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'error'>('idle')

  const recipients = data?.recipients || []
  const exact = recipients.filter((r) => r.exact)
  const auto =
    exact.length === 1 ? exact[0] : recipients.length === 1 ? recipients[0] : null
  const recipient = recipients.find((r) => r.id === pickedId) || auto

  React.useEffect(() => { setPickedId(null) }, [to])

  const { mutate: send } = useSendLotEmail({
    onSuccess: (res) => {
      setStatus('idle')
      queryClient.invalidateQueries(['/api/email/inbox'])
      try {
        recordSignal('mood', 'lot_email_sent', { hour: new Date().getHours() })
      } catch {}
      if (cmd) {
        const time = dayjs(res.createdAt).format(isTimeFormat12h ? 'hh:mm A' : 'HH:mm')
        onSent(markEmailSent(value, cmd, res.receiverName, time))
      }
    },
    onError: () => setStatus('error'),
  })

  if (!cmd) return null

  const canSend = !!recipient && !!cmd.body && status !== 'sending'
  const onSend = () => {
    if (!canSend || !recipient) return
    setStatus('sending')
    send({ receiverId: recipient.id, message: cmd.body })
  }

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          <div style={ROW}>
            <span style={KEY}>TO</span>
            <span className="flex flex-wrap gap-x-12">
              {to.length < 2 || isLoading ? (
                <span className="opacity-40">RESOLVING {cmd.to.toUpperCase()}…</span>
              ) : recipients.length === 0 ? (
                <span className="opacity-60">NO "{cmd.to.toUpperCase()}" IN LOT COMMUNITY</span>
              ) : recipient && !pickedId && auto ? (
                <span>
                  {fullName(recipient).toUpperCase()}
                  {recipient.city ? <span className="opacity-40"> · {recipient.city}</span> : null}
                </span>
              ) : (
                recipients.map((r) => (
                  <GhostButton
                    key={r.id}
                    className={cn(r.id === recipient?.id ? 'opacity-100 underline' : 'opacity-50')}
                    onClick={() => setPickedId(r.id)}
                  >
                    {fullName(r)}
                    {r.city ? ` · ${r.city}` : ''}
                  </GhostButton>
                ))
              )}
            </span>
          </div>
          <div style={ROW}>
            <span style={KEY}>BODY</span>
            <span className="opacity-60">
              {cmd.body ? `${cmd.body.length} CHARS` : 'WRITE BELOW THE COMMAND LINE'}
            </span>
          </div>
          <div style={ROW}>
            <span style={KEY}>ROUTE</span>
            <span className="opacity-60">LOG → SYNC{recipient?.known ? ' · THREAD OPEN' : ''}</span>
          </div>
          <div className="mt-8 flex items-center gap-x-12">
            <Button size="small" kind="secondary" disabled={!canSend} onClick={onSend}>
              {status === 'sending' ? 'Sending…' : 'Send'}
            </Button>
            {status === 'error' && <span className="opacity-60">SEND FAILED — RETRY</span>}
          </div>
        </div>
      </Block>
    </div>
  )
}

/**
 * LOT® Email inbox for Sync — latest envelope per correspondent,
 * refreshed live over SSE. Click a row to open the thread.
 */
export const LotEmailInbox: React.FC = () => {
  const queryClient = useQueryClient()
  const isTimeFormat12h = useStore(stores.isTimeFormat12h)
  const { data } = useLotEmailInbox()
  const [fresh, setFresh] = React.useState<Set<string>>(new Set())
  const me = useStore(stores.me)

  React.useEffect(() => {
    const { dispose } = sync.listen('direct_message', (msg: any) => {
      queryClient.invalidateQueries(['/api/email/inbox'])
      if (msg?.receiverId === me?.id && msg?.senderId) {
        setFresh((prev) => new Set(prev).add(msg.senderId))
      }
    })
    return () => dispose()
  }, [me?.id])

  const inbox = data?.inbox || []

  return (
    <div className="mb-40">
      <Block label="EMAIL:" blockView>
        <div style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
          {inbox.length === 0 ? (
            <div className="opacity-40" style={{ fontSize: '14px' }}>
              NO ENVELOPES. COMPOSE IN LOG: /email to Name
            </div>
          ) : (
            inbox.slice(0, 7).map((x) => (
              <div
                key={x.userId}
                className="group flex items-start gap-x-8 cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded"
                onClick={() => {
                  setFresh((prev) => { const n = new Set(prev); n.delete(x.userId); return n })
                  stores.goTo('dm', { userId: x.userId })
                }}
              >
                <span className="whitespace-nowrap">
                  {fresh.has(x.userId) ? '● ' : ''}
                  {x.name}
                </span>
                <span
                  className={cn('flex-1 truncate', x.isMine && 'opacity-40')}
                  style={{ minWidth: 0 }}
                >
                  {x.isMine ? '→ ' : ''}
                  {x.message.split('\n')[0]}
                </span>
                <span className="opacity-40 whitespace-nowrap">
                  {dayjs(x.createdAt).isSame(dayjs(), 'day')
                    ? dayjs(x.createdAt).format(isTimeFormat12h ? 'hh:mm A' : 'HH:mm')
                    : dayjs(x.createdAt).format('MMM D')}
                </span>
              </div>
            ))
          )}
        </div>
      </Block>
    </div>
  )
}
