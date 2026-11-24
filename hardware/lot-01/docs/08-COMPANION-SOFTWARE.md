---
title: "LOT-01 SQUARE — Companion Software"
subtitle: "Doc 08 · Software that connects the firmware to LOT · Rev A (2026-11-24)"
---

# LOT-01 — Companion Software

Four pieces of software connect the firmware to the LOT site, and no native
mobile app is needed.

## 1. LOT web: Settings → Devices (production)

* **Pair:** shows a 6-digit code and a "Connect via Bluetooth" button.
* **Web Bluetooth provisioning** (Chrome/Edge desktop and Android): sends Wi-Fi SSID/password + pair code to the device over the ESP `network_provisioning` BLE transport (protocomm, security 1 / X25519 + PoP = the printed serial).
* iOS Safari has no Web Bluetooth, so iPhone users use the fallback: the device's SoftAP captive page `http://192.168.4.1` (enter Wi-Fi + code).
* Device list: name, battery, last seen, firmware, **Send test note**, **Revoke**.

## 2. `lot01-sim.mjs` (in this repo, runnable now)

`hardware/lot-01/tools/lot01-sim.mjs`. Zero-dependency Node script that:

1. starts a mock LOT device API (doc 07 endpoints) on a local port,
2. runs a simulated LOT-01 through pair → poll → display → COPY → Log,
3. renders the 128 × 128 screen as ASCII,
4. asserts the Log received a `device_copy` entry with sensor context.

```bash
node hardware/lot-01/tools/lot01-sim.mjs        # prints the session + PASS/FAIL
```

Firmware developers use it as a contract test. Server developers port its handler
logic into `device-api.ts`.

## 3. `lot01-flash` (factory / developer tool, S3)

A wrapper around `esptool.py` + `espsecure.py`:

```
lot01-flash --port /dev/ttyACM0 --image lot01-0.3.0.bin --serial auto --burn-secure-boot
```

It writes the factory image, burns keys, runs the self-test over the USB-Serial/JTAG
console and prints a pass/fail label.

## 4. OTA service (S3)

`GET /api/public/device/telemetry` returns `ota` when a newer signed image is
staged for that device's cohort. Images are signed with the Secure Boot key
offline, uploaded to object storage and referenced by SHA-256.

## 5. Developer setup

```bash
# firmware (from S2 on)
. $IDF_PATH/export.sh && cd hardware/lot-01/firmware && idf.py set-target esp32s3 build flash monitor
# connector contract test
node hardware/lot-01/tools/lot01-sim.mjs
# PDF manuals
node hardware/lot-01/tools/build-pdf.mjs
```
