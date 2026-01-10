/**
 * Notification Service
 *
 * Background service that periodically checks if self-care reminders should be shown
 * and triggers browser notifications when appropriate.
 */

import { shouldShowNotification, showSelfCareNotification, notificationSettings } from '#client/stores/notifications'
import { shouldShowWidget } from '#client/stores/intentionEngine'

const CHECK_INTERVAL = 15 * 60 * 1000 // Check every 15 minutes
let intervalId: NodeJS.Timeout | null = null

// Self-care suggestion messages
const SELF_CARE_MESSAGES = [
  {
    title: 'Time for a moment',
    body: 'Take a few minutes for yourself. A small self-care practice can shift your whole day.',
  },
  {
    title: 'Self-care reminder',
    body: 'Your wellbeing matters. Consider a brief grounding practice right now.',
  },
  {
    title: 'Pause for care',
    body: 'Even 5 minutes of intentional self-care can make a difference. Ready?',
  },
  {
    title: 'Gentle reminder',
    body: 'Check in with yourself. What small act of care would feel good right now?',
  },
  {
    title: 'Self-care moment',
    body: 'You deserve care and attention. Take a brief moment for yourself.',
  },
]

/**
 * Check if we should show a notification and show it if appropriate
 */
function checkAndShowNotification() {
  const settings = notificationSettings.get()

  // Don't check if notifications are disabled
  if (!settings.enabled || !settings.permissionGranted) return

  // For pattern-based, also check the intention engine
  if (settings.frequency === 'pattern-based') {
    const shouldShow = shouldShowWidget('selfcare')
    if (!shouldShow && !shouldShowNotification()) return
  } else {
    // For time-based frequencies, just use shouldShowNotification
    if (!shouldShowNotification()) return
  }

  // Pick a random message
  const message = SELF_CARE_MESSAGES[Math.floor(Math.random() * SELF_CARE_MESSAGES.length)]

  // Show the notification
  showSelfCareNotification(message.title, message.body)
}

/**
 * Start the notification service
 */
export function startNotificationService() {
  // Don't start if already running
  if (intervalId) return

  // Check immediately on start
  checkAndShowNotification()

  // Then check periodically
  intervalId = setInterval(checkAndShowNotification, CHECK_INTERVAL)
}

/**
 * Stop the notification service
 */
export function stopNotificationService() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

/**
 * Initialize notification service (call from app.tsx)
 */
export function initNotificationService() {
  // Only run in browser
  if (typeof window === 'undefined') return

  // Start the service
  startNotificationService()

  // Stop when page unloads
  window.addEventListener('beforeunload', stopNotificationService)

  // Listen for settings changes to restart service
  notificationSettings.subscribe((settings) => {
    if (settings.enabled && settings.permissionGranted) {
      startNotificationService()
    } else {
      stopNotificationService()
    }
  })
}
