import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import { CalendarAlertHost } from '#client/components/CalendarAlertHost'
import { CalendarWidget } from '#client/components/CalendarWidget'
const qc = new QueryClient()
createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={qc}><CalendarWidget /><CalendarAlertHost /></QueryClientProvider>
)
