# LOT-HW-04 — Firmware Document (v0.2, S2)
Target: ESP32-S3, ESP-IDF 5.x (C/C++), FreeRTOS. Repo path when created: `firmware/lot-pager/`.

## Modules
`net` Wi-Fi provisioning, TLS, SSE client · `api` LOT connector, token in NVS · `ui` one notice + status bar · `input` button short=Copy, long(1.5 s)=dismiss, 5 s=pair · `sensors` BME688 (BSEC), BMI270, light · `haptic` DRV2605L · `camera` off by default · `power` light sleep, charge state · `ota` signed A/B.

## Tasks (FreeRTOS)
| Task | Prio | Role |
|---|---|---|
| net_task | 5 | connect, hold SSE, reconnect with backoff 2/4/8/…60 s |
| ui_task | 3 | render notice, 10 fps max, dim by light sensor |
| input_task | 6 | debounce 20 ms, emit COPY / DISMISS / PAIR |
| sensor_task | 2 | sample every 60 s, batch to flash queue |
| ota_task | 1 | check on boot + daily |

## Event flow
SSE `notice` → store (ring of 5) → ui + haptic → ack POST. Button COPY → `POST /api/device/event {type:copy}`; if offline queue in flash (max 50), flush FIFO on reconnect. Site writes Log `device_copy`.

## Screen layout (0.91" 128×32 or 0.96" 160×80)
Line 1: status (Wi-Fi, battery %, time). Lines 2+: notice text, ≤80 chars, wrapped. No icons beyond status; MILITARY PURITY.

## Power
Target < 3 mA avg (light sleep + DTIM). Fallback: poll 60 s. Measure in EVT; est. ~7 days on 130 mAh is unverified.

## Security
Secure boot v2, flash encryption, NVS encryption for token, OTA signature check, TLS pinned to lot-systems.com CA.

## Test plan
Host unit tests (queue, parser) · HIL button/screen · 72 h soak · drop 1 m · battery < 45 °C · fuzz SSE parser.
