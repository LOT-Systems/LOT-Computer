# LOT PAGER — Firmware, LOT API Connector & Host Software v0

## 1. Firmware architecture (ESP-IDF 5.x, C/C++, LVGL UI)
```
main
 ├─ net/       wifi_prov (BLE/SoftAP provisioning), ws_client (wss, auto-reconnect), http_fallback
 ├─ lot_api/   pair, inbox, ack, copy, telemetry  (JSON, see §2)
 ├─ ui/        LVGL: notification card, idle clock/weather, battery, pairing QR
 ├─ input/     button driver (short / long / double), BMI270 tap-to-wake
 ├─ haptics/   DRV2605L patterns (per notification priority)
 ├─ sensors/   BME688 (BSEC), LTR-390, MAX17048; 5-min sample, batched upload
 ├─ camera/    OV2640 capture → JPEG → upload (long-press, consent LED on)
 ├─ power/     STWLC38/BQ25185 status, light-sleep scheduler
 └─ ota/       signed OTA (secure boot v2, rollback, A/B partitions)
```
Rules: no secrets in source; device token in encrypted NVS; secure boot + flash encryption enabled **only** on production units (eFuses are one-way); screen shows ≤ 60 chars per card, longer text paged.

## 2. LOT API connector (proposed — not yet implemented)
Existing: `POST /api/logs {text, event?, metadata?}` (session-cookie auth) in `src/server/routes/api.ts`; M2M JSON formats in `docs/corporate/LOT-TERMINAL-M2M.md`; WS endpoint concept `wss://sync.lot-systems.com/m2m/intake` in `LOT-TERMINAL-SYNC.md`.

New device routes (auth: `Authorization: Bearer <device-token>`, token minted when the user pairs in Settings):

| Route | Purpose |
|---|---|
| `POST /api/device/pair` `{code, hw_id, fw}` → `{token, userTz}` | 6-digit code shown on screen, entered on site |
| `GET /api/device/inbox?since=<id>` / `WS /api/device/stream` | pending notifications `{id, text, priority, expiresAt}` |
| `POST /api/device/ack` `{id, state: shown\|dismissed}` | delivery receipt |
| `POST /api/device/copy` `{id, text}` | button **Copy** → creates Log row `event:'device_copy'`, `metadata:{deviceId, notificationId}` |
| `POST /api/device/telemetry` | M2M Format 3 (temp/humidity/pressure/VOC/UV/battery) → Log `event:'weather_update'`-style + weather widget |
| `POST /api/device/photo` | multipart JPEG (v1) |

Server work items: Prisma `Device`, `DeviceNotification` models + migration; token hashing; rate-limit; add `device_copy`, `device_notification` to the `displayableEvents` allowlist in `GET /api/logs` (otherwise Log tab will hide them); AI scheduler job that enqueues notifications from existing engines (QIE/Memory) with per-user quiet hours.

Example Copy payload → Log row:
```json
{"id":"n_8123","text":"Coffee time!"}
→ Log { event:"device_copy", text:"Coffee time!", metadata:{"deviceId":"LOTP1-0007","notificationId":"n_8123"} }
```

## 3. Button map
| Gesture | Action |
|---|---|
| Short press on notification | **Copy** → Log; haptic tick; "Copied" on screen |
| Short press idle | wake / show weather |
| Long press (1 s) | camera snapshot (v1) |
| Double press | dismiss |
| Hold 8 s | factory reset / unpair |

## 4. Sleep & delivery
Light-sleep with 30 s WS keep-alive (est. 1–2 mA avg). If WS fails 3× → HTTP poll every 60 s. Notifications have `expiresAt`; stale ones are dropped.

## 5. Host software
- **LOT Terminal** commands (extends existing `lot` CLI vision): `lot hardware init pager`, `lot hardware flash`, `lot sync enable pager`, `lot sync test`.
- **Web flasher** (WebSerial + esptool-js) on `lot-systems.com/pager` for end users.
- **Factory tool** (Python): provision serial `LOTP1-NNNN`, burn keys, print pairing QR, run self-test (sensors, camera, haptic, Qi), write result CSV.

## 6. Firmware documents to write (as code lands)
`FW-ARCHITECTURE.md`, `FW-PARTITIONS-OTA.md`, `FW-SECURITY.md`, `FW-POWER-BUDGET.md`, `API-DEVICE.md` (OpenAPI), `FACTORY-TEST.md`.

## 7. PDF manual set (generated from Markdown at DVT)
1. Quick-Start card (pair, charge, first notification)
2. User Manual (button map, privacy/camera, care of polished steel)
3. Safety & Regulatory (battery, FCC/CE statements)
4. Developer Manual (API, flashing, OTA)
5. Service Manual (disassembly, gasket, battery swap)
6. Factory Test Procedure
