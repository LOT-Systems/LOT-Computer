import * as React from 'react'
import { createRoot } from 'react-dom/client'

export function render(children: React.ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(children)
}
