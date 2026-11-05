# LOT Pager Firmware + Host Software Spec v0.1

**Stack:** ESP-IDF 5.x (C), FreeRTOS. Secure boot v2 + flash encryption on PVT units. Signed OTA with rollback.

## Tasks
- `net`: Wi-Fi + TLS client, long-poll `/api/device/inbox`, exponential backoff, BLE provisioning of SSID.
- `ui`: renders one line + period on OLED; screen off after 8 s; wake on button/IMU tap.
- `haptic`: LRA patterns (short, double).
- `button`: press → `copy` event; long press (1.5 s) → camera capture if enabled.
- `sensors`: BME688 (BSEC library), BMI270, VEML7700 every 5 min; batched upload.
- `power`: BQ25120A/MAX17048; deep sleep between polls; target ≥ 3 days.
- `camera`: power rail shared with indicator LED; no capture without trigger.
- `ota`: HTTPS, signature check.

## Host software
- Web flasher (ESP Web Tools) on the site for DVT/PVT.
- Pairing page in Settings → Devices.
- Factory test jig script (USB): sensor ID check, display pattern, Qi charge current, button, camera frame, writes serial to a manifest.

## Test gates
Boot < 3 s · notification latency < 3 s p95 · Copy delivered ≥ 99% · 72 h battery · OTA rollback proven.
