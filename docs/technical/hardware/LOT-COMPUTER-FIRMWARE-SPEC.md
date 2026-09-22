================================================================================
LOT SYSTEMS CORPORATION
LOT COMPUTER — FIRMWARE SPECIFICATION
================================================================================

DOCUMENT    LOT-COMPUTER-FIRMWARE-SPEC
ISSUE DATE  2026.09.22
CLASS       INTERNAL / BUILD
TARGET      ESP32-S3 (Arduino-ESP32 core or ESP-IDF; ESP-IDF recommended
            for production power management)

================================================================================

## 00  PRINCIPLE

The device is dumb on purpose. It has no accounts, no settings screen, no
local intelligence beyond "show what the site sent" and "tell the site a
button was pressed." All reasoning (what to notify, when, in what words)
stays server-side in the Memory Engine. This keeps the firmware small,
auditable, and OTA-safe — the same INPUT -> CLASSIFY -> ACTION -> RECORD
discipline as LOT-NODE-0-RIG-SPEC.md, scaled down to a coin-sized object.

================================================================================

## 01  STATE MACHINE

```
BOOT -> PAIRED? --no--> PAIRING MODE (BLE advertise, see SOFTWARE-
         |                            INTEGRATION 02)
         yes
         v
IDLE (screen blank or last message, low-power WiFi sleep between polls)
         |
         +--> POLL TICK (interval, see 02) --> fetch --> new message?
         |                                                  |
         |                                                  yes
         |                                                  v
         |                                        DISPLAY + HAPTIC BUZZ
         |                                                  |
         |                                        back to IDLE after
         |                                        display timeout
         |
         +--> BUTTON PRESS ("Copy") --> SEND LOG SIGNAL (see 03) -->
         |                              brief screen confirm -> IDLE
         |
         +--> LOW BATTERY --> screen shows battery glyph only,
         |                    polling interval backs off (see 04)
         |
         +--> CHARGING (Qi field detected) --> screen off, charge glyph
                                                on FACE B briefly, then off
```

================================================================================

## 02  NOTIFICATION CHANNEL (point 2, 6)

Poll, not push, for v1 — a stainless object with a coin cell has no
justification for holding an always-open socket. Poll cadence:

```
FOREGROUND (screen was touched/charging in last 10min)   30s poll
BACKGROUND (idle)                                          5min poll
LOW BATTERY (<15%)                                         15min poll
```

Each poll is `GET /api/hardware/notify` (see SOFTWARE-INTEGRATION 03) —
returns either 204 (nothing new) or a short JSON payload the firmware
renders directly:

```json
{ "text": "Coffee time!", "icon": "cup", "ttl_s": 120 }
```

`text` is capped server-side at the display's character budget (see 05) —
the firmware does not wrap or truncate; it trusts the server to have
already fit the message, and drops (does not garble) anything longer than
the buffer.

A future rev may add BLE-connected push (phone-as-bridge) once a paired
phone app exists; out of scope for v1, noted here so the poll-based v1
protocol is not mistaken for the final architecture.

================================================================================

## 03  "COPY" BUTTON (point 16)

Button press -> immediate `POST /api/hardware/log` with the device's
paired token and a local timestamp -> on 200 OK, screen shows a one-frame
checkmark, else a one-frame "!" (offline — see 04). No local queueing of
failed presses in v1: a press made while offline is lost, not retried
silently later with a stale timestamp. This is a deliberate simplicity
choice for v1, recorded so a future rev can add a small persisted retry
queue without it being a silent behavior change.

================================================================================

## 04  POWER MANAGEMENT

- WiFi radio off between polls (deep sleep with RTC timer wake), not just
  idle — this is the single biggest lever on battery life for a cell this
  small (see BOM 01, battery line).
- Display: static text on a low-refresh panel draws near-zero current
  between updates; the 0.42" OLED reference part (BOM 01) is chosen
  partly for this reason over a full-color AMOLED, which redraws at a
  much higher power cost for the same "show one line of text" job.
- Camera: powered only on an explicit capture trigger (not yet specified
  in this v1 scope — point 5 names the camera as a required sensor, but
  no capture trigger/use-case was specified in the S-2 intake; treat the
  camera driver as present-but-dormant in firmware v1, with the capture
  trigger to be defined once S-2 specifies what the camera is for).
- Weather sensor (BME680): sampled once per poll tick, not continuously —
  the BSEC gas-baseline algorithm needs periodic sampling, not constant
  power draw.

================================================================================

## 05  DISPLAY BUDGET

0.42" OLED at typical off-the-shelf resolution fits roughly 1 short line
(~12-16 characters at a legible size) or 2 very short lines. Server-side
message generation (Memory Engine) must target this budget directly —
"Coffee time!" (12 chars) fits; a full sentence does not. This is a
content-authoring constraint to hand to whatever writes the notification
text, not a firmware-side truncation problem.

================================================================================

## 06  OTA UPDATE

ESP32-S3 native OTA (dual app partition, rollback-on-boot-failure) against
a LOT-hosted firmware manifest endpoint (`GET /api/hardware/firmware`,
same connector as SOFTWARE-INTEGRATION.md 03). Update check runs once per
day during a background poll tick, not on every poll — firmware updates
are not time-critical the way a notification is.

================================================================================

## 07  NOT YET SPECIFIED (honest gap list for next session)

- Camera capture trigger and destination (does a press-and-hold capture
  a photo and attach it to a Log entry? Not stated in the S-2 intake.)
- Pairing UX detail beyond the BLE handshake shape (SOFTWARE-
  INTEGRATION 02) — what the user actually sees/does on first boot.
- Multi-message queue behavior if two notifications land before the
  screen timeout elapses (currently: last one shown wins, no queue).

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END LOT-COMPUTER-FIRMWARE-SPEC                                       2026.09.22
================================================================================
