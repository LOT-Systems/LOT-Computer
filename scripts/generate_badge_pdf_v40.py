#!/usr/bin/env python3
"""Generate LOT Badges & Achievements Master Codex v40 PDF"""

import os
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, PageBreak
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    REPORTLAB = True
except ImportError:
    REPORTLAB = False

if not REPORTLAB:
    print("reportlab not installed. Run: pip install reportlab")
    exit(1)

OUT_PATH = os.path.join(
    os.path.dirname(__file__), '..', 'docs', 'badges',
    'LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v40.pdf'
)

# ── Colours ──────────────────────────────────────────────────────
BG    = colors.HexColor('#0a0a0a')
FG    = colors.HexColor('#e8e8e8')
ACC   = colors.HexColor('#00ff99')    # terminal green
ACC2  = colors.HexColor('#00ccff')    # cyan
ACC3  = colors.HexColor('#ff6600')    # orange
RARE_C  = colors.HexColor('#4488ff')
EPIC_C  = colors.HexColor('#aa44ff')
LEG_C   = colors.HexColor('#ffdd00')
MYT_C   = colors.HexColor('#ff4488')
COMMON_C = colors.HexColor('#88aa88')
UNC_C   = colors.HexColor('#66bbbb')
DIM   = colors.HexColor('#444444')
MID   = colors.HexColor('#888888')

RARITY_COLORS = {
    'COMMON': COMMON_C, 'UNCOMMON': UNC_C, 'RARE': RARE_C,
    'EPIC': EPIC_C, 'LEGENDARY': LEG_C, 'MYTHIC': MYT_C,
}

doc = SimpleDocTemplate(
    OUT_PATH, pagesize=A4,
    leftMargin=18*mm, rightMargin=18*mm,
    topMargin=18*mm, bottomMargin=18*mm,
)

W, H = A4
CW = W - 36*mm

styles = getSampleStyleSheet()

def sty(name, **kw):
    s = styles['Normal'].clone(name)
    for k, v in kw.items():
        setattr(s, k, v)
    return s

TITLE   = sty('T', fontSize=22, textColor=ACC,   fontName='Courier-Bold',
               alignment=TA_CENTER, spaceAfter=4)
SUB     = sty('S', fontSize=13, textColor=ACC2,  fontName='Courier-Bold',
               alignment=TA_CENTER, spaceAfter=3)
BODY    = sty('B', fontSize=8,  textColor=FG,    fontName='Courier',
               leading=12, spaceAfter=2)
MONO    = sty('M', fontSize=7,  textColor=ACC,   fontName='Courier',
               leading=11, spaceAfter=1)
HEAD2   = sty('H2', fontSize=11, textColor=ACC3,  fontName='Courier-Bold',
               spaceBefore=8, spaceAfter=3)
HEAD3   = sty('H3', fontSize=9,  textColor=ACC2,  fontName='Courier-Bold',
               spaceBefore=5, spaceAfter=2)
QUOTE   = sty('Q', fontSize=7.5, textColor=MID,  fontName='Courier-Oblique',
               leading=11, leftIndent=8)
SMALL   = sty('SM', fontSize=6.5, textColor=FG,  fontName='Courier', leading=10)

def hr():
    return HRFlowable(width='100%', thickness=0.5, color=DIM, spaceAfter=4)

