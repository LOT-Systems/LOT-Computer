#!/usr/bin/env python3
"""Generate LOT Badges & Achievements Master Codex v38 PDF — The Clockwork Heart"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER
import os

OUTPUT_PATH = "/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v38.pdf"
MD_PATH = "/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v38.md"

BLACK       = colors.HexColor("#000000")
WHITE       = colors.HexColor("#ffffff")
GRAY_DARK   = colors.HexColor("#1a1a1a")
GRAY_MID    = colors.HexColor("#333333")
GRAY_LIGHT  = colors.HexColor("#888888")
ACCENT      = colors.HexColor("#cccccc")
GOLD        = colors.HexColor("#bb8800")
CYAN        = colors.HexColor("#336688")
GREEN       = colors.HexColor("#336644")
CLOCKWORK   = colors.HexColor("#1a1008")   # deep copper-dark — Clockwork theme
CLOCK_GRID  = colors.HexColor("#f5f0e8")   # warm brass tint


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
        backColor=CLOCK_GRID,
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
        # Headings
        if line.startswith('# '):
            story.append(Spacer(1, 0.08*inch))
            story.append(Paragraph(line[2:], styles['title']))
        elif line.startswith('## '):
            story.append(Spacer(1, 0.05*inch))
            story.append(Paragraph(line[3:], styles['h1']))
        elif line.startswith('### '):
            story.append(Paragraph(line[4:], styles['h2']))
        elif line.startswith('#### '):
            story.append(Paragraph(line[5:], styles['h3']))
        elif line.startswith('---'):
            story.append(HRFlowable(width='100%', thickness=0.5,
                color=ACCENT, spaceAfter=4, spaceBefore=4))
        elif line.strip() == '':
            story.append(Spacer(1, 0.04*inch))
        else:
            # Strip table separators
            if set(line.replace('|','').replace('-','').replace(' ','')):
                clean = line.lstrip('> ').replace('**', '')
                story.append(Paragraph(clean, styles['body']))

    flush()
    return story


def add_header_block(story, styles):
    story.append(Paragraph(
        'LOT SYSTEMS CORPORATION',
        ParagraphStyle('Corp', fontName='Courier-Bold', fontSize=8,
            leading=10, textColor=GRAY_LIGHT, alignment=TA_CENTER)
    ))
    story.append(Paragraph(
        'Vadim Marmeladov — CEO, Owner LOT® | Kuzya Cosmo Marmeladov — CEO, Owner COSMO®',
        ParagraphStyle('Corp2', fontName='Courier', fontSize=7,
            leading=9, textColor=GRAY_LIGHT, alignment=TA_CENTER)
    ))
    story.append(Paragraph(
        'LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024 | Made in the USA',
        ParagraphStyle('Corp3', fontName='Courier', fontSize=7,
            leading=9, textColor=GRAY_LIGHT, alignment=TA_CENTER)
    ))
    story.append(HRFlowable(width='100%', thickness=1, color=BLACK,
        spaceAfter=8, spaceBefore=4))


def add_footer_block(story, styles):
    story.append(HRFlowable(width='100%', thickness=0.5, color=ACCENT,
        spaceAfter=4, spaceBefore=8))
    story.append(Paragraph(
        'LOT BADGES & ACHIEVEMENTS — MASTER CODEX v38 — THE CLOCKWORK HEART',
        styles['meta']
    ))
    story.append(Paragraph(
        'SESSION: LOT-SR-20261015-01 | TOTAL: 998 BADGES | +31 FROM v37',
        styles['meta']
    ))
    story.append(Paragraph(
        'AUTHORIZED: S-2 // VADIK MARMELADOV | BRANCH: claude/quantum-engine-widgets-RgFfC',
        styles['meta']
    ))
    story.append(Paragraph(
        'LOT® & COSMO® are registered trademarks of LOT Systems Corporation.',
        ParagraphStyle('TM', fontName='Courier', fontSize=6,
            leading=8, textColor=GRAY_LIGHT, alignment=TA_CENTER)
    ))


def main():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
        title='LOT Badges & Achievements Master Codex v38 — The Clockwork Heart',
        author='Vadim Marmeladov, LOT Systems Corporation',
        subject='Badge & Achievement System — LOT RPG of Self-Care',
        keywords='LOT, badges, achievements, RPG, self-care, clockwork, horology',
    )

    styles = build_styles()
    story = []
    add_header_block(story, styles)
    story += parse_md(styles)
    add_footer_block(story, styles)

    doc.build(story)
    size = os.path.getsize(OUTPUT_PATH)
    print(f"PDF generated: {OUTPUT_PATH} ({size:,} bytes)")


if __name__ == '__main__':
    main()
