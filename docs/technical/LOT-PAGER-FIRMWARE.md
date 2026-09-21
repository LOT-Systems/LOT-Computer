================================================================================
LOT SYSTEMS CORPORATION
LOT PAGER — FIRMWARE
================================================================================

DOCUMENT    PAGER-FIRMWARE / v1
ISSUE DATE  2026.09.21
CLASS       INTERNAL / BUILD
STATUS      PLANNING — no firmware written yet
PARENT      docs/technical/LOT-PAGER-SPEC.md (physical design, BOM, roadmap)

================================================================================

## 00  TARGET

MCU: ESP32-S3 (on the Seeed XIAO ESP32S3 Sense module, per PAGER-SPEC §02).
Toolchain: Arduino-core or ESP-IDF — Arduino-core first for speed to
prototype (Phase 1-3 in the roadmap), ESP-IDF only if power budget later
demands the finer sleep-mode control it exposes. No firmware has been
written; this is the intended state machine, not a report of one running.

================================================================================

## 01  STATE MACHINE

```
BOOT
  |
  v
WIFI_CONNECT ----(fail, retry w/ backoff)----> LOW_POWER_RETRY
  |
  v
LOT_AUTH  (Bearer <operator_token>, provisioned at pairing — see §02)
  |
  v
LISTEN  --- GET /api/pager/notifications?device_id=... every 30-60s ---
  |                                              |
  | (notification present)                       | (none)
  v                                              v
DISPLAY_RENDER                              DEEP_SLEEP (wake on timer)
  |
  v
AWAIT_BUTTON  (COPY button, or timeout -> DEEP_SLEEP without ack)
  |
  v (pressed)
SEND_ACK  --- POST /api/pager/ack { device_id, operator, metric:
              "button_press", value: "copy" } --- per PAGER-SPEC §03
  |
  v
DEEP_SLEEP
```

Deep sleep between polls is the load-bearing power decision — a 150-250mAh
cell (PAGER-SPEC §02) does not survive an always-awake WiFi radio. Poll
interval is a tuning knob, not a fixed constant: tighter for "just paired"
freshness, looser once battery telemetry shows drain.

================================================================================

## 02  PROVISIONING / PAIRING

1. Operator generates a pairing QR on lot-systems.com (new UI surface,
   not yet built — see LOT-PAGER-SOFTWARE.md §02).
2. Device boots into a local WiFi-AP provisioning mode on first power-up
   (standard ESP32 captive-portal pattern) if no stored credentials exist.
3. QR payload carries WiFi credentials + a short-lived pairing code; device
   exchanges the pairing code for a long-lived `operator_token` over HTTPS.
4. Token stored in NVS (ESP32 non-volatile storage), never in cleartext
   logs, never re-transmitted after the initial exchange.

================================================================================

## 03  OTA UPDATE PATH

Standard ESP32 OTA (dual-partition, A/B) — device checks a version endpoint
on wake, pulls a signed firmware image if newer, flashes to the inactive
partition, reboots into it, rolls back automatically on boot failure. This
protects the "recovery if bricked" case named in the assembly manual
(PAGER-SPEC §05) — a bad OTA push should never require physically opening
Face B. Signing key management is a Phase 3-4 decision, not yet made.

================================================================================

## 04  DISPLAY RENDERING

Notification payload is short-form text (e.g. "Coffee time!") — the display
(GC9A01 round TFT or small square IPS, PAGER-SPEC §02) renders it centered,
large, single message at a time. No notification queue/history on-device;
the Log tab on lot-systems.com is the record, the device is a surface, not
a store. This keeps firmware simple and avoids a second source of truth for
what was sent.

================================================================================

## 05  CAMERA (item 5) — SCOPE, HONESTLY STATED

The OV2640 camera on the XIAO Sense module is present in hardware from
Phase 1 (it ships on the board). Its firmware role is NOT yet decided beyond
"present" — the brief lists "camera" as a component but does not specify
what it captures or when. Candidates to resolve with S-2 before Phase 3
firmware work locks the state machine above:
  (a) ambient-light / presence sensing only (no image ever leaves device)
  (b) periodic low-res snapshot attached to a log entry, operator-visible
  (c) unused in v1, reserved for a future feature
Shipping (a) or (c) as the v1 default keeps privacy exposure at zero until
S-2 decides otherwise — flagged here rather than assumed.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF SPECIFICATION                                                2026.09.21
================================================================================
