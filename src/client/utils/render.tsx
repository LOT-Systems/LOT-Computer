import * as React from 'react'
import { createRoot } from 'react-dom/client'

export function render(children: React.ReactNode) {
  const container = document.getElementById('root')
  if (!container) {
    throw new Error('Root element not found')
  }
  const root = createRoot(container)
  root.render(children)
}
