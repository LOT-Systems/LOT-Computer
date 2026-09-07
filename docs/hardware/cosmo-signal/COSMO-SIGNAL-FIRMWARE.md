================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: COSMO-SIGNAL-FIRMWARE
TITLE:    COSMO® Signal — Firmware Architecture
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-09-07
VERSION:  1.0 — PLANNING (NO CODE WRITTEN YET)
COMPANION: COSMO-SIGNAL-v1-HARDWARE-PLAN.md, COSMO-SIGNAL-SOFTWARE-INTEGRATION.md
================================================================================

This document is deliberately separate from
COSMO-SIGNAL-SOFTWARE-INTEGRATION.md (S-2 brief item 11: "Separate
documents"). This one describes what runs ON the device. The other
describes what the LOT platform does to talk TO the device. The
boundary between them is the Wi-Fi link — everything on this side of it
is firmware; everything past it is server/site software.

--------------------------------------------------------------------------------
01 // TOOLCHAIN
--------------------------------------------------------------------------------

  FRAMEWORK    ESP-IDF (Espressif's native SDK) or Arduino-ESP32 core —
               recommend ESP-IDF for production firmware (finer power-
               management control, needed for the multi-day battery
               target in the hardware plan), Arduino-ESP32 acceptable
               for the Phase 0 bench prototype where iteration speed
               matters more than power tuning.
  LANGUAGE     C (ESP-IDF native) / C++ (Arduino compatibility layer)
  OTA          ESP-IDF's built-in OTA partition scheme — required from
               v.1 onward, since the v.2 push-upgrade (hardware plan
               Section 08) is explicitly designed to ship as a firmware
               update with no enclosure or PCB change.
  BUILD/CI     Firmware repo (separate from this monorepo, per LOT
               Terminal's own precedent of a distinct GitHub repo for
               hardware — LOT-TERMINAL-VISION.md) should build against
               a pinned ESP-IDF version and produce signed OTA images.

--------------------------------------------------------------------------------
02 // TASK / MODULE MAP
--------------------------------------------------------------------------------

  main.c
    │
    ├── power_mgr        Wakes from deep sleep on a timer (poll interval,
    │                    Section 03) and on button-press interrupt.
    │                    Owns the battery-percentage read (needed for
    │                    the COPY payload's metadata field).
    │
    ├── net_mgr           Wi-Fi station connect/reconnect, exponential
    │                    backoff on failure, credential storage in NVS
    │                    (set during BLE pairing, Section 04).
    │
    ├── presence_sensor    Owns the OV2640. On wake: captures ONE
    │                    downsampled luminance frame, computes an
    │                    occupied/not-occupied boolean, and DISCARDS the
    │                    frame buffer immediately. No frame ever reaches
    │                    flash or the network — enforced here, in code,
    │                    not left as a policy statement (hardware plan
    │                    Section 04 is the requirement; this module is
    │                    the enforcement).
    │
    ├── env_sensor         BME688 I2C driver — temp/humidity/pressure/
    │                    gas-scan reads, cached for the future v.2
    │                    telemetry payload (unused by v.1's write path,
    │                    which sends no sensor data — see software
    │                    integration doc Section 02).
    │
    ├── motion_sensor      IMU I2C driver — bump/pickup detection,
    │                    same rationale as env_sensor: read and cached
    │                    now, wired into the outbound payload at v.2.
    │
    ├── display_mgr        Owns the ST7789. Renders exactly one string,
    │                    large type, dark background, and a 20s
    │                    countdown-to-blank timer. Renders the single
    │                    checkmark glyph on COPY confirmation (hardware
    │                    plan Section 05). No other UI states exist in
    │                    v.1 — no menus, no settings screen on-device
    │                    (setup happens via BLE + phone/site, Section 04).
    │
    ├── button_mgr         Debounced GPIO interrupt on the COPY button.
    │                    On press: reads the currently displayed string
    │                    from display_mgr, hands it to api_client for
    │                    the /api/logs POST, and requests the checkmark
    │                    render.
    │
    ├── api_client         HTTPS client (mbedTLS via ESP-IDF), holds the
    │                    device's operator auth token (obtained during
    │                    BLE pairing, Section 04), implements the poll
    │                    loop and the COPY POST described in
    │                    COSMO-SIGNAL-SOFTWARE-INTEGRATION.md.
    │
    └── charge_mgr          Reads the Qi receiver's charge-detect line,
                          feeds power_mgr's battery-percentage estimate,
                          and disables presence_sensor polling while
                          actively charging (device is face-down on the
                          puck while charging — no legitimate presence
                          reading is possible in that orientation).

--------------------------------------------------------------------------------
03 // DUTY CYCLE / POWER BUDGET
--------------------------------------------------------------------------------

  STATE                 FREQUENCY          NOTES
  ─────                 ─────────          ─────
  Deep sleep             default            Wi-Fi radio off, ESP32-S3
                                             deep-sleep mode (~10uA class)
  Poll wake               every 30s          Wi-Fi connect (if not
                                             already associated), one
                                             GET request, back to sleep
                                             if no message
  Presence check           on poll wake       Piggybacks on the same
                                             wake cycle — one camera
                                             frame, discard, sleep
  Render + hold             on new message      Display stays lit up to
                                             20s, then blanks; this is
                                             the dominant active-power
                                             state and is bounded by
                                             design (Section 05 of the
                                             hardware plan)
  Button press             async, any time     Interrupt wake from deep
                                             sleep, immediate POST, no
                                             wait for next poll cycle

  This duty cycle is the basis for the ~4-5 day battery estimate in the
  hardware plan (Section 03). It is a planning target, not a measured
  number — Phase 0 bench testing (manufacturing roadmap Section 01)
  is where this gets verified against the real 300mAh cell.

--------------------------------------------------------------------------------
04 // PAIRING / SETUP FLOW
--------------------------------------------------------------------------------

  1. Operator presses and holds the COPY button 5s on first boot →
     device enters BLE provisioning mode (ESP-IDF's built-in BLE
     provisioning, `esp_wifi_provisioning`) and shows a QR code on the
     display encoding a short pairing ID.
  2. Operator visits lot-systems.com/pair (site-side — see software
     integration doc), scans the code (via phone camera or by typing
     the pairing ID), and authorizes the device against their account.
  3. Site issues a short-lived pairing token over BLE to the device;
     device exchanges it for a long-lived operator auth token via the
     API (software integration doc Section 01), stores it in NVS, and
     reboots into normal poll-loop operation.
  4. The device's own camera (Section 02, presence_sensor module) is
     used ONLY to display/scan the pairing QR on the SITE's screen
     during step 1-2 setup context if operators pair via a second
     device — the on-device camera does not scan anything itself; it
     is the site or phone camera doing the scanning of the code the
     COSMO® Signal displays. This keeps the camera's only two jobs
     exactly as scoped in hardware plan Section 04.

--------------------------------------------------------------------------------
05 // OPEN FIRMWARE QUESTIONS FOR PHASE 0
--------------------------------------------------------------------------------

  - Confirm actual idle current draw against the 300mAh cell once real
    hardware exists — the Section 03 duty cycle is a spreadsheet
    estimate, not a bench measurement.
  - Decide OTA signing/rollback policy before Phase 4 (100-unit run) —
    a bad OTA push to 100 fielded units with no rollback path is a real
    operational risk, not a hypothetical one.
  - Decide whether BME688/IMU readings get buffered on-device during
    v.1 (write path unused, per Section 02) so v.2's OTA upgrade can
    immediately backfill recent history, or whether v.2 simply starts
    fresh telemetry from the upgrade point. Either is defensible; pick
    one before Phase 1 PCB layout locks the flash budget.

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END COSMO-SIGNAL-FIRMWARE
================================================================================
