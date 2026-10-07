# HW-03 — Firmware & LOT API Connector (Rev A, draft)
Firmware: ESP-IDF 5.x (C), FreeRTOS. Not yet implemented.

## 1. States
`PROVISION → PAIRED → IDLE(light-sleep) → ALERT(notification) → CAPTURE(camera, on hold) → CHARGING`

## 2. Pairing (Software ↔ firmware, see §6)
1. User logs into lot-systems.com → Device → "Add device" → site returns a 6-char code.
2. Device (via provisioning tool over USB serial or BLE) gets Wi-Fi creds + code → `POST /api/device/pair {code, deviceId, fw}` → returns long-lived `deviceToken` (stored in NVS, encrypted).

## 3. Proposed server endpoints (to add in `src/server/routes/`; none exist yet)
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/device/pair` | exchange code → token |
| GET | `/api/device/events?since=ID` (long-poll/SSE) | autonomous notifications ("Coffee time!") |
| POST | `/api/device/events/:id/ack` | delivered/seen |
| POST | `/api/device/log` | `{type:"copy"\|"sensor"\|"battery", ts, payload}` → appears in **Log tab** |
| POST | `/api/device/camera` | multipart JPEG, only on explicit user action |
Auth: `Authorization: Bearer <deviceToken>`; TLS 1.2+; per-device rate limit; server can revoke.

## 4. Notification payload
`{id, title:"Coffee time!", body, priority:0-2, buzz:"short|double|long", expires}` → screen text (≤2 lines × 20 chars) + buzz pattern; priority 2 repeats until button/ack.

## 5. COPY button
Short press → `log{type:"copy", ref:<current notification id or null>}`; the Log tab shows "COPY · device <name> · time". Long press (1.5 s) → camera capture (indicator on screen). Debounce 20 ms.

## 6. Host software
Phase P1: browser **Web Serial** provisioning page (no install) + `esptool` for flashing. Phase P3: signed OTA via HTTPS (`/api/device/firmware`).

## 7. Sensors
BME688 every 5 min → `log{type:"sensor"}` batched hourly (battery); IMU ML core wake on tap/pickup; fuel gauge with each batch.
