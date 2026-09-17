#!/usr/bin/env python3
"""Generate LOT Badges & Achievements Master Codex v36 PDF — The Dungeon Crawler"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER
import os

OUTPUT_PATH = "/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v36.pdf"
MD_PATH = "/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v36.md"

BLACK       = colors.HexColor("#000000")
WHITE       = colors.HexColor("#ffffff")
GRAY_DARK   = colors.HexColor("#1a1a1a")
GRAY_MID    = colors.HexColor("#333333")
GRAY_LIGHT  = colors.HexColor("#888888")
ACCENT      = colors.HexColor("#cccccc")
GOLD        = colors.HexColor("#bb8800")
CYAN        = colors.HexColor("#336688")
GREEN       = colors.HexColor("#336644")
DUNGEON     = colors.HexColor("#1a1200")   # deep dungeon dark
DUNGEON_GRID= colors.HexColor("#f5f0e8")   # parchment tint


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
        backColor=DUNGEON_GRID,
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
                color=GRAY_LIGHT, spaceAfter=6, spaceBefore=6))
        elif line.startswith('> '):
            q_text = line[2:].replace('*', '')
            story.append(Paragraph(f'  {q_text}', styles['body']))
        elif line.startswith('|'):
            story.append(Paragraph(line, styles['meta']))
        elif line.strip() == '':
            story.append(Spacer(1, 4))
        else:
            story.append(Paragraph(line.replace('**', '').replace('*', ''), styles['body']))

    return story


def add_header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Courier', 7)
    canvas.setFillColor(GRAY_LIGHT)
    canvas.drawString(0.5 * inch, 0.35 * inch,
        'LOT SYSTEMS — BADGE & ACHIEVEMENT MASTER CODEX v36 — THE DUNGEON CRAWLER')
    canvas.drawRightString(letter[0] - 0.5 * inch, 0.35 * inch,
        f'Page {doc.page}')
    canvas.restoreState()


def main():
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
    doc.build(story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    size_kb = os.path.getsize(OUTPUT_PATH) // 1024
    print(f'PDF generated: {OUTPUT_PATH} ({size_kb} KB)')


if __name__ == '__main__':
    main()
