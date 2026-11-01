# Firmware Spec v0.1 (ESP32-S3, ESP-IDF 5.x)
1. **States**: deep-sleep → wake (timer 60 s / IMU tap / button) → Wi‑Fi connect → fetch notifications → draw → sleep. Target ≥ 3 days on ~200 mAh with e‑paper, ~1 day with LCD.
2. **Button**: short = "Copy" (queue `/device/button`; retry with backoff, offline queue in NVS/flash up to 100 events). Long (1.5 s) = camera capture (explicit, LED on).
3. **Display**: notification text, battery, temp, clock; auto brightness via VEML7700.
4. **Sensors**: BME688 read every 5 min, offset-compensated for self-heating.
5. **Session log**: CBOR + heatshrink; flush at end of wake window.
6. **Host software** (`tools/lot-device`, to build): provision Wi‑Fi + pairing code over USB/BLE, flash, read logs, run EOL test.
7. **OTA**: signed images, dual partition, rollback.
8. **Security**: secure boot v2, flash encryption, token in encrypted NVS.
9. **EOL factory test (for 100 run)**: screen pattern, button, camera frame, sensor ID, charge current, RF RSSI, unique ID burn.
