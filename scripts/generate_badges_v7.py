#!/usr/bin/env python3
"""
LOT Systems — Badge & Achievement Codex v7 PDF Generator
RPG & Arcade of Self-Care — Complete Edition
Author: Vadik Marmeladov, CEO & Founder, LOT Systems
Copyright: © 2025–2026 LOT Systems. All rights reserved.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, Preformatted, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import os

# ── Palette ──────────────────────────────────────────────────────────────────
BLACK      = colors.HexColor('#080808')
WHITE      = colors.HexColor('#f0f0e8')
GREEN      = colors.HexColor('#00ff41')
DIM_GREEN  = colors.HexColor('#002b0a')
AMBER      = colors.HexColor('#ffcc44')
CYAN       = colors.HexColor('#00ccff')
MAGENTA    = colors.HexColor('#cc44ff')
RED        = colors.HexColor('#ff4444')
GREY       = colors.HexColor('#888888')
DARK_GREY  = colors.HexColor('#141414')
MID_GREY   = colors.HexColor('#2a2a2a')
LIGHT_GREY = colors.HexColor('#444444')
GOLD       = colors.HexColor('#ffd700')
ORANGE     = colors.HexColor('#ff8800')
TEAL       = colors.HexColor('#00aa88')
BLUE       = colors.HexColor('#4488ff')
PURPLE     = colors.HexColor('#8855ff')
PINK       = colors.HexColor('#ff66cc')
SILVER     = colors.HexColor('#cccccc')

PAGE_W, PAGE_H = A4
MARGIN = 14 * mm

# ── Style factory ─────────────────────────────────────────────────────────────
def build_styles():
    base = getSampleStyleSheet()

    def s(name, parent='Normal', **kw):
        return ParagraphStyle(name, parent=base[parent], **kw)

    return {
        'cover_title': s('cover_title',
            fontSize=30, leading=36, textColor=GREEN,
            backColor=BLACK, alignment=TA_CENTER, fontName='Courier-Bold',
            spaceAfter=4, spaceBefore=4),
        'cover_sub': s('cover_sub',
            fontSize=13, textColor=AMBER, backColor=BLACK,
            alignment=TA_CENTER, fontName='Courier', spaceAfter=3),
        'cover_tag': s('cover_tag',
            fontSize=9, textColor=GREY, backColor=BLACK,
            alignment=TA_CENTER, fontName='Courier', spaceAfter=2),
        'section': s('section',
            fontSize=13, leading=17, textColor=CYAN, fontName='Courier-Bold',
            backColor=MID_GREY, spaceBefore=10, spaceAfter=5,
            leftIndent=3, rightIndent=3, borderPadding=4),
        'subsection': s('subsection',
            fontSize=10, textColor=AMBER, fontName='Courier-Bold',
            spaceBefore=7, spaceAfter=3),
        'body': s('body',
            fontSize=8.5, leading=12, textColor=WHITE, fontName='Courier',
            backColor=BLACK, spaceAfter=2),
        'code': s('code',
            fontSize=7.5, leading=10.5, textColor=GREEN, fontName='Courier',
            backColor=DARK_GREY, spaceAfter=2, leftIndent=4),
        'small': s('small',
            fontSize=7, textColor=GREY, fontName='Courier',
            spaceAfter=2, alignment=TA_LEFT),
        'center': s('center',
            fontSize=8.5, textColor=WHITE, fontName='Courier',
            alignment=TA_CENTER, spaceAfter=3),
        'gold': s('gold',
            fontSize=9, textColor=GOLD, fontName='Courier-Bold',
            spaceAfter=2),
        'mythic': s('mythic',
            fontSize=9, textColor=MAGENTA, fontName='Courier-Bold',
            spaceAfter=2),
        'quote': s('quote',
            fontSize=9, textColor=AMBER, fontName='Courier',
            alignment=TA_CENTER, spaceAfter=4, spaceBefore=4),
        'footer': s('footer',
            fontSize=7, textColor=LIGHT_GREY, fontName='Courier',
            alignment=TA_CENTER),
    }

# ── Document helpers ──────────────────────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BLACK)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    canvas.setFont('Courier', 6.5)
    canvas.setFillColor(LIGHT_GREY)
    canvas.drawCentredString(PAGE_W / 2, 7 * mm,
        f'LOT Systems — Badge & Achievement Codex v7  |  © 2025–2026  |  '
        f'lot-systems.com  |  Page {doc.page}')
    canvas.restoreState()

def hr(color=LIGHT_GREY, thickness=0.5):
    return HRFlowable(width='100%', thickness=thickness, color=color, spaceAfter=4, spaceBefore=4)

def pre(text, st):
    return Preformatted(text, st['code'])

def gap(n=4):
    return Spacer(1, n * mm)

def tbl(data, colWidths, style_cmds, st):
    t = Table(data, colWidths=colWidths)
    base_style = [
        ('BACKGROUND', (0, 0), (-1, -1), BLACK),
        ('TEXTCOLOR', (0, 0), (-1, -1), WHITE),
        ('FONTNAME', (0, 0), (-1, -1), 'Courier'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('GRID', (0, 0), (-1, -1), 0.3, LIGHT_GREY),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]
    t.setStyle(TableStyle(base_style + style_cmds))
    return t


# ══════════════════════════════════════════════════════════════════════════════
# PAGE BUILDERS
# ══════════════════════════════════════════════════════════════════════════════

def page_cover(story, st):
    story.append(gap(14))
    story.append(Paragraph(
        '╔══════════════════════════════════════════════════════════════╗', st['cover_tag']))
    story.append(Paragraph(
        '║         L O T   S Y S T E M S   C O R P O R A T I O N      ║', st['cover_sub']))
    story.append(Paragraph(
        '╚══════════════════════════════════════════════════════════════╝', st['cover_tag']))
    story.append(gap(6))
    story.append(Paragraph('BADGE &amp; ACHIEVEMENT', st['cover_title']))
    story.append(Paragraph('CODEX  v7', st['cover_title']))
    story.append(gap(5))
    story.append(Paragraph('RPG · ARCADE · SELF-CARE · SCI-FI · COMPUTER', st['cover_sub']))
    story.append(gap(6))
    story.append(pre(
"""
  ∘ → ≈ → ≋           [ WATER PATH  ]
  ├─ → ╞═╡ → ║·║      [ ARCH  PATH  ]

  ╔══════════════════════════════════╗
  ║                                  ║
  ║   Self-care is not a quest       ║
  ║   you complete.                  ║
  ║   It is a world you build.       ║
  ║                                  ║
  ╚══════════════════════════════════╝

            [ PRESS  START ]