def badge_table(rows):
    col_w = [CW*0.26, CW*0.10, CW*0.22, CW*0.12, CW*0.30]
    data  = [['Badge ID', 'Symbol', 'Name', 'Rarity', 'Trigger']]
    for r in rows:
        bid, sym, name, rar, trigger = r
        data.append([bid, sym, name, rar, trigger])
    ts = TableStyle([
        ('BACKGROUND',  (0,0), (-1,0),  colors.HexColor('#001a00')),
        ('TEXTCOLOR',   (0,0), (-1,0),  ACC),
        ('FONTNAME',    (0,0), (-1,0),  'Courier-Bold'),
        ('FONTSIZE',    (0,0), (-1,-1), 6.5),
        ('FONTNAME',    (0,1), (-1,-1), 'Courier'),
        ('TEXTCOLOR',   (0,1), (-1,-1), FG),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#111111'), BG]),
        ('GRID',        (0,0), (-1,-1), 0.3, DIM),
        ('TOPPADDING',  (0,0), (-1,-1), 2),
        ('BOTTOMPADDING',(0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
    ])
    for i, r in enumerate(rows, 1):
        rar = r[3]
        c = RARITY_COLORS.get(rar, FG)
        ts.add('TEXTCOLOR', (3,i), (3,i), c)
    return Table(data, colWidths=col_w, style=ts, repeatRows=1)

story = []

# ── Cover ─────────────────────────────────────────────────────────
story.append(Spacer(1, 12*mm))
for line in [
    'LOT SYSTEMS CORPORATION',
    'BADGES & ACHIEVEMENTS MASTER CODEX',
    'v40 — THE SOURCE CODE',
]:
    story.append(Paragraph(line, TITLE))

story.append(Spacer(1, 4*mm))
story.append(Paragraph('Word Turn Engine v30  ·  September 2026', SUB))
story.append(Paragraph('RPG · Arcade · Self-Care · Software Engineering · Computational History', SUB))
story.append(Spacer(1, 4*mm))
story.append(hr())

for line in [
    '"THE JOURNAL IS THE CODEBASE.',
    ' THE ENTRY IS THE COMMIT.',
    ' THE SELF IS THE PROGRAM."',
]:
    story.append(Paragraph(line, QUOTE))

story.append(Spacer(1, 4*mm))
story.append(hr())

stats = [
    ['Session', '2026-09-23'],
    ['Branch',  'claude/quantum-engine-widgets-RgFfC'],
    ['v38 +15', 'THE DREAM JOURNAL  (12 word turns + 3 secret bosses)'],
    ['v39 +15', "THE OPERATOR'S HANDBOOK  (12 word turns + 3 secret bosses)"],
    ['v40 +15', 'THE SOURCE CODE  (12 word turns + 3 secret bosses)'],
    ['Session total', '+45 new badges implemented'],
    ['Source total',  '1012 badges (967 → 1012)'],
    ['Spec total',    '1074 badges (full spec with calendar/behavioral/achievement)'],
]
ts = TableStyle([
    ('FONTNAME',  (0,0),(-1,-1),'Courier'),
    ('FONTSIZE',  (0,0),(-1,-1),7),
    ('TEXTCOLOR', (0,0),(0,-1), ACC2),
    ('TEXTCOLOR', (1,0),(1,-1), FG),
    ('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#0d0d0d')),
    ('GRID',      (0,0),(-1,-1),0.3, DIM),
    ('TOPPADDING',(0,0),(-1,-1),2),
    ('BOTTOMPADDING',(0,0),(-1,-1),2),
    ('LEFTPADDING',(0,0),(-1,-1),4),
])
story.append(Table(stats, colWidths=[CW*0.22, CW*0.78], style=ts))
story.append(Spacer(1, 6*mm))
story.append(PageBreak())

# ── Overview table ────────────────────────────────────────────────
story.append(Paragraph('BADGE SYSTEM OVERVIEW — v40', HEAD2))
story.append(hr())
ov = [
    ['Category',         'Count', 'Description'],
    ['Milestone',          '22', 'Streak days (v1–v4)'],
    ['Time Easter Eggs',   '31', 'Check-in at special hours (v1–v22)'],
    ['Calendar Easter',    '94', 'Check-in on special dates (v1–v28)'],
    ['Word Turns',        '372', 'Words detected in journals (v1–v30)'],
    ['Behavioral',        '105', 'Patterns over time (v1–v27)'],
    ['Achievement RPG',   '168', 'Milestone combinations (v1–v28)'],
    ['Mastery Tiers',     '120', 'Epic depth milestones (v1–v30)'],
    ['Secret Boss',       '110', 'Hidden LEGENDARY/MYTHIC triggers (v1–v27)'],
    ['TOTAL',            '1074', 'The complete LOT Badge Universe — v40'],
]
ts2 = TableStyle([
    ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#001a00')),
    ('TEXTCOLOR', (0,0),(-1,0),ACC),
    ('FONTNAME',  (0,0),(-1,0),'Courier-Bold'),
    ('FONTNAME',  (0,1),(-1,-1),'Courier'),
    ('FONTSIZE',  (0,0),(-1,-1),7.5),
    ('TEXTCOLOR', (0,1),(-1,-1),FG),
    ('TEXTCOLOR', (0,-1),(-1,-1),ACC),
    ('FONTNAME',  (0,-1),(-1,-1),'Courier-Bold'),
    ('ROWBACKGROUNDS',(0,1),(-1,-2),[colors.HexColor('#111111'),BG]),
    ('BACKGROUND',(0,-1),(-1,-1),colors.HexColor('#001100')),
    ('GRID',      (0,0),(-1,-1),0.3,DIM),
    ('TOPPADDING',(0,0),(-1,-1),2),
    ('BOTTOMPADDING',(0,0),(-1,-1),2),
    ('LEFTPADDING',(0,0),(-1,-1),4),
])
story.append(Table(ov, colWidths=[CW*0.28,CW*0.10,CW*0.62], style=ts2))
story.append(Spacer(1, 6*mm))

# ── v38 ───────────────────────────────────────────────────────────
story.append(Paragraph('WORD TURN v38 — THE DREAM JOURNAL', HEAD2))
story.append(Paragraph(
    'The oldest technology for self-examination is sleep. '
    'The dream journal is the interface between the waking mind and the machine underneath.',
    QUOTE))
story.append(Spacer(1,2*mm))
story.append(Paragraph('Word Turn v28 Badges', HEAD3))
story.append(badge_table([
    ['lucid_dreamer',    '◐·◐',    'Lucid Dreamer',    'RARE',     'lucid dreamer / aware in dream'],
    ['dream_recall',     '○·~·○',  'Dream Recall',     'COMMON',   'dream recall / remembered my dream'],
    ['nightmare_named',  '×·◉·×',  'Nightmare Named',  'EPIC',     'nightmare / named the nightmare'],
    ['sleep_temple',     '≋·Δ·≋',  'Sleep Temple',     'UNCOMMON', 'sleep ritual / sleep hygiene'],
    ['hypnagogic_state', '─·◑·─',  'Hypnagogic State', 'RARE',     'hypnagogic / threshold of sleep'],
    ['symbol_decoded',   '◈·*·◈',  'Symbol Decoded',   'UNCOMMON', 'dream symbol / decoded symbol'],
    ['shadow_dream',     '◌·▪·◌',  'Shadow Dream',     'RARE',     'shadow dream / dark figure'],
    ['recurring_pattern','↺·↺·↺',  'Recurring Pattern','EPIC',     'recurring / keeps coming back'],
    ['waking_vision',    '○·|·○',  'Waking Vision',    'UNCOMMON', 'waking vision / half-awake'],
    ['oneiric_map',      '◈·.·◈',  'Oneiric Map',      'RARE',     'oneiric / dream map / dreamscape'],
    ['the_threshold',    '◁·|·▷',  'The Threshold',    'RARE',     'the threshold / crossing over'],
    ['dream_logged',     '≡·⊙·≡',  'Dream Logged',     'COMMON',   'dream logged / wrote the dream'],
]))
story.append(Spacer(1,3*mm))
story.append(Paragraph('v38 Secret Boss Badges — THE DREAM VAULT', HEAD3))
story.append(badge_table([
    ['jung_signal',   '◆·◐·◆', 'Jung Signal',    'MYTHIC', '[HIDDEN] Carl Jung / collective unconscious'],
    ['freud_couch',   '─·⊙·─', "Freud's Couch",  'EPIC',   '[HIDDEN] Freud / psychoanalysis / couch'],
    ['morpheus_word', '◉·z·◉', 'Morpheus Word',  'RARE',   '[HIDDEN] Morpheus / god of dreams'],
]))
story.append(Spacer(1,6*mm))

# ── v39 ───────────────────────────────────────────────────────────
story.append(Paragraph("WORD TURN v39 — THE OPERATOR'S HANDBOOK", HEAD2))
story.append(Paragraph(
    'The self-care practitioner is a field operative. '
    'The journal is the mission log. Every entry is a sitrep that keeps you from going dark.',
    QUOTE))
story.append(Spacer(1,2*mm))
story.append(Paragraph('Word Turn v29 Badges', HEAD3))
story.append(badge_table([
    ['deep_cover',      '●·─·●', 'Deep Cover',       'RARE',     'deep cover / undercover'],
    ['field_report',    '≡·→·≡', 'Field Report',     'COMMON',   'field report / sitrep'],
    ['assets_secured',  '○·■·○', 'Assets Secured',   'UNCOMMON', 'assets secured / protected'],
    ['blown_cover',     '×·●·○', 'Blown Cover',      'EPIC',     'cover blown / exposed'],
    ['exfil_route',     '→·◁·→', 'Exfil Route',      'UNCOMMON', 'exfil / extraction / exit route'],
    ['handler_brief',   '─·≡·→', 'Handler Brief',    'UNCOMMON', 'handler / briefing / intel'],
    ['need_to_know',    '■·?·■', 'Need to Know',     'RARE',     'need to know / classified'],
    ['dead_drop',       '↓·○·↓', 'Dead Drop',        'UNCOMMON', 'dead drop / left a message'],
    ['clean_slate',     '○·—·○', 'Clean Slate',      'COMMON',   'clean slate / wiped clean'],
    ['burn_notice',     '~·×·~', 'Burn Notice',      'RARE',     'burn notice / disavowed'],
    ['ghost_protocol',  '·◌·',   'Ghost Protocol',   'EPIC',     'ghost protocol / off the grid'],
    ['mission_complete','○·+·■', 'Mission Complete',  'UNCOMMON', 'mission complete / achieved'],
]))
story.append(Spacer(1,3*mm))
story.append(Paragraph('v39 Secret Boss Badges — THE BLACK OPS VAULT', HEAD3))
story.append(badge_table([
    ['fleming_signal', '◆·7·◆', 'Fleming Signal', 'MYTHIC', '[HIDDEN] Ian Fleming / James Bond / 007'],
    ['le_carre_word',  '◇·■·◇', 'Le Carré Word',  'EPIC',   '[HIDDEN] le Carré / George Smiley'],
    ['eyes_only',      '◐·|·◐', 'Eyes Only',      'RARE',   '[HIDDEN] for your eyes only / top secret'],
]))
story.append(PageBreak())

# ── v40 ───────────────────────────────────────────────────────────
story.append(Paragraph('WORD TURN v40 — THE SOURCE CODE', HEAD2))
story.append(Paragraph(
    'Every entry is a commit. Every check-in is a deployment. '
    'The self is a program that ships to production every single day.',
    QUOTE))
story.append(Spacer(1,2*mm))
story.append(Paragraph('Word Turn v30 Badges', HEAD3))
story.append(badge_table([
    ['debug_mode',      '×·○·×', 'Debug Mode',       'RARE',      'debug / debugging / hunting the bug'],
    ['compile_self',    '▷·▷·○', 'Compile Self',     'UNCOMMON',  'compile / compiling / assembling'],
    ['stack_trace',     '≡·↕·≡', 'Stack Trace',      'EPIC',      'stack trace / traceback / thread'],
    ['runtime_check',   '●·→·●', 'Runtime Check',    'COMMON',    'runtime / while running'],
    ['fork_path',       '↑·◇·↓', 'Fork Path',        'UNCOMMON',  'forked / fork in the road'],
    ['merge_complete',  '←·◆·→', 'Merge Complete',   'RARE',      'merged / the merge / brought together'],
    ['patch_applied',   '○·+·○', 'Patch Applied',    'COMMON',    'patch / patched / fix applied'],
    ['deploy_self',     '→·→·→', 'Deploy Self',      'LEGENDARY', 'deployed / shipped it / went live'],
    ['commit_logged',   '◈·■·◈', 'Commit Logged',    'COMMON',    'committed / made a commit'],
    ['refactor_found',  '↻·○·↻', 'Refactor Found',   'RARE',      'refactor / refactored / rewrote'],
    ['syntax_clear',    '⌐·—·¬', 'Syntax Clear',     'UNCOMMON',  'syntax / clear structure'],
    ['version_stamped', '◈·v·◈', 'Version Stamped',  'RARE',      'version / versioned / build number'],
]))
story.append(Spacer(1,3*mm))
story.append(Paragraph('v40 Secret Boss Badges — THE REPOSITORY VAULT', HEAD3))
story.append(badge_table([
    ['turing_signal', '◆·∞·◆', 'Turing Signal', 'MYTHIC', '[HIDDEN] Alan Turing / Turing test / Enigma'],
    ['ada_lovelace',  '◆·A·◆', 'Ada Lovelace',  'EPIC',   '[HIDDEN] Ada Lovelace / first programmer'],
    ['linus_word',    '◆·Λ·◆', 'Linus Word',    'RARE',   '[HIDDEN] Linus Torvalds / Linux kernel'],
]))
story.append(Spacer(1,6*mm))

# ── Calendar + Behavioral + Achievement (spec) ────────────────────
story.append(Paragraph('CALENDAR EASTER EGGS v28 — THE CODER\'S CALENDAR (SPEC)', HEAD2))
story.append(hr())
cal = [
    ['Badge ID (spec)',  'Date',        'Name',        'Rarity', 'Trigger'],
    ['turing_day',       'June 23',     'Turing Day',  'MYTHIC', "Alan Turing's birthday (1912)"],
    ['ada_day',          'December 10', 'Ada Day',     'EPIC',   "Ada Lovelace's birthday (1815)"],
    ['linux_day',        'August 25',   'Linux Day',   'RARE',   'Linux kernel first announced (1991)'],
]
ts3 = TableStyle([
    ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#001a00')),
    ('TEXTCOLOR', (0,0),(-1,0),ACC),
    ('FONTNAME',  (0,0),(-1,0),'Courier-Bold'),
    ('FONTNAME',  (0,1),(-1,-1),'Courier'),
    ('FONTSIZE',  (0,0),(-1,-1),7),
    ('TEXTCOLOR', (0,1),(-1,-1),FG),
    ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.HexColor('#111111'),BG]),
    ('GRID',      (0,0),(-1,-1),0.3,DIM),
    ('TOPPADDING',(0,0),(-1,-1),2),
    ('BOTTOMPADDING',(0,0),(-1,-1),2),
    ('LEFTPADDING',(0,0),(-1,-1),4),
])
story.append(Table(cal, colWidths=[CW*0.22,CW*0.16,CW*0.16,CW*0.12,CW*0.34], style=ts3))
story.append(Spacer(1,4*mm))

