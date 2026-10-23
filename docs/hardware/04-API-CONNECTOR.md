<!--
  LOT SYSTEMS CORPORATION
  COSMO® CIA — Vadik, Inventor
  Made in the USA | brand.lot-systems.com
-->

# 04 — LOT API Connector & Software

## Existing site facts (verified in repo)
- `POST /api/logs` accepts `{ text, event?, metadata? }` and writes a Log row for `req.user` (src/server/routes/api.ts). It requires a logged-in **user session**; a device has none.
- `GET /api/live-message` returns one global string (set via admin-api). Not per-user, not queued.
- Log tab route: `/log` (src/client/stores/router.ts).
- **Gap:** no device model, no device token auth, no per-user notification queue.

## Proposed additions
**Model `Device`**: id, userId, name, tokenHash, lastSeenAt, firmware, batteryPct, createdAt.
**Model `DeviceNotification`**: id, userId, text(≤120), source('ai'|'manual'), createdAt, deliveredAt.

| Route | Auth | Behavior |
|---|---|---|
| `POST /api/devices` | user session | create device, return one-time token |
| `GET /api/device/poll?since=` | `Authorization: Bearer <device token>` | long-poll; returns next undelivered notification(s) |
| `POST /api/device/log` | device token | writes Log via the same code as `/api/logs`; `event: "device_copy"`, `metadata: { deviceId, battery }` |
| `POST /api/device/telemetry` | device token | stores sensor batch (T/H/P/IAQ/lux) -> feeds Weather/Context |
| `POST /api/device/ack` | device token | mark delivered |

**AI producer:** a scheduler job uses existing AI engines + memory context to write ≤120-char notifications (e.g. "Coffee time!") with rate-limit (e.g. ≤ 6/day) and quiet hours.
**Log tab:** render `device_copy` rows with a device glyph.

## Device-side software
- **Flasher/provisioner page** on the site: Web Serial (Chrome) -> flash firmware, enter Wi-Fi, paste token.
- **OTA** channel with signed images.
- **Factory tool**: CLI that flashes, runs self-test, burns serial, prints a QR label.

## Security
Token hashed at rest; revoke per device; TLS only; rate limits; camera upload off by default; no secrets in firmware images.
