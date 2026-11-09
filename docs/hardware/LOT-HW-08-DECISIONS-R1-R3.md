# LOT-HW-08 — Decision Memo: Thickness, Charging, RF (R1–R3)
**Session:** 2026-11-09 (S2) · **Needs:** Vadik sign-off (blocks PCB layout, P0 gate)
Stack numbers: `tools/zstack.py` (planning values, not datasheet-verified).

## R1 Thickness (target 5 mm)
| Option | Total | Camera | Qi | Verdict |
|---|---|---|---|---|
| A Full | ~7.4 mm | yes | yes | Works; not the 5 mm object |
| B Slim | ~5.4 mm | yes (module must be < ~4 mm, needs sourcing) | yes | **Recommended**: 0.6 mm walls, 0.91" OLED, 2 mm LiPo. Reaches 5.4; 5.0 only if camera lens sits in a pocket |
| C Shell | ~4.8 mm | no | no | Meets 5 mm; loses items 5, 19 |
Decision asked: **B**, spec "5.4 mm max, 40 × 40 mm". Note 0.6 mm 316L walls need a CNC DFM check (flatness, polish through-cut).

## R2 Wireless charging through steel
Stainless blocks Qi. Choices: (1) glass/ceramic window in the **front** around the screen area, coil behind it, back stays pure mirror (recommended); (2) window in back (breaks item 17); (3) pogo dock only (drops item 19). Decision asked: **(1)**. Qi at 5 W into a 130 mAh cell needs only ~1 W, so a small coil is acceptable. Prove in EVT (efficiency target ≥ 60 % with 1 mm glass).

## R3 RF
Antenna at a non-metal seam: PEEK/silicone gasket between the two steel parts, ceramic chip antenna at the gasket edge. Decision asked: **accept gasket seam** as visible detail. Verify range ≥ 10 m in EVT.

## Camera note
OV2640 FPC modules are commonly 4–5 mm tall with lens; Option B needs a ≤ 3.5 mm module (sourcing item, S3). Camera stays off by default, shutter LED mandatory (R5).

## Sign-off block
[ ] R1 = B  [ ] R2 = (1)  [ ] R3 = gasket seam  — Vadik, Inventor, COSMO® CIA
