# Device API & Firmware Spec (draft v0.1)

Not implemented yet. Fits existing code: `Log` model (`userId, event, text, metadata, context`), Fastify routes under `/api`, cookie-JWT auth (browser only).

## Pairing
1. User opens site → "Add device" → server issues one-time 8-char code (10 min TTL).
2. Device (BLE/serial via `lotctl`) sends code + hardware ID to `POST /api/device/pair` → returns long-lived **device token** (hash stored in new `devices` table: `id, userId, hwId, tokenHash, fw, lastSeen`). Token sent as `Authorization: Bearer`. Revocable in site.

## Routes
| Route | Purpose |
|---|---|
| `POST /api/device/pair` | exchange code → token |
| `GET /api/device/ws` | WSS; server pushes `{type:"notify", id, text, ttl, haptic}`; device acks `{type:"ack", id}` |
| `GET /api/device/poll?since=` | fallback for deep sleep |
| `POST /api/device/event` | `{type:"copy"|"sensor"|"photo", text?, data?}` → writes `Log` with `event: "hw.copy" / "hw.sensor" / "hw.photo"`, `metadata.deviceId` |
| `POST /api/device/photo` | multipart JPEG ≤ 200 KB (only on explicit gesture) |
| `GET /api/device/config` | brightness, poll interval, sensor interval, OTA URL |

Notify source: `scheduled-jobs.ts` + AI engine produce short strings (≤ 40 chars, e.g. "Coffee time!"); a `notifications` queue per device.

## Firmware (ESP-IDF 5.x, C/C++)
- States: DEEP-SLEEP → wake (timer 5 min / button / tap via BMI270) → Wi-Fi → poll → render → sleep.
- Screen: 240×240, big monospaced text, brand palette TBD; auto-brightness.
- Button: short = **Copy** (current message text → `hw.copy`, haptic + "✓"); long (1.5 s) = capture photo → confirm on screen → upload; double = next message.
- Sensors: BME688 via BSEC2, send T/RH/P/IAQ every 15 min as `hw.sensor`.
- OTA: signed images (secure boot v2 + flash encryption), A/B partitions.
- Privacy: camera LED-equivalent = screen border red during capture.
- Logs on device: ring buffer 16 KB, session summaries compressed (zstd/heatshrink) before upload.

## Host software
`lotctl` (Node CLI, `serialport`): `provision`, `flash`, `test` (factory self-test: sensors, screen, button, Wi-Fi, charge IC), `read-log`. Produces per-unit test record for the manufacturing run.

## Log tab changes
Rows with `event` starting `hw.` render a device icon; filter "Device". No schema change (uses `metadata`).
