# LOT DEVICE-01 — Firmware Specification

**Doc:** HW-05-FW · **Rev:** A · **Date:** 2026-11-28
**Target:** ESP32-S3 · **Framework:** ESP-IDF v5.x (C), with esp32-camera and Bosch BSEC2 for the BME688
**Repo path (planned):** `hardware/lot-device-01/firmware/`

## 1. Partitions (4 MB flash)

| Name | Size | Use |
|---|---|---|
| nvs | 24 KB | Wi-Fi credentials, device token (encrypted NVS), settings |
| otadata | 8 KB | OTA selection |
| ota_0 | 1.75 MB | App slot A |
| ota_1 | 1.75 MB | App slot B |
| storage | 448 KB | Notification ring buffer, session digest, fonts |

Turn on **flash encryption** and **secure boot v2** in production. The device token must never be readable from a dumped flash.

## 2. Tasks and modules

```
app_main
 ├─ power_mgr     wake cause, battery (MAX17048), charge state, thermal cut-off
 ├─ net           Wi-Fi STA, TLS (mbedTLS, session resumption), SNTP
 ├─ lot_client    LOT API connector (06-SOFTWARE-CONNECTOR.md)
 ├─ ui            Memory LCD driver, 1-bit framebuffer 144×168, fonts, layouts
 ├─ input         button: short / long / double press, debounce, wake source
 ├─ haptic        one pulse = new notice, two = copied, long = error
 ├─ env           BME688 through BSEC2 (IAQ, T, RH, P), heat offset
 ├─ camera        HM0360 capture → JPEG ≤ 80 KB (only on long press)
 ├─ store         ring buffer (last 16 notices), session digest
 └─ ota           HTTPS OTA from /api/device/firmware, signed images
```

## 3. Main state machine

```
 BOOT ─▶ PROVISION? ──(no creds)──▶ BLE/SoftAP provisioning ─▶ PAIR (show code)
   │                                                               │
   └──(creds ok)──▶ SYNC ◀──────────────────────────────────────────┘
                     │  GET notifications, POST queued copies/telemetry
                     ▼
                 DISPLAY (draw latest; LCD holds image at ~µW)
                     │
                     ▼
                 DEEP SLEEP  ── wake: timer | button | charger-detect
```

## 4. Receiving notifications (pager behaviour)

- **v1.0, polling:** wake every **2 min from 07:00 to 22:00** and every 15 min at night (user's time zone, sent by the server). Send `GET /api/device/notifications?since=<cursor>` with `If-None-Match`. A 304 costs about 0.6 s of radio time.
- **v1.1, push:** MQTT over TLS with Wi-Fi light sleep (DTIM 3) while charging, or by user choice ("instant mode"). Expect a shorter battery life in that mode.
- **Notification payload, max 256 bytes:**
  ```json
  {"id":"n_8f3c","t":"Coffee time!","k":"care","p":1,"ts":1764320400,"ttl":5400}
  ```
  `k` is the kind (care / weather / social / system) and sets the icon. `p` is the priority: p ≥ 2 gives a double haptic pulse. `ttl` makes stale notices fade back to the clock face.
- **Screen layout:** text in a 2-line, 16 px LOT monospace font. Bottom row: `HH:MM · 21°C · ▮▮▮▯`. Plain text with periods; no emoji, as the LOT style guide says.

## 5. Weather and air (BME688)

- BSEC2 in **ULP mode**: one IAQ reading every 300 s, read during the scheduled wake.
- Self-heating offset: `T_true = T_raw − (0.8 °C × radio_duty) − 0.3 °C × charging`. Calibrate per batch against a reference sensor in EVT.
- Values are sent as **context** with every Copy press, and in the daily session digest.
- Later (roadmap): train a BME AI-Studio gas profile, e.g. "coffee brewing" or "stale room", so it can trigger notices on its own.

## 6. Button and camera

| Gesture | Firmware action |
|---|---|
| Short | Queue `copy {id, text, env, battery}` → try POST now → "Copied." |
| Long ≥ 1.5 s | Power the camera through TPS22916, auto-exposure 400 ms, capture QVGA/VGA JPEG, POST `photo` |
| Double | Dismiss: show the clock face, POST `dismiss` |
| Long ≥ 8 s | Factory menu: show the device ID, battery, firmware version; another 8 s → unpair |

Offline: up to 32 copies wait in the queue and are sent on the next sync, keeping their original timestamps.

## 7. Session compression (brief item 8)

A **session** is one wake cycle. To keep the radio on as briefly as possible and the Log tidy:

1. **Per session:** everything to upload (copies, env samples, battery) is packed into **one** POST. Payloads use short JSON keys. CBOR over HTTP is an option in v1.1.
2. **Per day:** raw environment samples stay on the device. At 00:00 local, or on the next charge, they are folded into one **digest**:
   ```json
   {"d":"2026-11-28","n":14,"c":3,"ph":1,"t":[18.2,23.4,21.0],"rh":[38,51,44],"iaq":[25,96,52],"b":64}
   ```
   This becomes one `device_session` Log line, for example: `DEVICE. 14 notices · 3 copied · 18–23 °C · IAQ 52 · battery 64%.`
3. **Server side:** the AI composer folds the user's context (memory engine, weather, time) into a **notice of ≤ 48 characters**. One line on the screen, one idea.

## 8. Power budget (110 mAh cell)

| Item | Per day |
|---|---|
| Deep sleep: SoC + LCD (EXTCOMIN toggled by the ULP) + buck + gauge, ≈ 25 µA | 0.6 mAh |
| Day polls: 450 × 1.2 s × 90 mA avg | 13.5 mAh |
| Night polls: 36 × 1.2 s × 90 mA | 1.1 mAh |
| 20 notices: haptic + redraw | 0.4 mAh |
| 5 copies + 1 photo | 0.4 mAh |
| **Total** | **≈ 16 mAh/day → ≈ 6.5 days** |

## 9. Factory and test firmware

- The pogo-jig firmware checks: rail voltages, I²C scan (BME688 0x76/0x77, MAX17048 0x36), camera ID, a screen checkerboard, button (the operator presses it), haptic, Wi-Fi RSSI to the reference AP (≥ −60 dBm at 1 m through the glass), and Qi charging current.
- It burns eFuse **secure boot + flash encryption**, writes the device serial number, and prints the pairing label.
- It produces a JSON test report per unit, which is uploaded to the program's records (100 files).

## 10. OTA

- Images are signed (ECDSA-P256), downloaded from `GET /api/device/firmware?hw=01&cur=<ver>`, and installed **only while charging**.
- Rollback is automatic if the new image fails its self-test 3 times.
