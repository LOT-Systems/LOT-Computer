# 06 · LOT API Connector — Device ↔ lot-systems.com

**Base:** `https://lot-systems.com/api/device/v1`
**Reference implementation:** `hardware/lot-tile/connector/device-api.ts` (a Fastify plugin with the same stack as `src/server/routes/*`; **not registered yet**)
**Simulator:** `node hardware/lot-tile/connector/device-sim.mjs` (runs a device against a mock of this API)

## 1. Why a separate device API

The site's `/api/*` routes are protected by browser session cookies (see `src/server/server.ts`). A device cannot use cookies, so it gets:
- a **device token** (Bearer), scoped to a single user and allowed to call only `/api/device/v1/*`;
- request bodies that are CBOR when the device asks for them (`Content-Type: application/cbor`), and JSON otherwise;
- a rate limit of 120 requests per hour per device.

## 2. Data model (new tables)

```sql
-- migration draft: hardware/lot-tile/connector/migration-devices.sql
devices(id uuid pk, user_id uuid fk users, serial text unique, name text,
        token_hash text, fw_version text, mode text default 'calm',
        camera_enabled bool default false, last_seen_at timestamptz,
        battery_pct int, created_at, updated_at)
device_notifications(id uuid pk, user_id uuid, device_id uuid null,
        text varchar(96), kind text, deliver_at timestamptz,
        delivered_at timestamptz null, read_at timestamptz null,
        source text,  -- 'ai' | 'system' | 'user'
        created_at)
device_pair_codes(code char(6) pk, serial text, expires_at timestamptz,
        user_id uuid null)
```

## 3. Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/pair/start` | none (serial + factory secret HMAC) | Device asks for a 6-digit pairing code and shows it on screen |
| POST | `/pair/claim` | **user session** (site) | The user types the code, or the camera scans the QR shown by the site, and the code is linked to the account |
| POST | `/pair/poll` | none (serial + HMAC) | The device collects its token once the code has been claimed |
| POST | `/sync` | device token | **Main call, once per wake.** Body: pending `events[]` + `telemetry`. Response: new notifications, `acked_seq`, `next_wake_at`, config, OTA hint |
| POST | `/ack` | device token | `{ids:[…]}` marks notifications as delivered or read |
| POST | `/events` | device token | Button and gesture events outside a sync (Live mode). **COPY is handled the same way through `/sync` or `/events`** |
| POST | `/telemetry` | device token | Sensor readings and battery |
| POST | `/snap` | device token | JPEG ≤ 60 KB, only if `camera_enabled` |
| GET | `/ota` | device token | `{version, url, sha256, sig}` |

### 3.1 `POST /sync` response

```json
{
  "now": "2026-11-18T09:40:58Z",
  "notifications": [
    { "id": "n_7Qx", "text": "Coffee time!", "kind": "nudge", "at": "2026-11-18T09:41:00Z" }
  ],
  "acked_seq": 412,
  "next_wake_at": "2026-11-18T12:30:00Z",
  "next_wake_epoch": 1795005000,
  "cfg": { "mode": "calm", "camera": false, "tz": "America/New_York", "units": "C" },
  "ota": null
}
```

How `next_wake_at` is chosen:
1. If a notification is scheduled within the next 6 h → its `deliver_at` minus 30 s.
2. Otherwise → the next check-in window from the user's circadian schedule (the server already has `getCircadianPhase`).
3. Always capped at 3 h, so no notification can be more than 3 h late.

## 4. Where notifications come from

A new scheduled job, `device-nudges`, runs in `src/server/scheduled-jobs.ts`. It reuses the AI engine manager (`aiEngineManager` in `src/server/utils/ai-engines.ts`) to produce at most 6 nudges per day per paired user. Each nudge is 96 characters or fewer, and each fits the user's local time, the weather (`/api/weather`, plus the device's own BME688/UV readings) and Memory engine context.
Examples: "Coffee time!", "UV 6 outside — shade at noon.", "Air is stale. Open a window.", "Evening log: one word for today?"

## 5. COPY → Log tab (requirement #16)

**Device → server**

```http
POST /api/device/v1/events
Authorization: Bearer <device-token>
Content-Type: application/json

{ "events": [ { "type": "copy", "notification_id": "n_7Qx", "ts": "2026-11-18T09:41:07Z", "seq": 412 } ] }
```

**Server action** (identical to the existing Log writes in `src/server/routes/api.ts`):

```ts
await fastify.models.Log.create({
  userId: device.userId,
  event: 'device_copy',
  text: notification.text,               // "Coffee time!"
  metadata: { deviceId: device.id, serial: device.serial,
              notificationId: notification.id, kind: notification.kind,
              pressedAt: evt.ts, source: 'lot-tile' },
  context: await getLogContext(user),
})
```

**Response:** `{ "acked_seq": 412 }`. The device then removes everything up to sequence 412 from its RTC ring buffer.

**Idempotency:** the pair `(device_id, seq)` is unique, so a retried request never creates a second Log row.

**Site UI:** the Log tab shows the row as `⧉ Coffee time!  · from LOT TILE`. This needs `'device_copy'` added to the `LogEvent` union in `src/shared/types/index.ts`, plus a renderer in the Log tab.

## 6. Telemetry

```json
{ "ts": "…", "t": 21.4, "rh": 48, "p": 1013.2, "iaq": 42, "iaq_acc": 3, "voc": 0.6,
  "uv": 2.1, "lux": 830, "batt": 81, "rssi": -61, "fw": "0.1.0" }
```
This is stored as `Log(event: 'device_telemetry')`, kept to one row per hour. The latest readings are merged into the weather widget as "at your desk / in your pocket" data.

## 7. Compression (requirement #8, device side)

| Technique | Saving |
|---|---|
| CBOR with integer keys (`0:t, 1:rh, …`) instead of JSON | ~55% smaller |
| Telemetry delta: only send fields that changed by more than a threshold | ~70% fewer bytes |
| Batch events and telemetry into the sync request (one TLS handshake) | ~1.5 s less radio time per wake |
| TLS session tickets | Handshake 1.4 s → 0.3 s |

## 8. Privacy

- The camera is **off by default**. It is enabled per device in site Settings, and the privacy LED is wired in hardware (doc 04).
- Snaps are stored like other user uploads and removed by the user's existing data-deletion path.
- Telemetry is never shared across users. Precise location is not collected; the user's timezone and city come from their site settings.
