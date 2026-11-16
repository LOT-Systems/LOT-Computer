/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import React from 'react'
import { Block, Button } from '#client/components/ui'
import { useStore } from '@nanostores/react'
import * as stores from '#client/stores'
import { ProgressBars } from '#client/utils/progressBars'
import { selfAssembly, phaseSymbol, phaseLabel, recomputeAssembly, type AssembledModule } from '#client/stores/selfAssembly'
import { useEnergy, useLogs } from '#client/queries'
import {
  getPhysiologicalReport,
  getEnrichedPhysiologicalReport,
  analyzeIntentions,
  startBackgroundQOSMonitor,
  getCircadianPhase,
  getQuantumOS,
  getLogDependencySummary,
  recordQOSSignal,
  type PhysiologicalReport,
  type QuantumOS,
} from '#client/stores/intentionEngine'

type FeedbackStatus = 'operational' | 'resonating' | 'needs-calibration' | 'evolving'

interface Deployment {
  version: string
  timestamp: string
  program: string
  status: 'activated' | 'integrating' | 'synchronized'
  features: string[]
}

interface FeedbackAnalytics {
  version: string
  period: string
  totalResponses: number
  feedbackPercentages: {
    operational: number
    resonating: number
    'needs-calibration': number
    evolving: number
  }
  systemHealth: {
    status: string
    message: string
    priority: string
  }
  insights: string[]
}

type ProgressView = 'deployment' | 'assembly' | 'feedback' | 'report' | 'os-journal'

// Self-assembly session record — appended after each upgrade session.
// Lives in ./systemProgressSessionReports.ts (append new entries THERE) and is
// loaded lazily: ~154 KB of static text kept off the critical app.js parse path.
type SessionReport = import('./systemProgressSessionReports').SessionReport
let sessionReportsCache: SessionReport[] | null = null
const loadSessionReports = (): Promise<SessionReport[]> =>
  sessionReportsCache
    ? Promise.resolve(sessionReportsCache)
    : import('./systemProgressSessionReports').then(m => (sessionReportsCache = m.SESSION_REPORTS))

// Assembly transmissions — the system talking to the person
// Each run appends one entry. Format: terse, technical, alive.
const ASSEMBLY_TRANSMISSIONS: {
  date: string
  built: string[]
  feedbackApplied: string
  status: 'DEPLOYED' | 'HELD'
  next: string
}[] = [
  {
    date: '2026-04-17',
    built: ['Physiological cohort engine', 'Military log interface', 'Session report system'],
    feedbackApplied: 'the system needs to know the person',
    status: 'DEPLOYED',
    next: 'Daily QIE analytics + cohort voice matching',
  },
  {
    date: '2026-04-18',
    built: ['QIE v3 daily analytics', 'Physiological cohorts in assembly map', 'UserIndex 6D composite'],
    feedbackApplied: 'system should build itself from real signals',
    status: 'DEPLOYED',
    next: 'Assembly transmission layer — the system talking to the person',
  },
  {
    date: '2026-05-22',
    built: ['Assembly transmission layer', 'Session reports v4', 'Deployment features sync'],
    feedbackApplied: 'the system talking to the person',
    status: 'DEPLOYED',
    next: 'Journal vocabulary extraction → personal interface language injection',
  },
]

// ─── Usership Transmission — appended after each assembly run ───────────────
// This is the system talking to the person. Terse, technical, alive.
export const USERSHIP_TRANSMISSION = {
  date: '2026-08-05',
  message: [
    'ASSEMBLY RUN — 2026-08-05 · WIKI-v87 · FM v113 SYNC · Day 1073+',
    'Built: LOT-WIKI-v87. Six-level coherence architecture now complete and documented.',
    'Feedback applied: "The concept outlives the author. The self speaks every language the genre built."',
    'QIE v113 synchronized: P149 QPCRYST · P150 TOTCOH [CEILING] · P151 RECINTEL · Arch51 Quantum Presence Crystallizer · J48 09:00 UTC.',
    'Badge v31 synchronized: THE CYBERSPACE CODEX · 781 badges · Word Turn v21 (grok/ansible/spice/golden_path/matrix/cyberspace) · Secret Boss v18 (gibson/dick/lem) · 258 trigger words · 24 secret boss triggers.',
    'LEVEL 6 — PRESENCE CONVERGENCE documented. P150 total-field-coherence is the QIE ceiling. No higher state defined.',
    'Cockpit updated. Vocabulary expanded. Snapshot current.',
    'FM v113 · Wiki v87 · 151P · 51A · 48J · 190+ nodes · 781 badges.',
    'Status: DEPLOYED.',
    'Next: LOT-WIKI-v88 — sync to Field Manual v114+',
  ],
}

const FEEDBACK_OPTIONS = [
  { id: 'operational', label: 'Operational', symbol: '\u2191' },
  { id: 'resonating', label: 'Resonating', symbol: '\u2194' },
  { id: 'needs-calibration', label: 'Needs Calibration', symbol: '\u21BB' },
  { id: 'evolving', label: 'Self-Evolving', symbol: '\u21E1' }
] as const

