# LOT PAGER — Mechanical Spec v0.1 (DRAFT)

Envelope: **40 × 40 × 5 mm**, two-part 316L stainless shell (top + back), laser-welded or screwed (4× M1).

| Layer | Thickness |
|---|---|
| Back shell (polished mirror) | 0.8 |
| Qi coil + ferrite | 0.5 |
| LiPo | 2.5 |
| PCB + components | 0.8 + ~0.8 (top side) |
| Screen module | ~1.2 |
| Top shell + window | 0.8 |
Stacked sum exceeds 5 mm if components stack directly. Screen, camera and cell must sit **side by side**, not stacked, on the 40×40 face. Realistic: 5.0–6.5 mm on EVT.

## Critical risks (decide before PCB layout)
1. **Qi through stainless does not work** (eddy currents). Options: (a) non-metal inlay disc (sapphire/ceramic/glass) in back — recommended, keeps mirror polish on ~70% of face; (b) coil behind the top-face window; (c) pogo/magnetic contacts instead of Qi. Decision needed from Vadik.
2. **Camera height:** stock OV2640 modules are 7–9 mm. Need bare 2–3 mm flex sensor. Fixed-focus, 2–5 MP.
3. **Antenna:** ESP32 antenna cannot sit inside full metal. Needs non-metal window or slot; RF must be tested on EVT. Use ESP32-S3-MINI-1U + u.FL→FPC antenna at a window edge.
4. **Battery certification** (UN38.3) for shipping 100 units.
5. Front face 40×40: 23 mm screen + 8 mm camera + button leaves ~tight; button as side-mounted plunger or capacitive spot.

Finish: back = #8 mirror; top = brushed/bead-blast for contrast. Laser-engrave LOT® wordmark, serial, "Made in the USA" claim only if final assembly is US (PCBWay is China: don't print it without a US assembly step).
