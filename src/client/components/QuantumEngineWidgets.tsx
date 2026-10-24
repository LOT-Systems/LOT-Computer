/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import * as React from 'react'
import { useStore } from '@nanostores/react'
import { Block, Button } from '#client/components/ui'
import {
  recordSignal,
  intentionEngine,
  getPhysiologicalReport,
  getUserState,
  getUserIndex,
  getWidgetDependencies,
  classifyPhysiologicalCohort,
  getQuantumOS,
  getCircadianPhase,
} from '#client/stores/intentionEngine'
import { getEcosystemNarrative } from '#client/utils/narrative'
import { useEnergy } from '#client/queries'
import { selfAssembly, phaseSymbol, phaseLabel, recomputeAssembly } from '#client/stores/selfAssembly'

function usePersistedState(key: string): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
  const [value, setValue] = React.useState(() => {
    try { return localStorage.getItem(key) === 'true' } catch { return false }
  })
  const setPersistedValue: React.Dispatch<React.SetStateAction<boolean>> = React.useCallback((action) => {
    setValue(prev => {
      const next = typeof action === 'function' ? action(prev) : action
      try { localStorage.setItem(key, String(next)) } catch {}
      return next
    })
  }, [key])
  return [value, setPersistedValue]
}

const TOTAL_DEVICES = 6

type QOSView = 'ecosystem' | 'biofield' | 'cohort' | 'index' | 'assembly' | 'qos-mode' | 'qos-field'

const PATTERN_DISPLAY: Record<string, string> = {
  'intent-to-action-gap':        'INTENT GAP',
  'recovery-initiation':         'RECOV INIT',
  'cognitive-vitality-sync':     'COG-VIT SYNC',
  'action-completion-arc':       'COMP ARC',
  'biological-restoration-peak': 'BIOL RESTORE',
  'centennial-convergence':      'CENTENNIAL',
  'physiological-depletion':     'PHYS DEPLETE',
  'biofield-recovery-arc':       'BIOFIELD ARC',
  'signal-drought':              'SIG DROUGHT',
  'circadian-drift':             'CIRC DRIFT',
  'multimodal-peak':             'MULTI PEAK',
  'meridian-lock':               'MERIDIAN',
  'flow-state':                  'FLOW STATE',
  'recovery-plateau':            'RECOV PLATEAU',
  'morning-launch-sequence':     'MORNING LAUNCH',
  'evening-coherence-close':     'EVE CLOSE',
  'signal-momentum-lock':        'MOM LOCK',
  'cognitive-depth-arc':         'COG DEPTH',
  'longitudinal-drift':          'LONG DRIFT',
  'systemic-readiness-peak':     'SYS READY',
  'daily-rhythm-lock':           'RHYTHM LOCK',
  'cross-domain-mastery':        'CROSS DOMAIN',
  'quantum-presence-arc':        'QPRES ARC',
  'planner-intention-sync':      'PLAN-INTENT',
  'resilience-cascade':          'RES CASCADE',
  'vitality-cascade':            'VIT CASCADE',
  'social-presence-arc':         'SOC PRES',
  'clarity-momentum-peak':       'CLAR PEAK',
  'temporal-alignment-peak':     'TALIGN PEAK',
  'creative-output-peak':        'CROUT PEAK',
  'full-system-coherence':       'FSCOHERE',
  'embodied-cognition-arc':      'EMBCOG ARC',
  'intention-completion-loop':   'INTCMP LOOP',
  'community-intelligence-peak': 'COMINTEL',
  'personal-peak-window':        'PPEAK WIN',
  'recovery-momentum':           'RMOM',
  'signal-inception':            'INCEP',
  'focus-depth-arc':             'FDEP ARC',
  'sleep-signal-anchor':         'SANCH',
  'care-intelligence-loop':      'CINTEL',
  'morning-coherence-arc':          'MCOHERE',
  'signal-density-peak':            'SIGPEAK',
  'physiological-coherence-window': 'PCOHERE',
  'action-to-memory-loop':          'ACTMEM',
  'sustained-resilience-arc':       'RECARC',
  'mood-energy-convergence':        'MOEARC',
  'evening-reflection-loop':        'EVEFL',
  'weekly-rhythm-anchor':           'WEEKA',
  'depth-breadth-convergence':      'DEPBR',
  'morning-intention-lock':         'MINTLK',
  'multi-day-care-arc':             'MARC',
  'cognitive-output-continuity':    'COGCONT',
  'daily-coherence-seal':           'DCSAL',
  'quantum-rhythm-lock':            'QLOCK',
  'biofield-integration-peak':      'BFINT',
  'quantum-coherence-peak':         'QCOHERE',
  'signal-matrix-saturation':       'SIGMAT',
  'temporal-biofield-sync':         'TBIOF',
  'circadian-signal-lock':            'CIRC-LK',
  'dimensional-saturation':           'DIMSAT',
  'quantum-identity-crystallization': 'QIDCRYST',
  'signal-coherence-cascade':         'SIGCASC',
  'quantum-presence-field':           'QPFIELD',
  'identity-momentum-lock':           'IDLOCK',
  'quantum-presence-crystallization': 'QPCRYST',
  'total-field-coherence':            'TOTCOH',
  'recovery-intelligence-arc':        'RECINTEL',
}