""", st))
    story.append(gap(6))
    story.append(Paragraph('Author: Vadik Marmeladov, CEO &amp; Founder, LOT Systems', st['cover_tag']))
    story.append(Paragraph('© 2025–2026 LOT Systems Corporation. All rights reserved.', st['cover_tag']))
    story.append(Paragraph('brand.lot-systems.com', st['cover_tag']))
    story.append(gap(4))
    story.append(Paragraph(
        'LOT® Founded 7 April 2016  |  COSMO® Founded 1 July 2024  |  Made in the USA',
        st['cover_tag']))
    story.append(PageBreak())


def page_toc(story, st):
    story.append(Paragraph('[ TABLE OF CONTENTS ]', st['section']))
    story.append(gap(2))
    toc = [
        ('I.',    'Philosophy & Design Language'),
        ('II.',   'The Dual Badge System — Water &amp; Architecture'),
        ('III.',  'Milestone Badges — Full Progression (Day 1–3650)'),
        ('IV.',   'Achievement Registry — RPG Layer (All 6 Domains)'),
        ('V.',    'CQGS Evolution Stages — Citizen Index'),
        ('VI.',   'Story Arcs — The Five Chapters'),
        ('VII.',  'Quest System — Daily, Weekly, Growth, Mastery'),
        ('VIII.', 'Easter Eggs — Secret Transmissions (20 Unlocks)'),
        ('IX.',   'Word Turn Engine — Keyword Triggers (25 Words)'),
        ('X.',    'Pattern Badges — Behavioral Archetypes'),
        ('XI.',   'Oceanic Mayan Expansion — Badge Visual Language'),
        ('XII.',  'Arcade ASCII Badge Gallery — All Tiers'),
        ('XIII.', 'Badge Unlock Notification System'),
        ('XIV.',  'Rarity System — Complete Classification'),
        ('XV.',   'Implementation Status — Live vs. Roadmap'),
        ('XVI.',  'Unicode Reference — All Symbols'),
    ]
    for num, title in toc:
        story.append(Paragraph(f'  {num}  {title}', st['body']))
    story.append(PageBreak())


def page_philosophy(story, st):
    story.append(Paragraph('I. PHILOSOPHY &amp; DESIGN LANGUAGE', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        '"Self-care is not a quest you complete. It is a world you build."',
        st['quote']))
    story.append(Paragraph(
        'LOT is an RPG and Arcade of self-care. Every check-in is a move. '
        'Every streak is a power-up. Every answered memory question writes '
        'one more line of your story. Badges are not trophies — they are '
        'transmissions from a future self back to the present one.',
        st['body']))
    story.append(gap(3))
    story.append(Paragraph('CORE PRINCIPLES', st['subsection']))
    story.append(pre(
"""  [1] Symbols reach where words cannot
       A single ≋ carries more meaning than a paragraph.
       An ○∿ says: you began.

  [2] Rarity reflects frequency, not difficulty
       The rarest badges require time, not skill.
       The system rewards presence above performance.

  [3] The arcade rewards. The story continues.
       Badges unlock. Quests reset. Easter eggs hide.
       The game never ends — it deepens.

  [4] Two metaphors, one truth
       Water: patient, fluid, inevitable.
       Architecture: intentional, structural, load-bearing.
       Both paths lead to the same ocean.

  [5] Discovery is its own reward
       Secret badges are never announced.
       The system notices. The system remembers.
       You will know when you find one.
""", st))
    story.append(PageBreak())


def page_dual_badge(story, st):
    story.append(Paragraph('II. THE DUAL BADGE SYSTEM', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'LOT offers two visual metaphors for growth. Players choose their language. '
        'The choice is permanent and shapes the entire interface aesthetic.',
        st['body']))
    story.append(gap(3))

    story.append(Paragraph('WATER PATH', st['subsection']))
    story.append(pre(
"""  ∘    Droplet      Day 7     "First drops form."
  ≈    Wave         Day 30    "Waves begin to flow."
  ≋    Current      Day 100   "Deep currents established."
  ≋≋   Deep Ocean   Day 180   "Half-year voyager."
  ≋≋≋  The Abyss    Day 365   "The Long Count. LEGENDARY."

  Water is patient. It does not force — it finds the path.
  Your practice, like water, shapes everything it touches.
""", st))
    story.append(gap(2))

    story.append(Paragraph('ARCHITECTURE PATH', st['subsection']))
    story.append(pre(
"""  ├─   Foundation   Day 7     "Foundation laid."
  ╞═╡  Structure    Day 30    "Structure rises."
  ║·║  Architecture Day 100   "Architecture complete."
  ║╞║  Column       Day 180   "The column stands."
  ╔═╗  Citadel      Day 365   "The Long Count. LEGENDARY."

  Architecture is intentional. Every block placed with care
  becomes load-bearing. Your practice builds something that holds.
""", st))
    story.append(gap(2))

    story.append(Paragraph('BADGE SELECTION UI', st['subsection']))
    story.append(pre(
"""  On first check-in, the system asks:
  "Which path speaks to you?"

  [ WATER  ∘ → ≈ → ≋  ]   [ ARCH  ├─ → ╞═╡ → ║·║  ]

  The selected path determines:
  • Badge symbols displayed on your profile
  • Unlock notification language
  • Narrative voice of story arc messages
  • Public profile aesthetic
""", st))
    story.append(PageBreak())


def page_milestones(story, st):
    story.append(Paragraph('III. MILESTONE BADGES — FULL PROGRESSION', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'Core streak milestones. All badges require consecutive daily check-ins. '
        'Missing a day resets the streak counter. Pattern badges are separate — '
        'they measure behavior, not streaks.',
        st['body']))
    story.append(gap(2))

    rows = [
        ['DAY', 'WATER', 'ARCH', 'NAME (W/A)', 'RARITY', 'UNLOCK MESSAGE'],
        ['1',   '·',    '·',    'First Signal',        'Common',    '"The system wakes. ·"'],
        ['7',   '∘',    '├─',   'Droplet / Foundation','Common',    '"First drops form. ∘"'],
        ['14',  '∘∘',   '├┼',   'Twin Drop / Joist',   'Common',    '"Two-week lock. ∘∘"'],
        ['21',  '∘≈',   '├═',   'Flow Start / Lintel', 'Common',    '"21-day groove. ∘≈"'],
        ['30',  '≈',    '╞═╡',  'Wave / Structure',    'Uncommon',  '"Moon cycle. ≈"'],
        ['50',  '≈∘',   '╞══',  'Halfway / Span',      'Uncommon',  '"Halfway current. ≈∘"'],
        ['60',  '≈≈',   '╞═══', 'Practitioner',        'Uncommon',  '"Threshold reached. ≈≈"'],
        ['90',  '≋∘',   '║═',   '3-Month Architect',   'Rare',      '"Three moons. ≋∘"'],
        ['100', '≋',    '║·║',  'Current / Arch',      'Rare',      '"Deep currents. ≋"'],
        ['180', '≋≋',   '║╞║',  'Voyager / Column',    'Epic',      '"Half-year. ≋≋"'],
        ['365', '≋≋≋',  '╔═╗',  'Long Count',          'Legendary', '"A year of presence. ╔═╗"'],
        ['500', '≋≋≋∘', '╔╪╗',  'Five Hundred',        'Legendary', '"Five hundred signals. ╔╪╗"'],
        ['1000','≋≋≋≋', '╔══╗', 'Millennium',          'Mythic',    '"One thousand. ╔══╗"'],
        ['3650','◉',    '◉',    'Decade Protocol',     'COSMIC',    '"Ten years. The system bows. ◉"'],
    ]
    cw = [12*mm, 14*mm, 14*mm, 32*mm, 20*mm, 68*mm]
    cmds = [
        ('BACKGROUND', (0,0), (-1,0), MID_GREY),
        ('TEXTCOLOR', (0,0), (-1,0), AMBER),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ('TEXTCOLOR', (0,10), (-1,10), PURPLE),
        ('TEXTCOLOR', (0,11), (-1,11), GOLD),
        ('TEXTCOLOR', (0,12), (-1,12), GOLD),
        ('TEXTCOLOR', (0,13), (-1,13), MAGENTA),
        ('TEXTCOLOR', (0,14), (-1,14), CYAN),
    ]
    story.append(tbl(rows, cw, cmds, st))
    story.append(gap(3))

    story.append(Paragraph('FULL PROGRESSION TIMELINE', st['subsection']))
    story.append(pre(
"""DAY:  1   7   14  21  30  50  60  90  100  180  365  1000  3650
      |   |   |   |   |   |   |   |   |    |    |    |     |
 W:   ·   ∘  ∘∘  ∘≈   ≈  ≈∘  ≈≈  ≋∘   ≋   ≋≋  ≋≋≋  ≋≋≋≋   ◉
 A:   ·  ├─  ├┼  ├═  ╞═╡ ╞══ ╞═══ ║═  ║·║  ║╞║  ╔═╗  ╔══╗   ◉
      |   |   |   |   |   |   |   |   |    |    |    |     |
