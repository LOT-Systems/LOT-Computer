#!/usr/bin/env python3
"""Generate LOT Badges & Achievements Master Codex v43 PDF — The Dream Weaver"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER
import os

OUTPUT_PATH = "/home/user/LOT-Computer/docs/badges/LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v43.pdf"
MD_PATH = "/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v43.md"

BLACK        = colors.HexColor("#000000")
WHITE        = colors.HexColor("#ffffff")
GRAY_DARK    = colors.HexColor("#1a1a1a")
GRAY_MID     = colors.HexColor("#333333")
GRAY_LIGHT   = colors.HexColor("#888888")
DREAM_BG     = colors.HexColor("#f0eeff")   # soft lavender — dream world feel
DREAM_GOLD   = colors.HexColor("#9966cc")   # dream purple-gold
DREAM_CYAN   = colors.HexColor("#4488aa")   # sleep-blue
DREAM_TEAL   = colors.HexColor("#2a7a6a")   # deep REM green
DREAM_SILVER = colors.HexColor("#aaaacc")   # moonlight silver
DREAM_NIGHT  = colors.HexColor("#1a1a2e")   # deep night background


def build_styles():
    title = ParagraphStyle('LotTitle', fontName='Courier-Bold', fontSize=16,
        leading=20, textColor=WHITE, backColor=DREAM_NIGHT, spaceAfter=6,
        alignment=TA_CENTER, borderPadding=8)
    subtitle = ParagraphStyle('LotSubtitle', fontName='Courier', fontSize=9,
        leading=12, textColor=GRAY_MID, spaceAfter=3, alignment=TA_CENTER)
    h1 = ParagraphStyle('LotH1', fontName='Courier-Bold', fontSize=12,
        leading=15, textColor=DREAM_GOLD, spaceBefore=14, spaceAfter=5)
    h2 = ParagraphStyle('LotH2', fontName='Courier-Bold', fontSize=10,
        leading=13, textColor=DREAM_CYAN, spaceBefore=10, spaceAfter=3)
    h3 = ParagraphStyle('LotH3', fontName='Courier-Bold', fontSize=9,
        leading=12, textColor=DREAM_TEAL, spaceBefore=7, spaceAfter=2)
    body = ParagraphStyle('LotBody', fontName='Courier', fontSize=8,
        leading=11, textColor=GRAY_DARK, spaceAfter=3)
    meta = ParagraphStyle('LotMeta', fontName='Courier', fontSize=7,
        leading=9, textColor=GRAY_LIGHT, spaceAfter=2, alignment=TA_CENTER)
    return {'title': title, 'subtitle': subtitle, 'h1': h1, 'h2': h2,
            'h3': h3, 'body': body, 'meta': meta}


def make_pre(text):
    return Preformatted(text, ParagraphStyle('Pre', fontName='Courier',
        fontSize=7, leading=9, textColor=GRAY_DARK,
        backColor=DREAM_BG,
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

        if line.startswith('# '):
            story.append(Paragraph(line[2:], styles['title']))
        elif line.startswith('## '):
            story.append(Paragraph(line[3:], styles['h1']))
        elif line.startswith('### '):
            story.append(Paragraph(line[4:], styles['h2']))
        elif line.startswith('#### '):
            story.append(Paragraph(line[5:], styles['h3']))
        elif line.startswith('---'):
            story.append(HRFlowable(width='100%', thickness=0.5,
                color=DREAM_SILVER, spaceAfter=4, spaceBefore=4))
        elif line.strip() == '':
            story.append(Spacer(1, 4))
        else:
            story.append(Paragraph(line, styles['body']))

    flush()
    return story


def build_header_footer(canvas, doc):
    canvas.saveState()
    w, h = letter
    canvas.setFont('Courier', 7)
    canvas.setFillColor(GRAY_LIGHT)
    canvas.drawString(0.5 * inch, 0.4 * inch,
        'LOT SYSTEMS CORPORATION — Badge Codex v43 — THE DREAM WEAVER — 2026-11-04')
    canvas.drawRightString(w - 0.5 * inch, 0.4 * inch, f'Page {doc.page}')
    canvas.restoreState()


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )
    styles = build_styles()
    story = parse_md(styles)
    doc.build(story, onFirstPage=build_header_footer, onLaterPages=build_header_footer)
    print(f'[OK] PDF generated: {OUTPUT_PATH}')
    size_kb = os.path.getsize(OUTPUT_PATH) // 1024
    print(f'     Size: {size_kb} KB')


if __name__ == '__main__':
    main()
