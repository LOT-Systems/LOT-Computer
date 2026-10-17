# LOT® PAGER — Firmware Specification

Target: ESP32‑S3, ESP‑IDF 5.x (C/C++), FreeRTOS. License: LOT® proprietary.

## 1. Modules
| Module | Responsibility |
|---|---|
| `net` | Wi‑Fi STA, TLS 1.2+, reconnect with backoff |
| `pair` | One-time pairing code → device token (06 §2); token in NVS, encrypted (flash encryption on) |
| `api` | Poll/stream notifications, post events, upload frames |
| `ui` | Notification card, status bar (battery, Wi‑Fi), pager "ack" animation |
| `input` | Button debounce, short/long press |
| `sense` | Sample BME688/BMI270/VEML at set intervals; batch & compress |
| `cam` | Capture JPEG on demand/trigger; never streams continuously |
| `pwr` | Charge state, fuel gauge, deep sleep |
| `ota` | Signed OTA (dual partition, rollback) |
| `log` | Ring buffer in RAM + NVS; upload on connect |

## 2. State machine
```
BOOT → (no token) PAIRING → ONLINE ⇄ SLEEP
ONLINE: poll (30 s active / 5 min idle) → NOTIFY → [button] → ACK → ONLINE
CHARGING: screen shows level; radio throttled
```

## 3. Notification behavior (pager-like)
- Payload ≤ 240 bytes UTF‑8: `{id, text, level, ts, ttl}`.
- Display: text up to 3 lines, auto-fit; buzz pattern by level (info 1 short, nudge 2 short, alert long).
- Stays on screen until ack or ttl. Backlog: keep last 8, newest first.
- Quiet hours honored from server prefs (device never decides to be silent by itself except low battery <5 %).

## 4. Button "Copy"
- Short press → `POST /api/logs` with `event:"device.copy"`, text = the notification text (see 06 §4). Screen flashes "Copied", then clears the card.
- Long press (1.5 s) → request a camera capture.
- If offline, event is queued (max 100) and sent on reconnect with original timestamp.

## 5. Power budget (indicative, 200 mAh)
| State | Current | Share of time | Average |
|---|---|---|---|
| Deep sleep + RTC | 20 µA | 70 % | 14 µA |
| Wi‑Fi poll (light sleep between) | 80 mA for 2 s / 5 min | 0.7 % | ~0.5 mA |
| Screen on (user viewing) | 60 mA | 1 % | 0.6 mA |
| Camera shot | 150 mA for 3 s | rare | negligible |
→ ~1.2 mA average ⇒ **~7 days** per charge. Wake on BMI270 pickup extends interactivity.

## 6. Camera policy
Capture only on explicit trigger (long press or server request that shows an LED + on-screen indicator). Frames are JPEG ≤ 640×480, encrypted in transit, deleted on device after upload. Every capture produces a Log entry.

## 7. Security
Secure boot v2, flash encryption, TLS cert pinning to the LOT API host, per-device token revocable server-side, no inbound ports.

## 8. Testing
Host-side unit tests for parsing/queue (Unity); HIL smoke test using pager-sim.mjs as server; 72 h soak.