type QOSOperatingMode = 'maintenance' | 'recovery' | 'growth' | 'peak'

function computeQOSMode(
  energy: string,
  patterns: { pattern: string }[],
  assemblyPct: number
): { mode: QOSOperatingMode; pressure: 'low' | 'moderate' | 'high' | 'critical'; directive: string } {
  const activePatternNames = new Set(patterns.map(p => p.pattern))
  const isDepletion = energy === 'depleted' ||
    activePatternNames.has('physiological-depletion') ||
    activePatternNames.has('recovery-plateau')
  const isRecovery = energy === 'low' ||
    activePatternNames.has('biofield-recovery-arc') ||
    activePatternNames.has('recovery-window')
  const isPeak = energy === 'high' &&
    (activePatternNames.has('multimodal-peak') || activePatternNames.has('meridian-lock') || activePatternNames.has('flow-state'))
  const isGrowth = energy === 'moderate' || energy === 'high'

  let mode: QOSOperatingMode
  if (isDepletion) mode = 'recovery'
  else if (isPeak) mode = 'peak'
  else if (isGrowth) mode = 'growth'
  else mode = 'maintenance'

  const criticalPatterns = ['physiological-depletion', 'sleep-debt-accumulation', 'recovery-plateau']
  const highPatterns = ['signal-drought', 'circadian-drift', 'evening-overwhelm']
  const hasCritical = criticalPatterns.some(p => activePatternNames.has(p))
  const hasHigh = highPatterns.some(p => activePatternNames.has(p))
  const pressure: 'low' | 'moderate' | 'high' | 'critical' =
    hasCritical ? 'critical' : hasHigh ? 'high' : assemblyPct < 30 ? 'moderate' : 'low'

  const directives: Record<QOSOperatingMode, string> = {
    maintenance: 'Low signal density. Conserve. Idle cadence.',
    recovery: 'Depletion detected. Repair first — other tasks pause.',
    growth: 'Steady engagement. Expand — absorb more.',
    peak: 'High energy + clarity + intention. Full commitment.',
  }

  return { mode, pressure, directive: directives[mode] }
}

