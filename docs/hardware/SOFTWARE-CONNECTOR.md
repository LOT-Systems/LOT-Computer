# LOT® API Connector — Device Contract (v0.1, proposal)

None of this exists in `src/server` yet. Existing relevant pieces: Fastify routes in `src/server/routes/api.ts`, `GET /api/logs` (allow-list of displayable events at ~line 1082), SSE endpoint.

## 1. Data model (Prisma, new)
`Device { id, userId, name, tokenHash, fwVersion, lastSeenAt, batteryPct, createdAt, revokedAt }`.
`DeviceNotification { id, deviceId, text, level, createdAt, expiresAt, deliveredAt, ackedAt }`.

## 2. Pairing
1. Site (Settings) → "Add Pager" → shows a 6-char claim code (10 min TTL).
2. Device in pairing mode: `POST /api/device/claim {code, hw, fw}` → `{deviceId, token}`.
3. Token stored in NVS; sent as `Authorization: Bearer`. Revoke from site.

## 3. Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/device/poll?wait=25&since=<id>` | long-poll; returns pending notifications + config |
| POST | `/api/device/event` | `{type: "copy"\|"ack"\|"boot", notificationId?, ts}` |
| POST | `/api/device/telemetry` | `{temp,rh,pressure,gasIAQ,lux,battery,charging}` batched |
| POST | `/api/device/capture` | multipart JPEG, only after on-device approval |
| GET | `/api/device/ota` | signed firmware manifest |

### 3.1 Notification creation (server side)
The AI engine / scheduled jobs call `createDeviceNotification(userId, text, level)`; rate-limit and quiet-hour checks happen here.
### 3.2 Log integration
Every event writes a log row. Add to the displayable allow-list in `/api/logs`: `device_copy`, `device_ack`, `device_notify`.
### 3.3 "Copy" button
`POST /api/device/event {type:"copy", notificationId}` → log event `device_copy` with the notification text → visible in the Log tab.

## 4. Errors & limits
401 revoked token (device wipes and returns to pairing), 429 backoff, max payload 128 KB, telemetry ≤ 1 per minute.

## 5. Host tooling (`hardware/tools/lotdev`, planned)
Python CLI: `lotdev flash`, `lotdev provision --wifi`, `lotdev monitor`, `lotdev send "Coffee time!"` (calls notification creation for test), `lotdev selftest` (sensors/button/screen).
