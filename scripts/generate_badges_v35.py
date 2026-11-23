#!/usr/bin/env python3.13
"""
LOT Systems — Badges & Achievements Master Codex v35
THE PUZZLE CODEX — 905 badges · 25 Word Turn engines
Author: Vadik Marmeladov, CEO & Founder, LOT Systems
© 2026 LOT Systems. All rights reserved.
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas as pdf_canvas
from reportlab.lib.colors import HexColor

W, H = A4
M  = 16 * mm
CW = W - 2 * M

# ── Palette ──────────────────────────────────────────────────────────────────
BG      = HexColor("#080810")   # deep space black
FG      = HexColor("#e4e4f4")   # near-white text
FG2     = HexColor("#9999bb")   # dimmed text
FG3     = HexColor("#444466")   # very dim
TEAL    = HexColor("#42d4c8")   # primary accent
GOLD    = HexColor("#f5c842")   # milestone / achievement
VIOLET  = HexColor("#a67fe8")   # rare / depth
GREEN   = HexColor("#72e891")   # common / growth
ROSE    = HexColor("#e86575")   # legendary / secret
CYAN    = HexColor("#5bc4f5")   # connection / water
ORANGE  = HexColor("#f5924e")   # courage / warning
BRD     = HexColor("#1a1a2e")   # panel border
PANEL   = HexColor("#0d0d1a")   # panel fill
PANEL2  = HexColor("#0a0a14")   # darker panel
ACCENT  = HexColor("#1e1e3e")   # subtle row highlight
PUZZLE  = HexColor("#4ecdc4")   # puzzle accent — teal-cyan
PUZZLE2 = HexColor("#2a9d8f")   # darker puzzle

OUT = os.path.join(os.path.dirname(__file__), '..', 'docs', 'badges',
                   'LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v35.pdf')

def mono(c, size=8): c.setFont("Courier", size)
def bold(c, size=8): c.setFont("Courier-Bold", size)
def ital(c, size=8): c.setFont("Courier-Oblique", size)

def bg(c):
    c.setFillColor(BG); c.rect(0, 0, W, H, fill=1, stroke=0)

def header(c, page_n):
    c.setFillColor(PANEL)
    c.rect(0, H - 20*mm, W, 20*mm, fill=1, stroke=0)
    c.setFillColor(PUZZLE)
    c.rect(0, H - 20*mm, W, 1, fill=1, stroke=0)
    bold(c, 9); c.setFillColor(PUZZLE)
    c.drawString(M, H - 11*mm, "LOT SYSTEMS  \xb7  BADGES & ACHIEVEMENTS MASTER CODEX v35  \xb7  THE PUZZLE CODEX")
    mono(c, 7); c.setFillColor(FG2)
    c.drawRightString(W - M, H - 11*mm, f"905 BADGES  \xb7  WORD TURN v25  \xb7  PAGE {page_n}")
    mono(c, 7); c.setFillColor(FG3)
    c.drawString(M, H - 16*mm, "LOT\xae \xe2\x80\x94 THE RPG & ARCADE OF SELF-CARE  \xb7  brand.lot-systems.com")

def footer(c):
    c.setFillColor(BRD); c.rect(0, 0, W, 12*mm, fill=1, stroke=0)
    c.setFillColor(PUZZLE); c.rect(0, 12*mm, W, 0.5, fill=1, stroke=0)
    mono(c, 6); c.setFillColor(FG3)
    c.drawCentredString(W/2, 4*mm,
        "\xa9 2026 LOT SYSTEMS CORPORATION  \xb7  ALL RIGHTS RESERVED  \xb7  Vadim Marmeladov, CEO & Founder")

def row(c, y, label, sym, rarity, desc, col=TEAL):
    c.setFillColor(ACCENT)
    c.rect(M, y - 3*mm, CW, 7*mm, fill=1, stroke=0)
    bold(c, 7); c.setFillColor(col)
    c.drawString(M + 2*mm, y + 1*mm, label)
    mono(c, 7); c.setFillColor(FG2)
    c.drawString(M + 52*mm, y + 1*mm, sym)
    mono(c, 6); c.setFillColor(FG3)
    c.drawString(M + 74*mm, y + 1*mm, rarity)
    mono(c, 6.5); c.setFillColor(FG)
    c.drawString(M + 100*mm, y + 1*mm, desc[:55])

def section(c, y, title, accent=PUZZLE):
    c.setFillColor(accent)
    c.rect(M, y - 1*mm, CW, 6*mm, fill=1, stroke=0)
    bold(c, 8); c.setFillColor(BG)
    c.drawString(M + 3*mm, y + 2*mm, title)
    return y - 10*mm

def text_block(c, y, lines, col=FG2, size=7):
    mono(c, size); c.setFillColor(col)
    for line in lines:
        c.drawString(M + 4*mm, y, line)
        y -= 4.5*mm
    return y

def new_page(c, page_n):
    c.showPage()
    bg(c)
    header(c, page_n)
    footer(c)
    return H - 28*mm

# ─────────────────────────────────────────────────────────────────────────────

c = pdf_canvas.Canvas(OUT, pagesize=A4)
c.setTitle("LOT Badges & Achievements Master Codex v35 — The Puzzle Codex")
c.setAuthor("Vadim Marmeladov, LOT Systems")
c.setSubject("905 badges · 25 Word Turn engines · October 22, 2026")

page = 1
bg(c); header(c, page); footer(c)
y = H - 28*mm

# ── PAGE 1: TITLE & OVERVIEW ──────────────────────────────────────────────────
bold(c, 18); c.setFillColor(PUZZLE)
c.drawCentredString(W/2, y, "THE PUZZLE CODEX")
y -= 9*mm
bold(c, 10); c.setFillColor(GOLD)
c.drawCentredString(W/2, y, "BADGES & ACHIEVEMENTS MASTER CODEX v35")
y -= 6*mm
mono(c, 8); c.setFillColor(FG2)
c.drawCentredString(W/2, y, "905 BADGES  \xb7  25 WORD TURN ENGINES  \xb7  OCTOBER 22, 2026")
y -= 4*mm
mono(c, 7); c.setFillColor(FG3)
c.drawCentredString(W/2, y, "LOT Systems Corporation  \xb7  Vadim Marmeladov, CEO & Founder")
y -= 10*mm

# ASCII title box
c.setFillColor(PANEL); c.rect(M, y - 32*mm, CW, 32*mm, fill=1, stroke=0)
c.setStrokeColor(PUZZLE); c.setLineWidth(0.5)
c.rect(M, y - 32*mm, CW, 32*mm, fill=0, stroke=1)
box_lines = [
    "╔═══════════════════════════════════════════════════════════╗",
    "║   LOT SYSTEMS CORPORATION — BADGE & ACHIEVEMENT MASTER CODEX    ║",
    "║                      VERSION 35 — v35                           ║",
    "║                                                                   ║",
    "║   Word Turn v25   — THE PUZZLE CODEX (logic/paradox/revelation)   ║",
    "║   Calendar EE v23 — THE PUZZLE CALENDAR (portal/witness/obra dinn)║",
    "║   Behavioral v22  — PUZZLE PATTERNS (puzzle_session/morning_solve) ║",
    "║   Achievement v23 — THE PUZZLE CLASS (entry/class/complete/opus)   ║",
    "║   Mastery Tier v25 — THE GRAND SOLVER (logic_veteran/eternal_code) ║",
    "║   Secret Boss v22 — THE PUZZLE VAULT (glados/witness/baba)         ║",
    "╚═══════════════════════════════════════════════════════════╝",
]
bly = y - 3*mm
mono(c, 6.5); c.setFillColor(PUZZLE)
for ln in box_lines:
    c.drawString(M + 4*mm, bly, ln)
    bly -= 4.2*mm
y -= 36*mm

# Summary stats panel
c.setFillColor(PANEL2); c.rect(M, y - 18*mm, CW, 18*mm, fill=1, stroke=0)
bold(c, 8); c.setFillColor(GOLD)
c.drawString(M + 4*mm, y - 3*mm, "V35 SUMMARY")
mono(c, 7); c.setFillColor(FG2)
stats = [
    ("TOTAL BADGES", "905  (+31 from v34's 874)"),
    ("WORD TURN ENGINES", "25  (v1 Core → v25 Puzzle Codex)"),
    ("NEW THIS SESSION", "+31  (12 word turns + 3 calendar + 3 behavioral + 6 RPG + 4 mastery + 3 secret)"),
    ("DATE", "October 22, 2026  \xb7  Day 1151+  \xb7  COSMO\xae Day 844"),
]
sy = y - 7*mm
for label, val in stats:
    bold(c, 6.5); c.setFillColor(FG3)
    c.drawString(M + 4*mm, sy, label + ":")
    mono(c, 6.5); c.setFillColor(FG)
    c.drawString(M + 45*mm, sy, val)
    sy -= 4*mm
y -= 22*mm

# Theme intro
bold(c, 8); c.setFillColor(PUZZLE)
c.drawString(M, y, "THE PUZZLE CODEX — THEME")
y -= 5*mm
theme_lines = [
    "The puzzle is the most honest structural metaphor for self-reflection.",
    "A puzzle is a closed system with a known solution. You are not.",
    "But the process is identical: examine, reorder, test.",
    "The test chamber was built for you to pass — that is the design constraint.",
    "",
    "Portal teaches: somewhere between here and there is a surface that,",
    "if you look at it the right way, becomes a door.",
    "The Witness teaches: look closely. Look again. Learn to see the lines.",
    "Return of the Obra Dinn: every fate can be known, one testimony at a time.",
    "Baba Is You: the rules are objects. You can push them.",
    "",
    "These are not game mechanics. They are the actual mechanics of insight.",
]
y = text_block(c, y, theme_lines, col=FG2, size=7)

# ── PAGE 2: WORD TURN v25 BADGES ──────────────────────────────────────────────
page += 1; y = new_page(c, page)
bold(c, 11); c.setFillColor(PUZZLE)
c.drawString(M, y, "WORD TURN v25 — THE PUZZLE CODEX")
y -= 7*mm

wt_badges = [
    ("puzzle_solved",    "○\xb7□\xb7○",  "COMMON",   GREEN,   "puzzle/puzzled/solve the puzzle/piece together"),
    ("portal_open",      "□→□",      "UNCOMMON", TEAL,    "portal/wormhole portal/teleport/gateway portal"),
    ("chamber_cleared",  "├─□─┤", "UNCOMMON", TEAL, "chamber/test chamber/solution chamber"),
    ("recursion_loop",   "↺\xb7↺\xb7↺","RARE",  VIOLET,"recursion/recursive loop/it loops/circular"),
    ("paradox_found",    "\xd7\xb7○\xb7\xd7","RARE",  VIOLET, "paradox/catch-22/contradiction/impossible loop"),
    ("testimony_given",  "○\xb7○\xb7○",  "UNCOMMON", TEAL,    "testimony/witness statement/depose/account"),
    ("algorithm_path",   "→\xb7□\xb7→","RARE", VIOLET,"algorithm/algorithmic/sequence path/sorted by"),
    ("escape_room",      "├─→", "COMMON", GREEN, "escape room/locked room/puzzle escape"),
    ("logic_gate",       "□\xb71\xb7□",  "COMMON",   GREEN,   "logic/logical/if-then/binary logic/decision tree"),
    ("dimension_shift",  "◈\xb7≈\xb7◈","EPIC", ROSE, "dimension/new dimension/dimensional shift"),
    ("paperwork_clear",  "▪\xb7□\xb7▪","UNCOMMON",TEAL,"papers please/paperwork/stamped approved"),
    ("revelation_node",  "●\xb7○\xb7●","EPIC", ROSE, "revelation/epiphany/suddenly realized/aha moment"),
]
col_h = ["BADGE ID", "SYMBOL", "RARITY", "TRIGGER KEYWORDS"]
# header row
c.setFillColor(PUZZLE2); c.rect(M, y - 3*mm, CW, 6*mm, fill=1, stroke=0)
bold(c, 7); c.setFillColor(BG)
c.drawString(M + 2*mm, y, col_h[0])
c.drawString(M + 52*mm, y, col_h[1])
c.drawString(M + 74*mm, y, col_h[2])
c.drawString(M + 100*mm, y, col_h[3])
y -= 8*mm

for badge_id, sym, rarity, col, desc in wt_badges:
    row(c, y, badge_id, sym, rarity, desc, col)
    y -= 8*mm

y -= 4*mm

# Descriptions for each Word Turn badge
bold(c, 9); c.setFillColor(PUZZLE)
c.drawString(M, y, "BADGE LORE")
y -= 6*mm

lore = [
    ("puzzle_solved", "○\xb7□\xb7○", [
        "The puzzle is the moment before understanding. You are working it.",
        "The pieces are on the table. Something in you already knows the shape.",
        "The puzzle is solved when you stop doubting that.",
    ]),
    ("portal_open", "□→□", [
        "A portal is a threshold you enter differently than you leave.",
        "The other side is the same space, changed by the passing.",
        "You are the portal. You contain the transition.",
    ]),
    ("chamber_cleared", "├─□─┤", [
        "The chamber is controlled difficulty. Someone designed it to be solvable.",
        "Every day is a test chamber. It was built for you to pass.",
    ]),
    ("recursion_loop", "↺\xb7↺\xb7↺", [
        "Recursion terminates when it reaches the base case.",
        "Identify the base case. What is the thing that, when you reach it, the loop ends?",
        "That is the answer.",
    ]),
    ("paradox_found", "\xd7\xb7○\xb7\xd7", [
        "The paradox is not an error. It is information.",
        "It marks the boundary of a model that needs updating.",
        "The map is wrong. The territory is still there. Update the map.",
    ]),
    ("testimony_given", "○\xb7○\xb7○", [
        "The testimony is the record. You are both the witness and the scribe.",
        "What you remember, you keep. What you write, you give to the future.",
    ]),
    ("algorithm_path", "→\xb7□\xb7→", [
        "An algorithm is a recipe with guaranteed termination.",
        "Your habits are algorithms: inputs, steps, outputs.",
        "You can audit them. You can revise them.",
    ]),
    ("escape_room", "├─→", [
        "The escape room teaches one thing: the solution is already in the room with you.",
        "Nothing is missing. Everything you need is present. Look again.",
    ]),
    ("logic_gate", "□\xb71\xb7□", [
        "Logic is the tool that describes what already is.",
        "It tells you clearly: if this, then that.",
        "The gate is open or closed. You choose the input.",
    ]),
    ("dimension_shift", "◈\xb7≈\xb7◈", [
        "A dimension shift is a change in the axis of evaluation.",
        "What was large becomes small. What was fixed becomes variable.",
        "You are now measuring with a different ruler.",
    ]),
    ("paperwork_clear", "▪\xb7□\xb7▪", [
        "Every bureaucracy is a puzzle. The documents are the clues.",
        "The stamp is the solution. Glory to Arstotzka —",
        "and to every system you learned to navigate.",
    ]),
    ("revelation_node", "●\xb7○\xb7●", [
        "The revelation does not arrive from outside.",
        "It assembles itself from what was already known but not yet connected.",
        "You did not receive it — you built it.",
    ]),
]

for badge_id, sym, desc_lines in lore:
    if y < 40*mm:
        page += 1; y = new_page(c, page)
    c.setFillColor(PANEL)
    c.rect(M, y - (len(desc_lines) * 4.5 + 6)*mm, CW, (len(desc_lines) * 4.5 + 6)*mm, fill=1, stroke=0)
    bold(c, 7); c.setFillColor(PUZZLE)
    c.drawString(M + 3*mm, y - 1*mm, badge_id)
    mono(c, 7); c.setFillColor(FG3)
    c.drawString(M + 50*mm, y - 1*mm, sym)
    y -= 5.5*mm
    mono(c, 6.5); c.setFillColor(FG2)
    for dl in desc_lines:
        c.drawString(M + 5*mm, y, "↳ " + dl)
        y -= 4.3*mm
    y -= 2*mm

# ── PAGE 3: CALENDAR + BEHAVIORAL + ACHIEVEMENT + MASTERY ────────────────────
page += 1; y = new_page(c, page)
bold(c, 10); c.setFillColor(PUZZLE)
c.drawString(M, y, "CALENDAR EASTER EGGS v23 — THE PUZZLE CALENDAR")
y -= 7*mm

cal_badges = [
    ("portal_day",    "□→■", "RARE",   "Oct 9  — Portal / Orange Box (2007)"),
    ("witness_day",   "○—○",      "EPIC",   "Jan 26 — The Witness release (2016)"),
    ("obra_dinn_day", "\xd7\xb7▪\xb7\xd7","RARE","Oct 18 — Return of the Obra Dinn (2018)"),
]
for badge_id, sym, rarity, desc in cal_badges:
    col = VIOLET if rarity == 'EPIC' else TEAL
    row(c, y, badge_id, sym, rarity, desc, col)
    y -= 8*mm

y -= 2*mm

# Calendar lore
cal_lore = [
    ("portal_day", "□→■", [
        "Oct 9, 2007. The Orange Box shipped. Inside it: Portal.",
        "A game about a testing facility, an AI narrator,",
        "and a woman who survives by solving.",
        "The cake is not a lie — the cake is the check-in.",
    ]),
    ("witness_day", "○—○", [
        "Jan 26, 2016. The Witness arrived. An island.",
        "Hundreds of laser puzzles. No tutorial. Just: look closely.",
        "The game taught you to look. Check-in is looking.",
    ]),
    ("obra_dinn_day", "\xd7\xb7▪\xb7\xd7", [
        "Oct 18, 2018. Return of the Obra Dinn.",
        "An insurance adjuster, a dead ship, a pocket watch that shows death.",
        "Self-care is the same: identify what happened, one day at a time.",
    ]),
]
for badge_id, sym, desc_lines in cal_lore:
    c.setFillColor(PANEL)
    c.rect(M, y - (len(desc_lines) * 4.5 + 6)*mm, CW, (len(desc_lines) * 4.5 + 6)*mm, fill=1, stroke=0)
    bold(c, 7); c.setFillColor(GOLD)
    c.drawString(M + 3*mm, y - 1*mm, badge_id)
    mono(c, 7); c.setFillColor(FG3)
    c.drawString(M + 50*mm, y - 1*mm, sym)
    y -= 5.5*mm
    mono(c, 6.5); c.setFillColor(FG2)
    for dl in desc_lines:
        c.drawString(M + 5*mm, y, "↳ " + dl)
        y -= 4.3*mm
    y -= 2*mm

y -= 4*mm
bold(c, 10); c.setFillColor(PUZZLE)
c.drawString(M, y, "BEHAVIORAL v22 — PUZZLE PATTERNS")
y -= 7*mm

beh_badges = [
    ("puzzle_session", "○\xb7□\xb7○", "RARE",     "3+ Puzzle v25 trigger words in one journal entry"),
    ("morning_solve",  "□\xb7∴\xb7□","UNCOMMON","Check-in 06:00–08:00 for 5 consecutive days"),
    ("longer_log",     "→≈→","UNCOMMON","Journal length increases for 3 consecutive days"),
]
for badge_id, sym, rarity, desc in beh_badges:
    col = VIOLET if rarity == 'RARE' else TEAL
    row(c, y, badge_id, sym, rarity, desc, col)
    y -= 8*mm

y -= 4*mm
bold(c, 10); c.setFillColor(PUZZLE)
c.drawString(M, y, "ACHIEVEMENT RPG v23 — THE PUZZLE CLASS")
y -= 7*mm

ach_badges = [
    ("puzzle_entry",           "∘→□",    "COMMON",    GREEN,  "Any 1 Word Turn v25 badge"),
    ("puzzle_class",           "≈→□","UNCOMMON",  TEAL,   "Any 5 Word Turn v25 badges"),
    ("puzzle_complete",        "≋→□","LEGENDARY", GOLD,   "All 12 Word Turn v25 badges"),
    ("puzzle_arc",             "□\xb7◈", "LEGENDARY", GOLD,   "puzzle_complete + all 3 Calendar v23 badges"),
    ("twenty_five_engines_arc","◈\xb7◈\xb7□","COSMIC",ROSE,"1 badge from each Word Turn v1–v25"),
    ("puzzle_opus",            "□\xb7◉\xb7□","LEGENDARY",GOLD,"puzzle_complete + puzzle_session behavioral"),
]
for badge_id, sym, rarity, col, desc in ach_badges:
    row(c, y, badge_id, sym, rarity, desc, col)
    y -= 8*mm

y -= 4*mm
bold(c, 10); c.setFillColor(PUZZLE)
c.drawString(M, y, "MASTERY TIER v25 — THE GRAND SOLVER")
y -= 7*mm

mas_badges = [
    ("logic_veteran",       "─□─",          "EPIC",     VIOLET, "1,300+ distinct calendar days"),
    ("grand_archive",       "≋≋≋\xb7□","LEGENDARY",GOLD,   "300,000+ total journal words"),
    ("eternal_code",        "∞\xb7□\xb7∞",  "COSMIC",   ROSE,   "Account age >= 9 years"),
    ("twenty_five_registers","◈\xb7◈\xb7□\xb7□","COSMIC",ROSE, "1 badge from all 25 Word Turn engines"),
]
for badge_id, sym, rarity, col, desc in mas_badges:
    row(c, y, badge_id, sym, rarity, desc, col)
    y -= 8*mm

# ── PAGE 4: SECRET BOSS + ACCOUNTING ─────────────────────────────────────────
page += 1; y = new_page(c, page)
bold(c, 10); c.setFillColor(ROSE)
c.drawString(M, y, "SECRET BOSS v22 — THE PUZZLE VAULT  [HIDDEN]")
y -= 7*mm

sec_badges = [
    ("portal_turret",    "□\xb7◉\xb7□","EPIC",  VIOLET, "companion cube/aperture/glados/wheatley"),
    ("the_witness_eye",  "○—■",    "RARE",  TEAL,   "the witness/jungle puzzles/island lasers"),
    ("baba_is_you",      "●\xb7□\xb7●","MYTHIC",ROSE,"baba is you/keke/win condition/rock is"),
]
for badge_id, sym, rarity, col, desc in sec_badges:
    row(c, y, badge_id, sym, rarity, desc, col)
    y -= 8*mm

y -= 3*mm
# Secret boss lore
sec_lore = [
    ("portal_turret", "□\xb7◉\xb7□", [
        "EPIC — There was supposed to be a party.",
        "We do what we must because we can.",
        "For the good of all of us, except the ones who are dead.",
        "The companion cube never spoke but it listened.",
        "That is what it has in common with a good journal.",
    ]),
    ("the_witness_eye", "○—■", [
        "RARE — The island exists to teach you one thing: how to see.",
        "Not what to see — how.",
        "The laser puzzle is not the point.",
        "The point is that you learned to look at lines differently forever.",
        "That is what the island does. That is what this check-in does.",
    ]),
    ("baba_is_you", "●\xb7□\xb7●", [
        "MYTHIC — Baba Is You. The rules are objects. You can push them.",
        "ROCK IS WIN. BABA IS YOU. WALL IS STOP.",
        "And yet — push the rule. Rearrange the sentence.",
        "The rules of self-care are not fixed.",
        "You can push them too. BABA IS YOU.",
    ]),
]
for badge_id, sym, desc_lines in sec_lore:
    c.setFillColor(PANEL)
    h = (len(desc_lines) * 4.5 + 6)*mm
    c.rect(M, y - h, CW, h, fill=1, stroke=0)
    bold(c, 7); c.setFillColor(ROSE)
    c.drawString(M + 3*mm, y - 1*mm, badge_id)
    mono(c, 7); c.setFillColor(FG3)
    c.drawString(M + 55*mm, y - 1*mm, sym)
    y -= 5.5*mm
    mono(c, 6.5); c.setFillColor(FG2)
    for dl in desc_lines:
        c.drawString(M + 5*mm, y, "↳ " + dl)
        y -= 4.3*mm
    y -= 2*mm

y -= 6*mm
bold(c, 10); c.setFillColor(PUZZLE)
c.drawString(M, y, "COMPLETE BADGE SYSTEM ACCOUNTING — v35")
y -= 7*mm

# Accounting table
c.setFillColor(PANEL); c.rect(M, y - 65*mm, CW, 65*mm, fill=1, stroke=0)
c.setStrokeColor(PUZZLE2); c.setLineWidth(0.4)
c.rect(M, y - 65*mm, CW, 65*mm, fill=0, stroke=1)

table_header = ["CATEGORY", "COUNT", "NOTES"]
c.setFillColor(PUZZLE2); c.rect(M, y - 6*mm, CW, 6*mm, fill=1, stroke=0)
bold(c, 7); c.setFillColor(BG)
c.drawString(M + 3*mm, y - 4*mm, table_header[0])
c.drawString(M + 50*mm, y - 4*mm, table_header[1])
c.drawString(M + 66*mm, y - 4*mm, table_header[2])
ty = y - 10*mm

rows = [
    ("Milestone",       "   22", "Day-count milestones (v1–v4)"),
    ("Time Easter Eggs","   30", "Time-of-day check-ins (v1–v7 + leet/09:09)"),
    ("Calendar Easter", "   82", "Special dates (v1–v23)"),
    ("Word Turns",      "  300", "Keyword detection (v1–v25) — 25 engines"),
    ("Behavioral",      "   89", "Patterns over time (v1–v22)"),
    ("Achievement RPG", "  138", "Milestone combinations (v1–v23)"),
    ("Mastery Tiers",   "  100", "Epic depth milestones (v1–v25)"),
    ("Secret Boss",     "   92", "Hidden triggers (v1–v22)"),
    ("─" * 20,      "  ───", ""),
    ("TOTAL",           "  905", "v35 \xb7 THE PUZZLE CODEX \xb7 +31 from v34"),
]
for cat, count, note in rows:
    is_total = cat == "TOTAL"
    if is_total:
        c.setFillColor(PUZZLE2); c.rect(M, ty - 3*mm, CW, 5.5*mm, fill=1, stroke=0)
        bold(c, 7); c.setFillColor(BG)
    else:
        mono(c, 7); c.setFillColor(FG)
    c.drawString(M + 3*mm, ty, cat)
    c.drawString(M + 50*mm, ty, count)
    mono(c, 6.5); c.setFillColor(FG3 if not is_total else BG)
    c.drawString(M + 66*mm, ty, note)
    ty -= 5.5*mm

# ── PAGE 5: ENGINE HISTORY + METADATA ────────────────────────────────────────
page += 1; y = new_page(c, page)
bold(c, 10); c.setFillColor(PUZZLE)
c.drawString(M, y, "THE 25 WORD TURN ENGINES — COMPLETE VERSION HISTORY")
y -= 7*mm

engines = [
    ("v1 ",  "Core",           "gratitude / breathe / presence / letting go"),
    ("v2 ",  "Sci-Fi Arcade",  "simulation / multiverse / clone / upload"),
    ("v5 ",  "Signal Codex",   "signal / noise / frequency / transmission"),
    ("v6 ",  "Becoming",       "threshold / becoming / not yet / emergence"),
    ("v7 ",  "Rogue Archive",  "shadow / descent / hidden / underground"),
    ("v8 ",  "Mainframe",      "system / process / memory / compile"),
    ("v9 ",  "Arcade Cabinet", "high score / level / player / continue"),
    ("v10",  "Spell Book",     "ritual / cast / invoke / enchantment"),
    ("v11",  "Navigator",      "compass / bearing / landmark / true north"),
    ("v12",  "Alchemist",      "transmute / vessel / catalyst / philosopher"),
    ("v14",  "Starship Deck",  "launch / orbit / trajectory / mission"),
    ("v15",  "Oracle Archive", "oracle / prediction / pattern / signal"),
    ("v16",  "Quantum Library","superposition / entangled / observe / collapse"),
    ("v17",  "Neon Arcade",    "pixel / retro / arcade / 8-bit"),
    ("v18",  "Midnight Radio", "broadcast / frequency / signal / static"),
    ("v19",  "Bio-Terminal",   "neural / synapse / organism / evolution"),
    ("v20",  "Codex Reader",   "Asimov / Dune / Matrix / Neuromancer"),
    ("v21",  "Cyberspace",     "cyberspace / ICE / console / jack in"),
    ("v22",  "Hero's Journey", "threshold / ordeal / elixir / return"),
    ("v23",  "RPG Codex",      "level up / dungeon / guild / boss fight"),
    ("v24",  "Roguelite",      "permadeath / procgen / synergy / ascension"),
    ("v25",  "Puzzle Codex",   "puzzle / paradox / recursion / revelation  [NEW]"),
]
for ver, name, kw in engines:
    c.setFillColor(ACCENT if "[NEW]" not in kw else PUZZLE2)
    c.rect(M, y - 3*mm, CW, 6*mm, fill=1, stroke=0)
    bold(c, 7); c.setFillColor(PUZZLE if "[NEW]" in kw else FG2)
    c.drawString(M + 2*mm, y, ver)
    bold(c, 7); c.setFillColor(FG if "[NEW]" not in kw else PUZZLE)
    c.drawString(M + 12*mm, y, name)
    mono(c, 6.5); c.setFillColor(FG3 if "[NEW]" not in kw else FG2)
    c.drawString(M + 52*mm, y, kw)
    y -= 7*mm

y -= 4*mm
# Metadata
c.setFillColor(PANEL); c.rect(M, y - 28*mm, CW, 28*mm, fill=1, stroke=0)
c.setStrokeColor(PUZZLE); c.setLineWidth(0.4)
c.rect(M, y - 28*mm, CW, 28*mm, fill=0, stroke=1)
bold(c, 8); c.setFillColor(PUZZLE)
c.drawString(M + 3*mm, y - 4*mm, "SESSION METADATA")
my = y - 8*mm
meta = [
    ("SESSION",      "LOT-SR-20261022-PUZZLE-v35"),
    ("VERSION",      "v35"),
    ("DATE",         "2026-10-22"),
    ("TOTAL BADGES", "905  (v34: 874 → v35: 905, +31)"),
    ("CODEX CLASS",  "ENGINEERING"),
    ("DEPLOY BRANCH","claude/quantum-engine-widgets-RgFfC"),
    ("WORD TURN",    "v25 — THE PUZZLE CODEX"),
    ("THEME",        "Portal \xb7 The Witness \xb7 Obra Dinn \xb7 Baba Is You"),
]
for k, v in meta:
    bold(c, 6.5); c.setFillColor(FG3)
    c.drawString(M + 3*mm, my, k + ":")
    mono(c, 6.5); c.setFillColor(FG2)
    c.drawString(M + 40*mm, my, v)
    my -= 3.8*mm

c.save()
print(f"PDF generated: {OUT}")

if __name__ == '__main__':
    pass
