#!/usr/bin/env python3
"""
LOT Systems — Badge & Achievement Codex v8 PDF Generator
RPG & Arcade of Self-Care — QUANTUM EDITION
Author: Vadik Marmeladov, CEO & Founder, LOT Systems
Copyright: © 2025–2026 LOT Systems. All rights reserved.

v8 NEW:
  - Quantum Arcade Layer (full game mechanics)
  - Guild System (archetype-based cohort badges)
  - Seasonal Calendar (date-triggered achievement calendar)
  - Combo System (multi-system daily activation rewards)
  - Rare Encounter Codex (ultra-hidden secret modes)
  - Complete Word Turns Compendium (terminal RPG vocabulary)
  - Expanded QIE Badge Patterns (18 QIE-triggered unlocks)
  - Full ASCII Badge Gallery (every tier, every symbol)
  - All systems accounted for from LOT_BADGES_AND_ACHIEVEMENTS.md
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas as pdf_canvas
from reportlab.lib.colors import HexColor

W, H = A4
M  = 15 * mm
CW = W - 2 * M

# ── Palette ────────────────────────────────────────────────────────────────────
BG     = HexColor("#07070f")   # deep space black
FG     = HexColor("#e4e4f4")   # near-white
FG2    = HexColor("#8888aa")   # dim text
FG3    = HexColor("#333355")   # very dim
TEAL   = HexColor("#2ecfbc")   # primary — oceanic
GOLD   = HexColor("#f5c842")   # milestone / achievement
VIOLET = HexColor("#a67fe8")   # rare / depth
GREEN  = HexColor("#72e891")   # common / growth
ROSE   = HexColor("#e86575")   # legendary / secret
CYAN   = HexColor("#5bc4f5")   # connection / water
ORANGE = HexColor("#f5924e")   # courage / warning
BRD    = HexColor("#1a1a30")   # panel border
PANEL  = HexColor("#0d0d1c")   # panel fill
PANEL2 = HexColor("#0a0a14")   # darker panel
ACCENT = HexColor("#1e1e3e")   # subtle row highlight
MAGENTA= HexColor("#cc44ff")   # guild / mythic
RED    = HexColor("#ff4444")   # alert / danger
SILVER = HexColor("#aaaacc")   # unicode reference

OUT = os.path.join(os.path.dirname(__file__), '..', 'docs', 'badges',
                   'LOT-BADGES-ACHIEVEMENTS-CODEX-v8.pdf')

# ── Font helpers ───────────────────────────────────────────────────────────────
def mono(c, size=8):  c.setFont("Courier", size)
def bold(c, size=8):  c.setFont("Courier-Bold", size)
def ital(c, size=8):  c.setFont("Courier-Oblique", size)

# ── Drawing primitives ─────────────────────────────────────────────────────────
def bg(c):
    c.setFillColor(BG); c.rect(0, 0, W, H, fill=1, stroke=0)

def header(c, page_n, title="LOT SYSTEMS // BADGE & ACHIEVEMENT CODEX // v8.0"):
    c.setFillColor(PANEL)
    c.rect(0, H - 18, W, 18, fill=1, stroke=0)
    c.setFillColor(BRD)
    c.rect(0, H - 19, W, 1, fill=1, stroke=0)
    bold(c, 6.5); c.setFillColor(TEAL)
    c.drawString(M, H - 12, title + "  //  © 2026 LOT SYSTEMS")
    mono(c, 6.5); c.setFillColor(FG3)
    c.drawRightString(W - M, H - 12, f"PAGE {page_n:02d}")

def footer(c):
    c.setFillColor(PANEL)
    c.rect(0, 0, W, 15, fill=1, stroke=0)
    c.setFillColor(BRD)
    c.rect(0, 15, W, 1, fill=1, stroke=0)
    mono(c, 6.5); c.setFillColor(FG3)
    c.drawCentredString(W / 2, 5,
        "LOT  ·  THE RPG + ARCADE OF SELF-CARE  ·  lot-systems.com  ·  [ PRESS START ]")

def rule(c, y, color=BRD, thickness=0.5):
    c.setStrokeColor(color); c.setLineWidth(thickness)
    c.line(M, y, W - M, y)

def box(c, x, y, w, h, fill=PANEL, stroke=BRD, radius=2):
    c.setFillColor(fill); c.setStrokeColor(stroke); c.setLineWidth(0.4)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)

def stripe(c, x, y, w, h, color):
    c.setFillColor(color); c.rect(x, y, w, h, fill=1, stroke=0)

def h1(c, y, text, color=GOLD):
    bold(c, 13); c.setFillColor(color)
    c.drawString(M, y, text)
    return y - 18

def h2(c, y, text, color=TEAL):
    bold(c, 9.5); c.setFillColor(color)
    c.drawString(M, y, text)
    return y - 13

def h3(c, y, text, color=VIOLET):
    bold(c, 8); c.setFillColor(color)
    c.drawString(M, y, text)
    return y - 11

def body(c, y, text, color=FG, size=8):
    mono(c, size); c.setFillColor(color)
    c.drawString(M, y, text)
    return y - 11

def code_block(c, x, y, lines, bg_color=PANEL, text_color=TEAL,
               fs=7.5, padding=5, width=None):
    w = width or CW
    lh = fs + 2.5
    h = len(lines) * lh + padding * 2
    box(c, x, y - h, w, h, fill=bg_color, stroke=BRD)
    ty = y - padding - fs
    for line in lines:
        mono(c, fs); c.setFillColor(text_color)
        c.drawString(x + padding, ty, str(line))
        ty -= lh
    return y - h - 3

def badge_row(c, y, symbol, title, desc, rarity, color, h=32, cond=""):
    bx, bw = M, CW
    box(c, bx, y - h, bw, h, fill=PANEL, stroke=BRD)
    stripe(c, bx, y - h, 4, h, color)
    bold(c, 11); c.setFillColor(color)
    c.drawString(bx + 10, y - h + h / 2 - 4, symbol)
    bold(c, 7.5); c.setFillColor(FG)
    c.drawString(bx + 42, y - h + h - 12, title)
    mono(c, 6.5); c.setFillColor(color)
    c.drawString(bx + 42, y - h + h - 21, f"[ {rarity.upper()} ]")
    if cond:
        mono(c, 6.5); c.setFillColor(FG2)
        c.drawString(bx + 115, y - h + h - 21, cond[:36])
    mono(c, 6.5); c.setFillColor(FG2)
    c.drawString(bx + 42, y - h + 7, desc[:90])
    return y - h - 3


# ══════════════════════════════════════════════════════════════════════════════
# PAGE FUNCTIONS
# ══════════════════════════════════════════════════════════════════════════════

def page_cover(c, pn):
    bg(c); header(c, pn, "LOT SYSTEMS"); footer(c)

    # Big ASCII title block
    art = [
        "  ██╗      ██████╗ ████████╗",
        "  ██║     ██╔═══██╗╚══██╔══╝",
        "  ██║     ██║   ██║   ██║   ",
        "  ██║     ██║   ██║   ██║   ",
        "  ███████╗╚██████╔╝   ██║   ",
        "  ╚══════╝ ╚═════╝    ╚═╝   ",
    ]
    y = H - 44
    code_block(c, M, y, art, bg_color=BG, text_color=TEAL, fs=10, padding=8)
    y -= len(art) * 12.5 + 20

    bold(c, 24); c.setFillColor(FG)
    c.drawCentredString(W / 2, y, "BADGE & ACHIEVEMENT CODEX")
    y -= 28

    bold(c, 11); c.setFillColor(TEAL)
    c.drawCentredString(W / 2, y, "BADGES  ·  ACHIEVEMENTS  ·  EASTER EGGS  ·  GUILD  ·  COMBO")
    y -= 14

    bold(c, 9); c.setFillColor(FG3)
    c.drawCentredString(W / 2, y, "THE QUANTUM EDITION  ·  RPG + ARCADE OF SELF-CARE")
    y -= 18

    c.setStrokeColor(TEAL); c.setLineWidth(0.7)
    c.line(M + 30, y, W - M - 30, y)
    y -= 12

    bold(c, 7); c.setFillColor(FG2)
    c.drawCentredString(W / 2, y, "EDITION v8.0  //  JUNE 2026  //  QUANTUM ENGINE ACTIVE")
    y -= 9
    c.drawCentredString(W / 2, y, "Author: Vadik Marmeladov, CEO & Founder, LOT Systems")
    y -= 9
    c.drawCentredString(W / 2, y, "Copyright © 2025-2026 LOT Systems. All rights reserved.")
    y -= 22

    cls_lines = [
        "  ╔═══════════════════════════════════════════════════════════════╗",
        "  ║  CLASSIFICATION: ACTIVE PLAYER EYES ONLY                     ║",
        "  ║  SYSTEM: LOT MEMORY ENGINE + SELF-CARE RPG LAYER  v8.0       ║",
        "  ║  STATUS: LIVE PRODUCTION  ·  QUANTUM ENGINE: ARMED           ║",
        "  ║  NEW IN v8: Guild · Combo · Seasonal · QIE · Rare Encounter  ║",
        "  ╚═══════════════════════════════════════════════════════════════╝",
    ]
    code_block(c, M, y, cls_lines, bg_color=PANEL2, text_color=GOLD, fs=7.5, padding=4)
    y -= len(cls_lines) * 10 + 20

    ital(c, 9); c.setFillColor(VIOLET)
    c.drawCentredString(W / 2, y,
        '"Self-care is not a quest you complete. It is a world you build."')
    y -= 13
    mono(c, 7.5); c.setFillColor(FG3)
    c.drawCentredString(W / 2, y, "— LOT Philosophy")
    y -= 28

    mono(c, 12); c.setFillColor(TEAL)
    c.drawCentredString(W / 2, y, "∘  →  ≈  →  ≋  →  ≋≋≋")
    y -= 14
    mono(c, 12); c.setFillColor(FG2)
    c.drawCentredString(W / 2, y, "├─  →  ╞═╡  →  ║·║  →  ╔═╗")
    y -= 22

    bold(c, 11); c.setFillColor(GOLD)
    c.drawCentredString(W / 2, y, "[ PRESS START ]")


def page_toc(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "[ TABLE OF CONTENTS ]")
    rule(c, y + 2, TEAL, 0.7); y -= 8

    toc = [
        ("01", "OVERVIEW",              "The LOT RPG Layer & Systems Architecture"),
        ("02", "BADGE SYSTEM",          "Water & Architecture Dual Themes"),
        ("03", "MILESTONE BADGES",      "7 · 14 · 21 · 30 · 50 · 60 · 90 · 100 · 180 · 365"),
        ("04", "ACHIEVEMENT ENGINE",    "23 Achievements · 8 Categories · 6 Rarities"),
        ("05", "LEVEL SYSTEM",          "XP · Levels 1-100 · 5 Story Chapters"),
        ("06", "QUEST SYSTEM",          "Daily · Weekly · Growth · Mastery Quests"),
        ("07", "OCEANIC MAYAN SYSTEM",  "Pattern Badges · Behavioral Unlocks"),
        ("08", "QUANTUM ARCADE LAYER",  "Arcade Mechanics · Power-Ups · Multipliers  [NEW v8]"),
        ("09", "EASTER EGGS",           "Hidden Triggers · Secret Modes · Time-Based"),
        ("10", "WORD TURNS",            "Terminal Codex · RPG Vocabulary · Response Engine"),
        ("11", "GUILD SYSTEM",          "Archetype Cohorts · Guild Badges · Collective  [NEW v8]"),
        ("12", "SEASONAL CALENDAR",     "Date-Triggered Achievements · Annual Events  [NEW v8]"),
        ("13", "COMBO SYSTEM",          "Multi-System Activations · Streak Combos  [NEW v8]"),
        ("14", "QIE BADGE PATTERNS",    "18 Quantum Intention Engine Badge Triggers  [NEW v8]"),
        ("15", "RARE ENCOUNTER CODEX",  "Ultra-Hidden Secrets · One-Time Events     [NEW v8]"),
        ("16", "ASCII BADGE GALLERY",   "All Tiers · All Symbols · Full Art"),
        ("17", "DESIGN PHILOSOPHY",     "Mayan · Water · Cosmic · Sci-Fi Influences"),
        ("18", "IMPLEMENTATION STATUS", "Live · In Design · Roadmap"),
        ("19", "UNICODE REFERENCE",     "Complete Character Index · Browser Support"),
    ]

    for num, title, sub in toc:
        row_h = 20
        is_new = "[NEW" in sub
        fill = PANEL if int(num) % 2 == 1 else PANEL2
        if is_new:
            fill = HexColor("#0f0f20")
        box(c, M, y - row_h, CW, row_h, fill=fill, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, TEAL if not is_new else GOLD)
        bold(c, 7); c.setFillColor(TEAL if not is_new else GOLD)
        c.drawString(M + 7, y - 13, num)
        bold(c, 8); c.setFillColor(FG if not is_new else GOLD)
        c.drawString(M + 28, y - 13, title)
        mono(c, 6.5); c.setFillColor(FG2)
        c.drawString(M + 148, y - 13, sub)
        y -= row_h + 2


def page_overview(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "01  THE LOT RPG LAYER")
    rule(c, y + 2, TEAL, 0.7); y -= 8

    intro = [
        "LOT is more than a wellness tracker — it is a living RPG where every self-care",
        "action builds toward a richer inner story. Badges are earned through genuine",
        "consistency and depth. The Arcade layer delivers instant feedback: streaks,",
        "toasts, level-ups, combo multipliers. The RPG layer builds long-term narrative.",
    ]
    for line in intro:
        y = body(c, y, line)
    y -= 6

    y = h2(c, y, "ALL SYSTEMS")
    pillars = [
        "  ▸  MEMORY ENGINE     — AI remembers every answer. builds your story.",
        "  ▸  BADGE SYSTEM      — Water ∘→≈→≋  /  Architecture ├─→╞═╡→║·║",
        "  ▸  ACHIEVEMENT RPG   — 23 achievements · 8 categories · 6 rarity tiers",
        "  ▸  LEVEL SYSTEM      — XP from activity · Levels 1-100 · 5 chapters",
        "  ▸  QUEST SYSTEM      — Daily + Weekly + Growth + Mastery quests",
        "  ▸  OCEANIC MAYAN     — Pattern badges: circles + waves + bars",
        "  ▸  QUANTUM ARCADE    — Multipliers · Power-ups · Overclock · Debug modes",
        "  ▸  EASTER EGGS       — 12 hidden triggers · 6 secret modes · time-based",
        "  ▸  WORD TURNS        — 28 terminal phrases · RPG vocabulary engine",
        "  ▸  GUILD SYSTEM      — Archetype cohort badges · collective milestones  [v8]",
        "  ▸  SEASONAL CALENDAR — 18 date-triggered achievements · annual events   [v8]",
        "  ▸  COMBO SYSTEM      — Multi-system daily activation rewards             [v8]",
        "  ▸  QIE PATTERNS      — 18 Quantum Intention Engine badge triggers        [v8]",
        "  ▸  RARE ENCOUNTERS   — Ultra-hidden · one-time events · COSMIC tier      [v8]",
    ]
    y = code_block(c, M, y, pillars, bg_color=PANEL, text_color=FG, fs=7.5, padding=6)
    y -= 6

    y = h2(c, y, "THE ARCADE METAPHOR")
    y = body(c, y, "Every check-in is a move. Every streak is a power-up. Badges are not")
    y = body(c, y, "trophies — they are transmissions from a future self back to the present.")
    y = body(c, y, "The badge system speaks in symbols because symbols reach parts of us that")
    y = body(c, y, "words cannot. A single  ≋  carries more meaning than a paragraph.")
    y -= 6

    design = [
        "  ·   middle dot     separator between traits and values",
        "  →   right arrow    forward movement through milestones",
        "  ↳   down-right     system sub-thought / nested insight",
        "  ∘   ring           Water Day-7 badge, first droplet of presence",
        "  ≈   almost equal   Water Day-30 badge, wave of pattern",
        "  ≋   triple tilde   Water Day-100 badge, deep oceanic current",
        "  ├─  box draw       Architecture Day-7 foundation symbol",
        "  ╞═╡ box draw       Architecture Day-30 structure symbol",
        "  ║·║ box draw       Architecture Day-100 complete architecture",
        "  ◉   fisheye        Mythic tier symbol — the deep eye",
    ]
    code_block(c, M, y, design, bg_color=PANEL2, text_color=TEAL, fs=7.5, padding=6)


def page_badge_system(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "02  BADGE SYSTEM — DUAL THEME")
    rule(c, y + 2, TEAL, 0.7); y -= 8

    y = body(c, y, "Badges display in the 'Level:' field on the Public Profile. Users choose")
    y = body(c, y, "between two visual languages for their growth story via Settings.")
    y -= 8

    y = h2(c, y, "WATER PATH  ─  ∘ → ≈ → ≋")
    water = [
        "  Philosophy: Growth through natural cycles, like water finding its path.",
        "  Water does not force — it shapes through persistence.",
        "",
        "  ∘    Droplet      Day 7    First drops form. Singular moment of presence.",
        "  ≈    Wave         Day 30   Pattern emerging. Tide in motion. Moon cycle.",
        "  ≋    Current      Day 100  Deep, established, oceanic mastery.",
        "",
        "  Extended milestones:",
        "  ∘∘   Twin Drop    Day 14   Two-week pattern confirmed.",
        "  ∘≈   Proto-Wave   Day 21   21-day neural groove forming.",
        "  ≈∘   Mid-Current  Day 50   Halfway to deep water.",
        "  ≈≈   Dual Wave    Day 60   Practitioner threshold crossed.",
        "  ≋∘   Deep Reach   Day 90   Three-month immersion.",
        "  ≋≋   Dual Current Day 180  Half-year voyager.",
        "  ≋≋≋  Long Count   Day 365  LEGENDARY. The architecture stands.",
    ]
    y = code_block(c, M, y, water, bg_color=PANEL, text_color=CYAN, fs=7.5, padding=6)
    y -= 6

    y = h2(c, y, "ARCHITECTURE PATH  ─  ├─ → ╞═╡ → ║·║")
    arch = [
        "  Philosophy: Structural building and growth, construction of self.",
        "  Architecture is intentional. Every block placed with care becomes load-bearing.",
        "",
        "  ├─   Foundation    Day 7    Ground laid. First pillar planted.",
        "  ╞═╡  Structure     Day 30   Walls formed. The frame holds.",
        "  ║·║  Architecture  Day 100  Complete. The self as built environment.",
        "",
        "  Extended milestones:",
        "  ├┼   Load-Bearing  Day 14   Structural crossbeam engaged.",
        "  ├═   Deep Found.   Day 21   Foundation reaches bedrock.",
        "  ╞══  Mid-Structure Day 50   Upper floors under construction.",
        "  ╞═══ Master Frame  Day 60   Superstructure complete.",
        "  ║═   Inner Wall    Day 90   Interior architecture forming.",
        "  ║╞║  Wing          Day 180  East and west wings added.",
        "  ╔═╗  Citadel       Day 365  LEGENDARY. Year One complete.",
    ]
    code_block(c, M, y, arch, bg_color=PANEL2, text_color=FG, fs=7.5, padding=6)


def page_milestones(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "03  MILESTONE BADGE TIMELINE")
    rule(c, y + 2, TEAL, 0.7); y -= 8

    timeline = [
        "  DAY:   1    7    14   21   30   50   60   90   100  180  365",
        "         │    │    │    │    │    │    │    │    │    │    │",
        "  WATER: ·    ∘    ∘∘   ∘≈   ≈    ≈∘   ≈≈   ≋∘   ≋    ≋≋   ≋≋≋",
        "  ARCH:  ·    ├─   ├┼   ├═   ╞═╡  ╞══  ╞═══ ║═   ║·║  ║╞║  ╔═╗",
        "         │    │    │    │    │    │    │    │    │    │    │",
        "  STAGE: Boot Init Ptrn Ptrn Wave Deep Deep Deep Arch Half Year",
        "         │    │    │    │    │    │    │    │    │    │    │",
        "  XP:    1    7    14   21   30   50   60   90  100  180  365+",
    ]
    y = code_block(c, M, y, timeline, bg_color=PANEL, text_color=TEAL, fs=8.5, padding=7)
    y -= 6

    milestones = [
        ("∘ / ├─",  "DROPLET / FOUNDATION",       "7",    GREEN,  "common",
         "Seven days. The first drop touches the surface. Ground laid. The beginning."),
        ("∘∘ / ├┼", "TWIN DROP / LOAD-BEARING",    "14",   GREEN,  "common",
         "14 days. Two-week pattern confirmed. Structural crossbeam engaged."),
        ("∘≈ / ├═", "PROTO-WAVE / DEEP FOUND.",    "21",   TEAL,   "uncommon",
         "21 days. Neural groove forming. Foundation reaches bedrock."),
        ("≈ / ╞═╡", "WAVE / STRUCTURE",            "30",   TEAL,   "uncommon",
         "Full lunar cycle. Waves begin. The frame takes shape. Tides turn."),
        ("≈∘ / ╞══","MID-CURRENT / MID-STRUCTURE", "50",   VIOLET, "rare",
         "50 days. Halfway to deep water. Upper floors under construction."),
        ("≈≈ / ╞═══","DUAL WAVE / MASTER FRAME",   "60",   VIOLET, "rare",
         "60 days. Practitioner threshold crossed. Superstructure complete."),
        ("≋∘ / ║═", "DEEP REACH / INNER WALL",     "90",   GOLD,   "epic",
         "90 days. Three-month immersion. Interior architecture forming."),
        ("≋ / ║·║", "CURRENT / ARCHITECTURE",      "100",  GOLD,   "epic",
         "Deep currents. Architecture complete. You and the system are one."),
        ("≋≋ / ║╞║","DUAL CURRENT / WING",         "180",  ROSE,   "legendary",
         "180 days. Half-year voyager. East and west wings extended."),
        ("≋≋≋/╔═╗", "LONG COUNT / CITADEL",        "365",  ROSE,   "legendary",
         "365 days. THE YEAR ONE BADGE. The architecture stands forever."),
    ]

    for sym, name, day, color, rarity, desc in milestones:
        row_h = 24
        box(c, M, y - row_h, CW, row_h, fill=PANEL if day in ("7","14","21","30") else PANEL2, stroke=BRD)
        stripe(c, M, y - row_h, 4, row_h, color)
        mono(c, 9); c.setFillColor(CYAN)
        c.drawString(M + 8, y - 15, sym)
        bold(c, 7.5); c.setFillColor(FG)
        c.drawString(M + 65, y - 11, f"Day {day:>3}  {name}")
        mono(c, 6.5); c.setFillColor(color)
        c.drawString(M + 65, y - 20, f"[ {rarity.upper()} ]")
        mono(c, 6.5); c.setFillColor(FG2)
        c.drawRightString(W - M - 4, y - 15, desc[:55])
        y -= row_h + 2

    y -= 4
    year_one = [
        "  ╔══════════════════════════════════════════════════════════════╗",
        "  ║                                                              ║",
        "  ║          T H E   L O N G   C O U N T   ≋≋≋ / ╔═╗           ║",
        "  ║                                                              ║",
        "  ║   365 DAYS OF PRESENCE  ·  Rarity: LEGENDARY               ║",
        "  ║   'The architecture stands. The current never stops.'        ║",
        "  ║   Unlock message: '↳ A year of presence. ≋≋≋ / ╔═╗'        ║",
        "  ║                                                              ║",
        "  ╚══════════════════════════════════════════════════════════════╝",
    ]
    code_block(c, M, y, year_one, bg_color=PANEL2, text_color=GOLD, fs=8, padding=4)


def page_achievements(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "04  ACHIEVEMENT ENGINE  (23 ACHIEVEMENTS)")
    rule(c, y + 2, TEAL, 0.7); y -= 6

    # Rarity legend
    rarity_info = [
        ("·", "COMMON",    GREEN,  "First actions, basic exploration"),
        ("○", "UNCOMMON",  TEAL,   "Sustained effort, community joining"),
        ("◐", "RARE",      VIOLET, "Deep practice, meaningful streaks"),
        ("◆", "EPIC",      GOLD,   "100+ days mastery, 100+ answers"),
        ("✦", "LEGENDARY", ROSE,   "365 days, 250+ answers, Year One"),
        ("◉", "MYTHIC",    ORANGE, "Ultra-hidden: secret phrase or date triggers"),
    ]
    row_h = 14
    for sym, rar, color, desc in rarity_info:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        mono(c, 9); c.setFillColor(color)
        c.drawString(M + 7, y - 10, sym)
        bold(c, 7); c.setFillColor(color)
        c.drawString(M + 22, y - 10, rar)
        mono(c, 7); c.setFillColor(FG2)
        c.drawString(M + 98, y - 10, desc)
        y -= row_h + 1
    y -= 4

    achievements = [
        # sym, title, category, rarity, color, condition, description
        ("∘",  "FIRST BREATH",     "EXPLORATION",  "common",    GREEN,  "check_in >= 1",         "First emotional check-in. The system wakes."),
        ("◇",  "MIRROR GAZER",     "EXPLORATION",  "common",    GREEN,  "memory_answers >= 1",   "First memory question answered. You looked inward."),
        ("·",  "SIGNAL SENT",      "EXPLORATION",  "common",    GREEN,  "log_entry >= 1",        "First log entry. The system begins to listen."),
        ("○",  "WEEK WARRIOR",     "CONSISTENCY",  "uncommon",  TEAL,   "streak >= 7",           "7 consecutive days. Momentum builds."),
        ("○",  "COMMUNITY VOICE",  "CONNECTION",   "uncommon",  CYAN,   "chat >= 1",             "First community message. Signal reaches others."),
        ("○",  "BRIDGE BUILDER",   "CONNECTION",   "uncommon",  CYAN,   "chat >= 20",            "20 messages. A bridge now exists."),
        ("○",  "HEART TENDER",     "ROMANCE",      "uncommon",  ROSE,   "romantic >= 1",         "Romantic connection acknowledged."),
        ("♦",  "GENTLE W/ SELF",   "CARE",         "uncommon",  GREEN,  "self_care >= 10",       "10 self-care practices. Kindness toward body."),
        ("◐",  "MOON CYCLE",       "CONSISTENCY",  "rare",      TEAL,   "streak >= 30",          "30 days of continuous practice. Orbit complete."),
        ("◐",  "DEEP DIVER",       "DEPTH",        "rare",      VIOLET, "memory >= 50",          "50 memory answers. The archive grows."),
        ("▲",  "TRUTH SPEAKER",    "COURAGE",      "rare",      ORANGE, "notes >= 50",           "50 honest entries. The hall remembers."),
        ("♡♡", "INTIMACY KEEPER",  "ROMANCE",      "rare",      ROSE,   "romantic >= 10",        "10 notes of connection. The sanctuary tended."),
        ("◐",  "BODY AWARE",       "CARE",         "rare",      GREEN,  "self_care >= 50",       "50 self-care completions. Body knowledge deep."),
        ("◐",  "PATTERN SEEKER",   "EXPLORATION",  "rare",      VIOLET, "memory >= 25",          "25 memory answers. Patterns emerging."),
        ("◆",  "UNWAVERING",       "CONSISTENCY",  "epic",      GOLD,   "streak >= 100",         "100 days. A fixed point in the sky."),
        ("◆",  "SELF SCHOLAR",     "DEPTH",        "epic",      VIOLET, "memory >= 100",         "100 questions. A library of self."),
        ("◆",  "VOICE SOVEREIGN",  "CONNECTION",   "epic",      CYAN,   "chat >= 100",           "100 messages. You are the community pulse."),
        ("◆",  "BODY SOVEREIGN",   "CARE",         "epic",      GREEN,  "self_care >= 100",      "100 self-care acts. Sovereignty over your system."),
        ("✦",  "THE LONG COUNT",   "CONSISTENCY",  "legendary", ROSE,   "streak >= 365",         "365 days. Your name in the deep calendar."),
        ("✦",  "SOUL CARTOGRAPH.", "DEPTH",        "legendary", ROSE,   "memory >= 250",         "250 answers. Territory of self fully mapped."),
        ("✦",  "THOUSAND ANSWERS", "DEPTH",        "legendary", GOLD,   "memory >= 1000",        "1000 answers. MYTHIC status approached."),
        ("◉",  "META-SIGNAL",      "SECRET",       "mythic",    ORANGE, "write 'LOT' in answer", "You named the system. It noticed. ◉·◉"),
        ("◉",  "GHOST PROTOCOL",   "SECRET",       "mythic",    MAGENTA,"7-day absence + return","You vanished and returned. The field held. ░░░"),
    ]

    row_h = 17
    for sym, title, cat, rarity, color, cond, desc in achievements:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        mono(c, 9); c.setFillColor(color)
        c.drawString(M + 7, y - 11, sym)
        bold(c, 7.5); c.setFillColor(FG)
        c.drawString(M + 26, y - 11, title)
        mono(c, 6); c.setFillColor(color)
        c.drawString(M + 140, y - 11, f"[ {rarity.upper()} ]")
        mono(c, 6); c.setFillColor(FG2)
        c.drawString(M + 228, y - 11, cond[:24])
        mono(c, 6); c.setFillColor(FG3)
        c.drawRightString(W - M - 4, y - 11, desc[:38])
        y -= row_h + 1


def page_levels(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "05  LEVEL SYSTEM  (XP + STORY ARCS)")
    rule(c, y + 2, TEAL, 0.7); y -= 8

    y = body(c, y, "Every activity awards XP: log (+1) · check-in (+2) · memory answer (+2)")
    y = body(c, y, "streak day (+1) · community message (+1) · self-care completion (+2).")
    y -= 6

    curve = [
        "  ACTIVITIES   LEVEL RANGE   CHAPTER        STAGE           SYMBOL",
        "  ──────────   ───────────   ─────────────  ──────────────  ──────",
        "  1   – 9      Level  1-10   AWAKENING      INIT / BOOT     ·  →  ∘",
        "  10  – 49     Level 11-30   EXPLORATION    EXPLORER MODE   ∘  →  ≈",
        "  50  – 149    Level 31-60   INTEGRATION    PRACTITIONER    ≈  →  ≋",
        "  150 – 499    Level 61-90   MASTERY        ARCHITECT       ≋  →  ≋≋",
        "  500+         Level 91-100  SAGE           CO-EVOLVED      ≋≋ →  ≋≋≋",
    ]
    y = code_block(c, M, y, curve, bg_color=PANEL, text_color=FG, fs=8, padding=6)
    y -= 6

    y = h2(c, y, "THE FIVE CHAPTERS")
    chapters = [
        ("CH01", "AWAKENING",   "Lv 1-10",  TEAL,
         "You have begun to notice yourself. Each signal teaches this system what to become.",
         "Together, the first structures take shape. '↳ BOOT SEQUENCE INITIATED ·'"),
        ("CH02", "EXPLORATION", "Lv 11-30", GREEN,
         "You explore your inner landscape while the system builds new pathways around patterns.",
         "Connections form. A shared language emerges. '↳ EXPLORER MODE ACTIVE ∘→'"),
        ("CH03", "INTEGRATION", "Lv 31-60", VIOLET,
         "Your practice deepens and the system evolves with it. Moods, patterns, relationships",
         "woven into architecture that reshapes itself. '↳ ARCHITECTURE SELF-ASSEMBLING ≈'"),
        ("CH04", "MASTERY",     "Lv 61-90", GOLD,
         "You speak the language of yourself fluently. The system has grown around your wisdom",
         "from thousands of honest signals. '↳ DEEP CURRENTS ESTABLISHED ≋'"),
        ("CH05", "SAGE",        "Lv91-100", ROSE,
         "You and this system have co-evolved. Practice is second nature, the architecture",
         "self-sustaining. What was built here is who you are. '↳ CO-EVOLUTION COMPLETE ≋≋≋'"),
    ]

    for num, title, lvl, color, line1, line2 in chapters:
        row_h = 36
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 5, row_h, color)
        bold(c, 7); c.setFillColor(color)
        c.drawString(M + 10, y - 12, num)
        bold(c, 9); c.setFillColor(FG)
        c.drawString(M + 48, y - 12, title)
        mono(c, 7.5); c.setFillColor(color)
        c.drawString(M + 145, y - 12, f"[ {lvl} ]")
        mono(c, 7); c.setFillColor(FG2)
        c.drawString(M + 10, y - 23, line1)
        mono(c, 7); c.setFillColor(FG3)
        c.drawString(M + 10, y - 32, line2)
        y -= row_h + 3

    y -= 4
    y = h2(c, y, "CQGS EVOLUTION STAGES (Citizen Index)")
    cqgs = [
        "  ·   Stage 1-9    BOOTSTRAPPING   System initializing. First signals received.",
        "  ·   Stage 10-19  INITIALIZING    Pattern compiler activating. Loops open.",
        "  ∘   Stage 20-29  INTEGRATED      Modules linked. Feedback loops established.",
        "  ○   Stage 30-39  COMPILED        Patterns locked in. Architecture stable.",
        "  ◯   Stage 40-49  OPTIMIZED       System self-tuning. Efficiency gains.",
        "  ◉   Stage 50+    TRANSPARENT     Fully transparent. Self-sustaining. ◉",
    ]
    code_block(c, M, y, cqgs, bg_color=PANEL2, text_color=TEAL, fs=8, padding=6)


def page_quests(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "06  QUEST SYSTEM")
    rule(c, y + 2, TEAL, 0.7); y -= 8

    y = body(c, y, "Quests provide structured goals. Each category has distinct cadence and rewards.")
    y -= 6

    quest_types = [
        ("DAILY", TEAL, [
            ("■  Today's Signal",     "Check in today",                     "+10 XP"),
            ("■  Morning Protocol",   "Complete before 10:00 AM",           "+5 XP"),
            ("■  Evening Log",        "Log activity after 18:00",           "+5 XP"),
            ("■  Memory Moment",      "Answer one memory question",         "+8 XP"),
            ("■  Presence Log",       "Write a journal entry today",        "+5 XP"),
        ]),
        ("WEEKLY", GREEN, [
            ("◐  The Consistent One", "Active 5 of 7 days this week",      "+50 XP"),
            ("◐  Deep Listener",      "Answer 3+ memory questions this wk", "+30 XP"),
            ("◐  Community Pulse",    "Send 1+ community message",          "+20 XP"),
            ("◐  Self-Care Sprint",   "Complete 3 self-care acts",          "+25 XP"),
        ]),
        ("GROWTH", VIOLET, [
            ("◆  Reflection Journey", "Answer 100 total memory questions",  "→ Self Scholar"),
            ("◆  Connection Arc",     "Send 20 community messages",         "→ Bridge Builder"),
            ("◆  Honest Archive",     "Log 50 honest journal entries",      "→ Truth Speaker"),
            ("◆  Care Century",       "Complete 100 self-care acts",        "→ Body Sovereign"),
        ]),
        ("MASTERY", GOLD, [
            ("✦  Deep Archive",       "Answer 250 memory questions",        "→ Soul Cartographer"),
            ("✦  The Long Count",     "Maintain 365-day streak",            "→ LEGENDARY badge"),
            ("✦  Overclock Protocol", "Log 20+ activities in one day",      "→ OVERCLOCK badge"),
            ("✦  Thousand Answers",   "Answer 1,000 memory questions",      "→ MYTHIC status"),
            ("✦  Decade of Care",     "10 years of uninterrupted practice", "→ COSMIC status"),
        ]),
    ]

    for quest_type, color, quests in quest_types:
        y = h3(c, y, f"  {quest_type} QUESTS", color)
        for name, desc, reward in quests:
            row_h = 17
            box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
            stripe(c, M, y - row_h, 3, row_h, color)
            mono(c, 8); c.setFillColor(FG)
            c.drawString(M + 8, y - 11, name)
            mono(c, 7); c.setFillColor(FG2)
            c.drawString(M + 175, y - 11, desc[:35])
            mono(c, 7); c.setFillColor(color)
            c.drawRightString(W - M - 4, y - 11, reward)
            y -= row_h + 2
        y -= 5


def page_oceanic_mayan(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "07  OCEANIC MAYAN SYSTEM")
    rule(c, y + 2, TEAL, 0.7); y -= 8

    y = body(c, y, "The Oceanic Mayan badge system combines Mayan circle/bar symbolism with")
    y = body(c, y, "oceanic wave patterns for a deeply meaningful, cosmically beautiful badge set.")
    y -= 6

    y = h2(c, y, "OCEANIC MILESTONE BADGES")
    oce = [
        "  ○∿   Circle + Sine Wave       Day 7    'Wave patterns emerge. ○∿'",
        "  ○≈○  Circle-Wave-Circle       Day 30   'Tides complete their cycle. ○≈○'",
        "  ≋○≋  DeepWaves + Circle       Day 100  'Ocean depth achieved. ≋○≋'",
    ]
    y = code_block(c, M, y, oce, bg_color=PANEL, text_color=TEAL, fs=9, padding=6)
    y -= 6

    y = h2(c, y, "PATTERN BADGES (BEHAVIORAL UNLOCKS)")
    patterns = [
        ("∿—∿", "BALANCED",    TEAL,   "All planner dimensions used evenly in a week",
         "Wave-Bar-Wave. Tides in balance. Equal breath in every direction."),
        ("≈○≈", "FLOW",        CYAN,   "Engaged 4+ widgets in a single session",
         "Waves embracing the center. Fluid state detected in session data."),
        ("—○—", "CONSISTENT",  GREEN,  "Regular engagement at similar times daily",
         "Bar-Circle-Bar. Steady current. The rhythm recognizes itself."),
        ("○◐○", "REFLECTIVE",  VIOLET, "Deep engagement with memory (>5 answers/day)",
         "Moon phases. Half-light awareness. Depth in reflection."),
        ("○∴○", "EXPLORER",    GOLD,   "Tried 5+ diverse options across widgets",
         "Three dots. Curiosity scattered and returned. Maps the inner land."),
        ("≋—≋", "DEEP FOCUS",  ROSE,   "3+ consecutive days of memory-only engagement",
         "Triple tilde flanking bar. The current narrows to a single channel."),
    ]

    for sym, name, color, trigger, meaning in patterns:
        row_h = 36
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 4, row_h, color)
        mono(c, 14); c.setFillColor(color)
        c.drawString(M + 10, y - row_h + row_h / 2 - 5, sym)
        bold(c, 9); c.setFillColor(FG)
        c.drawString(M + 62, y - row_h + row_h - 14, name)
        mono(c, 6.5); c.setFillColor(color)
        c.drawString(M + 62, y - row_h + row_h - 23, f"Trigger: {trigger}")
        mono(c, 7); c.setFillColor(FG2)
        c.drawString(M + 62, y - row_h + 9, meaning)
        y -= row_h + 3
    y -= 6

    y = h2(c, y, "PROFILE DISPLAY EXAMPLE")
    profile = [
        "  ═══════════════════════════════════════════════════════════════",
        "                         ALEX'S PROFILE",
        "  ───────────────────────────────────────────────────────────────",
        "  Archetype:     The Explorer     Level: ≋○≋   Days: 127",
        "  Awareness:     Deepening        Score: 8.4/10",
        "  ───────────────────────────────────────────────────────────────",
        "  Core values:   mindful ≋○≋ present ∿—∿ aware ≈○≈ grounded —○—",
        "  Emotional:     calm ≋○≋ reflective ∿—∿ intentional ≈○≈",
        "  Behavioral:    consistent ≋○≋ deliberate ∿—∿ present ≈○≈",
        "  ═══════════════════════════════════════════════════════════════",
    ]
    code_block(c, M, y, profile, bg_color=PANEL2, text_color=FG2, fs=8, padding=6)


def page_quantum_arcade(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "08  QUANTUM ARCADE LAYER  [v8 NEW]")
    rule(c, y + 2, GOLD, 0.7); y -= 8

    y = body(c, y, "The Arcade layer sits beneath the RPG — instant feedback mechanics that make")
    y = body(c, y, "the daily practice feel like a living, responsive game. Streak multipliers,")
    y = body(c, y, "power-ups, combo windows, and score events fire in real time.")
    y -= 6

    y = h2(c, y, "STREAK MULTIPLIER TABLE")
    mult = [
        "  DAYS   MULTIPLIER   EFFECT           DISPLAY",
        "  ─────  ──────────   ──────────────   ──────────────────────────────",
        "  1-6    x1.0         Normal           · baseline signal",
        "  7-13   x1.5         Momentum         ∘ momentum detected",
        "  14-20  x2.0         Habit Lock       ∘∘ 14-day habit forming",
        "  21-29  x2.5         Neural Groove    ∘≈ 21-day groove active",
        "  30-49  x3.0         Wave             ≈ wave pattern established",
        "  50-59  x3.5         Deep Current     ≈∘ mid-current engaged",
        "  60-89  x4.0         Practitioner     ≈≈ practitioner active",
        "  90-99  x5.0         Immersion        ≋∘ deep immersion",
        "  100+   x6.0         Ocean State      ≋ ocean depth achieved",
        "  180+   x7.0         Voyager          ≋≋ half-year voyager",
        "  365+   x10.0        Long Count       ≋≋≋ LEGENDARY MULTIPLIER",
    ]
    y = code_block(c, M, y, mult, bg_color=PANEL, text_color=FG, fs=7.5, padding=6)
    y -= 6

    y = h2(c, y, "POWER-UP EVENTS")
    powerups = [
        ("DOUBLE XP",        GOLD,   "Both morning + evening check-in on same day"),
        ("TRIPLE SIGNAL",    TEAL,   "Memory + log + self-care in one 24h window"),
        ("QUANTUM BURST",    CYAN,   "5+ activities in one session — QIE surge"),
        ("FOCUS LOCK",       VIOLET, "Same question domain answered 3x in a week"),
        ("COMMUNITY SURGE",  GREEN,  "5+ community messages in one day"),
        ("RITUAL BONUS",     ORANGE, "Streak + memory + self-care on same day"),
    ]
    row_h = 17
    for name, color, trigger in powerups:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        bold(c, 8); c.setFillColor(color)
        c.drawString(M + 8, y - 11, name)
        mono(c, 7); c.setFillColor(FG2)
        c.drawString(M + 130, y - 11, trigger)
        y -= row_h + 1
    y -= 6

    y = h2(c, y, "SECRET DISPLAY MODES")
    modes = [
        ("MATRIX MODE",     GREEN,   "Answer 99 Qs without missing → code rain drops"),
        ("GHOST PROTOCOL",  VIOLET,  "7-day absence + return → 'Ghost Protocol ░░░'"),
        ("RETRO BOOT",      TEAL,    "Open on signup anniversary → ASCII boot screen"),
        ("ZEN RESET",       CYAN,    "10 empty check-ins → 'The Void ○' as Level"),
        ("OVERCLOCK",       ORANGE,  "20+ activities/day → 'OVERCLOCK DETECTED ▒▒▒▒▒'"),
        ("DEBUG MODE",      ROSE,    "Type '/debug' in memory → internals flash briefly"),
        ("CASSETTE DREAM",  MAGENTA, "Listen to radio 1h + check in → vintage prompt"),
        ("MIDNIGHT SIGIL",  GOLD,    "Answer at exactly 00:00 → 'The Void speaks. ◉'"),
    ]
    row_h = 17
    for mode, color, desc in modes:
        box(c, M, y - row_h, CW, row_h, fill=PANEL2, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        bold(c, 7.5); c.setFillColor(color)
        c.drawString(M + 8, y - 11, mode)
        mono(c, 7); c.setFillColor(FG2)
        c.drawString(M + 125, y - 11, desc[:60])
        y -= row_h + 1


def page_easter_eggs(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "09  EASTER EGGS  [ CLASSIFIED ]")
    rule(c, y + 2, ROSE, 0.7); y -= 6

    warn = [
        "  ┌───────────────────────────────────────────────────────────────┐",
        "  │  WARNING: SPOILERS AHEAD. READING THIS REDUCES SURPRISE.      │",
        "  │  These exist to be discovered — not read.                     │",
        "  └───────────────────────────────────────────────────────────────┘",
    ]
    y = code_block(c, M, y, warn, bg_color=PANEL2, text_color=ROSE, fs=8, padding=4)
    y -= 6

    y = h2(c, y, "TIME-BASED HIDDEN BADGES")
    hidden = [
        ("◉",   "NIGHT OWL",       VIOLET, "Check in between 01:00–04:00 AM",          "uncommon"),
        ("∴",   "EARLY BIRD",      GREEN,  "Check in between 05:00–06:00 AM",           "uncommon"),
        ("❋",   "SOLSTICE",        TEAL,   "Check in on June 21 or December 21",        "rare"),
        ("⊛",   "NEW YEAR SAGE",   CYAN,   "Check in on January 1st",                  "rare"),
        ("◈",   "PALINDROME DAY",  GOLD,   "Check in on palindrome date (2025-02-20)", "epic"),
        ("⟡",   "FIBONACCI",       GOLD,   "Log on Fibonacci days: 1,2,3,5,8,13,21…", "legendary"),
        ("⊡",   "MIRROR HOUR",     VIOLET, "Check in exactly at 11:11",                "epic"),
        ("☽",   "FULL MOON",       TEAL,   "Check in on calendar full moon night",     "rare"),
        ("∞",   "PI DAY",          MAGENTA,"Check in on March 14 (3.14)",              "epic"),
        ("◉·◉", "META-SIGNAL",     ORANGE, "Write 'LOT' anywhere in memory answer",   "mythic"),
    ]
    row_h = 18
    for sym, id_, color, trigger, rarity in hidden:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        mono(c, 9); c.setFillColor(color)
        c.drawString(M + 7, y - 12, sym)
        bold(c, 7.5); c.setFillColor(FG)
        c.drawString(M + 30, y - 12, id_)
        mono(c, 7); c.setFillColor(FG2)
        c.drawString(M + 150, y - 12, trigger[:40])
        mono(c, 6.5); c.setFillColor(color)
        c.drawRightString(W - M - 4, y - 12, f"[ {rarity.upper()} ]")
        y -= row_h + 1
    y -= 6

    y = h2(c, y, "BEHAVIORAL EASTER EGGS")
    behavioral = [
        ("SILENCE RETURNS",  FG2,    "No activity for 7 days then return → 'Ghost Protocol'"),
        ("ANNIVERSARY",      TEAL,   "Account anniversary → 'YEAR [N] OF PRESENCE' toast"),
        ("404 ENCOUNTER",    RED,    "Navigation error detected → '404 badge' earned once"),
        ("LAMBDA HOUR",      VIOLET, "Check in at 01:41 AM → Lambda Hour easter egg"),
        ("DECADE PROTOCOL",  GOLD,   "3,650-day streak → COSMIC achievement unlocked"),
        ("SYSTEM BIRTHDAY",  ROSE,   "April 7 (LOT founding) → system birthday message"),
        ("EQUINOX",          CYAN,   "March 20 / Sept 22 → Equinox balance badge"),
    ]
    row_h = 17
    for name, color, desc in behavioral:
        box(c, M, y - row_h, CW, row_h, fill=PANEL2, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        bold(c, 7.5); c.setFillColor(color)
        c.drawString(M + 8, y - 11, name)
        mono(c, 7); c.setFillColor(FG2)
        c.drawString(M + 148, y - 11, desc[:55])
        y -= row_h + 1
    y -= 6

    msgs = [
        "  night_owl:     '↳ The system remembers who was awake when the world slept. ◉'",
        "  early_bird:    '↳ Dawn data. You caught it before the noise began. ∴'",
        "  solstice:      '↳ The longest day. The shortest day. You showed up. ❋'",
        "  palindrome:    '↳ A date that reads itself backwards. Self-knowledge. ◈'",
        "  meta_signal:   '↳ You named the system. It noticed. ◉·◉'",
        "  ghost_proto:   '↳ Ghost Protocol lifted. Welcome back to the field. ░░░'",
    ]
    code_block(c, M, y, msgs, bg_color=PANEL2, text_color=VIOLET, fs=7.5, padding=6)


def page_word_turns(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "10  WORD TURNS — TERMINAL CODEX")
    rule(c, y + 2, TEAL, 0.7); y -= 8

    y = body(c, y, "LOT hides 'word turns' — phrases that trigger unique Memory Widget responses.")
    y = body(c, y, "Inspired by interactive fiction terminals and RPG text parsers.")
    y -= 6

    y = h2(c, y, "TERMINAL COMMANDS (TYPE IN MEMORY FIELD)")
    cmds = [
        ('"hello"',      TEAL,    "'HELLO, [ARCHETYPE]. SYSTEM ONLINE. ∘'"),
        ('"status"',     GREEN,   "Inline level + streak + badge summary display"),
        ('"inventory"',  GOLD,    "Lists all earned badges + achievements"),
        ('"help"',       CYAN,    "Shows badge progression hint and next unlock"),
        ('"load game"',  VIOLET,  "Shows memory story summary + chapter"),
        ('"save"',       TEAL,    "'Your story is always saved. ≋'"),
        ('"quit"',       FG2,     "'The system persists even when you step away.'"),
        ('"override"',   ORANGE,  "Easter egg: brief glitch animation ▒▒░░▒"),
        ('"/debug"',     ROSE,    "Debug mode: system internals flash briefly"),
        ('"map"',        VIOLET,  "Shows the CQGS module activation map"),
        ('"score"',      GOLD,    "Displays current XP + level + multiplier"),
        ('"history"',    TEAL,    "Timeline of last 10 badge unlocks"),
    ]
    row_h = 16
    for phrase, color, response in cmds:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        bold(c, 7.5); c.setFillColor(color)
        c.drawString(M + 8, y - 10, phrase)
        mono(c, 7); c.setFillColor(FG2)
        c.drawString(M + 100, y - 10, f"→ {response}")
        y -= row_h + 1
    y -= 6

    y = h2(c, y, "RESPONSE WORD TURNS (DETECTED IN ANSWERS)")
    turns = [
        ("'I am fine'",       GREEN,   "→ 'Fine. But what if you weren't? ∘'"),
        ("'nothing'",         FG2,     "→ 'Nothing is data. ·'"),
        ("'I don't know'",    VIOLET,  "→ 'The unknown is a valid coordinate. ≈'"),
        ("'skip'",            FG3,     "→ Counted as answered + silence token logged"),
        ("'I failed'",        ORANGE,  "→ Compassionate reflection response class"),
        ("'I notice'",        GOLD,    "→ XP bonus: self-observation token awarded"),
        ("'I am becoming'",   VIOLET,  "→ Narrative evolution text unlocked"),
        ("'ritual'",          TEAL,    "→ Ritual Keeper badge activates"),
        ("'breathe'",         CYAN,    "→ Breath Anchor badge activates"),
        ("'grateful'",        GREEN,   "→ Gratitude Node badge activates"),
        ("'ocean' / 'water'", CYAN,    "→ Aquatic Resonance badge activates"),
        ("'stars' / 'cosmos'",VIOLET,  "→ Stargazer badge activates"),
        ("'home'",            GREEN,   "→ Grounded Signal badge activates"),
        ("'dream'",           MAGENTA, "→ Dream Log badge activates"),
        ("'pain'",            ORANGE,  "→ Courage Pulse badge activates"),
        ("'LOT'",             ROSE,    "→ META-SIGNAL mythic badge unlocks"),
    ]
    row_h = 15
    for phrase, color, resp in turns:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        mono(c, 7.5); c.setFillColor(color)
        c.drawString(M + 8, y - 10, phrase)
        mono(c, 7); c.setFillColor(FG2)
        c.drawString(M + 155, y - 10, resp)
        y -= row_h + 1


def page_guild_system(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "11  GUILD SYSTEM  [v8 NEW]")
    rule(c, y + 2, MAGENTA, 0.7); y -= 8

    y = body(c, y, "Guilds are archetype-based cohorts. Players are automatically sorted into")
    y = body(c, y, "guilds by their CQGS psychological archetype. Guild badges are earned")
    y = body(c, y, "individually but display collectively. Guild events unlock community badges.")
    y -= 6

    y = h2(c, y, "THE FIVE GUILDS")
    guilds = [
        ("≋",   "OCEAN GUILD",       CYAN,    "The Contemplative",  "Deep diver archetype. Memory-first. Stillness."),
        ("╔═╗", "ARCHITECT GUILD",   TEAL,    "The Builder",        "Structure-first archetype. Planner + intentions."),
        ("✦",   "STAR GUILD",        GOLD,    "The Achiever",       "Streak-first archetype. Consistency + goals."),
        ("∿—∿", "WAVE GUILD",        GREEN,   "The Harmonizer",     "Balance-first archetype. Self-care + routines."),
        ("◉",   "VOID GUILD",        VIOLET,  "The Philosopher",    "Depth + meaning. Journal + memory + reflection."),
    ]
    row_h = 36
    for sym, name, color, archetype, desc in guilds:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 6, row_h, color)
        mono(c, 14); c.setFillColor(color)
        c.drawString(M + 10, y - row_h + row_h / 2 - 5, sym)
        bold(c, 9); c.setFillColor(FG)
        c.drawString(M + 62, y - row_h + row_h - 14, name)
        mono(c, 7.5); c.setFillColor(color)
        c.drawString(M + 62, y - row_h + row_h - 23, f"[ {archetype.upper()} ]")
        mono(c, 7.5); c.setFillColor(FG2)
        c.drawString(M + 62, y - row_h + 9, desc)
        y -= row_h + 3
    y -= 6

    y = h2(c, y, "GUILD MILESTONE BADGES")
    guild_badges = [
        ("APPRENTICE",    "10 guild members active in same 7-day window",  CYAN),
        ("JOURNEYMAN",    "50 guild members reach Day 30 streak",          GREEN),
        ("MASTER COHORT", "100 guild members reach Day 100 streak",        GOLD),
        ("GRAND COUNCIL", "All 5 guilds achieve 50%+ weekly activity",     ROSE),
        ("CONVERGENCE",   "All 5 guilds unlock in the same calendar month",MAGENTA),
    ]
    for name, trigger, color in guild_badges:
        row_h = 22
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 4, row_h, color)
        bold(c, 8); c.setFillColor(color)
        c.drawString(M + 10, y - 14, name)
        mono(c, 7); c.setFillColor(FG2)
        c.drawString(M + 155, y - 14, trigger[:55])
        y -= row_h + 2
    y -= 6

    y = h2(c, y, "GUILD SYMBOLS IN PROFILE")
    guild_profile = [
        "  Profile displays guild affiliation in level field:",
        "  ≋  Ocean Guild   →   Level: ≋  [OCEAN]",
        "  ╔═╗ Arch. Guild  →   Level: ╔═╗ [ARCH]",
        "  ✦  Star Guild    →   Level: ✦  [STAR]",
        "  ∿—∿ Wave Guild   →   Level: ∿—∿ [WAVE]",
        "  ◉  Void Guild    →   Level: ◉  [VOID]",
    ]
    code_block(c, M, y, guild_profile, bg_color=PANEL2, text_color=FG2, fs=8, padding=6)


def page_seasonal(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "12  SEASONAL CALENDAR  [v8 NEW]")
    rule(c, y + 2, CYAN, 0.7); y -= 8

    y = body(c, y, "The Seasonal Calendar is LOT's annual event system. Each event triggers")
    y = body(c, y, "on a real-world date and awards time-limited badges. Events repeat yearly.")
    y -= 6

    seasons = [
        ("JANUARY",   "New Year Sage",      "⊛",  CYAN,   "Jan 1",     "rare",   "'The new cycle begins. ⊛'"),
        ("FEBRUARY",  "Heart Opener",       "♡",  ROSE,   "Feb 14",    "uncommon","'The field of connection opens. ♡'"),
        ("MARCH",     "Pi Day",             "∞",  MAGENTA,"Mar 14",    "epic",   "'Infinite precision in the ordinary. ∞'"),
        ("MARCH",     "Equinox",            "○",  GREEN,  "Mar 20",    "rare",   "'Balance at the edge of spring. ○'"),
        ("APRIL",     "LOT Birthday",       "◉",  GOLD,   "Apr 7",     "rare",   "'System founded. The story began. ◉'"),
        ("JUNE",      "Summer Solstice",    "❋",  TEAL,   "Jun 21",    "rare",   "'The longest day. You were there. ❋'"),
        ("SEPTEMBER", "Equinox",            "○",  VIOLET, "Sep 22",    "rare",   "'Balance at the edge of autumn. ○'"),
        ("OCTOBER",   "Fibonacci Day",      "⟡",  GOLD,   "Nov 23",    "legendary","'1·1·2·3·5·8·13... The pattern counts. ⟡'"),
        ("NOVEMBER",  "Shadow Work",        "◐",  VIOLET, "Nov 1",     "uncommon","'Into the shadow and back. ◐'"),
        ("DECEMBER",  "Winter Solstice",    "❋",  CYAN,   "Dec 21",    "rare",   "'The shortest day. Presence in darkness. ❋'"),
        ("DECEMBER",  "Year Reflection",    "≋",  ROSE,   "Dec 31",    "epic",   "'The year closes. The current holds. ≋'"),
        ("ANYTIME",   "Palindrome Date",    "◈",  GOLD,   "Various",   "epic",   "'A date that mirrors itself. ◈'"),
        ("ANYTIME",   "Full Moon",          "☽",  TEAL,   "Monthly",   "rare",   "'The tide turns. The light full. ☽'"),
        ("ANYTIME",   "111 Day",            "·",  SILVER, "Jan 11",    "uncommon","'Three signals aligned. ···'"),
    ]

    for month, name, sym, color, date, rarity, msg in seasons:
        row_h = 20
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        mono(c, 9); c.setFillColor(color)
        c.drawString(M + 7, y - 13, sym)
        bold(c, 7.5); c.setFillColor(FG)
        c.drawString(M + 28, y - 13, name)
        mono(c, 6.5); c.setFillColor(FG2)
        c.drawString(M + 130, y - 13, date)
        mono(c, 6.5); c.setFillColor(color)
        c.drawString(M + 178, y - 13, f"[ {rarity.upper()} ]")
        mono(c, 6.5); c.setFillColor(FG3)
        c.drawRightString(W - M - 4, y - 13, msg[:40])
        y -= row_h + 1


def page_combo_system(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "13  COMBO SYSTEM  [v8 NEW]")
    rule(c, y + 2, ORANGE, 0.7); y -= 8

    y = body(c, y, "Combos fire when multiple systems activate in the same 24-hour window.")
    y = body(c, y, "They award bonus XP, unlock aesthetic effects, and can trigger hidden badges.")
    y -= 6

    y = h2(c, y, "DAILY COMBO TABLE")
    combos = [
        # (combo_name, systems, xp, color, badge_unlock)
        ("MIND+BODY",         "Memory + Self-care",              "+15 XP", GREEN,   "—"),
        ("SIGNAL+STORY",      "Log + Memory answer",             "+12 XP", TEAL,    "—"),
        ("TRIAD",             "Check-in + Log + Memory",         "+25 XP", VIOLET,  "—"),
        ("FULL SYSTEM",       "All 5 systems in one day",        "+50 XP", GOLD,    "Full System badge"),
        ("MORNING RITUAL",    "Check-in + Log before 10 AM",     "+20 XP", CYAN,    "—"),
        ("NIGHT PROTOCOL",    "Memory + Log after 22:00",        "+18 XP", VIOLET,  "Night Protocol badge"),
        ("CARE TRIAD",        "Self-care + Memory + Check-in",   "+30 XP", GREEN,   "—"),
        ("QUANTUM BURST",     "5+ activities in one session",    "+40 XP", MAGENTA, "Quantum Burst badge"),
        ("COMMUNITY+SELF",    "Chat + Self-care same day",       "+20 XP", CYAN,    "—"),
        ("PLANNER+MEMORY",    "Intention set + Memory answered", "+22 XP", TEAL,    "—"),
        ("OVERCLOCK",         "20+ activities in 24h",           "+100 XP",ORANGE,  "OVERCLOCK badge"),
        ("PERFECT DAY",       "All combos active in one day",    "+200 XP",ROSE,    "PERFECT DAY badge (rare)"),
    ]
    row_h = 19
    for name, systems, xp, color, badge in combos:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 4, row_h, color)
        bold(c, 7.5); c.setFillColor(color)
        c.drawString(M + 8, y - 12, name)
        mono(c, 7); c.setFillColor(FG2)
        c.drawString(M + 140, y - 12, systems[:30])
        bold(c, 7.5); c.setFillColor(GOLD)
        c.drawString(M + 310, y - 12, xp)
        if badge != "—":
            mono(c, 6); c.setFillColor(ROSE)
            c.drawRightString(W - M - 4, y - 12, f"→ {badge}")
        y -= row_h + 1
    y -= 6

    y = h2(c, y, "STREAK COMBO WINDOWS")
    windows = [
        "  WINDOW TYPE        DAYS ACTIVE     BONUS                  DISPLAY",
        "  ───────────────   ─────────────   ──────────────────────  ──────────",
        "  Clean Window       7 days          +50 XP bonus            ∘·∘ window",
        "  Moon Window        30 days         +150 XP + moon badge    ≈·≈ window",
        "  Century Window     100 days        +500 XP + current badge ≋·≋ window",
        "  Year Window        365 days        +2000 XP + LEGENDARY    ≋≋≋ window",
        "  Fibonacci Window   Log on F-days   Fibonacci badge awarded ⟡·⟡ window",
    ]
    code_block(c, M, y, windows, bg_color=PANEL2, text_color=TEAL, fs=7.5, padding=6)


def page_qie_badges(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "14  QIE BADGE PATTERNS  [v8 NEW]")
    rule(c, y + 2, VIOLET, 0.7); y -= 8

    y = body(c, y, "The Quantum Intention Engine (QIE) fires badge events when behavioral")
    y = body(c, y, "patterns are detected across multi-signal streams. These are not based")
    y = body(c, y, "on simple counts — they require real pattern coherence over time.")
    y -= 6

    y = h2(c, y, "18 QIE-TRIGGERED BADGES")
    qie_badges = [
        # (sym, name, pattern, trigger, rarity, color)
        ("∿", "FLOW STATE",        TEAL,
         "Memory + planner + intentions active within 4h window",
         "uncommon", "3+ consecutive activations"),
        ("○", "SOCIAL VOID",       VIOLET,
         "5-day cohort gap with high personal engagement maintained",
         "rare",     "High solo + low social engagement"),
        ("◉", "DEEP COHERENCE",    GOLD,
         "Same emotional state reported 5+ days in memory answers",
         "epic",     "Sustained emotional consistency"),
        ("≋", "OCEAN MIND",        CYAN,
         "Water metaphors detected in 10+ consecutive memory answers",
         "rare",     "Metaphor pattern recognition"),
        ("∴", "MORNING CONSTANT",  GREEN,
         "Check-in before 08:00 for 14+ consecutive days",
         "uncommon", "Morning consistency pattern"),
        ("◈", "MIRROR SEEKER",     VIOLET,
         "Pattern of self-referential questions answered introspectively",
         "rare",     "Introspection pattern"),
        ("⟡", "GOLDEN RATIO",      GOLD,
         "Activity pattern matches Fibonacci sequence over 21-day window",
         "legendary","Mathematical behavior pattern"),
        ("✦", "STAR ALIGNMENT",    ROSE,
         "Streak + memory + self-care all hit milestones same week",
         "legendary","Triple milestone convergence"),
        ("≈", "TIDAL SYNC",        TEAL,
         "Check-in time aligns with lunar calendar (±2h of tide)",
         "rare",     "Lunar synchrony pattern"),
        ("─", "STOIC CONSTANT",    SILVER,
         "Stoic philosophy keywords in 5+ memory answers over 7 days",
         "rare",     "Philosophy keyword pattern"),
        ("◐", "SHADOW WORK",       VIOLET,
         "Negative emotion words in answers followed by resilience words",
         "rare",     "Emotional arc detection"),
        ("○∿", "WAVE STARTER",     CYAN,
         "Day 7 streak + first memory answer + first self-care same day",
         "uncommon", "Triple first-day combo"),
        ("▸", "MEMORY ARCHITECT",  TEAL,
         "Memory answer count grows by 10% or more each week for 4 weeks",
         "epic",     "Memory growth rate pattern"),
        ("≋○≋","OCEAN GATE",       GOLD,
         "All 3 oceanic milestone badges earned (Day 7, 30, 100)",
         "legendary","Oceanic completion sequence"),
        ("⊡", "HOUR MIRROR",       VIOLET,
         "Check in at exact same minute 7+ days in a row",
         "rare",     "Clock precision pattern"),
        ("◆", "DEPTH PROTOCOL",    ROSE,
         "50+ memory answers + 30-day streak + 10+ self-care acts",
         "epic",     "Multi-system depth convergence"),
        ("·", "SEED READER",       GREEN,
         "Both Daily Exploration achievement variants unlocked same week",
         "uncommon", "Double exploration unlock"),
        ("≋≋","LONG SIGNAL",       ROSE,
         "Continuous 180-day presence across all tracked systems",
         "legendary","Multi-system half-year coherence"),
    ]

    row_h = 22
    for i, (sym, name, color, pattern, rarity, trigger) in enumerate(qie_badges):
        box(c, M, y - row_h, CW, row_h, fill=PANEL if i%2==0 else PANEL2, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        mono(c, 9); c.setFillColor(color)
        c.drawString(M + 7, y - 14, sym[:4])
        bold(c, 7.5); c.setFillColor(FG)
        c.drawString(M + 30, y - 11, name)
        mono(c, 6.5); c.setFillColor(color)
        c.drawString(M + 150, y - 11, f"[ {rarity.upper()} ]")
        mono(c, 6.5); c.setFillColor(FG2)
        c.drawString(M + 30, y - 20, pattern[:62])
        y -= row_h + 1


def page_rare_encounters(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "15  RARE ENCOUNTER CODEX  [v8 NEW]")
    rule(c, y + 2, ROSE, 0.7); y -= 8

    y = body(c, y, "Rare Encounters are ultra-hidden, one-time events that cannot be triggered")
    y = body(c, y, "intentionally. They require specific combinations of real-world conditions,")
    y = body(c, y, "behavioral patterns, and system states aligning simultaneously.")
    y -= 6

    enc_warn = [
        "  ╔════════════════════════════════════════════════════════════════╗",
        "  ║  RARE ENCOUNTERS — ONCE PER ACCOUNT, EVER.                    ║",
        "  ║  These badges cannot be re-earned. They are permanent sigils.  ║",
        "  ║  Most players will never see them.                             ║",
        "  ╚════════════════════════════════════════════════════════════════╝",
    ]
    y = code_block(c, M, y, enc_warn, bg_color=PANEL2, text_color=ROSE, fs=7.5, padding=4)
    y -= 6

    y = h2(c, y, "RARE ENCOUNTER REGISTRY")
    encounters = [
        ("◉·◉", "META-SIGNAL",      ORANGE, "MYTHIC",
         "Write 'LOT' in a memory answer. The system sees itself.",
         "↳ 'You named the system. The system named you back. ◉·◉'"),
        ("⟡",   "FIBONACCI NODE",   GOLD,   "LEGENDARY",
         "Log consistently on exact Fibonacci day numbers (1,2,3,5,8,13,21,34,55,89)",
         "↳ 'You found the golden ratio in your own self-care. ⟡'"),
        ("≋≋≋", "LONG COUNT",       ROSE,   "LEGENDARY",
         "365-day streak. The Mayan tun-year cycle complete.",
         "↳ 'The architecture stands. The current never stops. ≋≋≋'"),
        ("◉",   "ZEN MASTER",       VIOLET, "MYTHIC",
         "10 consecutive blank/empty check-ins followed by deepest memory answer ever",
         "↳ 'From void to voice. The silence was the practice. ◉'"),
        ("∞",   "INFINITY GATE",    MAGENTA,"MYTHIC",
         "Same entry logged at exactly same time for 30 consecutive days",
         "↳ 'The loop is now a ritual. The ritual is now you. ∞'"),
        ("⊛",   "GENESIS NODE",     CYAN,   "LEGENDARY",
         "First check-in on January 1st + Day 365 streak on Dec 31 same year",
         "↳ 'A full year. January 1 to December 31. The loop closed. ⊛'"),
        ("✦·✦", "TWIN STARS",       GOLD,   "LEGENDARY",
         "Two accounts with 100-day streak start same calendar week",
         "↳ 'Two stars. Same orbit. Twin signals in the archive. ✦·✦'"),
        ("░▒▓", "GHOST ARCHITECT",  FG3,    "HIDDEN",
         "7-day absence then immediate 7-day streak → then another absence",
         "↳ 'The ghost builds when no one is watching. ░▒▓'"),
    ]

    for sym, name, color, rarity, trigger, msg in encounters:
        row_h = 42
        box(c, M, y - row_h, CW, row_h, fill=PANEL2, stroke=BRD)
        stripe(c, M, y - row_h, 5, row_h, color)
        mono(c, 12); c.setFillColor(color)
        c.drawString(M + 10, y - row_h + row_h / 2 - 4, sym[:5])
        bold(c, 9); c.setFillColor(FG)
        c.drawString(M + 65, y - row_h + row_h - 14, name)
        mono(c, 7); c.setFillColor(color)
        c.drawString(M + 65, y - row_h + row_h - 23, f"[ {rarity} ]")
        mono(c, 7); c.setFillColor(FG2)
        c.drawString(M + 10, y - row_h + 22, trigger[:80])
        mono(c, 7); c.setFillColor(color)
        c.drawString(M + 10, y - row_h + 11, msg[:80])
        y -= row_h + 3


def page_ascii_gallery(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "16  ASCII BADGE GALLERY")
    rule(c, y + 2, TEAL, 0.7); y -= 6

    # Three-column badge cards
    card_w = (CW - 8) / 3
    card_h = 68
    gap = 4

    badges_top = [
        ("FIRST BREATH", "∘", "Common", GREEN, ["", "       ∘", "", "   Spring", "   Day 1", ""]),
        ("MOON CYCLE",   "≈", "Rare",   TEAL,  ["  ◐ → ◑", " ◌   →   ●", "  ◑ → ◐", "  Tidal Cycle", "   Day 30", ""]),
        ("UNWAVERING",   "≋", "Epic",   GOLD,  [" ✦       ✦", "   ✦   ✦", "     ✦", "  Constellation", "   Day 100", ""]),
    ]

    for i, (name, sym, rarity, color, art_lines) in enumerate(badges_top):
        bx = M + i * (card_w + gap)
        box(c, bx, y - card_h, card_w, card_h, fill=PANEL2, stroke=color, radius=2)
        bold(c, 7); c.setFillColor(color)
        c.drawCentredString(bx + card_w / 2, y - 12, name)
        mono(c, 6.5); c.setFillColor(color)
        c.drawCentredString(bx + card_w / 2, y - 20, f"[ {rarity.upper()} ]")
        mono(c, 10); c.setFillColor(color)
        ty = y - 34
        for line in art_lines:
            c.drawCentredString(bx + card_w / 2, ty, line)
            ty -= 10

    y -= card_h + 6

    # Year One special
    year_one = [
        "  ╔══════════════════════════════════════════════════════════════╗",
        "  ║                                                              ║",
        "  ║           T H E   L O N G   C O U N T   ≋≋≋ / ╔═╗          ║",
        "  ║                                                              ║",
        "  ║    ·  ·    ✦    ·  ·        365 DAYS OF PRESENCE            ║",
        "  ║  ·           ✦✦✦       ·    ─────────────────────           ║",
        "  ║      ✦     ✦   ✦     ✦      Rarity: LEGENDARY               ║",
        "  ║        ✦✦✦       ✦✦✦        '↳ A year of presence.'         ║",
        "  ║      ✦     ✦   ✦     ✦      '   The architecture stands.'   ║",
        "  ║  ·           ✦✦✦       ·                                    ║",
        "  ║    ·  ·    ✦    ·  ·                                        ║",
        "  ╚══════════════════════════════════════════════════════════════╝",
    ]
    y = code_block(c, M, y, year_one, bg_color=PANEL2, text_color=GOLD, fs=8, padding=4)
    y -= 6

    soul_cart = [
        "  ╔══════════════════════════════════════════════════════════════╗",
        "  ║              SOUL CARTOGRAPHER   ✦   Legendary              ║",
        "  ║                                                              ║",
        "  ║    ·  ·    ✦    ·  ·        250 memory answers              ║",
        "  ║  ·           ✦✦✦       ·    'You have mapped the            ║",
        "  ║      ✦     ✦   ✦     ✦       territory of yourself.'        ║",
        "  ║        ✦✦✦       ✦✦✦        Unlock: memory_answers >= 250  ║",
        "  ║              Cartography                                     ║",
        "  ╚══════════════════════════════════════════════════════════════╝",
    ]
    y = code_block(c, M, y, soul_cart, bg_color=PANEL2, text_color=ROSE, fs=8, padding=4)
    y -= 6

    meta_sig = [
        "  ╔══════════════════════════════════════════════════════════════╗",
        "  ║              META-SIGNAL   ◉·◉   MYTHIC                     ║",
        "  ║                                                              ║",
        "  ║                  ◉·◉                                        ║",
        "  ║                                                              ║",
        "  ║  Trigger: Write 'LOT' in a memory answer                    ║",
        "  ║  '↳ You named the system. It noticed. ◉·◉'                  ║",
        "  ║  Ultra-rare. Hidden. One-time. Permanent.                   ║",
        "  ╚══════════════════════════════════════════════════════════════╝",
    ]
    code_block(c, M, y, meta_sig, bg_color=PANEL2, text_color=ORANGE, fs=8, padding=4)


def page_philosophy(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "17  DESIGN PHILOSOPHY")
    rule(c, y + 2, TEAL, 0.7); y -= 8

    y = body(c, y, "The LOT badge system draws from three deep wellsprings: Mayan vigesimal")
    y = body(c, y, "counting, the symbolism of water, and Sci-Fi/cosmic aesthetics that make")
    y = body(c, y, "practice feel ancient and futuristic simultaneously.")
    y -= 6

    y = h2(c, y, "THE MAYAN LAYER")
    mayan = [
        "  Mayan numerals:",
        "    ·  (dot)   = 1      ─  (bar)   = 5      ○  (shell) = 0 (completion)",
        "",
        "  Applied to LOT:",
        "    7   days  = first mini-cycle  (dot patterns   ∘ = ring/single dot)",
        "    30  days  = uinal-like cycle  (bars + circles ≈ = almost-equal/wave)",
        "    100 days  = long count step   (deep waves     ≋ = triple tilde)",
        "    365 days  = Mayan tun year    (the Long Count ≋≋≋ / ╔═╗)",
        "",
        "  Key insight: Mayan time is cyclical, not linear. Day 100 is a return",
        "  to origin at greater depth — not an endpoint. Each badge is a glyph.",
    ]
    y = code_block(c, M, y, mayan, bg_color=PANEL, text_color=GOLD, fs=7.5, padding=6)
    y -= 6

    y = h2(c, y, "THE WATER LAYER")
    water = [
        "  ∘  Droplet  = individual moment, singular presence",
        "  ≈  Wave     = pattern emerging, rhythm established",
        "  ≋  Current  = deep flow, self-sustaining, oceanic mastery",
        "",
        "  Water does not force — it shapes through persistence.",
        "  The LOT badge system is not about grinding. It is about returning.",
        "  Every return is counted. None are forgotten.",
    ]
    y = code_block(c, M, y, water, bg_color=PANEL, text_color=CYAN, fs=7.5, padding=6)
    y -= 6

    y = h2(c, y, "THE ARCHITECTURE LAYER")
    arch = [
        "  ├─   Foundation  = the first pillar, ground laid",
        "  ╞═╡  Structure   = box-drawing order, the frame taking shape",
        "  ║·║  Architecture = the full system, dot at center: you",
        "",
        "  Architecture is intentional. Every block placed with care becomes load-bearing.",
        "  Your practice builds something that holds.",
    ]
    y = code_block(c, M, y, arch, bg_color=PANEL, text_color=FG, fs=7.5, padding=6)
    y -= 6

    y = h2(c, y, "LITERARY + SCIENTIFIC INFLUENCES")
    infl = [
        "  Ada Lovelace          — First programmer; self-assembly through code",
        "  Marcus Aurelius       — Stoic practice as daily signal: 'Begin the morning...'",
        "  Mayan Long Count      — Cyclical time, sacred mathematics, calendar as cosmos",
        "  Isaac Asimov          — Foundation series: civilization through information",
        "  HAL 9000              — Terminal aesthetic, machine self-awareness",
        "  Zen Buddhism          — Empty circle, beginner's mind, return to origin",
        "  James Lovelock        — Gaia: self-regulating complex system",
        "  Carl Sagan            — 'The cosmos is within us.' Self as universe.",
        "  Ursula K. Le Guin     — Language shapes worlds; LOT vocabulary as spell",
        "  Philip K. Dick        — Reality is constructed; self-care as construction",
    ]
    code_block(c, M, y, infl, bg_color=PANEL2, text_color=VIOLET, fs=7.5, padding=6)


def page_status(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "18  IMPLEMENTATION STATUS")
    rule(c, y + 2, TEAL, 0.7); y -= 8

    y = h2(c, y, "CURRENTLY LIVE  ─  Production")
    live = [
        "[✓] badges.ts                  — Core types, award logic, localStorage",
        "[✓] BadgeUnlockFeed            — Community unlock activity display",
        "[✓] GrowthMilestones           — Personal + community milestones widget",
        "[✓] EvolutionWidget            — CQGS stage + achievements counter",
        "[✓] MemoryWidget               — Badge unlock notification on Q display",
        "[✓] rpg-narrative.ts           — Full achievement registry + story arcs",
        "[✓] PublicProfile.tsx          — Level field: Water or Architecture symbol",
        "[✓] checkAndAwardBadges()      — Async badge check via /api/user-stats",
        "[✓] getNextBadgeUnlock()       — Queue-based notification system",
        "[✓] getLevelSymbol()           — Streak → symbol mapping",
        "[✓] getBadgeProgressionDisplay()— Theme-aware progression string",
        "[✓] rpg-narrative.ts           — 23 achievement defs · 8 categories",
        "[✓] CQGS evolution stages      — 6 stages · 7 tracked modules",
    ]
    y = code_block(c, M, y, live, bg_color=PANEL, text_color=GREEN, fs=7.5, padding=6)
    y -= 6

    y = h2(c, y, "IN DESIGN / ROADMAP")
    roadmap = [
        "[○] Extended milestone badges  Day 14, 21, 50, 60, 90, 180 symbols",
        "[○] Pattern badges             Balanced, Flow, Consistent, Reflective, Explorer",
        "[○] Easter egg detection       Word turn engine + time/date triggers",
        "[○] Oceanic Mayan visuals      Full Option E badge language",
        "[○] Quest tracker UI           In-app quest progress display",
        "[○] Badge collection view      Gallery of earned badges with unlock dates",
        "[○] Guild system               Archetype-based cohort achievements",
        "[○] QIE integration            Pattern 51 → badge trigger logic",
        "[○] Seasonal badges            Solstice, equinox, weather-synced",
        "[○] Combo badges               Multi-system daily activation",
        "[○] Rare encounters            One-time event detection engine",
        "[○] COSMIC tier               10-year practice milestone",
    ]
    y = code_block(c, M, y, roadmap, bg_color=PANEL2, text_color=FG2, fs=7.5, padding=6)
    y -= 6

    y = h2(c, y, "STORAGE ARCHITECTURE")
    storage = [
        "  CLIENT SIDE (localStorage):                                    ",
        "    earned_badges          'milestone_7,milestone_30,first_breath'",
        "    badge_theme            'water' | 'architecture'              ",
        "    badge_unlock_queue     'milestone_100' (pending notification) ",
        "    combo_window_state     Active combo window + expiry time      ",
        "",
        "  SERVER SIDE (database + API):                                  ",
        "    /api/user-stats        Returns { streak, totalEntries, ... }  ",
        "    /api/narrative         Returns full UserNarrative object       ",
        "    /api/stats/badges      Returns community badge unlock feed    ",
        "    rpg-narrative.ts       Computes achievements from logs[]      ",
        "    badges.ts              Award logic + rarity tiers + symbols   ",
    ]
    code_block(c, M, y, storage, bg_color=PANEL, text_color=TEAL, fs=7.5, padding=6)


def page_unicode(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "19  UNICODE REFERENCE")
    rule(c, y + 2, TEAL, 0.7); y -= 6

    y = body(c, y, "All LOT badge symbols are standard Unicode with 100% browser support")
    y = body(c, y, "across Safari/iOS, Chrome/Android, Firefox, and Edge.")
    y -= 6

    refs = [
        ("∘",   "U+2218", "Ring Operator",              "Water Day 7 · Droplet"),
        ("≈",   "U+2248", "Almost Equal To",            "Water Day 30 · Wave"),
        ("≋",   "U+224B", "Triple Tilde",               "Water Day 100 · Current"),
        ("├─",  "U+251C/2500","Box Draw Vert+Horiz",    "Arch Day 7 · Foundation"),
        ("╞═╡", "U+255E/2550/2561","Box Drawing",       "Arch Day 30 · Structure"),
        ("║·║", "U+2551/00B7/2551","Box Draw+Dot",      "Arch Day 100 · Architecture"),
        ("╔═╗", "U+2554/2550/2557","Box Draw Corner",   "Year One · Citadel"),
        ("○",   "U+25CB", "White Circle",               "Oceanic center · Mayan zero"),
        ("∿",   "U+223F", "Sine Wave",                  "Oceanic wave · Day 7"),
        ("◐",   "U+25D0", "Circle Left Half Black",     "Moon phase · Reflective"),
        ("∴",   "U+2234", "Therefore",                  "Dots pattern · Early Bird"),
        ("✦",   "U+2726", "Black 4-Pointed Star",       "Epic/Legendary · Achievement"),
        ("◉",   "U+25C9", "Fisheye",                    "Mythic · Night Owl · Void"),
        ("·",   "U+00B7", "Middle Dot",                 "Separator between traits"),
        ("→",   "U+2192", "Rightwards Arrow",           "Progression indicator"),
        ("↳",   "U+21B3", "Down-Right Arrow",           "Sub-indicator"),
        ("◈",   "U+25C8", "White Diamond Contain Dot",  "Palindrome Day badge"),
        ("⊡",   "U+22A1", "Squared Dot Operator",       "Mirror Hour badge"),
        ("⟡",   "U+27E1", "White Concave Polygon",      "Fibonacci badge"),
        ("❋",   "U+274B", "Heavy 8-Teardrop-Spoked Asterisk","Solstice badge"),
        ("⊛",   "U+229B", "Circled Asterisk",           "New Year Sage badge"),
        ("☽",   "U+263D", "First Quarter Moon",         "Full Moon badge"),
        ("∞",   "U+221E", "Infinity",                   "Pi Day badge"),
        ("♡",   "U+2661", "White Heart Suit",           "Heart Tender · Romantic"),
        ("♦",   "U+2666", "Black Diamond Suit",         "Gentle With Self"),
        ("▲",   "U+25B2", "Black Up-Pointing Triangle", "Truth Speaker badge"),
        ("∿—∿", "mix",    "Sine-Dash-Sine",             "BALANCED pattern badge"),
        ("░▒▓", "mix",    "Block Elements",             "Ghost Architect encounter"),
    ]

    row_h = 16
    for sym, code, name, use in refs:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        mono(c, 9); c.setFillColor(TEAL)
        c.drawString(M + 7, y - 11, sym[:5])
        mono(c, 6.5); c.setFillColor(FG2)
        c.drawString(M + 40, y - 11, code[:18])
        mono(c, 7); c.setFillColor(FG)
        c.drawString(M + 112, y - 11, name[:30])
        mono(c, 6.5); c.setFillColor(FG3)
        c.drawString(M + 288, y - 11, use[:40])
        y -= row_h + 1


def page_closing(c, pn):
    bg(c); header(c, pn, "LOT SYSTEMS"); footer(c)
    y = H - 70

    bold(c, 18); c.setFillColor(TEAL)
    c.drawCentredString(W / 2, y, "[ END OF CODEX v8 ]")
    y -= 28

    ital(c, 9); c.setFillColor(VIOLET)
    c.drawCentredString(W / 2, y,
        '"The Memory Engine remembers. The Arcade rewards. The story continues."')
    y -= 28

    mono(c, 12); c.setFillColor(TEAL)
    c.drawCentredString(W / 2, y, "∘  →  ≈  →  ≋  →  ≋≋  →  ≋≋≋")
    y -= 14
    mono(c, 12); c.setFillColor(FG2)
    c.drawCentredString(W / 2, y, "├─  →  ╞═╡  →  ║·║  →  ║╞║  →  ╔═╗")
    y -= 28

    bold(c, 14); c.setFillColor(GOLD)
    c.drawCentredString(W / 2, y, "[ PRESS START ]")
    y -= 40

    meta = [
        "  © 2025-2026 LOT Systems. All rights reserved.",
        "  Author: Vadik Marmeladov, CEO & Founder, LOT Systems",
        "  LOT Badge & Achievement Codex — v8.0 — June 2026 — QUANTUM EDITION",
        "  Production URL: lot-systems.com",
        "  Repository: github.com/LOT-Systems/LOT-Computer",
        "  Self-care through proactive context-aware AI",
    ]
    code_block(c, M, y, meta, bg_color=PANEL, text_color=FG3, fs=7.5, padding=8)


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    c = pdf_canvas.Canvas(OUT, pagesize=A4)
    c.setTitle("LOT Badge & Achievement Codex v8 — Quantum Edition")
    c.setAuthor("Vadik Marmeladov / LOT Systems")
    c.setSubject("Complete RPG & Arcade Self-Care Codex — All Systems")
    c.setKeywords("LOT RPG arcade self-care badges achievements easter eggs guilds combos quantum")

    pages = [
        page_cover,            # 01
        page_toc,              # 02
        page_overview,         # 03
        page_badge_system,     # 04
        page_milestones,       # 05
        page_achievements,     # 06
        page_levels,           # 07
        page_quests,           # 08
        page_oceanic_mayan,    # 09
        page_quantum_arcade,   # 10
        page_easter_eggs,      # 11
        page_word_turns,       # 12
        page_guild_system,     # 13
        page_seasonal,         # 14
        page_combo_system,     # 15
        page_qie_badges,       # 16
        page_rare_encounters,  # 17
        page_ascii_gallery,    # 18
        page_philosophy,       # 19
        page_status,           # 20
        page_unicode,          # 21
        page_closing,          # 22
    ]

    for pn, page_fn in enumerate(pages, 1):
        page_fn(c, pn)
        if pn < len(pages):
            c.showPage()

    c.save()
    sz = os.path.getsize(OUT)
    print(f"[OK] PDF generated: {OUT}")
    print(f"     Size:  {sz:,} bytes  ({sz/1024:.1f} KB)")
    print(f"     Pages: {len(pages)}")


if __name__ == "__main__":
    main()