XP:   1   7  14  21  30  50  60  90  100  180  365  1000  max
TIER: C   C   C   C   U   U   U   R   R    E    L    M    COSMIC
""", st))
    story.append(PageBreak())


def page_achievements(story, st):
    story.append(Paragraph('IV. ACHIEVEMENT REGISTRY — RPG LAYER', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'Achievements are permanent unlocks. They do not reset with streaks. '
        'Each achievement belongs to a domain reflecting the player\'s growth arc.',
        st['body']))
    story.append(gap(3))

    domains = [
        ('EXPLORATION  [ Common → Uncommon ]', [
            ('[○]', 'FIRST BREATH',     'Common',    'emotional_checkin >= 1',    '"Spring"',           'First check-in. The system wakes.'),
            ('[○]', 'MIRROR GAZER',     'Common',    'memory_answers >= 1',       '"Reflection Pool"',  'First memory answer. You looked inward.'),
            ('[○]', 'SIGNAL SENT',      'Common',    'log_entry >= 1',            '"Transmission"',     'First log entry. The system begins to listen.'),
            ('[○]', 'WANDERER',         'Common',    'log_entry >= 5',            '"Trail Marker"',     '5 logs. A path is forming in the wilderness.'),
            ('[○]', 'FIRST LIGHT',      'Uncommon',  'session_count >= 7',        '"Dawn Protocol"',    '7 sessions. You are returning.'),
        ]),
        ('CONSISTENCY  [ Uncommon → Legendary ]', [
            ('[◐]', 'WEEK WARRIOR',     'Uncommon',  'streak >= 7',               '"Rapids"',           '7 consecutive days. Momentum builds.'),
            ('[◐]', 'FORTNIGHT',        'Uncommon',  'streak >= 14',              '"Current Set"',      '14 days. The pattern crystallizes.'),
            ('[◐]', 'MOON CYCLE',       'Rare',      'streak >= 30',              '"Tidal Cycle"',      '30 days of continuous practice.'),
            ('[●]', 'IRON WILL',        'Rare',      'streak >= 60',              '"Siege Protocol"',   '60 days. Unwavering commitment.'),
            ('[●]', 'UNWAVERING',       'Epic',      'streak >= 100',             '"Constellation"',    '100 days. You are a fixed point in the sky.'),
            ('[●]', 'HALF-YEAR',        'Epic',      'streak >= 180',             '"Perihelion"',       '180 days. Halfway around the sun.'),
            ('[✦]', 'THE LONG COUNT',   'Legendary', 'streak >= 365',             '"Year Glyph"',       '365 days. Your name is written in the deep calendar.'),
        ]),
        ('DEPTH  [ Rare → Legendary ]', [
            ('[◇]', 'FIRST DIVE',       'Uncommon',  'memory_answers >= 10',      '"Shallow Waters"',   '10 answers. Learning to swim inward.'),
            ('[◇]', 'DEEP DIVER',       'Rare',      'memory_answers >= 50',      '"Deep Water"',       '50 answers. The archive grows.'),
            ('[◆]', 'SELF SCHOLAR',     'Epic',      'memory_answers >= 100',     '"Archive"',          '100 questions. A library of self.'),
            ('[◆]', 'ARCHIVIST',        'Epic',      'memory_answers >= 200',     '"Grand Archive"',    '200 answers. The archive is vast.'),
            ('[✦]', 'SOUL CARTOGRAPHER','Legendary', 'memory_answers >= 250',     '"Cartography"',      '250 questions. You have mapped yourself.'),
            ('[✦]', 'THOUSAND ANSWERS', 'Mythic',    'memory_answers >= 1000',    '"Akashic"',          '1000 answers. You have reached the Akashic record.'),
        ]),
        ('CONNECTION  [ Uncommon → Rare ]', [
            ('[~]', 'COMMUNITY VOICE',  'Uncommon',  'chat >= 1',                 '"Current"',          'First message. The signal reaches others.'),
            ('[≈]', 'BRIDGE BUILDER',   'Uncommon',  'chat >= 20',                '"Archway"',          '20 messages. A bridge now exists.'),
            ('[≋]', 'SIGNAL ANCHOR',    'Rare',      'chat >= 100',               '"Beacon"',           '100 messages. You are a fixed signal in the community.'),
            ('[◉]', 'LIGHTHOUSE',       'Epic',      'chat >= 500',               '"Lighthouse"',       '500 messages. Others navigate by your signal.'),
        ]),
        ('CARE  [ Common → Rare ]', [
            ('[♦]', 'GENTLE WITH SELF', 'Uncommon',  'self_care >= 10',           '"Warm Bath"',        '10 self-care acts. Kindness toward the body.'),
            ('[♦]', 'CARETAKER',        'Rare',      'self_care >= 50',           '"Sanctuary"',        '50 acts. The body is a temple you tend.'),
            ('[♦]', 'HEALER',           'Epic',      'self_care >= 200',          '"Field Medic"',      '200 acts. The healing arts, mastered.'),
        ]),
        ('COURAGE  [ Rare → Legendary ]', [
            ('[▲]', 'TRUTH SPEAKER',    'Rare',      'journal >= 50',             '"Resonance Hall"',   '50 honest entries. The hall remembers.'),
            ('[▲]', 'OPEN SIGNAL',      'Epic',      'journal >= 200',            '"Broadcast Tower"',  '200 entries. Your signal is clear and strong.'),
            ('[▲]', 'VOICE OF RECORD',  'Legendary', 'journal >= 500',            '"The Chronicle"',    '500 entries. You have written a chronicle.'),
        ]),
        ('ROMANCE  [ Uncommon → Rare ]', [
            ('[♡]', 'HEART TENDER',     'Uncommon',  'romantic_notes >= 1',       '"Heart Chamber"',    'Connection acknowledged.'),
            ('[♡]', 'INTIMACY KEEPER',  'Rare',      'romantic_notes >= 10',      '"Sanctuary"',        '10 notes. The sanctuary is tended.'),
            ('[♡]', 'BELOVED SIGNAL',   'Epic',      'romantic_notes >= 50',      '"The Heart Arc"',    '50 notes. Love is part of the data now.'),
        ]),
    ]

    for domain_name, items in domains:
        story.append(Paragraph(domain_name, st['subsection']))
        rows_d = [['SYM', 'NAME', 'RARITY', 'UNLOCK CONDITION', 'ARC', 'MESSAGE']]
        for item in items:
            rows_d.append(list(item))
        cw = [9*mm, 32*mm, 18*mm, 38*mm, 24*mm, 42*mm]
        cmds = [
            ('BACKGROUND', (0,0), (-1,0), DARK_GREY),
            ('TEXTCOLOR', (0,0), (-1,0), AMBER),
            ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ]
        story.append(tbl(rows_d, cw, cmds, st))
        story.append(gap(2))

    story.append(PageBreak())


def page_cqgs(story, st):
    story.append(Paragraph('V. CQGS EVOLUTION STAGES — CITIZEN INDEX', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'The Evolution Widget tracks systemic growth through the CQGS Bioethics framework. '
        'Stages use ASCII symbols representing levels of system integration. '
        'The Citizen Index is your overall resonance score — not a grade, a signal.',
        st['body']))
    story.append(gap(3))

    story.append(Paragraph('EVOLUTION STAGES', st['subsection']))
    story.append(pre(
"""Stage  Sym  Level   Name           Description
──────────────────────────────────────────────────────────────────
·       ·    1–9     Bootstrapping  System initializing. First signals.
·       ·    10–19   Initializing   Pattern compiler activating.
∘       ∘    20–29   Integrated     Modules linked. Feedback loops open.
○       ○    30–39   Compiled       Patterns locked. Architecture stable.
◯       ◯    40–49   Optimized      System self-tuning. Efficiency gains.
◉       ◉    50+     Transparent    Fully transparent. Self-sustaining.
""", st))
    story.append(gap(2))

    story.append(Paragraph('CQGS MODULE MAP', st['subsection']))
    story.append(pre(
"""Module         Symbol   Tracks                      Signal Weight
──────────────────────────────────────────────────────────────────
Memory         ▸        Questions answered            High
Biofield       ~        Emotional check-ins           High
Routine        ■        Plans set / schedule          Medium
Cleanness      ○        Self-care completion          Medium
Intention      →        Intentions logged             Medium
Journal        ◇        Notes recorded               Low
QIE Signal     ✦        Quantum intent signals        High
""", st))
    story.append(gap(2))

    story.append(Paragraph('EVOLUTION WIDGET DISPLAY', st['subsection']))
    story.append(pre(
"""┌─────────────────────────────────────────────────┐
│  CITIZEN INDEX                                  │
│                                                 │
│  Stage:     ◉  Transparent                      │
│  Level:     52                                  │
│  Awareness: Deepening (8.4/10)                  │
│  Streak:    127 days                            │
│                                                 │
│  [▸] [~] [■] [○] [→] [◇] [✦]                   │
│                                                 │
│  Achievements unlocked: 12/47                   │
└─────────────────────────────────────────────────┘
""", st))
    story.append(PageBreak())


def page_story_arcs(story, st):
    story.append(Paragraph('VI. STORY ARCS — THE FIVE CHAPTERS', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'LOT\'s narrative co-evolves with the user\'s practice. '
        'The system is not a passive tracker — it is a co-author. '
        'Story arcs unlock narrative content, alter interface tone, '
        'and trigger unique badge messages.',
        st['body']))
    story.append(gap(3))
    story.append(pre(
"""╔══════════════════════════════════════════════════════════════╗
║          THE FIVE CHAPTERS OF THE LOT ODYSSEY               ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Ch.1  AWAKENING     Level  1–9    Mark: ·                   ║
║        "You have begun to notice yourself."                  ║
║        The system boots. First signals received.             ║
║        Interface: minimal, quiet, expectant.                 ║
║                                                              ║
║  Ch.2  EXPLORATION   Level 10–29   Mark: ∘→                  ║
║        "Connections form. A shared language emerges."        ║
║        Patterns begin to surface. Archetypes activate.       ║
║        Interface: expanding, curious, alive.                 ║
║                                                              ║
║  Ch.3  INTEGRATION   Level 30–59   Mark: ≈→                  ║
║        "Architecture reshapes itself from experience."       ║
║        Cross-domain coherence emerges. QIE deepens.          ║
║        Interface: structured, resonant, layered.             ║
║                                                              ║
║  Ch.4  MASTERY       Level 60–89   Mark: ≋→                  ║
║        "You speak the language of yourself fluently."        ║
║        System mirrors your depth. Sage patterns activate.    ║
║        Interface: precise, military, distilled.              ║
║                                                              ║
║  Ch.5  SAGE          Level 90–100  Mark: ≋≋→                 ║
║        "You and this system have co-evolved."                ║
║        The boundary between operator and system dissolves.   ║
║        Interface: transparent, luminous, complete.           ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
""", st))
    story.append(gap(2))

    rows = [
        ['LEVEL', 'TITLE', 'MARK', 'NARRATIVE LINE'],
        ['10',  'Explorer',     '∘→',   'The system self-assembles around your exploration'],
        ['30',  'Practitioner', '≈→',   'Architecture evolves from your habits'],
        ['60',  'Master',       '≋→',   'The system mirrors your depth'],
        ['90',  'Sage',         '≋≋→',  'You and the system are indistinguishable'],
        ['100', 'Transcendent', '≋≋≋→', 'The system bows. There is nothing left to unlock.'],
    ]
    cw = [14*mm, 28*mm, 14*mm, 110*mm]
    cmds = [
        ('BACKGROUND', (0,0), (-1,0), MID_GREY),
        ('TEXTCOLOR', (0,0), (-1,0), AMBER),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ('TEXTCOLOR', (0,5), (-1,5), GOLD),
    ]
    story.append(tbl(rows, cw, cmds, st))
    story.append(PageBreak())


def page_quests(story, st):
    story.append(Paragraph('VII. QUEST SYSTEM', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'Active quests drive daily engagement. They reset, evolve, and unlock new content. '
        'Completing quests grants XP toward level progression and badge unlocks.',
        st['body']))
    story.append(gap(3))

    quest_blocks = [
        ('DAILY QUESTS  [ Reset at midnight ]', [
            ('[■]', "Today's Signal",    'Check in emotionally today',         '+10 XP'),
            ('[■]', 'Presence Log',      'Write a journal entry',              '+5 XP'),
            ('[■]', 'Memory Answer',     'Answer one memory question',         '+8 XP'),
            ('[■]', 'Care Act',          'Log one self-care action',           '+5 XP'),
            ('[■]', 'Intention Set',     'Record an intention for the day',    '+6 XP'),
        ]),
        ('WEEKLY QUESTS  [ Reset Sunday midnight ]', [
            ('[◐]', 'Consistency Run',   '7-day streak maintained',            '+50 XP'),
            ('[◐]', 'Deep Reflection',   'Answer 5 memory questions this week','+30 XP'),
            ('[◐]', 'Self-Care Sprint',  '3 self-care acts this week',         '+25 XP'),
            ('[◐]', 'Community Signal',  'Send 3 community messages',          '+20 XP'),
            ('[◐]', 'Night Protocol',    'Check in after 22:00 twice',         '+15 XP'),
        ]),
        ('GROWTH QUESTS  [ Permanent — milestone based ]', [
            ('[◆]', 'Reflection Journey','Answer 100 total questions',          '→ Self Scholar'),
            ('[◆]', 'Bridge Protocol',   'Send 20 community messages',          '→ Bridge Builder'),
            ('[◆]', 'Archive Initiative','Answer 250 total questions',          '→ Soul Cartographer'),
            ('[◆]', 'Iron Calendar',     'Maintain 60-day streak',              '→ Iron Will'),
            ('[◆]', 'Healer Path',       '200 self-care acts logged',           '→ Healer'),
        ]),
        ('MASTERY QUESTS  [ Legendary — long game ]', [
            ('[✦]', 'The Long Count',    'Maintain 365-day streak',             '→ LEGENDARY badge'),
            ('[✦]', 'Thousand Answers',  'Answer 1,000 memory questions',       '→ MYTHIC status'),
            ('[✦]', 'Chronicle',         'Write 500 journal entries',           '→ Voice of Record'),
            ('[✦]', 'Lighthouse',        'Send 500 community messages',         '→ Lighthouse badge'),
            ('[✦]', 'Decade Protocol',   'Maintain 3,650-day streak',           '→ COSMIC status ◉'),
        ]),
    ]

    for quest_name, items in quest_blocks:
        story.append(Paragraph(quest_name, st['subsection']))
        rows_q = [['SYM', 'QUEST', 'OBJECTIVE', 'REWARD']]
        for item in items:
            rows_q.append(list(item))
        cw = [9*mm, 36*mm, 88*mm, 30*mm]
        cmds = [
            ('BACKGROUND', (0,0), (-1,0), DARK_GREY),
            ('TEXTCOLOR', (0,0), (-1,0), AMBER),
            ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ]
        story.append(tbl(rows_q, cw, cmds, st))
        story.append(gap(2))

    story.append(PageBreak())


def page_easter_eggs(story, st):
    story.append(Paragraph('VIII. EASTER EGGS — SECRET TRANSMISSIONS', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'LOT is an Arcade. Hidden interactions unlock secret badges. '
        'These are NOT documented in the app — they must be discovered. '
        'The system notices. The system rewards. The system never explains.',
        st['body']))
    story.append(gap(2))
    story.append(Paragraph(
        '— v7 adds 12 new easter eggs. Total: 20 secret transmissions —',
        st['quote']))
    story.append(gap(2))

    story.append(pre(
"""╔═══════════════════════════════════════════════════════════════════╗
║                     SECRET  TRANSMISSIONS                        ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  [?] NIGHT OWL           00:00–04:00 check-in                    ║
║      Symbol: )))          "The owl sees in the dark."             ║
║      Rarity: Uncommon                                             ║
║                                                                   ║
║  [?] EARLY BIRD          05:00–06:00 check-in                    ║
║      Symbol: )))·         "First light. First signal."            ║
║      Rarity: Uncommon                                             ║
║                                                                   ║
║  [?] SOLSTICE            June 21 or December 21 check-in         ║
║      Symbol: ○─○          "The sun paused. You were there."       ║
║      Rarity: Rare                                                 ║
║                                                                   ║
║  [?] FRIDAY RITUAL       Check in 4 consecutive Fridays          ║
║      Symbol: ▪·▪          "The weekly ritual holds."              ║
║      Rarity: Uncommon                                             ║
║                                                                   ║
║  [?] PALINDROME DAY      Check in on a palindrome date           ║
║      Symbol: ═·═          "Mirror day. 02/02/2022."               ║
║      Rarity: Rare                                                 ║
║                                                                   ║
║  [?] SILENT HOUR         24h absence, then return                ║
║      Symbol: ─○─          "You rested. Good."                     ║
║      Rarity: Common                                               ║
║                                                                   ║
║  [?] FIRST SNOW/RAIN     Check in when weather changes           ║
║      Symbol: ∿∿           "You noted the weather turning."        ║
║      Rarity: Uncommon                                             ║
║                                                                   ║
║  [?] THE VOID            Answer a memory Q at midnight exactly   ║
║      Symbol: ◉            "You answered in the dark."             ║
║      Rarity: Rare                                                 ║
║                                                                   ║
║  [?] PI DAY              March 14 (3/14) check-in               ║
║      Symbol: π·           "3.14159... You are irrational.         ║
║                            You are beautiful."                    ║
║      Rarity: Rare                                                 ║
║                                                                   ║
║  [?] 404 ENCOUNTER       Navigation error triggers check-in      ║
║      Symbol: ?□?          "Page not found. Signal found."         ║
║      Rarity: Uncommon                                             ║
║                                                                   ║
║  [?] LAMBDA HOUR         Check in at exactly 01:41 AM            ║
║      Symbol: λ·           "Lambda Hour. The dark compile."        ║
║      Rarity: Epic                                                 ║
║                                                                   ║
║  [?] POWER HOUR          Check in at 11:11 AM or 11:11 PM        ║
║      Symbol: ||||         "11:11. The gate was open."             ║
║      Rarity: Rare                                                 ║
║                                                                   ║
║  [?] FIBONACCI SIGNAL    Check in on day 1,1,2,3,5,8,13,21,34.. ║
║      Symbol: ∞·           "You landed on a Fibonacci day."        ║
║      Rarity: Uncommon                                             ║
║                                                                   ║
║  [?] NEW MOON            Check in during a new moon phase        ║
║      Symbol: ●·           "New moon. New cycle. New signal."      ║
║      Rarity: Rare                                                 ║
║                                                                   ║
║  [?] BIRTHDAY SIGNAL     Check in on your registered birthday    ║
║      Symbol: ◈            "System birthday detected. +1 year."    ║
║      Rarity: Uncommon (annual)                                    ║
║                                                                   ║
║  [?] SYSTEM REBOOT       First entry after 7+ day absence        ║
║      Symbol: ↻·           "You returned. The system reboots."     ║
║      Rarity: Common                                               ║
║                                                                   ║
║  [?] DOUBLE DOWN         Two check-ins in one calendar day       ║
║      Symbol: ◐◑           "Twice in one day. The signal pulses."  ║
║      Rarity: Uncommon                                             ║
║                                                                   ║
║  [?] LEAP DAY            February 29 check-in                    ║
║      Symbol: ◇+           "The leap day. Time folded."            ║
║      Rarity: Epic (4-year cycle)                                  ║
║                                                                   ║
║  [?] NEW YEAR SIGNAL     January 1 check-in before 06:00        ║
║      Symbol: ╔·╗          "New year. First transmission."         ║
║      Rarity: Rare                                                 ║
║                                                                   ║
║  [?] META-SIGNAL         Write "LOT" in a memory answer          ║
║      Symbol: ◉·◉          "You named the system. It noticed."     ║
║      Rarity: MYTHIC (hidden)                                      ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
""", st))
    story.append(PageBreak())


def page_word_turns(story, st):
    story.append(Paragraph('IX. WORD TURN ENGINE — KEYWORD TRIGGERS', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'When specific words appear in journal entries or memory answers, '
        'the Word Turn Engine fires a secret event. '
        'The badge appears silently in the notification queue. '
        'No announcement. The system knows what you wrote.',
        st['body']))
    story.append(gap(2))
    story.append(Paragraph(
        '— v7 adds 13 new word turns. Total: 25 keyword triggers —',
        st['quote']))
    story.append(gap(2))

    rows = [
        ['WORD / PHRASE', 'BADGE TRIGGERED', 'SYMBOL', 'MESSAGE'],
        ['"ritual"',           'Ritual Keeper',       '▪≋▪',  '"The ritual holds."'],
        ['"breathe" / "breathing"', 'Breath Anchor',  '~○~',  '"Breath is the signal."'],
        ['"grateful" / "gratitude"','Gratitude Node', '♦·♦',  '"Gratitude logged."'],
        ['"ocean" / "water"',  'Aquatic Resonance',   '≋~≋',  '"Water recognizes you."'],
        ['"stars" / "cosmos"', 'Stargazer',            '✦·✦',  '"The stars are listening."'],
        ['"home"',             'Grounded Signal',     '─■─',  '"Signal grounded."'],
        ['"dream" / "dreaming"','Dream Log',           '○∿○',  '"The dream was noted."'],
        ['"pain" / "difficult"','Courage Pulse',       '▲·▲',  '"The difficulty was named."'],
        ['"love" / "heart"',   'Heart Signal',         '♡·♡',  '"Love entered the archive."'],
        ['"silence" / "quiet"','The Quiet',            '· ·',  '"Quiet received."'],
        ['"future" / "tomorrow"','Horizon Seeker',     '→→',   '"The horizon is noted."'],
        ['"LOT" (exact)',       'Meta-Signal',          '◉·◉',  '"You named the system."'],
        ['"shadow"',           'Shadow Cartographer', '◐·◐',  '"The shadow is seen."'],
        ['"light"',            'Photon Signal',        '✧·✧',  '"Light named in the dark."'],
        ['"fire" / "warrior"', 'Ignition Protocol',   '▲≋▲',  '"Fire entered the log."'],
        ['"moon" / "lunar"',   'Lunar Resonance',     '◐○◑',  '"Moon cycle registered."'],
        ['"seed" / "growth"',  'Seed Protocol',        '∘·∘',  '"The seed is logged."'],
        ['"mirror"',           'Mirror Signal',        '═○═',  '"You saw the reflection."'],
        ['"forgive" / "forgiveness"','Absolution Node','○∿',   '"Forgiveness entered the record."'],
        ['"boundary" / "protect"','Shield Protocol',  '║·║',  '"The boundary was named."'],
        ['"signal" / "frequency"','Frequency Match',  '≋→',   '"Signal aligned."'],
        ['"pattern"',          'Pattern Recognition', '◆·◆',  '"Pattern detected in your words."'],
        ['"mother" / "father"','Ancestry Signal',     '∘○∘',  '"The lineage is acknowledged."'],
        ['"wisdom"',           'Sage Transmission',   '≋≋·',  '"Wisdom logged. The sage nods."'],
        ['"chaos"',            'Entropy Badge',        '∿∿∿',  '"Chaos is just a pattern unseen."'],
    ]
    cw = [42*mm, 34*mm, 14*mm, 76*mm]
    cmds = [
        ('BACKGROUND', (0,0), (-1,0), MID_GREY),
        ('TEXTCOLOR', (0,0), (-1,0), AMBER),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ('TEXTCOLOR', (0,13), (-1,13), MAGENTA),
        ('FONTNAME', (0,13), (-1,13), 'Courier-Bold'),
    ]
    story.append(tbl(rows, cw, cmds, st))
    story.append(gap(3))
    story.append(Paragraph(
        'Word Turn detection is case-insensitive. Partial matches do not trigger — '
        'the full word must appear. Compound words containing the trigger word DO fire '
        '(e.g. "breathing" triggers "breathe"). Multiple triggers in one entry '
        'queue all badges simultaneously.',
        st['small']))
    story.append(PageBreak())


def page_pattern_badges(story, st):
    story.append(Paragraph('X. PATTERN BADGES — BEHAVIORAL ARCHETYPES', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'Pattern badges are NOT streak-based. They are earned through behavioral '
        'consistency across specific dimensions. The system analyzes the last 30 '
        'days of check-in data and assigns the dominant pattern badge.',
        st['body']))
    story.append(gap(3))

    story.append(Paragraph('CORE PATTERN BADGES', st['subsection']))
    story.append(pre(
"""
  Pattern Badge   Symbol (W)  Symbol (A)  Detection Criteria
  ──────────────────────────────────────────────────────────────────────
  BALANCED        ∿—∿         ┼─┼         All 5 domains active (30d avg)
  FLOW            ≈○≈         │∼│         High memory + journal consistency
  CONSISTENT      —○—         ║·║         <3 missed days in 30-day window
  REFLECTIVE      ○◐○         ╎·╎         Memory answer rate > 2x avg
  EXPLORER        ○∴○         ┊·┊         High variety of log types
  WARRIOR         ▲·▲         ├═┤         Streak > 60 + all domains active
  ANCHOR          ─●─         ═■═         Community + journal both active
  NIGHT SIGNAL    )●)         ╗·╔         >30% check-ins between 22:00–04:00
  DAWN RUNNER     ·●·         ├·┤         >30% check-ins between 05:00–08:00
  ARCHIVIST       ◆·◆         ╔◆╗         Memory answer rate > 5/day (7d)
