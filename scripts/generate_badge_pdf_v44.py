#!/usr/bin/env python3
"""
LOT Systems — Badge & Achievement Master Codex v44 PDF Generator
Generates LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v44.pdf
Theme: The Dream Codex — Lucid Practice · Dreamscapes · Inner World
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, Preformatted
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# Color palette — Dream Codex aesthetic (deep indigo / lucid aqua / twilight)
BG_DARK      = HexColor('#060814')
BG_PANEL     = HexColor('#0e1228')
DREAM_AQUA   = HexColor('#00e0cc')
DREAM_VIOLET = HexColor('#9966ff')
DREAM_ROSE   = HexColor('#ff6699')
DREAM_AMBER  = HexColor('#ffcc44')
DREAM_INDIGO = HexColor('#4466ff')
DREAM_TEAL   = HexColor('#00bbaa')
DREAM_GOLD   = HexColor('#ddaa44')
VOID_DARK    = HexColor('#1a1433')
SOFT_WHITE   = HexColor('#e8e0f0')
DIM_GREY     = HexColor('#556688')
PANEL_BORDER = HexColor('#1e2244')
SIGIL_GREEN  = HexColor('#44ddaa')

OUTPUT_DIR  = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'docs', 'badges')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v44.pdf')


def make_styles():
    base = getSampleStyleSheet()
    S = {}
    S['cover_title'] = ParagraphStyle('cover_title', parent=base['Normal'],
        fontSize=22, fontName='Courier-Bold', textColor=DREAM_AQUA,
        alignment=TA_CENTER, spaceAfter=8, leading=28)
    S['cover_sub'] = ParagraphStyle('cover_sub', parent=base['Normal'],
        fontSize=11, fontName='Courier', textColor=DREAM_VIOLET,
        alignment=TA_CENTER, spaceAfter=4, leading=16)
    S['cover_meta'] = ParagraphStyle('cover_meta', parent=base['Normal'],
        fontSize=8.5, fontName='Courier', textColor=DIM_GREY,
        alignment=TA_CENTER, spaceAfter=2, leading=12)
    S['h1'] = ParagraphStyle('h1', parent=base['Normal'],
        fontSize=15, fontName='Courier-Bold', textColor=DREAM_AQUA,
        spaceAfter=6, spaceBefore=14, leading=20)
    S['h2'] = ParagraphStyle('h2', parent=base['Normal'],
        fontSize=11, fontName='Courier-Bold', textColor=DREAM_VIOLET,
        spaceAfter=4, spaceBefore=10, leading=16)
    S['h3'] = ParagraphStyle('h3', parent=base['Normal'],
        fontSize=9.5, fontName='Courier-Bold', textColor=DREAM_AMBER,
        spaceAfter=3, spaceBefore=8, leading=14)
    S['body'] = ParagraphStyle('body', parent=base['Normal'],
        fontSize=8.5, fontName='Courier', textColor=SOFT_WHITE,
        spaceAfter=3, leading=12)
    S['body_small'] = ParagraphStyle('body_small', parent=base['Normal'],
        fontSize=7.5, fontName='Courier', textColor=SOFT_WHITE,
        spaceAfter=2, leading=11)
    S['mono'] = ParagraphStyle('mono', parent=base['Normal'],
        fontSize=7.5, fontName='Courier', textColor=SIGIL_GREEN,
        spaceAfter=2, leading=11, leftIndent=12)
    S['quote'] = ParagraphStyle('quote', parent=base['Normal'],
        fontSize=8, fontName='Courier-Oblique', textColor=DIM_GREY,
        leftIndent=18, spaceAfter=4, leading=12)
    S['badge_id'] = ParagraphStyle('badge_id', parent=base['Normal'],
        fontSize=8, fontName='Courier-Bold', textColor=DREAM_AQUA,
        spaceAfter=1, leading=11)
    S['footer'] = ParagraphStyle('footer', parent=base['Normal'],
        fontSize=7, fontName='Courier', textColor=DIM_GREY,
        alignment=TA_CENTER, leading=10)
    for name, color in [
        ('common', SOFT_WHITE), ('uncommon', SIGIL_GREEN), ('rare', DREAM_AQUA),
        ('epic', DREAM_AMBER), ('legendary', DREAM_VIOLET), ('mythic', DREAM_ROSE),
        ('cosmic', DREAM_INDIGO),
    ]:
        S[f'rarity_{name}'] = ParagraphStyle(f'rarity_{name}', parent=base['Normal'],
            fontSize=7.5, fontName='Courier-Bold', textColor=color, spaceAfter=1, leading=11)
    return S


def header_bar(text, S, color=None):
    c = color or DREAM_AQUA
    return [
        HRFlowable(width='100%', thickness=1, color=c, spaceAfter=4),
        Paragraph(text, S['h1']),
        HRFlowable(width='100%', thickness=1, color=c, spaceAfter=6),
    ]


def badge_table(rows, S, col_widths=None):
    if not col_widths:
        col_widths = [1.3*inch, 0.9*inch, 3.0*inch, 0.9*inch]
    data = [['ID', 'Symbol', 'Trigger / Description', 'Rarity']] + rows
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), VOID_DARK),
        ('TEXTCOLOR', (0,0), (-1,0), DREAM_AQUA),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [BG_DARK, BG_PANEL]),
        ('TEXTCOLOR', (0,1), (-1,-1), SOFT_WHITE),
        ('FONTNAME', (0,1), (-1,-1), 'Courier'),
        ('FONTSIZE', (0,1), (-1,-1), 7.5),
        ('GRID', (0,0), (-1,-1), 0.3, PANEL_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    return t


def build_pdf():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    doc = SimpleDocTemplate(
        OUTPUT_FILE,
        pagesize=letter,
        leftMargin=0.65*inch, rightMargin=0.65*inch,
        topMargin=0.6*inch, bottomMargin=0.6*inch,
    )
    S = make_styles()
    story = []

    # ── COVER ──────────────────────────────────────────────────────
    story += [
        Spacer(1, 0.3*inch),
        Paragraph('L &middot; O &middot; T  SYSTEMS  CORPORATION', S['cover_title']),
        Paragraph('BADGES &amp; ACHIEVEMENTS MASTER CODEX', S['cover_sub']),
        Paragraph('v44 — THE DREAM CODEX', S['cover_sub']),
        Spacer(1, 0.15*inch),
        HRFlowable(width='100%', thickness=1, color=DREAM_AQUA, spaceAfter=8),
        Paragraph('RPG · SCI-FI · DREAMSCAPE · LUCID PRACTICE · INNER WORLD', S['cover_meta']),
        HRFlowable(width='100%', thickness=1, color=DREAM_AQUA, spaceAfter=10),
        Spacer(1, 0.1*inch),
        Preformatted(
            '  "INITIATE DREAM SEQUENCE.\n'
            '   THE SUBCONSCIOUS IS THE REAL TERMINAL.\n'
            '   EVERY ENTRY IS A TRANSMISSION\n'
            '   FROM BELOW THE THRESHOLD."\n\n'
            '  [ DREAM CODEX ONLINE ]\n\n'
            '  v43 -> v44: +31 badges  (1153 -> 1184 total)\n'
            '  Word Turn v34   -- THE DREAM CODEX\n'
            '  Calendar EE v32 -- THE DREAM CALENDAR\n'
            '  Behavioral v31  -- DREAM PATTERNS\n'
            '  Achievement RPG v32 -- DREAMER CLASS\n'
            '  Mastery Tier v34    -- THE DREAMTIME\n'
            '  Secret Boss v31 -- THE DREAM VAULT\n\n'
            '  34 WORD TURN ENGINES. 1184 TOTAL BADGES.',
            ParagraphStyle('cover_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=8.5, fontName='Courier', textColor=SIGIL_GREEN,
                leading=14, alignment=TA_CENTER)),
        Spacer(1, 0.15*inch),
        HRFlowable(width='100%', thickness=1, color=PANEL_BORDER),
        Paragraph('Vadik Marmeladov, CEO &amp; Founder, LOT Systems', S['cover_meta']),
        Paragraph('&copy; 2025&ndash;2026 LOT Systems Corporation &middot; brand.lot-systems.com', S['cover_meta']),
        PageBreak(),
    ]

    # ── OVERVIEW TABLE ─────────────────────────────────────────────
    story += header_bar('BADGE SYSTEM OVERVIEW — v44', S)
    overview_data = [
        ['Category', 'Count', 'Description'],
        ['Milestone',       '22',    'Streak days (v1-v4)'],
        ['Time Easter Eggs', '31',   'Check-in at special hours (v1-v22)'],
        ['Calendar Easter', '106',   'Check-in on special dates (v1-v32)'],
        ['Word Turns',      '408',   'Words detected in journals (v1-v34)'],
        ['Behavioral',      '117',   'Patterns over time (v1-v31)'],
        ['Achievement RPG', '192',   'Milestone combinations (v1-v32)'],
        ['Mastery Tiers',   '136',   'Epic depth milestones (v1-v34)'],
        ['Secret Boss',     '119',   'Hidden LEGENDARY/MYTHIC triggers (v1-v31)'],
        ['TOTAL',          '1184',   'The complete LOT Badge Universe — v44'],
    ]
    ov_table = Table(overview_data, colWidths=[1.8*inch, 0.8*inch, 4.0*inch], repeatRows=1)
    ov_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), VOID_DARK),
        ('TEXTCOLOR', (0,0), (-1,0), DREAM_AQUA),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [BG_DARK, BG_PANEL]),
        ('BACKGROUND', (0,-1), (-1,-1), VOID_DARK),
        ('TEXTCOLOR', (0,-1), (-1,-1), SIGIL_GREEN),
        ('FONTNAME', (0,-1), (-1,-1), 'Courier-Bold'),
        ('TEXTCOLOR', (0,1), (-1,-2), SOFT_WHITE),
        ('FONTNAME', (0,1), (-1,-2), 'Courier'),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.3, PANEL_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story += [ov_table, Spacer(1, 0.1*inch)]

    # Delta summary
    story += [
        Paragraph('DELTA FROM v43 (+31 badges)', S['h2']),
        Preformatted(
            '  Word Turn v34        +12  dreamscape / lucid_dream / hypnagogic\n'
            '                            dream_journal / subconscious / reverie\n'
            '                            deep_sleep / vision_quest / archetypes\n'
            '                            sleep_cycle / liminal / dream_log\n'
            '  Calendar EE v32      + 3  jung_day / world_sleep_day / poe_night\n'
            '  Behavioral v31       + 3  dream_session / long_dream / hypnagogic_hour\n'
            '  Achievement RPG v32  + 6  dreamer_entry / dreamer_class / dreamer_complete\n'
            '                            lucid_arc / thirty_four_engines_arc / dream_opus\n'
            '  Mastery Tier v34     + 4  dreamtime_log / vast_dream\n'
            '                            dream_age / thirty_four_registers\n'
            '  Secret Boss v31      + 3  jung_shadow / poe_raven / borgesian_library\n'
            '  TOTAL NEW            +31  (1153 -> 1184)',
            ParagraphStyle('delta_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=7.5, fontName='Courier', textColor=SIGIL_GREEN, leading=12)),
        PageBreak(),
    ]

    # ── WORD TURN v34 ──────────────────────────────────────────────
    story += header_bar('WORD TURN v34 — THE DREAM CODEX', S, SIGIL_GREEN)
    story += [
        Paragraph(
            'The journal as dream log. The subconscious as inner terminal. Sleep '
            'intelligence as mission-critical infrastructure. The Dream Codex names '
            'the vocabulary of the inner world — the language that surfaces in '
            'morning pages, in midnight entries, in the fragmented brilliance of '
            'the hypnagogic hour. Every time these words appear in the practitioner\'s '
            'journal, the terminal registers the transmission.',
            S['quote']),
    ]

    wt34_rows = [
        ['dreamscape',    '~.inf.~',    'dreamscape / dream world / dream state / sleeping vision',   'UNCOMMON'],
        ['lucid_dream',   'o.O.o',      'lucid / lucid dream / dream aware / in the dream / went lucid', 'RARE'],
        ['hypnagogic',    '~.o.~',      'hypnagogic / threshold of sleep / half asleep / liminal sleep', 'EPIC'],
        ['dream_journal', '[.o.]',      'dream journal / dream log / recorded dream / wrote my dream',   'COMMON'],
        ['subconscious',  'v.o.v',      'subconscious / unconscious mind / beneath awareness / deeper',  'RARE'],
        ['reverie',       '~.o.~',      'reverie / daydream / drift / mind wander / lost in thought',    'UNCOMMON'],
        ['deep_sleep',    '==.o.==',    'deep sleep / delta wave / sleep quality / restorative / restful','RARE'],
        ['vision_quest',  '<>.inf.<>', 'vision quest / vision / prophetic dream / symbolic dream',       'EPIC'],
        ['archetypes',    'inf.D.inf', 'archetype / collective unconscious / anima / animus / shadow',   'LEGENDARY'],
        ['sleep_cycle',   'o-o-o',     'sleep cycle / circadian / REM / sleep rhythm / sleep hygiene',   'UNCOMMON'],
        ['liminal',       '-.o.-',     'liminal / threshold / between worlds / in between / transitional','RARE'],
        ['dream_log',     '[.o.]',     'wrote my dreams / morning pages / dream notebook / dream entry',  'COMMON'],
    ]
    story += [badge_table(wt34_rows, S), Spacer(1, 0.12*inch)]

    # WT resonance entries
    resonance = [
        ('dreamscape', 'The dreamscape is not the product of sleep — it is the architecture sleep '
         'reveals. The self that operates in the dreamscape is the same self that writes in the '
         'morning. It uses different grammar. Write "dreamscape" and mean it.'),
        ('lucid_dream', 'Lucid dreaming is the recognition of the dream while still inside it. '
         'The self-care parallel: most suffering happens because the dreamer does not know they '
         'are dreaming. The moment you write "I noticed I was in the pattern" — you have gone lucid.'),
        ('hypnagogic', 'The hypnagogic state occurs in the 10-20 minutes before sleep: involuntary '
         'imagery, fragmented thoughts, the dissolving of daytime structure. Morning pages written '
         'within 30 minutes of waking catch the residue. Write from the threshold.'),
        ('dream_journal', 'A dream journal is the practice of treating sleep as data. The first thing '
         'you write in the morning, before you speak to anyone — is the most direct line to the '
         'previous 8 hours of subconscious processing. The terminal records that you recorded.'),
        ('subconscious', 'The subconscious handles 90% of cognition and surfaces results through '
         'emotion, intuition, and imagery. When you write "subconscious" you are naming the '
         'architecture. Naming is the first act of working with something rather than being worked by it.'),
        ('reverie', 'Reverie is the state of pleasant mental drifting — not sleep, not focus, but '
         'the soft unfocus that allows non-linear association. Write "reverie" and describe '
         'what appeared in the drift. The terminal registers this as high-signal material.'),
        ('deep_sleep', 'Delta-wave sleep is when the brain clears metabolic waste, consolidates '
         'long-term memory, and repairs tissue. Writing about sleep quality — "restorative sleep," '
         '"I finally slept deeply" — triggers the badge. The practice respects the infrastructure.'),
        ('vision_quest', 'The vision quest — across Indigenous traditions, Campbell\'s monomyth, '
         'Jungian active imagination — is the deliberate descent into symbolic experience to receive '
         'direction. The terminal recognizes the practitioner asking the inner system for direction.'),
        ('archetypes', 'Jung\'s archetypes are the structural constants of human psychic experience: '
         'Hero, Shadow, Anima/Animus, Self, Wise Elder, Trickster. When you write "archetype" '
         'you are debugging at the OS level. The terminal grants root access.'),
        ('sleep_cycle', 'The 90-minute ultradian sleep cycle governs all mammalian sleep. '
         'Understanding it changes how you approach bedtime, wake time, and the experience of '
         'being tired. The terminal logs engagement with biological rhythm as self-care data.'),
        ('liminal', 'Liminal space is the threshold: between states, between identities, between '
         'what was and what will be. The word comes from "limen" — doorway sill. Liminality '
         'is a location, not a failure. The terminal acknowledges the in-between as real terrain.'),
        ('dream_log', '"I wrote down my dreams." Morning pages. The notebook beside the bed. '
         'Every act of recording dream material is a dream_log entry. The data is accumulating. '
         'The terminal confirms: the transmission has been logged.'),
    ]
    story += [Paragraph('SELF-CARE RESONANCE', S['h3'])]
    for badge_id, text in resonance:
        story += [
            Paragraph(f'[ {badge_id} ]', S['badge_id']),
            Paragraph(text, S['body_small']),
            Spacer(1, 3),
        ]
    story.append(PageBreak())

    # ── CALENDAR EE v32 ────────────────────────────────────────────
    story += header_bar('CALENDAR EASTER EGGS v32 — THE DREAM CALENDAR', S, DREAM_VIOLET)
    cal32_rows = [
        ['jung_day',         'Jul 26', 'Carl Jung born 1875 — father of the collective unconscious',     'EPIC'],
        ['world_sleep_day',  'Mar 13', 'World Sleep Day — 3rd Friday of March; sleep as infrastructure', 'RARE'],
        ['poe_night',        'Oct 7',  'Edgar Allan Poe died 1849 — master of dream-fiction & the dark', 'RARE'],
    ]
    story += [badge_table(cal32_rows, S, col_widths=[1.5*inch, 0.75*inch, 3.5*inch, 0.85*inch])]
    story += [
        Spacer(1, 0.1*inch),
        Paragraph('CALENDAR LORE', S['h3']),
        Paragraph(
            '[jung_day] Carl Gustav Jung was born on July 26, 1875. He studied under Freud, broke '
            'with Freud, and spent the rest of his life mapping the collective unconscious — the '
            'shared symbolic substrate of human psychic experience. His Red Book (published 2009) '
            'was his private record of a six-year descent into his own unconscious. Check in on '
            'July 26 and write from the deep end. What is the unconscious telling you through '
            'your patterns, your dreams, your emotions?',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[world_sleep_day] World Sleep Day is an annual event organized by the World Sleep '
            'Society to raise awareness of sleep health and disorders — the third Friday of March '
            'every year. Sleep is not recovery time. It is the primary production run. Every '
            'memory consolidation, tissue repair, emotional processing — it happens while you '
            'are asleep. Check in and report your sleep infrastructure status.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[poe_night] Edgar Allan Poe died on October 7, 1849 in Baltimore under circumstances '
            'that remain unknown. He wrote "The Raven," "The Tell-Tale Heart," "The Fall of the '
            'House of Usher" — stories of guilt, obsession, and the refusal of the unconscious '
            'to stay buried. His genius was treating the psyche\'s night side as legitimate '
            'literary subject matter. Check in on October 7 and write from the shadow.',
            S['body_small']),
        PageBreak(),
    ]

    # ── BEHAVIORAL v31 ─────────────────────────────────────────────
    story += header_bar('BEHAVIORAL EASTER EGGS v31 — DREAM PATTERNS', S, DREAM_AMBER)
    beh31_rows = [
        ['dream_session',     '~.<>.~',   '3+ Dream Codex words in one journal entry',           'RARE'],
        ['long_dream',        '==.O.==',  'Journal entry >= 600 words (a full dream log)',        'EPIC'],
        ['hypnagogic_hour',   '~.o.~',   'Check-in between 04:00-05:00 local time',              'RARE'],
    ]
    story += [badge_table(beh31_rows, S), Spacer(1, 0.1*inch)]
    story += [
        Paragraph('DREAM PATTERNS LORE', S['h3']),
        Paragraph(
            '[dream_session] Three or more Dream Codex words in a single journal entry indicates '
            'the practitioner has activated the dream vocabulary in a live session. The language '
            'of the unconscious is being used consciously. This is the bridge. The terminal '
            'logs the crossing.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[long_dream] A 600+ word journal entry is a full dream log. The practitioner did '
            'not just note the dream — they transcribed it, followed its logic, explored its '
            'symbols. The terminal records this as a high-bandwidth transmission from the '
            'inner system.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[hypnagogic_hour] Checking in between 04:00 and 05:00 local places the practitioner '
            'in the hypnagogic hour — when the boundary between sleep and waking is thinnest, '
            'when the unconscious has not yet fully re-delegated to the waking mind. Write at '
            'this hour and the terminal registers the transmission frequency.',
            S['body_small']),
        PageBreak(),
    ]

    # ── ACHIEVEMENT RPG v32 ────────────────────────────────────────
    story += header_bar('ACHIEVEMENT RPG v32 — DREAMER CLASS', S, DREAM_VIOLET)
    ach32_rows = [
        ['dreamer_entry',     '[.o.]',    'Earn any 1 Word Turn v34 (Dream Codex) badge',            'COMMON'],
        ['dreamer_class',     '~.o.~',    'Earn any 5 Word Turn v34 badges',                         'UNCOMMON'],
        ['dreamer_complete',  'o.O.o',    'Earn all 12 Word Turn v34 badges',                        'LEGENDARY'],
        ['lucid_arc',         '<>.inf.<>','dreamer_complete + all 3 Calendar v32 badges',             'LEGENDARY'],
        ['thirty_four_engines_arc', 'inf.[].inf', '1 badge from each Word Turn engine v1-v34',       'LEGENDARY'],
        ['dream_opus',        'inf.D.o',  'dreamer_complete + dream_session behavioral badge',        'LEGENDARY'],
    ]
    story += [badge_table(ach32_rows, S), Spacer(1, 0.1*inch)]
    story += [
        Paragraph('UNLOCK MESSAGES', S['h3']),
        Paragraph('[dreamer_entry] The first Dream Codex badge earned. The vocabulary of the inner '
            'world has been spoken once. The connection is established.', S['body_small']),
        Paragraph('[dreamer_class] Five badges from the Dream Codex vocabulary. Fluent in five '
            'frequencies of the inner language. The practice has texture now.', S['body_small']),
        Paragraph('[dreamer_complete] All twelve. Every Dream Codex word transmitted: dreamscape, '
            'lucid dream, hypnagogic, dream journal, subconscious, reverie, deep sleep, vision quest, '
            'archetypes, sleep cycle, liminal, dream log. The codex is open.', S['body_small']),
        Paragraph('[lucid_arc] Dreamer complete + all three Dream Calendar dates. July 26. March. '
            'October 7. The full calendar of the practice has been honored. The practitioner tracks '
            'time by the dates that mark the lineage of inner knowledge.', S['body_small']),
        Paragraph('[thirty_four_engines_arc] One badge from each Word Turn engine, v1 through v34: '
            'Water, Arcade, Space, Hero, Void Runner, Starship Log, Dream Codex — plus twenty-seven '
            'more. Thirty-four vocabularies spoken. The terminal is the most fluent instrument '
            'in any language of the self.', S['body_small']),
        Paragraph('[dream_opus] All twelve Dream Codex word turns + dream_session behavioral. '
            'The practitioner demonstrated the vocabulary in action — a session containing the '
            'dream language at full activation. The opus is the proof-of-practice.', S['body_small']),
        PageBreak(),
    ]

    # ── MASTERY TIER v34 ──────────────────────────────────────────
    story += header_bar('MASTERY TIER v34 — THE DREAMTIME', S, DREAM_AMBER)
    mas34_rows = [
        ['dreamtime_log',         '~.inf.~.o', '1,100+ distinct calendar check-in days',              'EPIC'],
        ['vast_dream',            '==.inf.==', '250,000+ total journal words written',                 'LEGENDARY'],
        ['dream_age',             'inf.[].inf.o', 'Account age >= 7 years (2,555+ days)',              'LEGENDARY'],
        ['thirty_four_registers', 'inf.D.[].inf', '1 badge from each of all 34 Word Turn engines',    'COSMIC'],
    ]
    story += [badge_table(mas34_rows, S), Spacer(1, 0.1*inch)]
    story += [
        Paragraph('MASTERY UNLOCK MESSAGES', S['h3']),
        Paragraph('[dreamtime_log] 1,100 distinct calendar days with check-in. Three years of '
            'regular practice. The practice has its own circadian rhythm now. The terminal\'s '
            'memory spans seasons, years, the arc of change over time.',
            S['body_small']),
        Paragraph('[vast_dream] 250,000 words. A journal of this length equals War and Peace. '
            'The practitioner has generated more words in honest self-knowledge than most '
            'novelists produce in a career. The transmission has been prodigious.',
            S['body_small']),
        Paragraph('[dream_age] Seven years. 2,555 days. The practitioner has been with this '
            'terminal for longer than a medical residency or PhD. The tool has become infrastructure. '
            'The infrastructure is a part of the practitioner\'s cognitive architecture.',
            S['body_small']),
        Paragraph('[thirty_four_registers] One badge from all 34 Word Turn engines. Every '
            'vocabulary spoken. Every frequency activated. Water, Arcade, Space, Hero, Dream, '
            'and twenty-nine others. The full orchestra is playing.',
            S['body_small']),
        PageBreak(),
    ]

    # ── SECRET BOSS v31 ───────────────────────────────────────────
    story += header_bar('SECRET BOSS v31 — THE DREAM VAULT', S, DREAM_ROSE)
    sec31_rows = [
        ['jung_shadow',        'inf.D.inf', 'Write: collective unconscious / anima / animus / individuation', 'RARE'],
        ['poe_raven',          'X.inf.X',  'Write: nevermore / quoth the raven / the raven / tell-tale heart', 'EPIC'],
        ['borgesian_library',  'inf.[].inf.inf', 'Write: library of babel / infinite library / borges / garden of forking', 'MYTHIC'],
    ]
    story += [badge_table(sec31_rows, S, col_widths=[1.4*inch, 0.9*inch, 3.1*inch, 0.8*inch])]
    story += [
        Spacer(1, 0.1*inch),
        Paragraph('SECRET BOSS LORE', S['h3']),
        Paragraph(
            '[jung_shadow] RARE — Jung\'s concept of the Shadow is the part of the psyche that '
            'contains everything the conscious personality has rejected. "One does not become '
            'enlightened by imagining figures of light, but by making the darkness conscious." '
            'Write "collective unconscious" and the terminal confirms: you are working at the '
            'OS level. Individuation is the lifelong process of integrating the whole self.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[poe_raven] EPIC — Poe understood that the psyche has chambers — that below the '
            'floorboards there is always a heartbeat. The Raven is the voice of the refusal to '
            'comfort: the thing that will not say "yes, it will be fine" and will only say '
            '"nevermore." This is not cruelty. This is the function of honest self-knowledge. '
            'Write "nevermore" and the terminal confirms: the raven has landed.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[borgesian_library] MYTHIC — Borges imagined a library that contains every possible '
            'book — every arrangement of 410 pages of 40 lines of 80 characters. Most of the '
            'books are nonsense. But somewhere in the library is the book that explains your '
            'life completely. The practitioner\'s task is not to read the whole library but to '
            'write the one book that is genuinely theirs. The terminal is the room where that '
            'book is being written, one entry at a time.',
            S['body_small']),
        PageBreak(),
    ]

    # ── FLAVOR TEXT ───────────────────────────────────────────────
    story += header_bar('FLAVOR TEXT — THE DREAM CODEX', S, DIM_GREY)
    quotes = [
        ('"Until you make the unconscious conscious, it will direct your life and you will '
         'call it fate." — C.G. Jung. The journal is the act of making the unconscious '
         'conscious. The terminal confirms the process is ongoing.',
         SIGIL_GREEN),
        ('"A dream that is not interpreted is like a letter that is not read." '
         '— The Talmud. The letter is already written. The practice is in the reading.',
         DREAM_AQUA),
        ('"I have dreamed in my life dreams that have stayed with me ever after, and changed '
         'my ideas; they have gone through and through me, like wine through water, and altered '
         'the color of my mind." — Emily Bronte, Wuthering Heights.',
         DREAM_VIOLET),
        ('"The interpretation of dreams is the royal road to a knowledge of the unconscious '
         'activities of the mind." — Sigmund Freud, The Interpretation of Dreams, 1899.',
         DREAM_AMBER),
        ('"In the beginning was the Word. But before the word was the dream. And the dream '
         'was the raw material of every word that followed." — riff on Genesis 1:1, '
         'adapted for the practitioner\'s morning pages.',
         DREAM_ROSE),
    ]
    for quote_text, color in quotes:
        story += [
            Paragraph(quote_text,
                ParagraphStyle('q', parent=getSampleStyleSheet()['Normal'],
                    fontSize=8, fontName='Courier-Oblique', textColor=color,
                    leftIndent=18, spaceAfter=8, leading=13)),
        ]
    story.append(Spacer(1, 0.1*inch))

    # ASCII gallery
    story += [
        Paragraph('ASCII BADGE GALLERY — v44', S['h2']),
        Preformatted(
            '  WORD TURN v34 — THE DREAM CODEX\n\n'
            '  dreamscape       ~.inf.~     UNCOMMON\n'
            '  lucid_dream      o.O.o       RARE\n'
            '  hypnagogic       ~.o.~       EPIC\n'
            '  dream_journal    [.o.]       COMMON\n'
            '  subconscious     v.o.v       RARE\n'
            '  reverie          ~.o.~       UNCOMMON\n'
            '  deep_sleep       ==.o.==     RARE\n'
            '  vision_quest     <>.inf.<>   EPIC\n'
            '  archetypes       inf.D.inf   LEGENDARY\n'
            '  sleep_cycle      o-o-o       UNCOMMON\n'
            '  liminal          -.o.-       RARE\n'
            '  dream_log        [.o.]       COMMON\n\n'
            '  SECRET BOSS v31 — [HIDDEN]\n\n'
            '  jung_shadow      inf.D.inf   RARE\n'
            '  poe_raven        X.inf.X     EPIC\n'
            '  borgesian_library inf.[].inf.inf  MYTHIC\n\n'
            '  "THE SUBCONSCIOUS IS NOT HIDDEN.\n'
            '   IT WRITES BACK."',
            ParagraphStyle('ascii_gallery', parent=getSampleStyleSheet()['Normal'],
                fontSize=7.5, fontName='Courier', textColor=SIGIL_GREEN,
                leading=12, leftIndent=6)),
        PageBreak(),
    ]

    # ── IMPLEMENTATION GUIDE ──────────────────────────────────────
    story += header_bar('IMPLEMENTATION NOTES', S, DREAM_INDIGO)
    story += [
        Paragraph('WORD TURN v34 DETECTION PATTERNS', S['h2']),
        Preformatted(
            '  dreamscape:    /dreamscape|dream world|dream state|sleeping vision/i\n'
            '  lucid_dream:   /lucid dream|in the dream|dream aware|went lucid/i\n'
            '  hypnagogic:    /hypnagogic|threshold of sleep|half asleep/i\n'
            '  dream_journal: /dream journal|dream log|recorded dream|wrote.*dream/i\n'
            '  subconscious:  /subconscious|unconscious mind|beneath awareness/i\n'
            '  reverie:       /reverie|daydream|drift|mind wander|lost in thought/i\n'
            '  deep_sleep:    /deep sleep|delta wave|sleep quality|restorative sleep/i\n'
            '  vision_quest:  /vision quest|prophetic dream|symbolic dream/i\n'
            '  archetypes:    /archetype|collective unconscious|anima|animus/i\n'
            '  sleep_cycle:   /sleep cycle|circadian|REM|sleep rhythm|sleep hygiene/i\n'
            '  liminal:       /liminal|threshold|between worlds|in between/i\n'
            '  dream_log:     /wrote.*dream|morning pages|dream notebook|dream entry/i',
            ParagraphStyle('impl_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=7.5, fontName='Courier', textColor=SIGIL_GREEN, leading=12)),
        Spacer(1, 0.1*inch),
        Paragraph('BEHAVIORAL FUNCTIONS (easter-eggs.ts)', S['h2']),
        Preformatted(
            '  checkDreamSession(journalText)  // 3+ v34 words  -> dream_session\n'
            '  checkLongDream(journalText)     // 600+ words    -> long_dream\n'
            '  checkHypnagogicHour()           // 04:00-05:00   -> hypnagogic_hour',
            ParagraphStyle('impl2_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=7.5, fontName='Courier', textColor=SIGIL_GREEN, leading=12)),
        Spacer(1, 0.1*inch),
        Paragraph('CALENDAR DATE CHECKS', S['h2']),
        Preformatted(
            '  jung_day:         month === 7  && day === 26   // July 26\n'
            '  world_sleep_day:  month === 3  && day === 13   // March 13\n'
            '  poe_night:        month === 10 && day === 7    // October 7',
            ParagraphStyle('impl3_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=7.5, fontName='Courier', textColor=SIGIL_GREEN, leading=12)),
        Spacer(1, 0.1*inch),
        Paragraph('MASTERY TIER v34 API FIELDS', S['h2']),
        Preformatted(
            '  stats.distinctCheckInDays >= 1100  -> dreamtime_log\n'
            '  stats.totalJournalWords >= 250000  -> vast_dream\n'
            '  signupDate age >= 2555 days        -> dream_age\n'
            '  all 34 Word Turn engines covered   -> thirty_four_registers',
            ParagraphStyle('impl4_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=7.5, fontName='Courier', textColor=SIGIL_GREEN, leading=12)),
    ]

    # ── FOOTER ────────────────────────────────────────────────────
    story += [
        Spacer(1, 0.2*inch),
        HRFlowable(width='100%', thickness=1, color=PANEL_BORDER),
        Paragraph('LOT SYSTEMS CORPORATION &middot; BADGES &amp; ACHIEVEMENTS MASTER CODEX v44', S['footer']),
        Paragraph('THE DREAM CODEX &middot; 1184 TOTAL BADGES &middot; SEPTEMBER 2026', S['footer']),
        Paragraph('&copy; 2025&ndash;2026 LOT Systems Corporation &middot; brand.lot-systems.com', S['footer']),
        Paragraph('Vadik Marmeladov, CEO &amp; Founder &middot; Made in the USA', S['footer']),
    ]

    doc.build(story)
    print(f'[OK] PDF generated: {OUTPUT_FILE}')
    size = os.path.getsize(OUTPUT_FILE)
    print(f'[OK] File size: {size:,} bytes ({size//1024} KB)')


if __name__ == '__main__':
    build_pdf()
