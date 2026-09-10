<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

================================================================================
LOT SYSTEMS CORPORATION
LOT PAGER — NODE-P
FIRMWARE SPECIFICATION
================================================================================

DOCUMENT    FIRMWARE / NODE-P
ISSUE DATE  2026.09.10
CLASS       INTERNAL / CONCEPT
STATUS      SPEC ONLY — no firmware has been written yet. This is the
            document a firmware engineer builds P1 (PROTO-0) against.

================================================================================

## 00  TARGET

ESP32-S3-WROOM-1 (see BOM §01), Arduino-ESP32 core or esp-idf directly.
Single-core-equivalent workload — this device does not need FreeRTOS
gymnastics, it needs to wake, check in, sleep.

================================================================================

## 01  STATE MACHINE

```
        ┌──────────┐   wifi ok, paired   ┌──────────┐
  boot─>│ CONNECTING│───────────────────>│  IDLE    │<───────┐
        └────┬─────┘                     └────┬─────┘        │
             │ wifi fail x3                    │              │
             v                                 │ notification │ ack sent
        ┌──────────┐                           v              │
        │ OFFLINE  │                     ┌──────────┐         │
        │ (retry    │                     │ DISPLAY  │─────────┘
        │  backoff) │                     │ (shows    │
        └──────────┘                     │  message) │
                                           └────┬─────┘
                                                │ button press
                                                v
                                          ┌──────────┐
                                          │ COPY-SENT │──> back to IDLE
                                          └──────────┘

        ┌──────────┐
        │ CHARGING │  Qi detect asserted at any state -> overlay only,
        └──────────┘  does not interrupt DISPLAY/IDLE logic.
```

- **CONNECTING** — join known Wi-Fi (provisioned at pairing, §06), or fall
  to a BLE provisioning window on first boot / after a long-press reset.
- **IDLE** — screen off or showing a minimal clock/status glyph, radio in
  low-power poll mode (see §02 transport choice).
- **DISPLAY** — a notification line is on screen. Times out to IDLE after
  a configurable interval (default 30s) if the button is never pressed.
- **COPY-SENT** — button was pressed while a message was showing; fires the
  acknowledgement call (FIRMWARE §05 / SOFTWARE-INTEGRATION §03), then
  returns to IDLE.
- **OFFLINE** — no network; keeps the last message on screen (if any) and
  retries connection on an exponential backoff, capped at ~5 min.

================================================================================

## 02  TRANSPORT — HOW A NOTIFICATION REACHES THE SCREEN

Two options, both already have a server-side hook in this repo
(SOFTWARE-INTEGRATION.md §02 has the full contract):

```
OPTION              PRO                              CON
──────              ───                              ───
SSE long-lived       Reuses /api/sync verbatim,        ESP32-S3 holding a
connection            near-instant delivery, no         TLS socket open 24/7
                     polling waste                     costs more battery
                                                         than IDLE would like
Short poll            Simple, battery-friendlier,       Notification latency
(every 15–30s)        trivial to implement and debug    = poll interval, not
                                                          instant
```

RECOMMENDATION: poll for P1 (PROTO-0) — get the round trip working end to
end first with the simplest possible client. Revisit SSE only if P2 field
testing shows the 15–30s latency is actually a problem (a "coffee time!"
nudge does not need sub-second delivery).

================================================================================

## 03  CAMERA — CAPTURE, DON'T PROCESS ON-DEVICE

The camera (BOM §02) exists to capture context, not to run vision models on
an ESP32. Firmware's job is narrow:

1. On a trigger (button long-press, or a server-requested capture — see
   SOFTWARE-INTEGRATION §04), grab one JPEG frame from the OV2640 DVP
   interface.
2. Hold it in PSRAM.
3. Upload it as part of the next session payload (§04) — never stream raw
   frames continuously. Any image analysis (what LOT's AI actually does
   with the frame) happens server-side, same place the rest of the LOT AI
   stack already runs (Claude via the existing backend).

No always-on capture, no local storage of images beyond the current
session buffer — this keeps the privacy surface small and matches the
"pager, not a phone" positioning in PLAN §02.

================================================================================

## 04  SESSION COMPRESSION (brief #8)

A "session" here is one wear/use period — boot (or wake from IDLE) to the
next long idle gap. Rather than streaming every sensor reading and button
event live, the device buffers a session locally and compresses it before
upload, mirroring the same shape as this repo's own
`docs/technical/MEMORY-ENGINE-COMPRESSION-ARCHITECTURE.md` philosophy on
the server side: don't ship raw noise, ship a compact summary.

```
DURING SESSION                          AT SESSION END
───────────────                          ──────────────
- BME688 readings sampled every          - Reduce to: min/max/mean per
  ~60s, kept in a small ring buffer        metric, not every raw sample
- Button press timestamps appended       - Button events kept as-is (they
  to an in-memory log                      are already low-frequency)
- One camera frame max, on trigger       - JPEG (if captured) attached as-is
                                          - Whole payload gzipped before
                                            POST to keep radio-on time short
```

Session end = IDLE timeout with no activity for >5 min, or explicit
COPY-SENT event, or battery below a low-power threshold forcing an early
flush. This keeps the device's Wi-Fi radio — the single biggest power draw
on this class of chip — on for seconds per session instead of continuously.

================================================================================

## 05  THE COPY BUTTON (brief #16)

One physical button. Two behaviors, disambiguated by press length:

```
PRESS TYPE       WHILE IDLE                    WHILE DISPLAY (msg showing)
──────────       ─────────                     ────────────────────────────
Short (<800ms)    wake screen, show status       ACK the current message —
                                                  fires POST to the LOT Log
                                                  (SOFTWARE-INTEGRATION §03),
                                                  screen shows a checkmark,
                                                  returns to IDLE
Long (>800ms)     trigger a camera capture        same as IDLE long-press —
                  into the current session         capture, not ack
                  buffer (§03)
```

The name "COPY" (etched on the shell, MANUFACTURING §02) refers to radio
procedure — acknowledging receipt — not clipboard copy. Worth stating
plainly since it will be the single word a first-time user reads on the
device.

================================================================================

## 06  PAIRING / PROVISIONING

First boot (or factory reset via long-press-on-power): device opens a BLE
GATT provisioning window, a companion flow (mobile browser or the LOT web
app) writes Wi-Fi credentials + a device pairing token scoped to one LOT
user account. No credentials are ever hardcoded or shared across units —
each of the 100 pilot units gets its own token at first pairing, not at
manufacture. Full contract in SOFTWARE-INTEGRATION.md §01.

================================================================================

## 07  OTA

Firmware updates pulled over the same authenticated channel as §02, signed
builds only, staged (download fully, verify signature, swap on next IDLE
boundary — never mid-DISPLAY). Standard ESP32 OTA partition scheme
(factory + 2x OTA slots), rollback on failed boot.

================================================================================
LOT SYSTEMS CORPORATION                                        LOS ANGELES, CA
END OF FIRMWARE SPEC                                                 2026.09.10
================================================================================
