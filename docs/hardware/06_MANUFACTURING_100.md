# 06 — Manufacturing: PCBWay & 100-unit run

1. **PCB**: KiCad → Gerber/BOM/CPL. PCBWay 4-layer, 0.6 mm, ENIG, impedance-controlled
   antenna keep-out; turnkey assembly (both sides if needed). Prototype ×5, then ×100 (+10% spares).
2. **Body**: STEP files for front frame + back plate; 316L, 0.5–0.8 mm walls, CNC or MIM +
   machining; back plate #8 mirror polish, front brushed or bead-blast; non-metal window
   bonded with structural PSA/epoxy; closure by laser seam or 4× M1 screws (serviceable).
3. **Assembly order**: PCB+cam+LCD sub-assembly → battery → ferrite+coil → window/frame → back plate → test.
4. **Test jig**: pogo-pin programming/test on PCBWay panel; end-of-line functional test via `lotpager test`.
5. **QA**: 100% functional, AQL 1.0 cosmetic on polished side, sample drop (1 m), thermal (0–45 °C charging), RF range, Qi alignment.
6. **Yield budget**: order 110 PCBAs, 105 bodies; expect ≥85 ship-grade.
7. **Compliance**: pre-certified module; FCC/CE test quotes; UN38.3 cell report; RoHS.
8. **Lead time (est.)**: PCBA 2–3 wk, bodies 3–5 wk, assembly 1–2 wk.
9. Charger: ship a Qi pad per unit (bulk ~$4–6) — device charges front-down on pad.
