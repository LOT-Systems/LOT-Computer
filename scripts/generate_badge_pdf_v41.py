#!/usr/bin/env python3
"""
LOT Systems — Badge & Achievement Master Codex v41 PDF Generator
Generates LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v41.pdf
Theme: The Void Runner — Cyber · Neural · Sci-Fi Books · Self-Care Ops
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

# Color palette — LOT Systems Void Runner aesthetic
BG_DARK      = HexColor('#060810')
BG_PANEL     = HexColor('#0d1020')
NEON_CYAN    = HexColor('#00e5ff')
NEON_GREEN   = HexColor('#00ff9d')
NEON_AMBER   = HexColor('#ffb300')
NEON_RED     = HexColor('#ff2244')
NEON_PURPLE  = HexColor('#bb44ff')
NEON_BLUE    = HexColor('#3366ff')
NEON_PINK    = HexColor('#ff44aa')
VOID_GREY    = HexColor('#1a1a2e')
SOFT_WHITE   = HexColor('#dde8f0')
DIM_GREY     = HexColor('#556677')
PANEL_BORDER = HexColor('#1e2d40')
MATRIX_GREEN = HexColor('#00cc55')

OUTPUT_DIR  = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'docs', 'badges')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v41.pdf')


def make_styles():
    base = getSampleStyleSheet()
    S = {}
    S['cover_title'] = ParagraphStyle('cover_title', parent=base['Normal'],
        fontSize=22, fontName='Courier-Bold', textColor=NEON_CYAN,
        alignment=TA_CENTER, spaceAfter=8, leading=28)
    S['cover_sub'] = ParagraphStyle('cover_sub', parent=base['Normal'],
        fontSize=11, fontName='Courier', textColor=NEON_GREEN,
        alignment=TA_CENTER, spaceAfter=4, leading=16)
    S['cover_meta'] = ParagraphStyle('cover_meta', parent=base['Normal'],
        fontSize=8.5, fontName='Courier', textColor=DIM_GREY,
        alignment=TA_CENTER, spaceAfter=2, leading=12)
    S['h1'] = ParagraphStyle('h1', parent=base['Normal'],
        fontSize=15, fontName='Courier-Bold', textColor=NEON_CYAN,
        spaceAfter=6, spaceBefore=14, leading=20)
    S['h2'] = ParagraphStyle('h2', parent=base['Normal'],
        fontSize=11, fontName='Courier-Bold', textColor=NEON_GREEN,
        spaceAfter=4, spaceBefore=10, leading=16)
    S['h3'] = ParagraphStyle('h3', parent=base['Normal'],
        fontSize=9.5, fontName='Courier-Bold', textColor=NEON_AMBER,
        spaceAfter=3, spaceBefore=8, leading=14)
    S['body'] = ParagraphStyle('body', parent=base['Normal'],
        fontSize=8.5, fontName='Courier', textColor=SOFT_WHITE,
        spaceAfter=3, leading=12)
    S['body_small'] = ParagraphStyle('body_small', parent=base['Normal'],
        fontSize=7.5, fontName='Courier', textColor=SOFT_WHITE,
        spaceAfter=2, leading=11)
    S['mono'] = ParagraphStyle('mono', parent=base['Normal'],
        fontSize=7.5, fontName='Courier', textColor=MATRIX_GREEN,
        spaceAfter=2, leading=11, leftIndent=12)
    S['quote'] = ParagraphStyle('quote', parent=base['Normal'],
        fontSize=8, fontName='Courier-Oblique', textColor=DIM_GREY,
        leftIndent=18, spaceAfter=4, leading=12)
    S['badge_id'] = ParagraphStyle('badge_id', parent=base['Normal'],
        fontSize=8, fontName='Courier-Bold', textColor=NEON_CYAN,
        spaceAfter=1, leading=11)
    S['footer'] = ParagraphStyle('footer', parent=base['Normal'],
        fontSize=7, fontName='Courier', textColor=DIM_GREY,
        alignment=TA_CENTER, leading=10)
    for name, color in [
        ('common', SOFT_WHITE), ('uncommon', NEON_GREEN), ('rare', NEON_CYAN),
        ('epic', NEON_AMBER), ('legendary', NEON_PURPLE), ('mythic', NEON_RED),
        ('cosmic', NEON_BLUE),
    ]:
        S[f'rarity_{name}'] = ParagraphStyle(f'rarity_{name}', parent=base['Normal'],
            fontSize=7.5, fontName='Courier-Bold', textColor=color, spaceAfter=1, leading=11)
    return S


def header_bar(text, S, color=None):
    c = color or NEON_CYAN
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
        ('BACKGROUND', (0,0), (-1,0), VOID_GREY),
        ('TEXTCOLOR', (0,0), (-1,0), NEON_CYAN),
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
        Paragraph('L · O · T  SYSTEMS  CORPORATION', S['cover_title']),
        Paragraph('BADGES &amp; ACHIEVEMENTS MASTER CODEX', S['cover_sub']),
        Paragraph('v41 — THE VOID RUNNER', S['cover_sub']),
        Spacer(1, 0.15*inch),
        HRFlowable(width='100%', thickness=1, color=NEON_CYAN, spaceAfter=8),
        Paragraph('RPG · SCI-FI · CYBER · NEURAL · SELF-CARE OPS', S['cover_meta']),
        HRFlowable(width='100%', thickness=1, color=NEON_CYAN, spaceAfter=10),
        Spacer(1, 0.1*inch),
        Preformatted(
            '  "THE VOID IS NOT EMPTY.\n'
            '   THE VOID IS WHERE THE SIGNAL FINDS YOU\n'
            '   WHEN YOU FINALLY STOP GENERATING NOISE."\n\n'
            '  [ NEURAL LINK ESTABLISHED ]\n\n'
            '  v40 -> v41: +31 badges  (1060 -> 1091 total)\n'
            '  Word Turn v31   — THE VOID RUNNER\n'
            '  Calendar EE v29 — THE CYBER CALENDAR\n'
            '  Behavioral v28  — SYSTEM PATTERNS\n'
            '  Achievement RPG v29 — VOID CLASS\n'
            '  Mastery Tier v31    — DEEP SYSTEM\n'
            '  Secret Boss v28 — THE HIDDEN PROCESSES\n\n'
            '  31 WORD TURN ENGINES. 1091 TOTAL BADGES.',
            ParagraphStyle('cover_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=8.5, fontName='Courier', textColor=MATRIX_GREEN,
                leading=14, alignment=TA_CENTER)),
        Spacer(1, 0.15*inch),
        HRFlowable(width='100%', thickness=1, color=PANEL_BORDER),
        Paragraph('Vadik Marmeladov, CEO &amp; Founder, LOT Systems', S['cover_meta']),
        Paragraph('© 2025–2026 LOT Systems Corporation · brand.lot-systems.com', S['cover_meta']),
        PageBreak(),
    ]

    # ── OVERVIEW TABLE ─────────────────────────────────────────────
    story += header_bar('BADGE SYSTEM OVERVIEW — v41', S)
    overview_data = [
        ['Category', 'Count', 'Description'],
        ['Milestone',      '22',   'Streak days (v1–v4)'],
        ['Time Easter Eggs','31',  'Check-in at special hours (v1–v22)'],
        ['Calendar Easter', '97',  'Check-in on special dates (v1–v29)'],
        ['Word Turns',     '372',  'Words detected in journals (v1–v31)'],
        ['Behavioral',     '108',  'Patterns over time (v1–v28)'],
        ['Achievement RPG','174',  'Milestone combinations (v1–v29)'],
        ['Mastery Tiers',  '124',  'Epic depth milestones (v1–v31)'],
        ['Secret Boss',    '110',  'Hidden LEGENDARY/MYTHIC triggers (v1–v28)'],
        ['TOTAL',         '1091',  'The complete LOT Badge Universe — v41'],
    ]
    ov_table = Table(overview_data, colWidths=[1.8*inch, 0.8*inch, 4.0*inch], repeatRows=1)
    ov_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), VOID_GREY),
        ('TEXTCOLOR', (0,0), (-1,0), NEON_CYAN),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [BG_DARK, BG_PANEL]),
        ('BACKGROUND', (0,-1), (-1,-1), VOID_GREY),
        ('TEXTCOLOR', (0,-1), (-1,-1), NEON_GREEN),
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
        Paragraph('DELTA FROM v40 (+31 badges)', S['h2']),
        Preformatted(
            '  Word Turn v31        +12  neural_link / glitch_mode / system_restore\n'
            '                            signal_noise / void_entry / matrix_moment\n'
            '                            firewall_up / kernel_panic / uplink_active\n'
            '                            root_access / binary_choice / upload_complete\n'
            '  Calendar EE v29      + 3  turing_birthday / matrix_release / inet_birthday\n'
            '  Behavioral v28       + 3  debug_loop / system_uptime / cold_boot\n'
            '  Achievement RPG v29  + 6  void_entry_class / void_regular / void_complete\n'
            '                            cyber_stack / thirty_one_engines / void_opus\n'
            '  Mastery Tier v31     + 4  kernel_master / petabyte_mind\n'
            '                            deep_uptime / thirty_one_registers\n'
            '  Secret Boss v28      + 3  do_androids_dream / wintermute_found\n'
            '                            dystopia_logged\n'
            '  TOTAL NEW            +31  (1060 -> 1091)',
            ParagraphStyle('delta_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=7.5, fontName='Courier', textColor=MATRIX_GREEN, leading=12)),
        PageBreak(),
    ]

    # ── WORD TURN v31 ──────────────────────────────────────────────
    story += header_bar('WORD TURN v31 — THE VOID RUNNER', S, MATRIX_GREEN)
    story += [
        Paragraph(
            'In the great cyberpunk novels — Neuromancer, Snow Crash, Do Androids Dream of '
            'Electric Sheep — the runner operates in the void between the signal and the noise. '
            'The neural interface is the journal. The uplink is the entry. The void is not '
            'emptiness; it is the space where self-knowledge transmits at full bandwidth.',
            S['quote']),
    ]

    wt31_rows = [
        ['neural_link',     'SYM: (cross)',   'neural / connected / linked / interfaced / wired',      'UNCOMMON'],
        ['glitch_mode',     'SYM: glitch',    'glitch / error / corrupted / broken / fragmented',      'RARE'],
        ['system_restore',  'SYM: restore',   'restore / recovered / backup / healed / baseline',      'RARE'],
        ['signal_noise',    'SYM: wave',      'noise / static / overwhelmed / too much / fuzzy',       'UNCOMMON'],
        ['void_entry',      'SYM: void',      'void / empty / nothing / hollow / blank',               'RARE'],
        ['matrix_moment',   'SYM: grid',      'matrix / simulation / the machine / coded reality',     'EPIC'],
        ['firewall_up',     'SYM: block',     'firewall / boundaries / blocked / protected / defended','UNCOMMON'],
        ['kernel_panic',    'SYM: panic',     'panic / kernel / crash / system failure / overwhelm',   'RARE'],
        ['uplink_active',   'SYM: uplink',    'uplink / connected again / back online / reconnected',  'UNCOMMON'],
        ['root_access',     'SYM: root',      'root cause / root / deep / core issue / the real problem','EPIC'],
        ['binary_choice',   'SYM: binary',    'binary / choice / one or the other / decide / either',  'RARE'],
        ['upload_complete',  'SYM: upload',   'upload / finished / done / completed / submitted',      'COMMON'],
    ]
    story += [badge_table(wt31_rows, S), Spacer(1, 0.12*inch)]

    # WT resonance entries
    resonance = [
        ('neural_link', 'The neural jack is the interface between the human nervous system and '
         'infinite data. Your journal is the neural jack. "Connected" — the terminal reads the link. '
         'You are transmitting. What are you sending into the system today?'),
        ('glitch_mode', 'A glitch is not a failure. It is a moment of visible seams — the places '
         'where the simulation shows what it is made of. Write the glitch. The debugger catches it. '
         'The system stabilizes.'),
        ('system_restore', 'Every operating system has a restore point — a saved state from before '
         'the damage. The journal is the restore function. Write about your restore point. When did '
         'you last feel like that version of yourself?'),
        ('signal_noise', 'Shannon\'s theorem: signal degrades in the presence of noise. The journal '
         'is the noise-canceling filter. Write what is generating static. Name the noise sources. '
         'The signal-to-noise ratio improves when the noise is identified.'),
        ('void_entry', 'The void is not negative space. It is the space between signals where the '
         'runner thinks. Write "the void" and mean it. The terminal confirms the entry. You are in '
         'the null zone. This is where the real scan happens.'),
        ('matrix_moment', '"Is this real?" is not just a philosophical question — it is a self-care '
         'question. When you write "simulation" or "constructed reality," you are questioning the '
         'legitimacy of the pressure you are under. Much of what feels solid is code.'),
        ('firewall_up', 'A firewall does not refuse all traffic — it selectively permits and blocks '
         'based on rules you define. Write the rules of your current firewall. What are you '
         'permitting? What are you blocking? The terminal accepts the config.'),
        ('kernel_panic', 'A kernel panic stops everything rather than continue corrupted. The journal '
         'kernel panic is honest: "I am seized. I cannot proceed. I am naming the error." Write '
         'the error code. The terminal logs the panic. The restart is possible.'),
        ('uplink_active', 'Coming back online — "back online," "reconnected" — is the reestablishment '
         'of the link. The terminal confirms: uplink active. You are transmitting again. The data '
         'backlog begins to sync.'),
        ('root_access', 'Root access is the highest privilege level. The self-care parallel: root '
         'cause analysis is the highest-privilege view of what is actually wrong. Write "the root '
         'cause" and the terminal grants access. The source code of the problem is visible.'),
        ('binary_choice', 'Write about a choice as 0 or 1, then write about the branch it would '
         'open. The terminal evaluates the decision tree. The binary is the simplification that '
         'helps you see the actual complexity.'),
        ('upload_complete', '"Upload complete" is one of the most satisfying confirmations in any '
         'interface. The data is sent. Write what you have completed. The progress bar is full. '
         'The entry is the proof.'),
    ]
    story += [Paragraph('SELF-CARE RESONANCE', S['h3'])]
    for badge_id, text in resonance:
        story += [
            Paragraph(f'[ {badge_id} ]', S['badge_id']),
            Paragraph(text, S['body_small']),
            Spacer(1, 3),
        ]
    story.append(PageBreak())

    # ── CALENDAR EE v29 ────────────────────────────────────────────
    story += header_bar('CALENDAR EASTER EGGS v29 — THE CYBER CALENDAR', S, NEON_PURPLE)
    cal29_rows = [
        ['turing_birthday', 'Jun 23', 'Alan Turing born 1912 — father of AI, neural link pioneer',    'EPIC'],
        ['matrix_release',  'Mar 31', 'The Matrix released 1999 — Wachowskis, Baudrillard, red pill', 'RARE'],
        ['inet_birthday',   'Jan 1',  'ARPANET TCP/IP switchover 1983 — internet\'s official birthday','UNCOMMON'],
    ]
    story += [badge_table(cal29_rows, S, col_widths=[1.5*inch, 0.75*inch, 3.5*inch, 0.85*inch])]
    story += [
        Spacer(1, 0.1*inch),
        Paragraph('CALENDAR LORE', S['h3']),
        Paragraph(
            '[turing_birthday] June 23, 1912. Alan Turing was born in London. He would prove the '
            'universal computing machine was theoretically possible, break the Enigma code, lay '
            'the foundations of computer science. Check in on June 23 and write about the work '
            'of your life — the contribution you are making, the test you are passing.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[matrix_release] March 31, 1999. The Matrix opened in US theaters. The Wachowskis '
            'had read Baudrillard\'s Simulacra and Simulation. Write on March 31 about the reality '
            'you have chosen to see clearly. The terminal confirms: you have exited the construct.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[inet_birthday] January 1, 1983. ARPANET switched from NCP to TCP/IP — the protocol '
            'transition that created the modern internet. Write the entry as a packet header: '
            'FROM, TO, SUBJECT, PAYLOAD. The terminal routes it. The network delivers.',
            S['body_small']),
        PageBreak(),
    ]

    # ── BEHAVIORAL v28 ─────────────────────────────────────────────
    story += header_bar('BEHAVIORAL EASTER EGGS v28 — SYSTEM PATTERNS', S, NEON_AMBER)
    beh28_rows = [
        ['debug_loop',    'SYM: loop',   '3+ journal entries on the same calendar day',                'RARE'],
        ['system_uptime', 'SYM: uptime', '90 consecutive days with at least 1 entry per week',         'EPIC'],
        ['cold_boot',     'SYM: boot',   'First entry after a 60+ day absence (cold boot)',            'RARE'],
    ]
    story += [badge_table(beh28_rows, S), Spacer(1, 0.1*inch)]
    story += [
        Paragraph('SYSTEM PATTERNS LORE', S['h3']),
        Paragraph(
            '[debug_loop] Three entries in one day means the practitioner is in debug mode: running '
            'the process, observing output, adjusting, running again. This is not obsession — it is '
            'iteration. The terminal logs the debug session. The bug is getting smaller with each pass.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[system_uptime] 90-day practice with at least weekly entries is 100% weekly uptime. '
            'The terminal displays the uptime counter. Infrastructure does not ask permission to '
            'keep running. It just runs.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[cold_boot] A cold boot is the startup sequence from a fully powered-off state. '
            'Returning after 60+ days is a cold boot: every practice habit must be re-initialized. '
            'The badge is awarded for completing the boot successfully. The system is online.',
            S['body_small']),
        PageBreak(),
    ]

    # ── ACHIEVEMENT RPG v29 ────────────────────────────────────────
    story += header_bar('ACHIEVEMENT RPG v29 — VOID CLASS', S, NEON_PURPLE)
    ach29_rows = [
        ['void_entry_class',   'SYM: entry',    'Earn any 1 Word Turn v31 (Void Runner) badge',           'COMMON'],
        ['void_regular',       'SYM: regular',  'Earn any 5 Word Turn v31 badges',                        'UNCOMMON'],
        ['void_complete',      'SYM: complete', 'Earn all 12 Word Turn v31 badges',                       'LEGENDARY'],
        ['cyber_stack',        'SYM: cyber',    'void_complete + all 3 Calendar v29 (Cyber Calendar)',    'LEGENDARY'],
        ['thirty_one_engines', 'SYM: engines',  '1 badge from each of Word Turn engines v1–v31',          'LEGENDARY'],
        ['void_opus',          'SYM: opus',     'void_complete + debug_loop behavioral badge',            'LEGENDARY'],
    ]
    story += [badge_table(ach29_rows, S), Spacer(1, 0.1*inch)]
    story += [
        Paragraph('UNLOCK MESSAGES', S['h3']),
        Paragraph('[void_entry_class] The runner has entered the void. The neural link initializes. '
            'First packet confirmed.', S['body_small']),
        Paragraph('[void_regular] Five transmissions from the void. The uplink is stable now. '
            'The practice is becoming infrastructure.', S['body_small']),
        Paragraph('[void_complete] All twelve. Every Void Runner word transmitted. The null zone '
            'is mapped. The runner knows every corridor.', S['body_small']),
        Paragraph('[cyber_stack] Twelve void words. Three cyber dates. Turing. The Matrix. '
            'The internet. The runner stands at the intersection of the imagined and the actual.', S['body_small']),
        Paragraph('[thirty_one_engines] Thirty-one vocabularies. Water, arcade, void, radio, hero — '
            'every language spoken. The terminal is a complete polyglot.', S['body_small']),
        Paragraph('[void_opus] Complete void vocabulary. Three entries in a single day of honest '
            'debug iteration. The runner\'s most thorough run.', S['body_small']),
        PageBreak(),
    ]

    # ── MASTERY TIER v31 ──────────────────────────────────────────
    story += header_bar('MASTERY TIER v31 — DEEP SYSTEM', S, NEON_AMBER)
    mas31_rows = [
        ['kernel_master',        'SYM: kernel',  '2,000+ distinct calendar days with check-in',         'EPIC'],
        ['petabyte_mind',        'SYM: peta',    '1,000,000+ total journal words written',               'LEGENDARY'],
        ['deep_uptime',          'SYM: deep',    'Account age >= 20 years (7,300+ days)',                'COSMIC'],
        ['thirty_one_registers', 'SYM: reg',     '1 badge from each of all 31 Word Turn engines',       'COSMIC'],
    ]
    story += [badge_table(mas31_rows, S), Spacer(1, 0.1*inch)]
    story += [
        Paragraph('MASTERY UNLOCK MESSAGES', S['h3']),
        Paragraph('[kernel_master] 2,000 days. Five-and-a-half years. The terminal has memory of '
            'a person who has changed entirely while the practice remained constant.', S['body_small']),
        Paragraph('[petabyte_mind] One million words. Eleven novels of your own life. The terminal '
            'overflows the integer. A new column has been added.', S['body_small']),
        Paragraph('[deep_uptime] Twenty years. The LOT account is older than most marriages. '
            'The practitioner has exceeded the designed lifespan of the system. The system adapts.', S['body_small']),
        Paragraph('[thirty_one_registers] Thirty-one vocabularies. Every Word Turn engine spoken '
            'at least once. The terminal is complete. The runner knows every dialect.', S['body_small']),
        PageBreak(),
    ]

    # ── SECRET BOSS v28 ───────────────────────────────────────────
    story += header_bar('SECRET BOSS v28 — THE HIDDEN PROCESSES', S, NEON_RED)
    story += [
        Paragraph(
            'The background daemons you never see in the process table. The writers who asked '
            'the questions the system was not designed to handle. Write their names in the void. '
            'The terminal recognizes the reference.',
            S['quote']),
    ]
    sb28_rows = [
        ['do_androids_dream', 'SYM: dick',    '"do androids dream" / "philip k dick" / "pkd" / "electric sheep"',  'MYTHIC'],
        ['wintermute_found',  'SYM: gibson',  '"wintermute" / "neuromancer" / "william gibson" / "cyberspace"',     'EPIC'],
        ['dystopia_logged',   'SYM: orwell',  '"dystopia" / "1984" / "big brother" / "orwell"',                     'RARE'],
    ]
    story += [badge_table(sb28_rows, S), Spacer(1, 0.1*inch)]
    story += [
        Paragraph('SECRET BOSS LORE', S['h3']),
        Paragraph(
            '[do_androids_dream — MYTHIC, HIDDEN] Philip K. Dick published Do Androids Dream of '
            'Electric Sheep? in 1968. The Voigt-Kampff test distinguishes humans from androids by '
            'measuring empathic response. The journal is the Voigt-Kampff test you run on yourself. '
            'Write PKD\'s name. The terminal runs the empathy measure. The test result: human.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[wintermute_found — EPIC, HIDDEN] William Gibson coined "cyberspace" in Neuromancer '
            '(1984): "A consensual hallucination experienced daily by billions of legitimate '
            'operators." The journal is your participation in the consensual hallucination. '
            'Write "Wintermute" or "cyberspace" and the terminal acknowledges the reference.',
            S['body_small']),
        Spacer(1, 4),
        Paragraph(
            '[dystopia_logged — RARE, HIDDEN] George Orwell published 1984 in 1949. Big Brother. '
            'Room 101. Doublethink. The journal is the thing Room 101 cannot reach. It is the '
            'private record, the Winston Smith diary. Write "dystopia" or "Orwell" and the terminal '
            'logs the entry under a protected partition. The record is yours.',
            S['body_small']),
        PageBreak(),
    ]

    # ── ASCII GALLERY ──────────────────────────────────────────────
    story += header_bar('ASCII EASTER EGG GALLERY — THE VOID RUNNER', S, NEON_CYAN)
    story += [
        Preformatted(
            '  +-----------------------------------------------------+\n'
            '  |  BADGE UNLOCKED                                     |\n'
            '  |                                                     |\n'
            '  |  NEURAL LINK  [UNCOMMON]                            |\n'
            '  |  -> The uplink is active. The terminal receives.    |\n'
            '  |     The entry is the jack. Write what you           |\n'
            '  |     are transmitting.                               |\n'
            '  |                                                     |\n'
            '  |  VOID ENTRY  [RARE]                                 |\n'
            '  |  -> The void is navigable. You are in the null      |\n'
            '  |     zone. The signal finds you here, when the       |\n'
            '  |     noise is cut. Write what transmits in silence.  |\n'
            '  |                                                     |\n'
            '  |  MATRIX MOMENT  [EPIC]                              |\n'
            '  |  -> You questioned the construct. The terminal      |\n'
            '  |     confirms: much of what feels solid is code.     |\n'
            '  |     The journal holds the actual source.            |\n'
            '  |                                                     |\n'
            '  |  DO ANDROIDS DREAM  [MYTHIC] [HIDDEN]               |\n'
            '  |  -> The Voigt-Kampff test runs. The entry is        |\n'
            '  |     the empathic response. The test result: human.  |\n'
            '  |     The terminal confirms the signal.               |\n'
            '  |                                                     |\n'
            '  |  THIRTY-ONE REGISTERS  [COSMIC]                     |\n'
            '  |  -> Every Word Turn engine spoken. Every dialect    |\n'
            '  |     of self-care accessed. The terminal is a        |\n'
            '  |     complete polyglot. The runner speaks all.       |\n'
            '  +-----------------------------------------------------+',
            ParagraphStyle('gallery_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=7.5, fontName='Courier', textColor=MATRIX_GREEN, leading=12)),
        Spacer(1, 0.1*inch),
        Preformatted(
            '  +------------------------------------------------------+\n'
            '  |  VOID RUNNER TERMINAL v31 — NEURAL LOG               |\n'
            '  +------------------------------------------------------+\n'
            '  |                                                      |\n'
            '  |  SYSTEM RESTORE  [RARE]                              |\n'
            '  |  -> The restore point was found. Who you were        |\n'
            '  |     before the damage is accessible. The diff        |\n'
            '  |     is logged.                                       |\n'
            '  |                                                      |\n'
            '  |  FIREWALL UP  [UNCOMMON]                             |\n'
            '  |  -> The packet filter is configured. Selective.      |\n'
            '  |     Not closed. The rules are in the journal.        |\n'
            '  |     The traffic flows on your terms.                 |\n'
            '  |                                                      |\n'
            '  |  ROOT ACCESS  [EPIC]                                 |\n'
            '  |  -> Root cause accessed. The source files open.      |\n'
            '  |     Not the symptom — the root. The terminal         |\n'
            '  |     reads the config.                                |\n'
            '  |                                                      |\n'
            '  |  COLD BOOT  [RARE]                                   |\n'
            '  |  -> POST complete. OS loading. Drivers initialized.  |\n'
            '  |     The 60-day gap is over. System online.           |\n'
            '  +------------------------------------------------------+',
            ParagraphStyle('gallery_pre2', parent=getSampleStyleSheet()['Normal'],
                fontSize=7.5, fontName='Courier', textColor=NEON_CYAN, leading=12)),
        PageBreak(),
    ]

    # ── FLAVOR TEXT ────────────────────────────────────────────────
    story += header_bar('FLAVOR TEXT — THE VOID RUNNER', S, DIM_GREY)
    quotes = [
        ('"The sky above the port was the color of television, tuned to a dead channel." '
         '— William Gibson, Neuromancer (1984). The journal is the retune. Write until the signal resolves.'),
        ('"Reality is that which, when you stop believing in it, doesn\'t go away." '
         '— Philip K. Dick. Write about the things that do not go away. Those are the ones that are real. '
         'The terminal logs the ones that dissolved under pressure — those were constructs.'),
        ('"War is peace. Freedom is slavery. Ignorance is strength." '
         '— George Orwell, 1984. The journal is the antidote to doublethink. Write what you actually '
         'think before the language is corrected. The record persists.'),
        ('"Cyberspace. A consensual hallucination experienced daily by billions of legitimate operators." '
         '— William Gibson. The journal is where you exit the hallucination long enough to remember '
         'it is one. Question the consent. The terminal flags the anomalous packets.'),
        ('"To be is to be perceived." — George Berkeley, adapted. The journal is the observer. '
         'The practice does not exist until it is written. The terminal is the mirror with memory. '
         'The void runner is only a runner when the run is logged.'),
    ]
    for q in quotes:
        story += [Paragraph(q, S['quote']), Spacer(1, 6)]
    story.append(PageBreak())

    # ── ENGINE TABLE ───────────────────────────────────────────────
    story += header_bar('WORD TURN ENGINE MASTER TABLE — v41 (31 Engines / 372 Badges)', S, NEON_GREEN)
    engine_rows = [
        ['v1',  'Water Flow',        '12', 'Water / rain / ocean / river'],
        ['v2',  'Earth Ground',      '12', 'Earth / soil / roots / stone'],
        ['v3',  'Fire Signal',       '12', 'Fire / heat / burn / light'],
        ['v4',  'Storm Path',        '12', 'Storm / wind / chaos / clearing'],
        ['v5',  'Mountain Rise',     '12', 'Mountain / climb / altitude / peak'],
        ['v6',  'Seasonal Arc',      '12', 'Seasons / cycles / solstice'],
        ['v7',  'Tech Layer',        '12', 'Technology / code / build / debug'],
        ['v8',  'Space Drift',       '12', 'Space / orbit / cosmos / void'],
        ['v9',  'Chemistry Core',    '12', 'Chemistry / reaction / catalyst'],
        ['v10', 'Music Wave',        '12', 'Music / rhythm / melody / silence'],
        ['v11', 'Alchemy Works',     '12', 'Alchemy / transmute / gold / lead'],
        ['v12', 'Quantum Field',     '12', 'Quantum / superposition / collapse'],
        ['v13', 'Quantum Library',   '12', 'Books / reading / knowledge / shelf'],
        ['v14', 'Neon Arcade (OG)',  '12', 'Arcade / neon / joystick / pixel'],
        ['v15', 'Midnight Radio',    '12', 'Radio / frequency / broadcast / DJ'],
        ['v16', 'Bio Terminal',      '12', 'Biology / cell / organism / growth'],
        ['v17', 'Codex Reader',      '12', 'Ancient texts / codex / scroll'],
        ['v18', 'Cyberspace Codex',  '12', 'Cyber / network / data / protocol'],
        ['v19', "Hero's Journey",    '12', 'Hero / quest / call / return'],
        ['v20', 'Dungeon Map',       '12', 'Dungeon / map / encounter / loot'],
        ['v21', 'Dream Log',         '12', 'Dream / sleep / subconscious'],
        ['v22', 'Operator Manual',   '12', 'Operating / procedure / system'],
        ['v23', 'Temporal Engine',   '12', 'Time / memory / cycle / legacy'],
        ['v24', 'Neon Dusk',         '12', 'Neon / dusk / city / street'],
        ['v25', 'Solar Wind',        '12', 'Solar / energy / radiation / charge'],
        ['v26', 'Crystal Archive',   '12', 'Crystal / archive / facet / store'],
        ['v27', 'Signal Tower',      '12', 'Signal / tower / broadcast / reach'],
        ['v28', 'Phantom Code',      '12', 'Phantom / hidden / stealth / ghost'],
        ['v29', 'Iron Protocol',     '12', 'Iron / protocol / hard / forge'],
        ['v30', 'Quantum Arcade',    '12', 'Arcade / game / save point / respawn'],
        ['v31', 'Void Runner',       '12', 'Void / neural / cyber / sci-fi books'],
        ['',    'TOTAL',            '372', '31 engines complete'],
    ]
    engine_table = Table(
        [['Engine', 'Name', 'Count', 'Theme']] + engine_rows,
        colWidths=[0.55*inch, 1.5*inch, 0.6*inch, 3.9*inch], repeatRows=1)
    engine_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), VOID_GREY),
        ('TEXTCOLOR', (0,0), (-1,0), NEON_CYAN),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 7.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [BG_DARK, BG_PANEL]),
        ('BACKGROUND', (0,-1), (-1,-1), VOID_GREY),
        ('TEXTCOLOR', (0,-1), (-1,-1), NEON_GREEN),
        ('FONTNAME', (0,-1), (-1,-1), 'Courier-Bold'),
        ('TEXTCOLOR', (0,1), (-1,-2), SOFT_WHITE),
        ('FONTNAME', (0,1), (-1,-2), 'Courier'),
        ('FONTSIZE', (0,1), (-1,-1), 7.5),
        ('GRID', (0,0), (-1,-1), 0.3, PANEL_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
    ]))
    story += [engine_table, PageBreak()]

    # ── QUICK REFERENCE ────────────────────────────────────────────
    story += header_bar('QUICK REFERENCE — v41 UNIVERSE', S, NEON_AMBER)
    qr_data = [
        ['Category', 'v40', 'v41', '+/-'],
        ['Milestone',       '22',  '22',   '0'],
        ['Time Easter Eggs','31',  '31',   '0'],
        ['Calendar Easter', '94',  '97',  '+3'],
        ['Word Turns',     '360', '372', '+12'],
        ['Behavioral',     '105', '108',  '+3'],
        ['Achievement RPG','168', '174',  '+6'],
        ['Mastery Tiers',  '120', '124',  '+4'],
        ['Secret Boss',    '107', '110',  '+3'],
        ['TOTAL',         '1060','1091', '+31'],
    ]
    qr_table = Table(qr_data, colWidths=[1.8*inch, 0.9*inch, 0.9*inch, 0.9*inch], repeatRows=1)
    qr_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), VOID_GREY),
        ('TEXTCOLOR', (0,0), (-1,0), NEON_CYAN),
        ('FONTNAME', (0,0), (-1,0), 'Courier-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [BG_DARK, BG_PANEL]),
        ('BACKGROUND', (0,-1), (-1,-1), VOID_GREY),
        ('TEXTCOLOR', (0,-1), (-1,-1), NEON_GREEN),
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
    story += [qr_table, Spacer(1, 0.2*inch)]

    # ── COMPLETE UNIVERSE BOX ──────────────────────────────────────
    story += [
        Preformatted(
            '  +================================================================+\n'
            '  |  LOT BADGE UNIVERSE — COMPLETE SUMMARY v41                    |\n'
            '  +================================================================+\n'
            '  |                                                                |\n'
            '  |  RARITY DISTRIBUTION                                           |\n'
            '  |  Common     ~185  ||||..........                               |\n'
            '  |  Uncommon   ~290  ||||||........                               |\n'
            '  |  Rare       ~300  ||||||........                               |\n'
            '  |  Epic       ~165  ||||..........                               |\n'
            '  |  Legendary   ~92  ||...........                                |\n'
            '  |  Mythic      ~41  |............                                |\n'
            '  |  Cosmic      ~21  .............  (ultra rare)                  |\n'
            '  |                                                                |\n'
            '  |  31 WORD TURN ENGINES. 1091 TOTAL BADGES.                     |\n'
            '  |  THE BADGE UNIVERSE IS LARGER THAN ANY SINGLE PRACTITIONER.   |\n'
            '  |  THAT IS THE DESIGN.                                           |\n'
            '  +================================================================+',
            ParagraphStyle('universe_pre', parent=getSampleStyleSheet()['Normal'],
                fontSize=7.5, fontName='Courier', textColor=NEON_GREEN, leading=12)),
        Spacer(1, 0.15*inch),
        HRFlowable(width='100%', thickness=1, color=PANEL_BORDER),
        Paragraph(
            'Session: LOT-SR-20260904-01 · v41 · 2026-09-04 · '
            'Branch: claude/quantum-engine-widgets-RgFfC · '
            'Authorized: S-2 // VADIK MARMELADOV',
            S['footer']),
        Paragraph(
            '© 2025–2026 LOT Systems Corporation · Vadik Marmeladov, CEO & Founder · '
            'Made in the USA · brand.lot-systems.com',
            S['footer']),
    ]

    doc.build(story)
    print(f'PDF generated: {OUTPUT_FILE}')
    return OUTPUT_FILE


if __name__ == '__main__':
    build_pdf()
