/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { Block } from '#client/components/ui'
import { useLogs } from '#client/queries'
import { getUserState, getUserIndex } from '#client/stores/intentionEngine'
import dayjs from '#client/utils/dayjs'

type BenchmarkTier = 'White' | 'Green' | 'Yellow' | 'Purple' | 'Black'

const TIER_COLORS: Record<BenchmarkTier, string> = {
  White: '#ffffff',
  Green: '#4ade80',
  Yellow: '#facc15',
  Purple: '#a855f7',
  Black: '#000000',
}

function computeBenchmark(logs: any[]): { tier: BenchmarkTier; score: number } {
  const now = dayjs()
  const answerLogs = logs.filter(l => l.event === 'answer')
  const noteLogs = logs.filter(l => l.event === 'note')
  const allJournal = [...answerLogs, ...noteLogs]

  const answerCount = answerLogs.length
  const noteCount = noteLogs.length
  const totalEntries = allJournal.length

  let daysSinceStart = 0
  if (allJournal.length > 0) {
    const sorted = [...allJournal].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    daysSinceStart = now.diff(dayjs(sorted[0].createdAt), 'day')
  }

  const uniqueDays = new Set(
    allJournal.map(l => dayjs(l.createdAt).format('YYYY-MM-DD'))
  )
  const activeDays = uniqueDays.size

  let streak = 0
  let d = now.startOf('day')
  if (!uniqueDays.has(d.format('YYYY-MM-DD'))) d = d.subtract(1, 'day')
  while (uniqueDays.has(d.format('YYYY-MM-DD'))) {
    streak++
    d = d.subtract(1, 'day')
  }

  let userIndex = 0
  try {
    const idx = getUserIndex()
    if (idx && typeof idx.overall === 'number') userIndex = idx.overall
  } catch (_) {}

  let stateScore = 0
  try {
    const state = getUserState()
    if (state) {
      const energyMap: Record<string, number> = { depleted: 0, low: 1, moderate: 2, high: 3 }
      const clarityMap: Record<string, number> = { confused: 0, uncertain: 1, clear: 2, focused: 3 }
      stateScore = ((energyMap[state.energy] || 0) + (clarityMap[state.clarity] || 0)) / 6 * 100
    }
  } catch (_) {}

  const journalDepth = Math.min(100, (totalEntries / 200) * 100)
  const tenureScore = Math.min(100, (daysSinceStart / 120) * 100)
  const streakScore = Math.min(100, (streak / 30) * 100)
  const consistencyScore = daysSinceStart > 0
    ? Math.min(100, (activeDays / daysSinceStart) * 100)
    : 0

  const score = Math.round(
    journalDepth * 0.30 +
    tenureScore * 0.15 +
    streakScore * 0.20 +
    consistencyScore * 0.15 +
    userIndex * 0.10 +
    stateScore * 0.10
  )

  let tier: BenchmarkTier
  if (score >= 80) tier = 'Black'
  else if (score >= 60) tier = 'Purple'
  else if (score >= 40) tier = 'Yellow'
  else if (score >= 20) tier = 'Green'
  else tier = 'White'

  return { tier, score }
}

export function BenchmarkWidget() {
  const { data: logs = [] } = useLogs()

  const { tier, score } = React.useMemo(() => computeBenchmark(logs), [logs])

  const color = TIER_COLORS[tier]
  const isBlack = tier === 'Black'
  const isWhite = tier === 'White'

  return (
    <Block label="Benchmark:">
      <span className="flex items-center gap-8">
        <span
          className="inline-block w-[10px] h-[10px] rounded-full shrink-0"
          style={{
            backgroundColor: color,
            border: isWhite || isBlack ? '1px solid var(--acc-color, currentColor)' : 'none',
            opacity: isWhite ? 0.4 : 1,
          }}
        />
        <span className="text-acc/90">{tier}</span>
      </span>
    </Block>
  )
}
