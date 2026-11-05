# LOT Device API v0.1 (proposal — not implemented)

Existing `/api/logs` uses user-session auth (`src/server/routes/api.ts:1082`). Devices need their own auth.

## Auth
Pairing: signed-in user opens Settings → Devices → "Pair". Site shows 6-digit code (10 min TTL). Device calls `POST /api/device/pair {code, deviceId, fw}` and receives a long-lived **device token** (stored hashed server-side, revocable). All later calls: `Authorization: Bearer <device token>`, TLS only.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| POST | /api/device/pair | exchange code for token |
| GET | /api/device/inbox?since=ID | long-poll (25 s) for notifications; WebSocket/MQTT optional later |
| POST | /api/device/ack | `{id}` shown/dismissed |
| POST | /api/device/events | `{type:"copy"\|"photo"\|"sensor", payload, ts}` → writes a Log row |
| POST | /api/device/telemetry | batched weather/battery, ≤ 1 per 5 min |
| GET | /api/device/config | brightness, quiet hours, fw update URL |

## Notification object
`{id, text (≤ 40 chars), haptic:"none"|"short"|"double", ttlSec, createdAt}` e.g. `{text:"Coffee time!", haptic:"short"}`. Text comes from the AI engine; server enforces length and quiet hours.

## Copy → Log tab
`POST /api/device/events {type:"copy", payload:{notificationId, text}}` inserts a log row (source `device`) so it shows in the Log tab. Rate limit 30/min/device. Photos: upload to object storage, log row holds the URL; opt-in per device.

## Security
Per-device revoke; rate limits as in existing AI-endpoint limits; no secrets in firmware images; reject payloads > 64 KB.
