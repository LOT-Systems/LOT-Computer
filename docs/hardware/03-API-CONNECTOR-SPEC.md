# 03 — LOT API Connector (device ↔ lot-systems.com)

Status: **spec only**. No `/api/device/*` routes exist in `src/server/routes/` yet. Existing relevant code: `src/server/routes/api.ts` (`/logs` at ~L1082 lists displayable log events; `/ping` at ~L141), user auth via `req.user`.

## 1. Auth
- Pairing: user opens Settings → "Pair device" → site shows 8-char claim code (10 min TTL).
- `POST /api/device/pair {code, hwId, fw}` → `{deviceId, token}`; token stored in device NVS. Token is per-device, revocable, hashed server-side (store hash only).
- All other calls: `Authorization: Bearer <token>`, TLS only, pinned CA bundle in firmware.
- Needs a new Prisma model `Device {id, userId, hwId, tokenHash, fw, lastSeen, createdAt}` (migration required).

## 2. Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/device/pair | claim |
| GET | /api/device/inbox?since=<id> | pending notices `[{id, text(≤64 chars ×2 lines), kind, ttl, haptic}]` |
| POST | /api/device/event | device → site events (below) |
| GET | /api/device/config | polling interval, quiet hours, OTA manifest |
| POST | /api/device/telemetry | sensor frame batch |

## 3. Event payloads
```json
{"type":"hw_copy","noticeId":"n_123","ts":"2026-10-30T13:08:05Z","battery":87}
{"type":"hw_ack","noticeId":"n_123","ts":"..."}
{"type":"hw_weather","t_c":21.4,"rh":44,"p_hpa":1012,"voc_iaq":38,"uv":1.2,"ts":"..."}
```
- `hw_copy` (the **Copy button**) must be written to the user's log and appear in the **Log tab**: add `hw_copy`, `hw_ack` (and optionally `hw_weather`, rate-limited to hourly) to `displayableEvents` in `api.ts` `/logs`.
- Meaning of "Copy": press = "I received/copy that" acknowledging the displayed notice. If you meant copying text to a clipboard, that needs a host companion app; confirm.

## 4. Notification generation
Server-side job (existing scheduled-jobs.ts pattern) decides when AI emits a notice (e.g., "Coffee time!") from circadian/behaviour signals, writes to a `DeviceNotice` queue; device pulls. Respect existing Ambient-AI rule: rare, earned moments, quiet hours, max N/day.

## 5. Weather
Device telemetry supplements `src/server/utils/weather.ts` (Open-Meteo by location) for the Weather widget and indoor/outdoor delta (LOT® Station concept in docs/corporate/LOT-AMBIENT-AI-VISION.md).

## 6. Rate limits & errors
429 with `Retry-After`; device backs off exponentially, never retries faster than 15 s; offline events queued (≤200) in flash.