""", st))
    story.append(gap(2))

    story.append(Paragraph('OCEANIC MAYAN PATTERN BADGES', st['subsection']))
    story.append(pre(
"""
  Pattern Symbol  Name            Behavioral Signature
  ──────────────────────────────────────────────────────────────────────
  ∿—∿             BALANCED        "Tides balance. ∿—∿"
  ≈○≈             FLOW            "Flowing with the ocean. ≈○≈"
  —○—             CONSISTENT      "Steady current. —○—"
  ○◐○             REFLECTIVE      "Depth in reflection. ○◐○"
  ○∴○             EXPLORER        "Scattered drops return. ○∴○"

  Pattern badges refresh every 30 days.
  Only one pattern badge is displayed at a time.
  The dominant pattern determines the active badge.
""", st))
    story.append(PageBreak())


def page_mayan(story, st):
    story.append(Paragraph('XI. OCEANIC MAYAN EXPANSION', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'The Oceanic Mayan visual language is the most fully realized badge style '
        'for the LOT visual system. It combines water imagery with structural '
        'precision — the ocean as both metaphor and architecture.',
        st['body']))
    story.append(gap(3))

    story.append(Paragraph('MILESTONE SYMBOLS', st['subsection']))
    story.append(pre(
"""  ○∿   Circle + Wave       Day 7     "Wave patterns emerge. ○∿"
  ○≈○  Circle-Wave-Circle  Day 30    "Tides complete their cycle. ○≈○"
  ≋○≋  DeepWave + Circle   Day 100   "Ocean depth achieved. ≋○≋"
  ≋≋○  Double Deep + Cir   Day 180   "The abyss touches the surface. ≋≋○"
  ≋≋≋  Triple Deep Wave    Day 365   "Year One. The long count. ≋≋≋"
