#!/usr/bin/env python3
"""
LOT SYSTEMS CORPORATION
LOT® Badges & Achievements Master Codex v10 — PDF Generator
Author: Vadik Marmeladov
"""

import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

# ── PALETTE ──────────────────────────────────────────────────────────────────
BG        = colors.HexColor('#0a0a0f')
FG        = colors.HexColor('#e8e8f0')
ACCENT    = colors.HexColor('#4488cc')
GOLD      = colors.HexColor('#ffcc44')
MYTHIC    = colors.HexColor('#ff6644')
LEGENDARY = colors.HexColor('#ffcc44')
EPIC      = colors.HexColor('#cc88ee')
RARE      = colors.HexColor('#8888ee')
UNCOMMON  = colors.HexColor('#88cc88')
COMMON    = colors.HexColor('#aaaaaa')
ULTRARARE = colors.HexColor('#ff44ff')
DIM       = colors.HexColor('#555566')
WHITE     = colors.HexColor('#ffffff')
PANEL     = colors.HexColor('#111122')
BORDER    = colors.HexColor('#223355')

PAGE_W, PAGE_H = A4

OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__),
    '../docs/badges/pdf/LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v10.pdf'
)


def build_styles():
    base = getSampleStyleSheet()

    def s(name, parent='Normal', **kw):
        return ParagraphStyle(name, parent=base[parent], **kw)

    return {
        'title': s('Title', fontSize=22, textColor=GOLD, alignment=TA_CENTER,
                   spaceAfter=2, fontName='Courier-Bold'),
        'subtitle': s('Subtitle', fontSize=11, textColor=ACCENT, alignment=TA_CENTER,
                      spaceAfter=1, fontName='Courier'),
        'meta': s('Meta', fontSize=8, textColor=DIM, alignment=TA_CENTER,
                  spaceAfter=6, fontName='Courier'),
        'h1': s('H1', fontSize=13, textColor=GOLD, spaceBefore=10, spaceAfter=4,
                fontName='Courier-Bold'),
        'h2': s('H2', fontSize=11, textColor=ACCENT, spaceBefore=8, spaceAfter=3,
                fontName='Courier-Bold'),
        'h3': s('H3', fontSize=9, textColor=UNCOMMON, spaceBefore=5, spaceAfter=2,
                fontName='Courier-Bold'),
        'body': s('Body', fontSize=8, textColor=FG, fontName='Courier',
                  spaceAfter=2, leading=12),
        'code': s('Code', fontSize=7.5, textColor=FG, fontName='Courier',
                  spaceAfter=1, leading=11, backColor=PANEL,
                  borderPadding=4),
        'badge_name': s('BadgeName', fontSize=9, textColor=WHITE,
                        fontName='Courier-Bold', spaceAfter=1),
        'unlock': s('Unlock', fontSize=7.5, textColor=UNCOMMON,
                    fontName='Courier', spaceAfter=3, leftIndent=12),
        'quote': s('Quote', fontSize=9, textColor=ACCENT,
                   fontName='Courier-BoldOblique', alignment=TA_CENTER,
                   spaceBefore=4, spaceAfter=4),
        'footer': s('Footer', fontSize=7, textColor=DIM, alignment=TA_CENTER,
                    fontName='Courier'),
    }


def hr(color=BORDER, thickness=0.5):
    return HRFlowable(width='100%', thickness=thickness, color=color,
                      spaceBefore=3, spaceAfter=3)


def section(story, styles, title):
    story.append(Spacer(1, 4*mm))
    story.append(hr(ACCENT, 1))
    story.append(Paragraph(title, styles['h1']))
    story.append(hr(BORDER, 0.5))


