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
import {
  USERSHIP_TOTAL_MONTHS,
  buildMonthStrip,
  countMonthsUnlocked,
  getUsershipChapter,
  getUsershipMonth,
  usershipMonthFromDays,
  type UsershipMonthGrade,
} from '#shared/constants/usership-journey'

// Month stages, glyphs and messages live in the shared Usership Journey config.
// Spec: docs/technical/LOT-USERSHIP-12-MONTH-EVOLUTION.md

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

  // Usership month is 1-based from Day 1 (30-day anniversary windows):
  // Day 0–29 = Month 1, so a new member is greeted on their first day.
  const monthNumber = React.useMemo(() => {
    if (!user?.joinedAt) return 0
    const days = dayjs().diff(dayjs(user.joinedAt), 'day')
    return usershipMonthFromDays(days)
  }, [user?.joinedAt])

  // P0: calendar approximation — completed months count as unlocked, the
  // current month is open. P1 replaces this with evidence-gated grades from
  // the server (journal, answers, morning check-ins, self-care).
  const grades = React.useMemo<UsershipMonthGrade[]>(() => {
    return Array.from({ length: USERSHIP_TOTAL_MONTHS }, (_, i) => {
      const m = i + 1
      if (m < monthNumber) return 'unlocked'
      if (m === monthNumber) return 'open'
      return 'locked'
    })
  }, [monthNumber])

  const [view, setView] = React.useState<'month' | 'unlocked'>('month')
  const cycleView = React.useCallback(() => {
    setView((prev) => (prev === 'month' ? 'unlocked' : 'month'))
  }, [])

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

  const capped = Math.min(monthNumber, USERSHIP_TOTAL_MONTHS)
  const monthDef = getUsershipMonth(capped)
  const chapter = getUsershipChapter(capped)
  const message = monthNumber > USERSHIP_TOTAL_MONTHS
    ? `Month ${monthNumber}. The journey continues.`
    : monthDef?.message ?? `Month ${monthNumber}. The journey continues.`
  const label = view === 'month' ? `Month ${capped}:` : 'Unlocked:'
  const unlockedCount = countMonthsUnlocked(grades)

  return (
    <div
      className={cn(
        'transition-opacity duration-[1400ms]',
        isFading ? 'opacity-0' : 'opacity-100'
      )}
    >
      <Block label={label} blockView onLabelClick={cycleView}>
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
              {view === 'month' ? (
                <>
                  <div>{message}</div>
                  {monthDef && (
                    <div className="opacity-60 mt-4 text-sm">
                      {monthDef.glyph} {monthDef.name}
                      {chapter && ` · Chapter ${chapter.chapter}: ${chapter.title}`}
                    </div>
                  )}
                  <div className="opacity-30 mt-4 text-sm">
                    {capped} / {USERSHIP_TOTAL_MONTHS} months
                  </div>
                </>
              ) : (
                <>
                  <div className="whitespace-pre-wrap">{buildMonthStrip(grades)}</div>
                  <div className="opacity-60 mt-4 text-sm">
                    Months unlocked: {unlockedCount}/{USERSHIP_TOTAL_MONTHS}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </Block>
    </div>
  )
}
