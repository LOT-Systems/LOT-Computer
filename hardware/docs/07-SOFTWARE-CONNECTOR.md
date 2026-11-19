# 07 · Software connector: LOT API ↔ firmware

*Session 01 · 2026-11-19*

## 1. Pieces

| Piece | Path | State |
|---|---|---|
| Protocol (this doc) | `docs/07-SOFTWARE-CONNECTOR.md` | v0.1 draft |
| Reference client + mock server | `software/connector/lot-device-sim.mjs` | **Runs. 8/8 checks pass** (`--mock`) |
| Server routes draft (Fastify) | `software/server-draft/device-api.ts` | Draft. Not compiled or registered |
| DB migration draft | `software/server-draft/device-migration.draft.cjs` | Draft. Outside `migrations/` |
| Firmware client | `firmware/src/lot_client.cpp` | Skeleton, same protocol |

## 2. Why a new device API

The site authenticates with a JWT **cookie session** (`src/server/server.ts`). A pager has no browser and no keyboard. So the device gets:

- **Pairing**: the user taps *Add device* on the site and sees a 6-digit code that's valid for 10 minutes. They type it into the device setup page (served by the device over BLE/SoftAP). The device claims the code.
- **Device token**: `lotd_…` (192-bit random). The server stores only its SHA-256. It can be revoked from the site. It's sent as `Authorization: Bearer`.

## 3. Endpoints (base `https://lot-systems.com/api/device/v1`)

| Method | Path | Auth | Body → Response |
|---|---|---|---|
| POST | `/pair/start` | site cookie | → `{ code, expiresAt }` |
| POST | `/pair/claim` | none (rate-limited) | `{ code, deviceId, hw, fw }` → `{ deviceToken, pollSeconds }` |
| GET | `/inbox?since=<cursor>` | bearer | → `{ cursor, messages:[{id,text,kind,buzz,createdAt}], digest, pollSeconds, serverTime }` |
| POST | `/copy` | bearer | `{ messageId, text, at }` → `{ logId }`. **Creates a `Log` row with `event:"device_copy"`** |
| POST | `/telemetry` | bearer | `{ readings:[{t,c,rh,hpa,iaq,gasClass,batt,rssi}] }` (≤ 96) → 204 |
| DELETE | `/token` | bearer | → 204 (factory reset / unpair) |
| GET | `/devices` | site cookie | list the user's devices |
| DELETE | `/devices/:id` | site cookie | revoke a device |

Rules:
- `text` on the device is ≤ **80 characters**: 16 columns × 5 lines on the 128 × 128 LCD with an 8 × 16 font. The server truncates.
- The `cursor` is a monotonically increasing `seq`, so a message is never shown twice even after a reboot (the cursor is kept in RTC memory and NVS).
- `pollSeconds` comes from the server, so the site can slow devices down at night or speed them up while the user is active.

## 4. The Copy flow (requirement 16)

```
[user presses button]
   ESP32 wakes (RTC GPIO) → short buzz → LCD shows "Copied." for 1.5 s
   → POST /copy { messageId, text: <current screen text>, at }
   → server: Log.create({ userId, event:"device_copy", text, metadata:{source:"L-01", deviceId, messageId} })
   → Log tab on lot-systems.com shows the line at the top, same as a typed log
   offline? → queued in NVS (max 20), sent on next successful wake
```

Optional site change (small): in the Log tab, show a tiny `L-01` label when `metadata.source === "L-01"`.

## 5. The AI notifier (requirement 2)

The server writes `DeviceMessage` rows. The sketch is at the bottom of `device-api.ts`. It runs in `scheduled-jobs.ts` every 15 minutes, uses `aiEngineManager.getEngine('auto').generateCompletion()`, and gets context from the circadian phase, weather (`/api/weather` utilities) and recent logs. Guardrails: at most 6 per day, quiet hours 22:00–08:00, no repeats within 24 h, the model may answer `SKIP`.

Example outputs: *"Coffee time."* · *"Rain at 4 pm. Take the coat."* · *"Air is stale. Open a window."* (from BME688 IAQ telemetry) · *"You logged nothing today. One line?"*

## 6. Test it

```bash
node hardware/software/connector/lot-device-sim.mjs --mock
# against staging once P1b is deployed:
node hardware/software/connector/lot-device-sim.mjs --base https://<staging>/api/device/v1 --code 123456
```

Mock run, session 01: **8/8 checks passed** (pair, inbox, LCD length, copy → Log, Log has `device_copy`, telemetry, cursor stops repeats, bad token → 401).
