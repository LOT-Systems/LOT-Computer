# LOT SQ-1 — LOT Device API v1 (Connector)

**Document:** LOT-SQ1-06 · **Version:** 0.1 · **Date:** 2026-11-15
**Code:** `hardware/LOT-SQ1/software/`

## 1. Why a separate device API

The lot-systems.com web app authenticates with a **session cookie** (`config.jwt.cookieKey`, looked up in `Session` in `src/server/index.ts`). A 40 mm pager can't log in by email code and shouldn't hold a user session. The device gets its own **revocable bearer token**, which is bound to one user and one serial number.

## 2. Pairing

```
User (web)                       Server                          SQ-1
Settings → Devices → "Add"  ──►  create pairing code 6 digits
                                  (10 min TTL, userId)
                                                         ◄──  POST /pair {code, serial, fw}
                                  verify, create device,
                                  return device_token  ──────►  store in NVS
Settings shows "SQ-1 · 0042 · online"
```

## 3. Endpoints (prefix `/api/device/v1`)

All requests except `/pair` send `Authorization: Bearer <device_token>`. Bodies are JSON unless noted otherwise. On the device side, every reply is kept under 512 bytes.

### `POST /pair`
Request `{ "code": "472916", "serial": "SQ1-0042", "fw": "0.1.0" }`
Response `200 { "device_token": "lotd_…", "device_id": "uuid", "name": "Vadik" }` · `400 invalid_code`

### `POST /sync`: the pager heartbeat (compressed session)
Request:
```json
{ "fw": "0.1.0", "bat": 87, "rssi": -61,
  "env": { "t": 22.4, "h": 41, "p": 1012.6, "iaq": 38, "gas": "coffee" },
  "seen": ["n_81"], "wake": "timer" }
```
Response:
```json
{ "notification": { "id": "n_82", "text": "Coffee time!", "buzz": 2 },
  "next_sync_s": 900, "quiet": false, "fw": null }
```
* `notification` is `null` when nothing is new. The device then leaves the screen as it is and goes back to sleep.
* `next_sync_s` is chosen by the server (60–7200). This is how the AI trades freshness against battery life.
* `env` is stored as the `device_telemetry` Log metadata, at most one row per hour (compressed). It also feeds the weather/context layer next to the existing `/api/weather`.

### `POST /copy`: the COPY button
Request `{ "notification_id": "n_82", "text": "Coffee time!", "at": "2026-11-15T09:02:11Z" }`
Effect: `Log.create({ userId, event: 'device_copy', text, metadata: { source: 'sq1', deviceId, notificationId } })`
Response `200 { "ok": true, "log_id": "uuid" }`

The entry appears in the user's **Log** tab on lot-systems.com. The `/api/logs` handler already returns every event for the user. HW-02 adds a small "◻ copied from SQ-1" badge to the Log UI.

### `POST /photo`: long-press capture
Headers `Content-Type: image/jpeg`, `X-Notification-Id: n_82` · Body: JPEG ≤ 200 kB (VGA, q≈12)
Effect: the image goes to object storage, then `Log.create({ event: 'device_photo', metadata: { url, notificationId } })`
Response `200 { "ok": true, "log_id": "uuid" }`

### `DELETE /device` (from the web, cookie auth): revoke a device

## 4. Where notifications come from

On the server, `pickNotification(user, device)`:
1. An **explicit queue**: rows in `device_notifications` that the AI engines (`src/server/utils/ai-engines.ts`, `contextual-prompts.ts`) or the admin push with `{userId, text, notBefore}`.
2. A **circadian fallback**: for example morning → "Coffee time!", midday → "Water + 10 breaths", evening → "Screens down. Tea?". This means a new device is useful on day 1.
3. **Sensor triggers**: `env.gas == 'coffee'` → "Coffee's brewing. Log the ritual?"; `iaq > 150` → "Open a window for 3 minutes".

Text limit: **48 characters** (it fits 3 lines at 24 px on 200×200). The AI prompt must enforce this.

## 5. Data model (migration for HW-02)

```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY, user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  serial TEXT UNIQUE NOT NULL, token_hash TEXT NOT NULL, fw TEXT,
  last_seen_at TIMESTAMPTZ, last_telemetry_at TIMESTAMPTZ, battery INT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ);
CREATE TABLE device_pairing_codes (
  code TEXT PRIMARY KEY, user_id UUID NOT NULL, expires_at TIMESTAMPTZ NOT NULL);
CREATE TABLE device_notifications (
  id UUID PRIMARY KEY, user_id UUID NOT NULL, text VARCHAR(48) NOT NULL,
  buzz INT DEFAULT 2, not_before TIMESTAMPTZ, delivered_at TIMESTAMPTZ, created_at TIMESTAMPTZ);
```
Only the token **hash** (SHA-256) is stored. The device keeps the raw token.

## 6. Security

* Tokens use the `lotd_` prefix and carry 32 random bytes. Lookups compare hashes in constant time.
* Rate limits: `/pair` 5/min/IP, `/sync` 1 per 30 s per device, `/photo` 10 per hour.
* Photos are private to the owning user, and EXIF is stripped on the server.
* Revoking a device from Settings deletes the token at once, and the device then shows the pairing screen.

## 7. Software in this repo

| Path | What it is | Status |
|---|---|---|
| `software/server-connector/device-api.ts` | Fastify plugin in the style of `src/server/routes/*` | Reference; **not registered** in production |
| `software/mock-server/mock-lot-server.mjs` | Dependency-free Node mock of the v1 contract | Runs |
| `software/device-sim/device-sim.mjs` | Simulates SQ-1 firmware: pair → sync → copy → photo | Runs; used as the contract test |
