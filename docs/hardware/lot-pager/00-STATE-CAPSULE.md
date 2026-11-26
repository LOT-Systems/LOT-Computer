<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT PAGER · TILE-40 — 00 · STATE CAPSULE (compressed session memory)

> Every session reads this file **first** and rewrites it **last**. It is the compressed
> state of the whole program, kept to 60 lines or fewer, so no session has to re-read the
> full document set to continue. The rule for each line: if a decision is not here,
> it was not made.

```
CAPSULE  v1 · 2026-11-26 · after session 1 (P0 CONCEPT LOCK)
PHASE    P0 ✔ → next P1 EVT-0 BENCH
```

**LOCKED**

- Form: 40×40 mm, Z target 5.0 mm, EVT-1 acceptance ≤ 6.0 mm. 316L, 2 parts.
  - Back: #8 mirror with a Ø18 zirconia inlay.
  - Front: bead-blast frame, glass, LCD, camera, COPY key.
- MCU: ESP32-S3-MINI-1-N4R2 (pre-certified). Chip-down only at 1k+ units.
- Display: Sharp LS013B7DH03 128×128 memory LCD, reflective silver, ~0 µW static.
- Sensors (AI-grade, off-the-shelf): BME688 (weather + gas, BSEC2), BHI260AP (AI IMU), LTR-303 (light), GC2145/OV2640 camera.
- Power: 202030 LiPo, ~85 mAh. BQ51050B (Qi RX + charger), MAX17048, TPS62840.
- Charging: decision D-01 = option A, a ceramic-window Qi plus the matched LOT puck. Fallback: pogo (option B).
- API EVT-0:
  - Reads `GET /api/contextual-prompts` → `GET /api/live-message`.
  - COPY sends `POST /api/logs` with `{event:'note', metadata.source:'lot-pager'}`.
  - Auth is the `auth_token` cookie (test account only).
- API EVT-1: scoped device tokens through `/api/device/*`, as proposed in 06. NOT built.
- Pager line: ≤ 64 ASCII characters, compressed by `lot::compress` (firmware and JS port, identical).
- PCB: 4L HDI, 0.6 mm, ENIG, PCBWay turnkey. Final assembly and EOL in-house.
- RUN-100 estimate: $17–25k variable, plus $3–8k certification. Unit about $158–214.

**OPEN**

- R-01: Z-stack is 5.10 mm on paper. Needs real measurements of the LCD and the cell (P1/P2).
- R-02: Qi coupling through an Ø18 inlay with a steel surround. Bench test in P1 with a steel mock-up.
- R-05: BME688 self-heating offset in the sealed can.
- Can the memory LCD EXTCOMIN toggle run in deep sleep? Datasheet plus bench check.
- The brand sites were unreachable from the sandbox. Add the `*.lot-systems.com` domains to the environment network allowlist.

**NEXT SESSION (P1) — do in order**

1. Buy BOM section A, about $150.
2. Compile the firmware with `pio run`, and fix anything that does not build.
3. Flash it and point it at the test account.
4. Show that Copy appears in the Log tab.
5. Measure: sleep current, energy per sync, Qi through the steel mock-up, RSSI inside the steel mock-up.
6. Write the results into this capsule and the session report.

**FILES**

- `docs/hardware/lot-pager/01…08` (plus `pdf/`)
- `hardware/lot-pager/firmware`
- `hardware/lot-pager/connector`
