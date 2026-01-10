/**
 * Self-care Reminder Notifications
 *
 * Optional opt-in notifications that gently remind users about self-care moments.
 * Respects quiet hours, user preferences, and browser notification permissions.
 */

import { atom } from 'nanostores'

export type NotificationFrequency = 'once-daily' | 'twice-daily' | 'pattern-based' | 'off'

export type NotificationSettings = {
  enabled: boolean
  frequency: NotificationFrequency
  quietHoursStart: number // 0-23
  quietHoursEnd: number // 0-23
  lastShown: number | null
  permissionGranted: boolean
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  frequency: 'once-daily',
  quietHoursStart: 22, // 10 PM
  quietHoursEnd: 8, // 8 AM
  lastShown: null,
  permissionGranted: false,
}

// Load from localStorage
function loadSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS

  const stored = localStorage.getItem('notification-settings')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Check actual permission status
      const permissionGranted = Notification.permission === 'granted'
      return { ...parsed, permissionGranted }
    } catch (e) {
      console.error('Failed to load notification settings:', e)
    }
  }
  return DEFAULT_SETTINGS
}

export const notificationSettings = atom<NotificationSettings>(loadSettings())

// Save to localStorage whenever settings change
if (typeof window !== 'undefined') {
  notificationSettings.subscribe((settings) => {
    localStorage.setItem('notification-settings', JSON.stringify(settings))
  })
}

/**
 * Request notification permission from the browser
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    notificationSettings.set({
      ...notificationSettings.get(),
      permissionGranted: true,
    })
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    const granted = permission === 'granted'

    notificationSettings.set({
      ...notificationSettings.get(),
      permissionGranted: granted,
      enabled: granted, // Auto-enable if permission granted
    })

    return granted
  }

  return false
}

/**
 * Check if we should show a notification now
 */
export function shouldShowNotification(): boolean {
  const settings = notificationSettings.get()

  // Check if enabled and permission granted
  if (!settings.enabled || !settings.permissionGranted) return false

  // Check quiet hours
  const hour = new Date().getHours()
  const inQuietHours = settings.quietHoursStart < settings.quietHoursEnd
    ? hour >= settings.quietHoursStart || hour < settings.quietHoursEnd
    : hour >= settings.quietHoursStart && hour < settings.quietHoursEnd

  if (inQuietHours) return false

  // Check frequency
  const now = Date.now()
  const lastShown = settings.lastShown || 0
  const hoursSinceLastShown = (now - lastShown) / (1000 * 60 * 60)

  switch (settings.frequency) {
    case 'once-daily':
      return hoursSinceLastShown >= 24
    case 'twice-daily':
      return hoursSinceLastShown >= 12
    case 'pattern-based':
      // Check with intention engine - will be implemented next
      return hoursSinceLastShown >= 6 // Fallback to 6 hours
    case 'off':
      return false
    default:
      return false
  }
}

/**
 * Show a self-care reminder notification
 */
export function showSelfCareNotification(title: string, body: string) {
  if (!shouldShowNotification()) return

  const settings = notificationSettings.get()

  if (settings.permissionGranted && settings.enabled) {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'self-care-reminder',
      requireInteraction: false,
      silent: true, // Gentle, no sound
    })

    // Update last shown time
    notificationSettings.set({
      ...settings,
      lastShown: Date.now(),
    })
  }
}

/**
 * Toggle notifications on/off
 */
export async function toggleNotifications(): Promise<boolean> {
  const settings = notificationSettings.get()

  if (!settings.enabled) {
    // Turning on - request permission first
    const granted = await requestNotificationPermission()
    return granted
  } else {
    // Turning off
    notificationSettings.set({
      ...settings,
      enabled: false,
    })
    return false
  }
}

/**
 * Update notification settings
 */
export function updateNotificationSettings(updates: Partial<NotificationSettings>) {
  notificationSettings.set({
    ...notificationSettings.get(),
    ...updates,
  })
}
