# 09 · Roadmap and Risk Analysis

## 1. Timeline (from 2026-11-18)

```
2026  Nov ███ S1 PLAN (this session) ─ decisions D1–D5
      Dec ████████ S2 PROTO-0: dev kits + connector on staging + firmware compiles
2027  Jan ████████ S3 EVT design: schematic, 4L layout, STEP, PCBWay order
      Feb ████████ S3 EVT build (10) → bench tests: RF, Qi, power
      Mar ████████ S4 DVT design changes + 5.0 mm decision
      Apr ████████ S4 DVT build (20) → reliability + pre-scan
      May ████████ S5 Certification + battery PO + firmware 1.0
      Jun ████████ S6 PVT/production (110) at PCBWay
      Jul ████████ S6 End-of-line test, assembly, packaging, PDF manuals final
      Aug ███      SHIP 100 units
```

| Phase | Exit criteria | Owner | Est. spend |
|---|---|---|---|
| S1 Plan | Docs, BOM, decisions listed | Claude + Vadik | $0 |
| S2 Proto-0 | COPY from a dev kit appears in the Log tab on staging; nudge shown on the Sharp LCD; ≥ 14-day battery model | Claude + Vadik | $350 |
| S3 EVT | 8/10 boards fully work; Qi through zirconia works | EE + ME | $4–5k |
| S4 DVT | Reliability passes; pre-scan passes; thickness frozen | EE + ME + lab | $4–6k |
| S5 Cert | SDoC + CE reports; UN38.3 docs | Lab | $4–15k |
| S6 Production | 100 units pass end-of-line test | PCBWay + assembly | $16–24k |

## 2. Risk analysis

| ID | Risk | Likelihood | Impact | What reduces it | Trigger to escalate |
|---|---|---|---|---|---|
| R1 | Steel blocks Qi | **Certain** with a solid back | High | D1 option B (zirconia) + dock | D1 not decided by Dec 5 |
| R2 | Steel weakens Wi-Fi | High | High | Antenna under the sapphire strip; isolated seam acting as a slot antenna; EVT RSSI test | > 8 dB loss at EVT |
| R3 | 5.0 mm Z-stack has 0 mm spare | High | Medium | EVT at 6.0 mm; thinner 0.4 mm PCB; rigid-flex | Battery < 90 mAh |
| R4 | Custom LiPo MOQ / lead time | Medium | High | 200-pc pilot RFQ to 3 vendors on EVT day 1 | No quote within 2 weeks |
| R5 | Camera module EOL (OVM7692) | Medium | Medium | Primary HM0360; keep the PCB footprint generic | Distributor shows NRND |
| R6 | BME688 reads high from radio/battery heat | Medium | Low | Thermal slots, 60 s blanking after Wi-Fi, BSEC heat compensation | > 1.5 °C error at EVT |
| R7 | Pocket scratches on the mirror back | High | Low (cosmetic) | Anti-fingerprint coat; sell it as "patina"; soft pouch | — |
| R8 | Nickel skin sensitivity | Low | Medium | 316L + EN 1811 test | Test fail |
| R9 | Server load / abuse of the device API | Low | Medium | Per-device rate limit, token hash, separate route prefix | — |
| R10 | Notification fatigue | Medium | Brand | Max 6 nudges/day, quiet hours, user setting | User feedback |

## 3. Where the roadmap is weakest

1. **The real blockers are physical (R1, R2, R3), not software.** Spend early money on a $60 coupon test of steel vs. zirconia vs. RF in December, not on PCB layout.
2. **Software risk is low.** The server is already Fastify + Sequelize with a Log model, AI engines and a scheduler, so the connector is about 300 lines. Prioritise S2 because it de-risks the experience before money is spent on tooling.
3. **Certification cost depends on the module.** Chip-down (smaller) would add $10–15k and 6 weeks. Keep the module for the 100-unit run; consider chip-down for v2.
4. **"Made in the USA"** applies only if final assembly happens in the US. PCBWay box-build makes it "Assembled in China / Designed in USA". Decide before printing the box.
5. **Battery life claims:** publish "about 2 weeks (Calm)" only after the S2 PPK2 measurement confirms the model in doc 04.
