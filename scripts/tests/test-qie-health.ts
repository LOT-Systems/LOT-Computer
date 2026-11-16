/**
 * QIE widget-health regression test — run: yarn test:qie
 *
 * 1. analyzeIntentions() must not throw with a populated signal buffer
 *    (P147 referenced an undeclared `dayMs` → ReferenceError, 2026-08-03 → 2026-11-16).
 * 2. syncToServer() must not drop signals recorded while the POST is in flight.
 */
// Minimal browser shims so the client store runs under Node.
const g = globalThis as any
if (!g.localStorage) {
  const mem = new Map<string, string>()
  g.localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, String(v)), removeItem: (k: string) => void mem.delete(k), clear: () => mem.clear() }
}
const { intentionEngine, analyzeIntentions, recordSignal, syncToServer } = await import('#client/stores/intentionEngine')

let failed = 0
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`)
  if (!ok) failed++
}

const SOURCES = ['mood', 'memory', 'planner', 'selfcare', 'journal', 'log', 'energy', 'calculator'] as const
const now = Date.now()
const seed = Array.from({ length: 40 }, (_, i) => ({
  timestamp: now - (i + 1) * 60_000,
  source: SOURCES[i % SOURCES.length],
  signal: 'seed',
})) as any

// 1 — analyzeIntentions
intentionEngine.set({ ...intentionEngine.get(), lastAnalysis: 0, signals: seed })
try {
  const patterns = analyzeIntentions()
  check('analyzeIntentions() completes', Array.isArray(patterns), `${patterns.length} patterns`)
} catch (e: any) {
  check('analyzeIntentions() completes', false, `${e?.constructor?.name}: ${e?.message}`)
}

// 2 — sync race
;(async () => {
  if (typeof g.window === 'undefined') g.window = g
  intentionEngine.set({ ...intentionEngine.get(), signals: seed, lastSyncedTimestamp: 0, lastAnalysis: Date.now() })
  g.fetch = async () => {
    recordSignal('mood', 'recorded_during_inflight_sync') // lands mid-request
    return { ok: true, json: async () => ({ savedSignals: 40, totalSignals: 40 }) }
  }
  await syncToServer()
  const st = intentionEngine.get()
  const inflight = st.signals.find(s => s.signal === 'recorded_during_inflight_sync')
  check('in-flight signal kept in buffer', !!inflight)
  check('in-flight signal still unsynced', !!inflight && inflight.timestamp > st.lastSyncedTimestamp)
  console.log(failed ? `\n${failed} FAILED` : '\nALL GREEN')
  process.exit(failed ? 1 : 0)
})()
