# LOT·01 — 100-Unit Production Run (PVT)

## Lot plan
| Item | Qty | Why |
|---|---|---|
| PCBA | 115 | 100 + 10 % yield + 5 golden/RMA |
| Part A / Part B / key | 115 sets | polishing rejects run 5–10 % |
| Cover glass | 130 | most fragile part |
| Batteries | 115 (or custom-cell MOQ) | |
| Qi pads | 105 | |
| Boxes / cards | 110 | |

Serials: `LOT01-0001 … LOT01-0100`, written to NVS and laser-etched on the inside of Part A. The outer mirror face can carry `001/100` if Vadik wants it.

## Flow
1. **PCBWay:** PCB + turnkey SMT + X-ray + AOI → flashed with test firmware → **ICT/functional fixture** (pogo bed): power rails, I²C IDs, LCD pattern, camera ID, haptic, key, Wi-Fi RSSI in a shield box, Qi coupon charge current.
2. **Kitting:** PCBA + coil + LCD + camera + battery.
3. **Final assembly** (in-house or PCBWay box-build): glass → bezel (adhesive, 2 h cure) → LCD + coil stack → PCBA → battery → Part A → 4 screws → 24 h battery soak.
4. **Final test:** pair against **staging** with a factory account, receive "Hello from LOT", press Copy, confirm the Log row exists, unpair, flash production firmware, set the serial.
5. **Cosmetic QC:** inspect the mirror face under a 5000 K light panel at 30 cm. Reject any scratch longer than 1 mm or any visible orange-peel. Apply peel film.
6. **Pack:** device in a foam pocket face-up (mirror up, film on), pad, cable, card, sleeve.

## Quality targets
| Metric | Target |
|---|---|
| PCBA first-pass yield | ≥ 95 % |
| Final FPY | ≥ 90 % |
| Mirror cosmetic yield | ≥ 90 % |
| Battery life (15-min poll) | ≥ 12 days |
| Copy → Log latency | ≤ 3 s at P95 |

## Shipping
UN3481 (Li-ion contained in equipment), PI 967 Section II, with the UN38.3 test summary on file.

## Paperwork pack (per lot)
Test logs (JSON per serial) · CoC from PCBWay · UN38.3 summary · FCC/CE DoC · firmware hash · this checklist, signed.
