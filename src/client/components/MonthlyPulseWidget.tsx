/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import { me } from '#client/stores'
import { Block } from '#client/components/ui'
import { cn } from '#client/utils'
import { UserTag } from '#shared/types'
import dayjs from '#client/utils/dayjs'

// One message per milestone month; everything in between gets the generic line.
const MONTH_MESSAGES: Record<number, string> = {
  1:  'The first month. The system is beginning to know you.',
  2:  'Two months in. Patterns are starting to form.',
  3:  'Three months. You have reached Active User status.',
  4:  'Four months. The portrait deepens.',
  5:  'Five months. Consistency is its own reward.',
  6:  'Six months. The journey is half-declared.',
  7:  'Seven months in. The system has been listening.',
  8:  'Eight months. Rare air.',
  9:  'Nine months. The self-care practice is a habit now.',
  10: 'Ten months. Almost there.',
  11: 'Eleven months. One more.',
  12: 'One year with LOT. The portrait is complete — and still evolving.',
}

const DISMISS_PHRASES = [
  'Onward.',
  'Noted.',
  'Acknowledged.',
  'Continuing.',
  'The next month begins.',
  'The system remembers.',
]

// localStorage key scoped to user — one entry per user per calendar month
const storageKey = (userId: string) => `lot_pulse_${userId}`

function shouldShowPulse(userId: string, monthNumber: number): boolean {
  if (monthNumber < 1) return false
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return true
    const { dismissedMonth } = JSON.parse(raw) as { dismissedMonth: number }
    return dismissedMonth !== monthNumber
  } catch {
    return true
  }
}

function markDismissed(userId: string, monthNumber: number) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify({ dismissedMonth: monthNumber }))
  } catch {}
}

export const MonthlyPulseWidget: React.FC = () => {
  const user = useStore(me)

  const isUsership = React.useMemo(() => {
    if (!user) return false
    return user.tags.some(
      (t) => t.toLowerCase() === UserTag.Usership.toLowerCase()
    )
  }, [user])

  const monthNumber = React.useMemo(() => {
    if (!user?.joinedAt) return 0
    const joined = dayjs(user.joinedAt)
    const now = dayjs()
    const months = now.diff(joined, 'month')
    return Math.max(0, months)
  }, [user?.joinedAt])

  const [visible, setVisible] = React.useState(false)
  const [isShown, setIsShown] = React.useState(false)
  const [isFading, setIsFading] = React.useState(false)
  const [dismissed, setDismissed] = React.useState(false)
  const [dismissPhrase, setDismissPhrase] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!user?.id || !isUsership || monthNumber < 1) return
    if (!shouldShowPulse(user.id, monthNumber)) return
    setVisible(true)
    setTimeout(() => setIsShown(true), 100)
  }, [user?.id, isUsership, monthNumber])

  const handleDismiss = React.useCallback(() => {
    if (dismissed || !user?.id) return
    setDismissed(true)
    markDismissed(user.id, monthNumber)
    const phrase = DISMISS_PHRASES[Math.floor(Math.random() * DISMISS_PHRASES.length)]
    setDismissPhrase(phrase)
    setTimeout(() => setIsFading(true), 2000)
    setTimeout(() => setVisible(false), 3400)
  }, [dismissed, user?.id, monthNumber])

  if (!visible) return null

  const message = MONTH_MESSAGES[Math.min(monthNumber, 12)] ??
    `Month ${monthNumber}. The journey continues.`
  const capped = Math.min(monthNumber, 12)
  const label = `Month ${capped}:`

  return (
    <div
      className={cn(
        'transition-opacity duration-[1400ms]',
        isFading ? 'opacity-0' : 'opacity-100'
      )}
    >
      <Block label={label} blockView>
        <div
          onClick={handleDismiss}
          className="cursor-pointer select-none"
        >
          {dismissPhrase ? (
            <div>{dismissPhrase}</div>
          ) : (
            <div
              className={cn(
                'opacity-0 transition-opacity duration-[1400ms]',
                isShown && 'opacity-100'
              )}
            >
              <div>{message}</div>
              <div className="opacity-30 mt-4 text-sm">
                {capped} / 12 months
              </div>
            </div>
          )}
        </div>
      </Block>
    </div>
  )
}
