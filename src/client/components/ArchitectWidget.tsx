/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { Block } from '#client/components/ui'
import { ProgressBars } from '#client/utils/progressBars'
import {
  selfAssembly,
  phaseSymbol,
  phaseLabel,
  type AssemblyPhase,
} from '#client/stores/selfAssembly'
import { intentionEngine } from '#client/stores/intentionEngine'
import { USERSHIP_TRANSMISSION } from '#client/components/SystemProgressWidget'
import { UserTag } from '#shared/types'

const PHASE_ORDER: AssemblyPhase[] = ['integrated', 'assembled', 'forming', 'awakening', 'dormant']

function phaseRank(phase: AssemblyPhase): number {
  return PHASE_ORDER.indexOf(phase)
}

function coherenceLabel(c: number): string {
  if (c >= 80) return 'locked'
  if (c >= 60) return 'stable'
  if (c >= 40) return 'forming'
  if (c >= 20) return 'variable'
  return 'sparse'
}

function signalAge(ts: number | null): string {
  if (!ts) return '—'
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

export function ArchitectWidget() {
  const me = useStore(stores.me)
  const assembly = useStore(selfAssembly)
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())

  const isPaid = React.useMemo(() => {
    if (!me?.tags) return false
    return me.tags.some((tag: string) =>
      tag.toLowerCase() === UserTag.Usership.toLowerCase() ||
      tag.toLowerCase() === UserTag.RND.toLowerCase()
    )
  }, [me])

  const signalCounts = React.useMemo(() => {
    try {
      const signals = intentionEngine.get().signals || []
      const now = Date.now()
      const week = 7 * 24 * 60 * 60 * 1000
      const day = 24 * 60 * 60 * 1000
      const s7d = signals.filter(s => now - s.timestamp < week)
      const s24h = signals.filter(s => now - s.timestamp < day)
      const counts: Record<string, number> = {}
      s7d.forEach(s => { counts[s.source] = (counts[s.source] || 0) + 1 })
      return {
        total7d: s7d.length,
        total24h: s24h.length,
        sources: Object.entries(counts).sort(([, a], [, b]) => b - a),
      }
    } catch {
      return { total7d: 0, total24h: 0, sources: [] }
    }
  }, [assembly.lastComputed])

  const sortedModules = React.useMemo(() =>
    [...assembly.modules].sort((a, b) => {
      const phaseD = phaseRank(a.phase) - phaseRank(b.phase)
      if (phaseD !== 0) return phaseD
      return b.density - a.density
    }),
    [assembly.modules]
  )

  const phaseCounts = React.useMemo(() => ({
    integrated: assembly.modules.filter(m => m.phase === 'integrated').length,
    assembled: assembly.modules.filter(m => m.phase === 'assembled').length,
    forming: assembly.modules.filter(m => m.phase === 'forming').length,
    awakening: assembly.modules.filter(m => m.phase === 'awakening').length,
    dormant: assembly.modules.filter(m => m.phase === 'dormant').length,
  }), [assembly.modules])

  const toggleModule = React.useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  if (!isPaid) return null

  const getPhaseColor = (phase: AssemblyPhase): string => {
    switch (phase) {
      case 'integrated': return 'text-acc'
      case 'assembled': return ''
      case 'forming': return 'opacity-70'
      case 'awakening': return 'opacity-50'
      case 'dormant': return 'opacity-20'
    }
  }

  return (
    <Block label="Architect:" blockView>
      <div className="flex flex-col gap-y-16">

        {/* Brand header */}
        <div>
          <div className="flex justify-between items-baseline mb-8">
            <span>LOT® Self-Assembly™</span>
            <span className="opacity-30 tabular-nums">v{assembly.totalModules}.{assembly.assembledCount}</span>
          </div>
          <div className="opacity-30">
            Living software that builds itself from use. Each module assembles when your signal pattern reaches threshold. No synthetic data. No fake progress. Real assembly from real use.
          </div>
        </div>

        {/* System overview */}
        <div>
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">System Phase</span>
            <span>{phaseSymbol(assembly.phase)} {phaseLabel(assembly.phase)}</span>
          </div>
          <div className="flex items-center gap-8 mb-8">
            <ProgressBars percentage={assembly.overallAssembly} barCount={17} />
            <span className="tabular-nums">{assembly.overallAssembly}%</span>
          </div>
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Modules</span>
            <span className="tabular-nums">
              {assembly.assembledCount}/{assembly.totalModules} online
            </span>
          </div>
          <div className="flex justify-between items-baseline mb-8">
            <span className="opacity-30">Signals 24h</span>
            <span className="tabular-nums">{signalCounts.total24h}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="opacity-30">Signals 7d</span>
            <span className="tabular-nums">{signalCounts.total7d}</span>
          </div>
        </div>

        {/* Phase distribution */}
        <div className="border-t border-acc-400/30 pt-16">
          <div className="opacity-30 mb-8">Phase distribution:</div>
          <div className="flex flex-col gap-y-4">
            {phaseCounts.integrated > 0 && (
              <div className="flex justify-between">
                <span className="text-acc">{'◉'} Integrated</span>
                <span className="tabular-nums">{phaseCounts.integrated}</span>
              </div>
            )}
            {phaseCounts.assembled > 0 && (
              <div className="flex justify-between">
                <span>{'◯'} Assembled</span>
                <span className="tabular-nums">{phaseCounts.assembled}</span>
              </div>
            )}
            {phaseCounts.forming > 0 && (
              <div className="flex justify-between">
                <span className="opacity-70">{'○'} Forming</span>
                <span className="tabular-nums">{phaseCounts.forming}</span>
              </div>
            )}
            {phaseCounts.awakening > 0 && (
              <div className="flex justify-between">
                <span className="opacity-50">{'∘'} Awakening</span>
                <span className="tabular-nums">{phaseCounts.awakening}</span>
              </div>
            )}
            {phaseCounts.dormant > 0 && (
              <div className="flex justify-between">
                <span className="opacity-20">{'·'} Dormant</span>
                <span className="tabular-nums">{phaseCounts.dormant}</span>
              </div>
            )}
          </div>
        </div>

        {/* Module telemetry — expandable rows */}
        <div className="border-t border-acc-400/30 pt-16">
          <div className="opacity-30 mb-8">Module telemetry:</div>
          <div className="flex flex-col gap-y-8">
            {sortedModules.map(module => {
              const isExpanded = expanded.has(module.id)
              return (
                <div key={module.id}>
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full text-left"
                  >
                    <div className="flex justify-between items-baseline">
                      <span className={getPhaseColor(module.phase)}>
                        {phaseSymbol(module.phase)} {module.label}
                      </span>
                      <span className="tabular-nums opacity-30">
                        {module.density > 0 ? `${module.density}%` : '—'}
                      </span>
                    </div>
                    {module.phase !== 'dormant' && (
                      <div className="flex items-center gap-8 mt-4">
                        <ProgressBars percentage={module.density} barCount={10} />
                        <span className="opacity-20 tabular-nums">
                          {signalAge(module.lastSignal)}
                        </span>
                      </div>
                    )}
                  </button>

                  {isExpanded && module.phase !== 'dormant' && (
                    <div className="pl-16 mt-8 flex flex-col gap-y-4 border-l border-acc-400/10">
                      <div className="flex justify-between">
                        <span className="opacity-30">Signals</span>
                        <span className="tabular-nums">{module.signalCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-30">Coherence</span>
                        <span className="tabular-nums">
                          {module.coherence}% <span className="opacity-30">{coherenceLabel(module.coherence)}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-30">First signal</span>
                        <span className="tabular-nums">{signalAge(module.firstSignal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-30">Last signal</span>
                        <span className="tabular-nums">{signalAge(module.lastSignal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-30">Phase</span>
                        <span>{phaseLabel(module.phase)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Signal source breakdown */}
        {signalCounts.sources.length > 0 && (
          <div className="border-t border-acc-400/30 pt-16">
            <div className="opacity-30 mb-8">Signal sources · 7d:</div>
            <div className="flex flex-col gap-y-4">
              {signalCounts.sources.map(([source, count]) => (
                <div key={source} className="flex justify-between">
                  <span className="opacity-50 capitalize">{source}</span>
                  <span className="tabular-nums">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Narrative */}
        <div className="opacity-30">
          {assembly.narrative}
        </div>

        {/* Assembly Transmission Run */}
        <div className="border-t border-acc-400/30 pt-16 text-xs leading-relaxed">
          <div className="opacity-30 mb-4 uppercase tracking-widest">Transmission:</div>
          <div className="flex flex-col gap-y-1">
            {USERSHIP_TRANSMISSION.message.map((line, i) => (
              <div key={i} className={i === 0 ? 'opacity-50' : 'opacity-30'}>
                {line}
              </div>
            ))}
          </div>
        </div>

      </div>
    </Block>
  )
}