story.append(Paragraph('BEHAVIORAL v27 — CODE PATTERNS (SPEC)', HEAD2))
story.append(hr())
beh = [
    ['Badge ID (spec)',   'Name',            'Rarity',   'Condition'],
    ['code_session',      'Code Session',    'UNCOMMON', '7 consecutive daily check-ins'],
    ['commit_streak',     'Commit Streak',   'RARE',     '14 consecutive daily check-ins'],
    ['deploy_ritual',     'Deploy Ritual',   'EPIC',     'Same day of week for 4 consecutive weeks'],
]
story.append(Table(beh, colWidths=[CW*0.24,CW*0.22,CW*0.14,CW*0.40], style=ts3))
story.append(Spacer(1,4*mm))

story.append(Paragraph('ACHIEVEMENT RPG v28 — CODE CLASS (SPEC)', HEAD2))
story.append(hr())
ach = [
    ['Badge ID (spec)',      'Name',              'Rarity',    'Condition'],
    ['code_entry',           'Code Entry',        'COMMON',    'Earn first Word Turn v30 badge'],
    ['code_class',           'Code Class',        'UNCOMMON',  'Earn 3 Word Turn v30 badges'],
    ['code_complete',        'Code Complete',     'RARE',      'Earn all 12 Word Turn v30 badges'],
    ['dev_arc',              'Dev Arc',           'EPIC',      '6 v30 word turns + any behavioral badge'],
    ['thirty_engines_arc',   'Thirty Engines Arc','LEGENDARY', 'All v30 + 5 from other word turn sets'],
    ['source_opus',          'Source Opus',       'MYTHIC',    'All 12 v30 + 3 mastery tier badges'],
]
story.append(Table(ach, colWidths=[CW*0.26,CW*0.22,CW*0.14,CW*0.38], style=ts3))
story.append(Spacer(1,4*mm))