/**
 * SystemProgressWidget - Self-building system surface
 * Tracks how this site assembles and evolves itself from user signals
 * Now includes Assembly Map: real-time view of which modules have self-assembled
 */
export function SystemProgressWidget() {
  const me = useStore(stores.me)
  const [feedback, setFeedback] = React.useState<FeedbackStatus | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [deployment, setDeployment] = React.useState<Deployment | null>(null)
  const [analytics, setAnalytics] = React.useState<FeedbackAnalytics | null>(null)
  const [showAnalytics, setShowAnalytics] = React.useState(false)
  const [view, setView] = React.useState<ProgressView>('deployment')
  const [showSessionLogs, setShowSessionLogs] = React.useState(false)
  const [sessionReports, setSessionReports] = React.useState<SessionReport[] | null>(sessionReportsCache)
  // Fetch the session-log chunk when the browser is idle (count shows in the
  // toggle label) or immediately if the user opens the list first.
  React.useEffect(() => {
    if (sessionReports) return
    let alive = true
    const load = () => loadSessionReports().then(r => { if (alive) setSessionReports(r) }).catch(() => {})
    if (showSessionLogs) { load(); return () => { alive = false } }
    const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, o?: { timeout: number }) => number)
    const id = ric ? ric(load, { timeout: 5000 }) : window.setTimeout(load, 2000)
    return () => {
      alive = false
      const cic = (window as any).cancelIdleCallback as undefined | ((id: number) => void)
      if (ric && cic) cic(id); else window.clearTimeout(id)
    }
  }, [showSessionLogs, sessionReports])

  const assembly = useStore(selfAssembly)
  const { data: energyData } = useEnergy()
  const { data: logs = [] } = useLogs()
  const [cohortData, setCohortData] = React.useState<{ archetype?: string; behavioralCohort?: string } | null>(null)

  // Last 3 non-empty user-written note entries for OS Journal field surface
  const recentEntries = React.useMemo(() => {
    return logs
      .filter((l) => l.event === 'note' && l.text && l.text.trim().length > 3)
      .slice(0, 3)
  }, [logs])
  const [report, setReport] = React.useState<ReturnType<typeof getEnrichedPhysiologicalReport> | null>(null)
  const [qos, setQos] = React.useState<QuantumOS | null>(null)
  const [logDeps, setLogDeps] = React.useState<Record<string, number> | null>(null)
  const [osJournalLogs, setOsJournalLogs] = React.useState<
    { date: string; streak?: number; density?: number; health?: number; archetype?: string; diversityScore?: number; topSource?: string }[]
  >([])

  // Recompute assembly and surface readiness on mount — no button required
  React.useEffect(() => {
    recomputeAssembly()
    analyzeIntentions()
    setReport(getEnrichedPhysiologicalReport())
    const interval = setInterval(() => {
      // Skip when the browser tab is hidden OR when the user is on another
      // in-app tab. recomputeAssembly() is heavy and writes the selfAssembly
      // atom (re-rendering several mounted-but-hidden widgets); pausing it off
      // the System tab keeps tab switching responsive.
      if (document.hidden) return
      if (!stores.isRouteActive('system')) return
      recomputeAssembly()
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  // Start background QOS monitor on mount
  React.useEffect(() => {
    const stop = startBackgroundQOSMonitor()
    return stop
  }, [])

  // Load physiological cohort classification from user-profile (server-derived archetype)
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

  // Load OS journal (vitals snapshots + signal reports) when view is active
  React.useEffect(() => {
    if (view !== 'os-journal') return
    fetch('/api/logs?events=os_vitals_snapshot,os_signal_report&limit=10')
      .then(res => res.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) return
        const entries = data.map((l: any) => ({
          date: l.metadata?.date ?? new Date(l.createdAt).toISOString().slice(0, 10),
          streak: l.metadata?.weeklyStreakScore ?? l.metadata?.streak,
          density: l.metadata?.logCount7d ?? l.metadata?.activityDensity,
          health: l.metadata?.health,
          archetype: l.metadata?.archetype,
          diversityScore: l.metadata?.diversityScore,
          topSource: l.metadata?.topSource,
        }))
        setOsJournalLogs(entries)
      })
      .catch(() => {})
  }, [view])

  const cycleView = () => {
    setView(prev => {
      switch (prev) {
        case 'deployment': return 'assembly'
        case 'assembly': return 'feedback'
        case 'feedback': return 'report'
        case 'report': return 'os-journal'
        case 'os-journal': return 'deployment'
        default: return 'deployment'
      }
    })
  }

  const handleGenerateReport = React.useCallback(() => {
    // analyzeIntentions() is a no-op within its 5-min cooldown but, on a
    // cache miss, runs a full ~139-pattern scan synchronously. Running it
    // (plus the report builders) inside the click handler blocked the click
    // from responding until it finished — the classic "click, then a beat,
    // then it happens" button lag. Defer the whole build one macrotask so the
    // button paints its response immediately, then compute off the click path.
    const build = () => {
      analyzeIntentions()
      const r = getEnrichedPhysiologicalReport()
      setReport(r)
      setQos(getQuantumOS())
      setLogDeps(getLogDependencySummary())
      recordQOSSignal('report_generated', {
        systemHealth: r.systemHealth,
        assembledModules: assembly.assembledCount,
        totalModules: assembly.totalModules,
        archetype: r.cohortSignals.archetype ?? cohortData?.archetype,
      })
    }
    setTimeout(build, 0)
  }, [assembly, cohortData])

  // Load latest deployment info
  React.useEffect(() => {
    fetch('/api/system/deployment-status')
      .then(res => res.json())
      .then(data => setDeployment(data))
      .catch(err => console.error('Failed to load deployment status:', err))
  }, [])

  // Load user's feedback if exists
  React.useEffect(() => {
    if (!deployment) return

    fetch('/api/system/my-feedback')
      .then(res => res.json())
      .then(data => {
        if (data.feedback) {
          setFeedback(data.feedback)
        }
      })
      .catch(err => console.error('Failed to load feedback:', err))
  }, [deployment])

  // Load community feedback analytics
  React.useEffect(() => {
    if (!deployment) return

    fetch('/api/system/feedback-analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error('Failed to load analytics:', err))
  }, [deployment])

  const handleFeedback = async (status: FeedbackStatus) => {
    setIsSubmitting(true)
    try {
      await fetch('/api/system/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: deployment?.version,
          feedback: status
        })
      })
      setFeedback(status)
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!deployment || !me) {
    return null
  }

  const getStatusColor = () => {
    switch (deployment.status) {
      case 'activated': return 'text-green'
      case 'integrating': return 'text-blue'
      case 'synchronized': return 'text-acc'
      default: return 'opacity-30'
    }
  }

  const getStatusText = () => {
    switch (deployment.status) {
      case 'activated': return '\u2192 Self-assembly activated. Site is building.'
      case 'integrating': return '\u21BB Pathways integrating. Structure evolving from use.'
      case 'synchronized': return '\u2194 Core synchronized. System shaped by its users.'
      default: return '\u00B7 Status unknown.'
    }
  }

  const getPhaseColor = (module: AssembledModule): string => {
    switch (module.phase) {
      case 'integrated': return 'text-acc'
      case 'assembled': return 'text-green'
      case 'forming': return 'text-blue'
      case 'awakening': return 'opacity-60'
      case 'dormant': return 'opacity-20'
    }
  }

  const label =
    view === 'deployment' ? 'System Progress:' :
    view === 'assembly' ? 'Self-Assembly:' :
    view === 'feedback' ? 'System Feedback:' :
    view === 'report' ? 'System Report:' :
    'OS Journal:'

  return (
    <Block label={label} blockView onLabelClick={cycleView}>
      <div className="flex flex-col gap-y-16">

        {/* ─── Deployment View ─── */}
        {view === 'deployment' && (
          <>
            <div>
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Build Version</span>
                <span>{deployment.version}</span>
              </div>

              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Program</span>
                <span className="capitalize">{deployment.program}</span>
              </div>

              <div className={`mb-8 ${getStatusColor()}`}>
                {getStatusText()}
              </div>

              {/* Assembly summary in deployment view */}
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">Assembly</span>
                <span className="tabular-nums">{assembly.assembledCount}/{assembly.totalModules} modules</span>
              </div>

              <div className="flex items-center gap-8">
                <ProgressBars percentage={assembly.overallAssembly} barCount={15} />
                <span className="tabular-nums">{assembly.overallAssembly}%</span>
              </div>

              {/* Physiological readiness — live surface, auto-generated on mount */}
              {report && (
                <>
                  <div className="flex justify-between items-baseline mt-8">
                    <span className="opacity-30">Readiness</span>
                    <span className="tabular-nums">
                      {report.physiologicalReadiness}/100
                      {' '}<span className="opacity-30">{
                        report.physiologicalReadiness >= 80 ? 'high' :
                        report.physiologicalReadiness >= 60 ? 'functional' :
                        report.physiologicalReadiness >= 40 ? 'reduced' :
                        report.physiologicalReadiness >= 20 ? 'degraded' :
                        'critical'
                      }</span>
                    </span>
                  </div>
                  {report.cohortClassification && (
                    <div className="flex justify-between items-baseline mt-8">
                      <span className="opacity-30">Archetype · live</span>
                      <span className="text-right">{report.cohortClassification.archetype}</span>
                    </div>
                  )}
                  {report.activePatterns.length > 0 && (
                    <div className="flex justify-between items-baseline mt-8">
                      <span className="opacity-30">Patterns active</span>
                      <span className="tabular-nums">{report.activePatterns.length}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Features */}
            {deployment.features.length > 0 && (
              <div className="border-t border-acc-400/30 pt-16">
                <div className="opacity-30 mb-8">Self-assembled enhancements:</div>
                <div className="flex flex-col gap-y-4">
                  {deployment.features.map((feature, idx) => (
                    <div key={idx}>{'\u2192'} {feature}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Physiological cohort — deployment view surface */}
            {(cohortData?.archetype || cohortData?.behavioralCohort) && (
              <div className="border-t border-acc-400/30 pt-16">
                <div className="opacity-30 mb-8">Physiological cohort:</div>
                <div className="flex flex-col gap-y-4">
                  {cohortData?.archetype && (
                    <div className="flex justify-between items-baseline">
                      <span className="opacity-50 uppercase tracking-widest text-xs">Archetype</span>
                      <span>{cohortData.archetype}</span>
                    </div>
                  )}
                  {cohortData?.behavioralCohort && (
                    <div className="flex justify-between items-baseline">
                      <span className="opacity-50 uppercase tracking-widest text-xs">Cohort</span>
                      <span>{cohortData.behavioralCohort}</span>
                    </div>
                  )}
                  {energyData?.energyState && (
                    <div className="flex justify-between items-baseline">
                      <span className="opacity-50 uppercase tracking-widest text-xs">Biofield ATP</span>
                      <span className="tabular-nums">
                        {energyData.energyState.currentLevel}%
                        {' '}<span className="opacity-30 capitalize">{energyData.energyState.trajectory}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Self-assembly narrative */}
            <div className="opacity-30">
              {assembly.narrative}
            </div>

            {/* Usership transmission — latest assembly run message, Usership only */}
            {me?.tags?.some((t: string) => t.toLowerCase() === 'usership') && (
              <div className="border-t border-acc-400/30 pt-16 font-mono text-xs">
                <div className="opacity-30 mb-8 uppercase tracking-widest">Transmission:</div>
                <div className="flex flex-col gap-y-2">
                  {USERSHIP_TRANSMISSION.message.map((line, i) => (
                    <div key={i} className={i === 0 ? 'opacity-80 uppercase tracking-widest' : 'opacity-50'}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session reports — logged after each upgrade session */}
            <div className="border-t border-acc-400/30 pt-16">
              <button
                onClick={() => setShowSessionLogs(!showSessionLogs)}
                className="w-full flex justify-between items-center opacity-30 hover:opacity-100 transition-opacity mb-8"
              >
                <span>Session logs{sessionReports ? ` (${sessionReports.length})` : ''}:</span>
                <span>{showSessionLogs ? '▾' : '▸'}</span>
              </button>
              {showSessionLogs && (
                <div className="flex flex-col gap-y-16">
                  {!sessionReports && <div className="opacity-30">Loading…</div>}
                  {(sessionReports ?? []).map((report) => (
                    <div key={report.date} className="flex flex-col gap-y-4 font-mono text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="opacity-50 uppercase tracking-widest">{report.session}</span>
                        <span className="tabular-nums opacity-40">{report.date}</span>
                      </div>
                      <div className="flex flex-col gap-y-2 pl-4">
                        {report.assembled.map((item, i) => (
                          <div key={i} className="opacity-40">&gt; {item}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── Assembly Map View ─── */}
        {view === 'assembly' && (
          <>
            {/* Overall assembly progress */}
            <div>
              <div className="flex justify-between items-baseline mb-8">
                <span className="opacity-30">System Phase</span>
                <span>{phaseSymbol(assembly.phase)} {phaseLabel(assembly.phase)}</span>
              </div>
              <div className="flex items-center gap-8 mb-8">
                <ProgressBars percentage={assembly.overallAssembly} barCount={15} />
                <span className="tabular-nums">{assembly.overallAssembly}%</span>
              </div>
            </div>

            {/* Module assembly map */}
            <div className="border-t border-acc-400/30 pt-16">
              <div className="opacity-30 mb-8">Module Assembly Map:</div>
              <div className="flex flex-col gap-y-8">
                {assembly.modules.map(module => (
                  <div key={module.id}>
                    <div className="flex justify-between items-baseline mb-4">
                      <span className={getPhaseColor(module)}>
                        {phaseSymbol(module.phase)} {module.label}
                      </span>
                      <span className="opacity-30 tabular-nums">{phaseLabel(module.phase)}</span>
                    </div>
                    {module.phase !== 'dormant' && (
                      <div className="flex items-center gap-8">
                        <ProgressBars percentage={module.density} barCount={10} />
                        <span className="opacity-30 tabular-nums">{module.density}%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Physiological cohort in assembly view */}
            {(cohortData || energyData?.energyState) && (
              <div className="border-t border-acc-400/30 pt-16">
                <div className="opacity-30 mb-8">Physiological cohort:</div>
                <div className="flex flex-col gap-y-4">
                  {cohortData?.archetype && (
                    <div className="flex justify-between">
                      <span className="opacity-30">Archetype</span>
                      <span>{cohortData.archetype}</span>
                    </div>
                  )}
                  {cohortData?.behavioralCohort && (
                    <div className="flex justify-between">
                      <span className="opacity-30">Cohort</span>
                      <span>{cohortData.behavioralCohort}</span>
                    </div>
                  )}
                  {energyData?.energyState && (
                    <div className="flex justify-between">
                      <span className="opacity-30">Biofield ATP</span>
                      <span className="tabular-nums">
                        {energyData.energyState.currentLevel}%
                        {' '}<span className="opacity-30 capitalize">{energyData.energyState.trajectory}</span>
                      </span>
                    </div>
                  )}
                  {energyData?.energyState?.needsReplenishment?.[0] && (
                    <div className="flex justify-between">
                      <span className="opacity-30">Priority need</span>
                      <span className="capitalize">
                        {energyData.energyState.needsReplenishment[0].category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assembly narrative */}
            <div className="opacity-30 pt-8">
              {assembly.narrative}
            </div>
          </>
        )}

        {/* ─── Feedback View ─── */}
        {view === 'feedback' && (
          <>
            {/* Feedback Section */}
            <div>
              <div className="opacity-30 mb-8">How does the self-evolving system feel?</div>

              <div className="grid grid-cols-2 gap-8">
                {FEEDBACK_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    onClick={() => handleFeedback(option.id as FeedbackStatus)}
                    disabled={isSubmitting}
                    className={`
                      px-16 py-8 rounded border transition-all
                      ${feedback === option.id
                        ? 'border-acc grid-fill text-acc'
                        : 'border-acc-400/30 hover:border-acc-400/60 grid-fill-hover'
                      }
                      ${isSubmitting ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <span>{option.symbol}</span>
                      <span>{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {feedback && (
                <div className="mt-16 opacity-30">
                  Signal received. The system rebuilds around your feedback.
                </div>
              )}
            </div>

            {/* Community Feedback */}
            {analytics && analytics.totalResponses > 0 && (
              <div className="border-t border-acc-400/30 pt-16">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="w-full flex justify-between items-center opacity-30 hover:opacity-100 transition-opacity mb-8"
                >
                  <span>Collective evolution signals:</span>
                  <span>{showAnalytics ? '\u25BE' : '\u25B8'}</span>
                </button>

                {showAnalytics && (
                  <div className="flex flex-col gap-y-16">
                    {/* System Health Status */}
                    <div className="p-16 rounded border border-acc-400/30">
                      <div className="opacity-30 mb-4">Self-build health:</div>
                      <div>{analytics.systemHealth.message}</div>
                    </div>

                    {/* Feedback Distribution */}
                    <div>
                      <div className="opacity-30 mb-8">Distribution ({analytics.totalResponses} responses):</div>
                      <div className="flex flex-col gap-y-4">
                        {FEEDBACK_OPTIONS.map(option => {
                          const percentage = analytics.feedbackPercentages[option.id as keyof typeof analytics.feedbackPercentages]
                          return (
                            <div key={option.id} className="flex justify-between items-center">
                              <span className="opacity-30">{option.symbol} {option.label}</span>
                              <span className="tabular-nums">{percentage}%</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Insights */}
                    {analytics.insights.length > 0 && (
                      <div>
                        <div className="opacity-30 mb-8">Insights:</div>
                        <div className="flex flex-col gap-y-4">
                          {analytics.insights.map((insight, idx) => (
                            <div key={idx}>
                              {'\u21B3'} {insight}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="opacity-30 pt-8">
                      Derived from {analytics.period} of collective self-building.
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ─── Self-Assembly Report View ─── */}
        {view === 'report' && (
          <>
            <div>
              <div className="opacity-30 mb-8">Self-assembly session report.</div>
              {!report ? (
                <button
                  onClick={handleGenerateReport}
                  className="opacity-30 hover:opacity-100 transition-opacity"
                >
                  Generate report →
                </button>
              ) : (
                <div className="flex flex-col gap-y-16 font-mono text-xs">

                  {/* Header */}
                  <div className="flex flex-col gap-y-4">
                    <div className="flex justify-between">
                      <span className="opacity-30 uppercase tracking-widest">Date</span>
                      <span className="tabular-nums">{report.sessionDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-30 uppercase tracking-widest">Sys health</span>
                      <span className="uppercase tracking-widest">{report.systemHealth}</span>
                    </div>
                  </div>

                  {/* Widget dependency audit */}
                  {report.widgetDependencies.length > 0 && (
                    <div className="border-t border-acc-400/30 pt-12">
                      <div className="opacity-30 mb-8 uppercase tracking-widest">Widget signals · 7d</div>
                      <div className="flex flex-col gap-y-2">
                        {report.widgetDependencies.map(dep => (
                          <div key={dep.widget} className="flex justify-between">
                            <span className="opacity-50 uppercase">{dep.widget}</span>
                            <span className="tabular-nums">
                              {dep.signalCount}
                              {dep.lastSeen && (
                                <span className="opacity-30 ml-8">{dep.lastSeen}</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Log dependency audit */}
                  {report.logDependencies.length > 0 && (
                    <div className="border-t border-acc-400/30 pt-12">
                      <div className="opacity-30 mb-8 uppercase tracking-widest">Log signals · 7d</div>
                      <div className="flex flex-col gap-y-2">
                        {report.logDependencies.map(dep => (
                          <div key={dep.source} className="flex justify-between">
                            <span className="opacity-50 uppercase">{dep.source}</span>
                            <span className="tabular-nums">{dep.signalCount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Physiological readiness */}
                  <div className="border-t border-acc-400/30 pt-12">
                    <div className="opacity-30 mb-8 uppercase tracking-widest">Physiological Readiness</div>
                    <div className="flex flex-col gap-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="opacity-50 uppercase">Score</span>
                        <span className="tabular-nums">{report.physiologicalReadiness}/100</span>
                      </div>
                      <div className="opacity-40 text-xs">{report.readinessDirective}</div>
                    </div>
                  </div>

                  {/* Biofield status */}
                  <div className="border-t border-acc-400/30 pt-12">
                    <div className="opacity-30 mb-8 uppercase tracking-widest">Biofield state</div>
                    <div className="flex flex-col gap-y-2">
                      <div className="flex justify-between">
                        <span className="opacity-50 uppercase">Energy</span>
                        <span className="capitalize">{report.biofieldStatus.energyLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50 uppercase">Clarity</span>
                        <span className="capitalize">{report.biofieldStatus.clarity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50 uppercase">Alignment</span>
                        <span className="capitalize">{report.biofieldStatus.alignment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50 uppercase">Support</span>
                        <span className="capitalize">{report.biofieldStatus.supportNeeded}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active patterns */}
                  {report.activePatterns.length > 0 && (
                    <div className="border-t border-acc-400/30 pt-12">
                      <div className="opacity-30 mb-8 uppercase tracking-widest">Active patterns</div>
                      <div className="flex flex-col gap-y-2">
                        {report.activePatterns.map((p, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="opacity-50 uppercase">{p.pattern.replace(/-/g, ' ')}</span>
                            <span className="tabular-nums opacity-30">{p.confidence}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Physiological cohort — real-time QIE classification */}
                  {report.cohortClassification && (
                    <div className="border-t border-acc-400/30 pt-12">
                      <div className="opacity-30 mb-8 uppercase tracking-widest">Physiological cohort · live</div>
                      <div className="flex flex-col gap-y-2">
                        <div className="flex justify-between">
                          <span className="opacity-50 uppercase">Archetype</span>
                          <span>{report.cohortClassification.archetype}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-50 uppercase">Energy</span>
                          <span className="capitalize">{report.cohortClassification.energyBand}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-50 uppercase">Module</span>
                          <span className="capitalize">{report.cohortClassification.dominantModule}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-50 uppercase">Conf</span>
                          <span className="tabular-nums">{report.cohortClassification.confidence}%</span>
                        </div>
                        <div className="opacity-30 text-xs mt-4">{report.cohortClassification.directive}</div>
                      </div>
                    </div>
                  )}

                  {/* Cohort signals — server-derived archetype */}
                  {(report.cohortSignals.archetype || report.cohortSignals.behavioralCohort || cohortData) && (
                    <div className="border-t border-acc-400/30 pt-12">
                      <div className="opacity-30 mb-8 uppercase tracking-widest">Cohort · server</div>
                      {(report.cohortSignals.archetype ?? cohortData?.archetype) && (
                        <div className="flex justify-between mb-2">
                          <span className="opacity-50 uppercase">Archetype</span>
                          <span>{report.cohortSignals.archetype ?? cohortData?.archetype}</span>
                        </div>
                      )}
                      {(report.cohortSignals.behavioralCohort ?? cohortData?.behavioralCohort) && (
                        <div className="flex justify-between">
                          <span className="opacity-50 uppercase">Cohort</span>
                          <span>{report.cohortSignals.behavioralCohort ?? cohortData?.behavioralCohort}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* QOS state — circadian phase, trend, latest snapshot */}
                  <div className="border-t border-acc-400/30 pt-12">
                    <div className="opacity-30 mb-8 uppercase tracking-widest">Quantum OS state</div>
                    <div className="flex flex-col gap-y-2">
                      <div className="flex justify-between">
                        <span className="opacity-50 uppercase">Circadian</span>
                        <span className="uppercase tracking-widest">
                          {('circadianPhase' in report ? report.circadianPhase : getCircadianPhase()).replace(/-/g, ' ')}
                        </span>
                      </div>
                      {'qosTrend' in report && (
                        <div className="flex justify-between">
                          <span className="opacity-50 uppercase">QOS trend</span>
                          <span className="uppercase tracking-widest">{report.qosTrend}</span>
                        </div>
                      )}
                      {'latestQOSSnapshot' in report && report.latestQOSSnapshot && (
                        <>
                          <div className="flex justify-between">
                            <span className="opacity-50 uppercase">Signals 24h</span>
                            <span className="tabular-nums">{report.latestQOSSnapshot.signalCount24h}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="opacity-50 uppercase">Modules active</span>
                            <span className="tabular-nums">{report.latestQOSSnapshot.modulesActive}</span>
                          </div>
                          {report.latestQOSSnapshot.topPattern && (
                            <div className="flex justify-between">
                              <span className="opacity-50 uppercase">Top pattern</span>
                              <span className="uppercase tracking-widest opacity-70">
                                {report.latestQOSSnapshot.topPattern.replace(/-/g, ' ')}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* User index — 6D composite */}
                  {report.userIndex && (
                    <div className="border-t border-acc-400/30 pt-12">
                      <div className="opacity-30 mb-8 uppercase tracking-widest">
                        User index · {report.userIndex.overall}{' '}
                        <span className="opacity-60 normal-case">{report.userIndex.trend}</span>
                      </div>
                      <div className="flex flex-col gap-y-2">
                        {([
                          ['Engagement', report.userIndex.engagement],
                          ['Emotional',  report.userIndex.emotional],
                          ['Intentional',report.userIndex.intentional],
                          ['Social',     report.userIndex.social],
                          ['Self-care',  report.userIndex.selfCare],
                          ['Cognitive',  report.userIndex.cognitive],
                        ] as [string, number][]).map(([label, val]) => (
                          <div key={label} className="flex justify-between">
                            <span className="opacity-50 uppercase">{label}</span>
                            <span className="tabular-nums">{val}</span>
                          </div>
                        ))}
                        <div className="flex justify-between">
                          <span className="opacity-50 uppercase">Src active</span>
                          <span className="tabular-nums">{report.userIndex.activeSourceCount}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assembly state */}
                  <div className="border-t border-acc-400/30 pt-12">
                    <div className="opacity-30 mb-8 uppercase tracking-widest">Assembly state</div>
                    <div className="flex flex-col gap-y-2">
                      <div className="flex justify-between">
                        <span className="opacity-50 uppercase">Modules</span>
                        <span className="tabular-nums">{assembly.assembledCount}/{assembly.totalModules}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-50 uppercase">Progress</span>
                        <span className="tabular-nums">{assembly.overallAssembly}%</span>
                      </div>
                    </div>
                  </div>

                  {/* QOS snapshot — full runtime model */}
                  {qos && (
                    <div className="border-t border-acc-400/30 pt-12">
                      <div className="opacity-30 mb-8 uppercase tracking-widest">
                        QOS · {qos.operationalStatus.toUpperCase()} · {qos.runtime.circadianPhase?.toUpperCase() ?? '—'}
                      </div>
                      <div className="flex flex-col gap-y-2 mb-8">
                        <div className="flex justify-between">
                          <span className="opacity-50 uppercase">Index</span>
                          <span className="tabular-nums">
                            {qos.index.overall}
                            <span className="opacity-30 ml-8 uppercase">{qos.index.trend}</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="opacity-50 uppercase">Coherence</span>
                          <span className="tabular-nums">{qos.coherence}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-y-1">
                        {(Object.entries(qos.index.dimensions) as [string, number][]).map(([dim, val]) => (
                          <div key={dim} className="flex justify-between">
                            <span className="opacity-30 uppercase">{dim.slice(0, 4)}</span>
                            <span className={`tabular-nums ${val >= 50 ? '' : val >= 30 ? 'opacity-60' : 'opacity-30'}`}>
                              {val}
                            </span>
                          </div>
                        ))}
                      </div>
                      {qos.patterns.length > 0 && (
                        <div className="mt-8">
                          <div className="opacity-30 mb-4 uppercase tracking-widest">Active directives</div>
                          <div className="flex flex-col gap-y-2">
                            {qos.patterns.filter(p => p.urgency === 'immediate' || p.urgency === 'soon').slice(0, 3).map(p => (
                              <div key={p.id} className="opacity-40">&gt; {p.directive}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Live log dependency summary */}
                  {logDeps && Object.keys(logDeps).length > 0 && (
                    <div className="border-t border-acc-400/30 pt-12">
                      <div className="opacity-30 mb-8 uppercase tracking-widest">Signal deps · 7d</div>
                      <div className="flex flex-col gap-y-2">
                        {Object.entries(logDeps)
                          .sort(([, a], [, b]) => b - a)
                          .map(([source, count]) => (
                            <div key={source} className="flex justify-between">
                              <span className="opacity-50 uppercase">{source}</span>
                              <span className="tabular-nums">{count}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  <div className="opacity-30 pt-4 uppercase tracking-widest border-t border-acc-400/20 pt-12">
                    Generated {new Date(report.generatedAt).toISOString().replace('T', ' ').slice(0, 19)}Z
                  </div>

                  <button
                    onClick={handleGenerateReport}
                    className="opacity-30 hover:opacity-100 transition-opacity text-left"
                  >
                    Refresh report →
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── OS Journal View ─── */}
        {view === 'os-journal' && (
          <>
            {/* ─── Field entries — user's own words reflected back ─── */}
            {recentEntries.length > 0 && (
              <div>
                <div className="opacity-30 mb-8 uppercase tracking-widest font-mono text-xs">Field entries:</div>
                <div className="flex flex-col gap-y-12 font-mono text-xs">
                  {recentEntries.map((entry) => (
                    <div key={entry.id} className="flex flex-col gap-y-2">
                      <div className="opacity-30 tabular-nums">
                        {new Date(entry.createdAt).toISOString().slice(0, 10)}
                      </div>
                      <div className="opacity-60">
                        {entry.text!.trim().length > 80
                          ? entry.text!.trim().slice(0, 80) + '...'
                          : entry.text!.trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="opacity-30 mb-8">OS vitals and signal reports.</div>
              {osJournalLogs.length === 0 ? (
                <div className="flex flex-col gap-y-12 font-mono text-xs">
                  <div className="opacity-30">No persisted snapshots. Vitals log daily at 02:00 UTC.</div>
                  {report && (
                    <div className="border-t border-acc-400/20 pt-12 flex flex-col gap-y-4">
                      <div className="opacity-40 uppercase tracking-widest mb-4">Session · {report.sessionDate}</div>
                      <div className="flex justify-between">
                        <span className="opacity-30 uppercase">Readiness</span>
                        <span className="tabular-nums">{report.physiologicalReadiness}/100</span>
                      </div>
                      <div className="opacity-40">{report.readinessDirective}</div>
                      <div className="flex justify-between">
                        <span className="opacity-30 uppercase">Energy</span>
                        <span className="capitalize">{report.biofieldStatus.energyLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-30 uppercase">Clarity</span>
                        <span className="capitalize">{report.biofieldStatus.clarity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-30 uppercase">Assembly</span>
                        <span className="tabular-nums">{assembly.assembledCount}/{assembly.totalModules} modules · {assembly.overallAssembly}%</span>
                      </div>
                      <div className="opacity-30 pt-4">{assembly.narrative}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-y-16 font-mono text-xs">
                  {osJournalLogs.map((entry, idx) => (
                    <div key={idx} className="flex flex-col gap-y-4 border-t border-acc-400/20 pt-12">
                      <div className="opacity-40 uppercase tracking-widest mb-4">{entry.date}</div>
                      {entry.streak !== undefined && (
                        <div className="flex justify-between">
                          <span className="opacity-30 uppercase">Streak score</span>
                          <span className="tabular-nums">{entry.streak}</span>
                        </div>
                      )}
                      {entry.density !== undefined && (
                        <div className="flex justify-between">
                          <span className="opacity-30 uppercase">Log density 7d</span>
                          <span className="tabular-nums">{entry.density}</span>
                        </div>
                      )}
                      {entry.diversityScore !== undefined && (
                        <div className="flex justify-between">
                          <span className="opacity-30 uppercase">Signal diversity</span>
                          <span className="tabular-nums">{entry.diversityScore}%</span>
                        </div>
                      )}
                      {entry.topSource && (
                        <div className="flex justify-between">
                          <span className="opacity-30 uppercase">Top source</span>
                          <span className="uppercase">{entry.topSource}</span>
                        </div>
                      )}
                      {entry.archetype && (
                        <div className="flex justify-between">
                          <span className="opacity-30 uppercase">Archetype</span>
                          <span>{entry.archetype}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Physiological cohort summary */}
            {cohortData && (
              <div className="border-t border-acc-400/30 pt-16">
                <div className="opacity-30 mb-8 uppercase tracking-widest">Current cohort</div>
                <div className="flex flex-col gap-y-4 font-mono text-xs">
                  {cohortData.archetype && (
                    <div className="flex justify-between">
                      <span className="opacity-30 uppercase">Archetype</span>
                      <span>{cohortData.archetype}</span>
                    </div>
                  )}
                  {cohortData.behavioralCohort && (
                    <div className="flex justify-between">
                      <span className="opacity-30 uppercase">Cohort</span>
                      <span>{cohortData.behavioralCohort}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assembly module count */}
            <div className="border-t border-acc-400/30 pt-16">
              <div className="flex justify-between font-mono text-xs">
                <span className="opacity-30 uppercase">Modules online</span>
                <span className="tabular-nums">{assembly.assembledCount}/{assembly.totalModules}</span>
              </div>
            </div>
          </>
        )}

      </div>
    </Block>
  )
}
