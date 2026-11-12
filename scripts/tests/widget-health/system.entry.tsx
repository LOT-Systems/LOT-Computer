import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider, QueryClient } from 'react-query'
import * as stores from '#client/stores'
import { recordSignal } from '#client/stores/intentionEngine'
import { System } from '#client/components/System'
const R: any = (window as any).__S = { crash: null, boundaries: [] }
class Top extends React.Component<any, any> {
  state = { e: null as any }
  static getDerivedStateFromError(e: any) { return { e } }
  componentDidCatch(e: any) { R.crash = String(e?.message || e) }
  render() { return this.state.e ? <div id="APPCRASH">APP CRASH</div> : this.props.children }
}
stores.me.set({ id: 'u1', email: 'x@y.z', firstName: 'Test', lastName: null, country: 'US', city: 'NYC', address: null, phone: null,
  tags: ['Usership'], hideActivityLogs: false, isAdmin: false, joinedAt: new Date(Date.now() - 400 * 864e5).toISOString() } as any)
for (let i = 0; i < 6; i++) recordSignal('mood', 'calm', { i })
const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
const t0 = performance.now()
createRoot(document.getElementById('root')!).render(<Top><QueryClientProvider client={qc}><System /></QueryClientProvider></Top>)
requestAnimationFrame(() => setTimeout(() => { R.t = performance.now() - t0 }, 0))