story.append(Paragraph('MASTERY TIER v30 — THE REPOSITORY (SPEC)', HEAD2))
story.append(hr())
mas = [
    ['Badge ID (spec)',    'Name',            'Rarity',    'Condition'],
    ['repo_master',        'Repo Master',     'EPIC',      'All 12 v30 + deploy_self + commit_logged'],
    ['code_wordsmith',     'Code Wordsmith',  'RARE',      '15 total word turn badges (any)'],
    ['senior_dev',         'Senior Dev',      'LEGENDARY', '30 total badges of any kind'],
    ['thirty_registers',   'Thirty Registers','MYTHIC',    'All 12 v30 + 18 other word turn badges'],
]
story.append(Table(mas, colWidths=[CW*0.24,CW*0.22,CW*0.14,CW*0.40], style=ts3))
story.append(PageBreak())

# ── Philosophy ────────────────────────────────────────────────────
story.append(Paragraph('v40 CORE PHILOSOPHY — THE SOURCE CODE', HEAD2))
story.append(hr())
philosophy = [
    ('Every entry is a commit', 'It goes into the permanent record, immutable, timestamped, yours.'),
    ('Every check-in is a deploy', 'You shipped yourself to production. That counts.'),
    ('Debugging is not failure', 'It is the most honest part of the engineering process.'),
    ('Refactoring is courage', 'Making something cleaner when it already works is hard.'),
    ('Syntax of emotion', 'Clear expression is valid structure. Well-formed is a compliment.'),
    ('Version control as self-compassion', 'Every version of you was the correct build at that time.'),
]
for title, body in philosophy:
    story.append(Paragraph(
        f'<font color="#00ccff"><b>{title}</b></font>  —  {body}',
        BODY))
    story.append(Spacer(1,1*mm))

