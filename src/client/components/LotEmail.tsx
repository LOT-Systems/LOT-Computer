/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * LOT® Email — the simplest mail system.
 *
 *  Log   → "/email to Hitomi" + message → EMAIL: block → Send
 *  Sync  → MAIL: block lists new messages, live over SSE
 *  Cohort Connect (Community) → "Email" pre-addresses a Sync composer
 *
 * One storage (direct_messages), one thread per pair (/dm/:userId).
 */

import * as React from 'react'
import { atom } from 'nanostores'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import * as stores from '#client/stores'
import { Block, Button, ResizibleGhostInput, Tag } from '#client/components/ui'
import dayjs from '#client/utils/dayjs'
import { cn } from '#client/utils'
import {
  useLotEmailInbox,
  useSendLotEmail,
  useCohorts,
  LotEmailPerson,
} from '#client/queries'
import { sync } from '../sync'
import type { LotEmailDraft } from '#client/utils/lotEmail'

const INBOX_KEY = ['/api/lot-email/inbox']
const MAX_LEN = 2000

/** Set by Cohort Connect to open a pre-addressed composer in Sync */
export const lotEmailComposeTo = atom<LotEmailPerson | null>(null)

/** Last time this viewer opened the MAIL block — drives the NEW mark */
export const lotEmailLastSeenAt = persistentAtom<string>('lotEmailLastSeenAt', '')

const personName = (p: Pick<LotEmailPerson, 'firstName' | 'lastName'> | null | undefined) =>
  `${p?.firstName || ''} ${p?.lastName || ''}`.trim() || 'Unknown'

const errorOf = (err: any): { status?: number; data?: any } => ({
  status: err?.response?.status,
  data: err?.response?.data,
})

// ---------------------------------------------------------------------
// Log composer — rendered under the Log editor when "/email to X" exists
// ---------------------------------------------------------------------
export const LotEmailCompose: React.FC<{
  draft: LotEmailDraft
  onSent: (toName: string) => void
}> = ({ draft, onSent }) => {
  const queryClient = useQueryClient()
  const [status, setStatus] = React.useState<string | null>(null)
  const [candidates, setCandidates] = React.useState<LotEmailPerson[]>([])
  const { mutate, isLoading } = useSendLotEmail()

  // Reset feedback when the addressee changes
  React.useEffect(() => {
    setStatus(null)
    setCandidates([])
  }, [draft.to])

  const send = React.useCallback(
    (receiverId?: string) => {
      if (!draft.body.trim()) return
      setStatus(null)
      mutate(
        { to: draft.to, receiverId, message: draft.body.slice(0, MAX_LEN) },
        {
          onSuccess: (res) => {
            setCandidates([])
            queryClient.invalidateQueries(INBOX_KEY)
            onSent(personName(res.to))
          },
          onError: (err) => {
            const { status: code, data } = errorOf(err)
            if (code === 409 && Array.isArray(data?.candidates)) {
              setCandidates(data.candidates)
              setStatus('SELECT RECIPIENT')
            } else if (code === 404) {
              setStatus(`NO MEMBER NAMED ${draft.to.toUpperCase()}`)
            } else {
              setStatus('DELIVERY FAILED — TRY AGAIN')
            }
          },
        }
      )
    },
    [draft.to, draft.body, mutate, onSent]
  )

  const hasBody = !!draft.body.trim()

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: '1.6' }}>
          <div className="flex gap-x-24">
            <span className="opacity-40 min-w-[56px]">TO</span>
            <span>{draft.to}</span>
          </div>
          <div className="flex gap-x-24">
            <span className="opacity-40 min-w-[56px]">BODY</span>
            <span className={cn('whitespace-pre-wrap', !hasBody && 'opacity-30')}>
              {hasBody ? draft.body : 'Write the message below the command…'}
            </span>
          </div>
          {status && <div className="opacity-60 mt-8">{status}</div>}
          {candidates.length > 0 && (
            <div className="flex flex-wrap gap-8 mt-8">
              {candidates.map((c) => (
                <Button key={c.id} size="small" kind="secondary" onClick={() => send(c.id)}>
                  {personName(c)}
                </Button>
              ))}
            </div>
          )}
          {candidates.length === 0 && (
            <div className="mt-8">
              <Button size="small" kind="secondary" disabled={!hasBody || isLoading} onClick={() => send()}>
                {isLoading ? 'Sending…' : 'Send'}
              </Button>
            </div>
          )}
        </div>
      </Block>
    </div>
  )
}

