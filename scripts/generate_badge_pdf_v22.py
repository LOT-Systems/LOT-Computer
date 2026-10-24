#!/usr/bin/env python3
"""Generate LOT Badges & Achievements Master Codex v22 PDF — The Oracle Engine"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER
import os

OUTPUT_PATH = "/home/user/LOT-Computer/docs/badges/LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v22.pdf"
MD_PATH = "/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v22.md"

BLACK = colors.HexColor("#000000")
WHITE = colors.HexColor("#ffffff")
GRAY_DARK = colors.HexColor("#1a1a1a")
GRAY_MID = colors.HexColor("#333333")
GRAY_LIGHT = colors.HexColor("#888888")
ACCENT = colors.HexColor("#cccccc")
GOLD = colors.HexColor("#bb8800")
CYAN = colors.HexColor("#336688")
GREEN = colors.HexColor("#336644")
ORACLE = colors.HexColor("#44335a")   # deep violet — oracle theme

def build_styles():
    title = ParagraphStyle('LotTitle', fontName='Courier-Bold', fontSize=16,
        leading=20, textColor=WHITE, backColor=BLACK, spaceAfter=6, alignment=TA_CENTER)
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
    oracle_accent = ParagraphStyle('LotOracle', fontName='Courier-Bold', fontSize=8,
        leading=11, textColor=ORACLE, spaceAfter=3)
    return {'title': title, 'subtitle': subtitle, 'h1': h1, 'h2': h2,
            'h3': h3, 'body': body, 'meta': meta, 'oracle': oracle_accent}

def make_pre(text):
    return Preformatted(text, ParagraphStyle('Pre', fontName='Courier',
        fontSize=7, leading=9, textColor=GRAY_DARK,
        backColor=colors.HexColor("#f5f5f5"),
        spaceAfter=5, spaceBefore=5, leftIndent=6, rightIndent=6))

def parse_md(styles):
    with open(MD_PATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    story = []
    in_code = False
    buf = []

    def flush():
        if buf:
            story.append(make_pre(''.join(buf)))
            buf.clear()

    for raw in lines:
        line = raw.rstrip('\n')

        # skip HTML comments
        if line.strip().startswith('<!--') or line.strip().endswith('-->'):
            continue

        if line.strip() == '```':
            if in_code:
                flush()
                in_code = False
            else:
                in_code = True
            continue

        if in_code:
            buf.append(raw)
            continue

        # headings
        if line.startswith('# ') and not line.startswith('## '):
            story.append(Spacer(1, 0.1*inch))
            story.append(Paragraph(line[2:], styles['title']))
            story.append(Spacer(1, 0.05*inch))
        elif line.startswith('## '):
            story.append(Spacer(1, 0.08*inch))
            story.append(Paragraph(line[3:], styles['h1']))
        elif line.startswith('### '):
            story.append(Paragraph(line[4:], styles['h2']))
        elif line.startswith('#### '):
            story.append(Paragraph(line[5:], styles['h3']))
        elif line.strip() == '---':
            story.append(HRFlowable(width="100%", thickness=0.5,
                color=GRAY_LIGHT, spaceAfter=4, spaceBefore=4))
        elif line.startswith('**') and line.endswith('**'):
            story.append(Paragraph(line.strip('*'), styles['oracle']))
        elif line.strip() == '':
            story.append(Spacer(1, 0.04*inch))
        else:
            # strip markdown bold/italic for simplicity
            text = line.replace('**', '').replace('*', '')
            story.append(Paragraph(text, styles['body']))

    return story

def on_first_page(canvas, doc):
    canvas.saveState()
    canvas.setFont('Courier', 7)
    canvas.setFillColor(GRAY_LIGHT)
    canvas.drawString(0.5*inch, 0.4*inch,
        'LOT Systems Corporation — Badges & Achievements Master Codex v22 — THE ORACLE ENGINE')
    canvas.drawRightString(letter[0] - 0.5*inch, 0.4*inch, 'Page 1')
    canvas.restoreState()

def on_later_pages(canvas, doc):
    canvas.saveState()
    canvas.setFont('Courier', 7)
    canvas.setFillColor(GRAY_LIGHT)
    canvas.drawString(0.5*inch, 0.4*inch,
        'LOT Systems — BADGES CODEX v22 — THE ORACLE ENGINE')
    canvas.drawRightString(letter[0] - 0.5*inch, 0.4*inch, f'Page {doc.page}')
    canvas.restoreState()

def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        leftMargin=0.65*inch,
        rightMargin=0.65*inch,
        topMargin=0.75*inch,
        bottomMargin=0.65*inch,
    )
    styles = build_styles()
    story = parse_md(styles)
    doc.build(story, onFirstPage=on_first_page, onLaterPages=on_later_pages)
    print(f"PDF written: {OUTPUT_PATH}")

if __name__ == '__main__':
    main()
