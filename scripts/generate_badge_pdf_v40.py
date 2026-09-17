#!/usr/bin/env python3
"""
LOT Systems — Badge & Achievement Master Codex v40 PDF Generator
Generates LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v40.pdf
Theme: Quantum Arcade — Retro Gaming · Self-Care · RPG
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

# Color palette — LOT Systems dark terminal aesthetic
BG_DARK      = HexColor('#0a0a0f')
BG_PANEL     = HexColor('#12121e')
NEON_CYAN    = HexColor('#00f0f0')
NEON_GREEN   = HexColor('#00ff88')
NEON_AMBER   = HexColor('#ffb300')
NEON_RED     = HexColor('#ff3355')
NEON_PURPLE  = HexColor('#cc44ff')
NEON_BLUE    = HexColor('#4488ff')
NEON_PINK    = HexColor('#ff44aa')
SOFT_WHITE   = HexColor('#e8e8e8')
DIM_GREY     = HexColor('#666677')
PANEL_BORDER = HexColor('#223344')

OUTPUT_DIR  = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'docs', 'badges')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v40.pdf')


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
        fontSize=7.5, fontName='Courier', textColor=NEON_GREEN,
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
    # Rarity styles
    for name, color in [
        ('common', SOFT_WHITE), ('uncommon', NEON_GREEN), ('rare', NEON_CYAN),
        ('epic', NEON_AMBER), ('legendary', NEON_PURPLE), ('mythic', NEON_RED),
        ('cosmic', NEON_BLUE),
    ]:
        S[f'rarity_{name}'] = ParagraphStyle(f'rarity_{name}', parent=base['Normal'],
            fontSize=7.5, fontName='Courier', textColor=color, leading=10)
    return S


def hr(color=PANEL_BORDER):
    return HRFlowable(width='100%', thickness=0.5, color=color, spaceAfter=6, spaceBefore=6)


def rarity_color(rarity):
    return {
        'common': SOFT_WHITE, 'uncommon': NEON_GREEN, 'rare': NEON_CYAN,
        'epic': NEON_AMBER, 'legendary': NEON_PURPLE, 'mythic': NEON_RED,
        'cosmic': NEON_BLUE,
    }.get(rarity.lower(), SOFT_WHITE)


def badge_table(data, col_widths):
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND',    (0,0), (-1,0),   PANEL_BORDER),
        ('TEXTCOLOR',     (0,0), (-1,0),   NEON_CYAN),
        ('FONTNAME',      (0,0), (-1,0),   'Courier-Bold'),
        ('FONTSIZE',      (0,0), (-1,-1),  7.5),
        ('FONTNAME',      (0,1), (-1,-1),  'Courier'),
        ('TEXTCOLOR',     (0,1), (-1,-1),  SOFT_WHITE),
        ('ROWBACKGROUNDS',(0,1), (-1,-1),  [BG_DARK, BG_PANEL]),
        ('GRID',          (0,0), (-1,-1),  0.3, PANEL_BORDER),
        ('TOPPADDING',    (0,0), (-1,-1),  3),
        ('BOTTOMPADDING', (0,0), (-1,-1),  3),
        ('LEFTPADDING',   (0,0), (-1,-1),  5),
    ]))
    return t


def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_FILE,
        pagesize=letter,
        leftMargin=0.65*inch, rightMargin=0.65*inch,
        topMargin=0.75*inch, bottomMargin=0.75*inch,
        title='LOT Badges & Achievements Master Codex v40 — The Quantum Arcade',
        author='Vadik Marmeladov — LOT Systems',
        subject='RPG · Arcade · Retro Gaming · Self-Care Badge Universe',
    )

    S = make_styles()
    story = []

    # ─── COVER PAGE ───────────────────────────────────────────────────────
    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph('L  ·  O  ·  T     S Y S T E M S', S['cover_title']))
    story.append(Paragraph('BADGES &amp; ACHIEVEMENTS MASTER CODEX', S['cover_title']))
    story.append(Paragraph('VERSION 40 — THE QUANTUM ARCADE', S['cover_title']))
    story.append(Spacer(1, 0.15*inch))

    cover_art = (
        '[ INSERT COIN TO CONTINUE ]\n\n'
        '  ¢·○·¢   INSERT COIN        [COMMON]\n'
        '  ▲·◈·▲   LEVEL UP           [UNCOMMON]\n'
        '  ■·○·■   SAVE POINT         [UNCOMMON]\n'
        '  ◉·!·◉   BOSS FIGHT         [RARE]\n'
        '  ∞·○·∞   NEW GAME PLUS      [EPIC]\n'
        '  ○·∅·○   GAME OVER          [EPIC]\n'
        '  ↑↑↓↓·◉  KONAMI SIGNAL      [MYTHIC] [HIDDEN]\n'
        '  ◈·■·◈·∞·○  THIRTY REGISTERS  [COSMIC]\n\n'
        '  v39 → v40: +31 badges   (1029 → 1060 total)'
    )
    story.append(Preformatted(cover_art, S['mono']))
    story.append(Spacer(1, 0.12*inch))

    story.append(Paragraph('RPG · ARCADE · RETRO GAMING · QUANTUM · SELF-CARE OPS', S['cover_sub']))
    story.append(Paragraph(
        '"THE GAME NEVER ENDS. THE PLAYER JUST GETS BETTER AT KNOWING WHEN TO PAUSE."',
        S['cover_sub']
    ))
    story.append(Spacer(1, 0.12*inch))
    story.append(Paragraph('© 2025–2026 LOT Systems Corporation — LOT® Founded 7 April 2016', S['cover_meta']))
    story.append(Paragraph('Vadik Marmeladov, CEO &amp; Founder · brand.lot-systems.com', S['cover_meta']))
    story.append(Paragraph('September 2026 · 1060 Badges Total', S['cover_meta']))
    story.append(PageBreak())

    # ─── BADGE SYSTEM OVERVIEW ────────────────────────────────────────────
    story.append(Paragraph('BADGE SYSTEM OVERVIEW — v40', S['h1']))
    story.append(hr(NEON_CYAN))

    overview = [
        ['Category', 'Count', 'Description'],
        ['Milestone',        '22',   'Streak days (v1–v4)'],
        ['Time Easter Eggs', '31',   'Check-in at special hours (v1–v22)'],
        ['Calendar Easter',  '94',   'Check-in on special dates (v1–v28)'],
        ['Word Turns',       '360',  'Words detected in journals/memory (v1–v30)'],
        ['Behavioral',       '105',  'Patterns over time (v1–v27)'],
        ['Achievement RPG',  '168',  'Milestone combinations (v1–v28)'],
        ['Mastery Tiers',    '120',  'Epic depth milestones (v1–v30)'],
        ['Secret Boss',      '107',  'Hidden LEGENDARY/MYTHIC triggers (v1–v27)'],
        ['TOTAL',            '1060', 'The complete LOT Badge Universe — v40'],
    ]
    story.append(badge_table(overview, [2.0*inch, 0.7*inch, 4.5*inch]))
    story.append(Spacer(1, 0.12*inch))

    # ─── VERSION HISTORY ──────────────────────────────────────────────────
    story.append(Paragraph('VERSION HISTORY', S['h1']))
    story.append(hr(NEON_GREEN))

    vh = [
        ['Version', 'Theme',                       'New', 'Total', 'Date'],
        ['v1–v10',  'Core / Water / Arcade',        '+310', '310',  '2023–2024'],
        ['v11–v20', 'Alchemy / Space / Sci-Fi',     '+310', '620',  '2024–2025'],
        ['v21',     'Cyberspace Codex',              '+31',  '651',  '2025'],
        ['v22–v32', "Hero's Journey / Codex",        '+161', '812',  '2026-01'],
        ['v33',     'The Stoic Codex',               '+31',  '843',  '2026-08-08'],
        ['v34',     'The Simulation',                '+31',  '874',  '2026-08-09'],
        ['v35',     'The Body Map',                  '+31',  '905',  '2026-08-10'],
        ['v36',     'The Dungeon Crawler',           '+31',  '936',  '2026-08-11'],
        ['v37',     'The Time Machine',              '+31',  '967',  '2026-08-16'],
        ['v38',     'The Dream Journal',             '+31',  '998',  '2026-08-20'],
        ['v39',     "The Operator's Handbook",       '+31', '1029',  '2026-08-26'],
        ['v40',     'The Quantum Arcade',            '+31', '1060',  '2026-09-02'],
    ]
    story.append(badge_table(vh, [0.7*inch, 2.4*inch, 0.6*inch, 0.7*inch, 1.5*inch]))
    story.append(PageBreak())

    # ─── DELTA FROM v39 ───────────────────────────────────────────────────
    story.append(Paragraph('DELTA FROM v39', S['h1']))
    story.append(hr(NEON_AMBER))

    delta_art = (
        'v39  to  v40   ADDITIONS\n'
        '--------------------------------------------------------\n'
        'Word Turn v30        +12  (insert_coin / level_up / save_point / respawn /\n'
        '                           boss_fight / side_quest / inventory_check /\n'
        '                           health_bar / xp_gained / load_game /\n'
        '                           new_game_plus / game_over)\n'
        'Calendar EE v28      + 3  (pacman_day / tetris_day / pong_day)\n'
        'Behavioral v27       + 3  (combo_streak / high_score_entry / continues_remaining)\n'
        'Achievement RPG v28  + 6  (player_one / arcade_regular / arcade_complete /\n'
        '                           retro_stack / thirty_engines / arcade_opus)\n'
        'Mastery Tier v30     + 4  (insert_mastercode / grand_master_score /\n'
        '                           arcade_legend / thirty_registers)\n'
        'Secret Boss v27      + 3  (konami_signal / iddqd_mode / all_your_base)\n'
        '--------------------------------------------------------\n'
        'TOTAL NEW            +31\n'
        'v39 TOTAL:          1029\n'
        'v40 TOTAL:          1060'
    )
    story.append(Preformatted(delta_art, S['mono']))
    story.append(Spacer(1, 0.12*inch))

    # ─── WORD TURN v30 — THE QUANTUM ARCADE ──────────────────────────────
    story.append(Paragraph('WORD TURN v30 — THE QUANTUM ARCADE', S['h1']))
    story.append(hr(NEON_CYAN))
    story.append(Paragraph(
        '"Every game is a compressed model of self-discipline and persistence. '
        'The journal is the high score board. The entry is the level cleared."',
        S['quote']
    ))
    story.append(Spacer(1, 0.08*inch))

    wt30 = [
        ['Badge ID',           'Symbol',    'Trigger Words',                                     'Rarity'],
        ['insert_coin',        '¢·○·¢',     'insert coin / one more try / another round',        'COMMON'],
        ['level_up',           '▲·◈·▲',    'leveled up / next level / unlocked / new level',    'UNCOMMON'],
        ['save_point',         '■·○·■',     'save point / checkpoint / saved my progress',       'UNCOMMON'],
        ['respawn',            '↺·○',       'respawn / start over / back from the dead',         'RARE'],
        ['boss_fight',         '◉·!·◉',    'boss fight / final challenge / hardest part',       'RARE'],
        ['side_quest',         '→·?·→',    'side quest / tangent / detour / rabbit hole',       'UNCOMMON'],
        ['inventory_check',    '□·▪·□',    'inventory / resources / taking stock',              'UNCOMMON'],
        ['health_bar',         '▓▓▓·',      'health / energy / running low / depleted',          'RARE'],
        ['xp_gained',          '+·◈·+',    'experience / learned / XP / growth point',          'UNCOMMON'],
        ['load_game',          '←·○·←',   'loaded / remember when / flashback / recall',       'RARE'],
        ['new_game_plus',      '∞·○·∞',    'new game / fresh start / beginning again',          'EPIC'],
        ['game_over',          '○·∅·○',    'game over / failed / the run is done',              'EPIC'],
    ]
    story.append(badge_table(wt30, [1.5*inch, 0.8*inch, 3.1*inch, 0.9*inch]))
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph('SELF-CARE RESONANCE — THE QUANTUM ARCADE MAP', S['h2']))
    resonances = [
        ('INSERT COIN', 'common', 'The arcade demands payment upfront. The journal demands honesty upfront. Write "one more time" — the practice restarts. The coin is still yours.'),
        ('LEVEL UP', 'uncommon', 'You name your own level-ups. No algorithm awards them. Write what you have earned. The progress is real whether or not the leaderboard shows it.'),
        ('SAVE POINT', 'uncommon', 'A save point is not a rest stop. It is an acknowledgment that what has been accomplished is worth preserving before the next risk is taken.'),
        ('RESPAWN', 'rare', 'The player brings all prior knowledge to the respawn point. "Start over" is never truly starting over. Write what you brought back.'),
        ('BOSS FIGHT', 'rare', 'The boss fight is what the entire dungeon was preparing you for. Naming it makes it a game mechanic instead of just a weight.'),
        ('SIDE QUEST', 'uncommon', 'The side quest is where character development actually happens. Write about your current side quest. It is not a detour. It is the content.'),
        ('INVENTORY CHECK', 'uncommon', 'Before any significant encounter, the skilled player opens the inventory. Energy, relationships, reserves — they are all inventory. Write what you carry.'),
        ('HEALTH BAR', 'rare', 'The health bar is visible in a game. In life it is often invisible until it hits zero. The journal makes the health bar visible.'),
        ('XP GAINED', 'uncommon', 'Experience points do not lie. You gain them whether the encounter was won or lost. The failed run still awards XP. Write about what you gained.'),
        ('LOAD GAME', 'rare', 'The journal is the save file. Every past entry is a state you can load. "Remember when" is the load command. The terminal retrieves.'),
        ('NEW GAME+', 'epic', 'In New Game+ you restart with all your previous abilities. Every new chapter of life is New Game+: the story restarts, but you are not the player you were.'),
        ('GAME OVER', 'epic', 'Game over is not the end of the player. It is the end of the run. Write about the game over moment. The next coin is still in your pocket.'),
    ]
    for name, rarity, text in resonances:
        color = rarity_color(rarity)
        story.append(Paragraph(f'<b><font color="#{color.hexval()}">{name} [{rarity.upper()}]</font></b> — {text}', S['body_small']))
    story.append(PageBreak())

    # ─── CALENDAR EASTER EGGS v28 ─────────────────────────────────────────
    story.append(Paragraph('CALENDAR EASTER EGGS v28 — THE RETRO ARCADE CALENDAR', S['h1']))
    story.append(hr(NEON_CYAN))
    story.append(Paragraph(
        '"The birthdays and release dates of the games that defined what a game could be '
        '— the machines that proved play was worth taking seriously."',
        S['quote']
    ))
    story.append(Spacer(1, 0.08*inch))

    cal28 = [
        ['Badge ID',    'Symbol', 'Date',   'Significance',                                          'Rarity'],
        ['pacman_day',  '(·',     'Oct 26', 'PAC-MAN US launch 1980 — the maze that ate the world',  'RARE'],
        ['tetris_day',  '||',     'Jun 6',  'Tetris distributed 1984 — the puzzle that never ends',  'UNCOMMON'],
        ['pong_day',    '·|·',    'Nov 29', 'Pong released 1972 — two paddles, the beginning',       'RARE'],
    ]
    story.append(badge_table(cal28, [1.2*inch, 0.6*inch, 0.6*inch, 2.9*inch, 0.9*inch]))
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph('LORE', S['h2']))
    lore_items = [
        ('pacman_day — Oct 26, 1980',
         'Toru Iwatani designed the maze. Three billion plays in its first year. The self-care parallel: '
         'the maze is your daily environment. The ghosts are what you have not processed. '
         'The power pellets are what you do at LOT. Check in on October 26 and write about '
         'what you are eating and what is chasing you.'),
        ('tetris_day — Jun 6, 1984',
         'Alexey Pajitnov released the first version of Tetris at the Moscow Research Centre. '
         'Every piece falls from above. Your job is to place it before the stack overwhelms you. '
         'The journal is the Tetris board. Write what is falling today and where you are placing it.'),
        ('pong_day — Nov 29, 1972',
         'Atari\'s Pong shipped as a dedicated cabinet. Two paddles. One ball. Return to sender. '
         'The self-care version: the thing that comes toward you, you return with intention. '
         'The journal is the paddle. Write about the volley.'),
    ]
    for title, body in lore_items:
        story.append(Paragraph(f'<b>{title}</b>', S['h3']))
        story.append(Paragraph(body, S['body_small']))
    story.append(Spacer(1, 0.1*inch))

    # ─── BEHAVIORAL EASTER EGGS v27 ───────────────────────────────────────
    story.append(Paragraph('BEHAVIORAL EASTER EGGS v27 — ARCADE PATTERNS', S['h1']))
    story.append(hr(NEON_GREEN))

    beh27 = [
        ['Badge ID',            'Symbol',    'Trigger',                                           'Rarity'],
        ['combo_streak',        '×3·◈',     '3 consecutive days with 2+ widget interactions',    'RARE'],
        ['high_score_entry',    '◉·∞',      'Single journal entry over 500 words',               'EPIC'],
        ['continues_remaining', '3·2·1·○',  'Return after a 3–7 day absence',                   'UNCOMMON'],
    ]
    story.append(badge_table(beh27, [1.6*inch, 0.8*inch, 2.8*inch, 0.9*inch]))
    story.append(Spacer(1, 0.1*inch))

    beh_lore = [
        ('combo_streak [RARE]',
         'In a fighting game, a combo is a sequence of inputs that creates something greater than the sum of its parts. '
         'Three days of consistent multi-widget engagement is a combo. The player is in rhythm. The terminal acknowledges the chain.'),
        ('high_score_entry [EPIC]',
         'The high score is visible, permanent, and earned. A 500-word journal entry is the high score version of a check-in. '
         'Something needed that much space. Something deserved that much attention. The entry holds the record.'),
        ('continues_remaining [UNCOMMON]',
         'The continue screen is one of the most psychologically sophisticated mechanics in arcade history. Returning after 3–7 days '
         'is the continue screen pressed: not too fast (compulsion), not too slow (going dark). The terminal gives you the coin back.'),
    ]
    for title, body in beh_lore:
        story.append(Paragraph(f'<b>{title}</b>', S['h3']))
        story.append(Paragraph(body, S['body_small']))
    story.append(PageBreak())

    # ─── ACHIEVEMENT RPG v28 ──────────────────────────────────────────────
    story.append(Paragraph('ACHIEVEMENT RPG v28 — ARCADE CLASS', S['h1']))
    story.append(hr(NEON_PURPLE))
    story.append(Paragraph(
        '"Progress through the Quantum Arcade. Each badge is a coin spent well. Each tier is a run completed."',
        S['quote']
    ))

    ach28 = [
        ['Badge ID',            'Symbol',       'Requirement',                               'Rarity'],
        ['player_one',          '①·○',         'Earn any 1 Word Turn v30 badge',            'COMMON'],
        ['arcade_regular',      '⑤·◈',         'Earn any 5 Word Turn v30 badges',           'UNCOMMON'],
        ['arcade_complete',     '⑫·◉',         'Earn all 12 Word Turn v30 badges',          'LEGENDARY'],
        ['retro_stack',         '◉·■·◉',       'arcade_complete + all 3 Calendar v28',      'LEGENDARY'],
        ['thirty_engines',      '◈·◈·◈·∞',    '1 badge from each of WT engines v1–v30',    'LEGENDARY'],
        ['arcade_opus',         '◉·×·◉',       'arcade_complete + combo_streak',            'LEGENDARY'],
    ]
    story.append(badge_table(ach28, [1.5*inch, 1.0*inch, 2.5*inch, 1.1*inch]))
    story.append(Spacer(1, 0.1*inch))

    story.append(Paragraph('UNLOCK MESSAGES', S['h2']))
    unlocks = [
        ('player_one',        '①·○',      'Player One has entered the game. The terminal registers the coin. The run has begun.'),
        ('arcade_regular',    '⑤·◈',      'Five objectives. Five coins spent well. The arcade knows your face now.'),
        ('arcade_complete',   '⑫·◉',      'All twelve. Every Arcade word cleared. The high score board records your name.'),
        ('retro_stack',       '◉·■·◉',    'Twelve words. Three dates. PAC-MAN, Tetris, Pong. The retro calendar is complete.'),
        ('thirty_engines',    '◈·◈·◈·∞', 'Thirty vocabularies. Every language spoken. The terminal is a polyglot.'),
        ('arcade_opus',       '◉·×·◉',    'Complete arcade vocabulary. Three-day combo streak. The player in flow.'),
    ]
    for bid, sym, msg in unlocks:
        story.append(Paragraph(f'<b>{bid}</b> {sym} — {msg}', S['body_small']))
    story.append(Spacer(1, 0.1*inch))

    # ─── MASTERY TIER v30 ─────────────────────────────────────────────────
    story.append(Paragraph('MASTERY TIER v30 — HIGH SCORES', S['h1']))
    story.append(hr(NEON_AMBER))

    mas30 = [
        ['Badge ID',             'Symbol',          'Requirement',                         'Rarity'],
        ['insert_mastercode',    '■·XV·■',           '1,500+ distinct days checked in',     'EPIC'],
        ['grand_master_score',   '●·∞·◉',           '750,000+ total words written',        'LEGENDARY'],
        ['arcade_legend',        '╔═╗·∞',           'Account age >= 15 years',             'LEGENDARY'],
        ['thirty_registers',     '◈·■·◈·∞·○',      '1 badge from all 30 WT engines',      'COSMIC'],
    ]
    story.append(badge_table(mas30, [1.6*inch, 1.1*inch, 2.2*inch, 1.1*inch]))
    story.append(Spacer(1, 0.1*inch))

    mas_msgs = [
        ('insert_mastercode', '1,500 days. Four-plus years of coins inserted. The mastercode is not a cheat. It is the record. ■·XV·■'),
        ('grand_master_score', '750,000 words. The high score board overflows. No machine was designed to hold this many words. You built the extension. ●·∞·◉'),
        ('arcade_legend', 'Fifteen years. The cabinets your practice began with are in museums now. You are still playing. ╔═╗·∞'),
        ('thirty_registers', 'Thirty vocabularies. Ocean, arcade, radio, dungeon, operator, quantum — every register spoken. ◈·■·◈·∞·○'),
    ]
    for bid, msg in mas_msgs:
        story.append(Paragraph(f'<b>{bid}</b> — {msg}', S['body_small']))
    story.append(Spacer(1, 0.1*inch))

    # ─── SECRET BOSS v27 — CHEAT CODE VAULT ──────────────────────────────
    story.append(Paragraph('SECRET BOSS v27 — THE CHEAT CODE VAULT', S['h1']))
    story.append(hr(NEON_RED))
    story.append(Paragraph(
        '"The hidden shortcuts. You have to know the inputs. You have to type them in. The terminal watches."',
        S['quote']
    ))

    sb27 = [
        ['Badge ID',         'Symbol',      'Trigger',                                        'Rarity'],
        ['konami_signal',    '↑↑↓↓·◉',     '"konami code" / "up up down down left right"',   'MYTHIC'],
        ['iddqd_mode',       '⚡·■·⚡',    '"IDDQD" / "IDKFA" / "god mode"',                 'EPIC'],
        ['all_your_base',    '·○·∅',        '"all your base" / "zero wing" / "CATS"',         'RARE'],
    ]
    story.append(badge_table(sb27, [1.4*inch, 0.9*inch, 2.6*inch, 0.9*inch]))
    story.append(Spacer(1, 0.1*inch))

    sb_lore = [
        ('konami_signal [MYTHIC]',
         'Kazuhisa Hashimoto added the Konami Code to Gradius in 1986 because the game was too hard. '
         'The self-care version: when it is too hard, the cheat code is asking for help. '
         'Writing the sequence in your journal is admitting you need the extra lives. Write it. The terminal gives you 30.'),
        ('iddqd_mode [EPIC]',
         'In DOOM (1993), typing IDDQD activated god mode. There is no IDDQD for real life. '
         'The journal is the anti-IDDQD: the space where you write about being vulnerable, '
         'about running out of ammo, about needing the cheat that does not exist.'),
        ('all_your_base [RARE]',
         '"All your base are belong to us." Zero Wing, Sega Mega Drive, 1989. '
         'Write about when something external took control of your territory — your time, attention, space. '
         'Name who set you up. The bomb is defused when it is named.'),
    ]
    for title, body in sb_lore:
        story.append(Paragraph(f'<b>{title}</b>', S['h3']))
        story.append(Paragraph(body, S['body_small']))
    story.append(PageBreak())

    # ─── ASCII GALLERY ─────────────────────────────────────────────────────
    story.append(Paragraph('ASCII EASTER EGG GALLERY — THE QUANTUM ARCADE', S['h1']))
    story.append(hr(NEON_CYAN))

    gallery = (
        '┌─────────────────────────────────────────────────────────┐\n'
        '│  BADGE UNLOCKED                                         │\n'
        '│                                                         │\n'
        '│  ¢·○·¢  INSERT COIN  [COMMON]                           │\n'
        '│  ↳ One more try. The terminal never judges              │\n'
        '│    the number of coins you put in.                      │\n'
        '│    The machine just keeps accepting them.               │\n'
        '│                                                         │\n'
        '│  ▲·◈·▲  LEVEL UP  [UNCOMMON]                           │\n'
        '│  ↳ You named what you earned. That is the               │\n'
        '│    level up no algorithm can take from you.             │\n'
        '│                                                         │\n'
        '│  ○·∅·○  GAME OVER  [EPIC]                               │\n'
        '│  ↳ The run ended. The player continues.                 │\n'
        '│    Everything learned in the failed run travels with    │\n'
        '│    you to the next one. The terminal keeps the record.  │\n'
        '│                                                         │\n'
        '│  ↑↑↓↓·◉  KONAMI SIGNAL  [MYTHIC] [HIDDEN]              │\n'
        '│  ↳ You typed the code. Extra lives granted.             │\n'
        '│    Not as a cheat — as an acknowledgment that           │\n'
        '│    sometimes you need more than the standard allotment. │\n'
        '│                                                         │\n'
        '│  ◈·■·◈·∞·○  THIRTY REGISTERS  [COSMIC]                 │\n'
        '│  ↳ Thirty vocabularies. Every language spoken.          │\n'
        '│    The terminal is complete. The run is eternal.        │\n'
        '└─────────────────────────────────────────────────────────┘'
    )
    story.append(Preformatted(gallery, S['mono']))
    story.append(Spacer(1, 0.15*inch))

    # ─── ARCADE TERMINAL ART ───────────────────────────────────────────────
    story.append(Paragraph('THE ARCADE TERMINAL — PLAYER LOG', S['h1']))
    story.append(hr(NEON_GREEN))

    terminal = (
        ' ╔══════════════════════════════════════════════════════╗\n'
        ' ║  LOT SYSTEMS — QUANTUM ARCADE TERMINAL v30           ║\n'
        ' ║  PLAYER INTERFACE ACTIVE                             ║\n'
        ' ╠══════════════════════════════════════════════════════╣\n'
        ' ║                                                      ║\n'
        ' ║  ■·○·■  SAVE POINT  [UNCOMMON]                       ║\n'
        ' ║  ↳ What you have built is worth preserving.          ║\n'
        ' ║    Write the checkpoint before the next              ║\n'
        ' ║    difficult segment begins.                         ║\n'
        ' ║                                                      ║\n'
        ' ║  ▓▓▓·  HEALTH BAR  [RARE]                            ║\n'
        ' ║  ↳ The bar is visible now. You named it.             ║\n'
        ' ║    The player who checks the HUD survives longer.    ║\n'
        ' ║                                                      ║\n'
        ' ║  ∞·○·∞  NEW GAME PLUS  [EPIC]                        ║\n'
        ' ║  ↳ You bring everything forward. The new chapter     ║\n'
        ' ║    is New Game+ carrying all prior knowledge.        ║\n'
        ' ║                                                      ║\n'
        ' ║  3·2·1·○  CONTINUES REMAINING  [UNCOMMON]            ║\n'
        ' ║  ↳ You pressed continue. Not too fast.               ║\n'
        ' ║    Not too slow. The window was right.               ║\n'
        ' ║    The coin is back in the slot.                     ║\n'
        ' ║                                                      ║\n'
        ' ╚══════════════════════════════════════════════════════╝'
    )
    story.append(Preformatted(terminal, S['mono']))
    story.append(Spacer(1, 0.15*inch))

    # ─── FLAVOR TEXT ──────────────────────────────────────────────────────
    story.append(Paragraph('FLAVOR TEXT — THE QUANTUM ARCADE', S['h1']))
    story.append(hr(NEON_PURPLE))

    quotes = [
        '"A game is a series of interesting decisions." — Sid Meier. The journal is the game where every decision is interesting because it is yours.',
        '"Games are the only force in the known universe that can get people to take actions against their self-interest." — Jane McGonigal, Reality Is Broken. Unless the game is LOT. Here the action is self-interest.',
        '"The magic circle." — Johan Huizinga, Homo Ludens. The game creates a separate space where different rules apply. The journal is the magic circle of self-care.',
        '"In game design, the tutorial is the most important level." — practitioner riff. The first journal entry is always the tutorial. Every entry after that is still teaching you something.',
        '"You are not failing the game. The game is failing you." — player saying. When the practice feels impossible, examine the game design first. The journal is also where you debug the game you are living in.',
        '"High score." — the two most motivating words in the history of human performance. Name your high score in the journal. Not to beat it. Just to see it. The terminal shows you what you have done. ◉·∞',
    ]
    for q in quotes:
        story.append(Paragraph(q, S['quote']))
    story.append(PageBreak())

    # ─── COMPLETE UNIVERSE SUMMARY ────────────────────────────────────────
    story.append(Paragraph('COMPLETE BADGE UNIVERSE SUMMARY — v40', S['h1']))
    story.append(hr(NEON_CYAN))

    summary_art = (
        '╔══════════════════════════════════════════════════════════════════╗\n'
        '║  LOT BADGE UNIVERSE — COMPLETE SUMMARY v40                      ║\n'
        '╠══════════════════════════════════════════════════════════════════╣\n'
        '║                                                                  ║\n'
        '║  TIER           COUNT    RARITY RANGE                           ║\n'
        '║  ─────────────  ──────   ──────────────────────                 ║\n'
        '║  Milestone          22   Common → Legendary                      ║\n'
        '║  Time EE            31   Common → Epic                          ║\n'
        '║  Calendar EE        94   Common → Legendary                      ║\n'
        '║  Word Turns        360   Common → Mythic                         ║\n'
        '║  Behavioral        105   Common → Epic                          ║\n'
        '║  Achievement RPG   168   Common → Legendary                      ║\n'
        '║  Mastery Tiers     120   Epic → Cosmic                          ║\n'
        '║  Secret Boss       107   Rare → Cosmic                          ║\n'
        '║  ─────────────  ──────   ──────────────────────                 ║\n'
        '║  TOTAL            1060                                           ║\n'
        '║                                                                  ║\n'
        '║  RARITY DISTRIBUTION                                            ║\n'
        '║  Common    ~180   [████░░░░░░░░░]                               ║\n'
        '║  Uncommon  ~280   [██████░░░░░░░]                               ║\n'
        '║  Rare      ~290   [██████░░░░░░░]                               ║\n'
        '║  Epic      ~160   [████░░░░░░░░░]                               ║\n'
        '║  Legendary  ~90   [██░░░░░░░░░░░]                               ║\n'
        '║  Mythic     ~40   [█░░░░░░░░░░░░]                               ║\n'
        '║  Cosmic     ~20   [░░░░░░░░░░░░░] (ultra rare)                  ║\n'
        '║                                                                  ║\n'
        '╚══════════════════════════════════════════════════════════════════╝'
    )
    story.append(Preformatted(summary_art, S['mono']))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph(
        '© 2025–2026 LOT Systems Corporation. LOT® Founded 7 April 2016. '
        'Vadik Marmeladov, CEO & Founder · Kuzya Cosmo Marmeladov, CEO COSMO®. '
        'Made in the USA · brand.lot-systems.com',
        S['footer']
    ))

    doc.build(story)
    print(f'[OK] PDF written to: {OUTPUT_FILE}')


if __name__ == '__main__':
    build_pdf()
