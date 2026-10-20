# LOT COMPUTER — Firmware & LOT API Connector Spec (draft)

Doc ID: LOT-HW-03 · Rev A · 2026-10-20
Status: **specification only.** None of the `/api/device/*` endpoints exist in the repo yet. Current auth is cookie-session (`src/server/routes/auth.ts`); logs are in the `Log` model (`userId, event, text, metadata, context`), listed via `GET /api/logs` with a whitelist of displayable events (`src/server/routes/api.ts`).

## 1. Server work needed (small)
1. `Device` model: `id, userId, tokenHash, name, lastSeenAt, fwVersion`.
2. Pairing: signed-in user opens Settings → "Pair device" → 6-digit code (10 min TTL). Device posts the code → receives a long-lived device token (stored hashed).
3. Routes under `/api/device` (prefix registered like `/api/public`), auth by `Authorization: Bearer <device token>`, rate limited.
4. Add events `device_copy`, `device_notification_ack`, `device_telemetry` to the `displayableEvents` whitelist so they appear in the Log tab.
5. Notification queue: AI engine / scheduled jobs write `DeviceNotification {id, userId, text, priority, expiresAt, deliveredAt}`.

## 2. Wire protocol (HTTPS, JSON, TLS 1.2+, pinned CA)

### 2.1 Pair
`POST /api/device/pair {code, hwId, fw}` → `{token, pollSeconds}`

### 2.2 Poll notifications (pager behaviour)
`GET /api/device/notifications?since=<id>` → `[{id, text, priority, expiresAt}]`
Default poll 60 s while awake; long-poll (`?wait=25`) option. Phase 2: MQTT/WebSocket push if battery allows. Device shows the text (max 64 chars, 2 lines + icon), buzzes LED, and sends ack:
`POST /api/device/ack {id}` → Log event `device_notification_ack`.

### 2.3 Button "Copy"
Short press: `POST /api/device/event {type:"copy", notificationId?, ts}` → server writes `Log{event:"device_copy", text:<notification text or current clip>, metadata:{deviceId, fw, battery}}`, visible in the Log tab on lot-systems.com. Screen confirms "COPIED ✓". Offline: queue up to 50 events in flash, flush on reconnect.
Long press (1.5 s): capture photo (LED on) → `POST /api/device/photo` (JPEG ≤ 200 KB) → Log `device_photo`. Camera is never enabled without press (R4).

### 2.4 Telemetry
Every 15 min: `POST /api/device/telemetry {temp, rh, pressure, iaq, battery, rssi}` → `device_telemetry` (also feeds the existing weather/context). BME688 IAQ computed on-device with Bosch BSEC.

## 3. Firmware architecture (ESP-IDF 5.x, C/C++)
- Tasks: `net` (Wi-Fi, TLS, queue), `ui` (LVGL, display), `sensor` (I²C), `input` (button debounce, GPIO wake), `power` (light sleep, Qi detect).
- Power: deep sleep between polls (target ≥ 3 days at 60 s wake duty — to be measured; Wi-Fi light sleep with DTIM ≈ 5–10 mA avg is the critical figure).
- Storage: NVS (token, Wi-Fi), SPIFFS (event queue).
- OTA: dual-partition, signed images (secure boot v2, flash encryption), pulled from `GET /api/device/firmware`.
- Security: per-device token, no secrets in firmware image, TLS cert pinning, camera opt-in flag server-side.
- Provisioning: BLE or USB serial via `lot-device provision` (see 01 §6).

## 4. Screen UX (240×240)
Idle: dark, clock + temp. Notification: large text, e.g. **Coffee time!**, soft pulse; button = Copy; second press dismisses. Colors/typography to be taken from brand.lot-systems.com (unavailable this run).

## 5. Test plan
Unit: protocol mock server. HIL: button → Log entry in staging DB. Soak: 72 h poll/ack. RF: with steel body + window. Power: measure µA sleep.
