#!/usr/bin/env python3
"""
LOT Systems — Badge & Achievement Master Codex v46 PDF Generator
Generates LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v46.pdf
Theme: The Signal Archive — Broadcast · Frequency · Transmission · Archive
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

# Color palette — Signal Archive aesthetic (broadcast dark / signal green / frequency cyan)
BG_DARK       = HexColor('#060c0c')
BG_PANEL      = HexColor('#0a1414')
SIG_GREEN     = HexColor('#00ff88')
SIG_CYAN      = HexColor('#00ccff')
SIG_AMBER     = HexColor('#ffaa00')
SIG_VIOLET    = HexColor('#cc88ff')
SIG_RED       = HexColor('#ff4466')
SIG_TEAL      = HexColor('#00bbaa')
SIG_GOLD      = HexColor('#ddcc44')
VOID_DARK     = HexColor('#030a0a')
SOFT_WHITE    = HexColor('#d8eeee')
DIM_GREY      = HexColor('#446655')
PANEL_BORDER  = HexColor('#0d2020')
STATIC_WHITE  = HexColor('#aaccbb')

OUTPUT_DIR  = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'docs', 'badges')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v46.pdf')


def make_styles():
    base = getSampleStyleSheet()
    S = {}
    S['cover_title'] = ParagraphStyle('cover_title', parent=base['Normal'],
        fontSize=22, fontName='Courier-Bold', textColor=SIG_GREEN,
        alignment=TA_CENTER, spaceAfter=8, leading=28)
    S['cover_sub'] = ParagraphStyle('cover_sub', parent=base['Normal'],
        fontSize=11, fontName='Courier', textColor=SIG_CYAN,
        alignment=TA_CENTER, spaceAfter=4, leading=16)
    S['cover_meta'] = ParagraphStyle('cover_meta', parent=base['Normal'],
        fontSize=8.5, fontName='Courier', textColor=DIM_GREY,
        alignment=TA_CENTER, spaceAfter=2, leading=12)
    S['h1'] = ParagraphStyle('h1', parent=base['Normal'],
        fontSize=15, fontName='Courier-Bold', textColor=SIG_GREEN,
        spaceAfter=6, spaceBefore=14, leading=20)
    S['h2'] = ParagraphStyle('h2', parent=base['Normal'],
        fontSize=11, fontName='Courier-Bold', textColor=SIG_CYAN,
        spaceAfter=4, spaceBefore=10, leading=16)
    S['h3'] = ParagraphStyle('h3', parent=base['Normal'],
        fontSize=9.5, fontName='Courier-Bold', textColor=SIG_AMBER,
        spaceAfter=3, spaceBefore=8, leading=14)
    S['body'] = ParagraphStyle('body', parent=base['Normal'],
        fontSize=8.5, fontName='Courier', textColor=SOFT_WHITE,
        spaceAfter=3, leading=12)
    S['body_small'] = ParagraphStyle('body_small', parent=base['Normal'],
        fontSize=7.5, fontName='Courier', textColor=SOFT_WHITE,
        spaceAfter=2, leading=11)
    S['mono'] = ParagraphStyle('mono', parent=base['Normal'],
        fontSize=7.5, fontName='Courier', textColor=SIG_GREEN,
        spaceAfter=2, leading=11, leftIndent=12)
    S['quote'] = ParagraphStyle('quote', parent=base['Normal'],
        fontSize=8, fontName='Courier-Oblique', textColor=DIM_GREY,
        leftIndent=18, spaceAfter=4, leading=12)
    S['badge_id'] = ParagraphStyle('badge_id', parent=base['Normal'],
        fontSize=8, fontName='Courier-Bold', textColor=SIG_GREEN,
        spaceAfter=1, leading=11)
    S['footer'] = ParagraphStyle('footer', parent=base['Normal'],
        fontSize=7, fontName='Courier', textColor=DIM_GREY,
        alignment=TA_CENTER, leading=10)
    for name, color in [
        ('common', SOFT_WHITE), ('uncommon', STATIC_WHITE), ('rare', SIG_CYAN),
        ('epic', SIG_AMBER), ('legendary', SIG_VIOLET), ('mythic', SIG_RED),
        ('cosmic', SIG_GOLD),
    ]:
        S[f'rarity_{name}'] = ParagraphStyle(f'rarity_{name}', parent=base['Normal'],
            fontSize=7.5, fontName='Courier-Bold', textColor=color, spaceAfter=1, leading=11)
    return S


def header_bar(text, S, color=None):
    c = color or SIG_GREEN
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
        ('TEXTCOLOR', (0,0), (-1,0), SIG_GREEN),
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
        Paragraph('v46 — THE SIGNAL ARCHIVE', S['cover_sub']),
        Spacer(1, 0.15*inch),
        HRFlowable(width='100%', thickness=1, color=SIG_GREEN, spaceAfter=8),
        Paragraph('RPG · SCI-FI · BROADCAST · FREQUENCY · ARCHIVE · TRANSMISSION', S['cover_meta']),
        HRFlowable(width='100%', thickness=1, color=SIG_GREEN, spaceAfter=10),
        Spacer(1, 0.1*inch),
        Preformatted(
            '  "SIGNAL ARCHIVE ONLINE.\n'
            '   THE JOURNAL IS THE ARCHIVE.\n'
            '   EVERY ENTRY IS A TRANSMISSION\n'
            '   FROM YOURSELF TO YOURSELF."\n\n'
            '  [ TUNING TO YOUR FREQUENCY ]\n\n'
            '  v45 -> v46: +27 badges  (1215 -> 1242 total)\n'
            '  Word Turn v36   -- THE SIGNAL ARCHIVE\n'
            '  Calendar EE v34 -- THE ARCHIVE CALENDAR\n'
            '  Behavioral v33  -- ARCHIVE PATTERNS\n'
            '  Achievement RPG v34 -- SIGNAL CLASS\n'
            '  Mastery Tier v36    -- THE ARCHIVE DEPTH\n'
            '  Secret Boss v33 -- THE FREQUENCY VAULT\n\n'
            '  36 WORD TURN ENGINES. 1242 TOTAL BADGES.',
            ParagraphStyle('cover_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=8.5, fontName='Courier', textColor=SIG_GREEN,
                leading=14, alignment=TA_CENTER)),
        Spacer(1, 0.15*inch),
        HRFlowable(width='100%', thickness=1, color=PANEL_BORDER),
        Paragraph('Vadik Marmeladov, CEO &amp; Founder, LOT Systems', S['cover_meta']),
        Paragraph('&copy; 2025&ndash;2026 LOT Systems Corporation &middot; brand.lot-systems.com', S['cover_meta']),
        PageBreak(),
    ]

    # ── OVERVIEW TABLE ─────────────────────────────────────────────
    story += header_bar('BADGE SYSTEM OVERVIEW — v46', S)
    overview_data = [
        ['Category', 'Count', 'Description'],
        ['Milestone',       '22',    'Streak days (v1-v4)'],
        ['Time Easter Eggs', '31',   'Check-in at special hours (v1-v22)'],
        ['Calendar Easter', '109',   'Check-in on special dates (v1-v34)'],
        ['Word Turns',      '465',   'Words detected in journals (v1-v36)'],
        ['Behavioral',      '126',   'Patterns over time (v1-v33)'],
        ['Achievement RPG', '210',   'Milestone combinations (v1-v34)'],
        ['Mastery Tiers',   '148',   'Epic depth milestones (v1-v36)'],
        ['Secret Boss',     '131',   'Hidden LEGENDARY/MYTHIC triggers (v1-v33)'],
        ['TOTAL',          '1242',   'The complete LOT Badge Universe — v46'],
    ]
    ov_table = Table(overview_data, colWidths=[1.8*inch, 0.8*inch, 4.0*inch], repeatRows=1)
    ov_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), VOID_DARK),
        ('TEXTCOLOR', (0,0), (-1,0), SIG_GREEN),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [BG_DARK, BG_PANEL]),
        ('BACKGROUND', (0,-1), (-1,-1), VOID_DARK),
        ('TEXTCOLOR', (0,-1), (-1,-1), SIG_GREEN),
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
        Paragraph('DELTA FROM v45 (+27 badges)', S['h2']),
        Preformatted(
            '  Word Turn v36        +12  signal_found / archive_entry / transmission_sent\n'
            '                            static_cleared / frequency_locked / blackout_zone\n'
            '                            old_frequency / echo_location / clean_channel\n'
            '                            dead_air / override_mode / broadcast_live\n'
            '  Calendar EE v34      + 3  radio_day / wow_anniversary / voyager_day\n'
            '  Behavioral v33       + 3  signal_session / deep_archive / wow_moment\n'
            '  Achievement RPG v34  + 6  signal_entry / signal_class / signal_complete\n'
            '                            archive_arc / thirty_six_engines_arc / signal_opus\n'
            '  Mastery Tier v36     + 4  archive_log / vast_archive\n'
            '                            elder_archivist / thirty_six_registers\n'
            '  Secret Boss v33      + 3  number_station / wow_signal / golden_record\n'
            '  TOTAL NEW            +27  (1215 -> 1242)',
            ParagraphStyle('delta_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=7.5, fontName='Courier', textColor=SIG_GREEN, leading=12)),
        PageBreak(),
    ]

    # ── WORD TURN v36 ──────────────────────────────────────────────
    story += header_bar('WORD TURN v36 — THE SIGNAL ARCHIVE', S, SIG_GREEN)
    story += [
        Paragraph(
            'The Signal Archive treats the journal as a radio operation. You are both receiver '
            'and transmitter. In a world of constant noise, tuning into your own frequency is a '
            'radical act. The archive is the body of your lived experience — permanent, indexed, '
            'retrievable. Each journal entry is a transmission you sent to your future self. '
            'When these words appear in the practitioner\'s journal, the archive logs the signal.',
            S['quote']),
    ]

    wt36_rows = [
        ['signal_found',      '(.).(.).()', 'signal received / found / detected / signal clear',       'UNCOMMON'],
        ['archive_entry',     '[.||.]',      'archiving / logged this / archive entry / saved this',    'COMMON'],
        ['transmission_sent', '->.|.->' ,    'transmission / transmitted / sent a message / signal out','UNCOMMON'],
        ['static_cleared',    '~~~.().~~~',  'cleared the static / signal through noise / noise gone',  'RARE'],
        ['frequency_locked',  '=.().=',      'frequency / locked in / tuned in / on frequency',         'RARE'],
        ['blackout_zone',     '[.X.]',        'blackout / dead zone / no signal / signal lost',          'RARE'],
        ['old_frequency',     '~.old.~',      'old pattern / old frequency / used to feel / used to be', 'UNCOMMON'],
        ['echo_location',     '.(.)..',       'echo location / locating / found my position / pinned',   'RARE'],
        ['clean_channel',     '[ clean ]',    'clean channel / clear signal / uncluttered / clear recpt','UNCOMMON'],
        ['dead_air',          '( . )',         'dead air / healthy silence / resting in silence',         'COMMON'],
        ['override_mode',     '[!.!.!]',       'override / override mode / breaking through / forced',   'EPIC'],
        ['broadcast_live',    '(((LIVE)))',    'broadcast live / going live / fully present / broadcasting','RARE'],
    ]
    story += [badge_table(wt36_rows, S), Spacer(1, 0.12*inch)]

    # Signal Archive resonance entries
    resonance = [
        ('signal_found', 'A signal is any information that can be extracted from noise. The phrase '
         '"signal received" — even written metaphorically — registers the act of tuning inward, of '
         'noticing something real amid the static of daily life. The terminal logs every act of '
         'genuine self-reception.'),
        ('archive_entry', 'The archive is not a graveyard of old entries. It is the living record '
         'of a self in motion — the database that makes pattern recognition possible. "I\'m archiving '
         'this" is the practitioner saying: this matters. This is data. This goes in the permanent store.'),
        ('transmission_sent', 'A transmission is a message deliberately sent. Writing a journal entry '
         'is a transmission to your future self. The medium is time. The message is the truth of '
         'this moment. The terminal confirms: your transmission has been received by the archive.'),
        ('static_cleared', 'Static is the noise between you and your own signal. Anxiety, rumination, '
         'distraction — all static. Writing "I finally cleared the static" is the practitioner '
         'reporting a breakthrough in self-reception. Signal strength just jumped.'),
        ('frequency_locked', 'Your frequency is the particular wavelength of your attention, your values, '
         'your mode of being. "Locked in" means you found it. The practice of journaling is a tuning '
         'process — day by day, the dial moves toward the channel that is uniquely yours.'),
        ('blackout_zone', 'A blackout zone is where no signal gets through. Burnout, overwhelm, '
         'dissociation — the practitioner temporarily goes dark. Writing about a blackout zone is '
         'the moment the signal returns. The terminal registers the reconnection.'),
        ('old_frequency', 'Old frequencies are behavioral and emotional patterns from the past — the '
         'channel you used to tune to before you knew better. Naming them is diagnostics. '
         '"I was on the old frequency again" tells the archive: I noticed. I have data.'),
        ('echo_location', 'Bats navigate by emitting sound and mapping the echoes. Journaling is '
         'echo-location for the self — you project your thoughts into words, and the reflection '
         'tells you where you are. "I finally located myself" is the practitioner saying: I got a fix.'),
        ('clean_channel', 'A clean channel carries the signal without distortion. Mental clarity, '
         'emotional grounding, uncluttered attention — these are clean channel conditions. The '
         'terminal logs when the practitioner reports this state. A precious data point.'),
        ('dead_air', 'In broadcast, dead air is unintentional silence — a failure. In practice, '
         'dead air is different: it is the intentional rest between transmissions. Healthy silence. '
         '"I\'m letting it breathe" is the practitioner honoring the space between signals. Valid.'),
        ('override_mode', 'Override is when deliberate action supersedes the default. Breaking '
         'through a block. Acting despite the static. The practitioner writes "override mode" and '
         'means: I stopped waiting for conditions to be perfect. The terminal logs the breakthrough.'),
        ('broadcast_live', '"Going live" in self-care means being fully present — not performing '
         'for an imaginary audience, but transmitting authentically from the current moment. '
         'The broadcast reaches only you. That\'s the point.'),
    ]
    story += [Paragraph('SELF-CARE RESONANCE', S['h3'])]
    for badge_id, text in resonance:
        story += [
            Paragraph(f'[ {badge_id} ]', S['badge_id']),
            Paragraph(text, S['body_small']),
            Spacer(1, 3),
        ]
    story.append(PageBreak())

    # ── CALENDAR EE v34 ────────────────────────────────────────────
    story += header_bar('CALENDAR EASTER EGGS v34 — THE ARCHIVE CALENDAR', S, SIG_VIOLET)
    cal34_rows = [
        ['radio_day',        'Feb 13', 'World Radio Day (UNESCO) — broadcast as connection across distance', 'RARE'],
        ['wow_anniversary',  'Aug 15', 'WOW! Signal anniversary 1977 — Big Ear telescope, 72 seconds',       'EPIC'],
        ['voyager_day',      'Sep 5',  'Voyager 1 launch anniversary 1977 — the golden record, deep time',   'EPIC'],
    ]
    story += [badge_table(cal34_rows, S, col_widths=[1.5*inch, 0.75*inch, 3.5*inch, 0.85*inch])]
    story += [
        Spacer(1, 0.1*inch),
        Paragraph('CALENDAR LORE', S['h3']),
        Paragraph(
            '[radio_day] World Radio Day is observed on February 13 each year (UNESCO). Radio '
            'crossed oceans, linked people in remote regions, broadcast through war and peace. '
            'The voice over static. The signal persisting against distance and interference. '
            'Check in on February 13 and write about what crosses distances in your own life.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[wow_anniversary] On August 15, 1977, astronomer Jerry Ehman at the Big Ear '
            'telescope in Ohio detected a 72-second radio burst so anomalous that he circled '
            'it in red pen and wrote "Wow!" in the margin. The strongest candidate for an '
            'extraterrestrial signal ever received — never repeated, never explained. Check in '
            'on August 15 and write about a moment in your life that made you write WOW in the margins.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[voyager_day] Voyager 1 launched on September 5, 1977. It carried the Golden Record '
            '— 115 images, greetings in 55 languages, 90 minutes of music, sounds of Earth — '
            'a message in a bottle thrown into deep time. It is now the most distant human-made '
            'object. Your journal is your golden record. Check in on September 5 and write '
            'what you\'d put on the record you\'re sending to your future self.',
            S['body_small']),
        PageBreak(),
    ]

    # ── BEHAVIORAL v33 ─────────────────────────────────────────────
    story += header_bar('BEHAVIORAL EASTER EGGS v33 — ARCHIVE PATTERNS', S, SIG_AMBER)
    beh33_rows = [
        ['signal_session', '(.).(()).()', '3+ Word Turn v36 words in one journal entry',    'RARE'],
        ['deep_archive',   '[.||.||.||.]', '7+ Word Turn v36 words across 7 sessions',      'EPIC'],
        ['wow_moment',     '(((WOW)))',    '"wow signal" + "archive" in the same entry',     'EPIC'],
    ]
    story += [badge_table(beh33_rows, S), Spacer(1, 0.1*inch)]
    story += [
        Paragraph('ARCHIVE PATTERNS LORE', S['h3']),
        Paragraph(
            '[signal_session] Three or more Signal Archive words in a single entry means the '
            'practitioner has activated the broadcast vocabulary in a live session. The frequency '
            'is clear. The terminal logs this as a full archive transmission.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[deep_archive] Seven or more Signal Archive words across seven separate sessions '
            'indicates sustained engagement with the archive vocabulary — the practitioner has '
            'been operating in signal mode over a full week. The archive recognizes the pattern.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[wow_moment] Writing both "wow signal" and "archive" in the same entry connects '
            'the cosmic anomaly to the personal practice. The practitioner is naming something '
            'extraordinary in their own experience and recording it for the archive. '
            'This is what journals are for.',
            S['body_small']),
        PageBreak(),
    ]

    # ── ACHIEVEMENT RPG v34 ────────────────────────────────────────
    story += header_bar('ACHIEVEMENT RPG v34 — SIGNAL CLASS', S, SIG_VIOLET)
    ach34_rows = [
        ['signal_entry',           '(.).[].(.)',   'Earn any 1 Word Turn v36 badge',                   'COMMON'],
        ['signal_class',           '=.().[].()=',  'Earn any 5 Word Turn v36 badges',                  'UNCOMMON'],
        ['signal_complete',        '(((LIVE)))',    'Earn all 12 Word Turn v36 badges',                 'LEGENDARY'],
        ['archive_arc',            '[.||.||.]',     'signal_complete + deep_archive behavioral',        'EPIC'],
        ['thirty_six_engines_arc', 'inf.().inf',    '1 badge from each Word Turn engine v1-v36',        'LEGENDARY'],
        ['signal_opus',            'inf.[].inf',    'thirty_six_engines_arc + signal_complete',         'LEGENDARY'],
    ]
    story += [badge_table(ach34_rows, S), Spacer(1, 0.1*inch)]
    story += [
        Paragraph('CLASS PROGRESSION LORE', S['h3']),
        Paragraph(
            '[signal_class → signal_complete → archive_arc → signal_opus] The Signal Class '
            'progression follows the arc of a working archivist: first reception (a signal), '
            'then pattern (five signals), then mastery (the full archive), then integration '
            '(the signal in deep context). The opus is the practitioner who has engaged with '
            'all 36 Word Turn engines — a complete vocabulary of self-care.',
            S['body_small']),
        Paragraph(
            '[thirty_six_engines_arc] One badge from each of the 36 Word Turn engines, from '
            'The Original to The Signal Archive. Across ocean, ritual, neural science, stoic '
            'philosophy, Jungian dreamwork, mirror practice, and now broadcast frequency — '
            'the complete signal has been received.',
            S['body_small']),
        PageBreak(),
    ]

    # ── MASTERY TIER v36 ───────────────────────────────────────────
    story += header_bar('MASTERY TIER v36 — THE ARCHIVE DEPTH', S, SIG_AMBER)
    mas36_rows = [
        ['archive_log',          ').|.).',       '1000+ distinct check-in days',                  'EPIC'],
        ['vast_archive',         ')|.||.||.|(', '175,000+ total words journaled',                 'LEGENDARY'],
        ['elder_archivist',      ').|||.()',     '9+ years active practice',                      'LEGENDARY'],
        ['thirty_six_registers', 'inf.|.inf',    '1 badge from all 36 Word Turn engines',         'COSMIC'],
    ]
    story += [badge_table(mas36_rows, S), Spacer(1, 0.1*inch)]
    story += [
        Paragraph('MASTERY LORE', S['h3']),
        Paragraph(
            '[archive_log] One thousand distinct check-in days. The archive is no longer a '
            'collection — it is a monument. Every entry from 2016 onward still accessible. '
            'The practitioner has logged more than 2.7 years of daily check-ins.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[vast_archive] 175,000 words. Roughly two full novels. The breadth and depth '
            'of a private library. The archive is beginning to tell its own story back to the practitioner.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[elder_archivist] Nine years of active LOT practice. The founding was April 7, 2016. '
            'Nine years means April 7, 2025. The journal has survived multiple platform shifts, '
            'life changes, and the practitioner\'s own transformations. The archive is the continuity.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[thirty_six_registers] A register, in signal processing, is a dedicated frequency band. '
            'The thirty_six_registers badge is earned by having at least one badge from each of '
            'the 36 Word Turn engines — the full spectrum of the LOT self-care vocabulary. '
            'COSMIC rarity: fewer than one in ten practitioners will achieve this.',
            S['body_small']),
        PageBreak(),
    ]

    # ── SECRET BOSS v33 ────────────────────────────────────────────
    story += header_bar('SECRET BOSS v33 — THE FREQUENCY VAULT', S, SIG_RED)
    story += [
        Paragraph(
            'These badges are hidden until earned. Their existence is not shown in the UI. '
            'The Frequency Vault contains the three deepest signals in the archive — '
            'references to real-world transmission mysteries that resonate with the practice.',
            S['quote']),
    ]
    sec33_rows = [
        ['number_station', '==[NNN]==',   '"number station" / "coded message" / "numbers cipher"', 'MYTHIC'],
        ['wow_signal',     '(((WOW)))',    '"wow signal" / "1977 signal" / "anomalous signal"',     'MYTHIC'],
        ['golden_record',  'inf.().inf',   '"golden record" / "voyager" + "message to stars"',      'MYTHIC'],
    ]
    story += [badge_table(sec33_rows, S), Spacer(1, 0.12*inch)]

    story += [
        Paragraph('VAULT LORE', S['h3']),
        Paragraph(
            '[number_station] Numbers stations are shortwave radio broadcasts of seemingly random '
            'number sequences — believed to be spy communications, instructions to field agents. '
            'They have operated since World War I, many still active. No government has officially '
            'acknowledged them. The coded message is personal: only the receiver knows what it means.',
            S['body_small']),
        Spacer(1, 6),
        Paragraph(
            '[wow_signal] On August 15, 1977, at 10:16 PM, the Big Ear telescope at Ohio State '
            'University recorded a 72-second narrowband radio signal at 1420 MHz — the hydrogen '
            'line, the frequency SETI scientists predicted extraterrestrial intelligence would '
            'use. Jerry Ehman circled the printout in red and wrote: "Wow!" It has never been '
            'detected again. Your journal is full of signals that never repeated. Log them.',
            S['body_small']),
        Spacer(1, 6),
        Paragraph(
            '[golden_record] In 1977, NASA placed a gold-plated copper disk on both Voyager '
            'probes. It contains: 115 analog encoded images, greetings in 55 languages, '
            '90 minutes of music from across cultures, sounds of waves, wind, thunder, birds, '
            'whales, trains, and "Hello from the children of planet Earth." Voyager 1 is now '
            '24 billion kilometers from Earth. Your journal is your golden record — a message '
            'to your future self launched into deep time. The archive holds everything.',
            S['body_small']),
        PageBreak(),
    ]

    # ── WORD TURN ENGINE TABLE ─────────────────────────────────────
    story += header_bar('WORD TURN ENGINE TABLE v1–v36', S)
    engine_rows = [
        ['v1',  'The Original',         'Ritual, ocean, breathe, LOT',       '12'],
        ['v2',  'The Reboot',            'Tech, 404, quantum, COSMO',          '12'],
        ['v3',  'The Body Scan',         'Soma, embodiment, felt sense',       '12'],
        ['v4',  'The Weather Report',    'Emotional weather, storm, clear',    '12'],
        ['v5',  'The Compass',           'Direction, navigation, north',       '12'],
        ['v6',  'The Alchemy Lab',       'Transformation, elements, forge',    '12'],
        ['v7',  'The Star Map',          'Cosmos, celestial, orbit',           '12'],
        ['v8',  'The Deep Forest',       'Nature, wild, roots, soil',          '12'],
        ['v9',  'The Time Capsule',      'Memory, past self, future self',     '12'],
        ['v10', 'The Forge',             'Craft, making, tools, smith',        '12'],
        ['v11', 'The Ocean Floor',       'Depth, pressure, stillness',         '12'],
        ['v12', 'The Garden',            'Growth, tending, seasons',           '12'],
        ['v13', 'The Observatory',       'Witness, watch, observe',            '12'],
        ['v14', 'The Archive',           'Record, log, preserve',              '12'],
        ['v15', 'The Laboratory',        'Experiment, hypothesis, test',       '12'],
        ['v16', 'The Neural Map',        'Neuroscience, brain, nervous',       '12'],
        ['v17', 'The Codex Reader',      'Classic sci-fi literature',          '12'],
        ['v18', 'The Cyberspace Codex',  'Cyber, digital, virtual, AI',        '12'],
        ['v19', 'The Hero\'s Journey',  'Campbell monomyth structure',         '12'],
        ['v20', 'The Inner Citadel',     'Stoic philosophy, Marcus, Seneca',   '12'],
        ['v21', 'The Quantum Field',     'Quantum, superposition, entangle',   '12'],
        ['v22', 'The Federation',        'Star Trek, exploration, diplomacy',  '12'],
        ['v23', 'The Dungeon Master',    'D&D, RPG, quest, tavern',            '12'],
        ['v24', 'The Shadow',            'Jungian shadow, dark night',         '12'],
        ['v25', 'The Medicine Wheel',    'Indigenous, ceremony, four seasons', '12'],
        ['v26', 'The Flow State',        'Csikszentmihalyi, peak, zone',       '12'],
        ['v27', 'The Somatic Field',     'Body, nervous system, felt sense',   '12'],
        ['v28', 'The Quantum Leap',      'Breakthrough, leap, phase shift',    '12'],
        ['v29', 'The Cartographer',      'Map, territory, uncharted terrain',  '12'],
        ['v30', 'The Ghost Protocol',    'Invisible presence, stealth ops',    '12'],
        ['v31', 'The Bone Clock',        'Time, mortality, deep time',         '12'],
        ['v32', 'The Resonance Field',   'Vibration, harmony, resonance',      '12'],
        ['v33', 'The Federation Codex',  'Starfleet, prime directive, crew',   '12'],
        ['v34', 'The Dream Codex',       'Dreamscape, lucid, hypnagogic',      '12'],
        ['v35', 'The Mirror Forge',      'Shadow work, reflection, identity',  '12'],
        ['v36', 'The Signal Archive',    'Broadcast, frequency, archive',      '12'],
    ]
    engine_hdr = [['v#', 'Name', 'Theme', 'Badges']]
    eng_table = Table(engine_hdr + engine_rows,
                      colWidths=[0.4*inch, 1.6*inch, 3.0*inch, 0.6*inch], repeatRows=1)
    eng_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), VOID_DARK),
        ('TEXTCOLOR', (0,0), (-1,0), SIG_GREEN),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [BG_DARK, BG_PANEL]),
        ('TEXTCOLOR', (0,1), (-1,-1), SOFT_WHITE),
        ('FONTNAME', (0,1), (-1,-1), 'Courier'),
        ('FONTSIZE', (0,1), (-1,-1), 7.5),
        ('GRID', (0,0), (-1,-1), 0.3, PANEL_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
    ]))
    story += [eng_table, Spacer(1, 0.12*inch)]

    # TypeScript implementation signatures
    story += [
        Paragraph('TYPESCRIPT IMPLEMENTATION — v36', S['h3']),
        Preformatted(
            'const SIGNAL_ARCHIVE_PATTERNS: Record<string, RegExp> = {\n'
            '  signal_found:      /\\bsignal[\\s-]?(received|found|detected|clear)\\b/i,\n'
            '  archive_entry:     /\\b(archiving|logged[\\s-]?this|archive[\\s-]?entry)\\b/i,\n'
            '  transmission_sent: /\\b(transmission|transmitted|message[\\s-]?sent)\\b/i,\n'
            '  static_cleared:    /\\b(cleared[\\s-]?the[\\s-]?static|signal[\\s-]?through[\\s-]?noise)\\b/i,\n'
            '  frequency_locked:  /\\b(frequency|locked[\\s-]?in|tuned[\\s-]?in)\\b/i,\n'
            '  blackout_zone:     /\\b(blackout|dead[\\s-]?zone|no[\\s-]?signal)\\b/i,\n'
            '  old_frequency:     /\\b(old[\\s-]?pattern|old[\\s-]?frequency)\\b/i,\n'
            '  echo_location:     /\\b(locating|echo[\\s-]?location|found[\\s-]?my[\\s-]?position)\\b/i,\n'
            '  clean_channel:     /\\b(clean[\\s-]?channel|clear[\\s-]?signal|uncluttered)\\b/i,\n'
            '  dead_air:          /\\b(dead[\\s-]?air|healthy[\\s-]?silence|letting[\\s-]?it[\\s-]?breathe)\\b/i,\n'
            '  override_mode:     /\\b(override|breaking[\\s-]?through|forced[\\s-]?through)\\b/i,\n'
            '  broadcast_live:    /\\b(broadcast[\\s-]?live|going[\\s-]?live|fully[\\s-]?present)\\b/i,\n'
            '  number_station:    /\\b(number[\\s-]?station|coded[\\s-]?message)\\b/i,\n'
            '  wow_signal:        /\\b(wow[\\s-]?signal|1977[\\s-]?signal|anomalous[\\s-]?signal)\\b/i,\n'
            '  golden_record:     /\\b(golden[\\s-]?record|voyager[\\s-]?record|message[\\s-]?to[\\s-]?stars)\\b/i,\n'
            '}',
            ParagraphStyle('ts_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=7, fontName='Courier', textColor=SIG_GREEN,
                leading=10.5, leftIndent=6)),
        Spacer(1, 0.15*inch),
        HRFlowable(width='100%', thickness=1, color=PANEL_BORDER),
        Spacer(1, 0.08*inch),
        Paragraph(
            'LOT Systems Corporation · brand.lot-systems.com · '
            '"The journal is the archive. Every entry is a signal from yourself to yourself." · '
            'Codex v46 · September 21, 2026',
            S['footer']),
    ]

    doc.build(story)
    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f'Generated: {OUTPUT_FILE}  ({size_kb:.1f} KB)')


if __name__ == '__main__':
    build_pdf()