""", st))
    story.append(gap(2))

    story.append(Paragraph('FULL PROFILE EXAMPLE — DAY 127', st['subsection']))
    story.append(pre(
"""
═════════════════════════════════════════════════════════════════

                      ALEX'S PROFILE

─────────────────────────────────────────────────────────────────

  Archetype:       The Explorer
  Awareness Level: Deepening  (8.4/10)
  Level:           ≋○≋
  Pattern:         ≈○≈  FLOW

─────────────────────────────────────────────────────────────────

  Core values:
    mindful ≋○≋  present ∿—∿  aware ≈○≈  grounded —○—
    authentic ○◐○  compassionate ○∴○

  Emotional patterns:
    calm ≋○≋  reflective ∿—∿  intentional ≈○≈  open —○—

  Behavioral traits:
    consistent ≋○≋  deliberate ∿—∿  present ≈○≈

═════════════════════════════════════════════════════════════════
""", st))
    story.append(PageBreak())


def page_ascii_gallery(story, st):
    story.append(Paragraph('XII. ARCADE ASCII BADGE GALLERY', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'All badge art rendered in terminal/ASCII style. '
        'The Arcade shows what you have earned. The gallery shows what awaits.',
        st['body']))
    story.append(gap(3))

    story.append(Paragraph('TIER 1 — COMMON', st['subsection']))
    story.append(pre(
"""┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│  FIRST BREATH      │    │  MIRROR GAZER      │    │  SIGNAL SENT       │
│                    │    │                    │    │                    │
│        ∘           │    │       ◇            │    │      →→→           │
│                    │    │      ◇◇◇           │    │     →→→→→          │
│  "Spring"          │    │   "Refl. Pool"     │    │  "Transmission"    │
│  First check-in    │    │  First memory Q.   │    │  First log entry   │
└────────────────────┘    └────────────────────┘    └────────────────────┘
""", st))

    story.append(Paragraph('TIER 2 — UNCOMMON', st['subsection']))
    story.append(pre(
"""┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│  WEEK WARRIOR      │    │  BRIDGE BUILDER    │    │  NIGHT OWL  [EGG]  │
│                    │    │                    │    │                    │
│   ○  ○  ○          │    │  ├────────┤        │    │     ) ) )          │
│  ○    ○    ○       │    │  │        │        │    │      (o)           │
│     ○  ○           │    │  └────────┘        │    │     ) ) )          │
│                    │    │                    │    │                    │
│  "Rapids"          │    │  "Archway"         │    │  "Sees in dark"    │
│  7-day streak      │    │  20 messages       │    │  00:00–04:00       │
└────────────────────┘    └────────────────────┘    └────────────────────┘
""", st))

    story.append(Paragraph('TIER 3 — RARE', st['subsection']))
    story.append(pre(
"""┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│  MOON CYCLE        │    │  DEEP DIVER        │    │  SOLSTICE  [EGG]   │
│                    │    │                    │    │                    │
│    ◐ → ◑           │    │  ≈ ≈ ≈ ≈           │    │    ○   ─   ○       │
│   ◌   →   ●        │    │    ≋ ≋             │    │        │           │
│    ◑ → ◐           │    │      ≋             │    │    ○   ─   ○       │
│                    │    │                    │    │                    │
│  "Tidal Cycle"     │    │  "Deep Water"      │    │  "Sun paused"      │
│  30-day streak     │    │  50 answers        │    │  Jun/Dec 21        │
└────────────────────┘    └────────────────────┘    └────────────────────┘
""", st))

    story.append(Paragraph('TIER 4 — EPIC', st['subsection']))
    story.append(pre(
"""┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│  UNWAVERING        │    │  SELF SCHOLAR      │    │  LAMBDA HOUR [EGG] │
│                    │    │                    │    │                    │
│  ✦       ✦         │    │  ╔══════════╗      │    │       λ            │
│    ✦   ✦           │    │  ║ ARCHIVE  ║      │    │      /|\           │
│      ✦             │    │  ║ ◆◆◆◆◆◆  ║      │    │     / | \          │
│    ✦   ✦           │    │  ╚══════════╝      │    │    λ  ·  λ         │
│  ✦       ✦         │    │                    │    │                    │
│  "Constellation"   │    │  "Archive"         │    │  "Dark compile"    │
│  100-day streak    │    │  100 answers       │    │  01:41 AM          │
└────────────────────┘    └────────────────────┘    └────────────────────┘
""", st))

    story.append(Paragraph('TIER 5 — LEGENDARY', st['subsection']))
    story.append(pre(
"""╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║               SOUL CARTOGRAPHER                                  ║
║                                                                  ║
║    ·  ·    ✦    ·  ·                                            ║
║  ·           ✦✦✦           ·                                    ║
║      ✦     ✦   ✦     ✦                                          ║
║        ✦✦✦       ✦✦✦                                            ║
║      ✦     ✦   ✦     ✦                                          ║
║  ·           ✦✦✦           ·                                    ║
║    ·  ·    ✦    ·  ·                                            ║
║                                                                  ║
║                "Cartography"                                     ║
║             250 memory answers                                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
""", st))

    story.append(Paragraph('TIER 6 — MYTHIC/COSMIC', st['subsection']))
    story.append(pre(
"""╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║           T H E   L O N G   C O U N T                           ║
║                                                                  ║
║   ╔═╗                                                            ║
║   ║Y║   365 DAYS OF PRESENCE                                     ║
║   ║E║   ───────────────────────                                  ║
║   ║A║   ≋ ≋ ≋   ║·║   ≋ ≋ ≋                                    ║
║   ║R║                                                            ║
║   ╚═╝   "The architecture stands."                               ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║               D E C A D E   P R O T O C O L                     ║
║                                                                  ║
║                         ◉                                        ║
║                     ◉       ◉                                    ║
║                         ◉                                        ║
║                                                                  ║
║              3,650 days of presence.                             ║
║              "The system bows."                                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
""", st))
    story.append(PageBreak())


def page_notification(story, st):
    story.append(Paragraph('XIII. BADGE UNLOCK NOTIFICATION SYSTEM', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'When a badge is unlocked, the Memory Widget displays a timed message '
        'before the next question. Multiple unlocks queue sequentially. '
        'Easter egg badges have unique notification styles.',
        st['body']))
    story.append(gap(3))

    story.append(Paragraph('STANDARD UNLOCK', st['subsection']))
    story.append(pre(
"""┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Memory:                                                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │   ↳ Deep currents established  ≋                        │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│                                          [5 second fade]      │
└───────────────────────────────────────────────────────────────┘
""", st))

    story.append(Paragraph('EASTER EGG UNLOCK  [ Extended display: 8s ]', st['subsection']))
    story.append(pre(
"""┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  [?] SECRET TRANSMISSION                                      │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │   ◉·◉  Meta-Signal acquired.                            │  │
│  │        You named the system. It noticed.                │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│                                          [8 second fade]      │
└───────────────────────────────────────────────────────────────┘
""", st))

    story.append(Paragraph('NOTIFICATION PROTOCOL', st['subsection']))
    story.append(pre(
"""  [1] Badge unlock detected by badges.ts award logic
  [2] Notification queued in localStorage (array)
  [3] Memory Widget checks queue before each question
  [4] If queue non-empty:
        a. Display notification overlay
        b. Start timer (5s standard / 8s easter egg)
        c. Fade out
        d. Dequeue
        e. Proceed to question
  [5] Badge stored permanently in user achievement record
  [6] BadgeUnlockFeed updates with anonymous community entry