export const QuantumEngineWidgets: React.FC = () => {
  const [carConnected, setCarConnected] = usePersistedState('qe-car-connected')
  const [homeConnected, setHomeConnected] = usePersistedState('qe-home-connected')
  const [computerConnected, setComputerConnected] = usePersistedState('qe-computer-connected')
  const [phoneConnected, setPhoneConnected] = usePersistedState('qe-phone-connected')
  const [watchConnected, setWatchConnected] = usePersistedState('qe-watch-connected')
  const [robotConnected, setRobotConnected] = usePersistedState('qe-robot-connected')
  const [view, setView] = React.useState<QOSView>('ecosystem')

  const engineState = useStore(intentionEngine)
  const assemblyState = useStore(selfAssembly)
  const { data: energyData } = useEnergy()
  const [cohortData, setCohortData] = React.useState<{ archetype?: string; behavioralCohort?: string } | null>(null)
  const [readiness, setReadiness] = React.useState<number | null>(null)

  const connectedCount = [carConnected, homeConnected, computerConnected, phoneConnected, watchConnected, robotConnected].filter(Boolean).length
  const ecosystemNarrative = React.useMemo(
    () => getEcosystemNarrative(connectedCount, TOTAL_DEVICES),
    [connectedCount]
  )

  // Load cohort/archetype from user-profile (server-derived)
  React.useEffect(() => {
    fetch('/api/user-profile')
      .then(res => res.json())
      .then(data => {
        if (data.archetype || data.behavioralCohort) {
          setCohortData({ archetype: data.archetype, behavioralCohort: data.behavioralCohort })
        }
      })
      .catch(() => {})
  }, [])

  // Compute readiness from physiological report
  React.useEffect(() => {
    if (engineState.signals.length === 0) return
    const report = getPhysiologicalReport()
    setReadiness((report as any).physiologicalReadiness ?? null)
  }, [engineState.signals.length])

  // Live user state + index for Index view
  const userState = React.useMemo(() => getUserState(), [view])
  const userIndex = React.useMemo(() => getUserIndex(), [view])

  // Live physiological cohort directive for cohort view
  const cohortDirective = React.useMemo(() => {
    if (engineState.signals.length === 0) return null
    const result = classifyPhysiologicalCohort(engineState.signals, getUserState(), engineState.recognizedPatterns ?? [])
    return result?.directive ?? null
  }, [engineState.signals.length, engineState.recognizedPatterns?.length])

  const handleCarConnect = () => {
    setCarConnected((prev) => {
      const next = !prev
      recordSignal('intentions', next ? 'car_connected' : 'car_disconnected', { timestamp: Date.now() })
      return next
    })
  }

  const handleHomeConnect = () => {
    setHomeConnected((prev) => {
      const next = !prev
      recordSignal('intentions', next ? 'home_connected' : 'home_disconnected', { timestamp: Date.now() })
      return next
    })
  }

  const handleComputerConnect = () => {
    setComputerConnected((prev) => {
      const next = !prev
      recordSignal('intentions', next ? 'computer_connected' : 'computer_disconnected', { timestamp: Date.now() })
      return next
    })
  }

  const handlePhoneConnect = () => {
    setPhoneConnected((prev) => {
      const next = !prev
      recordSignal('intentions', next ? 'phone_connected' : 'phone_disconnected', { timestamp: Date.now() })
      return next
    })
  }

  const handleWatchConnect = () => {
    setWatchConnected((prev) => {
      const next = !prev
      recordSignal('intentions', next ? 'watch_connected' : 'watch_disconnected', { timestamp: Date.now() })
      return next
    })
  }

  const handleRobotConnect = () => {
    setRobotConnected((prev) => {
      const next = !prev
      recordSignal('intentions', next ? 'robot_connected' : 'robot_disconnected', { timestamp: Date.now() })
      return next
    })
  }

  React.useEffect(() => {
    if (connectedCount === TOTAL_DEVICES) {
      recordSignal('intentions', 'ecosystem_full_coherence', {
        timestamp: Date.now(),
        devices: { car: carConnected, home: homeConnected, computer: computerConnected, phone: phoneConnected, watch: watchConnected, robot: robotConnected },
      })
    }
  }, [connectedCount])

  React.useEffect(() => { recomputeAssembly() }, [])

  const cycleView = () => {
    setView(prev =>
      prev === 'ecosystem' ? 'biofield' :
      prev === 'biofield'  ? 'cohort' :
      prev === 'cohort'    ? 'index' :
      prev === 'index'     ? 'assembly' :
      prev === 'assembly'  ? 'qos-mode' :
      prev === 'qos-mode'  ? 'qos-field' :
      'ecosystem'
    )
  }

  const qosLabel =
    view === 'ecosystem' ? 'QOS:' :
    view === 'biofield'  ? 'Biofield:' :
    view === 'cohort'    ? 'Cohort:' :
    view === 'assembly'  ? 'Self-Assembly:' :
    view === 'qos-mode'  ? 'Mode:' :
    view === 'qos-field' ? 'QOS Field:' :
    'Index:'

  const { energy, clarity, alignment, needsSupport } = engineState.userState
  const biofieldKnown = energy !== 'unknown'

  const qosModeData = React.useMemo(
    () => computeQOSMode(energy, engineState.recognizedPatterns, assemblyState.overallAssembly),
    [energy, engineState.recognizedPatterns, assemblyState.overallAssembly]
  )

  return (
    <>
      {/* QOS Summary Block — label cycles ecosystem / biofield / cohort / index */}
      <Block label={qosLabel} blockView onLabelClick={cycleView}>
        <div className="flex flex-col gap-y-8">

          {view === 'ecosystem' && (
            <>
              <div className="flex justify-between items-baseline">
                <span className="opacity-30">Nodes</span>
                <span className="tabular-nums">{connectedCount}/{TOTAL_DEVICES}</span>
              </div>
              <div className="flex gap-x-12 flex-wrap">
                <span className={carConnected ? '' : 'opacity-20'}>CAR</span>
                <span className={homeConnected ? '' : 'opacity-20'}>HOME</span>
                <span className={computerConnected ? '' : 'opacity-20'}>CPU</span>
                <span className={phoneConnected ? '' : 'opacity-20'}>PHN</span>
                <span className={watchConnected ? '' : 'opacity-20'}>WCH</span>
                <span className={robotConnected ? '' : 'opacity-20'}>ROB</span>
              </div>
              {assemblyState.overallAssembly > 0 && (
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30">Assembly</span>
                  <span className="tabular-nums">{assemblyState.overallAssembly}%</span>
                </div>
              )}
              {connectedCount > 0 && (
                <div className="opacity-30 text-xs">{ecosystemNarrative}</div>
              )}
            </>
          )}

          {view === 'biofield' && (
            <>
              {biofieldKnown ? (
                <>
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30 uppercase tracking-widest">ATP</span>
                    <span className="capitalize">{energy}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30 uppercase tracking-widest">Clarity</span>
                    <span className="capitalize">{clarity}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30 uppercase tracking-widest">Alignment</span>
                    <span className="capitalize">{alignment}</span>
                  </div>
                  {needsSupport !== 'none' && (
                    <div className="flex justify-between items-baseline">
                      <span className="opacity-30 uppercase tracking-widest">Support</span>
                      <span className="capitalize">{needsSupport}</span>
                    </div>
                  )}
                  {energyData?.energyState?.currentLevel !== undefined && (
                    <div className="flex justify-between items-baseline">
                      <span className="opacity-30 uppercase tracking-widest">Capacitor</span>
                      <span className="tabular-nums">{energyData.energyState.currentLevel}%</span>
                    </div>
                  )}
                  {engineState.signals.filter(s =>
                    s.signal === 'full_stack_session' &&
                    Date.now() - s.timestamp < 4 * 60 * 60 * 1000
                  ).length > 0 && (
                    <div className="flex justify-between items-baseline">
                      <span className="opacity-30 uppercase tracking-widest">Session</span>
                      <span className="opacity-60">Full-stack active</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="opacity-30">No biofield reading. Check in to anchor the signal.</div>
              )}
            </>
          )}

          {view === 'cohort' && (
            <>
              {(() => {
                const live = engineState.signals.length > 0
                  ? classifyPhysiologicalCohort(engineState.signals, getUserState(), engineState.recognizedPatterns ?? [])
                  : null
                const archetype = cohortData?.archetype ?? live?.archetype
                const directive = cohortDirective ?? live?.directive
                const circadianPhase = getCircadianPhase()
                return archetype ? (
                  <>
                    <div className="flex justify-between items-baseline">
                      <span className="opacity-30 uppercase tracking-widest">Arch</span>
                      <span className="text-right max-w-[60%]">{archetype}</span>
                    </div>
                    {cohortData?.behavioralCohort && (
                      <div className="flex justify-between items-baseline">
                        <span className="opacity-30 uppercase tracking-widest">Cohort</span>
                        <span>{cohortData.behavioralCohort}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline">
                      <span className="opacity-30 uppercase tracking-widest">Phase</span>
                      <span className="uppercase">{circadianPhase}</span>
                    </div>
                    {live?.energyBand && (
                      <div className="flex justify-between items-baseline">
                        <span className="opacity-30 uppercase tracking-widest">Band</span>
                        <span className="capitalize">{live.energyBand}</span>
                      </div>
                    )}
                    {live?.dominantModule && (
                      <div className="flex justify-between items-baseline">
                        <span className="opacity-30 uppercase tracking-widest">Dom</span>
                        <span className="uppercase">{live.dominantModule}</span>
                      </div>
                    )}
                    {live?.confidence !== undefined && (
                      <div className="flex justify-between items-baseline">
                        <span className="opacity-30 uppercase tracking-widest">Conf</span>
                        <span className="tabular-nums">{live.confidence}%</span>
                      </div>
                    )}
                    {readiness !== null && (
                      <div className="flex justify-between items-baseline">
                        <span className="opacity-30 uppercase tracking-widest">Ready</span>
                        <span className="tabular-nums">
                          {readiness}%{' '}
                          <span className="opacity-30">
                            {readiness >= 70 ? '▲' : readiness >= 40 ? '—' : '▼'}
                          </span>
                        </span>
                      </div>
                    )}
                    {energyData?.energyState?.needsReplenishment?.[0] && (
                      <div className="flex justify-between items-baseline">
                        <span className="opacity-30 uppercase tracking-widest">Priority</span>
                        <span className="capitalize">
                          {energyData.energyState.needsReplenishment[0].category}
                        </span>
                      </div>
                    )}
                    {directive && (
                      <div className="border-t border-acc-400/20 pt-8 mt-4">
                        <div className="opacity-40">{directive}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="opacity-30">Cohort pending. Engage more widgets to surface pattern.</div>
                )
              })()}
            </>
          )}

          {view === 'index' && (
            <div className="flex flex-col gap-y-4 font-mono text-xs">
              {userIndex ? (
                <>
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30 uppercase tracking-widest">Overall</span>
                    <span className="tabular-nums">{userIndex.overall}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30 uppercase">ENG</span>
                    <span className="tabular-nums">{userIndex.dimensions.engagement}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30 uppercase">EMO</span>
                    <span className="tabular-nums">{userIndex.dimensions.emotional}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30 uppercase">INT</span>
                    <span className="tabular-nums">{userIndex.dimensions.intentional}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30 uppercase">SOC</span>
                    <span className="tabular-nums">{userIndex.dimensions.social}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30 uppercase">CARE</span>
                    <span className="tabular-nums">{userIndex.dimensions.selfcare}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30 uppercase">COG</span>
                    <span className="tabular-nums">{userIndex.dimensions.cognitive}</span>
                  </div>
                  <div className="border-t border-acc-400/20 pt-8 mt-4">
                    <div className="opacity-30 uppercase tracking-widest mb-6">Dep Map → QOS</div>
                    {getWidgetDependencies('systemProgress').map(dep => (
                      <div key={dep} className="flex justify-between mb-2">
                        <span className="opacity-40 uppercase">{dep.slice(0, 6)}</span>
                        <span className="opacity-20">↑</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="opacity-30">Index pending. Engage widgets to build signal.</div>
              )}
            </div>
          )}

          {view === 'assembly' && (
            <div className="flex flex-col gap-y-4 font-mono text-xs">
              <div className="flex justify-between items-baseline">
                <span className="opacity-30 uppercase tracking-widest">Phase</span>
                <span>{phaseSymbol(assemblyState.phase)} {phaseLabel(assemblyState.phase)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-30 uppercase tracking-widest">Assembly</span>
                <span className="tabular-nums">{assemblyState.overallAssembly}%</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-30 uppercase tracking-widest">Modules</span>
                <span className="tabular-nums">{assemblyState.assembledCount}/{assemblyState.totalModules}</span>
              </div>
              <div className="border-t border-acc-400/20 pt-8 mt-4">
                <div className="opacity-30 uppercase tracking-widest mb-6">Module Map</div>
                {assemblyState.modules.map(mod => (
                  <div key={mod.id} className="flex justify-between mb-2">
                    <span className={mod.phase === 'dormant' ? 'opacity-20' : mod.phase === 'integrated' ? '' : 'opacity-60'}>
                      {phaseSymbol(mod.phase)} {mod.label}
                    </span>
                    <span className="opacity-30 tabular-nums">{mod.density}%</span>
                  </div>
                ))}
              </div>
              <div className="opacity-30 pt-4">{assemblyState.narrative}</div>
            </div>
          )}

          {view === 'qos-mode' && (
            <div className="flex flex-col gap-y-8 font-mono text-xs">
              <div className="flex justify-between items-baseline">
                <span className="opacity-30 uppercase tracking-widest">Mode</span>
                <span className="uppercase tracking-widest">{qosModeData.mode}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-30 uppercase tracking-widest">Pressure</span>
                <span className={`uppercase tabular-nums ${
                  qosModeData.pressure === 'critical' ? '' :
                  qosModeData.pressure === 'high' ? 'opacity-70' :
                  'opacity-40'
                }`}>{qosModeData.pressure}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-30 uppercase tracking-widest">Patterns</span>
                <span className="tabular-nums">{engineState.recognizedPatterns.length}</span>
              </div>
              <div className="border-t border-acc-400/20 pt-8 mt-4">
                <div className="opacity-40">{qosModeData.directive}</div>
              </div>
              {engineState.recognizedPatterns.some(p => p.pattern === 'centennial-convergence') && (
                <div className="border-t border-acc-400/20 pt-8">
                  <div className="flex justify-between items-baseline">
                    <span className="opacity-30 uppercase tracking-widest">Milestone</span>
                    <span>P100 ACTIVE</span>
                  </div>
                </div>
              )}
              {engineState.recognizedPatterns.length > 0 && (
                <div className="border-t border-acc-400/20 pt-8">
                  <div className="opacity-30 uppercase tracking-widest mb-6">Active signals</div>
                  {engineState.recognizedPatterns.slice(0, 5).map(p => (
                    <div key={p.pattern} className="flex justify-between mb-2">
                      <span className={`uppercase ${p.pattern === 'centennial-convergence' ? '' : 'opacity-50'}`}>
                        {PATTERN_DISPLAY[p.pattern] ?? p.pattern.replace(/-/g, ' ').slice(0, 14).toUpperCase()}
                      </span>
                      <span className="opacity-30 tabular-nums">{Math.round(p.confidence * 100)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'qos-field' && (() => {
            const qos = getQuantumOS()
            const signalEntries = Object.entries(qos.signalMap).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1])
            return (
              <div className="flex flex-col gap-y-4 font-mono text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30 uppercase tracking-widest">Status</span>
                  <span className={`uppercase tracking-widest ${qos.operationalStatus === 'peak' ? '' : qos.operationalStatus === 'nominal' ? 'opacity-70' : 'opacity-40'}`}>{qos.operationalStatus}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30 uppercase tracking-widest">Coherence</span>
                  <span className="tabular-nums">{qos.coherence}%</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30 uppercase tracking-widest">Phase</span>
                  <span className="uppercase">{qos.runtime.circadianPhase}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="opacity-30 uppercase tracking-widest">Overall</span>
                  <span className="tabular-nums">{qos.index.overall}</span>
                </div>
                {signalEntries.length > 0 && (
                  <div className="border-t border-acc-400/20 pt-8 mt-4">
                    <div className="opacity-30 uppercase tracking-widest mb-6">Signal Map 7d</div>
                    {signalEntries.slice(0, 6).map(([src, count]) => (
                      <div key={src} className="flex justify-between mb-2">
                        <span className="opacity-50 uppercase">{src.slice(0, 8)}</span>
                        <span className="opacity-60 tabular-nums">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
                {qos.patterns.length > 0 && (
                  <div className="border-t border-acc-400/20 pt-8 mt-2">
                    <div className="opacity-30 uppercase tracking-widest mb-6">Active Patterns</div>
                    {qos.patterns.slice(0, 4).map(p => (
                      <div key={p.id} className="flex justify-between mb-2">
                        <span className="opacity-50 uppercase">{(PATTERN_DISPLAY[p.id] ?? p.id.slice(0, 10).toUpperCase())}</span>
                        <span className="opacity-30 tabular-nums">{p.confidence}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

        </div>
      </Block>

      {/* Device connect controls */}
      <Block label="Car:" containsSmallButton inProgress>
        <Button size="small" onClick={handleCarConnect}>
          {carConnected ? 'disconnect' : 'connect'}
        </Button>
      </Block>
      <Block label="Home:" containsSmallButton inProgress>
        <Button size="small" onClick={handleHomeConnect}>
          {homeConnected ? 'disconnect' : 'connect'}
        </Button>
      </Block>
      <Block label="Computer:" containsSmallButton inProgress>
        <Button size="small" onClick={handleComputerConnect}>
          {computerConnected ? 'disconnect' : 'connect'}
        </Button>
      </Block>
      <Block label="Phone:" containsSmallButton inProgress>
        <Button size="small" onClick={handlePhoneConnect}>
          {phoneConnected ? 'disconnect' : 'connect'}
        </Button>
      </Block>
      <Block label="Watch:" containsSmallButton inProgress>
        <Button size="small" onClick={handleWatchConnect}>
          {watchConnected ? 'disconnect' : 'connect'}
        </Button>
      </Block>
      <Block label="Robot:" containsSmallButton inProgress>
        <Button size="small" onClick={handleRobotConnect}>
          {robotConnected ? 'disconnect' : 'connect'}
        </Button>
      </Block>
    </>
  )
}
