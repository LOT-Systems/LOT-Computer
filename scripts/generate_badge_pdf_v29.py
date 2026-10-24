#!/usr/bin/env python3
"""Generate LOT Badges & Achievements Master Codex v29 PDF — The Bio-Terminal"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER
import os

OUTPUT_PATH = "/home/user/LOT-Computer/docs/badges/LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v29.pdf"
MD_PATH = "/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v29.md"

BLACK      = colors.HexColor("#000000")
WHITE      = colors.HexColor("#ffffff")
GRAY_DARK  = colors.HexColor("#1a1a1a")
GRAY_MID   = colors.HexColor("#333333")
GRAY_LIGHT = colors.HexColor("#888888")
ACCENT     = colors.HexColor("#cccccc")
GOLD       = colors.HexColor("#bb8800")
CYAN       = colors.HexColor("#336688")
GREEN      = colors.HexColor("#336644")
BIO        = colors.HexColor("#1a3a1a")   # deep biology green — Bio-Terminal theme


def build_styles():
    title = ParagraphStyle('LotTitle', fontName='Courier-Bold', fontSize=16,
        leading=20, textColor=WHITE, backColor=BLACK, spaceAfter=6,
        alignment=TA_CENTER)
    subtitle = ParagraphStyle('LotSubtitle', fontName='Courier', fontSize=9,
        leading=12, textColor=GRAY_MID, spaceAfter=3, alignment=TA_CENTER)
    h1 = ParagraphStyle('LotH1', fontName='Courier-Bold', fontSize=12,
        leading=15, textColor=GOLD, spaceBefore=14, spaceAfter=5)
    h2 = ParagraphStyle('LotH2', fontName='Courier-Bold', fontSize=10,
        leading=13, textColor=CYAN, spaceBefore=10, spaceAfter=3)
    h3 = ParagraphStyle('LotH3', fontName='Courier-Bold', fontSize=9,
        leading=12, textColor=GREEN, spaceBefore=7, spaceAfter=2)
    body = ParagraphStyle('LotBody', fontName='Courier', fontSize=8,
        leading=11, textColor=GRAY_DARK, spaceAfter=3)
    meta = ParagraphStyle('LotMeta', fontName='Courier', fontSize=7,
        leading=9, textColor=GRAY_LIGHT, spaceAfter=2, alignment=TA_CENTER)
    return {'title': title, 'subtitle': subtitle, 'h1': h1, 'h2': h2,
            'h3': h3, 'body': body, 'meta': meta}


def make_pre(text):
    return Preformatted(text, ParagraphStyle('Pre', fontName='Courier',
        fontSize=7, leading=9, textColor=GRAY_DARK,
        backColor=colors.HexColor("#f0f5f0"),
        spaceAfter=5, spaceBefore=5, leftIndent=6, rightIndent=6))


def parse_md(styles):
    with open(MD_PATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    story = []
    in_code = False
    buf = []

    def flush():
        if buf:
            text = ''.join(buf).rstrip('\n')
            story.append(make_pre(text))
            buf.clear()

    for raw in lines:
        line = raw.rstrip('\n')
        if line.strip().startswith('<!--') or line.strip() == '-->':
            continue
        if line.strip().startswith('```'):
            if in_code:
                flush()
            in_code = not in_code
            continue
        if in_code:
            buf.append(raw)
            continue
        s = line.strip()
        if s.startswith('# ') and not s.startswith('## '):
            story.append(Spacer(1, 0.08 * inch))
            story.append(Paragraph(s[2:], styles['title']))
        elif s.startswith('## '):
            story.append(Paragraph(s[3:], styles['h1']))
        elif s.startswith('### '):
            story.append(Paragraph(s[4:], styles['h2']))
        elif s.startswith('#### '):
            story.append(Paragraph(s[5:], styles['h3']))
        elif s == '---':
            story.append(HRFlowable(width="100%", thickness=0.5,
                color=ACCENT, spaceAfter=3, spaceBefore=3))
        elif s == '':
            story.append(Spacer(1, 0.03 * inch))
        else:
            try:
                clean = s.replace('**', '').replace('*', '')
                # Escape XML special characters
                clean = clean.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                story.append(Paragraph(clean, styles['body']))
            except Exception:
                story.append(make_pre(s))
    if buf:
        flush()
    return story


def build_pdf():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )
    styles = build_styles()
    story = parse_md(styles)

    # Header block
    header = [
        Paragraph("LOT SYSTEMS CORPORATION", styles['subtitle']),
        Paragraph("Vadim Marmeladov — CEO &amp; Founder, LOT®", styles['meta']),
        Paragraph("LOT® Founded 7 April 2016 | brand.lot-systems.com", styles['meta']),
        Spacer(1, 0.1 * inch),
    ]
    story = header + story

    # Footer / colophon
    story += [
        HRFlowable(width="100%", thickness=0.5, color=ACCENT, spaceAfter=6, spaceBefore=12),
        Paragraph("LOT® — THE RPG &amp; ARCADE OF SELF-CARE", styles['meta']),
        Paragraph("BADGES &amp; ACHIEVEMENTS MASTER CODEX v29 — THE BIO-TERMINAL", styles['meta']),
        Paragraph("719 BADGES · WORD TURN v19 · JULY 2026", styles['meta']),
        Paragraph("© 2025–2026 LOT SYSTEMS. ALL RIGHTS RESERVED.", styles['meta']),
    ]

    doc.build(story)
    size = os.path.getsize(OUTPUT_PATH)
    print(f"[OK] PDF generated: {OUTPUT_PATH}")
    print(f"     Size: {size:,} bytes ({size // 1024} KB)")


if __name__ == '__main__':
    build_pdf()
