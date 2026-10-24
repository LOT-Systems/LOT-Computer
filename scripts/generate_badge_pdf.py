#!/usr/bin/env python3
"""Generate LOT Badges & Achievements Master Codex v16 PDF"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Preformatted, HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os

OUTPUT_PATH = "/home/user/LOT-Computer/docs/badges/LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v16.pdf"
MD_PATH = "/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v16.md"

BLACK = colors.HexColor("#000000")
WHITE = colors.HexColor("#ffffff")
GRAY_DARK = colors.HexColor("#1a1a1a")
GRAY_MID = colors.HexColor("#333333")
GRAY_LIGHT = colors.HexColor("#888888")
ACCENT = colors.HexColor("#cccccc")
GOLD = colors.HexColor("#bb8800")
CYAN = colors.HexColor("#336688")
GREEN = colors.HexColor("#336644")

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
            story.append(Spacer(1, 0.08*inch))
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
            story.append(Spacer(1, 0.03*inch))
        else:
            try:
                # Strip markdown bold/italic for safety
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
    canvas.rect(0, h - 0.35*inch, w, 0.35*inch, fill=1, stroke=0)
    canvas.setFillColor(WHITE)
    canvas.setFont("Courier-Bold", 7)
    canvas.drawString(0.45*inch, h - 0.22*inch,
                      "LOT SYSTEMS — BADGES & ACHIEVEMENTS CODEX v16")
    canvas.drawRightString(w - 0.45*inch, h - 0.22*inch, f"p.{doc.page}")
    canvas.setFillColor(GRAY_LIGHT)
    canvas.setFont("Courier", 6.5)
    canvas.drawCentredString(w/2, 0.2*inch,
        "© 2025–2026 LOT Systems · LOT® Founded 7 April 2016 · brand.lot-systems.com")
    canvas.restoreState()

def main():
    print(f"Generating: {OUTPUT_PATH}")
    doc = SimpleDocTemplate(OUTPUT_PATH, pagesize=letter,
        rightMargin=0.6*inch, leftMargin=0.6*inch,
        topMargin=0.55*inch, bottomMargin=0.45*inch,
        title="LOT Badges & Achievements Master Codex v16",
        author="Vadik Marmeladov — LOT Systems",
        subject="RPG & Arcade of Self-Care")
    styles = build_styles()
    story = []

    # Cover
    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph("LOT SYSTEMS CORPORATION", styles['title']))
    story.append(Spacer(1, 0.08*inch))
    story.append(Paragraph("BADGES &amp; ACHIEVEMENTS MASTER CODEX — v16", styles['subtitle']))
    story.append(Paragraph("THE ROGUE ARCHIVE  ·  June 2026", styles['subtitle']))
    story.append(Spacer(1, 0.06*inch))
    story.append(Paragraph("284 badges · 41 categories · 256 hidden · 28 visible", styles['meta']))
    story.append(Paragraph('"Self-care is not a quest you complete. It is a world you build."', styles['meta']))
    story.append(Paragraph("Author: Vadik Marmeladov, CEO &amp; Founder, LOT Systems", styles['meta']))
    story.append(HRFlowable(width="100%", thickness=1, color=BLACK,
        spaceAfter=6, spaceBefore=6))
    cover_art = """\
╔══════════════════════════════════════════════════════════════════╗
║      L · O · T     S Y S T E M S     C O R P O R A T I O N      ║
║         BADGES & ACHIEVEMENTS MASTER CODEX — v16                 ║
║    RPG · ARCADE · SELF-CARE · SCI-FI · COMPUTER · BOOK          ║
║         [ INSERT COIN TO CONTINUE ]                              ║
║       ∘ → ≈ → ≋     ├─ → ╞═╡ → ║·║                             ║
║                                                                  ║
║  v15 → v16: +35 badges  (249 → 284 total)                       ║
║  Word Turn v7    — THE ROGUE ARCHIVE  (loot/boss/save/respawn…) ║
║  Time EE v7      — PIXEL HOURS        (02:02/14:14/05:55/03:33) ║
║  Calendar EE v6  — HACKER CALENDAR   (Apr 4/Nov 11/Mar 1)       ║
║  Behavioral EE v6— ENDURANCE SIGNALS (3wk journal/dawn/weekend) ║
║  Achievement v4  — VETERAN ARCS      (6 new story arcs)         ║
║  Mastery v6      — THE VOID LAYER    (5k check-ins/word-sov/…)  ║
║  Secret Boss v6  — THE VOID TIER     (void×5/founders/42days)   ║
╚══════════════════════════════════════════════════════════════════╝"""
    story.append(make_pre(cover_art))
    story.append(PageBreak())

    content = parse_md(styles)
    story.extend(content)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    size = os.path.getsize(OUTPUT_PATH)
    print(f"Done. Size: {size:,} bytes ({size/1024:.1f} KB)")

if __name__ == "__main__":
    main()
