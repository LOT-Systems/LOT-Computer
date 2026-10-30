# 02 — BOM & Sourcing

**Caveat:** this session could not browse supplier sites (network limited). Links go to supplier/search pages; part numbers come from knowledge and **must be verified** (stock, footprint, datasheet) before ordering. Prices are rough 2026 estimates at ~100-unit volume.

## 1. Manufacturing
| Item | Source | Link |
|------|--------|------|
| PCB fab + SMT assembly | PCBWay | https://www.pcbway.com/ |
| CNC 316L body (2 parts) + polish | PCBWay CNC | https://www.pcbway.com/cnc-machining-quote.html |
| Components (consigned/turnkey) | LCSC / DigiKey / Mouser | https://www.lcsc.com/ · https://www.digikey.com/ · https://www.mouser.com/ |

## 2. Parts
| Block | Candidate part | Why | Est. $/unit |
|-------|----------------|-----|-------------|
| MCU + Wi-Fi/BLE | Espressif ESP32-S3-MINI-1-N8 (or -N4R2) — https://www.espressif.com/en/products/modules | Camera interface, USB, AI vector instr., small | 3.5 |
| Display | 0.96″ 128×64 OLED (SSD1306/SSD1315, I²C) bare panel on FPC | Thin, fits face with camera; text pager | 2.5 |
| Camera | OV2640 or GC2145 FPC module (~8×8 mm) | Cheap, ESP32 supported (esp32-camera) | 3.0 |
| Weather/air | Bosch BME688 — https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme688/ | T/RH/P + gas; BSEC AI classification | 8.0 |
| UV/ambient light | Lite-On LTR-390UV-01 | UV index for Weather widget | 1.0 |
| Button | Low-profile tact 3×3×1.5 mm, or capacitive pad under steel | "Copy" | 0.2 |
| Haptic | 6 mm coin LRA or 4 mm piezo/buzzer (optional) | Pager alert, silent | 1.0 |
| Qi RX | TI BQ51013B (or similar 5 V RX) + RX coil ~Ø20 mm w/ ferrite — https://www.ti.com/product/BQ51013B | Wireless charge | 2.5 + 1.5 |
| Battery charger | TI BQ25185 or MCP73831 | LiPo charge | 1.0 |
| Battery | LiPo pouch ~502030, 3.7 V, 200–250 mAh w/ PCM (UN38.3 cert required) | Thickness ~5 mm: see R3 | 3.0 |
| Fuel gauge (opt.) | MAX17048 | % battery on device | 1.2 |
| 3.3 V reg | e.g. TLV75733P | Rails | 0.3 |
| Antenna | Module integral PCB antenna + dielectric window | RF | – |
| USB-C service port | 16-pin mid-mount | Flash/debug (may be pogo pads instead) | 0.5 |
| Passives/ESD/connectors | – | – | 2.0 |
| PCB 4-layer ≈36×36 | PCBWay | – | 3.0 |
| SMT assembly | PCBWay | – | 6.0 |
| Body: 2× 316L CNC + mirror polish | PCBWay CNC | Biggest cost driver | 18–30 |
| Seam gasket / window (PEEK/ceramic/glass) | PCBWay CNC / glass vendor | RF + Qi | 3–5 |
| Packaging, QC, test jig share | – | – | 4 |

**Estimated unit cost @100: ≈ $65–90** (see bom.csv). One-off NRE ≈ $1,500–4,000 (stencil, jigs, EVT/DVT rounds, certification pre-scan). Radio/Qi certification (FCC/CE) not included: budget $5–15 k if sold; use a pre-certified module to reduce it.

## 3. Charger (accessory)
Off-the-shelf 5 W Qi TX pad for prototypes (any reputable brand); custom puck with machined recess for production later. Verify coil alignment and that the TX can power through the selected window.

## 4. 100-unit run model
| Line | Estimate |
|------|----------|
| 100 × unit cost ($65–90) | $6,500–9,000 |
| Pilot overbuild (+20 % spare) | +$1,300–1,800 |
| NRE & prototypes | $1,500–4,000 |
| 100 chargers ($6–10) | $600–1,000 |
| Freight/duty/QC | $500–1,000 |
| **Total** | **≈ $10k–17k** (excl. certification) |

## 5. Existing repo spend
`LOT_Corporate_Expense_AI_Subscription_2026-2027.pdf` is the only budget doc in the repo; no hardware budget line exists yet.
