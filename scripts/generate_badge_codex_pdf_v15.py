"""
LOT Systems Corporation
Badge & Achievements Master Codex — PDF Generator v15
Generates a monospaced terminal-style PDF from the v15 Codex markdown.
"""

import re
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, HRFlowable
)
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics


# ── Colors ────────────────────────────────────────────────────────────────────
BG_COLOR   = colors.HexColor('#0a0a0a')
FG_COLOR   = colors.HexColor('#e0e0e0')
ACC_COLOR  = colors.HexColor('#88ccee')  # headers / badges
GOLD_COLOR = colors.HexColor('#ffcc44')  # legendary
RED_COLOR  = colors.HexColor('#ff6644')  # mythic / secret boss
GRID_COLOR = colors.HexColor('#333333')  # box-draw
DIM_COLOR  = colors.HexColor('#666666')  # comments / meta
COSMIC_COLOR = colors.HexColor('#cc88ff')  # cosmic tier


# ── Page setup ─────────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = A4
MARGIN = 14 * mm

OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'docs', 'badges',
    'LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v15.pdf'
)

MD_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'docs', 'badges',
    'LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v15.md'
)


def make_styles():
    styles = getSampleStyleSheet()

    body = ParagraphStyle(
        'LotBody',
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=FG_COLOR,
        backColor=BG_COLOR,
        spaceAfter=2,
    )

    h1 = ParagraphStyle(
        'LotH1',
        fontName='Courier-Bold',
        fontSize=13,
        leading=17,
        textColor=ACC_COLOR,
        backColor=BG_COLOR,
        spaceAfter=4,
        spaceBefore=8,
    )

    h2 = ParagraphStyle(
        'LotH2',
        fontName='Courier-Bold',
        fontSize=10,
        leading=13,
        textColor=ACC_COLOR,
        backColor=BG_COLOR,
        spaceAfter=3,
        spaceBefore=6,
    )

    h3 = ParagraphStyle(
        'LotH3',
        fontName='Courier-Bold',
        fontSize=9,
        leading=12,
        textColor=GOLD_COLOR,
        backColor=BG_COLOR,
        spaceAfter=2,
        spaceBefore=4,
    )

    h4 = ParagraphStyle(
        'LotH4',
        fontName='Courier-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#aaaaee'),
        backColor=BG_COLOR,
        spaceAfter=2,
        spaceBefore=3,
    )

    code = ParagraphStyle(
        'LotCode',
        fontName='Courier',
        fontSize=7,
        leading=9.5,
        textColor=FG_COLOR,
        backColor=colors.HexColor('#111111'),
        spaceAfter=6,
        spaceBefore=4,
        leftIndent=4,
        rightIndent=4,
    )

    meta = ParagraphStyle(
        'LotMeta',
        fontName='Courier',
        fontSize=7,
        leading=9,
        textColor=DIM_COLOR,
        backColor=BG_COLOR,
        spaceAfter=1,
    )

    return {'body': body, 'h1': h1, 'h2': h2, 'h3': h3, 'h4': h4,
            'code': code, 'meta': meta}


def strip_html_comments(text):
    return re.sub(r'<!--.*?-->', '', text, flags=re.DOTALL)


def escape_xml(text):
    """Minimal XML escaping for ReportLab Paragraph."""
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    return text


def parse_md_to_flowables(md_text, styles):
    flowables = []
    lines = md_text.split('\n')
    s = styles

    in_code = False
    code_block = []

    def flush_code():
        if code_block:
            raw = '\n'.join(code_block)
            pre = Preformatted(
                raw,
                style=ParagraphStyle(
                    'PreStyle',
                    fontName='Courier',
                    fontSize=6.8,
                    leading=9.2,
                    textColor=FG_COLOR,
                    backColor=colors.HexColor('#0d0d0d'),
                    leftIndent=6,
                    rightIndent=6,
                    spaceAfter=6,
                    spaceBefore=4,
                )
            )
            flowables.append(pre)
            code_block.clear()

    i = 0
    while i < len(lines):
        line = lines[i]

        # Code fence
        if line.strip().startswith('```'):
            if in_code:
                in_code = False
                flush_code()
            else:
                in_code = True
            i += 1
            continue

        if in_code:
            code_block.append(line)
            i += 1
            continue

        stripped = line.strip()

        # Headings
        if stripped.startswith('#### '):
            text = escape_xml(stripped[5:])
            flowables.append(Paragraph(text, s['h4']))
        elif stripped.startswith('### '):
            text = escape_xml(stripped[4:])
            flowables.append(Paragraph(text, s['h3']))
        elif stripped.startswith('## '):
            text = escape_xml(stripped[3:])
            flowables.append(HRFlowable(
                width='100%', thickness=0.5,
                color=GRID_COLOR, spaceAfter=2
            ))
            flowables.append(Paragraph(text, s['h2']))
        elif stripped.startswith('# '):
            text = escape_xml(stripped[2:])
            flowables.append(Paragraph(text, s['h1']))
        elif stripped == '---':
            flowables.append(Spacer(1, 3 * mm))
            flowables.append(HRFlowable(
                width='100%', thickness=0.3,
                color=GRID_COLOR, spaceAfter=3
            ))
        elif stripped == '':
            flowables.append(Spacer(1, 2))
        else:
            text = escape_xml(stripped)
            text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
            text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
            text = re.sub(r'`(.+?)`', r'<font name="Courier">\1</font>', text)
            if stripped.startswith('**') or stripped.startswith('*'):
                flowables.append(Paragraph(text, s['meta']))
            else:
                flowables.append(Paragraph(text, s['body']))

        i += 1

    flush_code()

    return flowables


def build_pdf():
    print(f"Reading: {MD_PATH}")
    with open(MD_PATH, 'r', encoding='utf-8') as f:
        md_text = f.read()

    md_text = strip_html_comments(md_text)

    styles = make_styles()

    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        title='LOT Badges & Achievements Master Codex v15',
        author='Vadik Marmeladov — LOT Systems Corporation',
        subject='RPG Arcade Self-Care Badge System',
        keywords='LOT badges achievements RPG arcade self-care v15',
    )

    def on_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(BG_COLOR)
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canvas.setFont('Courier', 6)
        canvas.setFillColor(DIM_COLOR)
        footer = (
            f'LOT Systems Corporation  ·  '
            f'Badges & Achievements Master Codex v15  ·  '
            f'© 2025–2026  ·  brand.lot-systems.com  ·  '
            f'Page {doc.page}'
        )
        canvas.drawCentredString(PAGE_W / 2, 8 * mm, footer)
        canvas.restoreState()

    flowables = parse_md_to_flowables(md_text, styles)

    doc.build(flowables, onFirstPage=on_page, onLaterPages=on_page)
    print(f"PDF generated: {OUTPUT_PATH}")
    size_kb = os.path.getsize(OUTPUT_PATH) // 1024
    print(f"File size: {size_kb} KB")


if __name__ == '__main__':
    build_pdf()
