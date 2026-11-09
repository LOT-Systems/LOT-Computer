# LOT-HW-03 — LOT API Device Connector (proposed)
Status: SPEC. Not yet implemented in `src/server`. Fits existing Fastify routes (`api.ts`) and `Log` model (`event`, `text`, `metadata`, `context`).

## Auth
Existing auth is cookie JWT (user session). Device uses a per-device bearer token minted in Settings ("Pair device"), stored hashed server-side, scoped to `device:*`, revocable. TLS only.

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/device/pair` | Exchange 6-digit code (shown in site) for device token |
| GET | `/api/device/stream` | SSE: `notice`, `config`, `ping` events to device |
| POST | `/api/device/event` | Device → site: `copy`, `sensor`, `battery`, `photo_meta` |
| POST | `/api/device/photo` | Optional JPEG upload (off by default) |
| POST | `/api/admin/device/notice` | Site/AI sends a notice to a user's device |

### Notice payload (site → device)
```json
{"id":"n_01","text":"Coffee time!","ttl_s":600,"haptic":"double","ts":1762600000}
```
`text` max 80 chars, ASCII + basic Latin. Device acks with `event: ack`.

### Button "Copy" (device → site)
```json
POST /api/device/event
{"type":"copy","notice_id":"n_01","ts":1762600042,"battery":0.81}
```
Server writes `Log.create({userId, event:'device_copy', text:'Coffee time!', metadata:{deviceId, noticeId}})`. Add `'device_copy'` to `displayableEvents` in `GET /logs` so it appears in the Log tab.

### Sensor event
`{"type":"sensor","t_c":21.4,"rh":44,"hpa":1013.2,"gas_ohm":81234,"iaq":62}` → stored as `device_sensor` (not displayed by default; feeds QIE environment signal).

## AI notification flow
Scheduled job / AI engine decides a nudge → trims to ≤80 chars → `POST /api/admin/device/notice` → SSE push → screen + haptic. Rate limit: 1 notice / 5 min default; quiet hours from user settings.

## Offline
Device keeps last 5 notices; queues up to 50 events in flash; syncs on reconnect.
