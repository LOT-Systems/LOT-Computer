# LOT-HW1 — Firmware Document (Document 04 of 06)

Target MCU: ESP32-S3 (dual-core Xtensa LX7, Wi-Fi 4 + BLE, vector/AI instructions — per [Espressif datasheet](https://www.espressif.com/documentation/esp32-s3-mini-1_mini-1u_datasheet_en.pdf)). Framework: ESP-IDF (recommended for deep-sleep control) with Arduino-compat only for early prototyping. Status: **design only, no code written.**

## 1. Responsibilities

1. Wake, join Wi-Fi, fetch pending notifications from the site.
2. Show the notification; vibrate/beep (pager behaviour).
3. On **Copy** press: send a `copy` event to the site; show confirmation.
4. Read sensors and report them at a low rate.
5. Capture a photo on request, upload, show result.
6. Manage power, charging state, OTA updates, pairing.

## 2. State machine

```
        ┌────────── timer / IMU tap / button / charger ──────────┐
        ▼                                                         │
 DEEP_SLEEP ─wake─► CONNECT ─ok─► SYNC ─┬─ new notif ─► NOTIFY ─┬─ Copy ─► SEND_COPY ─► ACK ─┐
        ▲            │fail             │ none          │ timeout│                          │
        │            ▼                 ▼               ▼        ▼                          │
        └──────── BACKOFF ◄──────── SENSORS ◄──────── SLEEP_PREP ◄─────────────────────────┘
 Special: PAIRING (first boot / long-press), OTA (when server flags update, only on charger or battery > 50 %)
```

## 3. Timing and power (ESTIMATE; measure in P2)

- Poll interval default 120 s (server-tunable per device, 30 s – 15 min). Backoff doubles on failure up to 15 min.
- Screen on only for NOTIFY (default 20 s) and button feedback.
- Deep sleep current target < 50 µA total board (ESTIMATE; Qi RX and sensors must be quiescent).
- When on a Qi pad (charger present): keep Wi-Fi up, poll every 15 s, screen shows charge state.

## 4. Display UI

- 240 × 240, brand tokens from the site: background `#1a1a1a`, accent `#43aff3`, highlight `#fef17b`, white text, Arial/Helvetica-class font (VERIFIED in `tailwind.config.js`; re-check against brand site).
- Screens: Notification (text ≤ 120 chars, auto-wrap, 3 lines large), Idle clock + weather glyph, Charging, Pairing code, Error.
- Notification example: `Coffee time!` plus a small footer `COPY ▸ log`.

## 5. Input

- One button. Short press = **Copy** (send current notification to Log). Long press (2 s) = dismiss without copy / enter pairing if unpaired. Double press = take photo (Gen-1 option, confirm in Doc 01 §8).
- IMU (BMI270) tap/lift wakes the screen without Wi-Fi.

## 6. Camera and privacy rules

- Capture **only** after an explicit user action. No streaming, no motion-triggered capture.
- Visible indicator (screen flash/LED-equivalent) for every capture.
- JPEG from the sensor's on-chip encoder; upload over HTTPS; local copy deleted after ACK.
- No microphone in Gen-1.

## 7. Security

- Per-device token provisioned at pairing; stored in NVS with flash encryption + secure boot enabled on production units (ESP32-S3 supports both).
- TLS 1.2+ to `lot-systems.com` with pinned CA bundle. Reject plain HTTP.
- OTA images signed; rollback on failed boot.
- No credentials in firmware source. Wi-Fi credentials entered via the flasher/provisioning tool (§8) or BLE provisioning.

## 8. Software that connects to the firmware (the "host" side)

| Tool | Purpose | Approach |
|---|---|---|
| **Web flasher** | Flash/update firmware over USB from a browser | WebSerial + esptool-js, hosted as a page on the LOT site or a standalone page |
| **Provisioning** | Wi-Fi + pairing | Device shows a 6-digit code; user enters it on lot-systems.com while logged in (Doc 05 §2) |
| **Factory test jig** | P4: flash, test sensors/charger/camera/screen/button, print PASS/FAIL, write serial number | Python script over USB serial; logs per-unit results to CSV |
| **Log viewer** | Existing Log tab on the site | Shows `device_copy` entries (Doc 05 §4) |

## 9. Build, test, release

- Repo layout (proposed): `hardware/firmware/` (ESP-IDF project), `hardware/tools/` (flasher, jig), `docs/technical/hardware/`.
- Unit tests on host for protocol parsing and state machine; hardware-in-loop smoke test script for P3.
- Versioning: `HW1-FW-<major>.<minor>.<patch>`; manifest served by site for OTA.
- Each release ships with a changelog and a firmware-doc update (this document) — one source of truth.

---
AUTHORIZED BY: S-2 // VADIK MARMELADOV
