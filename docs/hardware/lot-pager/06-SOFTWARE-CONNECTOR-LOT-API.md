<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT PAGER · TILE-40 — 06 · SOFTWARE CONNECTOR AND LOT API

```
DOCUMENT   HW-06 / CONNECTOR
ISSUE      2026-11-26 · rev 0.1
SOURCE     hardware/lot-pager/connector/lot-pager.mjs  (Node 18+, zero deps)
SERVER     src/server/routes/api.ts (existing routes; no change in this session)
```

## 00 · EVT-0 CONTRACT: existing routes, verified in the repo source

All routes sit under `/api` and require the `auth_token` cookie. That is the session JWT, set by
`/auth`, valid for 30 days, and checked in `src/server/server.ts`.

| Device action | Method + path | Body / response | Source |
|---------------|---------------|-----------------|--------|
| Get autonomous lines | `GET /api/contextual-prompts` | `{ prompts: [{ type, title, message, priority 0-10, triggeredBy }] }` | `api.ts` ~L3334, `utils/contextual-prompts.ts` |
| Get global line | `GET /api/live-message` | `{ message }` | `api.ts` ~L820 |
| **COPY → Log tab** | `POST /api/logs` | `{ text ≤3000, event: "note", metadata: { source: "lot-pager", action: "copy", deviceId, fw, noticeSource, deviceWeather{tempC,humidity,pressureHPa,gasKOhm} } }` → the created Log | `api.ts` ~L1564 |
| Instant push (optional) | `GET /api/sync` (SSE) | `data: {"event":"live_message","data":{...}}` + 15 s pings | `api.ts` ~L326 |

**Why `event: "note"`:** the Log tab (`GET /api/logs`) always shows `note` entries, including
for users with `hideActivityLogs`. A device Copy is therefore always visible. The server adds
`context`, which holds the server-side weather and time, on its own through `getLogContext()`.

## 01 · HOST CONNECTOR (`lot-pager.mjs`)

It mirrors the firmware's HTTP contract exactly. This lets the server path be checked before
the hardware exists, and it provisions the firmware.

```bash
export LOT_HOST=lot-systems.com            # or localhost:3000 for a dev server
export LOT_AUTH_TOKEN=<test-account JWT>
node lot-pager.mjs notice                  # → { text, source, priority }
node lot-pager.mjs copy "Coffee time!"     # → { status: 200, body: <Log> }
node lot-pager.mjs compress "<long text>"  # same algorithm as firmware lot::compress
node lot-pager.mjs provision --ssid … --pass … --token … --id TILE40-EVT0-001
```

## 02 · EVT-1 DEVICE API: proposal, not built yet

The full-account JWT is the wrong credential for a device you can lose. The proposal is a
**scoped device token**:

```
POST /api/device/pair/start      (device, unauth)   → { code: "K7Q-2MX", pairId }      code TTL 10 min
POST /api/device/pair/confirm    (user, cookie)     { code }       → binds device to user
GET  /api/device/pair/:pairId    (device, poll)     → { deviceToken }  once confirmed (shown once)
GET  /api/device/notice          (device token)     → { text ≤64, id, priority, buzz: bool }
POST /api/device/copy            (device token)     { noticeId, text, sensors } → Log(note)
POST /api/device/snap            (device token)     image/jpeg ≤200 kB → AI caption → Log(note)
GET  /api/device/firmware?v=     (device token)     → 204 | signed OTA image URL
DELETE /api/device/:id           (user, cookie)     revoke
```

**Data model:** a new `devices` table holding `id`, `userId`, `name`, `tokenHash` (sha256),
`scopes[]`, `lastSeenAt`, `fw` and `createdAt`. It needs a migration in `migrations/` and a model in
`src/server/models/`.

**Scopes:** `notice:read`, `log:write`, `snap:write`. A device can never read the user's Log
history, memory or chat.

**`/api/device/notice` server logic.** It reuses the existing engines and adds a "device line"
policy:

1. Take the top contextual prompt (QIE patterns) if one was created in the last 30 minutes.
2. Otherwise generate a short AI line with the existing AI engine, using
   *"one sentence, ≤ 64 chars, no emoji, self-care, timed to the user's local hour"*.
   Examples: "Coffee time!", "Water. Then the window.", "Evening. Log one thing."
   Cache the line for 15 minutes per user so cost stays bounded.
3. Return `buzz: true` only when the text changed and the hour is between 07:00 and 22:00 local.

**UI:** Settings → Devices lists paired tiles, shows when each was last seen, and offers Revoke.
In the Log tab, entries with `metadata.source = "lot-pager"` get a small "Tile." suffix.

## 03 · SECURITY NOTES

- Store only a hash of the device token. Rate-limit `copy` and `snap` to 30 per hour per device.
- `snap` images are deleted after captioning. They are never written to disk unencrypted.
- Pairing codes are single-use and expire after 10 minutes. Brute force is capped at 5 tries per pairId.
