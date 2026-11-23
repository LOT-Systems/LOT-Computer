/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * QI·46 admin read-out panel: pure view model.
 *
 * Turns the /admin-api/qi46/readout response into plain text lines for the
 * admin card. No React, no fetch, no imports, so the smoke test runs the
 * same code the panel renders. Labels only: it never sees text or user ids.
 */

export interface Qi46ReadoutStatView {
  total: number
  held: number
  heldRate: number
}

export interface Qi46SwitchGate {
  id: 'migration' | 'copy' | 'flag'
  label: string
  done: boolean
}

export interface Qi46ReadoutResponse {
  available: boolean
  source: string
  days: number
  total: number
  held: number
  cleared: number
  heldRate: number
  people: number
  suppressed: boolean
  byReason: Record<string, number>
  byLead: Record<string, Qi46ReadoutStatView>
  byRisk: Record<string, Qi46ReadoutStatView>
  byVersion: Record<string, Qi46ReadoutStatView>
  gates?: Qi46SwitchGate[]
}

export interface Qi46ReadoutSection {
  title: string
  rows: { label: string; value: string }[]
}

export interface Qi46ReadoutView {
  headline: string
  note: string | null
  gates: { label: string; mark: string }[]
  gatesOpen: number
  sections: Qi46ReadoutSection[]
}

const pct = (r: number) => `${Math.round((Number(r) || 0) * 100)}%`
// Only short machine labels are shown. Anything else is masked, so a bad row
// can never put free text on an admin screen.
const safeLabel = (k: string) => (/^[a-z0-9.\-:]{1,32}$/i.test(k) ? k : 'other')

function statRows(map: Record<string, Qi46ReadoutStatView> | undefined) {
  return Object.entries(map || {})
    .sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]))
    .map(([k, s]) => ({
      label: safeLabel(k),
      value: `${s.held}/${s.total} held · ${pct(s.heldRate)}`,
    }))
}

export function qi46ReadoutView(r: Qi46ReadoutResponse): Qi46ReadoutView {
  const gates = (r.gates || []).map((g) => ({
    label: g.label,
    mark: g.done ? '■' : '□',
  }))
  const gatesOpen = (r.gates || []).filter((g) => !g.done).length

  if (!r.available) {
    return {
      headline: 'No audit trail yet',
      note: 'Migration 20261117120000 has not run, so no COSMO® verdicts are recorded.',
      gates,
      gatesOpen,
      sections: [],
    }
  }

  const window = `${r.days}d · ${r.source}`
  const headline = r.total
    ? `${r.total} screened · ${r.held} held · ${pct(r.heldRate)} · ${r.people} ${r.people === 1 ? 'person' : 'people'} · ${window}`
    : `Nothing screened · ${window}`

  if (r.suppressed) {
    return {
      headline,
      note: r.total
        ? 'Fewer than 3 people in this window. Breakdowns are hidden so no one can be read back.'
        : null,
      gates,
      gatesOpen,
      sections: [],
    }
  }

  const reasons = Object.entries(r.byReason || {})
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([k, n]) => ({ label: safeLabel(k), value: String(n) }))

  const sections: Qi46ReadoutSection[] = [
    { title: 'Held by reason', rows: reasons },
    { title: 'By lead register', rows: statRows(r.byLead) },
    { title: 'By risk level', rows: statRows(r.byRisk) },
    { title: 'By engine version', rows: statRows(r.byVersion) },
  ].filter((s) => s.rows.length > 0)

  return { headline, note: null, gates, gatesOpen, sections }
}