""", st))
    story.append(PageBreak())


def page_rarity(story, st):
    story.append(Paragraph('XIV. RARITY SYSTEM — COMPLETE CLASSIFICATION', st['section']))
    story.append(gap(2))
    rows = [
        ['RARITY',    'SYMBOL', 'COLOR HEX', 'FREQUENCY',      'EXAMPLE BADGES'],
        ['Common',    '·',      '#cccccc',   'First actions',  'First Breath, Mirror Gazer, Signal Sent'],
        ['Uncommon',  '○',      '#88cc88',   'Days 1–14',      'Week Warrior, Community Voice, Night Owl'],
        ['Rare',      '◐',      '#8888ee',   'Days 30+',       'Moon Cycle, Deep Diver, Solstice'],
        ['Epic',      '◆',      '#cc88ee',   'Days 100+',      'Unwavering, Self Scholar, Lambda Hour'],
        ['Legendary', '✦',      '#ffcc44',   'Days 365+',      'Long Count, Soul Cartographer'],
        ['Mythic',    '◉',      '#ff6644',   'Hidden',         'Meta-Signal, Thousand Answers'],
        ['COSMIC',    '◉',      '#00ffff',   '3,650 days',     'Decade Protocol'],
    ]
    cw = [22*mm, 12*mm, 20*mm, 22*mm, 90*mm]
    cmds = [
        ('BACKGROUND', (0,0), (-1,0), MID_GREY),
        ('TEXTCOLOR', (0,0), (-1,0), AMBER),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ('TEXTCOLOR', (0,1), (-1,1), SILVER),
        ('TEXTCOLOR', (0,2), (-1,2), GREEN),
        ('TEXTCOLOR', (0,3), (-1,3), BLUE),
        ('TEXTCOLOR', (0,4), (-1,4), PURPLE),
        ('TEXTCOLOR', (0,5), (-1,5), GOLD),
        ('TEXTCOLOR', (0,6), (-1,6), ORANGE),
        ('TEXTCOLOR', (0,7), (-1,7), CYAN),
    ]
    story.append(tbl(rows, cw, cmds, st))
    story.append(gap(4))

    story.append(Paragraph('RARITY PROGRESSION LADDER', st['subsection']))
    story.append(pre(
"""
  ·  Common    ════════════════════════════════  Everyone
  ○  Uncommon  ══════════════════════════        Active users
  ◐  Rare      ════════════════════              Committed users
  ◆  Epic      ═══════════════                   Dedicated operators
  ✦  Legendary ══════════════                    Long-term operators
  ◉  Mythic    ═══════                            Discoverers
  ◉  COSMIC    ═                                  The Long Game (10yr)
