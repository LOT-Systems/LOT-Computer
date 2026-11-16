#!/usr/bin/env python3
"""SQ-1 Z-stack budget: can the 40x40 mm square reach 5.0 mm? (decision D1)

Every component height is a planning value from docs/02-BOM.md; rows marked
VERIFY must be replaced with datasheet values before the EVT-2 layout freeze.
The stack has three columns that sit side by side inside the case. The case
height is set by the tallest column, plus the two steel walls.

    python3 tools/zstack.py            # table + verdict
    python3 tools/zstack.py --md       # Markdown (pasted into docs/04 §3)
"""
import sys

WALLS = {  # shared by every column
    "front glass 0.4 + OCA 0.1": 0.50,
    "back plate 316L": 0.40,
    "tolerance / foam": 0.10,
}

# Column A = display region (EPD over battery). Column B = PCB strip (camera +
# button + MCU, beside the battery, NOT under the EPD). Column C = coil region.
LAYOUTS = {
    "stacked (PCB under EPD)": {
        "A": [("e-paper 1.54in", 1.00, ""), ("Qi coil + ferrite", 0.50, "VERIFY"),
              ("PCB 0.6 + SMD 0.9", 1.50, ""), ("Li-Po 1.5", 1.50, "VERIFY")],
        "B": [("camera module", 3.50, "VERIFY")],
    },
    "frame board, 1.5 mm cell (EVT-2 target)": {
        "A": [("e-paper 1.54in", 1.00, ""), ("Qi coil + ferrite", 0.50, "VERIFY"),
              ("Li-Po 1.5 (nested in PCB cut-out)", 1.50, "VERIFY"), ("gap", 0.10, "")],
        "B": [("PCB 0.6", 0.60, ""), ("tallest SMD (ESP32-S3R8 QFN)", 0.90, ""),
              ("shield can / foam", 0.20, "")],
        "C": [("camera module (through PCB cut-out)", 3.50, "VERIFY")],
    },
    "frame board, 2.0 mm cell": {
        "A": [("e-paper 1.54in", 1.00, ""), ("Qi coil + ferrite", 0.50, "VERIFY"),
              ("Li-Po 2.0 (nested)", 2.00, "VERIFY"), ("gap", 0.10, "")],
        "B": [("PCB 0.6", 0.60, ""), ("tallest SMD", 0.90, ""), ("shield can / foam", 0.20, "")],
        "C": [("camera module (through PCB cut-out)", 3.50, "VERIFY")],
    },
    "frame board, 1.5 mm cell, 2.8 mm camera": {
        "A": [("e-paper 1.54in", 1.00, ""), ("Qi coil + ferrite", 0.50, "VERIFY"),
              ("Li-Po 1.5 (nested)", 1.50, "VERIFY"), ("gap", 0.10, "")],
        "B": [("PCB 0.6", 0.60, ""), ("tallest SMD", 0.90, ""), ("shield can / foam", 0.20, "")],
        "C": [("camera module, 2.8 mm class", 2.80, "VERIFY")],
    },
}

# XY check for the frame-board layouts (interior = 40 - 2 x 1.0 mm wall = 38 x 38).
# The EPD (37.3 x 31.8) covers the top; under it, an 8 mm PCB leg runs beside the
# battery; the 6.2 mm strip below the EPD carries the camera and COPY button.
INTERIOR = (38.0, 38.0)
EPD = (37.3, 31.8)
PCB_LEG_W = 8.0          # ESP32-S3R8 QFN 7x7 + flash + crystal + PMIC, double-sided 0201
CELL_MARGIN = 1.0        # swelling + insulation allowance around the pouch
MAH_PER_MM3 = 0.06       # ultra-thin Li-Po planning density (VERIFY with the cell vendor)
MAH_PER_DAY = 9.4        # docs/01 §3.2 at a 15-min sync


def xy_budget(cell_t):
    cell_w = INTERIOR[0] - PCB_LEG_W - CELL_MARGIN
    cell_h = EPD[1] - CELL_MARGIN
    mah = cell_w * cell_h * cell_t * MAH_PER_MM3
    return cell_w, cell_h, mah, mah / MAH_PER_DAY


def evaluate(cols):
    walls = sum(WALLS.values())
    heights = {k: round(sum(h for _, h, _ in v), 2) for k, v in cols.items()}
    worst = max(heights, key=heights.get)
    return heights, worst, round(walls + heights[worst], 2)


def main():
    md = "--md" in sys.argv
    rows = []
    for name, cols in LAYOUTS.items():
        heights, worst, total = evaluate(cols)
        verdict = "5.0 OK" if total <= 5.0 else "5.5 OK" if total <= 5.5 else "FAILS 5.5"
        verify = sum(1 for v in cols.values() for _, _, f in v if f)
        rows.append((name, " / ".join(f"{k}={h:.2f}" for k, h in heights.items()), worst, total, verdict, verify))
    if md:
        print("| Layout | Column heights (mm) | Limiting column | Case Z (mm) | Verdict | VERIFY rows |")
        print("|---|---|---|---|---|---|")
        for r in rows:
            print(f"| {r[0]} | {r[1]} | {r[2]} | **{r[3]:.2f}** | {r[4]} | {r[5]} |")
        print(f"\nWalls (glass + OCA, back plate, tolerance) = {sum(WALLS.values()):.2f} mm in every layout.")
        print("\n| Cell thickness | Cell footprint (mm) | Est. capacity | Est. life @15-min sync |")
        print("|---|---|---|---|")
        for t in (1.5, 2.0):
            w, h, mah, days = xy_budget(t)
            print(f"| {t} mm | {w:.0f} x {h:.0f} | ~{mah:.0f} mAh | ~{days:.0f} days |")
    else:
        for r in rows:
            print(f"{r[0]:<42} {r[1]:<38} limit={r[2]} Z={r[3]:.2f} mm  {r[4]}  ({r[5]} VERIFY)")
        for t in (1.5, 2.0):
            w, h, mah, days = xy_budget(t)
            print(f"cell {t} mm: {w:.0f} x {h:.0f} mm  ~{mah:.0f} mAh  ~{days:.0f} days @15-min sync")
    return 0


if __name__ == "__main__":
    sys.exit(main())
