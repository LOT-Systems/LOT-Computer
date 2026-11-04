/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Widget Registry — single manifest of every widget mounted by System.tsx.
 *
 * PURE DATA (no DOM, no stores) so scripts/tests/test-widget-health.ts can
 * import it under plain Node. Classification fields (kind / wiring / month)
 * were assigned from component names + docs/technical/WIDGETS.md and are
 * PROVISIONAL until each is verified against its component.
 *
 * kind   container = stores/records data; display = renders data only
 * month  0..15 = month of the 15-month UI build-up in which the widget is
 *        revealed (0 = day one). NOT yet enforced by System.tsx — see
 *        isWidgetRevealed(); wiring it in is a product decision for S-2.
 * wires  which LOT surfaces the widget reads from / writes to:
 *        ai (LOT AI) · system (System tab) · portrait (profile page)
 *        qie (Quantum Intent Engine) · memory · story
 * sync   shared context the widget can post to the Log (weather/time/online)
 */

export type WidgetKind = 'container' | 'display'
export type WidgetWire = 'ai' | 'system' | 'portrait' | 'qie' | 'memory' | 'story'
export type WidgetSync = 'time' | 'weather' | 'online'

export interface WidgetSpec {
  id: string
  kind: WidgetKind
  interactive: boolean
  month: number
  wires: WidgetWire[]
  sync?: WidgetSync[]
}

export const REVEAL_MONTHS = 15

const w = (
  id: string,
  kind: WidgetKind,
  interactive: boolean,
  month: number,
  wires: WidgetWire[],
  sync?: WidgetSync[]
): WidgetSpec => ({ id, kind, interactive, month, wires, sync })

export const WIDGET_REGISTRY: WidgetSpec[] = [
  // Month 0 — the monk's cell: time, one question, one breath
  w('TimeWidget', 'display', true, 0, ['system'], ['time']),
  w('QuantumRandomWidget', 'display', true, 0, ['system', 'qie']),
  w('MemoryWidget', 'container', true, 0, ['memory', 'ai', 'qie', 'portrait']),
  w('SubscribeWidget', 'display', true, 0, ['system']),
  w('MonthlyPulseWidget', 'display', false, 0, ['system', 'memory']),
  w('RecipeWidget', 'container', true, 0, ['system'], ['time']),
  // Month 1–2 — intention and planning
  w('PlannerWidget', 'container', true, 1, ['system', 'qie'], ['time']),
  w('IntentionsWidget', 'container', true, 1, ['qie', 'ai']),
  w('ContextualPromptsWidget', 'display', true, 2, ['ai', 'memory'], ['time', 'weather']),
  w('CalendarWidget', 'container', true, 2, ['system', 'qie'], ['time']),
  // Month 3–5 — pattern and story
  w('NarrativeWidget', 'display', false, 3, ['story', 'portrait']),
  w('GoalJourneyWidget', 'display', false, 3, ['story', 'portrait']),
  w('PatternInsightsWidget', 'display', false, 4, ['ai', 'memory']),
  w('InterventionsWidget', 'display', true, 4, ['ai']),
  w('ChatCatalystWidget', 'display', true, 5, ['ai'], ['online']),
  w('MicroCalculatorWidget', 'container', true, 5, ['system']),
  w('MicroGameWidget', 'container', true, 5, ['system']),
  w('MicroImageWidget', 'container', true, 5, ['system']),
  // Month 6–8 — body and evolution
  w('ChakraErgonomicsWidget', 'container', true, 6, ['system', 'ai']),
  w('EvolutionWidget', 'display', false, 6, ['story', 'portrait']),
  w('InterfaceEvolutionWidget', 'display', false, 7, ['story', 'portrait']),
  w('CohortConnectWidget', 'display', true, 7, ['ai', 'portrait'], ['online']),
  w('CosmicUpdateWidget', 'display', false, 8, ['qie'], ['time', 'weather']),
  w('QuantumSignWidget', 'display', true, 8, ['qie', 'portrait']),
  // Month 9–11 — Biofield engine
  w('QuantumStateWidget', 'display', false, 9, ['qie', 'ai']),
  w('PatternRecognitionWidget', 'display', false, 9, ['qie', 'ai', 'memory']),
  w('SignalStreamWidget', 'display', false, 10, ['qie']),
  w('AIFeedbackWidget', 'container', true, 10, ['ai']),
  w('IntegrityWidget', 'display', false, 11, ['ai', 'qie']),
  w('QuantumEngineWidgets', 'display', true, 11, ['qie', 'story', 'memory']),
  // Month 12–15 — instrument panel
  w('UserMetricsWidget', 'display', false, 12, ['system', 'portrait']),
  w('CorrelatedIndexesWidget', 'display', false, 12, ['system', 'ai']),
  w('SystemProgressWidget', 'container', true, 13, ['system', 'ai']),
  w('SystemPulseWidget', 'display', false, 13, ['system'], ['online']),
  w('ArchitectWidget', 'display', false, 14, ['system', 'qie']),
  w('BenchmarkWidget', 'display', false, 14, ['system']),
  w('AngelInvestorWidget', 'display', true, 15, ['system']),
  w('CorporatePlanWidget', 'display', true, 15, ['system']),
  w('DemoDayWidget', 'display', true, 15, ['system']),
]

const BY_ID = new Map(WIDGET_REGISTRY.map((s) => [s.id, s]))

export function getWidgetSpec(id: string): WidgetSpec | undefined {
  return BY_ID.get(id)
}

/** Whole months elapsed since joinedAt (clamped 0..REVEAL_MONTHS). */
export function monthsSince(joinedAt: string | number | Date, now = Date.now()): number {
  const t = new Date(joinedAt).getTime()
  if (!Number.isFinite(t)) return REVEAL_MONTHS
  const months = Math.floor((now - t) / (30.4375 * 24 * 3600 * 1000))
  return Math.max(0, Math.min(REVEAL_MONTHS, months))
}

/** Unknown ids are revealed (fail-open: never hide a widget by mistake). */
export function isWidgetRevealed(id: string, monthsElapsed: number): boolean {
  const spec = BY_ID.get(id)
  return !spec || monthsElapsed >= spec.month
}