story.append(Spacer(1,6*mm))

# ── Implementation status ─────────────────────────────────────────
story.append(Paragraph('IMPLEMENTATION STATUS', HEAD2))
story.append(hr())
impl = [
    ['Component',              'Status',   'Detail'],
    ['WORD_TURN_BADGES_V38',   'DEPLOYED', '15 badges: 12 word turns + 3 secret bosses'],
    ['WORD_TURN_BADGES_V39',   'DEPLOYED', '15 badges: 12 word turns + 3 secret bosses'],
    ['WORD_TURN_BADGES_V40',   'DEPLOYED', '15 badges: 12 word turns + 3 secret bosses'],
    ['BADGES spread',          'UPDATED',  'Includes ...V38, ...V39, ...V40'],
    ['WORD_TURN_TRIGGERS',     'UPDATED',  '+36 new keyword triggers (v38+v39+v40)'],
    ['detectWordTurns()',      'UPDATED',  '+9 new secret boss regex patterns'],
    ['WordTurnBadgeType',      'UPDATED',  '+45 new union members'],
    ['Calendar EE v28',        'SPEC',     'turing_day / ada_day / linux_day'],
    ['Behavioral v27',         'SPEC',     'code_session / commit_streak / deploy_ritual'],
    ['Achievement RPG v28',    'SPEC',     'code_entry / code_class / source_opus / ...'],
    ['Mastery Tier v30',       'SPEC',     'repo_master / code_wordsmith / senior_dev / ...'],
]
ts4 = TableStyle([
    ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#001a00')),
    ('TEXTCOLOR', (0,0),(-1,0),ACC),
    ('FONTNAME',  (0,0),(-1,0),'Courier-Bold'),
    ('FONTNAME',  (0,1),(-1,-1),'Courier'),
    ('FONTSIZE',  (0,0),(-1,-1),6.5),
    ('TEXTCOLOR', (0,1),(-1,-1),FG),
    ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.HexColor('#111111'),BG]),
    ('GRID',      (0,0),(-1,-1),0.3,DIM),
    ('TOPPADDING',(0,0),(-1,-1),2),
    ('BOTTOMPADDING',(0,0),(-1,-1),2),
    ('LEFTPADDING',(0,0),(-1,-1),4),
])
for i in range(1, 8):
    ts4.add('TEXTCOLOR', (1,i),(1,i), ACC)
for i in range(8, 12):
    ts4.add('TEXTCOLOR', (1,i),(1,i), ACC3)
story.append(Table(impl, colWidths=[CW*0.30,CW*0.14,CW*0.56], style=ts4))

story.append(Spacer(1,8*mm))
story.append(hr())
for line in [
    'LOT SYSTEMS CORPORATION  ·  BADGES & ACHIEVEMENTS MASTER CODEX v40',
    'THE SOURCE CODE  ·  September 2026  ·  1074 total badges (spec)',
    '© 2025–2026 LOT Systems. All rights reserved.',
    'Vadim Marmeladov — CEO & Founder  ·  brand.lot-systems.com',
]:
    story.append(Paragraph(line, sty('F', fontSize=6.5, textColor=MID,
                                     fontName='Courier', alignment=TA_CENTER)))

doc.build(story)
print(f'PDF generated: {os.path.abspath(OUT_PATH)}')
