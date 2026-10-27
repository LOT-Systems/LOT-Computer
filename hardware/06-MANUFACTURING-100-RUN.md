# 06 · Manufacturing — PCBWay & the 100-Unit Run

## 1. Why PCBWay
One vendor for: PCB fab, SMT assembly (turnkey incl. parts sourcing), CNC stainless parts + polishing, 3D printing prototypes, and some final assembly. Links (verify): PCB https://www.pcbway.com/orderonline.aspx · Assembly https://www.pcbway.com/pcb-assembly.html · CNC https://www.pcbway.com/cnc-machining-quote.html · Prototyping https://www.pcbway.com/rapid-prototyping/

## 2. Deliverables PCBWay needs
- Gerbers, drill, pick-and-place CSV, BOM (MPN-level, with alternates), assembly drawing, stackup, impedance note (antenna 50 Ω).
- Steel: STEP + 2D drawing (tolerance, finish #8 / bead-blast, material 316L, edge break), window insert drawings.
- Test spec: functional jig description (see 04 §7).

## 3. Stages
| Stage | Qty | Goal | Est. cost | Lead time |
|---|---|---|---|---|
| Dev-kit | 1–3 | Firmware + site loop | $150–250 | 1–2 wk |
| EVT | 5–10 PCBs, 3–5 shells | Fit, Qi/RF window test | $400–900 | 2–3 wk |
| DVT | 20 | Real steel, battery life, pre-compliance | $2.5–4 k | 4–5 wk |
| **PVT/100 run** | 100 | Pilot & first customers | **$10–17.5 k** + NRE $1–2.5 k | 6–8 wk |

## 4. 100-run plan
1. Freeze Gerber/BOM/STEP after DVT sign-off; lock alternates for scarce parts (BME688, Qi IC).
2. PCBWay turnkey SMT for 100 + 5 % spare; request AOI + X-ray on QFN.
3. CNC 105 × (Part A + Part B) in two lots; incoming inspection (flatness, polish defects, thickness).
4. Final assembly: in-house or PCBWay: gasket + window install, screen/camera/battery, screws/laser-weld, seal test.
5. Per-unit: flash firmware, factory test (04 §7), laser-etch serial, pair-code card, QC photo, record in a CSV → upload to site's Device table.
6. Pack: foam tray, Qi pad or dock, quick-start card; battery shipped per UN38.3/IATA rules (<100 Wh, packed with equipment).

## 5. Compliance checklist
FCC Part 15B/C (module precert helps), CE RED + RoHS/REACH, UN38.3 + battery MSDS, Qi logo only after WPC registration (optional), camera privacy statement, CA Prop 65 as applicable, "Made in …" labeling honest to final assembly location (LOT brand line says Made in the USA — final assembly location must match claim).

## 6. Timeline (calendar, from approval)
Wk 0–5 dev-kit & server · Wk 5–10 EVT · Wk 10–16 DVT · Wk 16–24 100-run (incl. 6–8 wk build) · Wk 24–28 compliance & shipping.
