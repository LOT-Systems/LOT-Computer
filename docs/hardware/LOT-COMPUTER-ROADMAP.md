<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Computer — Roadmap

Companion to [`LOT-COMPUTER-SPEC.md`](./LOT-COMPUTER-SPEC.md) and
[`LOT-COMPUTER-BOM.md`](./LOT-COMPUTER-BOM.md). Phased so the riskiest and
cheapest-to-test assumptions get resolved before the 100-unit money is
spent.

## Phase 0 — Decide the Open Questions (this week, $0)

- [ ] Resolve the §04 height decision: 5mm sensor-only v1, or 8–10mm
      camera-in-v1. Recommendation: 5mm, no camera, v1.
- [ ] Confirm display technology: Sharp Memory LCD (recommended, daylight
      readable, near-zero standby draw) vs. small monochrome OLED (crisper,
      but backlit and battery-hungrier — worse fit for "glance and go dark").
- [ ] Confirm the notification vocabulary with the Memory Engine / QOS team
      — what set of one-line messages ("Coffee time.", QOS mode changes,
      weather-mood insights) actually gets generated today vs. needs new
      generation logic.

## Phase 1 — Electronics Bring-Up (2–3 weeks, ~$150 in dev boards)

- [ ] Order ESP32-S3 dev kit, Sharp Memory LCD breakout, BME280 breakout,
      Qi receiver breakout from Digi-Key/Adafruit — not the final PCB.
- [ ] Wire on a breadboard. Get Wi-Fi association, display draw, and one
      button press working as three independent proofs before combining.
- [ ] Build the firmware skeleton from
      [`LOT-COMPUTER-FIRMWARE.md`](./LOT-COMPUTER-FIRMWARE.md) against this
      breadboard rig.

## Phase 2 — Software / API Bring-Up (parallel with Phase 1, ~1 week eng time)

- [ ] Implement the `/api/device/*` routes from
      [`LOT-COMPUTER-API.md`](./LOT-COMPUTER-API.md) against the existing
      LOT server (extends `os-api.ts`, reuses the Log model behind
      `Logs.tsx`).
- [ ] Confirm one full loop end to end on the breadboard rig: device boots
      → pairs to a real LOT account → receives one real notification
      string → button press creates a real row in that account's Log tab.
      This loop is the actual product; everything else is packaging.

## Phase 3 — First PCB Prototype (3–4 weeks, PCBWay lead time + ~$300 for 5 boards)

- [ ] Lay out the real PCB at the target footprint (≤32×32mm) from
      [`LOT-COMPUTER-BOM.md`](./LOT-COMPUTER-BOM.md) part choices.
- [ ] Order 5 bare boards + stencil from PCBWay. Hand-assemble or use
      PCBWay's small-batch PCBA for the first 5.
- [ ] Validate: does the board fit inside a 3D-printed mock of the
      40×40×5mm shell? This is where the height decision gets tested for
      real, not on paper.

## Phase 4 — Enclosure Prototype (parallel with Phase 3, PCBWay CNC lead time)

- [ ] Send front/back shell CAD to PCBWay's CNC service, 2–3 sets in
      aluminum first (cheap iteration) before committing to 316L stainless.
- [ ] Fit-check: PCB, display, button actuator, camera lens (if included),
      Qi coil clearance, gasket seam.
- [ ] Iterate shell CAD until one aluminum prototype closes cleanly with no
      visible gap on the mirror face.

## Phase 5 — Integration Pilot: 10 Units (4–6 weeks)

- [ ] Order 10 units in final 316L stainless from PCBWay CNC, 10 PCBA
      boards from PCBWay, hand-assemble.
- [ ] Run all 10 through the full loop from Phase 2 against 10 real staff
      or friendly-user LOT accounts for at least one week each.
- [ ] Track: battery life between wireless charges, Wi-Fi reconnect
      reliability, false/missed button presses, display readability in
      daylight vs. dark room.
- [ ] Fix firmware and CAD issues found here — this is the last cheap round
      before the 100-unit commit.

## Phase 6 — 100-Unit Production Run (6–10 weeks)

- [ ] Place the full PCBWay order: 100 PCBA boards, 200 CNC stainless
      shells (100 front + 100 back), 100 Qi charging docks.
- [ ] Order packaging (rigid box, insert) and print manuals (see
      [`LOT-COMPUTER-MANUAL.md`](./LOT-COMPUTER-MANUAL.md) →
      `LOT-Computer-User-Manual.pdf` and `LOT-Computer-Quick-Start.pdf`).
- [ ] Final assembly: PCB into back shell, front shell press-fit + gasket,
      battery + Qi coil, final firmware flash + pairing QR generation per
      unit.
- [ ] Burn-in: power every unit for 24h, confirm boot + Wi-Fi + display
      self-test before boxing.

## Phase 7 — Fulfillment

- [ ] Generate per-unit pairing codes tied to the `/api/device/pair`
      endpoint (see API doc).
- [ ] Ship with Quick Start PDF (printed) + link to full manual.
- [ ] Stand up a lightweight device-support view under LOT admin tooling to
      see which of the 100 units have completed pairing and their last
      check-in time — this is a small addition to existing admin API
      patterns (`admin-api.ts`), not a new system.

## Milestone Summary

```
PHASE   NAME                        DURATION        COST (approx.)
─────   ────                        ────────        ───────────────
0       Open decisions              1 week          $0
1       Electronics bring-up        2–3 weeks       ~$150
2       Software/API bring-up       1 week (eng)     eng time only
3       First PCB prototype         3–4 weeks       ~$300
4       Enclosure prototype         3–4 weeks       ~$400 (CNC alu)
5       10-unit pilot               4–6 weeks       ~$1,500 (steel + PCBA)
6       100-unit production         6–10 weeks      ~$7,400 (see BOM)
7       Fulfillment                 ongoing         packaging/shipping
```

Total elapsed from decision to first 100 units in hand: roughly **5–6
months**, dominated by CNC/PCBA lead times and the deliberate pilot round in
Phase 5 — the round that exists specifically so the 100-unit order isn't the
first time the design meets real daily use.
