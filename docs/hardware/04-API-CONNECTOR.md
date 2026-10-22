# LOT Device API (proposed — not yet implemented)
Matches existing Fastify routes in `src/server/routes/api.ts`; reuses the Log model (`/api/logs`).
Auth: per-device token (issued on pairing, stored in NVS), header `Authorization: Bearer <device_token>`. Never reuse user session cookies.

- `POST /api/device/pair` {code} → {deviceId, token} (code shown on lot-systems.com settings)
- `GET  /api/device/notifications?since=<id>&wait=25` → long-poll; [{id, text:"Coffee time!", haptic:"short", ttl}]
- `POST /api/device/ack` {id}
- `POST /api/device/event` {type:"copy"|"photo"|"boot", ts, battery} → creates Log event `device_copy` (add to `displayableEvents` in `/logs`)
- `POST /api/device/telemetry` {temp, rh, pressure, voc?, battery} (rate-limit 1/min)
- `POST /api/device/photo` multipart, opt-in only

AI side: scheduled job (existing `scheduled-jobs.ts`) picks nudges from user context and inserts notifications; short text ≤ 32 chars for the screen.
Security: rate limits, token revocation, TLS 1.2+ with pinned CA bundle, OTA signed images.
