# LOT® PAGER — LOT API Connector Spec

## 1. What exists today (verified in this repo)
- `POST /api/logs` `{text, event?, metadata?}` creates a Log row for `req.user` (src/server/routes/api.ts:1563). The Log tab renders by `log.event`.
- `GET /api/live-message` returns a single global string from `LiveMessage` — usable as a v0 "broadcast" notification.
- `GET /api/weather` is per-user city weather (server-side), not a device sensor.
- **Auth is cookie‑JWT session only** (src/server/server.ts:206–223). A device cannot use it safely. A device-token path must be added.

## 2. New: device identity (P1, feature-flagged)
Prisma model `Device { id, userId, label, tokenHash, lastSeenAt, revokedAt, fw }`.

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /api/device/pair-code` | user session | Returns 6‑char code, 10 min TTL |
| `POST /api/public/device/pair` `{code, hwId}` | none (rate‑limited) | Returns `{token}` once; stored as hash |
| `DELETE /api/device/:id` | user session | Revoke |

Requests from the device send `Authorization: Bearer <token>`. A small `onRequest` hook resolves it to the owning user and sets `req.user`, so existing routes (`/api/logs`) work unchanged. Scope the token: allow only `/api/device/*` and `POST /api/logs` with `event` starting `device.`.

## 3. Notifications (site → device)
`GET /api/device/notifications?since=<id>&wait=25` — long poll (≤25 s), returns:
```json
{ "items":[{"id":"n_01","text":"Coffee time!","level":"nudge","ts":1760700000,"ttl":3600}], "next":"n_01" }
```
- Generator: scheduled job (src/server/scheduled-jobs.ts) asks the existing AI engine to decide *whether* to notify based on user context (time, streak, calendar, weather from device). Output is validated to ≤ 240 bytes and a level whitelist. Silence is the default (consistent with LOT widget doctrine: "Nothing renders without cause").
- Quiet hours and per-day cap from user prefs. 
- v0 fallback: device polls `/api/live-message` (no server change).

## 4. Copy button → Log tab (device → site)
`POST /api/logs`
```json
{ "text":"Coffee time!", "event":"device.copy",
  "metadata":{"deviceId":"d_x","notificationId":"n_01","batteryPct":81,"fw":"0.1.0","ts":1760700123} }
```
Client change: add a `device.copy` renderer branch in `src/client/components/Logs.tsx` (near line 225) with a small pager glyph. No schema change (`event` is a free string, `metadata` JSON).

## 5. Sensor & camera
- `POST /api/device/telemetry` — batched, compressed (08 §3): `{t0, dt, temp, rh, p, gasIdx, lux, motion}`; 1 batch / 5 min.
- `POST /api/device/capture` — multipart JPEG; server stores, runs vision AI, writes a Log `device.capture` with the caption. Stores only if user enabled camera in settings.
- Telemetry feeds the Memory/QIE engines as an additional context source (weather ground truth beats city-level `/api/weather`).

## 6. Protocol hardening
HTTPS only; HSTS; per-token rate limits (60 req/min); idempotency key on every POST (`X-Idem`); payload size cap 64 KB (capture 300 KB); server clock returned in `Date` header, device fixes RTC from it.

## 7. Software to connect with firmware
`tools/pager-sim.mjs` is a Node reference device: pairs, long-polls, prints notifications, presses "Copy" on keypress, posts the log. Use it before hardware exists and as the firmware's contract test.
