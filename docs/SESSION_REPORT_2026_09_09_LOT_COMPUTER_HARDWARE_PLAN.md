# SESSION REPORT — LOT COMPUTER Hardware Plan v0.1
## Date: 2026-09-09 · Branch: claude/brave-lamport-7floqd
### Session Type: Hardware Product Planning (scheduled task)

---

```
╔══════════════════════════════════════════════════════════════════╗
║  LOT SYSTEMS CORPORATION — HARDWARE SESSION REPORT               ║
║  LOT COMPUTER — first physical product, concept-to-plan          ║
║  September 9, 2026                                                ║
║  Authorized: S-2 // VADIK MARMELADOV                              ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 1. SESSION CONTEXT

Scheduled task requested a full plan for LOT Computer: a stainless steel,
pager-like AI notification companion to the LOT Memory Engine and Quantum
Operating System, built to a 19-point founding brief (PCB fabrication
partner, 2-part stainless body, camera, wireless charging, weather sensor,
100-unit run, a "Copy" button that logs back to lot-systems.com, PDF
manuals, and separated firmware/software documentation).

No hardware exists yet — this session produced the concept-to-build
documentation set the roadmap requires before the first dollar is spent on
parts. Research pass checked the existing `LOT-NODE-0-RIG-SPEC.md` (the
AI server rig spec) and `docs/technical/OS_API.md` for house style and
prior art before writing anything new — the new documents extend those
patterns rather than inventing a third convention. Attempts to fetch
`lot-systems.com/about`, `brand.lot-systems.com`, and
`institute.lot-systems.com/cqgs.html` for brand/mission context were
blocked by this session's network egress policy; the plan below is built
from the repository's own documentation instead.

---

## 2. WHAT SHIPPED THIS SESSION

New directory: `docs/hardware/`

```
LOT-COMPUTER-SPEC.md          Industrial design, electronics stack,
                               PCBWay as single manufacturing partner,
                               the open 5mm-vs-camera height risk.
LOT-COMPUTER-BOM.md           Full components buying list, supplier
                               links, per-unit and 100-unit costs
                               (≈ $74/unit manufacturing floor).
LOT-COMPUTER-ROADMAP.md       8-phase plan: open decisions → electronics
                               bring-up → software/API bring-up → first
                               PCB prototype → enclosure prototype →
                               10-unit pilot → 100-unit production →
                               fulfillment. ~5–6 months end to end.
LOT-COMPUTER-FIRMWARE.md      On-device firmware architecture (ESP32-S3):
                               boot loop, Copy-button flow, notification
                               rendering, power management, OTA.
LOT-COMPUTER-API.md           Proposed /api/device/* server routes:
                               pair, session-digest, log (Copy→Log tab),
                               weather, capture (v2), firmware.
LOT-COMPUTER-MANUAL.md        Manual source: setup, daily use, stainless
                               steel care, privacy, specs, troubleshooting.
LOT-Computer-User-Manual.pdf  Full manual, generated from the above.
LOT-Computer-Quick-Start.pdf  One-page setup card, generated from the
                               same source.
README.md                     Index + reading order for the hardware line.
```

`docs/README.md` updated with a new **Hardware Documentation** section
pointing into `docs/hardware/`.

---

## 3. KEY DECISIONS AND OPEN RISK

**PCBWay as single manufacturing partner** — the brief's item 1 ("PCB Way")
is used for more than board fab: PCBWay's CNC/sheet-metal service also
machines both stainless steel shells, consolidating PCB, PCBA, and
enclosure into one vendor relationship for a 100-unit run.

**Open risk flagged, not resolved:** the brief's 4×4cm × 5mm target
enclosure cannot fit an off-the-shelf camera module (typically 3.5–4.5mm
thick alone) alongside PCB, display, and battery. `LOT-COMPUTER-SPEC.md`
§04 lays out the stack-up and recommends shipping v1 at 5mm **without** the
camera (weather sensor, screen, button, wireless charge only), adding the
camera in a v2 revision at 8–10mm once a bare-die camera module is
validated. This decision is Vadik's to make before Phase 1 of the roadmap
starts — it changes the BOM, the firmware camera section, and the API's
`capture` endpoint from "v1" to "v2, conditional."

**Software model:** the "Copy" button and the notification screen are
designed as two new client surfaces on data the LOT web app already owns —
button presses become rows in the same `Log` table `Logs.tsx` writes to,
and the on-screen headline reuses the Memory Engine's existing session
compression architecture rather than a new one. No parallel data model was
introduced.

---

## 4. NOT DONE THIS SESSION (explicitly out of scope)

- No firmware code, no PCB layout files, no CAD — this session is planning
  documentation only, per the roadmap's own Phase 0/1 gating.
- No `/api/device/*` routes implemented in `src/server/routes/` — the API
  document is a proposal to build against in Phase 2, not a merged change
  to the running server.
- No PCBWay quote requested and no funds committed — the BOM and roadmap
  are estimates for planning, explicitly flagged as "confirm at quote
  time" throughout.

---

## 5. NEXT SESSION

Per `LOT-COMPUTER-ROADMAP.md` Phase 0: get Vadik's decision on the
5mm-vs-camera trade-off and the display technology choice, then start
Phase 1 (breadboard electronics bring-up) and Phase 2 (implement the
`/api/device/*` routes against the existing server) in parallel.

---

```
╔══════════════════════════════════════════════════════════════════╗
║  END SESSION REPORT — LOT COMPUTER v0.1                          ║
╚══════════════════════════════════════════════════════════════════╝
```
