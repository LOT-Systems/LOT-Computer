# LOT-FM-001 / BASIC — REQUEST FOR QUOTE

Issued by LOT Systems Corporation. Quote landed unit cost (USD) delivered to a US fulfillment dock,
per ration unit as specified. State MOQ, lead time, quote validity (days) and country of origin.
Unit volume tiers assume 100 / 500 / 1000 operators over 12 issues.

| LINE | NOMENCLATURE | SPEC | CADENCE | UNITS/OPERATOR/YR | UNITS/YR @100 / 500 / 1000 |
|------|--------------|------|---------|-------------------|-----------------------------|
| 01 | TOOTHPASTE | 100 ML | MONTHLY | 12 | 1200 / 6000 / 12000 |
| 02 | TOOTHBRUSH | 1 EA | EVERY 3 MO | 4 | 400 / 2000 / 4000 |
| 03 | FLOSS, WAXED | 2 CT | EVERY 2 MO | 6 | 600 / 3000 / 6000 |
| 04 | SOAP, BAR | 1 EA | MONTHLY | 12 | 1200 / 6000 / 12000 |
| 05 | BODY WASH | 250 ML | EVERY 2 MO | 6 | 600 / 3000 / 6000 |
| 06 | SHAMPOO | 250 ML | EVERY 2 MO | 6 | 600 / 3000 / 6000 |
| 07 | DEODORANT | 1 EA | MONTHLY | 12 | 1200 / 6000 / 12000 |
| 08 | RAZOR CARTRIDGES | 4 PK | EVERY 2 MO | 6 | 600 / 3000 / 6000 |
| 09 | HAND SOAP, REFILL | 500 ML | EVERY 2 MO | 6 | 600 / 3000 / 6000 |
| 10 | LIP BALM | 1 EA | EVERY 3 MO | 4 | 400 / 2000 / 4000 |
| 11 | SUNSCREEN, SPF 30 | 100 ML | EVERY 6 MO | 2 | 200 / 1000 / 2000 |
| 12 | UNDERWEAR | 2 PK | EVERY 3 MO | 4 | 400 / 2000 / 4000 |
| 13 | SOCKS | 3 PK | EVERY 3 MO | 4 | 400 / 2000 / 4000 |
| 14 | T-SHIRT, PLAIN | 1 EA | EVERY 6 MO | 2 | 200 / 1000 / 2000 |
| 15 | TOWEL, FACE | 1 EA | EVERY 6 MO | 2 | 200 / 1000 / 2000 |
| 16 | TISSUE, POCKET | 6 PK | MONTHLY | 12 | 1200 / 6000 / 12000 |
| 17 | SWABS, COTTON | 100 CT | EVERY 3 MO | 4 | 400 / 2000 / 4000 |
| 18 | NAIL CLIPPER | 1 EA | ANNUAL | 1 | 100 / 500 / 1000 |
| 19 | COMB | 1 EA | ANNUAL | 1 | 100 / 500 / 1000 |
| 20 | LAUNDRY SHEETS | 30 CT | MONTHLY | 12 | 1200 / 6000 / 12000 |
| 21 | FIELD BARS, SHELF-STABLE | 6 CT | MONTHLY | 12 | 1200 / 6000 / 12000 |
| 22 | ELECTROLYTE STICKS | 10 CT | MONTHLY | 12 | 1200 / 6000 / 12000 |
| 23 | MANIFEST CARD, PRINTED | 1 EA | MONTHLY | 12 | 1200 / 6000 / 12000 |

Return each answer as: line, supplier, unit USD, MOQ, lead time days, valid days, quote date.
Entry point for answers: CSV in this row order -> `npm run basics:quotes -- sheet.csv [--write]`. Gate: `npm run basics:envelope`.
