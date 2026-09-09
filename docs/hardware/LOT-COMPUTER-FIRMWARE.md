<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Computer — Firmware

On-device software running on the ESP32-S3. This document is deliberately
separate from [`LOT-COMPUTER-API.md`](./LOT-COMPUTER-API.md) — one describes
what runs on the object, the other describes what runs on the server. Keeping
them apart means either side can be rewritten without the other changing.

## Toolchain

- **Framework:** ESP-IDF (native), or Arduino-ESP32 core for faster v1
  iteration. Recommend ESP-IDF once the design stabilizes — direct access to
  the camera DVP interface and deep-sleep power states matters here.
- **Language:** C (ESP-IDF) or C++ (Arduino core).
- **OTA:** ESP-IDF's built-in OTA partition scheme — firmware updates are
  pulled from the LOT server (`GET /api/device/firmware` in the API doc),
  not distributed manually. A 100-unit fleet with no OTA path is a 100-unit
  fleet that gets returned when the first bug ships.

## Boot / Runtime Loop

```
POWER ON
  → load pairing credentials from NVS (non-volatile storage)
  → if unpaired: display "Pair me" + broadcast BLE pairing advertisement
  → if paired: connect Wi-Fi (stored credentials)
       → GET /api/device/session-digest   (one compressed headline string)
       → render digest to Sharp Memory LCD
       → sample BME280 (temp/humidity/pressure)
       → POST /api/device/weather          (device-reported ambient reading)
       → enter light-sleep, wake on:
            (a) button press  → COPY FLOW
            (b) poll interval → refresh session digest
            (c) BLE pairing request (re-pairing to a new account)
```

## COPY FLOW (button press)

The one input this device has. No debounce theatrics, no double-press
gestures — one press, one signal, one confirmation.

```
BUTTON PRESSED
  → wake from sleep if needed
  → POST /api/device/log { deviceId, timestamp }
  → on 2xx: brief display flash ("Logged.") for 1.5s, then blank
  → on failure: retry once after 3s, then blank silently — a missed log
    is not worth waking the user to explain; it is logged locally in NVS
    and flushed on next successful connection
```

Local queue: up to 20 unsent Copy signals are buffered in NVS with their
original timestamp, so a dead Wi-Fi window does not lose taps — they land
in the Log tab late, with the correct original time, once connectivity
returns.

## Notification Rendering

The device never receives a stream. Every poll returns exactly one string,
already sized for the display (see API doc's `session-digest` response
shape) — the compression happens server-side, reusing the pattern in
`docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md`. Firmware's job
is dumb on purpose: render the string, no truncation logic, no local
formatting. If it doesn't fit the screen, that's a server-side bug to fix
in the digest generator, not a firmware workaround.

## Power Management

- Sharp Memory LCD holds its last frame with no refresh current — display
  stays lit between polls at near-zero draw.
- ESP32-S3 light-sleep between poll intervals (recommended: 15-minute base
  interval, configurable server-side per user's QOS state — `peak` mode
  polls more often than `maintenance` mode).
- Wireless charging assumed daily (overnight, on the matching dock) —
  battery sizing target is 36–48h between charges as a safety margin, not
  a multi-week runtime goal. This is a bedside/desk object, not a hiking
  tracker.

## Camera (v2, conditional on SPEC §04 decision)

If v1 ships without a camera (recommended), this section is a placeholder
for v2. When implemented:

- Capture is user-initiated only (no background capture, no always-on
  sensor) — likely a long-press variant of the same button, or a second
  short bezel control, to be decided once v1's single-button interaction
  is validated with real users.
- Captured frames are compressed on-device (JPEG, ESP32-S3 hardware JPEG
  encode where available) before `POST /api/device/capture` — never raw
  frame buffers over the wire.
- Manual and pairing flow must disclose camera capability explicitly
  before first use — see [`LOT-COMPUTER-MANUAL.md`](./LOT-COMPUTER-MANUAL.md)
  privacy section.

## Pairing

BLE-advertised pairing, confirmed via a short numeric code shown on the
LOT web app (`/api/device/pair`, see API doc) — no camera or keyboard
needed on the device itself for setup, which holds even in the no-camera
v1.

## What Firmware Explicitly Does Not Do

- No local LLM inference — this is not a NODE-0 rig, it has no model on
  board. All "AI-powered" behavior is generated server-side; the device
  only renders and reports.
- No persistent raw sensor logging on-device — BME280 readings are sent
  and discarded locally, not accumulated into an on-device history the
  device itself has no use for.
- No user text input, ever. One button, one action.
