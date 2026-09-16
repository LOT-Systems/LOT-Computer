#!/usr/bin/env python3
"""Generate COSMO(R) Cube PDF manuals: Quick Start Guide + Hardware Reference Manual."""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, HRFlowable,
    PageBreak, Table, TableStyle
)

OUT_DIR = "/home/user/LOT-Computer/docs/hardware"

BLACK = colors.HexColor("#000000")
WHITE = colors.HexColor("#ffffff")
GRAY_DARK = colors.HexColor("#1a1a1a")
GRAY_MID = colors.HexColor("#444444")
GRAY_LINE = colors.HexColor("#cccccc")

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "COSMOTitle", parent=styles["Title"], fontName="Helvetica-Bold",
    fontSize=22, leading=26, textColor=BLACK, alignment=TA_CENTER,
    spaceAfter=4,
)
subtitle_style = ParagraphStyle(
    "COSMOSubtitle", parent=styles["Normal"], fontName="Helvetica",
    fontSize=11, leading=14, textColor=GRAY_MID, alignment=TA_CENTER,
    spaceAfter=18,
)
h1_style = ParagraphStyle(
    "COSMOH1", parent=styles["Heading1"], fontName="Helvetica-Bold",
    fontSize=15, leading=18, textColor=BLACK, spaceBefore=18, spaceAfter=8,
)
h2_style = ParagraphStyle(
    "COSMOH2", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=12, leading=15, textColor=GRAY_DARK, spaceBefore=12, spaceAfter=6,
)
body_style = ParagraphStyle(
    "COSMOBody", parent=styles["Normal"], fontName="Helvetica",
    fontSize=10, leading=14, textColor=BLACK, spaceAfter=6, alignment=TA_LEFT,
)
mono_style = ParagraphStyle(
    "COSMOMono", parent=styles["Normal"], fontName="Courier",
    fontSize=8.5, leading=11, textColor=GRAY_DARK,
)
footer_style = ParagraphStyle(
    "COSMOFooter", parent=styles["Normal"], fontName="Helvetica-Oblique",
    fontSize=8, leading=11, textColor=GRAY_MID, alignment=TA_CENTER,
)

def hr():
    return HRFlowable(width="100%", thickness=0.75, color=GRAY_LINE, spaceBefore=4, spaceAfter=10)

def table(rows, col_widths=None):
    t = Table(rows, colWidths=col_widths, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("BACKGROUND", (0, 0), (-1, 0), GRAY_DARK),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), 0.5, GRAY_LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, colors.HexColor("#f5f5f5")]),
    ]))
    return t


def build_quick_start():
    path = f"{OUT_DIR}/COSMO-CUBE-QUICK-START-v1.pdf"
    doc = SimpleDocTemplate(
        path, pagesize=letter,
        topMargin=0.85 * inch, bottomMargin=0.85 * inch,
        leftMargin=0.9 * inch, rightMargin=0.9 * inch,
        title="COSMO Cube Quick Start Guide", author="Vadim Marmeladov",
    )
    S = []
    S.append(Paragraph("COSMO&reg; Cube", title_style))
    S.append(Paragraph("Quick Start Guide &mdash; v1.1 &mdash; LOT Systems, Inc.", subtitle_style))
    S.append(hr())

    S.append(Paragraph("What it is", h1_style))
    S.append(Paragraph(
        "The COSMO&reg; Cube is a 40&times;40&times;5mm stainless steel companion "
        "device, physically connected to your LOT account at lot-systems.com. "
        "It shows autonomous notifications from the LOT AI (like &ldquo;Coffee time!&rdquo;), "
        "reads the weather around you, and logs a moment to your Log tab whenever "
        "you press the single Copy button.", body_style))

    S.append(Paragraph("In the box", h1_style))
    S.append(table([
        ["Item", "Notes"],
        ["1&times; COSMO&reg; Cube", "Mirror-polished back, satin front"],
        ["1&times; Qi wireless charging pad", "USB-C cable included"],
        ["1&times; Quick Start card", "This guide, condensed"],
        ["1&times; QR pairing code card", "Links to your LOT account"],
    ], col_widths=[2.3 * inch, 3.7 * inch]))

    S.append(Paragraph("1. Pair your Cube", h1_style))
    S.append(Paragraph(
        "Open lot-systems.com &rarr; My Devices &rarr; Add Device. LOT generates a "
        "pairing code. Scan the QR code shown on your Cube&rsquo;s screen (or enter "
        "the code via the companion app). Your Cube links to your account and "
        "starts polling for notifications.", body_style))

    S.append(Paragraph("2. Charge it", h1_style))
    S.append(Paragraph(
        "Place the LOT&reg; charging pad on your desk and connect it via USB-C. "
        "Set the Cube face-up (mirror side up) centered on the pad. The LED "
        "breathes white while charging and turns solid green at 100%. "
        "There is no port on the device &mdash; charging is wireless only, by design.",
        body_style))

    S.append(Paragraph("3. Read your notifications", h1_style))
    S.append(Paragraph(
        "The LOT AI sends short messages to your Cube&rsquo;s screen &mdash; things like "
        "&ldquo;Coffee time!&rdquo;, &ldquo;Meeting in 10 minutes&rdquo;, or &ldquo;2-minute breathing "
        "exercise.&rdquo; A message displays for up to 30 seconds, then the screen "
        "returns to the clock. Wave your hand over the Cube to dismiss a message early.",
        body_style))

    S.append(Paragraph("4. Press Copy to log a moment", h1_style))
    S.append(Paragraph(
        "Press the single button on the front face. The Cube captures the "
        "temperature, humidity, pressure, and light around you at that instant "
        "and sends it to your LOT Log tab, tagged <b>[COSMO&reg; Cube]</b>. The LED "
        "pulses green on success. That is the entire interaction &mdash; one button, "
        "one deliberate gesture, one entry.", body_style))

    S.append(Paragraph("Care", h1_style))
    S.append(Paragraph(
        "IP54 splash resistant &mdash; not for submersion. Operating range 0&deg;C to "
        "+45&deg;C. Clean the mirror face with a soft cloth only; abrasives will mar "
        "the #8 polish.", body_style))

    S.append(Spacer(1, 18))
    S.append(hr())
    S.append(Paragraph(
        "COSMO&reg; CIA &mdash; LOT Systems, Inc. &mdash; Inventor: Vadim Marmeladov &mdash; "
        "Made in the USA. See COSMO-CUBE-HARDWARE-MANUAL-v1.pdf for the full "
        "engineering reference.", footer_style))

    doc.build(S)
    return path


