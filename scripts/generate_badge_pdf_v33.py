#!/usr/bin/env python3
"""Generate LOT Badges & Achievements Master Codex v33 PDF — The Stoic Terminal"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER
import os

OUTPUT_PATH = "/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v33.pdf"
MD_PATH = "/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v33.md"

BLACK       = colors.HexColor("#000000")
WHITE       = colors.HexColor("#ffffff")
GRAY_DARK   = colors.HexColor("#1a1a1a")
GRAY_MID    = colors.HexColor("#333333")
GRAY_LIGHT  = colors.HexColor("#888888")
ACCENT      = colors.HexColor("#cccccc")
GOLD        = colors.HexColor("#bb8800")
CYAN        = colors.HexColor("#336688")
GREEN       = colors.HexColor("#336644")
STOIC       = colors.HexColor("#1a1408")   # deep stoic bronze-black
STOIC_PARCH = colors.HexColor("#f7f3eb")   # aged parchment tint


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
        backColor=STOIC_PARCH,
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

        # headings
        if line.startswith('# '):
            story.append(Paragraph(line[2:], styles['title']))
        elif line.startswith('## '):
            story.append(Paragraph(line[3:], styles['h1']))
        elif line.startswith('### '):
            story.append(Paragraph(line[4:], styles['h2']))
        elif line.startswith('#### '):
            story.append(Paragraph(line[5:], styles['h3']))
        elif line.startswith('---'):
            story.append(HRFlowable(width="100%", thickness=0.5,
                         color=ACCENT, spaceAfter=4, spaceBefore=4))
        elif line.strip() == '':
            story.append(Spacer(1, 4))
        else:
            # blockquote
            stripped = line.strip()
            if stripped.startswith('> '):
                text = stripped[2:].replace('*', '')
                story.append(Paragraph(text, styles['meta']))
            elif stripped.startswith('|'):
                story.append(Paragraph(stripped, styles['body']))
            else:
                text = stripped.replace('**', '').replace('*', '')
                story.append(Paragraph(text, styles['body']))

    flush()
    return story


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Courier', 6)
    canvas.setFillColor(GRAY_LIGHT)
    canvas.drawString(0.5*inch, 0.35*inch,
        'LOT SYSTEMS — BADGE & ACHIEVEMENT MASTER CODEX v33 — THE STOIC TERMINAL')
    canvas.drawRightString(8*inch, 0.35*inch, f'p.{doc.page}')
    canvas.restoreState()


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True) if os.path.dirname(OUTPUT_PATH) else None

    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        leftMargin=0.65*inch,
        rightMargin=0.65*inch,
        topMargin=0.6*inch,
        bottomMargin=0.6*inch,
    )

    styles = build_styles()
    story = []

    # Cover block
    story.append(Spacer(1, 0.25*inch))
    story.append(Paragraph('LOT SYSTEMS CORPORATION', styles['title']))
    story.append(Paragraph('BADGE &amp; ACHIEVEMENT MASTER CODEX', styles['subtitle']))
    story.append(Paragraph('VERSION 33 — THE STOIC TERMINAL', styles['subtitle']))
    story.append(Spacer(1, 0.1*inch))
    story.append(HRFlowable(width="100%", thickness=1, color=GOLD,
                 spaceAfter=8, spaceBefore=4))

    # Parse markdown body
    body_story = parse_md(styles)
    story.extend(body_story)

    # Footer meta
    story.append(Spacer(1, 0.2*inch))
    story.append(HRFlowable(width="100%", thickness=0.5, color=ACCENT,
                 spaceAfter=4))
    story.append(Paragraph(
        'LOT SYSTEMS CORPORATION | Vadim Marmeladov, CEO/Owner LOT(R) | '
        'Kuzya Cosmo Marmeladov, CEO/Owner COSMO(R) | brand.lot-systems.com',
        styles['meta']))
    story.append(Paragraph(
        'LOT(R) Founded 7 April 2016 | COSMO(R) Founded 1 July 2024 | Made in the USA',
        styles['meta']))
    story.append(Paragraph('Badge Codex v33 — The Stoic Terminal — 843 total badges — 2026-10-12',
        styles['meta']))

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f'[v33] PDF written: {OUTPUT_PATH}')
    size = os.path.getsize(OUTPUT_PATH)
    print(f'[v33] File size: {size:,} bytes ({size/1024:.1f} KB)')


if __name__ == '__main__':
    main()
