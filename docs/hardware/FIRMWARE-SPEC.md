# LOT Computer — Firmware Spec (draft v0.1)
Target: ESP32-S3, ESP-IDF 5.x (PlatformIO), FreeRTOS. Repo path proposal: `hardware/firmware/`.

## Modules
- `net`: Wi-Fi STA, provisioning (BLE or SoftAP + WebSerial), TLS with pinned CA, NTP.
- `api`: pair/poll/ack/event/telemetry per API-CONNECTOR-SPEC; exponential backoff; offline queue in NVS/LittleFS (max 50 events).
- `ui`: 240x240 screen, monochrome-leaning LOT style (mono type, opacity hierarchy per LOT-STYLE-GUIDE), screens: Notification, Idle clock/weather, Status. Wake on IMU tap/button.
- `input`: single button — short press = "Copy" event (+haptic ack), long press (2 s) = status screen, 10 s = factory reset.
- `sensors`: BME688 via Bosch BSEC (AI IAQ), LTR-390, BMI270, MAX17048. Sample 5 min; batch upload.
- `alert`: DRV2605L patterns + piezo, respect quiet hours.
- `power`: light sleep between polls; target avg < 1.5 mA => ~5+ days on 200 mAh (estimate, unmeasured).
- `ota`: signed OTA over HTTPS, A/B partitions, rollback.
- `camera`: v1 driver + test capture only; no upload.

## Build / test
CI: build + unit tests (host-mocked). Hardware-in-loop jig at 100-unit stage: flash, self-test all sensors, write serial.

## Versioning
`fw X.Y.Z`, reported in every request header `X-LOT-FW`.
