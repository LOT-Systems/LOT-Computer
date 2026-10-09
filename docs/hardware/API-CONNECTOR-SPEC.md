# LOT Computer — API Connector Spec (draft v0.1)
Not implemented. Proposed additions to `src/server/routes/` (new `device-api.ts`).

## Auth
Today `/api` is session-cookie only. Add per-device bearer tokens: `Authorization: Bearer lotdev_<32 bytes>`; store SHA-256 hash in a new `devices` table (`id, userId, name, tokenHash, serial, lastSeenAt, revokedAt`). Pairing: user taps "Add device" in site settings -> 6-digit code (5 min TTL) -> device calls `POST /api/device/pair {code, serial}` -> receives token once. Rate-limit and TLS only.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/device/pair` | Exchange code for token |
| GET | `/api/device/notifications?since=<iso>` | Poll (30 s default; `Retry-After` honored). Optional SSE upgrade later using existing sync layer |
| POST | `/api/device/ack` `{id}` | Notification displayed/dismissed |
| POST | `/api/device/event` `{type:"copy", ts, battery, rssi}` | Button press -> creates `Log` row `event='device_copy'`, `text='Copy'`, `metadata={deviceId,...}` |
| POST | `/api/device/telemetry` `{temp,rh,pressure,gas_iaq,uv,lux}` | Batched every 5–15 min; optional Log `device_telemetry` |
| GET | `/api/device/config` | Poll interval, quiet hours, brightness |

Notification payload: `{id, text (<=64 chars), level: "info|alert", haptic: "short|double|long", expiresAt}`. Text is produced by an AI job on the site (e.g. "Coffee time!") and must be plain text, length-capped server-side.

## Log tab
`displayableEvents` in `GET /api/logs` is a whitelist: **add `device_copy`** (and optionally `device_telemetry`) or presses won't show.

## Security
Tokens revocable; devices cannot read user data other than their own notification queue; no inbound ports on device; camera frames are NOT uploaded unless a future explicit user action (separate endpoint, out of scope v1).

## Companion software (req 10)
v1: browser WebSerial/WebUSB flasher + config page (Wi-Fi creds, pairing code) served from the site; fallback: `esptool` + CLI `lotdev provision`.
