# LOT COMPUTER — Components Buying List (BOM)

```
DOCUMENT   LOT-COMPUTER / 02 BOM          REV A   2026-10-11
S-2        VADIK MARMELADOV
LINK COLUMN   VERIFIED = URL returned by a web search this session
              UNVERIFIED = part named, product page not confirmed; search the MPN
PRICES        ESTIMATE only. No live quotes were obtained.
```

## PROTOTYPE KIT (buy first — P1, ~2–5 units)

| Item | Why | Link | Status |
|---|---|---|---|
| DFRobot DFR1221 — ESP32-S3 1.85" round touch display, Qi receive, mic, 16 MB flash / 8 MB PSRAM | Firmware + API bring-up with Qi built in. Round, not square: firmware only | [Core Electronics](https://core-electronics.com.au/dfrobot-esp32-s3-round-touchscreen-iot-dev-board-ai-voice-qi-wireless-charging.html) · [DFRobot](https://www.dfrobot.com/product-2964.html) | VERIFIED |
| DFRobot FireBeetle 2 ESP32-S3 + OV2640 camera (DFR0975) | Camera bring-up | [DigiKey](https://www.digikey.com/en/products/detail/dfrobot/DFR0975/20500154) | VERIFIED |
| BME688 breakout (Adafruit/SparkFun/Pimoroni) | Sensor + AI-gas bring-up | search "BME688 breakout" | UNVERIFIED |
| SHT45 breakout | Accurate T/RH | search "SHT45 breakout" | UNVERIFIED |
| Qi charging pad, 5 W | Charger (req. 12) | any WPC-certified 5 W pad | UNVERIFIED |

The DFR1221 listing does not mention a camera port; do not expect to attach one.

## A. COMPUTE

| Part | MPN | Qty | Est. $ | Link |
|---|---|---|---|---|
| Wi-Fi/BLE SoC module, 16 MB flash, 8 MB PSRAM (v1) | ESP32-S3-WROOM-1-N16R8 | 1 | 4–6 | [DigiKey](https://www.digikey.com/en/products/detail/espressif-systems/ESP32-S3-WROOM-1-N16R8/16162642) VERIFIED (8-wk lead; one regional page 0 stock) |
| Bare SoC for 5 mm v2 | ESP32-S3FN8 / R8 variants | 1 | 3–5 | UNVERIFIED |

ESP32-S3 has an 8–16-bit DVP camera interface (confirmed in a listing).

## B. DISPLAY & INPUT

| Part | Spec | Est. $ | Link |
|---|---|---|---|
| Small square colour LCD/OLED ~1.3" with cover glass | fits inside 40×40 mm face, SPI | 8–15 | UNVERIFIED — choose after D-2 |
| Tactile switch, low-profile (Copy) | ≥ 0.5 mm travel | 0.3 | UNVERIFIED |
| Status LED (camera-active, hard-wired to camera power) | 0402 red | 0.05 | — |

## C. SENSORS

| Part | MPN | Role | Est. $ | Link |
|---|---|---|---|---|
| Bosch gas+T/RH/P with trainable AI scanner (req. 14, 15) | BME688 | weather + air quality | 8–10 | [DigiKey](https://azcus.digikey.com/en/products/detail/bosch-sensortec/BME688/13681261) · [datasheet (SparkFun mirror, rev 1.0)](https://cdn.sparkfun.com/assets/0/a/b/6/7/BME688_Datasheet.pdf) VERIFIED |
| Sensirion T/RH | SHT45 | precise T/RH, away from heat | 2–3 | UNVERIFIED |
| Ambient light | VEML7700 | auto-brightness | 1–2 | UNVERIFIED |

Heat note: SoC and charger warm the board; place SHT45/BME688 at an edge with a
thermal slot and compensate in firmware.

## D. CAMERA

| Part | Note | Est. $ | Link |
|---|---|---|---|
| OV2640 (2 MP) v1 | cheapest; seen on DFR0975 | 3–6 | VERIFIED via DFR0975 |
| OV5640 (5 MP) option | 8-bit DVP works on ESP32-S3 | 5–10 | UNVERIFIED |
| Sub-3 mm micro camera for 5 mm v2 | candidates only | TBD | UNVERIFIED |

## E. POWER & CHARGING

| Part | MPN | Note | Est. $ | Link |
|---|---|---|---|---|
| Qi receiver coil | Würth 760308101208 (13 µH, 0.8 A, ⌀10 mm × 1.7 mm per listing) | Verify match to the Rx IC and that power meets need | 1–3 | [DigiKey](https://azcus.digikey.com/en/products/detail/w%C3%BCrth-elektronik/760308101208/5050815) VERIFIED |
| Qi receiver IC | e.g. TI BQ51013B | NOT verified; check coil compatibility | 2–3 | UNVERIFIED |
| Li-ion charger + fuel gauge | e.g. BQ25895 / MAX17048 | NOT verified | 2–4 | UNVERIFIED |
| Thin LiPo 3.7 V, 100–1000 mAh | ≤2 mm (v2) / ≤4 mm (v1) with protection circuit | 3–6 | UNVERIFIED |
| Ferrite shield sheet | behind coil | 0.5 | UNVERIFIED |
| Qi charging pad (bundled with each unit) | 5 W, WPC | 6–10 | UNVERIFIED |

## F. PCBWAY SERVICES & BODY (req. 1, 3, 17)

| Service | Spec | Est. $ per unit @100 | Link |
|---|---|---|---|
| PCB fabrication + SMT assembly | 4-layer, ~38×38 mm, ENIG | 15–30 | [pcbway.com](https://www.pcbway.com/) — quote pages not verified |
| CNC machining, 316L stainless, 2 parts (back plate, front bezel) | ±0.05 mm achievable per third-party guide; walls ≥1.0 mm typical | 40–110 pair | [PCBWay CNC community examples in 316L](https://www.pcbway.com/project/share/CNC_Machining_2ede75bd.html) — reviews only, not a quote |
| Mirror polish (back plate) | Ra target ≤0.05 µm | incl./add | **Ask PCBWay**; one reviewer reported poor bead-blast finish |
| Non-metal Qi/antenna inlay | zirconia ceramic or glass, ~16 mm | 5–15 | UNVERIFIED |
| Cover glass | 0.5–0.7 mm, AR coat | 2–5 | UNVERIFIED |
| Fasteners / adhesive / gasket | M1 screws or laser weld | 1–2 | — |

PCBWay constraint: a steel wall of 1.0 mm is typical minimum; the plan's 0.4–0.6
mm walls are thinner than the cited guidance and must be confirmed with them
(another reason 5 mm is a v2 gate).

## TOTALS (ESTIMATE)

```
                      LOW      HIGH
Electronics + PCB     $45      $85
Steel body + polish   $45      $110
Charger pad           $6       $10
Glass / inlay / misc  $8       $20
Per unit              ~$120    ~$220     (rounded; excludes labour, shipping, duty)
100 units             $12k     $22k
NRE (prototypes, fixtures, cert)   $15k–$35k
```

## PROCUREMENT ORDER

1. Prototype kit this week (long lead times: BME688, ESP32-S3 modules 8–12 wk).
2. PCBWay quote requests (qty 5 and 100) once D-1/D-2 are signed.
3. Samples of the inlay and cover glass during P3.
