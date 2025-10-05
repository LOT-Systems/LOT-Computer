import { atom } from 'nanostores'
import { LayoutView } from '#client/types'

const LAYOUT_MEDIA_QUERIES: Record<LayoutView, string> = {
  [LayoutView.Mobile]: '(max-width: 480px)',
  [LayoutView.Tablet]: '(min-width: 480px) and (max-width: 768px)',
  [LayoutView.Desktop]: '(min-width: 768px)',
}

export const layoutView = atom<LayoutView>(getInitialLayoutView())

const onMediaQueryMatchingChange =
  (view: LayoutView) => (ev: MediaQueryListEvent) => {
    if (ev.matches) {
      layoutView.set(view)
    }
  }

Object.keys(LAYOUT_MEDIA_QUERIES).forEach((_view) => {
  const view = _view as unknown as LayoutView
  window
    .matchMedia(LAYOUT_MEDIA_QUERIES[view])
    .addEventListener('change', onMediaQueryMatchingChange(view))
})

function getInitialLayoutView(): LayoutView {
  const value = Object.keys(LAYOUT_MEDIA_QUERIES).find((view) => {
    const mqString = LAYOUT_MEDIA_QUERIES[view as LayoutView]
    const { matches } = window.matchMedia(mqString)
    return matches
  }) as LayoutView
  if (!value) {
    console.warn(`Failed to match media query.`)
    return LayoutView.Desktop
  }
  return value
}