// ---------------------------------------------------------------------
// Sync inbox — newest mail, live, with Cohort tags and a quick composer
// ---------------------------------------------------------------------
export const LotEmailInbox: React.FC = () => {
  const queryClient = useQueryClient()
  const me = useStore(stores.me)
  const composeTo = useStore(lotEmailComposeTo)
  const lastSeenAt = useStore(lotEmailLastSeenAt)
  const { data } = useLotEmailInbox()
  const { data: cohortData } = useCohorts()
  const { mutate, isLoading } = useSendLotEmail()
  const [draft, setDraft] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  // Freeze "last seen" for this visit so NEW marks stay until next visit
  const seenRef = React.useRef(lastSeenAt)

  React.useEffect(() => {
    const { dispose } = sync.listen('direct_message' as any, () => {
      queryClient.invalidateQueries(INBOX_KEY)
    })
    return () => dispose()
  }, [])

  // Mark as seen when leaving Sync
  React.useEffect(() => () => {
    try { lotEmailLastSeenAt.set(new Date().toISOString()) } catch {}
  }, [])

  const cohortIds = React.useMemo(
    () => new Set((cohortData?.matches || []).map((m: any) => m.user?.id).filter(Boolean)),
    [cohortData]
  )

  const emails = data?.emails || []
  const incoming = emails.filter((e) => !e.isMine)
  const newCount = incoming.filter(
    (e) => !seenRef.current || dayjs(e.createdAt).isAfter(dayjs(seenRef.current))
  ).length

  const sendQuick = (ev?: React.FormEvent) => {
    ev?.preventDefault()
    if (!composeTo || !draft.trim()) return
    setError(null)
    mutate(
      { receiverId: composeTo.id, message: draft.trim().slice(0, MAX_LEN) },
      {
        onSuccess: () => {
          setDraft('')
          lotEmailComposeTo.set(null)
          queryClient.invalidateQueries(INBOX_KEY)
        },
        onError: () => setError('DELIVERY FAILED — TRY AGAIN'),
      }
    )
  }

  if (!me) return null
  if (!emails.length && !composeTo) {
    return (
      <div className="mb-40 opacity-30" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}>
        MAIL: empty · write "/email to Name" in Log
      </div>
    )
  }

  return (
    <div className="mb-40">
      <Block label={newCount ? `MAIL [${newCount} NEW]:` : 'MAIL:'} blockView>
        <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px', lineHeight: '1.6' }}>
          {composeTo && (
            <form onSubmit={sendQuick} className="mb-16">
              <div className="flex items-center gap-x-8">
                <span className="opacity-40 whitespace-nowrap">TO {personName(composeTo)}</span>
                <ResizibleGhostInput
                  direction="vh"
                  value={draft}
                  onChange={(v: string) => setDraft(v.slice(0, MAX_LEN))}
                  placeholder="Write an email…"
                  containerClassName="flex-grow leading-normal"
                  className="leading-normal"
                />
                <Button type="submit" size="small" kind="secondary" disabled={!draft.trim() || isLoading}>
                  Send
                </Button>
                <Button size="small" kind="secondary" onClick={() => lotEmailComposeTo.set(null)}>
                  ×
                </Button>
              </div>
              {error && <div className="opacity-60 mt-4">{error}</div>}
            </form>
          )}
          {emails.slice(0, 8).map((e) => {
            const isNew = !e.isMine && (!seenRef.current || dayjs(e.createdAt).isAfter(dayjs(seenRef.current)))
            return (
              <div
                key={e.id}
                className="flex items-start gap-x-8 cursor-pointer grid-fill-hover -mx-4 px-4 py-2 rounded"
                onClick={() => stores.goTo('dm', { userId: e.other.id })}
                title="Open thread"
              >
                <span className={cn('whitespace-nowrap', !isNew && 'opacity-60')}>
                  {e.isMine ? `→ ${personName(e.other)}` : personName(e.other)}
                </span>
                {cohortIds.has(e.other.id) && (
                  <Tag className="text-acc/40 select-none -mt-[2px]" fill={false}>COHORT</Tag>
                )}
                <span
                  className={cn('flex-1 truncate', isNew ? 'opacity-100' : 'opacity-40')}
                  style={{ wordBreak: 'break-word' }}
                >
                  {e.message}
                </span>
                <span className="opacity-30 whitespace-nowrap">{dayjs(e.createdAt).fromNow()}</span>
              </div>
            )
          })}
        </div>
      </Block>
    </div>
  )
}
