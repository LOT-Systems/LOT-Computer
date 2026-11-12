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

BLACK = colors.HexColor("#000000")
WHITE = colors.HexColor("#ffffff")
GRAY_DARK = colors.HexColor("#1a1a1a")
GRAY_MID = colors.HexColor("#333333")
GRAY_LIGHT = colors.HexColor("#888888")
ACCENT = colors.HexColor("#cccccc")
GOLD = colors.HexColor("#bb8800")
CYAN = colors.HexColor("#336688")
GREEN = colors.HexColor("#336644")
STOIC = colors.HexColor("#4a3520")  # Roman bronze
MARBLE = colors.HexColor("#8b8070")  # Marble grey


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
    quote = ParagraphStyle('LotQuote', fontName='Courier', fontSize=8,
        leading=11, textColor=STOIC, spaceAfter=4, leftIndent=12, rightIndent=12)
    return {'title': title, 'subtitle': subtitle, 'h1': h1, 'h2': h2,
            'h3': h3, 'body': body, 'meta': meta, 'quote': quote}


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

    for line in lines:
        stripped = line.rstrip('\n')

        if stripped.startswith('```'):
            if in_code:
                flush()
                in_code = False
            else:
                in_code = True
            continue

        if in_code:
            buf.append(stripped + '\n')
            continue

        if stripped.startswith('# '):
            story.append(Spacer(1, 0.1 * inch))
            story.append(Paragraph(stripped[2:], styles['title']))
            story.append(Spacer(1, 0.05 * inch))
        elif stripped.startswith('## '):
            story.append(Paragraph(stripped[3:], styles['h1']))
        elif stripped.startswith('### '):
            story.append(Paragraph(stripped[4:], styles['h2']))
        elif stripped.startswith('#### '):
            story.append(Paragraph(stripped[5:], styles['h3']))
        elif stripped.startswith('---'):
            story.append(HRFlowable(width="100%", thickness=0.5,
                color=MARBLE, spaceAfter=4, spaceBefore=4))
        elif stripped.startswith('> '):
            story.append(Paragraph(stripped[2:], styles['quote']))
        elif stripped.startswith('**') and stripped.endswith('**') and len(stripped) > 4:
            story.append(Paragraph(stripped[2:-2], styles['h3']))
        elif stripped == '':
            story.append(Spacer(1, 0.04 * inch))
        else:
            safe = stripped.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            story.append(Paragraph(safe, styles['body']))

    flush()
    return story


def on_first_page(canvas, doc):
    canvas.saveState()
    w, h = letter
    canvas.setFillColor(BLACK)
    canvas.rect(0, h - 0.4 * inch, w, 0.4 * inch, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.setFont('Courier-Bold', 8)
    canvas.drawCentredString(w / 2, h - 0.25 * inch,
        'LOT SYSTEMS — BADGE & ACHIEVEMENT MASTER CODEX v33 — THE STOIC TERMINAL')
    canvas.setFillColor(BLACK)
    canvas.rect(0, 0, w, 0.3 * inch, fill=1, stroke=0)
    canvas.setFillColor(MARBLE)
    canvas.setFont('Courier', 7)
    canvas.drawCentredString(w / 2, 0.1 * inch,
        f'LOT-SR-20261112-01  ·  v33  ·  843 badges  ·  AUTHORIZED: S-2 // VADIK MARMELADOV')
    canvas.restoreState()


def on_later_pages(canvas, doc):
    canvas.saveState()
    w, h = letter
    canvas.setFillColor(BLACK)
    canvas.rect(0, h - 0.3 * inch, w, 0.3 * inch, fill=1, stroke=0)
    canvas.setFillColor(GOLD)
    canvas.setFont('Courier-Bold', 7)
    canvas.drawCentredString(w / 2, h - 0.19 * inch, 'LOT MASTER CODEX v33 — THE STOIC TERMINAL')
    canvas.setFillColor(BLACK)
    canvas.rect(0, 0, w, 0.25 * inch, fill=1, stroke=0)
    canvas.setFillColor(MARBLE)
    canvas.setFont('Courier', 7)
    canvas.drawString(0.5 * inch, 0.08 * inch, 'LOT SYSTEMS CORPORATION')
    canvas.drawRightString(w - 0.5 * inch, 0.08 * inch, f'Page {doc.page}')
    canvas.restoreState()


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        topMargin=0.6 * inch,
        bottomMargin=0.5 * inch,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        title='LOT Badges & Achievements Master Codex v33 — The Stoic Terminal',
        author='LOT Systems Corporation',
        subject='Badge & Achievement System v33 — Stoic Philosophy × Self-Care RPG',
    )
    styles = build_styles()
    story = parse_md(styles)
    doc.build(story, onFirstPage=on_first_page, onLaterPages=on_later_pages)
    print(f'PDF generated: {OUTPUT_PATH}')


if __name__ == '__main__':
    main()
