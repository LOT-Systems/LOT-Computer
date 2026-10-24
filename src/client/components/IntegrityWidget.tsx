/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block } from '#client/components/ui'
import { useLogs } from '#client/queries'
import { cn } from '#client/utils'
import { intentionEngine, type IntentionSignal, analyzeIntentions, getUserState, getUserIndex, hasCurrentIntention } from '#client/stores/intentionEngine'

type IntegrityView = 'verdict' | 'fractures' | 'timeline' | 'field'

type IntegrityFracture = {
  id: string
  type: 'mood-action' | 'intention-execution' | 'energy-behavior' | 'care-claim' | 'temporal-drift' | 'signal-void'
  severity: 'minor' | 'moderate' | 'critical'
  declared: string
  observed: string
  confidence: number
  timestamp: number
}

type IntegrityVerdict = {
  score: number
  label: string
  fractures: IntegrityFracture[]
  coherenceStreak: number
  lastContradiction: number | null
}

function analyzeIntegrity(signals: IntentionSignal[]): IntegrityVerdict {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const weekMs = 7 * dayMs
  const fractures: IntegrityFracture[] = []

  const weekSignals = signals.filter(s => now - s.timestamp < weekMs)
  const daySignals = signals.filter(s => now - s.timestamp < dayMs)
  const threeDaySignals = signals.filter(s => now - s.timestamp < 3 * dayMs)

  // F1: Mood-Action Contradiction
  // Declares positive energy but no follow-through actions within 6 hours
  const positiveEnergy = ['energized', 'excited', 'hopeful', 'fulfilled']
  const actionSources: IntentionSignal['source'][] = ['planner', 'goals', 'memory', 'journal']

  const positiveMoodEvents = daySignals.filter(s =>
    s.source === 'mood' && positiveEnergy.includes(s.signal)
  )
  for (const moodEvent of positiveMoodEvents) {
    const sixHoursAfter = moodEvent.timestamp + 6 * 60 * 60 * 1000
    const actionsAfter = signals.filter(s =>
      actionSources.includes(s.source) &&
      s.timestamp > moodEvent.timestamp &&
      s.timestamp < Math.min(sixHoursAfter, now)
    )
    const windowElapsed = Math.min(now - moodEvent.timestamp, 6 * 60 * 60 * 1000)
    if (actionsAfter.length === 0 && windowElapsed > 2 * 60 * 60 * 1000) {
      const hoursElapsed = Math.round(windowElapsed / (60 * 60 * 1000))
      fractures.push({
        id: `mood-action-${moodEvent.timestamp}`,
        type: 'mood-action',
        severity: hoursElapsed >= 5 ? 'moderate' : 'minor',
        declared: `"${moodEvent.signal}" at ${new Date(moodEvent.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`,
        observed: `No action signals for ${hoursElapsed}h after. Energy declared but not deployed.`,
        confidence: Math.min(0.5 + hoursElapsed * 0.08, 0.85),
        timestamp: moodEvent.timestamp,
      })
    }
  }

  // F2: Intention-Execution Gap
  // Intention declared but no planner/goal activity for 72h+
  const hasIntention = hasCurrentIntention()
  if (hasIntention) {
    const seventyTwoHoursAgo = now - 72 * 60 * 60 * 1000
    const executionSignals = signals.filter(s =>
      (s.source === 'planner' || s.source === 'goals') && s.timestamp > seventyTwoHoursAgo
    )
    if (executionSignals.length === 0 && signals.length >= 5) {
      const intentionSignals = signals.filter(s => s.source === 'intentions')
      const latestIntention = intentionSignals.length > 0
        ? Math.max(...intentionSignals.map(s => s.timestamp))
        : now - 4 * dayMs
      const daysSinceIntention = Math.round((now - latestIntention) / dayMs)
      fractures.push({
        id: `intention-exec-${latestIntention}`,
        type: 'intention-execution',
        severity: daysSinceIntention >= 5 ? 'critical' : daysSinceIntention >= 3 ? 'moderate' : 'minor',
        declared: `Active intention set ${daysSinceIntention}d ago`,
        observed: `Zero planner or goal signals in 72h. Direction without movement.`,
        confidence: Math.min(0.55 + daysSinceIntention * 0.06, 0.90),
        timestamp: latestIntention,
      })
    }
  }

  // F3: Energy-Behavior Mismatch
  // Reports "calm" or "content" but has anxiety/overwhelm signals in same 12h window
  const conflictingPairs: [string[], string[]] = [
    ['calm', 'content', 'peaceful', 'fulfilled'],
    ['anxious', 'overwhelmed', 'exhausted'],
  ]
  const twelveHourSignals = signals.filter(s =>
    s.source === 'mood' && now - s.timestamp < 12 * 60 * 60 * 1000
  )
  const hasPositive = twelveHourSignals.some(s => conflictingPairs[0].includes(s.signal))
  const hasNegative = twelveHourSignals.some(s => conflictingPairs[1].includes(s.signal))
  if (hasPositive && hasNegative) {
    const positiveSignal = twelveHourSignals.find(s => conflictingPairs[0].includes(s.signal))!
    const negativeSignal = twelveHourSignals.find(s => conflictingPairs[1].includes(s.signal))!
    const gapMinutes = Math.abs(positiveSignal.timestamp - negativeSignal.timestamp) / 60000
    if (gapMinutes < 180) {
      fractures.push({
        id: `energy-conflict-${Math.min(positiveSignal.timestamp, negativeSignal.timestamp)}`,
        type: 'energy-behavior',
        severity: gapMinutes < 60 ? 'critical' : 'moderate',
        declared: `"${positiveSignal.signal}" and "${negativeSignal.signal}" within ${Math.round(gapMinutes)}m`,
        observed: `Contradictory biofield readings in rapid succession. One of these is noise.`,
        confidence: Math.min(0.65 + (180 - gapMinutes) / 300, 0.90),
        timestamp: Math.max(positiveSignal.timestamp, negativeSignal.timestamp),
      })
    }
  }

  // F4: Care-Claim Gap
  // Reports positive states consistently but zero self-care signals in 5+ days
  const fiveDaySignals = signals.filter(s => now - s.timestamp < 5 * dayMs)
  const fiveDaySelfCare = fiveDaySignals.filter(s => s.source === 'selfcare')
  const fiveDayPositiveMoods = fiveDaySignals.filter(s =>
    s.source === 'mood' && ['calm', 'content', 'energized', 'grateful', 'peaceful'].includes(s.signal)
  )
  if (fiveDaySelfCare.length === 0 && fiveDayPositiveMoods.length >= 3) {
    fractures.push({
      id: `care-claim-${now}`,
      type: 'care-claim',
      severity: 'moderate',
      declared: `${fiveDayPositiveMoods.length} positive mood reports in 5 days`,
      observed: `Zero self-care signals in the same window. Claiming wellness without maintenance.`,
      confidence: Math.min(0.5 + fiveDayPositiveMoods.length * 0.05, 0.80),
      timestamp: fiveDayPositiveMoods[fiveDayPositiveMoods.length - 1]?.timestamp ?? now,
    })
  }

  // F5: Temporal Drift
  // Consistent late-night activity (after 1am) followed by morning "energized" reports
  const lateNightSignals = threeDaySignals.filter(s => {
    const hour = new Date(s.timestamp).getHours()
    return hour >= 1 && hour < 5
  })
  const morningEnergized = threeDaySignals.filter(s => {
    const hour = new Date(s.timestamp).getHours()
    return s.source === 'mood' && s.signal === 'energized' && hour >= 6 && hour < 12
  })
  if (lateNightSignals.length >= 2 && morningEnergized.length >= 1) {
    fractures.push({
      id: `temporal-drift-${now}`,
      type: 'temporal-drift',
      severity: lateNightSignals.length >= 4 ? 'critical' : 'moderate',
      declared: `"Energized" in morning (${morningEnergized.length}x in 3d)`,
      observed: `${lateNightSignals.length} signals between 1-5am in same window. Circadian debt undermines claimed energy.`,
      confidence: Math.min(0.55 + lateNightSignals.length * 0.08, 0.85),
      timestamp: lateNightSignals[lateNightSignals.length - 1]?.timestamp ?? now,
    })
  }

  // F6: Signal Void
  // High engagement declared (many mood signals) but entire dimensions empty
  const weekMoodCount = weekSignals.filter(s => s.source === 'mood').length
  const coreSources: IntentionSignal['source'][] = ['memory', 'planner', 'journal', 'selfcare', 'goals']
  const activeSources = coreSources.filter(src => weekSignals.some(s => s.source === src))
  const voidSources = coreSources.filter(src => !weekSignals.some(s => s.source === src))
  if (weekMoodCount >= 5 && voidSources.length >= 3) {
    fractures.push({
      id: `signal-void-${now}`,
      type: 'signal-void',
      severity: voidSources.length >= 4 ? 'critical' : 'moderate',
      declared: `${weekMoodCount} mood check-ins this week`,
      observed: `${voidSources.length} core dimensions silent: ${voidSources.join(', ')}. Monitoring without acting.`,
      confidence: Math.min(0.55 + (voidSources.length - 2) * 0.10, 0.85),
      timestamp: now,
    })
  }

  // Deduplicate by type — keep highest confidence per type
  const uniqueFractures: IntegrityFracture[] = []
  const seenTypes = new Set<string>()
  const sorted = [...fractures].sort((a, b) => b.confidence - a.confidence)
  for (const f of sorted) {
    if (!seenTypes.has(f.type)) {
      seenTypes.add(f.type)
      uniqueFractures.push(f)
    }
  }

  // Compute integrity score (100 = fully coherent, 0 = total contradiction)
  let score = 100
  for (const f of uniqueFractures) {
    const penalty = f.severity === 'critical' ? 20 : f.severity === 'moderate' ? 12 : 5
    score -= Math.round(penalty * f.confidence)
  }
  score = Math.max(0, Math.min(100, score))

  // Compute coherence streak (days since last fracture)
  const lastContradiction = uniqueFractures.length > 0
    ? Math.max(...uniqueFractures.map(f => f.timestamp))
    : null
  const coherenceStreak = lastContradiction
    ? 0
    : Math.floor((now - Math.max(...signals.map(s => s.timestamp), now - weekMs)) / dayMs)

  const label =
    score >= 90 ? 'Coherent' :
    score >= 75 ? 'Aligned' :
    score >= 55 ? 'Fractured' :
    score >= 35 ? 'Contradictory' :
    'Deceptive'

  return { score, label, fractures: uniqueFractures, coherenceStreak, lastContradiction }
}

