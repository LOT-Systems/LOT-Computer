# LD-01 firmware (Rev A skeleton)

Proto-A target: Seeed XIAO ESP32S3 Sense + Sharp memory LCD + BME688 + tact button.
Spec: `docs/hardware/04-FIRMWARE.md`. API: `docs/hardware/05-LOT-API-CONNECTOR.md`.

```
pio run -e proto_a -t upload && pio device monitor
```

Status: **not compiled in this session** (no PlatformIO toolchain in the cloud container).
Wi-Fi provisioning (BLE), OTA, camera capture and CBOR telemetry are stubbed and marked `TODO(S-2)`.
Copy `include/secrets.example.h` to `include/secrets.h` (gitignored) before building.
