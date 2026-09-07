================================================================================
LOT SYSTEMS CORPORATION
DOCUMENT: COSMO-SIGNAL-v1-HARDWARE-PLAN
TITLE:    COSMO® Signal — v.1 Hardware Computer, Physical Notification Terminal
CLASS:    RESTRICTED // S-2 EYES
S-2:      VADIK MARMELADOV
DATE:     2026-09-07
VERSION:  1.0 — DESIGN LOCK, PRE-MANUFACTURING
STATUS:   PLANNING COMPLETE — BOM SOURCED — PILOT RUN (100 UNITS) NOT YET ORDERED
================================================================================

--------------------------------------------------------------------------------
00 // READING LOG — SOURCES THIS DOCUMENT IS BUILT ON
--------------------------------------------------------------------------------

Before writing a line of spec, the following were read in full:

  docs/benchmark/LOT-MANIFEST.md
    Feature #31, "COSMO Hardware," branch brave-lamport-t9z5u8, logged
    2026-06-12 as BEST (14/14 iterations, +2610 lines) — "COSMO® Cube —
    complete hardware computer design v1.0." That branch's content is not
    present anywhere in this repository's current tree or git history
    (verified: `git log --all` returns no commits referencing COSMO
    hardware; no spec file survives in docs/). Whatever v1.0 specified is
    lost to the working tree. This document does not attempt to
    reconstruct it. It is written fresh, from S-2's 2026-09-07 brief, and
    is the current authoritative spec for a COSMO® general-purpose
    hardware computer. Where this document's name or scope differs from
    the lost v1.0, this document wins.

  docs/corporate/LOT-CUBIQ-QUANTUM-CUBE-v0.md
    Establishes the naming boundary this document must respect: CUBIQ™
    (LOT®'s object) is "a notification body, not a computer" — 45mm
    nano-ceramic cube, motion-only, no screen, no camera. COSMO® Cube is
    named there as the sibling "general-purpose hardware computer," under
    Kuzya's COSMO® brand, with an explicit instruction that the two
    "share no naming collision going forward." This document's device is
    that COSMO® object — but its physical form (flat two-piece stainless
    steel body, camera, screen) has nothing in common with a cube, so it
    is named COSMO® Signal, not COSMO® Cube, to make the boundary
    unambiguous rather than relying on brand-name discipline alone.

  docs/corporate/LOT-AMBIENT-AI-VISION.md
    Names the two hardware precedents already shipping into the Usership
    kit — LOT® Station (weather/air-quality box) and LOT® Brush
    (connected toothbrush) — and states the governing design law for any
    LOT-adjacent hardware display: "one line, no alarm, exact moment —
    never push notifications, never badges." COSMO® Signal's screen
    behavior (Section 05) is built to this law, not around it. Also
    defines QIoT™ ("Quantum IoT" — physical/digital signal fusion), the
    umbrella this device sits under.

  docs/corporate/LOT-TERMINAL-M2M.md and LOT-TERMINAL-SYNC.md
    Specify the intake protocol for Terminal-class hardware: JSON payload
    shape (`device_id`, `operator`, `sensors[]`, `status`, `timestamp`),
    the future endpoint `POST https://api.lot-systems.com/v1/m2m/intake`,
    and `wss://sync.lot-systems.com/m2m/intake` for real-time push. Both
    endpoints are specified in those documents but NOT implemented in
    src/ today (confirmed by grep — no `m2m`, `webhook`, `iot`, or
    `device` route exists in src/server/routes/). COSMO® Signal's
    software integration (Section 06, and the separate
    COSMO-SIGNAL-SOFTWARE-INTEGRATION.md) treats that gap explicitly: v.1
    ships against the API surface that exists today (`/api/logs`,
    `/api/os/*`), and is written so it upgrades to `/v1/m2m/intake`
    without a hardware or firmware revision once that endpoint ships.

  docs/technical/OS_API.md and src/server/routes/api.ts
    Confirms the one real, already-deployed endpoint a physical button
    can safely call today: `POST /api/logs` (body `{ text, event?,
    metadata? }`), which writes directly into the operator's Log tab at
    lot-systems.com. This is the endpoint the COPY button (Section 05)
    calls. No new backend route is required to ship v.1's core gesture.

  docs/corporate/LOT_Autonomous_AI_Server.md
    Confirms "LOT Computer" is already the name of the self-hosted NODE-0
    AI server rig (Threadripper/RTX 5090, docker-compose.node0.yml). This
    document's device is never called "LOT Computer" for that reason —
    it is referred to by its product name, COSMO® Signal, with "a
    hardware computer" used only descriptively, never as a proper noun,
    per S-2's brief.

--------------------------------------------------------------------------------
01 // WHAT COSMO® SIGNAL IS
--------------------------------------------------------------------------------

COSMO® Signal is a small, stainless-steel, desk-resident computer that
receives one thing from lot-systems.com: a short, AI-chosen line of text,
shown the moment it matters ("Coffee time!", "Breathe — 90s", "Cohort
resonance: 3 online now") — and sends one thing back: a single button
press, logged verbatim into the operator's Log tab, the way a pager reply
used to mean "got it, on my way."

It is not a phone. It is not a smart display. It has one screen, one
button, one camera, and one job: be the physical point where the LOT
Memory Engine's attention and the operator's attention meet, without
either side having to open an app.

  COSMO® SIGNAL v.1 IS:
    - A two-piece stainless steel enclosure housing an ESP32-S3 compute
      module, a small square display, a low-power presence camera, an
      environmental sensor, wireless charging, and one physical button.
    - A read path: the device polls (and later, subscribes to) LOT's
      signal stream and renders one line of AI-composed text.
    - A write path: COPY button → `POST /api/logs` → operator's Log tab.
    - A 100-unit pilot manufacturing run through PCBWay (PCB fab, SMT
      assembly, CNC/sheet-metal stainless steel body, and final assembly
      as one turnkey order).

  COSMO® SIGNAL v.1 IS NOT:
    - A photography device. The camera is a low-resolution, on-device-only
      presence/ambient-light sensor (Section 04) — no image is ever
      stored, transmitted, or shown. This is a hard privacy gate, not a
      cost-cutting choice, and it is load-bearing for the brand's existing
      promise ("Your Memory Story lives in your database" — README.md).
    - A general notification firehose. It shows at most one line, and
      only when the Ambient AI decides the moment is exact — the same
      restraint already codified for LOT® Station and LOT® Brush.
    - A replacement for CUBIQ™. CUBIQ is motion-only and screen-free by
      design; COSMO® Signal is screen-and-camera by design. An operator
      may own both, on the same desk, for different signal classes.

--------------------------------------------------------------------------------
02 // PHYSICAL FORM
--------------------------------------------------------------------------------

  OVERALL FOOTPRINT     40mm x 40mm x 12mm assembled (S-2 brief item 4's
                         "flat silver square 4x4cm x 5mm" is the BACK
                         PLATE panel thickness, not the full enclosure —
                         see note below)
  ENCLOSURE             Two-piece stainless steel body (S-2 brief item 3):
                           FRONT SHELL — 316L stainless, bead-blasted satin
                             finish, houses display window, camera aperture,
                             COPY button
                           BACK PLATE — 316L stainless, mirror-polished,
                             40mm x 40mm x 5mm flat square (S-2 brief item 4),
                             doubles as the branded "face" when the unit is
                             shelved screen-down; laser-etched COSMO® mark,
                             serial number, and QR pairing code
  FRONT / BACK SPLIT     Front shell = camera + screen + button (S-2 brief
                         item 18). Back plate = polished stainless, no
                         components, pure identity surface (S-2 brief
                         item 17).
  WHY 12mm, NOT 5mm, OVERALL
    5mm is sufficient for the polished back plate alone (a solid stainless
    disc has no clearance to keep). It is not sufficient to also clear a
    display module (~2.5mm), an ESP32-S3 module (~2.6mm), a 300mAh pouch
    cell (~3mm), a Qi receiver coil (~0.5mm), and standoff/gasket
    clearance in the front shell without the front glass touching the PCB.
    v.1 keeps the back plate at the brief's exact 5mm and lets the front
    shell carry the remaining ~7mm of stack height — the polished face S-2
    specified is delivered at spec; the working electronics live in the
    half of the enclosure built to hold them.
  MASS TARGET            <95g fully assembled (stainless is heavy by
                         design — the unit should not slide on a desk; a
                         rubber gasket ring at the shell seam adds grip
                         and is the only non-metal, non-glass exterior
                         surface)
  FINISH                 Front: satin/bead-blasted (fingerprint-resistant,
                         matches CUBIQ's "matte LOT black" restraint
                         philosophy in a lighter material). Back: mirror
                         polish (S-2 brief item 17).
  SEAM                    Front and back join on a recessed lip with 4x
                         M1.6 stainless screws (serviceable — battery
                         replacement without adhesive rework) plus a
                         silicone gasket for dust/splash resistance
                         (IP54 target, not submersible).

--------------------------------------------------------------------------------
03 // ELECTRONICS
--------------------------------------------------------------------------------

  COMPUTE      ESP32-S3-WROOM-1-N16R8 (dual-core Xtensa LX7, Wi-Fi + BLE
               5.0, 16MB flash / 8MB PSRAM) — same module family already
               named in LOT-TERMINAL-M2M.md's reference hardware
               ("Psychotronic Weather Station"), so firmware patterns and
               vendor SDK experience carry over from that doc's prior art.
  DISPLAY      1.3" IPS square/round TFT, 240x240, SPI, ST7789 driver —
               small enough to sit inset in the 40x40mm front shell with a
               stainless bezel margin. Single line of text, large type,
               dark background — matches the "one line, no alarm" law.
  CAMERA       OV2640, 2MP capable, run at low resolution — used ONLY for
               (a) presence detection (is anyone at the desk — gates
               whether a notification renders vs. queues silently) and
               (b) QR-code pairing during setup. No frame is ever written
               to flash, transmitted over the network, or displayed. This
               is enforced in firmware (Section 04 of
               COSMO-SIGNAL-FIRMWARE.md), not left as a policy note.
  BUTTON       Single tactile switch, stainless steel cap, IP54-rated,
               flush-mounted on the front shell — the COPY button
               (S-2 brief item 16, Section 05 below).
  SENSOR       Bosch BME688 — temperature, humidity, barometric pressure,
               and AI-driven gas/VOC scanning in one I2C package (S-2
               brief items 14-15: "weather sensor," "AI grade off-the-
               shelf sensors" — BME688 is marketed by Bosch as the first
               AI-enabled gas sensor, off-the-shelf, no custom silicon).
  MOTION       6-axis IMU (accelerometer + gyroscope) — desk-bump / pickup
               detection, reused component class from CUBIQ v.0's sensing
               stack for supply-chain and firmware-driver commonality.
  CHARGING     Qi-class wireless receiver coil + charge-management IC,
               integrated behind the back plate (S-2 brief items 12, 19)
               — same "table is the charger" pattern CUBIQ v.0 already
               established for the LOT desk-hardware line. Companion Qi
               transmitter puck ships in the box.
  BATTERY      3.7V 300mAh LiPo pouch cell — enough for ~4-5 days of
               idle-poll operation between wireless charges at the target
               duty cycle in Section 05.
  CONNECTIVITY Wi-Fi 2.4GHz (station mode, WPA2/3) for the read/write
               paths in Section 06. No cellular, no Bluetooth pairing to
               a phone required for core function (BLE reserved for setup
               only).

--------------------------------------------------------------------------------
04 // THE CAMERA — SCOPE AND PRIVACY GATE
--------------------------------------------------------------------------------

S-2 brief item 5 says only "Camera" — no purpose specified. This document
fixes the scope narrowly, on purpose, because an always-on camera on a
desk device is the single highest-trust-risk component in this BOM:

  IN SCOPE FOR v.1:
    - Presence sensing: low-frame-rate (1 fps, downsampled to ~20x20px
      luminance blob) check for "someone is at the desk" — gates whether
      an incoming notification renders now or queues for the next
      presence window, consistent with LOT-AMBIENT-AI-VISION.md's "exact
      moment" law.
    - QR pairing: one-time scan of a pairing code shown at
      lot-systems.com/pair during setup, to bind device_id to operator
      account. Camera is otherwise dormant.

  OUT OF SCOPE FOR v.1 (explicit, not deferred silently):
    - No image capture, storage, or transmission, ever.
    - No facial recognition, no identity inference beyond "occupied /
      not occupied."
    - No video call, no photo mode. If a future version adds either, it
      requires its own document and its own explicit operator consent
      flow — this document does not pre-authorize it.

--------------------------------------------------------------------------------
05 // THE TWO GESTURES: RECEIVE AND COPY
--------------------------------------------------------------------------------

COSMO® Signal has exactly two behaviors, matching S-2 brief items 2, 6,
and 16:

  RECEIVE (pager-like notification, S-2 brief item 2)
    Trigger:   Ambient AI on lot-systems.com decides a moment is exact
               (same decision engine already gating LOT® Station / LOT®
               Brush per LOT-AMBIENT-AI-VISION.md).
    Delivery:  v.1 polls a status/insight endpoint every 30s (see
               COSMO-SIGNAL-SOFTWARE-INTEGRATION.md); upgrades to
               `wss://sync.lot-systems.com/m2m/intake` push, zero
               firmware change required, once that endpoint ships
               server-side.
    Render:    One line, large type, plain background, no sound, no
               vibration, timeout after 20s back to a blank/dim screen —
               "Coffee time!" is the reference example S-2 gave; the
               copy is always AI-composed, never a raw system string.
    Presence gate: only renders if the camera's presence check
               (Section 04) reports "occupied" in the last 90s; otherwise
               the message queues silently and renders on next presence.

  COPY (S-2 brief item 16)
    Trigger:   Operator presses the button.
    Action:    Device fires `POST /api/logs` with `{ text: <the currently
               displayed message, or "Acknowledged" if screen is blank>,
               event: "cosmo_signal_copy", metadata: { device_id,
               battery_pct, timestamp } }` — landing directly in the
               operator's Log tab, the same tab a manual journal entry
               would appear in.
    Feedback:  Screen briefly shows a single checkmark glyph, then
               returns to blank. No further confirmation UI — the Log
               tab itself is the confirmation, by design (single source
               of truth, no duplicate "sent!" toast).
    Why "Copy," not "Acknowledge" or "Dismiss": S-2's brief names it
               explicitly. It reads as "I am copying this into my own
               record" — pager culture ("copy that") deliberately, not
               app-notification culture ("dismiss").

--------------------------------------------------------------------------------
06 // SOFTWARE / API CONNECTOR (SUMMARY — FULL SPEC IN SEPARATE DOCUMENT)
--------------------------------------------------------------------------------

Full detail lives in COSMO-SIGNAL-SOFTWARE-INTEGRATION.md (S-2 brief
items 6, 10, 11 — "Use LOT API connector," "software to connect with
firmware," "separate documents"). Summary only, here:

  v.1 (ships against what exists today):
    READ:  GET /api/os/insights, GET /api/os/status  (poll, 30s)
    WRITE: POST /api/logs                             (COPY button)

  v.2 (upgrades in place once server-side work lands — no new hardware):
    READ:  wss://sync.lot-systems.com/m2m/intake       (push, <100ms)
    WRITE: POST https://api.lot-systems.com/v1/m2m/intake (adds sensor
           telemetry — BME688 + IMU — as the "Multi-Sensor Array" JSON
           shape already specified in LOT-TERMINAL-M2M.md)

--------------------------------------------------------------------------------
07 // MANUFACTURING (SUMMARY — FULL ROADMAP IN SEPARATE DOCUMENT)
--------------------------------------------------------------------------------

Full detail, timeline, and gates live in
COSMO-SIGNAL-MANUFACTURING-ROADMAP.md and the sourced parts list in
COSMO-SIGNAL-BOM.md (S-2 brief items 1, 13). One vendor, PCBWay, carries
PCB fabrication, SMT assembly, CNC/sheet-metal stainless steel
enclosure machining, and final assembly as a single turnkey relationship
for the 100-unit pilot run (S-2 brief item 13).

--------------------------------------------------------------------------------
08 // ROADMAP — v.0 → v.1 → v.2
--------------------------------------------------------------------------------

  v.0 — BENCH PROTOTYPE (1-3 UNITS, HAND-ASSEMBLED)
    Off-the-shelf dev boards (ESP32-S3-EYE class board + breakout
    BME688 + breakout Qi receiver) wired on a bench, 3D-printed shell
    standing in for stainless steel, to validate: presence-gated render
    logic, COPY → /api/logs round trip, and battery life under the real
    30s poll duty cycle.
    GATE: 72 hours continuous bench operation, zero missed COPY events
    against a manual log of button presses, presence-gate false-positive
    rate <10%.

  v.1 — PILOT RUN (100 UNITS, THIS DOCUMENT)
    Custom PCB (ESP32-S3 + BME688 + IMU + Qi receiver + display driver),
    CNC/sheet-metal stainless steel two-piece body, PCBWay turnkey
    assembly, wired against the v.1 API surface in Section 06.
    GATE: 100/100 units pass post-assembly QC (screen lights, camera
    presence-check responds, COPY button reaches /api/logs, wireless
    charge detected); <5% return/defect rate in first 30 days of
    operator use.

  v.2 — PUSH UPGRADE (SAME HARDWARE, SERVER-SIDE ONLY)
    No enclosure or PCB revision. Server ships `/v1/m2m/intake` and
    `wss://sync.lot-systems.com/m2m/intake` per LOT-TERMINAL-M2M.md /
    LOT-TERMINAL-SYNC.md; v.1 units receive an OTA firmware update that
    switches poll → push and begins reporting BME688/IMU telemetry
    upstream as the "Multi-Sensor Array" payload.
    GATE: <100ms notification latency in 9/10 trials, zero data loss
    across a forced Wi-Fi drop/reconnect test (hybrid fallback per
    LOT-TERMINAL-SYNC.md).

--------------------------------------------------------------------------------
09 // BRAND
--------------------------------------------------------------------------------

COSMO® Signal            The object — under Kuzya's COSMO® hardware line,
                          the "general-purpose hardware computer" role
                          LOT-MANIFEST.md already reserved for COSMO®
LOT® Memory Engine        The intelligence choosing what the screen shows
Log tab (lot-systems.com) Where every COPY press lands
CUBIQ™ / LOT® Quantum Cube Sibling device, motion-only — not this object,
                          no naming or role overlap

================================================================================
AUTHORIZED BY: S-2 // VADIK MARMELADOV
END COSMO-SIGNAL-v1-HARDWARE-PLAN
================================================================================
