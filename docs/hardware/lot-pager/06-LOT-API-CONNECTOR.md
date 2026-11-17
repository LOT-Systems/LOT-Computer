---
title: "LOT PAGER — 06 · LOT API Connector Specification"
subtitle: "Hardware programme HW-01 · API v1 · 2026-11-17"
---

# LOT PAGER — 06 · LOT API CONNECTOR

```
DOCUMENT   HW-01 / 06-API
SERVER     src/server/routes/device-api.ts · src/server/utils/device.ts
MOUNT      /api/devices/*        (user, cookie session — inside /api)
           /api/device/v1/*      (device, Bearer token — sibling of /api/public)
STORAGE    user.metadata.devices[] (≤ 5) · user.metadata.pager.queue[] (≤ 20) — no migration
LOG EVENT  device_copy (added to the Log tab's displayable events + PAGER: renderer)
TESTS      15 assertions green (unit + Fastify inject end-to-end), S1
```

## 1 · User endpoints (logged-in, cookie)

| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/api/devices/pair` | `{ name? }` | `{ id, name, token, note }` — **token shown once** |
| GET | `/api/devices` | — | `[{ id, name, createdAt, lastSeenAt, firmware, telemetry }]` |
| DELETE | `/api/devices/:id` | — | `{ ok: true }` |
| POST | `/api/devices/notify` | `{ text }` | queued message `{ id, text, source:"site", … }` |

## 2 · Device endpoints (`Authorization: Bearer lotd.<userId>.<deviceId>.<secret>`)

| Method | Path | Body / Query | Returns |
|--------|------|--------------|---------|
| GET | `/api/device/v1/frame` | `?fw=0.1.0&bat=80` | **Frame** (below) |
| POST | `/api/device/v1/copy` | `{ i?: msgId, m?: text }` | `{ ok, id }` → Log row `device_copy` |
| POST | `/api/device/v1/telemetry` | `{ t, h, p, iaq, lux, bat }` (each optional, range-checked) | `{ ok }` |

Rate limits: frame 30/min · copy 20/min · telemetry 10/min · pair 5/min · notify 30/min.

## 3 · Frame

```json
{ "v":1, "i":"tMIjTh8q", "m":"Coffee time!", "s":"autonomous", "ts":1794921138, "n":900, "q":0 }
```

| Key | Meaning |
|-----|---------|
| `v` | frame version |
| `i` | message id (null = nothing new — keep current screen) |
| `m` | message, ≤ 52 printable ASCII chars |
| `s` | `autonomous` (rule engine) · `ai` (AI-rephrased) · `site` (user-sent) |
| `ts` | server time (s) — device syncs its RTC |
| `n` | seconds until the next poll (60 when more are queued; 900 by day; 3600 by night or < 10 % battery) |
| `q` | how many more messages wait |

## 4 · Compression — "compress the information in each session"

1. **Text:** `compressForPager()` strips markdown/emoji, transliterates to ASCII, collapses
   whitespace, cuts on a word boundary, marks truncation with `~`. Max 52 chars.
2. **Transport:** one GET per wake, short keys, ≈ 81 bytes. No history, no lists.
3. **Server state:** queue capped at 20, devices at 5; telemetry is a single latest snapshot
   (not a Log row per reading), so 100 devices polling all day add zero Log noise.

## 5 · Autonomous notifications ("Coffee time!")

On each poll, if nothing is queued and ≥ 90 min have passed since the last autonomous
nudge, the server composes one from the **user's local time zone** and the **device's own
sensors**, sensors first:

| Trigger | Message |
|---------|---------|
| IAQ > 150 | Air is heavy. Open a window. |
| RH < 30 % | Dry air. Drink some water. |
| T > 28 °C / < 16 °C | Warm in here. Cool down, hydrate. / Cold room. Warm tea time. |
| Battery < 15 % | Battery low. Place me on the charger. |
| 07–09 | Coffee time! (weekend: Slow morning. Coffee time!) |
| 09–11 | Deep work window. One task. |
| 12–14 | Lunch. Step away from the screen. |
| 15–17 | Stretch. Two minutes. Now. |
| 17–19 | Walk outside. Look far away. |
| 21–23 | Wind down. Screens off soon. |

With `LOT_PAGER_AI=1`, the seed is rephrased by the existing `aiEngineManager`
(local-first fallback order, 4 s timeout, ≤ 7 words) and falls back to the seed on any error.

## 6 · COPY → Log tab

`POST /copy` writes `Log { event: "device_copy", text, metadata: { deviceId, deviceName, messageId, source } }`.
The Log tab renders it as:

```
PAGER:
Coffee time!
COPY · Desk Pager · autonomous
```

## 7 · Security model

- Secret = 24 random bytes (base64url). Only `sha256(secret)` stored; `timingSafeEqual` compare.
- Device surface has its own plugin scope — cookie auth hook of `/api` does not apply, and
  device tokens cannot call user endpoints.
- Revocation is immediate (next request → 401).
- All numeric telemetry is range-checked; unknown keys ignored.