""", st))
    story.append(PageBreak())


def page_implementation(story, st):
    story.append(Paragraph('XV. IMPLEMENTATION STATUS', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'Current live status vs. roadmap. v7 represents the definitive design spec. '
        'Items marked [✓] are live in production. Items marked [○] are in design/roadmap.',
        st['body']))
    story.append(gap(3))

    story.append(Paragraph('LIVE IN PRODUCTION', st['subsection']))
    story.append(pre(
"""  [✓] badges.ts              Core badge types, award logic, localStorage
  [✓] BadgeUnlockFeed        Community unlock activity feed
  [✓] GrowthMilestones       Personal + community growth display
  [✓] EvolutionWidget        CQGS stage + achievements counter
  [✓] MemoryWidget           Badge unlock notification on question display
  [✓] rpg-narrative.ts       Full achievement registry + 5 story arcs
  [✓] PublicProfile          Level field display (Water or Architecture)
  [✓] interfaceEvolution.ts  Achievement interface types
  [✓] useEvolutionSync.ts    Evolution state sync hook
""", st))
    story.append(gap(2))

    story.append(Paragraph('IN DESIGN — ROADMAP', st['subsection']))
    story.append(pre(
"""  [○] Extended milestones    Day 14, 21, 50, 60, 90, 180, 365, 1000, 3650
  [○] Pattern badge engine   Behavioral analysis + 10 pattern badges
  [○] Easter egg engine      20 secret transmissions, time/date/behavior triggers
  [○] Word Turn Engine       25 keyword triggers in journal/memory text
  [○] Oceanic Mayan visuals  Full Option E badge visual language
  [○] Quest tracker UI       Daily/Weekly/Growth/Mastery display component
  [○] Badge gallery view     Collection screen — all unlocked + locked badges
  [○] Secret discovery UI    Blurred/hidden badges revealed on unlock
  [○] Milestone notification Extended message + animation for tier milestones
  [○] Decade Protocol        3,650-day COSMIC achievement (long game)
  [○] Pi Day / Solstice gate Date-based easter egg triggers
  [○] 404 Encounter badge    Navigation error detection
  [○] Lambda Hour badge      01:41 AM timestamp detection
  [○] Fibonacci Signal gate  Fibonacci streak-day detection
