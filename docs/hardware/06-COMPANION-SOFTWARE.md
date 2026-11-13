<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Pager — Software that Connects to the Firmware

**Document:** LOT-HW-01 / SW · **Rev:** A (2026-11-13)

Three pieces of software talk to the firmware. None needs a phone app.

## 1. Setup page (web, inside lot-systems.com)

- Route: `/settings/devices/setup` in the existing React client.
- Uses **Web Bluetooth** (Chrome/Edge desktop + Android) to reach the device in `UNPAIRED` state.
- Flow:
  1. User signs in → "Add LOT Pager" → server issues pair code (doc 05 §3).
  2. Browser connects over BLE (service UUID `LOT-PAGER-SETUP`), sends Wi-Fi SSID + password + pair code.
  3. Device joins Wi-Fi, calls `pair/finish`, stores token, shows `PAIRED ✓`.
- iPhone Safari has no Web Bluetooth → fallback: device shows a pair code and starts a
  temporary Wi-Fi access point `LOT-XXXX` with a captive setup page (ESP-IDF SoftAP provisioning).

## 2. Factory / service tool (`hardware/tools/lot-flash`)

- Node.js CLI + Web Serial page; talks to the pogo-pin UART.
- Commands: `flash` (esptool, factory + app images), `test` (runs factory self-test, parses
  JSON result), `provision` (reads ATECC public key and serial, registers the device with
  `/admin-api/devices/register`), `label` (prints serial label).
- Writes one CSV line per unit → manufacturing record (doc 08).

## 3. Device simulator (`scripts/hardware/device-sim.ts`)

- Acts like a paired device against a local or staging server: polls inbox, prints notices,
  sends `copy` on Enter, sends fake BME688 sessions (CBOR + heatshrink).
- Lets the full loop (AI notice → device → Copy → Log tab) be developed and tested before any
  PCB exists. Built in session 2 together with the API.

## 4. OTA release pipeline

- GitHub Action on tag `pager-fw-vX.Y.Z`: build with ESP-IDF Docker image → sign → upload to
  object storage → update manifest served by `GET /api/device/ota`.
- Staged rollout: 10 % of devices, then 100 % after 48 h without crash reports.

## 5. Interfaces summary

| Link | Transport | Format |
|------|-----------|--------|
| Device ↔ lot-systems.com | HTTPS (TLS 1.2+) | JSON (small calls), CBOR + heatshrink (sessions), JPEG |
| Browser ↔ device (setup) | BLE GATT or SoftAP HTTP | protobuf (`wifi_provisioning`) |
| Factory PC ↔ device | UART 115200 via pogo pins | esptool + JSON lines |
