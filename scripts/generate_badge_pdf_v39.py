#!/usr/bin/env python3
"""
LOT Systems — Badge & Achievement Master Codex v39 PDF Generator
Generates LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v39.pdf
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import (
    HexColor, black, white, Color
)
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, Preformatted
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

# Color palette — LOT Systems dark terminal aesthetic
BG_DARK      = HexColor('#0d0d0d')
BG_PANEL     = HexColor('#1a1a2e')
NEON_CYAN    = HexColor('#00f0f0')
NEON_GREEN   = HexColor('#00ff88')
NEON_AMBER   = HexColor('#ffb300')
NEON_RED     = HexColor('#ff3355')
NEON_PURPLE  = HexColor('#cc44ff')
NEON_BLUE    = HexColor('#4488ff')
SOFT_WHITE   = HexColor('#e8e8e8')
DIM_GREY     = HexColor('#666677')
PANEL_BORDER = HexColor('#334455')

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'docs', 'badges')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v39.pdf')

def make_styles():
    base = getSampleStyleSheet()

    styles = {}

    styles['cover_title'] = ParagraphStyle(
        'cover_title', parent=base['Normal'],
        fontSize=22, fontName='Courier-Bold',
        textColor=NEON_CYAN, alignment=TA_CENTER,
        spaceAfter=8, leading=28,
    )
    styles['cover_sub'] = ParagraphStyle(
        'cover_sub', parent=base['Normal'],
        fontSize=12, fontName='Courier',
        textColor=NEON_GREEN, alignment=TA_CENTER,
        spaceAfter=4, leading=16,
    )
    styles['cover_meta'] = ParagraphStyle(
        'cover_meta', parent=base['Normal'],
        fontSize=9, fontName='Courier',
        textColor=DIM_GREY, alignment=TA_CENTER,
        spaceAfter=2, leading=12,
    )
    styles['h1'] = ParagraphStyle(
        'h1', parent=base['Normal'],
        fontSize=16, fontName='Courier-Bold',
        textColor=NEON_CYAN, spaceAfter=6, spaceBefore=14, leading=20,
    )
    styles['h2'] = ParagraphStyle(
        'h2', parent=base['Normal'],
        fontSize=12, fontName='Courier-Bold',
        textColor=NEON_GREEN, spaceAfter=4, spaceBefore=10, leading=16,
    )
    styles['h3'] = ParagraphStyle(
        'h3', parent=base['Normal'],
        fontSize=10, fontName='Courier-Bold',
        textColor=NEON_AMBER, spaceAfter=3, spaceBefore=8, leading=14,
    )
    styles['body'] = ParagraphStyle(
        'body', parent=base['Normal'],
        fontSize=8.5, fontName='Courier',
        textColor=SOFT_WHITE, spaceAfter=3, leading=12,
    )
    styles['mono'] = ParagraphStyle(
        'mono', parent=base['Normal'],
        fontSize=7.5, fontName='Courier',
        textColor=NEON_GREEN, spaceAfter=2, leading=11,
        leftIndent=12,
    )
    styles['badge_id'] = ParagraphStyle(
        'badge_id', parent=base['Normal'],
        fontSize=8, fontName='Courier-Bold',
        textColor=NEON_CYAN, spaceAfter=1, leading=11,
    )
    styles['rarity_common']    = ParagraphStyle('rarity_common',    parent=base['Normal'], fontSize=7.5, fontName='Courier', textColor=SOFT_WHITE,  leading=10)
    styles['rarity_uncommon']  = ParagraphStyle('rarity_uncommon',  parent=base['Normal'], fontSize=7.5, fontName='Courier', textColor=NEON_GREEN,  leading=10)
    styles['rarity_rare']      = ParagraphStyle('rarity_rare',      parent=base['Normal'], fontSize=7.5, fontName='Courier', textColor=NEON_CYAN,   leading=10)
    styles['rarity_epic']      = ParagraphStyle('rarity_epic',      parent=base['Normal'], fontSize=7.5, fontName='Courier', textColor=NEON_AMBER,  leading=10)
    styles['rarity_legendary'] = ParagraphStyle('rarity_legendary', parent=base['Normal'], fontSize=7.5, fontName='Courier', textColor=NEON_PURPLE, leading=10)
    styles['rarity_mythic']    = ParagraphStyle('rarity_mythic',    parent=base['Normal'], fontSize=7.5, fontName='Courier', textColor=NEON_RED,    leading=10)
    styles['rarity_cosmic']    = ParagraphStyle('rarity_cosmic',    parent=base['Normal'], fontSize=7.5, fontName='Courier', textColor=NEON_CYAN,   leading=10)
    styles['quote'] = ParagraphStyle(
        'quote', parent=base['Normal'],
        fontSize=8, fontName='Courier-Oblique',
        textColor=DIM_GREY, leftIndent=18, spaceAfter=4, leading=12,
    )
    styles['footer'] = ParagraphStyle(
        'footer', parent=base['Normal'],
        fontSize=7, fontName='Courier',
        textColor=DIM_GREY, alignment=TA_CENTER, leading=10,
    )

    return styles


def rarity_color(rarity):
    r = rarity.lower()
    return {
        'common':    SOFT_WHITE,
        'uncommon':  NEON_GREEN,
        'rare':      NEON_CYAN,
        'epic':      NEON_AMBER,
        'legendary': NEON_PURPLE,
        'mythic':    NEON_RED,
        'cosmic':    NEON_BLUE,
    }.get(r, SOFT_WHITE)


def hr(color=PANEL_BORDER):
    return HRFlowable(width='100%', thickness=0.5, color=color, spaceAfter=6, spaceBefore=6)


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_FILE,
        pagesize=letter,
        leftMargin=0.65*inch, rightMargin=0.65*inch,
        topMargin=0.75*inch, bottomMargin=0.75*inch,
        title='LOT Badges & Achievements Master Codex v39',
        author='Vadik Marmeladov — LOT Systems',
        subject='RPG · Arcade · Self-Care Badge Universe',
    )

    S = make_styles()
    story = []

    # ─── COVER PAGE ────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph('L · O · T   S Y S T E M S', S['cover_title']))
    story.append(Paragraph('BADGES &amp; ACHIEVEMENTS MASTER CODEX', S['cover_title']))
    story.append(Paragraph('VERSION 39', S['cover_title']))
    story.append(Spacer(1, 0.2*inch))

    cover_art = (
        'THE OPERATOR\'S HANDBOOK\n'
        'Word Turn Engine v29\n\n'
        '  ▓·○·▓   DEEP COVER         [UNCOMMON]\n'
        '  ─·■·─   FIELD REPORT       [COMMON]\n'
        '  →·○·→   EXFIL ROUTE        [RARE]\n'
        '  ·○·      GHOST PROTOCOL     [EPIC]\n'
        '  ■·◈·■   EYES ONLY          [MYTHIC]\n'
        '  ◈·■·◈·∞ TWENTY-NINE REGS   [COSMIC]\n\n'
        '  v38 → v39: +31 badges  (998 → 1029 total)'
    )
    story.append(Preformatted(cover_art, S['mono']))
    story.append(Spacer(1, 0.15*inch))

    story.append(Paragraph('RPG · ARCADE · SCI-FI · SPY FICTION · SELF-CARE OPS', S['cover_sub']))
    story.append(Paragraph('"THE JOURNAL IS THE FIELD. THE ENTRY IS THE MISSION REPORT. THE OPERATOR IS YOU."', S['cover_sub']))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph('© 2025–2026 LOT Systems Corporation — LOT® Founded 7 April 2016', S['cover_meta']))
    story.append(Paragraph('Vadik Marmeladov, CEO &amp; Founder · brand.lot-systems.com', S['cover_meta']))
    story.append(Paragraph('August 2026 · 1029 Badges Total', S['cover_meta']))
    story.append(PageBreak())

    # ─── BADGE SYSTEM OVERVIEW ─────────────────────────────────────────────────
    story.append(Paragraph('BADGE SYSTEM OVERVIEW — v39', S['h1']))
    story.append(hr(NEON_CYAN))

    overview_data = [
        ['Category', 'Count', 'Description'],
        ['Milestone',         '22',   'Streak days (v1–v4)'],
        ['Time Easter Eggs',  '31',   'Check-in at special hours (v1–v22)'],
        ['Calendar Easter',   '91',   'Check-in on special dates (v1–v27)'],
        ['Word Turns',        '348',  'Words detected in journals/memory (v1–v29)'],
        ['Behavioral',        '102',  'Patterns over time (v1–v26)'],
        ['Achievement RPG',   '162',  'Milestone combinations (v1–v27)'],
        ['Mastery Tiers',     '116',  'Epic depth milestones (v1–v29)'],
        ['Secret Boss',       '104',  'Hidden LEGENDARY/MYTHIC triggers (v1–v26)'],
        ['TOTAL',             '1029', 'The complete LOT Badge Universe — v39'],
    ]
    col_w = [2.0*inch, 0.7*inch, 4.5*inch]
    t = Table(overview_data, colWidths=col_w)
    t.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,0),  PANEL_BORDER),
        ('TEXTCOLOR',    (0,0), (-1,0),  NEON_CYAN),
        ('FONTNAME',     (0,0), (-1,0),  'Courier-Bold'),
        ('FONTSIZE',     (0,0), (-1,-1), 8),
        ('FONTNAME',     (0,1), (-1,-1), 'Courier'),
        ('TEXTCOLOR',    (0,1), (-1,-1), SOFT_WHITE),
        ('BACKGROUND',   (0,-1),(-1,-1), BG_PANEL),
        ('TEXTCOLOR',    (0,-1),(-1,-1), NEON_GREEN),
        ('FONTNAME',     (0,-1),(-1,-1), 'Courier-Bold'),
        ('ROWBACKGROUNDS',(0,1),(-1,-2), [BG_DARK, BG_PANEL]),
        ('GRID',         (0,0), (-1,-1), 0.3, PANEL_BORDER),
        ('TOPPADDING',   (0,0), (-1,-1), 4),
        ('BOTTOMPADDING',(0,0), (-1,-1), 4),
        ('LEFTPADDING',  (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.15*inch))

    # ─── VERSION HISTORY ───────────────────────────────────────────────────────
    story.append(Paragraph('VERSION HISTORY', S['h1']))
    story.append(hr(NEON_GREEN))

    vh_data = [
        ['Version', 'Theme',                    'New', 'Total', 'Date'],
        ['v1–v10',  'Core / Water / Arcade',    '+310','310',   '2023–2024'],
        ['v11–v20', 'Alchemy / Space / Sci-Fi', '+310','620',   '2024–2025'],
        ['v21',     'Cyberspace Codex',          '+31', '651',   '2025'],
        ['v22–v32', 'Hero\'s Journey / Codex',  '+161','812',   '2026-01'],
        ['v33',     'The Stoic Codex',           '+31', '843',   '2026-08-08'],
        ['v34',     'The Simulation',            '+31', '874',   '2026-08-09'],
        ['v35',     'The Body Map',              '+31', '905',   '2026-08-10'],
        ['v36',     'The Dungeon Crawler',       '+31', '936',   '2026-08-11'],
        ['v37',     'The Time Machine',          '+31', '967',   '2026-08-16'],
        ['v38',     'The Dream Journal',         '+31', '998',   '2026-08-20'],
        ['v39',     'The Operator\'s Handbook',  '+31', '1029',  '2026-08-26'],
    ]
    vh_col_w = [0.7*inch, 2.5*inch, 0.6*inch, 0.7*inch, 1.4*inch]
    vh_t = Table(vh_data, colWidths=vh_col_w)
    vh_t.setStyle(TableStyle([
        ('BACKGROUND',   (0,0), (-1,0),   PANEL_BORDER),
        ('TEXTCOLOR',    (0,0), (-1,0),   NEON_CYAN),
        ('FONTNAME',     (0,0), (-1,0),   'Courier-Bold'),
        ('FONTSIZE',     (0,0), (-1,-1),  7.5),
        ('FONTNAME',     (0,1), (-1,-1),  'Courier'),
        ('TEXTCOLOR',    (0,1), (-1,-1),  SOFT_WHITE),
        ('TEXTCOLOR',    (1,-1),( 1,-1),  NEON_GREEN),
        ('FONTNAME',     (0,-1),(-1,-1),  'Courier-Bold'),
        ('TEXTCOLOR',    (0,-1),(-1,-1),  NEON_AMBER),
        ('ROWBACKGROUNDS',(0,1),(-1,-2),  [BG_DARK, BG_PANEL]),
        ('GRID',         (0,0), (-1,-1),  0.3, PANEL_BORDER),
        ('TOPPADDING',   (0,0), (-1,-1),  3),
        ('BOTTOMPADDING',(0,0), (-1,-1),  3),
        ('LEFTPADDING',  (0,0), (-1,-1),  5),
    ]))
    story.append(vh_t)
    story.append(PageBreak())

    # ─── WORD TURN v29 — THE OPERATOR'S HANDBOOK ───────────────────────────────
    story.append(Paragraph("WORD TURN v29 — THE OPERATOR'S HANDBOOK", S['h1']))
    story.append(hr(NEON_CYAN))
    story.append(Paragraph(
        '"Every intelligence operation begins with a field report. Every self-care practice '
        'begins with an honest account of where you are. The journal is the field report. '
        'You are the operative. The mission is staying alive and well in the field of your own life."',
        S['quote']
    ))
    story.append(Spacer(1, 0.1*inch))

    badges_v29 = [
        ('deep_cover',        '▓·○·▓',  'deep cover / undercover / going dark',           'UNCOMMON'),
        ('field_report',      '─·■·─',  'field report / sitrep / situation report',        'COMMON'),
        ('assets_secured',    '◈·●·◈',  'assets secured / locked down / protected',        'UNCOMMON'),
        ('blown_cover',       '●·!·●',  'blown / exposed / cover blown / caught out',      'RARE'),
        ('exfil_route',       '→·○·→',  'exfil / extraction / escape route',               'RARE'),
        ('handler_brief',     '○·■·○',  'handler / briefing / mission briefing',           'UNCOMMON'),
        ('need_to_know',      '■·?·■',  'need to know / classified / restricted access',   'RARE'),
        ('dead_drop',         '○·▓',    'dead drop / left a note / passed it on',          'EPIC'),
        ('clean_slate',       '□·○·□',  'clean slate / wiped / starting fresh / reset',    'RARE'),
        ('burn_notice',       '●·∅·●',  'burn notice / burned / gone dark / terminated',   'EPIC'),
        ('ghost_protocol',    '·○·',    'ghost protocol / shadow mode / no trace',         'EPIC'),
        ('mission_complete',  '■→●',    'mission complete / objective reached',             'RARE'),
    ]

    badge_data = [['Badge ID', 'Symbol', 'Trigger Words', 'Rarity']]
    for bid, sym, trg, rar in badges_v29:
        badge_data.append([bid, sym, trg, rar])

    bt = Table(badge_data, colWidths=[1.5*inch, 0.7*inch, 3.4*inch, 0.9*inch])
    bt.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  PANEL_BORDER),
        ('TEXTCOLOR',     (0,0), (-1,0),  NEON_CYAN),
        ('FONTNAME',      (0,0), (-1,0),  'Courier-Bold'),
        ('FONTSIZE',      (0,0), (-1,-1), 7.5),
        ('FONTNAME',      (0,1), (-1,-1), 'Courier'),
        ('TEXTCOLOR',     (0,1), (-1,-1), SOFT_WHITE),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [BG_DARK, BG_PANEL]),
        ('GRID',          (0,0), (-1,-1), 0.3, PANEL_BORDER),
        ('TOPPADDING',    (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING',   (0,0), (-1,-1), 5),
    ]))
    # Color rarity column
    for i, (_, _, _, rar) in enumerate(badges_v29, start=1):
        bt.setStyle(TableStyle([
            ('TEXTCOLOR', (3,i), (3,i), rarity_color(rar)),
            ('FONTNAME',  (3,i), (3,i), 'Courier-Bold'),
        ]))
    story.append(bt)
    story.append(Spacer(1, 0.12*inch))

    # ─── CALENDAR EASTER EGGS v27 ───────────────────────────────────────────────
    story.append(Paragraph('CALENDAR EASTER EGGS v27 — THE OPS CALENDAR', S['h2']))
    story.append(hr())
    cal_v27 = [
        ['bond_day',      '■·∅·■',  'Jan 13', 'Ian Fleming born 1908',                 'RARE'],
        ['spy_wednesday', '▓·■·▓',  'Nov 5',  'Guy Fawkes Night — the spy who almost', 'UNCOMMON'],
        ['le_carre_day',  '○·■·○',  'Oct 19', 'John le Carré born 1931',               'RARE'],
    ]
    cal_data = [['Badge ID', 'Symbol', 'Date', 'Significance', 'Rarity']] + cal_v27
    ct = Table(cal_data, colWidths=[1.3*inch, 0.7*inch, 0.6*inch, 2.9*inch, 0.9*inch])
    ct.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  PANEL_BORDER),
        ('TEXTCOLOR',     (0,0), (-1,0),  NEON_AMBER),
        ('FONTNAME',      (0,0), (-1,0),  'Courier-Bold'),
        ('FONTSIZE',      (0,0), (-1,-1), 7.5),
        ('FONTNAME',      (0,1), (-1,-1), 'Courier'),
        ('TEXTCOLOR',     (0,1), (-1,-1), SOFT_WHITE),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [BG_DARK, BG_PANEL]),
        ('GRID',          (0,0), (-1,-1), 0.3, PANEL_BORDER),
        ('TOPPADDING',    (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING',   (0,0), (-1,-1), 5),
    ]))
    for i, row in enumerate(cal_v27, start=1):
        ct.setStyle(TableStyle([('TEXTCOLOR', (4,i), (4,i), rarity_color(row[4]))]))
    story.append(ct)
    story.append(Spacer(1, 0.1*inch))

    # ─── BEHAVIORAL EASTER EGGS v26 ─────────────────────────────────────────────
    story.append(Paragraph('BEHAVIORAL EASTER EGGS v26 — FIELD PATTERNS', S['h2']))
    story.append(hr())
    beh_data = [
        ['Badge ID',          'Symbol',  'Trigger',                                          'Rarity'],
        ['operator_session',  '▓·■·▓',  '3+ distinct Operator (v29) words in one entry',    'RARE'],
        ['mission_log',       '─·■·○',  '5+ journal entries in one calendar week',           'UNCOMMON'],
        ['dark_hours',        '·○·',    'Check in 02:00–04:00 local time',                   'EPIC'],
    ]
    bht = Table(beh_data, colWidths=[1.5*inch, 0.7*inch, 3.4*inch, 0.9*inch])
    bht.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  PANEL_BORDER),
        ('TEXTCOLOR',     (0,0), (-1,0),  NEON_GREEN),
        ('FONTNAME',      (0,0), (-1,0),  'Courier-Bold'),
        ('FONTSIZE',      (0,0), (-1,-1), 7.5),
        ('FONTNAME',      (0,1), (-1,-1), 'Courier'),
        ('TEXTCOLOR',     (0,1), (-1,-1), SOFT_WHITE),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [BG_DARK, BG_PANEL]),
        ('GRID',          (0,0), (-1,-1), 0.3, PANEL_BORDER),
        ('TOPPADDING',    (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING',   (0,0), (-1,-1), 5),
    ]))
    for i, row in enumerate(beh_data[1:], start=1):
        bht.setStyle(TableStyle([('TEXTCOLOR', (3,i), (3,i), rarity_color(row[3]))]))
    story.append(bht)
    story.append(Spacer(1, 0.1*inch))

    # ─── ACHIEVEMENT RPG v27 ────────────────────────────────────────────────────
    story.append(Paragraph('ACHIEVEMENT RPG v27 — FIELD CLASS', S['h2']))
    story.append(hr())
    ach_data = [
        ['Badge ID',                  'Symbol',   'Requirement',                                  'Rarity'],
        ['field_entry',               '○→■',      'Earn any 1 Word Turn v29 badge',               'COMMON'],
        ['field_class',               '≈→■',      'Earn any 5 Word Turn v29 badges',              'UNCOMMON'],
        ['field_complete',            '≋→■',      'Earn all 12 Word Turn v29 badges',             'LEGENDARY'],
        ['operator_arc',              '■·◈',      'field_complete + all 3 Calendar v27 badges',   'LEGENDARY'],
        ['twenty_nine_engines_arc',   '◈·◈·■',   '1 badge from each Word Turn engine v1–v29',   'LEGENDARY'],
        ['mission_opus',              '■·◉·■',   'field_complete + operator_session behavioral',  'LEGENDARY'],
    ]
    at = Table(ach_data, colWidths=[1.8*inch, 0.7*inch, 3.0*inch, 0.9*inch])
    at.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  PANEL_BORDER),
        ('TEXTCOLOR',     (0,0), (-1,0),  NEON_PURPLE),
        ('FONTNAME',      (0,0), (-1,0),  'Courier-Bold'),
        ('FONTSIZE',      (0,0), (-1,-1), 7.5),
        ('FONTNAME',      (0,1), (-1,-1), 'Courier'),
        ('TEXTCOLOR',     (0,1), (-1,-1), SOFT_WHITE),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [BG_DARK, BG_PANEL]),
        ('GRID',          (0,0), (-1,-1), 0.3, PANEL_BORDER),
        ('TOPPADDING',    (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING',   (0,0), (-1,-1), 5),
    ]))
    for i, row in enumerate(ach_data[1:], start=1):
        at.setStyle(TableStyle([('TEXTCOLOR', (3,i), (3,i), rarity_color(row[3]))]))
    story.append(at)
    story.append(Spacer(1, 0.1*inch))

    # ─── MASTERY TIERS v29 ──────────────────────────────────────────────────────
    story.append(Paragraph('MASTERY TIER v29 — THE DEBRIEF', S['h2']))
    story.append(hr())
    mas_data = [
        ['Badge ID',                'Symbol',      'Requirement',                           'Rarity'],
        ['station_chief',           '■·∞·◉',      '1,400+ distinct check-in days',          'EPIC'],
        ['the_dossier',             '●·∞·■',      '600,000+ total journal words',            'LEGENDARY'],
        ['senior_operative',        '╔═╗·■',      'Account age >= 12 years (4,380+ days)',   'LEGENDARY'],
        ['twenty_nine_registers',   '◈·■·◈·∞',   '1 badge from all 29 Word Turn engines',  'COSMIC'],
    ]
    mt = Table(mas_data, colWidths=[1.7*inch, 0.9*inch, 2.9*inch, 0.9*inch])
    mt.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  PANEL_BORDER),
        ('TEXTCOLOR',     (0,0), (-1,0),  NEON_AMBER),
        ('FONTNAME',      (0,0), (-1,0),  'Courier-Bold'),
        ('FONTSIZE',      (0,0), (-1,-1), 7.5),
        ('FONTNAME',      (0,1), (-1,-1), 'Courier'),
        ('TEXTCOLOR',     (0,1), (-1,-1), SOFT_WHITE),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [BG_DARK, BG_PANEL]),
        ('GRID',          (0,0), (-1,-1), 0.3, PANEL_BORDER),
        ('TOPPADDING',    (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING',   (0,0), (-1,-1), 5),
    ]))
    for i, row in enumerate(mas_data[1:], start=1):
        mt.setStyle(TableStyle([('TEXTCOLOR', (3,i), (3,i), rarity_color(row[3]))]))
    story.append(mt)
    story.append(Spacer(1, 0.1*inch))

    # ─── SECRET BOSS v26 ────────────────────────────────────────────────────────
    story.append(Paragraph('SECRET BOSS v26 — THE BLACK OPS VAULT', S['h2']))
    story.append(hr())
    sec_data = [
        ['Badge ID',        'Symbol',  'Trigger',                                    'Rarity'],
        ['fleming_signal',  '■·∅·■',  'James Bond / Ian Fleming / double-oh / 007',  'RARE'],
        ['le_carre_word',   '○·■·○',  'Smiley / John le Carré / Karla / the Circus', 'EPIC'],
        ['eyes_only',       '■·◈·■',  'for your eyes only / EYES ONLY',              'MYTHIC'],
    ]
    st = Table(sec_data, colWidths=[1.3*inch, 0.7*inch, 3.5*inch, 0.9*inch])
    st.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  PANEL_BORDER),
        ('TEXTCOLOR',     (0,0), (-1,0),  NEON_RED),
        ('FONTNAME',      (0,0), (-1,0),  'Courier-Bold'),
        ('FONTSIZE',      (0,0), (-1,-1), 7.5),
        ('FONTNAME',      (0,1), (-1,-1), 'Courier'),
        ('TEXTCOLOR',     (0,1), (-1,-1), SOFT_WHITE),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [BG_DARK, BG_PANEL]),
        ('GRID',          (0,0), (-1,-1), 0.3, PANEL_BORDER),
        ('TOPPADDING',    (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING',   (0,0), (-1,-1), 5),
    ]))
    for i, row in enumerate(sec_data[1:], start=1):
        st.setStyle(TableStyle([('TEXTCOLOR', (3,i), (3,i), rarity_color(row[3]))]))
    story.append(st)
    story.append(PageBreak())

    # ─── ASCII EASTER EGG GALLERY ───────────────────────────────────────────────
    story.append(Paragraph('ASCII EASTER EGG GALLERY', S['h1']))
    story.append(hr(NEON_CYAN))

    ascii_art = (
        '+----------------------------------------------------------+\n'
        '| BADGE UNLOCKED                                           |\n'
        '|                                                          |\n'
        '|  [##.o.##]  DEEP COVER  [UNCOMMON]                      |\n'
        '|  -> Going dark is sometimes the only move.              |\n'
        '|     The operative who knows when to disappear           |\n'
        '|     knows when to reappear. The journal marks both.     |\n'
        '|                                                          |\n'
        '|  [-.#.-]  FIELD REPORT  [COMMON]                        |\n'
        '|  -> A sitrep is not a complaint.                        |\n'
        '|     It is an honest account of what is.                 |\n'
        '|     File it. The handler is listening.                  |\n'
        '|                                                          |\n'
        '|  [o.0.o]  BURN NOTICE  [EPIC]                           |\n'
        '|  -> To be burned is to be released.                     |\n'
        '|     Write the notice. The file closes.                  |\n'
        '|                                                          |\n'
        '|  [#.*.#]  EYES ONLY  [MYTHIC][HIDDEN]                   |\n'
        '|  -> The most restricted document.                       |\n'
        '|     For your eyes only. No one else is cleared. Good.   |\n'
        '|                                                          |\n'
        '|  [*.*.*.*]  TWENTY-NINE REGISTERS  [COSMIC]             |\n'
        '|  -> Water. Arcade. Radio. Biology. Cyberspace.          |\n'
        '|     Hero. Dungeon. Dream. Operator.                     |\n'
        '|     Twenty-nine vocabularies. The terminal complete.    |\n'
        '+----------------------------------------------------------+'
    )
    story.append(Preformatted(ascii_art, S['mono']))
    story.append(Spacer(1, 0.15*inch))

    # ─── RARITY SCALE ───────────────────────────────────────────────────────────
    story.append(Paragraph('RARITY SCALE', S['h2']))
    story.append(hr())
    rarity_rows = [
        ('COMMON',    'frequent, accessible, first encounters'),
        ('UNCOMMON',  'requires intention or multiple sessions'),
        ('RARE',      'significant writing or behavioral threshold'),
        ('EPIC',      'long-term commitment or deep engagement'),
        ('LEGENDARY', 'mastery-level completion or years of practice'),
        ('MYTHIC',    'hidden, secret, requires specific knowledge'),
        ('COSMIC',    'highest tier: cross-engine or system mastery'),
    ]
    rar_table_data = [['Rarity', 'Description']]
    for r, d in rarity_rows:
        rar_table_data.append([r, d])
    rart = Table(rar_table_data, colWidths=[1.2*inch, 5.3*inch])
    rart.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),  PANEL_BORDER),
        ('TEXTCOLOR',     (0,0), (-1,0),  SOFT_WHITE),
        ('FONTNAME',      (0,0), (-1,0),  'Courier-Bold'),
        ('FONTSIZE',      (0,0), (-1,-1), 8),
        ('FONTNAME',      (0,1), (-1,-1), 'Courier-Bold'),
        ('TEXTCOLOR',     (0,1), (-1,-1), SOFT_WHITE),
        ('ROWBACKGROUNDS',(0,1), (-1,-1), [BG_DARK, BG_PANEL]),
        ('GRID',          (0,0), (-1,-1), 0.3, PANEL_BORDER),
        ('TOPPADDING',    (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING',   (0,0), (-1,-1), 6),
    ]))
    for i, (r, _) in enumerate(rarity_rows, start=1):
        rart.setStyle(TableStyle([('TEXTCOLOR', (0,i), (0,i), rarity_color(r))]))
    story.append(rart)
    story.append(Spacer(1, 0.15*inch))

    # ─── WORD TURN ENGINE INDEX ──────────────────────────────────────────────────
    story.append(Paragraph('WORD TURN ENGINE INDEX (v1–v29)', S['h1']))
    story.append(hr(NEON_GREEN))

    engine_data = [
        ['Engine', 'Theme',                    'Signature Words'],
        ['v1',  'Core / Ritual',               'ritual / breathe / ocean / LOT'],
        ['v2',  'Sci-Fi Arcade',               'reboot / 404 / glitch / quantum'],
        ['v3',  'Signal Codex',                'solitude / wonder / phoenix / orbit'],
        ['v4',  'The Becoming',                'surrender / restore / anchor / threshold'],
        ['v5',  'Rogue Archive',               'loot / boss / respawn / dungeon'],
        ['v6',  'The Becoming II',             'compile / buffer / patch / fork'],
        ['v7',  'The Mainframe',               'terminal / stack / execute / cache'],
        ['v8',  'The Arcade Cabinet',          'coin / pixel / score / life'],
        ['v9',  'The Arcade Cabinet II',       'joystick / sprite / bonus / cheat'],
        ['v10', 'The Spell Book',              'spell / grimoire / mana / arcane'],
        ['v11', 'The Navigator',               'drift / vector / bearing / meridian'],
        ['v12', 'The Alchemist',               'transmute / crucible / elixir / catalyst'],
        ['v14', 'The Starship Deck',           'launch / astronaut / telemetry / crew'],
        ['v15', 'The Oracle Archive',          'oracle / rune / prophecy / convergence'],
        ['v16', 'The Quantum Library',         'entangle / singularity / cyberspace'],
        ['v17', 'The Neon Arcade',             'neon / combo / highscore / checkpoint'],
        ['v18', 'The Midnight Radio',          'frequency / broadcast / wavelength'],
        ['v19', 'The Bio-Terminal',            'pulse / cortisol / circadian / dopamine'],
        ['v20', 'The Codex Reader',            'asimov / dune / orwell / bradbury'],
        ['v21', 'The Cyberspace Codex',        'matrix / grok / ansible / spice'],
        ['v22', "The Hero's Journey",          'call / threshold / mentor / ordeal'],
        ['v23', 'The Stoic Codex',             'memento mori / amor fati / logos'],
        ['v24', 'The Simulation',              'simulation / glitch / unplug / ground'],
        ['v25', 'The Body Map',                'soma / vessel / interoception'],
        ['v26', 'The Dungeon Crawler',         'dungeon / boss / loot / rest point'],
        ['v27', 'The Time Machine',            'timeline / temporal / past self / epoch'],
        ['v28', 'The Dream Journal',           'lucid / oneiric / hypnagogic / dream'],
        ['v29', "The Operator's Handbook [NEW]",'deep cover / sitrep / burn notice / exfil'],
    ]
    et = Table(engine_data, colWidths=[0.5*inch, 2.0*inch, 4.0*inch])
    et.setStyle(TableStyle([
        ('BACKGROUND',    (0,0),  (-1,0),   PANEL_BORDER),
        ('TEXTCOLOR',     (0,0),  (-1,0),   NEON_CYAN),
        ('FONTNAME',      (0,0),  (-1,0),   'Courier-Bold'),
        ('FONTSIZE',      (0,0),  (-1,-1),  7.5),
        ('FONTNAME',      (0,1),  (-1,-2),  'Courier'),
        ('TEXTCOLOR',     (0,1),  (-1,-2),  SOFT_WHITE),
        ('FONTNAME',      (0,-1), (-1,-1),  'Courier-Bold'),
        ('TEXTCOLOR',     (0,-1), (-1,-1),  NEON_GREEN),
        ('ROWBACKGROUNDS',(0,1),  (-1,-2),  [BG_DARK, BG_PANEL]),
        ('BACKGROUND',    (0,-1), (-1,-1),  HexColor('#0d1a0d')),
        ('GRID',          (0,0),  (-1,-1),  0.3, PANEL_BORDER),
        ('TOPPADDING',    (0,0),  (-1,-1),  3),
        ('BOTTOMPADDING', (0,0),  (-1,-1),  3),
        ('LEFTPADDING',   (0,0),  (-1,-1),  5),
    ]))
    story.append(et)
    story.append(PageBreak())

    # ─── FULL BADGE UNIVERSE SNAPSHOT ───────────────────────────────────────────
    story.append(Paragraph('FULL BADGE UNIVERSE — v39 SNAPSHOT', S['h1']))
    story.append(hr(NEON_CYAN))

    snapshot = (
        'MILESTONE              22   Day streaks (7/14/21/30/50/60/90/100/180/365+)\n'
        'TIME EASTER EGGS       31   Hour-specific check-ins (22 time systems)\n'
        'CALENDAR EASTER        91   Date-specific check-ins (27 calendar systems)\n'
        'WORD TURNS            348   Journal/memory keyword detection (v1-v29)\n'
        'BEHAVIORAL            102   Multi-session behavioral patterns (v1-v26)\n'
        'ACHIEVEMENT RPG       162   Milestone combination achievements (v1-v27)\n'
        'MASTERY TIERS         116   Deep-time milestones (v1-v29)\n'
        'SECRET BOSS           104   Hidden word triggers (v1-v26)\n'
        '----------------\n'
        'TOTAL                1029   The LOT Badge Universe -- v39'
    )
    story.append(Preformatted(snapshot, S['mono']))
    story.append(Spacer(1, 0.15*inch))

    # ─── FLAVOR TEXT ────────────────────────────────────────────────────────────
    story.append(Paragraph('FLAVOR TEXT — THE OPERATOR\'S HANDBOOK', S['h2']))
    story.append(hr())
    quotes = [
        '"Once is happenstance. Twice is coincidence. The third time it\'s enemy action." — Ian Fleming, Goldfinger. The self-care version: the first missed day is chance, the second is a pattern beginning, the third is a message worth reading. File the report.',
        '"The truth is that Smiley had loved the Service." — John le Carré, Tinker Tailor Soldier Spy. What do you love enough to stay loyal to through the long, unglamorous years? Write it.',
        '"Going dark doesn\'t mean going away. It means the frequencies have shifted." — practitioner note. The terminal receives you on every channel.',
        '"The mission is never finished. The debrief is part of the mission." — Operator\'s Handbook, v29. The entry after the entry is where the real intelligence lives.',
    ]
    for q in quotes:
        story.append(Paragraph(q, S['quote']))

    story.append(Spacer(1, 0.15*inch))

    # ─── SESSION METADATA ───────────────────────────────────────────────────────
    story.append(Paragraph('SESSION METADATA', S['h2']))
    story.append(hr())
    meta_art = (
        'SESSION    : LOT-SR-20260826-CODEX-v39\n'
        'VERSION    : v39\n'
        'DATE       : 2026-08-26\n'
        'TOTAL BADGES: 1029 (v38: 998 -> v39: 1029, +31)\n'
        'CODEX CLASS : FIELD OPERATIONS ENGINEERING\n'
        'AUTHORIZED BY: S-2 // VADIK MARMELADOV\n'
        'BRANCH     : claude/quantum-engine-widgets-RgFfC'
    )
    story.append(Preformatted(meta_art, S['mono']))
    story.append(Spacer(1, 0.15*inch))

    # ─── FOOTER ─────────────────────────────────────────────────────────────────
    story.append(hr(DIM_GREY))
    story.append(Paragraph(
        'LOT SYSTEMS CORPORATION — LOT® Founded 7 April 2016 | © 2025–2026 All Rights Reserved',
        S['footer']
    ))
    story.append(Paragraph(
        'The journal is the field. The entry is the mission report. The operator is you. 1029 badges. Every one earned.',
        S['footer']
    ))

    doc.build(story)
    print(f'PDF generated: {OUTPUT_FILE}')


if __name__ == '__main__':
    build_pdf()
