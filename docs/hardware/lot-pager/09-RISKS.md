# LOT® PAGER — Risks & Open Decisions

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| D1 | 5 mm height infeasible with camera + battery + Qi | **Certain** | High | Accept 9 mm v0; slim v1 |
| R1 | Qi blocked by steel | High | High | Non-metal charging window (03 §5) |
| R2 | Wi‑Fi/BLE attenuated by steel | High | High | External antenna on non-metal strip |
| R3 | Mirror polish yield/cost | Med | Med | Order +20 % back plates |
| R4 | Li‑Po in sealed steel (thermal, transport) | Med | High | Protection IC, thermistor, UN38.3 vendor cell |
| R5 | Camera privacy / trust | Med | High | Trigger-only capture, LED, Log entry, user opt-in |
| R6 | Auth model: site has no device tokens | Certain | Med | 06 §2 |
| R7 | Part shortages (BQ51013B, BME688) | Med | Med | Consign, alternates: CPS4019, BME280 |
| R8 | Regulatory for sale | Med | Med | Pre-scan; keep pilot internal |
| R9 | "AI notifications" feel spammy | Med | Med | Daily cap, silence default |
| R10 | Prices in 02-BOM are unverified | High | Low | Re-quote at PCBWay/DigiKey before PO |

## Not verified in this session
- brand.lot-systems.com, lot-systems.com/about and institute.lot-systems.com/cqgs.html were **not reachable** from the sandbox (DNS failure). Brand rules (colours, type) were not applied to PDFs; brand context taken from repo docs (docs/corporate, About.tsx). Re-run with network to apply the brand kit.
- Vendor prices, lead times, part dimensions (esp. camera height, coil thickness) are from memory.
