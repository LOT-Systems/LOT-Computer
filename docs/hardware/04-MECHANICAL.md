# LOT COMPUTER — Mechanical & Industrial Design

Doc ID: LOT-HW-04 · Rev A · 2026-10-20

## 1. Envelope
Target 40 × 40 mm. Height: **5 mm requested; v1 baseline 9 mm** (see 01 §3 R1). Corner radius 3 mm, edge chamfer 0.3 mm.

Stack (v1, mm): back plate 0.8 · ferrite+coil 0.7 · battery 3.0 · PCB+components 2.0 (components both sides, 0.8 board) · display/cam layer · front plate 0.8 ≈ 9.

## 2. Two-part body
- **Part A (back):** polished 316L, mirror face outward. Centre Ø26 mm ceramic/PEEK Qi window flush-bonded (R2). Inner ledge for coil + ferrite.
- **Part B (front):** 316L frame with: 31 × 33 display window, Ø6 camera window, button hole (or capacitive zone), 2 mm antenna gap at one edge with plastic insert (R3).
- Joint: 4 × M1.2 screws or laser-weld seam (non-serviceable). Silicone gasket → IP54.

## 3. Finish
Polished side: mirror (#8). Other side: brushed/bead-blasted to avoid glare and fingerprints on camera side. Passivation per ASTM A967.

## 4. Manufacturing
Prototype: CNC (PCBWay/Xometry). 100 pcs: CNC still OK ($); >1000: MIM/stamping. Polishing is a hand-labor cost driver; spec the mirror grade and inspect under 10× light.

## 5. Charger reading (c): 40×40×5 mm silver Qi pad
Aluminum-free top (PC/ceramic) over TX coil; stainless or anodized aluminum frame ring; magnets optional (check against compass/IMU). Max 5 W.

## 6. Tests
Drop 1 m ×6 faces, 85 °C/ 85 % RH, Qi efficiency through window (target ≥ 60 %), thermal rise ≤ 10 °C during charge, RF throughput at −70 dBm.
