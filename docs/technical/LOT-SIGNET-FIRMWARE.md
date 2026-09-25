================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: LOT-SIGNET-FIRMWARE
TITLE:    LOT® SIGNET™ — Firmware Architecture v.0
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-09-25
VERSION:  0.1 — SPEC, NO CODE WRITTEN
STATUS:   PLANNING — companion to docs/corporate/LOT-SIGNET-HARDWARE-v0.md
================================================================================

Filed separately from the hardware/BOM document per the brief's own item 11
("separate documents") and item 9 ("firmware documents"). Read
docs/corporate/LOT-SIGNET-HARDWARE-v0.md first — it defines the physical
form, BOM, and the two data paths (downlink notification, uplink Copy
button) this firmware implements.

--------------------------------------------------------------------------------
01 // TARGET
--------------------------------------------------------------------------------

  MCU CANDIDATE   Nordic nRF52840 (BLE, favored — see hardware doc Section
                  03 for the nRF52840-vs-ESP32-C3 tradeoff, NOT YET
                  DECIDED by S-2)
  TOOLCHAIN       Zephyr RTOS or Nordic's nRF Connect SDK if nRF52840;
                  Arduino-ESP32 or ESP-IDF if ESP32-C3. This document
                  assumes nRF52840/Zephyr as the working default because
                  it best fits the battery-life constraint from the
                  hardware doc's Section 02 (5mm stack -> tiny battery
                  -> BLE's lower power draw matters more than Wi-Fi's
                  simpler backend integration). REVISIT once S-2 decides.

--------------------------------------------------------------------------------
02 // FIRMWARE MODULES — v.0 SCOPE
--------------------------------------------------------------------------------

  M1  DISPLAY DRIVER
      Render short text strings (target: <=24 characters, e.g. "Coffee
      time!") on the OLED/memory-LCD selected in the hardware BOM.
      Sleep the display between updates — the 5mm-stack battery cannot
      support an always-lit screen.

  M2  BLE NOTIFICATION RECEIVER
      Subscribe to a custom GATT characteristic pushed from the paired
      host (phone app or hub — see docs/technical/LOT-SIGNET-SOFTWARE.md
      Section 02 for what sits on the other end of this link). On
      receipt, hand the text payload to M1.

  M3  BUTTON HANDLER ("Copy")
      Debounce the single tactile button (brief item 16). On press,
      compose a small payload — device ID + timestamp + the currently
      displayed notification text, if any — and hand it to M4. No local
      text entry exists on this device; "Copy" always echoes back
      whatever the device most recently displayed or a fixed
      presence-ping payload if nothing has been displayed yet.

  M4  UPLINK QUEUE
      Buffer M3's payload and the M5 sensor reading and push both over
      BLE to the host app, which is the piece that actually calls
      `POST /api/logs` (device firmware does not speak HTTP directly in
      v.0 — see software doc Section 02 for why: TLS + auth-token
      handling on an nRF52840 is real scope, and the phone/hub already
      has both). If the ESP32-C3 path is chosen instead, M4 can call the
      LOT API directly over Wi-Fi and this module collapses into the
      software doc's connector — noted here as an open fork point, not
      resolved.

  M5  SENSOR POLL
      Bosch BME280/BME680 (hardware doc Section 03) read on a slow
      interval (proposed: every 10 minutes — no data yet to justify a
      different cadence; this is a starting number, not a measured one).
      Feeds M4.

  M6  POWER MANAGEMENT
      Deep-sleep between BLE events; wake on button interrupt or
      scheduled M5 poll. No battery-life number is claimed here — the
      hardware doc's Section 02 already flags that the battery cell is
      undersized relative to a typical BLE wearable, and any runtime
      figure written before the v.0a physical mockup (hardware doc
      Section 08) and real current-draw measurement would be a
      fabricated precision the benchmark doctrine prohibits.

  NOT IN v.0 SCOPE
    Camera capture pipeline (see hardware doc Section 07 — the module is
    populated on 10 of 100 pilot units but not driven by firmware yet).
    OTA firmware update. Local notification history / offline queue
    beyond a single in-flight uplink payload.

--------------------------------------------------------------------------------
03 // DATA FLOW (mirrors hardware doc Sections 05-06)
--------------------------------------------------------------------------------

  DOWNLINK:  LOT backend pattern fires -> host app (software doc) ->
             BLE GATT write -> M2 -> M1 -> screen
  UPLINK:    button press -> M3 -> M4 -> BLE notify -> host app ->
             POST /api/logs (event: 'signet_copy') -> Log tab

Both paths terminate at or originate from the host app, not the device
directly, in the nRF52840/BLE default. This keeps firmware small and
pushes HTTP/TLS/auth-token complexity onto the phone/hub where it is
cheap, at the cost of requiring a host app to always be paired and
reachable — an explicit tradeoff, revisit if that proves too fragile in
the v.0d ten-unit pilot (hardware doc Section 08).

--------------------------------------------------------------------------------
04 // OPEN QUESTIONS FOR NEXT SESSION
--------------------------------------------------------------------------------

  - nRF52840 vs ESP32-C3 — S-2 decision, changes this whole document's
    toolchain section.
  - Exact BLE GATT service/characteristic UUIDs — not allocated yet,
    trivial once the MCU choice is locked.
  - Whether M3's "Copy" payload needs on-device confirmation (e.g. a
    screen flash) so the user knows the log actually queued before the
    host app confirms delivery — UX question, not yet decided.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END LOT-SIGNET-FIRMWARE
================================================================================
