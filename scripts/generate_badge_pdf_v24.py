#!/usr/bin/env python3
"""Generate LOT Badges & Achievements Master Codex v24 PDF — The Oracle Archive"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER
import os

OUTPUT_PATH = "/home/user/LOT-Computer/docs/badges/LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v24.pdf"
MD_PATH = "/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v24.md"

BLACK = colors.HexColor("#000000")
WHITE = colors.HexColor("#ffffff")
GRAY_DARK = colors.HexColor("#1a1a1a")
GRAY_MID = colors.HexColor("#333333")
GRAY_LIGHT = colors.HexColor("#888888")
ACCENT = colors.HexColor("#cccccc")
GOLD = colors.HexColor("#bb8800")
CYAN = colors.HexColor("#336688")
GREEN = colors.HexColor("#336644")
ORACLE = colors.HexColor("#2a4422")   # deep forest green — oracle theme


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
                story.append(Paragraph(clean, styles['body']))
            except Exception:
                pass
    flush()
    return story


def header_footer(canvas, doc):
    canvas.saveState()
    w, h = letter
    canvas.setFillColor(BLACK)
    canvas.rect(0, h - 0.35 * inch, w, 0.35 * inch, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Courier-Bold", 7)
    canvas.drawString(0.45 * inch, h - 0.22 * inch,
                      "LOT SYSTEMS — BADGES & ACHIEVEMENTS CODEX v24 — THE ORACLE ARCHIVE")
    canvas.drawRightString(w - 0.45 * inch, h - 0.22 * inch, f"p.{doc.page}")
    canvas.setFillColor(GRAY_LIGHT)
    canvas.setFont("Courier", 6.5)
    canvas.drawCentredString(w / 2, 0.2 * inch,
        "© 2025–2026 LOT Systems · LOT® Founded 7 April 2016 · brand.lot-systems.com")
    canvas.restoreState()


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    print(f"Generating: {OUTPUT_PATH}")
    doc = SimpleDocTemplate(OUTPUT_PATH, pagesize=letter,
        rightMargin=0.6 * inch, leftMargin=0.6 * inch,
        topMargin=0.55 * inch, bottomMargin=0.45 * inch,
        title="LOT Badges & Achievements Master Codex v24 — The Oracle Archive",
        author="Vadik Marmeladov — LOT Systems",
        subject="RPG & Arcade of Self-Care — Oracle Archive Edition")
    styles = build_styles()
    story = []

    # Cover page
    story.append(Spacer(1, 0.4 * inch))
    story.append(Paragraph("LOT SYSTEMS CORPORATION", styles['title']))
    story.append(Spacer(1, 0.08 * inch))
    story.append(Paragraph("BADGES &amp; ACHIEVEMENTS MASTER CODEX — v24",
                            styles['subtitle']))
    story.append(Paragraph("THE ORACLE ARCHIVE  ·  July 2026", styles['subtitle']))
    story.append(Spacer(1, 0.06 * inch))
    story.append(Paragraph(
        "564 badges · 35 new · The archive speaks. You are the oracle.",
        styles['meta']))
    story.append(Paragraph(
        '"Every query is a question. Every answer is an oracle. You are the archive."',
        styles['meta']))
    story.append(Paragraph("Author: Vadik Marmeladov, CEO &amp; Founder, LOT Systems",
                            styles['meta']))
    story.append(HRFlowable(width="100%", thickness=1, color=BLACK,
        spaceAfter=6, spaceBefore=6))

    cover_art = """\
╔══════════════════════════════════════════════════════════════════╗
║      L · O · T     S Y S T E M S     C O R P O R A T I O N      ║
║         BADGES & ACHIEVEMENTS MASTER CODEX — v24                 ║
║    RPG · ARCADE · SELF-CARE · SCI-FI · ORACLE · ARCHIVE          ║
║                                                                  ║
║         > THE ORACLE ARCHIVE: OPEN <                             ║
║         [ QUERY: ACCEPTED ]                                      ║
║                                                                  ║
║   ◉⊡◉  ORACLE CONSULTED    ∗·∗   RUNE DETECTED                   ║
║   ∿→∿  PROPHECY LOGGED     ─□─   SCROLL OPENED                   ║
║   ≈▲≈  SIGNAL AMPLIFIED    ▓▓▓   ENCRYPTED ENTRY                 ║
║   ←◉→  CONVERGENCE POINT   ═══   SYNC COMPLETE                   ║
║                                                                  ║
║  v23 → v24: +35 badges  (529 → 564 total)                        ║
║  Word Turn v15  — THE ORACLE ARCHIVE (oracle/rune/prophecy/…)    ║
║  Time EE v15    — ORACLE HOURS  (01:01/13:37/22:22/18:18)        ║
║  Calendar v14   — ORACLE CALENDAR  (Aug 8 / Oct 23 / Mar 22)     ║
║  Behavioral v14 — ORACLE PATTERNS  (full_stack/page_one/…)       ║
║  Achievement v12— ORACLE COMMANDER (class/library/reader/…)      ║
║  Mastery v14    — ORACLE DEPTHS    (grand_master/recall/…)       ║
║  Secret Boss v14— HIDDEN PROTOCOL  (42/Seldon/heat death)        ║
║                                                                  ║
║  THE ARCHIVE NEVER CLOSES. QUERY = KNOWLEDGE.                   ║
╚══════════════════════════════════════════════════════════════════╝"""
    story.append(make_pre(cover_art))
    story.append(PageBreak())

    content = parse_md(styles)
    story.extend(content)

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    size = os.path.getsize(OUTPUT_PATH)
    print(f"Done. Size: {size:,} bytes ({size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
