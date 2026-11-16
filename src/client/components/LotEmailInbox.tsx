/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email inbox — lives at the top of Sync.
 *
 * Letters are composed in Log ("/email to Hitomi. …"), from a Cohort
 * Connect match ("Email"), or as a reply here. New letters arrive live
 * over the private `lot_email` SSE event.
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import * as stores from '#client/stores'
import { Button, ResizibleGhostInput } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import { useLotEmails, useSendLotEmail, LotEmailRecord } from '#client/queries'
import { LOT_EMAIL_MAX_LENGTH } from '#shared/utils/lotEmail'
import { sync } from '../sync'

const SEEN_KEY = 'lot-email:last-seen'
const LETTERS_TO_SHOW = 12

function readSeen(): number {
  try {
    return Number(localStorage.getItem(SEEN_KEY) || 0)
  } catch {
    return 0
  }
}
function writeSeen(t: number) {
  try {
    localStorage.setItem(SEEN_KEY, String(t))
  } catch {}
}

export const LotEmailInbox: React.FC = () => {
  const me = useStore(stores.me)
  const composeTo = useStore(stores.lotEmailComposeTo)
  const isTouchDevice = useStore(stores.isTouchDevice)
  const queryClient = useQueryClient()
  const { data } = useLotEmails()
  const [live, setLive] = React.useState<LotEmailRecord[]>([])
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState('')
  const [status, setStatus] = React.useState<string | null>(null)
  const seenAtMount = React.useRef(readSeen())

  const { mutate: send, isLoading: sending } = useSendLotEmail({
    onSuccess: (letter) => {
      setDraft('')
      setStatus(`DELIVERED → ${letter.receiverName.toUpperCase()}`)
      stores.lotEmailComposeTo.set(null)
      setLive((prev) => (prev.some((x) => x.id === letter.id) ? prev : [letter, ...prev]))
    },
    onError: (err: any) => setStatus(err?.response?.data?.error || 'MAIL OFFLINE — try again.'),
  })

  React.useEffect(() => {
    const { dispose } = sync.listen('lot_email', (letter: any) => {
      setLive((prev) =>
        prev.some((x) => x.id === letter.id)
          ? prev
          : [{ ...letter, isMine: letter.senderId === me?.id }, ...prev]
      )
    })
    return () => {
      dispose()
      writeSeen(Date.now())
      queryClient.invalidateQueries(['/api/lot-email'])
    }
  }, [me?.id])

  const letters = React.useMemo(() => {
    const fetched = data?.letters || []
    const ids = new Set(fetched.map((x) => x.id))
    return [...live.filter((x) => !ids.has(x.id)), ...fetched].slice(0, LETTERS_TO_SHOW)
  }, [data, live])

  // Who the composer is addressed to: Cohort preset, or the open letter's other party
  const openLetter = letters.find((x) => x.id === openId) || null
  const recipient = composeTo
    ? composeTo
    : openLetter
      ? openLetter.isMine
        ? { id: openLetter.receiverId, name: openLetter.receiverName }
        : { id: openLetter.senderId, name: openLetter.senderName }
      : null

  const onSubmit = React.useCallback(
    (ev?: React.FormEvent) => {
      ev?.preventDefault()
      if (!recipient || !draft.trim() || sending) return
      send({ receiverId: recipient.id, message: draft })
    },
    [recipient?.id, draft, sending]
  )

  const onKeyDown = React.useCallback(
    (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (ev.key === 'Enter' && !isTouchDevice && !ev.metaKey && !ev.shiftKey) {
        ev.preventDefault()
        onSubmit()
      }
    },
    [onSubmit, isTouchDevice]
  )

  if (!letters.length && !composeTo) {
    return (
      <div className="mb-40 text-acc/40 select-none">
        MAIL · No letters yet. Write <span className="text-acc/60">/email to Name. Your letter</span> in Log.
      </div>
    )
  }

  const unread = letters.filter(
    (x) => !x.isMine && new Date(x.createdAt).getTime() > seenAtMount.current
  ).length

  return (
    <div className="mb-80">
      <div className="text-acc/40 select-none mb-8">
        MAIL{unread ? ` · ${unread} NEW` : ''}
      </div>

      {letters.map((x) => {
        const isNew = !x.isMine && new Date(x.createdAt).getTime() > seenAtMount.current
        const isOpen = openId === x.id
        return (
          <div
            key={x.id}
            className={cn(
              'flex items-start gap-x-8 cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded',
              !isOpen && !isNew && 'text-acc/60'
            )}
            onClick={() => {
              stores.lotEmailComposeTo.set(null)
              setStatus(null)
              setOpenId(isOpen ? null : x.id)
            }}
          >
            <span className="whitespace-nowrap">
              {x.isMine ? `→ ${x.receiverName}` : `${isNew ? '● ' : ''}${x.senderName}`}
            </span>
            <div
              className={cn('flex-1', !isOpen && 'truncate')}
              style={{ whiteSpace: isOpen ? 'pre-wrap' : undefined, wordBreak: 'break-word' }}
            >
              {x.message}
            </div>
            <span className="text-acc/40 whitespace-nowrap select-none">
              {dayjs(x.createdAt).format(dayjs().isSame(x.createdAt, 'day') ? 'HH:mm' : 'D MMM')}
            </span>
          </div>
        )
      })}

      {recipient && (
        <form onSubmit={onSubmit} className="flex items-center gap-x-8 mt-8">
          <span className="whitespace-nowrap text-acc/40">To {recipient.name}</span>
          <ResizibleGhostInput
            direction="vh"
            value={draft}
            onChange={(v: string) => setDraft(v.slice(0, LOT_EMAIL_MAX_LENGTH))}
            onKeyDown={onKeyDown}
            placeholder="Write a letter..."
            containerClassName="flex-grow leading-normal"
            className="leading-normal"
          />
          <Button type="submit" kind="secondary" size="small" disabled={!draft.trim() || sending}>
            {sending ? 'Sending…' : 'Send'}
          </Button>
        </form>
      )}
      {status && <div className="text-acc/40 mt-4 select-none">{status}</div>}
    </div>
  )
}
