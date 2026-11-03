# 03 — LOT API Connector (Device ↔ lot-systems.com)

Status: **PROPOSAL.** Existing server routes (`src/server/routes/`: `api.ts`, `os-api.ts`,
`public-api.ts`, `admin-api.ts`, `auth.ts`) expose status/OS/diagnostic endpoints only;
**no device endpoints exist yet.** lot-systems.com, brand.lot-systems.com and
institute.lot-systems.com were not reachable from this session (network allow-list), so
brand/CQGS content was not reviewed — see "Open items".

## Transport & auth
- HTTPS (TLS 1.2+, pinned CA), JSON. Device token `Authorization: Bearer <device_token>`;
  token issued at provisioning (05), stored hashed server-side, revocable.
- Device ID: `LOT-PGR-<8 hex>` derived from ESP32 eFuse MAC.

## Endpoints (new, prefix `/api/device`)
| Method | Path | Purpose |
|---|---|---|
| POST | /register | claim device with one-time code → returns token |
| GET | /inbox?since=<id>&wait=25 | long-poll notifications `[ {id,title,body,priority,ts,expires} ]` |
| POST | /ack | `{id, shown_at}` delivery receipt |
| POST | /event | `{type:"copy"\|"boot"\|"battery"\|"error", ts, payload}` → writes Log tab entry |
| POST | /telemetry | `{t_c, rh, p_hpa, voc, battery_pct, rssi}` every 5–15 min |
| POST | /photo | multipart JPEG, on request flag from inbox |
| GET | /config | sleep intervals, quiet hours, firmware target version |
| GET | /firmware/<ver> | signed OTA image |

## Copy button semantic
Short press → `event {type:"copy", payload:{notification_id}}` → server stores in the
user's Log (new `device_events` table or existing log model; migration under
`migrations/`) and shows it in the **Log tab**. Screen confirms "COPIED ✓". Offline presses are
queued in flash (≤50) and flushed in order with original timestamps.

## AI notification path
Server-side scheduler/AI engine (`aiEngineManager`) produces messages (≤80 chars, ASCII+
basic Latin for the bitmap font) → inserts `device_notifications` row → delivered on next
poll. Rate limit 12/h; quiet hours honoured; priority `high` triggers buzzer.

## Security
Per-device token, replay-safe timestamps, rate limits, signed firmware (ESP32 secure boot v2 on
production run), no secrets in firmware images, camera only on explicit server request AND
with a visible LED + on-screen indicator.