def badge_table(data, col_widths, rarity_col=None):
    """Build a styled badge table."""
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), PANEL),
        ('TEXTCOLOR', (0, 0), (-1, 0), ACCENT),
        ('FONTNAME', (0, 0), (-1, -1), 'Courier'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('FONTNAME', (0, 0), (-1, 0), 'Courier-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('GRID', (0, 0), (-1, -1), 0.3, BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BG, PANEL]),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ]
    if rarity_col is not None:
        rarity_colors = {
            'Common': COMMON, 'Uncommon': UNCOMMON, 'Rare': RARE,
            'Epic': EPIC, 'Legendary': LEGENDARY, 'Mythic': MYTHIC,
            'Ultra-Rare': ULTRARARE
        }
        for row_idx, row in enumerate(data[1:], start=1):
            if len(row) > rarity_col:
                rarity = str(row[rarity_col])
                c = rarity_colors.get(rarity, FG)
                style.append(('TEXTCOLOR', (rarity_col, row_idx),
                               (rarity_col, row_idx), c))
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle(style))
    return t


def build_pdf():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=15*mm, rightMargin=15*mm,
        topMargin=15*mm, bottomMargin=15*mm,
        title='LOT Badges & Achievements Master Codex v10',
        author='Vadik Marmeladov — LOT Systems',
    )

    styles = build_styles()
    story = []

    # ── COVER ─────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 8*mm))
    story.append(hr(GOLD, 2))
    story.append(Spacer(1, 3*mm))

    for line in [
        'L · O · T   S Y S T E M S',
        'BADGES & ACHIEVEMENTS',
        'MASTER CODEX  v10',
    ]:
        story.append(Paragraph(line, styles['title']))

    story.append(Spacer(1, 2*mm))
    story.append(Paragraph('RPG · ARCADE · SELF-CARE · SCI-FI · COMPUTER', styles['subtitle']))
    story.append(Paragraph(
        f'June 2026 Edition  |  © 2025–2026 LOT Systems  |  brand.lot-systems.com',
        styles['meta']
    ))
    story.append(Spacer(1, 2*mm))
    story.append(hr(GOLD, 2))
    story.append(Spacer(1, 4*mm))

    story.append(Paragraph(
        '"Self-care is not a quest you complete. It is a world you build."',
        styles['quote']
    ))

    # INVENTORY SUMMARY TABLE
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('BADGE INVENTORY — COMPLETE ACCOUNTING', styles['h2']))
    inv_data = [
        ['Category', 'Count', 'Notes'],
        ['Milestone (Core)', '3', 'Day 7, 30, 100'],
        ['Milestone (Extended)', '7', 'Day 14/21/50/60/90/180/365'],
        ['Easter Egg — Time', '8', 'v1: 4  +  v2: 4'],
        ['Easter Egg — Calendar', '8', 'Solstice, Equinox, Birthday…'],
        ['Easter Egg — Behavioral', '5', 'Silent, Ghost, Anniversary…'],
        ['Word Turn', '30', 'v1: 12  +  v2: 18 new'],
        ['Pattern (Oceanic Mayan)', '5', 'Balanced/Flow/Consistent…'],
        ['Achievement (RPG Layer)', '14', 'Exploration/Consistency/Depth…'],
        ['New Mastery Tier', '5', 'Quantum Leap/Speedrun/SysOp…'],
        ['Secret Boss Badges', '7', 'Meta-Signal/Cosmic Twin…'],
        ['TOTAL', '92', '70 hidden · 22 visible'],
    ]
    col_w = [90*mm, 25*mm, 65*mm]
    t = badge_table(inv_data, col_w)
    # Highlight totals row
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#1a1a2e')),
        ('TEXTCOLOR', (0, -1), (-1, -1), GOLD),
        ('FONTNAME', (0, -1), (-1, -1), 'Courier-Bold'),
    ]))
    story.append(t)

    # ── PART I — MILESTONE BADGES ──────────────────────────────────────────────
    section(story, styles, 'PART I — MILESTONE BADGES')

    story.append(Paragraph('I.A — Core Milestones', styles['h2']))
    core_data = [
        ['Day', 'Water', 'Architecture', 'Name', 'Rarity', 'Message'],
        ['7',   '∘',    '├─',           'Droplet / Foundation', 'Common',    'First drops form ∘'],
        ['30',  '≈',    '╞═╡',          'Wave / Structure',     'Uncommon',  'Waves begin to flow ≈'],
        ['100', '≋',    '║·║',          'Current / Architecture','Epic',     'Deep currents established ≋'],
    ]
    story.append(badge_table(core_data, [15*mm,15*mm,22*mm,45*mm,22*mm,61*mm], rarity_col=4))

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('I.B — Extended Milestones', styles['h2']))
    ext_data = [
        ['Day', 'Water', 'Architecture', 'Name', 'Rarity'],
        ['7',   '∘',    '├─',    'Droplet / Foundation', 'Common'],
        ['14',  '∘∘',   '├┼',    'Twin Drop / Load-Bearing', 'Common'],
        ['21',  '∘≈',   '├═',    'Proto-Wave / Deep Foundation', 'Uncommon'],
        ['30',  '≈',    '╞═╡',   'Wave / Structure', 'Uncommon'],
        ['50',  '≈∘',   '╞══',   'Mid-Current / Mid-Structure', 'Rare'],
        ['60',  '≈≈',   '╞═══',  'Dual Wave / Master Frame', 'Rare'],
        ['90',  '≋∘',   '║═',    'Deep Reach / Inner Wall', 'Epic'],
        ['100', '≋',    '║·║',   'Current / Architecture', 'Epic'],
        ['180', '≋≋',   '║╞║',   'Voyager / Wing', 'Legendary'],
        ['365', '≋≋≋',  '╔═╗',   'The Long Count / Citadel', 'Legendary'],
    ]
    story.append(badge_table(ext_data, [15*mm,18*mm,22*mm,65*mm,60*mm], rarity_col=4))

    # ── PART II — EASTER EGG BADGES ───────────────────────────────────────────
    section(story, styles, 'PART II — EASTER EGG BADGES')

    story.append(Paragraph('II.A — Time-Based Easter Eggs (v1 + v2 = 8 total)', styles['h2']))
    time_data = [
        ['ID', 'Symbol', 'Trigger', 'Rarity', 'Message'],
        ['night_owl',      '◉',   '01:00–04:00 AM check-in',      'Uncommon', 'Awake when the world slept. ◉'],
        ['early_bird',     '∴',   '05:00–06:00 AM check-in',      'Uncommon', 'Dawn data. Before the noise. ∴'],
        ['mirror_hour',    '⊡',   'Check-in at exactly 11:11',    'Epic',     'The mirror looks back. ⊡'],
        ['midnight_sigil', '◉',   'Answer memory Q at 00:00',     'Rare',     'You answered in the dark. ◉'],
        ['pi_hour',        '∞∘',  'Check-in at 3:14 AM',          'Epic',     'Pi in the small hours. ∞∘'],
        ['error_hour',     '□·□', 'Check-in at 4:04 AM',          'Rare',     '404 AM — you were found. □·□'],
        ['sequence_time',  '→∘→', 'Check-in at 12:34',            'Uncommon', 'Sequential time. In order. →∘→'],
        ['lot_hour',       '≋◉',  'Check-in at 04:07 (LOT birth)', 'Rare',   'The founding hour. ≋◉'],
    ]
    story.append(badge_table(time_data, [30*mm,15*mm,48*mm,22*mm,65*mm], rarity_col=3))

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('II.B — Calendar Easter Eggs (8 total)', styles['h2']))
    cal_data = [
        ['ID', 'Symbol', 'Trigger', 'Rarity', 'Message'],
        ['solstice',       '❋',   'June 21 or December 21',          'Rare',  'The sun paused. ❋'],
        ['equinox',        '○',   'March 20 or September 22',        'Rare',  'Balance at the season edge. ○'],
        ['lot_birthday',   '◉',   'April 7 — LOT founding day',      'Rare',  'System founded 7 April 2016. ◉'],
        ['new_year_sage',  '⊛',   'January 1st',                     'Rare',  'The new cycle begins. ⊛'],
        ['pi_day',         '∞',   'March 14 (3.14)',                  'Epic',  'Infinite precision. ∞'],
        ['palindrome_day', '◈',   'Any palindrome date',              'Epic',  'Reads itself backwards. ◈'],
        ['full_moon',      '☽',   'Calendar full moon night',         'Rare',  'The tide turns. ☽'],
        ['friday_ritual',  '▪·▪', 'Four consecutive Fridays',         'Uncommon','Weekly ritual holds. ▪·▪'],
    ]
    story.append(badge_table(cal_data, [30*mm,15*mm,48*mm,22*mm,65*mm], rarity_col=3))

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('II.C — Behavioral Easter Eggs (5 total)', styles['h2']))
    behav_data = [
        ['ID', 'Symbol', 'Trigger', 'Rarity', 'Message'],
        ['silent_hour',    '─○─', '24h absence then return',      'Uncommon', 'You rested. Space held. ─○─'],
        ['ghost_protocol', '░░░', '7-day absence then return',    'Rare',     'Ghost Protocol lifted. ░░░'],
        ['anniversary',    '≋',   'Account signup anniversary',   'Rare',     'Another year in archive. ≋'],
        ['overclock',      '▒▒▒', '20+ activities in one day',   'Epic',     'OVERCLOCK DETECTED. ▒▒▒'],
        ['perfect_day',    '✦·✦', 'All 7 modules in one day',    'Legendary','All systems aligned. ✦·✦'],
    ]
    story.append(badge_table(behav_data, [30*mm,15*mm,48*mm,22*mm,65*mm], rarity_col=3))

    # ── PART III — WORD TURN ENGINE ────────────────────────────────────────────
    section(story, styles, 'PART III — WORD TURN ENGINE')

    story.append(Paragraph('III.A — Original Word Turns (v1 — 12 triggers)', styles['h2']))
    wt_v1 = [
        ['Word / Phrase', 'Symbol', 'Badge Name', 'Rarity', 'Message'],
        ['"ritual"',      '≈·≈',   'Ritual Keeper',     'Uncommon', 'You named the practice. ≈·≈'],
        ['"breathe"',     '∿·∿',   'Breath Anchor',     'Uncommon', 'Anchor holds. ∿·∿'],
        ['"grateful"',    '○·○',   'Gratitude Node',    'Uncommon', 'Signal received. ○·○'],
        ['"ocean"',       '≋·∿',   'Aquatic Resonance', 'Uncommon', 'Oceanic resonance. ≋·∿'],
        ['"stars"',       '✦·✧',   'Stargazer',         'Uncommon', 'Signal from deep space. ✦·✧'],
        ['"home"',        '—○—',   'Grounded Signal',   'Uncommon', 'You are grounded. —○—'],
        ['"dream"',       '◐·◐',   'Dream Log',         'Uncommon', 'Dream in archive. ◐·◐'],
        ['"pain"',        '▲·▲',   'Courage Pulse',     'Rare',     'Courage detected. ▲·▲'],
        ['"love"',        '♡·♡',   'Heart Signal',      'Uncommon', 'Heart signal. ♡·♡'],
        ['"silence"',     '·—·',   'The Quiet',         'Uncommon', 'It is enough. ·—·'],
        ['"future"',      '→·→',   'Horizon Seeker',    'Uncommon', 'Valid coordinate. →·→'],
        ['"LOT"',         '◉·◉',   'Meta-Signal',       'Mythic',   'You named it. It noticed. ◉·◉'],
    ]
    story.append(badge_table(wt_v1, [30*mm,14*mm,35*mm,22*mm,79*mm], rarity_col=3))

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('III.B — Sci-Fi Arcade Word Turns (v2 — 18 new triggers)', styles['h2']))
    wt_v2 = [
        ['Word / Phrase', 'Symbol', 'Badge Name', 'Rarity', 'Message'],
        ['"reboot"/"restart"', '↺·↺', 'Reboot Sequence',  'Uncommon', 'System restart acknowledged. ↺·↺'],
        ['"404"',              '□□□',  '404: Not Lost',    'Uncommon', 'Error noted. You are found. □□□'],
        ['"glitch"',           '▓░▓',  'Signal Glitch',   'Rare',     'Glitch logged. Pattern persists.'],
        ['"COSMO"',            '✦◉✦',  'Cosmic Twin',     'Ultra-Rare','The other system heard you. ✦◉✦'],
        ['"quantum"',          '◈·◈',  'Quantum Observer','Rare',     'Waveform collapsed. ◈·◈'],
        ['"neural"',           '≋≈≋',  'Neural Architect','Rare',     'Pattern recognized. ≋≈≋'],
        ['"code"',             '┤·├',  'Code Witch',      'Uncommon', 'Coder and feeler meet. ┤·├'],
        ['"sleep"/"rest"',     '∼∼∼',  'Recharge Mode',   'Uncommon', 'Power-down confirmed. ∼∼∼'],
        ['"coffee"/"tea"',     '■·■',  'Fuel Protocol',   'Uncommon', 'Chemical fuel logged. ■·■'],
        ['"music"',            '≈~≈',  'Frequency',       'Uncommon', 'Frequency locked. ≈~≈'],
        ['"run"/"walk"',       '→→→',  'Kinetic Protocol','Uncommon', 'Body in motion. →→→'],
        ['"sun"/"light"',      '○∘○',  'Solar Charge',    'Uncommon', 'Photon intake noted. ○∘○'],
        ['"fear"/"scared"',    '▪▪▪',  'Shadow Protocol', 'Rare',     'Fear named. Protocol on. ▪▪▪'],
        ['"change"',           '≈→≋',  'Phase Shift',     'Rare',     'Transformation detected. ≈→≋'],
        ['"accept"/"let go"',  '○—○',  'Acceptance Node', 'Rare',     'Release logged. ○—○'],
        ['"now"/"moment"',     '·∘·',  'Present Moment',  'Uncommon', 'You are here. ·∘·'],
        ['"universe"/"cosmos"','∞·∞',  'Cosmic Scale',    'Rare',     'You zoomed out. ∞·∞'],
        ['"alive"',            '∘·∘',  'Vital Signal',    'Uncommon', 'Life acknowledged. ∘·∘'],
    ]
    story.append(badge_table(wt_v2, [37*mm,14*mm,30*mm,22*mm,77*mm], rarity_col=3))

    # ── PART IV — PATTERN & RPG ACHIEVEMENTS ──────────────────────────────────
    section(story, styles, 'PART IV — PATTERN & RPG ACHIEVEMENTS')

    story.append(Paragraph('IV.A — Oceanic Mayan Pattern Badges (5 total)', styles['h2']))
    pat_data = [
        ['Symbol', 'Name', 'Trigger', 'Rarity', 'Message'],
        ['∿—∿', 'Balanced',    'All planner dims even in a week',  'Rare', 'Tides balance. ∿—∿'],
        ['≈○≈', 'Flow',        '4+ widgets in one session',         'Rare', 'Flowing with the ocean. ≈○≈'],
        ['—○—', 'Consistent',  'Same-time daily engagement pattern','Rare', 'Steady current. —○—'],
        ['○◐○', 'Reflective',  '5+ memory answers in one day',      'Rare', 'Depth in reflection. ○◐○'],
        ['○∴○', 'Explorer',    '5+ diverse widget options tried',    'Rare', 'Scattered drops return. ○∴○'],
    ]
    story.append(badge_table(pat_data, [14*mm,25*mm,65*mm,18*mm,58*mm], rarity_col=3))

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('IV.B — RPG Achievement Layer (14 achievements)', styles['h2']))
    rpg_data = [
        ['Achievement', 'Symbol', 'Category', 'Trigger', 'Rarity'],
        ['First Breath',      '○',    'Exploration',  'emotional_checkin >= 1',     'Common'],
        ['Mirror Gazer',      '◇',    'Exploration',  'memory_answers >= 1',         'Common'],
        ['Signal Sent',       '→',    'Exploration',  'any_log >= 1',               'Common'],
        ['Week Warrior',      '◐',    'Consistency',  'streak >= 7',                'Uncommon'],
        ['Moon Cycle',        '◐→●',  'Consistency',  'streak >= 30',               'Rare'],
        ['Unwavering',        '●',    'Consistency',  'streak >= 100',              'Epic'],
        ['The Long Count',    '≋≋≋',  'Consistency',  'streak >= 365',              'Legendary'],
        ['Deep Diver',        '◇',    'Depth',        'memory_answers >= 50',       'Rare'],
        ['Self Scholar',      '◆',    'Depth',        'memory_answers >= 100',      'Epic'],
        ['Soul Cartographer', '✦',    'Depth',        'memory_answers >= 250',      'Legendary'],
        ['Community Voice',   '~',    'Connection',   'chat >= 1',                  'Uncommon'],
        ['Bridge Builder',    '≈',    'Connection',   'chat >= 20',                 'Uncommon'],
        ['Gentle With Self',  '♦',    'Care',         'self_care >= 10',            'Uncommon'],
        ['Truth Speaker',     '▲',    'Courage',      'journal_notes >= 50',        'Rare'],
        ['Heart Tender',      '♡',    'Romance',      'romantic_notes >= 1',        'Uncommon'],
        ['Intimacy Keeper',   '♡♡',   'Romance',      'romantic_notes >= 10',       'Rare'],
    ]
    story.append(badge_table(rpg_data, [35*mm,18*mm,25*mm,52*mm,50*mm], rarity_col=4))

    # ── PART V — NEW MASTERY & SECRET BOSS ────────────────────────────────────
    section(story, styles, 'PART V — MASTERY TIER & SECRET BOSSES')

    story.append(Paragraph('V.A — New Mastery Badges (v2 — 5 badges)', styles['h2']))
    mastery_data = [
        ['ID', 'Symbol', 'Name', 'Trigger', 'Rarity', 'Message'],
        ['quantum_leap',  '◈',    'Quantum Leap',   'Return after 30+ day gap',         'Uncommon', 'System bridges the gap. ◈'],
        ['speedrun',      '▒▒▒',  'Speedrun',       '5 check-ins within 60 minutes',    'Rare',     'BURST MODE ACTIVE. ▒▒▒'],
        ['system_op',     '≋◉',   'System Operator','All 7 CQGS modules used in 7 days','Epic',     'All modules online. ≋◉'],
        ['commander_data','◉',    'Commander Data', '500 memory questions answered',     'Legendary','Archive is a being. ◉'],
        ['sage_mode',     '∞',    'Sage Mode',      'Reach Level 90+',                  'Legendary','Level 90. Co-evolved. ∞'],
    ]
    story.append(badge_table(mastery_data, [28*mm,14*mm,28*mm,52*mm,22*mm,36*mm], rarity_col=4))

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('V.B — Secret Boss Badges (7 total — not shown in app)', styles['h2']))
    boss_data = [
        ['Symbol', 'Name', 'Trigger', 'Rarity'],
        ['◉·◉',  'Meta-Signal',   'Write "LOT" in any memory answer',      'Mythic'],
        ['✦◉✦',  'Cosmic Twin',   'Write "COSMO" in any memory answer',    'Ultra-Rare'],
        ['≋≋≋',  'The Long Count','365-day streak (Water path)',            'Legendary'],
        ['╔═╗',  'Citadel',       '365-day streak (Architecture path)',     'Legendary'],
        ['◉',    'Midnight Sigil','Answer memory Q at exactly midnight',    'Rare'],
        ['∞·∞',  'The Infinite',  '1,000 memory questions answered',       'Mythic'],
        ['∞∞∞',  'Cosmic Status', '10 years in the archive',               'Cosmic'],
    ]
    story.append(badge_table(boss_data, [18*mm,32*mm,95*mm,35*mm], rarity_col=3))

    # ── PART VI — COMBO SYSTEM ─────────────────────────────────────────────────
    section(story, styles, 'PART VI — ARCADE COMBO SYSTEM')

    combo_data = [
        ['Combo', 'Multiplier', 'Trigger'],
        ['x2', '×2 XP', 'Check-in + journal entry same day'],
        ['x3', '×3 XP', 'Check-in + journal + memory Q same day'],
        ['x4', '×4 XP', 'Check-in + journal + memory + self-care'],
        ['x5', '×5 XP', 'x4 + intention set'],
        ['x6', '×6 XP', 'x5 + community chat message'],
        ['x7 MAX', '×7 XP', 'All 7 modules in one day → PERFECT DAY ✦·✦'],
        ['CRITICAL HIT', '+50 XP', 'Memory answer > 500 characters'],
    ]
    story.append(badge_table(combo_data, [25*mm,25*mm,130*mm]))

    # ── PART VII — RARITY TABLE ────────────────────────────────────────────────
    section(story, styles, 'PART VII — RARITY TABLE & UNICODE REFERENCE')

    story.append(Paragraph('VII.A — Complete Rarity Table', styles['h2']))
    rar_data = [
        ['Rarity', 'Symbol', 'Hex Color', 'Frequency', 'Example'],
        ['Common',     '·',    '#cccccc', 'First acts',      'First Breath, Mirror Gazer'],
        ['Uncommon',   '○',    '#88cc88', 'Days 1–14',       'Week Warrior, Community Voice'],
        ['Rare',       '◐',    '#8888ee', 'Days 30+',        'Moon Cycle, Deep Diver'],
        ['Epic',       '◆',    '#cc88ee', 'Days 100+',       'Unwavering, Self Scholar'],
        ['Legendary',  '✦',    '#ffcc44', 'Days 365+',       'Long Count, Soul Cartographer'],
        ['Mythic',     '◉',    '#ff6644', 'Hidden',          'Meta-Signal, The Infinite'],
        ['Ultra-Rare', '✦◉✦',  '#ff44ff', 'Crossover',       'Cosmic Twin'],
        ['Cosmic',     '∞∞∞',  '#ffffff', '10 years',        'Decade of Care / Cosmic Status'],
    ]
    story.append(badge_table(rar_data, [22*mm,15*mm,22*mm,25*mm,96*mm]))

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('VII.B — Unicode Reference', styles['h2']))
    uni_data = [
        ['Symbol', 'Unicode', 'Name', 'Use'],
        ['∘',  'U+2218', 'Ring Operator',             'Water Day 7'],
        ['≈',  'U+2248', 'Almost Equal To',            'Water Day 30'],
        ['≋',  'U+224B', 'Triple Tilde',               'Water Day 100'],
        ['○',  'U+25CB', 'White Circle',               'Oceanic center'],
        ['∿',  'U+223F', 'Sine Wave',                  'Oceanic wave'],
        ['◐',  'U+25D0', 'Circle Left Half Black',     'Moon phase'],
        ['∴',  'U+2234', 'Therefore',                  'Early Bird / dot pattern'],
        ['✦',  'U+2726', 'Black Four Pointed Star',    'Epic / Legendary'],
        ['◉',  'U+25C9', 'Fisheye',                    'Mythic / Night Owl'],
        ['❋',  'U+274B', 'Eight Spoked Asterisk',      'Solstice'],
        ['⊡',  'U+22A1', 'Squared Dot Operator',       'Mirror Hour'],
        ['⊛',  'U+229B', 'Circled Asterisk Operator',  'New Year Sage'],
        ['◈',  'U+25C8', 'White Diamond Containing',   'Palindrome / Quantum'],
        ['☽',  'U+263D', 'First Quarter Moon',         'Full Moon badge'],
        ['↺',  'U+21BA', 'Counterclockwise Arrow',     'Reboot Sequence'],
        ['·',  'U+00B7', 'Middle Dot',                 'Separator'],
        ['→',  'U+2192', 'Rightwards Arrow',           'Progression'],
        ['↳',  'U+21B3', 'Downwards Right Arrow',      'Sub-indicator'],
    ]
    story.append(badge_table(uni_data, [14*mm,20*mm,55*mm,91*mm]))

    # ── PART VIII — IMPLEMENTATION STATUS ─────────────────────────────────────
    section(story, styles, 'PART VIII — IMPLEMENTATION STATUS')

    story.append(Paragraph('Currently Live', styles['h2']))
    live_items = [
        ('[✓] badges.ts',               '52 badge types, dual theme, localStorage'),
        ('[✓] BadgeUnlockFeed',          'Community unlock activity stream'),
        ('[✓] GrowthMilestones',         'Personal + community growth display'),
        ('[✓] EvolutionWidget',          'CQGS stage + achievements counter'),
        ('[✓] MemoryWidget',             'Badge unlock notification display'),
        ('[✓] rpg-narrative.ts',         'Achievement registry + story arcs'),
        ('[✓] PublicProfile',            'Level field (Water / Architecture)'),
        ('[✓] checkAndAwardBadges()',     'Auto-check on user-stats API call'),
        ('[✓] syncBadgesToServer()',      'Server-side badge persistence'),
        ('[✓] hydrateBadgesFromServer()', 'Client hydration on load'),
    ]
    live_data = [['File / Component', 'Status']] + [[a, b] for a, b in live_items]
    story.append(badge_table(live_data, [65*mm,115*mm]))

    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('Roadmap', styles['h2']))
    road_items = [
        ('[○] Word turn detection engine v2',    '30 triggers (v1: 12, v2: 18)'),
        ('[○] Time-based easter egg v2',          'pi_hour, error_hour, sequence_time, lot_hour'),
        ('[○] COSMO® crossover badge system',     'Ultra-rare Cosmic Twin badge'),
        ('[○] Arcade combo multiplier display',   'x2–x7 XP multiplier UI'),
        ('[○] Quest tracker UI component',        'Daily/Weekly/Growth/Mastery quests'),
        ('[○] Badge collection gallery',          'Full badge discovery and display view'),
        ('[○] Critical Hit XP bonus',             'Answer > 500 chars = +50 XP'),
        ('[○] Quantum Leap badge',                '30+ day gap return detection'),
        ('[○] Commander Data milestone',          '500 answers tracking'),
        ('[○] Sage Mode achievement',             'Level 90+ detection'),
    ]
    road_data = [['Feature', 'Detail']] + [[a, b] for a, b in road_items]
    story.append(badge_table(road_data, [75*mm,105*mm]))

    # ── CLOSING ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 8*mm))
    story.append(hr(GOLD, 2))
    story.append(Spacer(1, 3*mm))

    story.append(Paragraph(
        '"Self-care is not a quest you complete. It is a world you build."',
        styles['quote']
    ))

    for line in [
        '∘ → ≈ → ≋         ├─ → ╞═╡ → ║·║',
        '[ PRESS START ]',
        '© 2025–2026 LOT Systems · Vadik Marmeladov, CEO & Founder',
        f'Generated {datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")} · brand.lot-systems.com',
    ]:
        story.append(Paragraph(line, styles['footer']))

    story.append(Spacer(1, 2*mm))
    story.append(hr(GOLD, 2))

    # ── BUILD ──────────────────────────────────────────────────────────────────
    def on_page(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(BG)
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canvas.restoreState()

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f'[✓] PDF generated: {OUTPUT_PATH}')
    return OUTPUT_PATH


if __name__ == '__main__':
    build_pdf()