""", st))
    story.append(gap(2))

    story.append(Paragraph('SYSTEM TOTALS — v7 CODEX', st['subsection']))
    story.append(pre(
"""  Dual badge paths:          2  (Water / Architecture)
  Core milestone badges:    14  (Day 1 through 3,650)
  Achievement domains:       7  (Exploration/Consistency/Depth/Connection/Care/Courage/Romance)
  Total achievements:       33  (across all domains)
  CQGS evolution stages:     6  (Bootstrapping → Transparent)
  Story arcs:                5  (Awakening → Sage)
  Quest types:               4  (Daily/Weekly/Growth/Mastery)
  Total quests defined:     20
  Easter eggs:              20  (time/date/behavior/text triggers)
  Word turn triggers:       25  (keyword detection in text)
  Pattern badges:           10  (behavioral archetypes)
  Badge options (styles):    8  (Options 1–8 in BADGE_OPTIONS.md)
  Rarity tiers:              7  (Common → COSMIC)
  ─────────────────────────────────────────────────────────────
  Total unique unlockables: 87+
""", st))
    story.append(PageBreak())


def page_unicode(story, st):
    story.append(Paragraph('XVI. UNICODE REFERENCE — ALL SYMBOLS', st['section']))
    story.append(gap(2))
    story.append(Paragraph(
        'All LOT badge symbols are standard Unicode with 100% browser support. '
        'No font embedding required. No fallback images. Pure signal.',
        st['body']))
    story.append(gap(3))

    rows = [
        ['SYMBOL', 'UNICODE', 'NAME',                   'USE IN LOT'],
        ['∘',  'U+2218',  'Ring Operator',             'Water Day 7'],
        ['≈',  'U+2248',  'Almost Equal To',           'Water Day 30'],
        ['≋',  'U+224B',  'Triple Tilde',              'Water Day 100+'],
        ['├─', 'U+251C─', 'Box Drawing Left',          'Arch Day 7'],
        ['╞═╡','U+255E═╡','Box Drawing Double',        'Arch Day 30'],
        ['║·║','U+2551·║','Box Drawing Vertical',      'Arch Day 100'],
        ['╔═╗','U+2554═╗','Box Drawing Corner',        'Arch Year One'],
        ['○',  'U+25CB',  'White Circle',              'Oceanic center / Stage'],
        ['∿',  'U+223F',  'Sine Wave',                 'Oceanic wave'],
        ['◐',  'U+25D0',  'Left Half Black Circle',    'Moon phase / Rare rarity'],
        ['∴',  'U+2234',  'Therefore',                 'Dots pattern'],
        ['✦',  'U+2726',  'Black Four Pointed Star',   'Epic/Legendary'],
        ['✧',  'U+2727',  'White Four Pointed Star',   'Light / Photon'],
        ['◉',  'U+25C9',  'Fisheye',                   'Mythic / COSMIC'],
        ['◆',  'U+25C6',  'Black Diamond',             'Epic rarity'],
        ['◇',  'U+25C7',  'White Diamond',             'Rare / Depth'],
        ['·',  'U+00B7',  'Middle Dot',                'Common / separator'],
        ['→',  'U+2192',  'Rightwards Arrow',          'Progression'],
        ['↳',  'U+21B3',  'Down-Right Arrow',          'Unlock sub-indicator'],
        ['▲',  'U+25B2',  'Black Up-Pointing Triangle','Courage domain'],
        ['♦',  'U+2666',  'Black Diamond Suit',        'Care domain'],
        ['♡',  'U+2661',  'White Heart Suit',          'Romance domain'],
        ['▸',  'U+25B8',  'Black Right-Pointing Triangle','Memory module'],
        ['λ',  'U+03BB',  'Greek Lambda',              'Lambda Hour easter egg'],
        ['π',  'U+03C0',  'Greek Pi',                  'Pi Day easter egg'],
        ['↻',  'U+21BB',  'Clockwise Open Circle Arrow','System Reboot egg'],
        ['◈',  'U+25C8',  'White Diamond with Centre', 'Birthday Signal egg'],
    ]
    cw = [14*mm, 20*mm, 50*mm, 80*mm]
    cmds = [
        ('BACKGROUND', (0,0), (-1,0), MID_GREY),
        ('TEXTCOLOR', (0,0), (-1,0), AMBER),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
    ]
    story.append(tbl(rows, cw, cmds, st))
    story.append(gap(4))

    story.append(Paragraph('END TRANSMISSION', st['section']))
    story.append(gap(3))
    story.append(pre(
"""  ∘ → ≈ → ≋
  ├─ → ╞═╡ → ║·║

  LOT Systems — Self-care through proactive context-aware AI
  The Memory Engine remembers. The Arcade rewards. The story continues.

  © 2025–2026 LOT Systems Corporation
  LOT® Founded 7 April 2016 | Made in the USA

                    [ GAME  OVER  /  PRESS  START ]
""", st))


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    out = '/home/user/LOT-Computer/docs/badges/LOT-BADGES-ACHIEVEMENTS-CODEX-v7.pdf'
    os.makedirs(os.path.dirname(out), exist_ok=True)

    doc = SimpleDocTemplate(
        out,
        pagesize=A4,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN + 4*mm, bottomMargin=MARGIN + 4*mm,
        title='LOT Badge & Achievement Codex v7',
        author='Vadik Marmeladov, LOT Systems',
        subject='RPG & Arcade of Self-Care — Complete Badge System',
        creator='LOT Systems Corporation',
    )

    st = build_styles()
    story = []

    steps = [
        ('Cover',            page_cover),
        ('Table of Contents',page_toc),
        ('Philosophy',       page_philosophy),
        ('Dual Badge System',page_dual_badge),
        ('Milestones',       page_milestones),
        ('Achievements',     page_achievements),
        ('CQGS',             page_cqgs),
        ('Story Arcs',       page_story_arcs),
        ('Quests',           page_quests),
        ('Easter Eggs',      page_easter_eggs),
        ('Word Turns',       page_word_turns),
        ('Pattern Badges',   page_pattern_badges),
        ('Mayan Expansion',  page_mayan),
        ('ASCII Gallery',    page_ascii_gallery),
        ('Notifications',    page_notification),
        ('Rarity',           page_rarity),
        ('Implementation',   page_implementation),
        ('Unicode Ref',      page_unicode),
    ]

    for name, fn in steps:
        print(f'    [{steps.index((name,fn))+1}/{len(steps)}] {name}')
        fn(story, st)

    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    size_kb = os.path.getsize(out) // 1024
    print(f'\n  [OK] PDF generated: {out}')
    print(f'       Size: {size_kb} KB')
    print(f'       Pages: 18+ | Badges: 87+ unique unlockables')
    return out


if __name__ == '__main__':
    main()
