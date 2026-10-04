# LOT-HW1 — LOT API Connector (Document 05 of 06)

Status: **specification only. No server code was changed.** Everything marked EXISTS was read in this repo on 2026-10-04; everything marked NEW is proposed.

## 1. What already exists on the site (VERIFIED in `src/server/routes/api.ts` and models)

| Piece | Where | Use for the device |
|---|---|---|
| `GET /live-message` | `api.ts` ~L820; model `LiveMessage` | Existing single site-wide message — proves the "site pushes text" pattern, but it is global, not per-device |
| `POST /logs` `{text, event?, metadata?}` | `api.ts` ~L1563 | Creates a Log row for the **logged-in user** (cookie session). Text is trimmed to `MAX_LOG_TEXT_LENGTH`. |
| `GET /logs` | `api.ts` ~L1082 | Returns logs, **filtered by a whitelist of event names** (`displayableEvents`). A new event name will not show in the Log tab until it is added here. |
| `GET /weather` | `api.ts` ~L1038 | Server-side weather; usable as fallback for the device |
| Anthropic client + scheduled jobs | `src/server/scheduled-jobs.ts`, `routes/public-api.ts` | AI generation of notification text on a schedule |
| Auth | `routes/auth.ts` | Email-code login → cookie session token (`Session` model). **A device cannot use this**; it needs its own token type. |

## 2. Device pairing and auth (NEW)

1. Unpaired device calls `POST /api/device/pair/start` → `{pairCode: "483920", deviceId, expiresIn: 600}` and shows the code.
2. User, logged in on lot-systems.com, opens Settings → Devices → "Add device" and enters the code → `POST /api/device/pair/claim {pairCode, name}` (cookie-authenticated, existing auth).
3. Device polls `GET /api/device/pair/status?deviceId=…` and receives a long random **device token** once. Server stores only a **hash**.
4. All later calls: `Authorization: Bearer <deviceToken>`; token scoped to one user and the device endpoints only; revocable from the site; rate-limited (reuse the Fastify rate-limit pattern already used on `/world/generate-element`).

New table `device` (id, userId, name, tokenHash, createdAt, lastSeenAt, fwVersion, revokedAt). New table `device_notification` (id, userId, deviceId?, text, createdAt, deliveredAt, source: `ai|manual|rule`).

## 3. Notification flow ("pager-like from an AI site") (NEW)

- A scheduled job (existing pattern in `scheduled-jobs.ts`) or a user rule creates a `device_notification` row, e.g. `"Coffee time!"`. For AI-written text the job calls the existing Anthropic client with a short prompt and a **hard 120-character cap**, content checked server-side before storing.
- `GET /api/device/notifications?since=<id>` → `{items:[{id,text,createdAt}], pollSec}` (ETag/304 supported; empty responses tiny to save power).
- Device marks delivery with `POST /api/device/notifications/:id/ack`.

## 4. Button "Copy" → Log tab (NEW, small)

- `POST /api/device/events` body `{type:"copy", notificationId, text, ts, fw}`.
- Server validates device token, then creates a Log row for the owning user: `event: 'device_copy'`, `text: <notification text>`, `metadata: {deviceId, notificationId, source:'LOT-HW1'}` (uses the same `Log.create` as `POST /logs`).
- **Required companion change:** add `'device_copy'` (and later `'device_photo'`, `'device_sensor'`) to the `displayableEvents` list in `GET /logs`, otherwise the row exists but is hidden from the Log tab.
- Idempotency: `(deviceId, notificationId)` unique so a retry after a Wi-Fi drop does not duplicate.

## 5. Other endpoints (NEW)

| Method + path | Purpose |
|---|---|
| `POST /api/device/telemetry` | batched BME688/IMU/battery samples (every 10–15 min) |
| `POST /api/device/photo` | multipart JPEG ≤ 150 KB; server stores and writes a Log row `device_photo` |
| `GET /api/device/firmware` | OTA manifest `{version, url, sha256, signature}` |
| `GET /api/device/config` | poll interval, brightness, quiet hours |

## 6. Error and abuse handling

- 401 revoked/invalid → device shows "Re-pair" and stops polling.
- 429 → exponential backoff.
- Payload size limits per endpoint; reject unknown `type`.
- Device events never trigger AI generation directly (prevents loops/cost).

## 7. Test plan before the first unit exists

- Simulate a device with `curl` / a small script against a local dev server: pair, poll, ack, copy, confirm the Log tab shows the row.
- Unit tests for the new routes (pairing happy path, expired code, revoked token, duplicate copy).

---
AUTHORIZED BY: S-2 // VADIK MARMELADOV
