---
title: "LOT-01 SQUARE — LOT API Connector"
subtitle: "Doc 07 · Device ↔ lot-systems.com protocol v1 · Rev A (2026-11-24)"
---

# LOT API Connector — Protocol v1

Base: `https://lot-systems.com/api/public/device`. This sits under the existing
public (no-cookie) API prefix in `src/server/routes/index.ts`. Device calls
authenticate with a **device token**, not a session cookie.

## 1. Pairing

```
User (logged in, web)                 Server                         Device (PAIR mode, BLE)
 Settings → Devices → "Pair" ──►  POST /api/device/pair-code
                               ◄──  { code: "482913", expires_in: 600 }
 enters Wi-Fi + code in the companion page (Web Bluetooth) ───────────────► stores creds
                                                     POST /claim {code, did, fw} ◄── device
                                  verifies code, creates Device row,
                                  token = random 32 B, stores sha256(token)
                                                     ──► { token, user_name, next_poll_s }
```

* Pair codes are single-use, expire after 10 minutes, and are rate-limited per user.
* The token is shown once and never stored in plaintext on the server. The user can revoke it in Settings → Devices.

## 2. Endpoints

All responses are `application/json`. Auth header: `Authorization: Device <token>`.

| Method | Path | Body | Response | Notes |
|---|---|---|---|---|
| POST | `/claim` | `{code, did, fw, hw}` | `{token, name, next_poll_s}` | No auth. 5 attempts/min per IP |
| GET | `/inbox?after=<cursor>` | — | `{msgs:[{id,t,k,ts,ttl,buzz}], cursor, next_poll_s, quiet, face:{state,tc}}` | Supports `ETag` / `If-None-Match` → `304` |
| POST | `/copy` | §7 of doc 06, or multipart with `photo` | `{ok:true, logId}` | Idempotent on `(did, m, ts)` |
| POST | `/ack` | `{ids:[...]}` | `{ok:true}` | Marks notes as shown |
| POST | `/telemetry` | `{b, rssi, fw, up, s:{…}}` | `{ok:true, ota?:{url,ver,sha256,sig}}` | Hourly. Updates `lastSeenAt` |

Message fields: `t` text (≤ 42 chars), `k` kind (`nudge`, `ritual`, `weather`,
`system`), `ttl` seconds until the note expires on the device, `buzz` pattern
(0 = silent, 1 = single, 2 = double).

## 3. Log integration (brief item 16)

`/copy` creates a row in the existing `logs` table:

```ts
Log.create({
  userId: device.userId,
  event: 'device_copy',
  text: body.t,                         // the note that was on screen
  metadata: { source: 'lot-01', deviceId, messageId: body.m, photo?: assetUrl },
  context: { temperature: s.tc, humidity: s.rh, pressure: s.hp, iaq: s.iaq,
             battery: b, capturedAt: ts },
})
```

`'device_copy'` must be added to the `displayableEvents` list in `GET /api/logs`
(`src/server/routes/api.ts`) so it shows in the **Log** tab. Weather context uses
the same `context.temperature` key that `analyzeUserPatterns` already reads, so
device readings feed straight into the weather-mood pattern detection.

## 4. Pager Composer (brief item 2)

A scheduled job (in `src/server/scheduled-jobs.ts`):

1. For every user with an active device, every 15 minutes, collect candidates:
   * `generateContextualPrompts(...)` output (already used by `/api/contextual-prompts`)
   * circadian phase (port of the client-side `getCircadianPhase` from `src/client/stores/intentionEngine.ts`), local weather, and the user's rituals (morning beverage and similar from the Memory Engine)
2. Score: `priority`, novelty (not sent in the last 24 h), time fit, and quiet hours.
3. **Compress** the winner with the LOT AI engine (`src/server/utils/ai-engines.ts`) using a fixed instruction: *"Rewrite as a calm pager note, max 42 characters, no emoji, imperative or noun phrase. Example: 'Coffee time!'"*. Validate the length on the server and fall back to the prompt `title`.
4. Insert into `device_messages`. At most 6 notes per day (adjustable in Settings).

## 5. Session compression (brief item 8)

Each device keeps a **session digest** on the server, at most 280 characters,
rewritten after each sync from the last digest plus new copies/acks. Example:
`"AM: coffee 08:10 copied; walk skipped; 21°C indoor, IAQ good; 2 notes ignored."`
The composer reads the digest instead of raw logs, which keeps AI calls small and
avoids repeated notes. Payloads stay small: inbox ≤ 512 B, ETag hit = 0 B body.

## 6. Server implementation plan (Session 2, with a green build)

| File | Change |
|---|---|
| `migrations/NNN-devices.ts` | `devices(id, userId, name, tokenHash, fw, hw, lastSeenAt, battery, digest, createdAt)` and `device_messages(id, deviceId, userId, text, kind, buzz, ttl, deliveredAt, ackedAt, createdAt)` and `device_pair_codes(codeHash, userId, expiresAt)` |
| `src/server/models/device.ts`, `device-message.ts` | Sequelize models (pattern of `log.ts`) |
| `src/server/routes/device-api.ts` | Endpoints above. Registered at `/api/public/device` in **both** `src/server/index.ts` and `src/server/server.ts` |
| `src/server/routes/api.ts` | `POST /api/device/pair-code`, `GET/DELETE /api/devices`, add `device_copy` to `displayableEvents` |
| `src/server/scheduled-jobs.ts` | Pager Composer job |
| `src/client/...` | Settings → Devices panel (pair, rename, revoke, battery, last seen) |

The reference behaviour is in `tools/lot01-sim.mjs`, which runs a mock of these
endpoints and a simulated device end to end.

## 7. Security checklist

* Tokens: 256-bit random, stored as SHA-256, compared in constant time, revocable.
* Scope: a device token can only read its inbox and write `device_copy`/telemetry for its owner.
* Rate limits: 60 req/h/device on inbox, 30/h on copy, 2 MB/day photos.
* TLS only. The device pins the cert bundle (ESP x509 bundle), not a single leaf cert.
* Photos: store as private assets. EXIF is irrelevant (raw JPEG from the sensor), but strip it anyway.
