# Firmware & connecting software
- Stack: ESP-IDF 5.x (C/C++), LVGL for UI, esp32-camera, BSEC2 for BME688.
- States: deep sleep → timer/button wake → Wi-Fi → long-poll → render → sleep.
- Screen: single-line notification, battery glyph, weather glance. Haptic pattern per notification.
- Button: short press = `copy` event (queued offline in NVS, replayed). Long press = show pairing code.
- Provisioning: BLE + Web Bluetooth page on lot-systems.com; flashing via ESP Web Tools (USB) and signed OTA.
- Repo layout proposal: `/firmware` (ESP-IDF), `/hardware` (KiCad), `/docs/hardware`.
- Tests: host-side unit tests for protocol; hardware-in-loop smoke test per unit at PVT.
- Manuals: pandoc → PDF (user quick-start, service/flash guide, regulatory sheet).
