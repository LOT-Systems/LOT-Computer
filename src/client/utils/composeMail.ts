import * as stores from '#client/stores'

/**
 * LOT Mail: open Log and prefill "/email to <name> " in the active textarea.
 * Uses the native value setter so React-controlled inputs see the change.
 */
export const composeMailTo = (name: string) => {
  const to = (name || '').trim()
  if (!to) return
  stores.goTo('logs')
  setTimeout(() => {
    const ta = document.querySelector<HTMLTextAreaElement>('textarea')
    if (!ta) return
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value'
    )?.set
    const text = `/email to ${to} `
    setter ? setter.call(ta, text) : (ta.value = text)
    ta.dispatchEvent(new Event('input', { bubbles: true }))
    ta.focus()
    ta.setSelectionRange(text.length, text.length)
  }, 300)
}