export function IntegrityWidget() {
  const [view, setView] = React.useState<IntegrityView>('verdict')
  const { data: logs = [] } = useLogs()

  const integrity = React.useMemo(() => {
    const state = intentionEngine.get()
    return analyzeIntegrity(state.signals)
  }, [logs])

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'verdict': return 'fractures'
        case 'fractures': return 'timeline'
        case 'timeline': return 'field'
        case 'field': return 'verdict'
        default: return 'verdict'
      }
    })
  }

  const label =
    view === 'verdict' ? 'Integrity:' :
    view === 'fractures' ? 'Fractures:' :
    view === 'timeline' ? 'Timeline:' :
    'Field:'

  const severityIndicator = (severity: IntegrityFracture['severity']) =>
    severity === 'critical' ? '▓' :
    severity === 'moderate' ? '▒' :
    '░'

  return (
    <Block
      label={label}
      blockView
      onLabelClick={cycleView}
    >
      {view === 'verdict' && (
        <div>
          <div className="mb-8 flex items-center justify-between">
            <span className="text-lg font-medium">{integrity.score}</span>
            <span className={cn(
              integrity.score >= 75 ? 'opacity-60' : 'opacity-100'
            )}>
              {integrity.label}
            </span>
          </div>
          <div className="mb-8">
            <div className="flex gap-[2px]">
              {Array.from({ length: 20 }, (_, i) => {
                const filled = i < Math.round(integrity.score / 5)
                return (
                  <div
                    key={i}
                    className={cn(
                      'h-[6px] flex-1 transition-all duration-500',
                      filled
                        ? integrity.score >= 75 ? 'bg-current opacity-40'
                          : integrity.score >= 55 ? 'bg-current opacity-50'
                          : 'bg-current opacity-70'
                        : 'bg-current opacity-10'
                    )}
                  />
                )
              })}
            </div>
          </div>
          {integrity.fractures.length === 0 ? (
            <div className="opacity-60">
              → No contradictions detected. Signal field coherent.
            </div>
          ) : (
            <div>
              <div className="mb-4">
                {integrity.fractures.length} fracture{integrity.fractures.length !== 1 ? 's' : ''} detected
              </div>
              {integrity.fractures.slice(0, 2).map(f => (
                <div key={f.id} className="mb-4 opacity-70">
                  {severityIndicator(f.severity)} {f.type.replace(/-/g, ' ')}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'fractures' && (
        <div>
          {integrity.fractures.length === 0 ? (
            <div>→ Signal field clean. No integrity fractures.</div>
          ) : (
            <div className="flex flex-col gap-12">
              {integrity.fractures.map(f => (
                <div key={f.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {severityIndicator(f.severity)} {f.type.replace(/-/g, ' ')}
                    </span>
                    <span className="opacity-50 text-sm">
                      {Math.round(f.confidence * 100)}%
                    </span>
                  </div>
                  <div className="opacity-70 mb-1">
                    Declared: {f.declared}
                  </div>
                  <div className="opacity-50">
                    Observed: {f.observed}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'timeline' && (
        <div>
          {(() => {
            const state = intentionEngine.get()
            const signals = state.signals
            const now = Date.now()
            const dayMs = 24 * 60 * 60 * 1000

            const last7Days = Array.from({ length: 7 }, (_, i) => {
              const date = new Date(now - i * dayMs)
              return date.toISOString().split('T')[0]
            }).reverse()

            return (
              <div className="flex flex-col gap-4">
                {last7Days.map((date, idx) => {
                  const dayStart = new Date(date).getTime()
                  const dayEnd = dayStart + dayMs
                  const daySignals = signals.filter(s =>
                    s.timestamp >= dayStart && s.timestamp < dayEnd
                  )
                  const moodSignals = daySignals.filter(s => s.source === 'mood')
                  const actionSignals = daySignals.filter(s =>
                    ['planner', 'goals', 'selfcare', 'journal', 'memory'].includes(s.source)
                  )

                  const dateObj = new Date(date)
                  const dayLabel = idx === 6 ? 'Today' :
                    idx === 5 ? 'Yday' :
                    dateObj.toLocaleDateString('en-US', { weekday: 'short' })

                  const moodBar = Math.min(moodSignals.length, 5)
                  const actionBar = Math.min(actionSignals.length, 5)
                  const ratio = moodSignals.length > 0 && actionSignals.length === 0
                    ? '!'
                    : actionSignals.length > 0 && moodSignals.length === 0
                      ? '?'
                      : '·'

                  return (
                    <div key={date} className="flex items-center gap-8">
                      <span className="w-[40px]">{dayLabel}</span>
                      <span className="w-[60px] opacity-60">
                        {'█'.repeat(moodBar)}{'░'.repeat(5 - moodBar)}
                      </span>
                      <span className="w-[12px] text-center">
                        {ratio}
                      </span>
                      <span className="w-[60px] opacity-60">
                        {'█'.repeat(actionBar)}{'░'.repeat(5 - actionBar)}
                      </span>
                      <span className="opacity-40 text-sm">
                        {daySignals.length}
                      </span>
                    </div>
                  )
                })}
                <div className="opacity-40 mt-4 text-sm">
                  mood ← · → action | ! = declare only | ? = act only
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {view === 'field' && (
        <div>
          {(() => {
            const state = intentionEngine.get()
            const userState = getUserState()
            const userIndex = getUserIndex()
            const patterns = state.recognizedPatterns

            const contradictionPatterns = patterns.filter(p =>
              ['intention-decay', 'ungrounded-activity', 'cleanness-neglect',
               'signal-silence', 'signal-drought', 'calendar-gap',
               'circadian-drift', 'surface-awareness'].includes(p.pattern)
            )
            const coherencePatterns = patterns.filter(p =>
              ['intention-follow-through', 'care-momentum', 'biofield-recovery-arc',
               'full-coherence', 'deep-work-cascade', 'biofield-coherence-cascade',
               'temporal-coherence-window'].includes(p.pattern)
            )

            return (
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <span>Energy</span>
                  <span className="capitalize opacity-70">{userState.energy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Clarity</span>
                  <span className="capitalize opacity-70">{userState.clarity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Alignment</span>
                  <span className="capitalize opacity-70">{userState.alignment}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Index</span>
                  <span className="opacity-70">{userIndex.overall}/100 {userIndex.trend === 'rising' ? '↑' : userIndex.trend === 'declining' ? '↓' : '·'}</span>
                </div>
                {contradictionPatterns.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-4 opacity-50">Contradiction signals:</div>
                    {contradictionPatterns.map(p => (
                      <div key={p.pattern} className="opacity-60 mb-2">
                        ▒ {p.pattern.replace(/-/g, ' ')} ({Math.round(p.confidence * 100)}%)
                      </div>
                    ))}
                  </div>
                )}
                {coherencePatterns.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-4 opacity-50">Coherence signals:</div>
                    {coherencePatterns.map(p => (
                      <div key={p.pattern} className="opacity-60 mb-2">
                        ◆ {p.pattern.replace(/-/g, ' ')} ({Math.round(p.confidence * 100)}%)
                      </div>
                    ))}
                  </div>
                )}
                {contradictionPatterns.length === 0 && coherencePatterns.length === 0 && (
                  <div className="opacity-50 mt-4">
                    → Insufficient signal data for field analysis. Keep logging.
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </Block>
  )
}