def build_hardware_manual():
    path = f"{OUT_DIR}/COSMO-CUBE-HARDWARE-MANUAL-v1.pdf"
    doc = SimpleDocTemplate(
        path, pagesize=letter,
        topMargin=0.75 * inch, bottomMargin=0.75 * inch,
        leftMargin=0.8 * inch, rightMargin=0.8 * inch,
        title="COSMO Cube Hardware Reference Manual", author="Vadim Marmeladov",
    )
    S = []
    S.append(Paragraph("COSMO&reg; Cube", title_style))
    S.append(Paragraph(
        "Hardware Reference Manual &mdash; v1.1 &mdash; Engineering / Internal &mdash; "
        "LOT Systems, Inc.", subtitle_style))
    S.append(hr())

    S.append(Paragraph("1. Overview", h1_style))
    S.append(Paragraph(
        "The COSMO&reg; Cube is a personal ambient intelligence device connected "
        "to lot-systems.com. It is a hardware API consumer: it polls "
        "GET /api/hardware/notifications and posts to POST /api/hardware/log. "
        "Full specification: COSMO-DEVICE-SPEC-v1.md. Full BOM with supplier "
        "links: COSMO-BOM-v1.md. Firmware: COSMO-FIRMWARE-v1.md. API: "
        "COSMO-SOFTWARE-API-v1.md. Manufacturing: COSMO-MANUFACTURING-v1.md. "
        "Charger: COSMO-CHARGER-SPEC-v1.md.", body_style))

    S.append(Paragraph("2. Physical Specification", h1_style))
    S.append(table([
        ["Parameter", "Value"],
        ["Dimensions", "40mm x 40mm x 5mm"],
        ["Weight", "~28g"],
        ["Body material", "316L Stainless Steel, CNC machined, 2 parts"],
        ["Side A (back)", "Mirror-polished #8 finish, LOT(R) engraved"],
        ["Side B (front)", "Satin finish - display, camera, button"],
        ["Water resistance", "IP54"],
        ["Operating temp", "0C to +45C"],
    ], col_widths=[2.3 * inch, 4.2 * inch]))

    S.append(Paragraph("3. Electronics", h1_style))
    S.append(table([
        ["Subsystem", "Part", "Interface"],
        ["MCU", "ESP32-S3-MINI-1U (dual-core, WiFi+BLE5)", "-"],
        ["Display", "SSD1327 OLED 1.0\" 128x128, 16-gray", "SPI"],
        ["Camera", "Himax HM01B0, 320x320, 1.1mW", "DVP"],
        ["Weather", "Bosch BME280 (temp/humidity/pressure)", "I2C"],
        ["IMU (AI-grade)", "TDK ICM-42688-P, 6-axis", "SPI"],
        ["Light + gesture", "Broadcom APDS-9960", "I2C"],
        ["Wireless charge Rx", "TI BQ51013B, Qi 5W, 30mm coil", "-"],
        ["PMIC", "TI BQ25892", "I2C"],
        ["Battery", "Custom LiPo 280mAh, 35x35x2.5mm", "JST-PH"],
    ], col_widths=[1.7 * inch, 3.6 * inch, 1.1 * inch]))

    S.append(Paragraph("4. LOT Platform Integration", h1_style))
    S.append(Paragraph(
        "The Copy button captures a sensor snapshot (temperature, humidity, "
        "pressure, light, orientation), optionally a camera frame, and POSTs it "
        "to lot-systems.com/api/hardware/log. The entry appears in the Log tab "
        "tagged [COSMO&reg; Cube]. The device polls "
        "lot-systems.com/api/hardware/notifications every 60 seconds; the LOT AI "
        "(QI-46 Engine) pushes short messages such as &ldquo;Coffee time!&rdquo; that render "
        "on the OLED for up to 30 seconds. All calls use TLS 1.3 with a pinned "
        "certificate and a per-device API key stored in encrypted NVS.",
        body_style))

    S.append(Paragraph("5. Power Budget", h1_style))
    S.append(table([
        ["Condition", "Current", "Life"],
        ["Active WiFi, display on", "~180mA", "~1.5h"],
        ["WiFi poll 60s, display on", "~45mA", "~6h"],
        ["Deep sleep, wake every 60s", "~2mA", "~5.8 days"],
        ["Charging (Qi 5W)", "-", "~2.5h full"],
    ], col_widths=[2.6 * inch, 1.6 * inch, 2.2 * inch]))

    S.append(Paragraph("6. Bill of Materials Summary (100-unit run)", h1_style))
    S.append(table([
        ["Category", "Est. 100-unit total"],
        ["Electronics (MCU, display, camera, sensors, power)", "~$3,565"],
        ["PCB fabrication + SMT assembly (PCBWay)", "~$1,650"],
        ["SS enclosure, 2-part CNC (PCBWay)", "~$3,800"],
        ["Wireless charger (Tx pad)", "~$900"],
        ["Packaging", "~$400"],
        ["Subtotal", "~$10,750"],
        ["Contingency (15%)", "~$1,613"],
        ["Grand total", "~$12,363"],
        ["Target retail price", "$349/unit"],
    ], col_widths=[4.6 * inch, 1.9 * inch]))
    S.append(Paragraph(
        "Full line-item BOM with manufacturer part numbers, suppliers, and buy "
        "links: COSMO-BOM-v1.md &sect;1&ndash;12.", body_style))

    S.append(Paragraph("7. Manufacturing Path", h1_style))
    S.append(Paragraph(
        "PCBWay is the primary manufacturer for all three streams: 4-layer PCB "
        "fabrication + turnkey SMT assembly, and CNC machining of the 316L "
        "stainless steel back plate (mirror #8) and front bezel (satin, with "
        "display/camera/button/mesh apertures). Target build: 10-week schedule, "
        "10-unit prototype before the 100-unit run. Full QA checklist (14 items "
        "per unit): COSMO-MANUFACTURING-v1.md &sect;3.3.", body_style))

    S.append(Paragraph("8. Roadmap", h1_style))
    S.append(table([
        ["Phase", "Status"],
        ["Phase 0 - Design", "Complete (this document set)"],
        ["Phase 1 - Engineering (schematic, PCB layout, CAD, backend routes)", "Not started"],
        ["Phase 2 - Prototype (10 units)", "Not started"],
        ["Phase 3 - Production (100 units)", "Not started"],
        ["Phase 4 - Launch (My Devices page, OTA, FCC/CE, retail)", "Not started"],
    ], col_widths=[4.6 * inch, 1.9 * inch]))

    S.append(Spacer(1, 16))
    S.append(hr())
    S.append(Paragraph(
        "COSMO&reg; CIA &mdash; LOT Systems, Inc. &mdash; Inventor: Vadim Marmeladov &mdash; "
        "Originally specified 2026-06-12, landed on master 2026-09-16. "
        "See docs/benchmark/LOT-SR-20260916-01.md for the session record.",
        footer_style))

    doc.build(S)
    return path


if __name__ == "__main__":
    p1 = build_quick_start()
    p2 = build_hardware_manual()
    print(f"Wrote {p1}")
    print(f"Wrote {p2}")
