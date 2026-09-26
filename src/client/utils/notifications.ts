/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/**
 * Thin wrapper over the browser Notification API. Every call is
 * defensive — unsupported browsers, denied permission, or an SSR
 * pass must all no-op rather than throw, since this fires from a
 * background timer with no error boundary above it.
 */

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

/**
 * Requests permission only if the user hasn't already answered.
 * Call this from a direct user action (e.g. scheduling a timed
 * entry) — browsers ignore or block permission prompts fired from
 * background code.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  try {
    const result = await Notification.requestPermission()
    return result === 'granted'
  } catch {
    return false
  }
}

export function fireBrowserNotification(title: string, body: string) {
  if (!isNotificationSupported()) return
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, { body })
  } catch {
    // Some browsers throw on notification construction outside a
    // service-worker context under certain permission states — never
    // let a reminder crash the tab it was meant to alert.
  }
}
