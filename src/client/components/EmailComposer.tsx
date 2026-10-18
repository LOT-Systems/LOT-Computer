/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import { useQueryClient } from 'react-query'
import * as stores from '#client/stores'
import { Block, Button, Input, Textarea } from '#client/components/ui'
import { useEmailRecipients, useSendEmail, EmailRecipient } from '#client/queries'
import { parseEmailRecipient } from '#client/utils/logTriggers'

/**
 * LOT Email composer. Opens under a Log entry containing "/email to <name>".
 * The first word after "to" is resolved against community members; a
 * handed-over draft (Cohort "Email", Sync reply) pre-selects the recipient.
 * Delivered mail lands in Sync.
 */
export const EmailComposer: React.FC<{ logText: string }> = ({ logText }) => {
  const queryClient = useQueryClient()
  const draft = useStore(stores.emailDraft)
  const typedName = parseEmailRecipient(logText)

  const [picked, setPicked] = React.useState<EmailRecipient | null>(null)
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')
  const [status, setStatus] = React.useState<string | null>(null)

  const lookup = picked ? '' : typedName || ''
  const { data: matches } = useEmailRecipients(lookup)

  // Recipient handed over from another surface (kept until sent) wins until the user types a new name
  React.useEffect(() => {
    if (!draft) return
    const [firstName, ...rest] = draft.name.split(' ')
    setPicked({ id: draft.id, firstName, lastName: rest.join(' ') || null })
  }, [draft])

  // A different name typed in the log drops the previous pick
  const lastTypedRef = React.useRef(typedName)
  React.useEffect(() => {
    if (typedName && typedName !== lastTypedRef.current) setPicked(null)
    lastTypedRef.current = typedName
  }, [typedName])

  const recipient =
    picked || (matches && matches.length === 1 ? matches[0] : null)

  const { mutate: send, isLoading } = useSendEmail({
    onSuccess: () => {
      setStatus('SENT — DELIVERED TO SYNC')
      setSubject('')
      setBody('')
      stores.emailDraft.set(null)
      queryClient.invalidateQueries(['/api/emails'])
    },
    onError: (err: any) => {
      setStatus(`FAILED — ${(err?.response?.data?.error || 'try again').toUpperCase()}`)
    },
  })

  const onSend = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!recipient || !body.trim()) return
    setStatus(null)
    send({ receiverId: recipient.id, subject, body })
  }

  const fullName = (r: EmailRecipient) =>
    `${r.firstName || ''} ${r.lastName || ''}`.trim()

  return (
    <div className="mt-8">
      <Block label="EMAIL:" blockView>
        <form onSubmit={onSend} className="flex flex-col gap-y-8 max-w-[700px]">
          <div className="flex items-center gap-x-8">
            <span className="opacity-40 w-[60px]">TO</span>
            {recipient ? (
              <span>{fullName(recipient)}</span>
            ) : matches && matches.length > 1 ? (
              <span className="flex flex-wrap gap-x-8">
                {matches.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className="underline opacity-60 hover:opacity-100"
                    onClick={() => setPicked(m)}
                  >
                    {fullName(m)}
                  </button>
                ))}
              </span>
            ) : (
              <span className="opacity-40">
                {typedName
                  ? matches
                    ? `NO MEMBER "${typedName.toUpperCase()}"`
                    : '...'
                  : 'type: /email to Name'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-x-8">
            <span className="opacity-40 w-[60px]">SUBJ</span>
            <Input
              type="text"
              value={subject}
              onChange={setSubject}
              placeholder="Subject"
              maxLength={200}
              containerClassName="flex-1"
            />
          </div>
          <Textarea
            value={body}
            onChange={setBody}
            placeholder="Message..."
            rows={5}
            maxLength={5000}
          />
          <div className="flex items-center gap-x-8">
            <Button
              type="submit"
              kind="secondary"
              size="small"
              disabled={!recipient || !body.trim() || isLoading}
            >
              Send
            </Button>
            {status && <span className="opacity-60">{status}</span>}
          </div>
        </form>
      </Block>
    </div>
  )
}
