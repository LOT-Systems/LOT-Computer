<!--
  LOT SYSTEMS CORPORATION
  Vadim Marmeladov — CEO, Owner LOT®
  Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
  LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
  Made in the USA | brand.lot-systems.com
-->

# LOT Pager — Roadmap & Analysis

**Document:** LOT-HW-01 / ROADMAP · **Rev:** A (2026-11-13)

## 1. Phases

| Phase | Weeks | Output | Gate to pass | Est. spend |
|-------|------:|--------|--------------|-----------:|
| **S0 Concept** (this session) | 0 | Plan, BOM, specs, PDFs | Decisions D-1…D-4 made | $0 |
| **S1 Breadboard** | 1–3 | Stage 0 kit wired; device-sim + `/api/device/*` on staging; Copy → Log tab works end to end | Loop works; Qi-through-steel and RF tests measured | ~$170 + parts shipping |
| **S2 EVT** (5 units) | 4–10 | Schematic, 4-layer HDI layout, PCBWay PCBA ×5, CNC enclosure ×5 at 6.0 mm | All functions work in the steel body; battery ≥ 7 days | ~$2,500 |
| **S3 DVT** (15 units) | 11–17 | Rev B PCB, antenna tuned, 5.0 mm attempt, glass + print, firmware feature-complete, OTA | Drop, IP54, thermal, 2-week field test with 10 users | ~$3,500 |
| **S4 Certification** | 14–22 (overlaps) | FCC Part 15 + CE/RED (or modular path), battery UN38.3 report from cell vendor | Test reports + FCC ID | $12–20 k (or ~$3 k modular) |
| **S5 PVT / Run of 100** | 20–26 | PCBWay turnkey 100 + CNC 100 + assembly + test jig | Yield ≥ 95 %, all units pass self-test | ~$14,800 |
| **S6 Ship** | 26–28 | Boxed units, PDF manuals, Settings → Devices live | | — |

Total calendar: **~6–7 months** from today to 100 shipped units (mid-2027), if decisions are made in week 1.

## 2. Decisions needed from the Inventor

| ID | Decision | Options | Recommendation |
|----|----------|---------|----------------|
| **D-1** | Where does wireless charging go? | A: face-down through glass · B: ceramic disc in back · C: pogo cradle | **A** — keeps the back pure polished steel |
| **D-2** | Thickness | 6.0 mm (80 mAh, ~3 weeks) · 5.0 mm (45 mAh, ~2 weeks, custom cell) | Build EVT at 6.0, decide 5.0 after EVT |
| **D-3** | Radio certification path | Own FCC/CE cert with PICO-1 SiP (thin) · pre-certified MINI-1 module (thicker, cheaper cert) | PICO-1 if 5 mm matters; MINI-1 if budget matters |
| **D-4** | Camera purpose | Photo-to-Log only · on-device AI (e.g. "is it daylight / is someone here") | Photo-to-Log for v1; AI vision as OTA later |

## 3. Risk register

| # | Risk | L | I | Mitigation |
|---|------|---|---|------------|
| R1 | Steel blocks Qi / FOD stops charging | H | H | D-1 option A; test in S1 |
| R2 | Steel detunes 2.4 GHz antenna, poor range | H | M | Antenna corner under glass, isolated bezel, VNA tuning in S3 |
| R3 | 5 mm not reachable | M | M | Ship at 6.0 mm if needed — still very thin |
| R4 | Thin LiPo MOQ (often 500–1000) | M | M | Ask PCBWay/cell vendor for 200-unit sample run; pay MOQ premium |
| R5 | BME688 reads self-heat, not room | H | L | Vent + isolated chamber + BSEC compensation; label as "near-device" |
| R6 | Certification cost exceeds unit budget | M | H | D-3; also check FCC rules for a limited first batch with a lab |
| R7 | Mirror polish scratches during assembly | M | L | Protective film from CNC until boxing |
| R8 | Part shortages (Sharp LCD, HM0360) | M | M | Alternatives in BOM §E; buy 120 sets up front |
| R9 | Notice spam annoys users | M | M | Max 6/day, quiet hours, "less often" setting |

## 4. Why this design (short analysis)

- **ESP32-S3** is the cheapest chip with Wi-Fi + BLE + camera input + enough RAM for TLS and JPEG; huge community; PCBWay assembles it daily.
- **Memory LCD** is the only screen that is silver-looking, readable in sunlight, and costs almost no power to keep a message visible all day — ideal for a pager.
- **Bosch BME688 + BHI260AP** are the "AI-grade" off-the-shelf sensors: both run learned models on the sensor itself, so the main chip can sleep.
- **Polling, not push**: predictable battery life; push can come later over the same API.
- **Single vendor (PCBWay)** for PCB, assembly, CNC and polish reduces shipping and coordination for a 100-unit run.
