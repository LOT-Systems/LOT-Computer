/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

/** Opt-in OS-level notifications for calendar alerts (background tabs). */

const PREF_KEY = 'lot.calendar.sysnotify.v1'

export const sysNotifySupported = () =>
  typeof window !== 'undefined' && 'Notification' in window

export function sysNotifyEnabled(): boolean {
  if (!sysNotifySupported()) return false
  try {
    return localStorage.getItem(PREF_KEY) === '1' && Notification.permission === 'granted'
  } catch (_) {
    return false
  }
}

export async function setSysNotify(on: boolean): Promise<boolean> {
  if (!sysNotifySupported()) return false
  try {
    if (on && Notification.permission !== 'granted') {
      const p = await Notification.requestPermission()
      if (p !== 'granted') return false
    }
    localStorage.setItem(PREF_KEY, on ? '1' : '0')
    return on
  } catch (_) {
    return false
  }
}

/** Fire only when the tab is not visible — the in-app toast covers the rest. */
export function sysNotify(title: string, body: string, tag: string) {
  if (!sysNotifyEnabled() || document.visibilityState === 'visible') return
  try {
    const n = new Notification(title, { body, tag, silent: false })
    n.onclick = () => { try { window.focus(); n.close() } catch (_) {} }
  } catch (_) {}
}
