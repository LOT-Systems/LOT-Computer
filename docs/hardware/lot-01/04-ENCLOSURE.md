# LOT·01 — Enclosure: Two-Part Stainless Steel Body

## Parts

| Part | Name | Material | Process | Finish |
|---|---|---|---|---|
| **A** | Back shell (the "silver square") | 316L stainless | CNC from bar (EVT/DVT); deep-draw + CNC trim if v2 goes > 1k units | **Mirror polish #8**, no holes, laser serial optional |
| **B** | Front bezel frame | 316L stainless | CNC | Polished outer edge, bead-blast top face (fewer visible fingerprints) |
| B1 | Cover glass | Aluminosilicate 0.4 mm | CNC + chem-strengthening + ink print | Black mask, clear Ø2 mm camera window, AR/AF |
| B2 | Copy key | 316L | CNC / MIM in PVT | Polished |

## Drawing (section, not to scale)

```
          glass 0.40   bezel B (2.0 mm rim)
        ┌──────────────────────────────────┐
  B ──► │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ◄─ glass, ink mask
        │  LCD 0.74          ┌cam┐  [key]  │
        │  Qi coil + ferrite │   │         │
        │  PCB 0.40 ─────────┤   ├──────── │
        │  [battery 2.2] [LRA]│   │ [ICs]   │
  A ──► │══════════════════════════════════│ ◄─ 0.40 floor, mirror outside
        └──────────────────────────────────┘
          ◄────────────── 40.0 ────────────►        total Z ≈ 4.9 mm
```

## Key tolerances
- Outline 40.00 ± 0.05 mm; corner radius R3.0; edge break R0.8 (A), R0.3 (B)
- A/B parting line gap ≤ 0.05 mm, step ≤ 0.03 mm
- Flatness of Part A face ≤ 0.03 mm (a mirror shows every warp)
- Glass flush to bezel within −0.05/+0.00 mm

## Joining A ↔ B
**EVT/DVT:** 4 × M1.0 × 2 mm torx screws through the B side wall into tapped bosses on A, so units can be opened.
**PVT:** same screws, plus a die-cut gasket (IP54). No glue on A, so the polish is safe and units stay serviceable.

## Openings (all on side B / edges — none on A)
| Opening | Size | Purpose |
|---|---|---|
| Key slot | 6.2 × 3.2 mm | Copy key, 0.05 mm clearance, silicone boot |
| Vent | Ø0.3 mm laser hole, edge-facing | BME688 air path, ePTFE membrane inside |
| Camera | through glass | clear window in ink |
| Test pads | under glass, reached when opened | Tag-Connect TC2030 programming |

## RF & Qi rules for the ME
- No steel over the antenna: keep ≥ 3 mm from the chip antenna to Part B, and none in front of it (glass only).
- Keep the Qi coil fully under the glass aperture; the bezel inner edge must clear the coil OD by ≥ 1 mm.
- Ground Part A to the PCB ground via one spring contact (ESD path, EMC).
