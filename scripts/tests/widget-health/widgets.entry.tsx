
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider, QueryClient } from 'react-query'
import * as stores from '#client/stores'
import { recordSignal, intentionEngine } from '#client/stores/intentionEngine'
import { AIFeedbackWidget } from '#client/components/AIFeedbackWidget'
import { AngelInvestorWidget } from '#client/components/AngelInvestorWidget'
import { ArchitectWidget } from '#client/components/ArchitectWidget'
import { BenchmarkWidget } from '#client/components/BenchmarkWidget'
import { CalendarWidget } from '#client/components/CalendarWidget'
import { ChakraErgonomicsWidget } from '#client/components/ChakraErgonomicsWidget'
import { ChatCatalystWidget } from '#client/components/ChatCatalystWidget'
import { CohortConnectWidget } from '#client/components/CohortConnectWidget'
import { ContextualPromptsWidget } from '#client/components/ContextualPromptsWidget'
import { CorporatePlanWidget } from '#client/components/CorporatePlanWidget'
import { CorrelatedIndexesWidget } from '#client/components/CorrelatedIndexesWidget'
import { CosmicUpdateWidget } from '#client/components/CosmicUpdateWidget'
import { DemoDayWidget } from '#client/components/DemoDayWidget'
import { EvolutionWidget } from '#client/components/EvolutionWidget'
import { GoalJourneyWidget } from '#client/components/GoalJourneyWidget'
import { IntegrityWidget } from '#client/components/IntegrityWidget'
import { IntentionsWidget } from '#client/components/IntentionsWidget'
import { InterfaceEvolutionWidget } from '#client/components/InterfaceEvolutionWidget'
import { InterventionsWidget } from '#client/components/InterventionsWidget'
import { MemoryWidget } from '#client/components/MemoryWidget'
import { MicroCalculatorWidget } from '#client/components/MicroCalculatorWidget'
import { MicroGameWidget } from '#client/components/MicroGameWidget'
import { MicroImageWidget } from '#client/components/MicroImageWidget'
import { MonthlyPulseWidget } from '#client/components/MonthlyPulseWidget'
import { NarrativeWidget } from '#client/components/NarrativeWidget'
import { PatternInsightsWidget } from '#client/components/PatternInsightsWidget'
import { PatternRecognitionWidget } from '#client/components/PatternRecognitionWidget'
import { PlannerWidget } from '#client/components/PlannerWidget'
import { QuantumEngineWidgets } from '#client/components/QuantumEngineWidgets'
import { QuantumRandomWidget } from '#client/components/QuantumRandomWidget'
import { QuantumSignWidget } from '#client/components/QuantumSignWidget'
import { QuantumStateWidget } from '#client/components/QuantumStateWidget'
import { RecipeWidget } from '#client/components/RecipeWidget'
import { SignalStreamWidget } from '#client/components/SignalStreamWidget'
import { SubscribeWidget } from '#client/components/SubscribeWidget'
import { SystemProgressWidget } from '#client/components/SystemProgressWidget'
import { SystemPulseWidget } from '#client/components/SystemPulseWidget'
import { TimeWidget } from '#client/components/TimeWidget'
import { UserMetricsWidget } from '#client/components/UserMetricsWidget'
import { EmotionalCheckIn } from '#client/components/EmotionalCheckIn'
import { SelfCareMoments } from '#client/components/SelfCareMoments'
import { EnergyCapacitor } from '#client/components/EnergyCapacitor'
import { MoodAnalytics } from '#client/components/MoodAnalytics'
import { FlashDriveManifest } from '#client/components/FlashDriveManifest'
import { FourDimensionalUI } from '#client/components/FourDimensionalUI'
import { CollectiveConsciousness, GrowthMilestones, IntentionPatterns, WellnessPulse, BadgeUnlockFeed, MemoryEngineStats } from '#client/components/stats'
const W: Array<[string, any]> = [['AIFeedbackWidget', AIFeedbackWidget], ['AngelInvestorWidget', AngelInvestorWidget], ['ArchitectWidget', ArchitectWidget], ['BenchmarkWidget', BenchmarkWidget], ['CalendarWidget', CalendarWidget], ['ChakraErgonomicsWidget', ChakraErgonomicsWidget], ['ChatCatalystWidget', ChatCatalystWidget], ['CohortConnectWidget', CohortConnectWidget], ['ContextualPromptsWidget', ContextualPromptsWidget], ['CorporatePlanWidget', CorporatePlanWidget], ['CorrelatedIndexesWidget', CorrelatedIndexesWidget], ['CosmicUpdateWidget', CosmicUpdateWidget], ['DemoDayWidget', DemoDayWidget], ['EvolutionWidget', EvolutionWidget], ['GoalJourneyWidget', GoalJourneyWidget], ['IntegrityWidget', IntegrityWidget], ['IntentionsWidget', IntentionsWidget], ['InterfaceEvolutionWidget', InterfaceEvolutionWidget], ['InterventionsWidget', InterventionsWidget], ['MemoryWidget', MemoryWidget], ['MicroCalculatorWidget', MicroCalculatorWidget], ['MicroGameWidget', MicroGameWidget], ['MicroImageWidget', MicroImageWidget], ['MonthlyPulseWidget', MonthlyPulseWidget], ['NarrativeWidget', NarrativeWidget], ['PatternInsightsWidget', PatternInsightsWidget], ['PatternRecognitionWidget', PatternRecognitionWidget], ['PlannerWidget', PlannerWidget], ['QuantumEngineWidgets', QuantumEngineWidgets], ['QuantumRandomWidget', QuantumRandomWidget], ['QuantumSignWidget', QuantumSignWidget], ['QuantumStateWidget', QuantumStateWidget], ['RecipeWidget', RecipeWidget], ['SignalStreamWidget', SignalStreamWidget], ['SubscribeWidget', SubscribeWidget], ['SystemProgressWidget', SystemProgressWidget], ['SystemPulseWidget', SystemPulseWidget], ['TimeWidget', TimeWidget], ['UserMetricsWidget', UserMetricsWidget], ['EmotionalCheckIn', EmotionalCheckIn], ['SelfCareMoments', SelfCareMoments], ['EnergyCapacitor', EnergyCapacitor], ['MoodAnalytics', MoodAnalytics], ['FlashDriveManifest', FlashDriveManifest], ['FourDimensionalUI', FourDimensionalUI], ['CollectiveConsciousness', CollectiveConsciousness], ['GrowthMilestones', GrowthMilestones], ['IntentionPatterns', IntentionPatterns], ['WellnessPulse', WellnessPulse], ['BadgeUnlockFeed', BadgeUnlockFeed], ['MemoryEngineStats', MemoryEngineStats]]
const results: any = (window as any).__R = {}
class B extends React.Component<any, any> {
  state = { err: null as any }
  static getDerivedStateFromError(e: any) { return { err: e } }
  componentDidCatch(e: any) { results[this.props.name].crash = String(e && e.message || e) }
  render() { return this.state.err ? <div data-crash={this.props.name}>CRASH</div> : this.props.children }
}
stores.me.set({ id: 'u1', email: 'x@y.z', firstName: 'Test', lastName: null, country: 'US', city: 'NYC', address: null, phone: null,
  tags: ['Usership'], hideActivityLogs: false, isAdmin: false, joinedAt: new Date(Date.now() - 400*864e5).toISOString() } as any)
const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
function App() {
  return <QueryClientProvider client={qc}>{W.map(([n, C]) => { results[n] = { mounts: 0, dur: 0 }; return (
    <div key={n} data-w={n} style={{ border: '1px solid #ccc', margin: 4 }}>
      <React.Profiler id={n} onRender={(id, phase, d) => { results[id].mounts++; results[id].dur += d; if (phase==='mount') results[id].mountDur = d }}>
        <B name={n}><C /></B>
      </React.Profiler>
    </div>) })}</QueryClientProvider>
}
const t0 = performance.now()
createRoot(document.getElementById('root')!).render(<App />)
requestAnimationFrame(() => setTimeout(() => { (window as any).__T = performance.now() - t0 }, 0))

;(window as any).__rec = (n: number) => { for (let i = 0; i < n; i++) recordSignal('mood', 'calm', { i }) ; return intentionEngine.get().signals.length }
