/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { selfAssembly } from './selfAssembly'
import { chakraErgonomics } from './chakraErgonomics'

type RewardWidgetId = 'micro_game' | 'micro_image' | 'cosmic_update' | 'planner'

type RewardRecord = {
  lastShown: number
  milestone: string
}

const STORAGE_KEY = 'reward-widgets'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function loadRecords(): Record<string, RewardRecord> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveRecords(records: Record<string, RewardRecord>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch { /* non-critical */ }
}

function getCurrentMilestone(): { reached: boolean; label: string } {
  const assembly = selfAssembly.get()
  const assembledCount = assembly.modules.filter(
    m => m.phase === 'assembled' || m.phase === 'integrated'
  ).length

  let chakraBalance = 0
  try {
    const chakra = chakraErgonomics.get()
    if (chakra?.chakras) {
      const balanced = chakra.chakras.filter(
        c => c.status === 'balanced' || c.status === 'open' || c.status === 'flowing' || c.status === 'grounded'
      ).length
      chakraBalance = balanced
    }
  } catch { /* chakra store may not be initialized */ }

  if (assembledCount >= 3 || chakraBalance >= 3 || assembly.overallAssembly >= 20) {
    return {
      reached: true,
      label: `assembly:${assembledCount}/chakra:${chakraBalance}/progress:${assembly.overallAssembly}`,
    }
  }

  if (assembly.modules.some(m => m.phase === 'awakening' || m.phase === 'forming')) {
    return {
      reached: true,
      label: `early:${assembly.phase}`,
    }
  }

  return { reached: false, label: 'none' }
}

export function shouldShowRewardWidget(widgetId: RewardWidgetId): boolean {
  const records = loadRecords()
  const record = records[widgetId]
  const now = Date.now()

  if (record && (now - record.lastShown) < WEEK_MS) {
    return false
  }

  const milestone = getCurrentMilestone()
  if (!milestone.reached) return false

  records[widgetId] = { lastShown: now, milestone: milestone.label }
  saveRecords(records)
  return true
}

export function markRewardWidgetShown(widgetId: RewardWidgetId) {
  const records = loadRecords()
  const milestone = getCurrentMilestone()
  records[widgetId] = { lastShown: Date.now(), milestone: milestone.label }
  saveRecords(records)
}

export function getRewardWidgetStatus(widgetId: RewardWidgetId): {
  eligible: boolean
  lastShown: number | null
  nextEligible: number | null
} {
  const records = loadRecords()
  const record = records[widgetId]
  const now = Date.now()

  if (!record) {
    return { eligible: getCurrentMilestone().reached, lastShown: null, nextEligible: null }
  }

  const nextEligible = record.lastShown + WEEK_MS
  return {
    eligible: now >= nextEligible && getCurrentMilestone().reached,
    lastShown: record.lastShown,
    nextEligible,
  }
}
