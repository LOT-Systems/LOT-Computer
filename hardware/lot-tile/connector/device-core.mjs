/**
 * LOT TILE · device connector core logic (pure, framework-free).
 * Used by device-sim.mjs and mirrored by device-api.ts. Spec: docs/06-LOT-API-CONNECTOR.md
 */
export const MAX_TEXT = 96
export const MAX_SLEEP_S = 3 * 3600
export const LEAD_S = 30

/** next_wake_at rule (doc 06 §3.1): upcoming notification − 30 s, else circadian window, capped at 3 h. */
export function computeNextWake(nowMs, pending, circadianNextMs = null) {
  const cap = nowMs + MAX_SLEEP_S * 1000
  const soon = pending
    .map((n) => n.deliverAt)
    .filter((t) => t > nowMs && t <= nowMs + 6 * 3600 * 1000)
    .sort((a, b) => a - b)[0]
  let next = soon != null ? soon - LEAD_S * 1000 : circadianNextMs ?? cap
  if (next <= nowMs) next = nowMs + 60 * 1000
  return Math.min(next, cap)
}

/** Shorten an AI nudge to the device limit without cutting a UTF-8 codepoint. */
export function clampText(text) {
  const enc = new TextEncoder()
  if (enc.encode(text).length <= MAX_TEXT) return text
  let out = ''
  for (const ch of text) {
    if (enc.encode(out + ch + '…').length > MAX_TEXT) break
    out += ch
  }
  return out + '…'
}

/**
 * Apply device events idempotently. `store` must provide:
 *   seenSeq(deviceId, seq) / markSeq(deviceId, seq), findNotification(id), createLog(row), markRead(id)
 * Returns the highest acked seq.
 */
export async function applyEvents(store, device, events = []) {
  let acked = 0
  for (const evt of [...events].sort((a, b) => a.seq - b.seq)) {
    acked = Math.max(acked, evt.seq)
    if (await store.seenSeq(device.id, evt.seq)) continue
    await store.markSeq(device.id, evt.seq)
    const n = evt.notification_id ? await store.findNotification(evt.notification_id) : null
    if (n && n.userId !== device.userId) continue // never cross accounts
    if (evt.type === 'copy' && n) {
      await store.createLog({
        userId: device.userId,
        event: 'device_copy',
        text: n.text,
        metadata: {
          deviceId: device.id, serial: device.serial, notificationId: n.id,
          kind: n.kind, pressedAt: evt.ts, source: 'lot-tile',
        },
      })
    } else if (evt.type === 'dismiss' && n) {
      await store.markRead(n.id)
    }
  }
  return acked
}

/** Build the /sync response body. */
export function buildSyncResponse({ nowMs, delivered, pending, device, acked, circadianNextMs }) {
  const nextMs = computeNextWake(nowMs, pending, circadianNextMs)
  return {
    now: new Date(nowMs).toISOString(),
    notifications: delivered.map((n) => ({
      id: n.id, text: clampText(n.text), kind: n.kind, at: new Date(n.deliverAt).toISOString(),
    })),
    acked_seq: acked,
    next_wake_at: new Date(nextMs).toISOString(),
    next_wake_epoch: Math.floor(nextMs / 1000),
    cfg: { mode: device.mode, live: device.mode === 'live', camera: !!device.cameraEnabled },
    ota: null,
  }
}
