# 04 — LOT API CONNECTOR & HOST SOFTWARE

## 1. Existing surface (from src/server/routes/api.ts)
- `GET /api/live-message` — single global message string (no per-device targeting).
- `POST /api/logs` `{text, event?, metadata?}` — creates a Log row for the session user (session-cookie auth).
- `GET /api/weather` — user-city weather.
Devices cannot use session cookies, so a device-token layer is required.

## 2. New endpoints (proposed, not yet built)
Auth: `Authorization: Bearer <device-token>`; token is created in the user's settings, hashed in DB, revocable, scoped to one user.

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/device/pair | Exchange one-time pairing code for a device token |
| GET | /api/device/notifications?since=ID | Pending notifications for this device (JSON array, ≤5) |
| POST | /api/device/notifications/:id/ack | Mark displayed |
| POST | /api/device/events | `{type: "copy"\|"photo"\|"boot", ts, payload}` |
| POST | /api/device/telemetry | `{tempC, humidity, pressure, gas, batteryPct, fw}` |
| GET | /api/device/config | Poll interval, timezone, brightness |

New Prisma models: `Device` (id, userId, tokenHash, name, lastSeen, fw), `DeviceNotification` (id, deviceId, text, createdAt, ackedAt, source).

## 3. "Copy" → Log tab
On Copy the server writes via the existing Log model:
```
Log.create({ userId, text: "Copy pressed on LOT Computer.", event: "device_copy",
             metadata: { deviceId, ts, notificationId, text } })
```
Logs.tsx shows `event: device_copy` rows with the notification text. No client change is needed beyond a label for the event type. Rate limit: 10 events/min/device.

## 4. Pager-like notifications from the AI site
- A scheduled job (see src/server/scheduled-jobs.ts) asks the AI engine for a short nudge using the user's context/memory engine; output hard-limited to 60 chars, no emoji.
- Insert `DeviceNotification`; device picks it up at the next poll.
- Phase 2: WebSocket/MQTT push for instant delivery (costs battery; optional).

## 5. Host software (item 10)
`hardware/tools/lot-device` (Node/TypeScript CLI, matches repo stack):
- `lot-device flash <port>` — esptool wrapper
- `lot-device provision` — writes device ID + token + Wi-Fi to NVS
- `lot-device test` — runs self-test, prints report
- `lot-device simulate` — software device for P1 (exercises the API without hardware)
- `lot-device logs` — serial monitor

## 6. Security
HTTPS only (pin the lot-systems.com CA chain), per-device revocable tokens, no secrets in firmware images, signed OTA, camera upload size and rate caps.
