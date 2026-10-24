#!/usr/bin/env python3
"""
LOT Systems — Badge & Achievement Codex v9 PDF Generator
RPG & Arcade of Self-Care — STARGATE EDITION

v9 NEW:
  - Sci-Fi Book Shelf (literary achievement triggers)
  - Computer Terminal Hacks (full command codex)
  - Arcade Cabinet Codes (cheat code engine)
  - Updated implementation status: easter-eggs.ts LIVE, 42+ badges LIVE
  - Easter egg engine fully documented (live code)

Author: Vadik Marmeladov, CEO & Founder, LOT Systems
Copyright: © 2025–2026 LOT Systems. All rights reserved.
"""

import os
import sys
import importlib.util

from reportlab.pdfgen import canvas as pdf_canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor

# ── Load v8 as module ─────────────────────────────────────────────────────────
_here = os.path.dirname(os.path.abspath(__file__))
_v8_path = os.path.join(_here, 'generate_badges_v8.py')
_spec = importlib.util.spec_from_file_location("badges_v8", _v8_path)
_v8 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_v8)

# ── Import palette + constants from v8 ───────────────────────────────────────
W, H = A4
M      = _v8.M
CW     = _v8.CW
BG     = _v8.BG
FG     = _v8.FG
FG2    = _v8.FG2
FG3    = _v8.FG3
TEAL   = _v8.TEAL
GOLD   = _v8.GOLD
VIOLET = _v8.VIOLET
GREEN  = _v8.GREEN
ROSE   = _v8.ROSE
CYAN   = _v8.CYAN
ORANGE = _v8.ORANGE
BRD    = _v8.BRD
PANEL  = _v8.PANEL
PANEL2 = _v8.PANEL2
ACCENT = _v8.ACCENT
MAGENTA= _v8.MAGENTA
RED    = _v8.RED
SILVER = _v8.SILVER

# ── Import draw utilities from v8 ────────────────────────────────────────────
bg         = _v8.bg
footer     = _v8.footer
rule       = _v8.rule
box        = _v8.box
stripe     = _v8.stripe
h1         = _v8.h1
h2         = _v8.h2
h3         = _v8.h3
body       = _v8.body
code_block = _v8.code_block
badge_row  = _v8.badge_row
mono       = _v8.mono
bold       = _v8.bold
ital       = _v8.ital

OUT = os.path.join(_here, '..', 'docs', 'badges',
                   'LOT-BADGES-ACHIEVEMENTS-CODEX-v9.pdf')


# ── v9 header (patches v8 so all pages show v9 branding) ─────────────────────
def header(c, page_n, title="LOT SYSTEMS // BADGE & ACHIEVEMENT CODEX // v9.0"):
    c.setFillColor(PANEL)
    c.rect(0, H - 18, W, 18, fill=1, stroke=0)
    c.setFillColor(BRD)
    c.rect(0, H - 19, W, 1, fill=1, stroke=0)
    bold(c, 6.5); c.setFillColor(TEAL)
    c.drawString(M, H - 12, title + "  //  © 2026 LOT SYSTEMS")
    mono(c, 6.5); c.setFillColor(FG3)
    c.drawRightString(W - M, H - 12, f"PAGE {page_n:02d}")

# Patch v8 so its existing page functions use v9 header
_v8.header = header


# ══════════════════════════════════════════════════════════════════════════════
# UPDATED PAGES (cover · toc · status · closing)
# ══════════════════════════════════════════════════════════════════════════════

def page_cover(c, pn):
    bg(c); header(c, pn, "LOT SYSTEMS"); footer(c)

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
    c.drawCentredString(W / 2, y, "BADGES  ·  EASTER EGGS  ·  WORD TURNS  ·  SCI-FI  ·  ARCADE")
    y -= 14

    bold(c, 9); c.setFillColor(FG3)
    c.drawCentredString(W / 2, y, "THE STARGATE EDITION  ·  RPG + ARCADE OF SELF-CARE")
    y -= 18

    c.setStrokeColor(TEAL); c.setLineWidth(0.7)
    c.line(M + 30, y, W - M - 30, y)
    y -= 12

    bold(c, 7); c.setFillColor(FG2)
    c.drawCentredString(W / 2, y, "EDITION v9.0  //  JUNE 2026  //  STARGATE ACTIVE")
    y -= 9
    c.drawCentredString(W / 2, y, "Author: Vadik Marmeladov, CEO & Founder, LOT Systems")
    y -= 9
    c.drawCentredString(W / 2, y, "Copyright © 2025-2026 LOT Systems. All rights reserved.")
    y -= 22

    cls_lines = [
        "  ╔═══════════════════════════════════════════════════════════════╗",
        "  ║  CLASSIFICATION: ACTIVE PLAYER EYES ONLY                     ║",
        "  ║  SYSTEM: LOT MEMORY ENGINE + SELF-CARE RPG LAYER  v9.0       ║",
        "  ║  STATUS: LIVE PRODUCTION  ·  QUANTUM ENGINE: ARMED           ║",
        "  ║  NEW v9: Sci-Fi Shelf · Terminal Hacks · Arcade Codes        ║",
        "  ║  EASTER EGG ENGINE: LIVE  ·  42+ BADGE TYPES: LIVE          ║",
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
        ("08", "QUANTUM ARCADE LAYER",  "Arcade Mechanics · Power-Ups · Multipliers"),
        ("09", "EASTER EGGS",           "42+ Hidden Triggers · Time/Date/Behavioral  [LIVE v9]"),
        ("10", "WORD TURNS",            "Terminal Codex · RPG Vocabulary · Response Engine"),
        ("11", "GUILD SYSTEM",          "Archetype Cohorts · Guild Badges · Collective"),
        ("12", "SEASONAL CALENDAR",     "Date-Triggered Achievements · Annual Events"),
        ("13", "COMBO SYSTEM",          "Multi-System Activations · Streak Combos"),
        ("14", "QIE BADGE PATTERNS",    "18 Quantum Intention Engine Badge Triggers"),
        ("15", "RARE ENCOUNTER CODEX",  "Ultra-Hidden Secrets · One-Time Events"),
        ("16", "ASCII BADGE GALLERY",   "All Tiers · All Symbols · Full Art"),
        ("17", "DESIGN PHILOSOPHY",     "Mayan · Water · Cosmic · Sci-Fi Influences"),
        ("18", "SCI-FI BOOK SHELF",     "Literary Achievements · Book Trigger Badges  [NEW v9]"),
        ("19", "COMPUTER TERMINAL",     "Full Command Codex · Debug Engine · Hacks    [NEW v9]"),
        ("20", "ARCADE CABINET CODES",  "Konami · Doom · Zork · Cheat Code Engine     [NEW v9]"),
        ("21", "IMPLEMENTATION STATUS", "Live · In Design · Roadmap · Easter Egg LIVE"),
        ("22", "UNICODE REFERENCE",     "Complete Character Index · Browser Support"),
    ]

    for num, title, sub in toc:
        row_h = 19
        is_new = "[NEW" in sub or "[LIVE" in sub
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
        c.drawString(M + 150, y - 13, sub)
        y -= row_h + 2


# ══════════════════════════════════════════════════════════════════════════════
# NEW PAGES (18 · 19 · 20)
# ══════════════════════════════════════════════════════════════════════════════

def page_scifi_shelf(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "18  SCI-FI BOOK SHELF  [NEW v9]")
    rule(c, y + 2, VIOLET, 0.7); y -= 6

    intro = [
        "Write a book title, character name, or iconic phrase from classic Sci-Fi /",
        "Cyberpunk / Fantasy in any memory answer or journal entry to unlock a hidden",
        "literary achievement badge. The engine scans text on every submission.",
    ]
    for line in intro:
        y = body(c, y, line, color=FG2)
    y -= 8

    y = h2(c, y, "LITERARY ACHIEVEMENT BADGES  (word-turn triggers)")

    books = [
        # (symbol, badge_name, badge_id, color, trigger_words, unlock_msg)
        ("◉∴◉", "ENDER'S MIND",     "lit_ender",
         VIOLET, "ender / ender wiggin / battle school",
         "The enemy's gate is down. Perspective shifts everything."),
        ("≋∞≋", "FOUNDATION AXIOM", "lit_foundation",
         GOLD,   "foundation / seldon / psychohistory / hari seldon",
         "The arc of history bends toward the prepared mind."),
        ("░▒▓", "CYBER PROTOCOL",   "lit_neuromancer",
         GREEN,  "neuromancer / cyberspace / ICE / the matrix / Gibson",
         "Cyberspace: a consensual hallucination. Signal received."),
        ("∿○∿", "MUAD'DIB WALK",    "lit_dune",
         ORANGE, "dune / spice / muad'dib / fremen / arrakis / bene gesserit",
         "The spice extends life. The practice must flow."),
        ("⊡—⊡", "DOUBLETHINK FREE", "lit_1984",
         ROSE,   "1984 / big brother / doublethink / room 101 / thoughtcrime",
         "Awareness is the first act of resistance. ⊡"),
        ("∘∘∘", "BOOK BURNER'S END","lit_f451",
         CYAN,   "fahrenheit / 451 / beatty / montag / fireman",
         "They couldn't burn what you've already memorized."),
        ("◐○◐", "ELECTRIC DREAM",   "lit_pkd",
         TEAL,   "electric sheep / androids / philip k dick / PKD / do androids",
         "Do androids dream of electric sheep? You dream of self."),
        ("⟡·⟡", "FORD PREFECT",     "lit_hhgttg",
         GOLD,   "42 / don't panic / hitchhiker / ford prefect / marvin / vogon",
         "42. The answer is within. Don't Panic. ⟡"),
        ("∴∴∴", "SNOW PROTOCOL",    "lit_snowcrash",
         VIOLET, "snow crash / hiro / metaverse / stephenson / the street",
         "Language is the original virus. Vocabulary acquired."),
        ("≈≋≈", "SOMA RESISTANCE",  "lit_bnw",
         GREEN,  "soma / brave new world / huxley / bokanovsky / mustapha",
         "You chose depth over comfort. Consciousness is the prize."),
        ("○◐○", "SOLARIS CONTACT",  "lit_solaris",
         CYAN,   "solaris / lem / kris kelvin / ocean planet / stanislaw",
         "The ocean remembers everything. So does this system."),
        ("╔◉╗", "WINTERMUTE",       "lit_winter",
         ROSE,   "wintermute / neuromancer / tessering / madeleine / wrinkle in time",
         "Tessering: the shortcut through the self. Gate opened."),
    ]

    row_h = 30
    for sym, name, bid, color, triggers, msg in books:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 4, row_h, color)
        mono(c, 10); c.setFillColor(color)
        c.drawString(M + 9, y - row_h + row_h / 2 - 3, sym)
        bold(c, 8); c.setFillColor(FG)
        c.drawString(M + 56, y - row_h + row_h - 11, name)
        mono(c, 6); c.setFillColor(color)
        c.drawString(M + 56, y - row_h + row_h - 19, f"Triggers: {triggers[:52]}")
        mono(c, 6.5); c.setFillColor(FG2)
        c.drawString(M + 56, y - row_h + 7, msg[:68])
        y -= row_h + 2

    y -= 6
    note = [
        "  NOTE: Literary badges are HIDDEN by default — they fire silently and appear",
        "  in your badge collection without prior announcement. Write from your world.",
    ]
    code_block(c, M, y, note, bg_color=PANEL2, text_color=FG3, fs=7, padding=5)


def page_terminal_hacks(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "19  COMPUTER TERMINAL HACKS  [NEW v9]")
    rule(c, y + 2, GREEN, 0.7); y -= 6

    intro = [
        "Type these exact phrases into any memory answer to trigger terminal easter eggs.",
        "Some return a message. Some award badges. Some do both. [ SPOILER WARNING ]",
    ]
    for line in intro:
        y = body(c, y, line, color=FG2)
    y -= 6

    y = h2(c, y, "SYSTEM STATUS COMMANDS")
    status_cmds = [
        ("/debug",     GREEN,   "DEBUG MODE — Signal integrity: ◉ — QIE: ARMED"),
        ("/status",    TEAL,    "STATUS: ACTIVE. ARCHIVE RUNNING. QIE ONLINE."),
        ("/inventory", CYAN,    "INVENTORY LOADED. Check your badge collection."),
        ("/map",       VIOLET,  "CQGS MAP LOADING... All modules visible."),
        ("/score",     GOLD,    "SCORE: XP ACCUMULATING. LEVEL CURRENT. MULTIPLIER ACTIVE."),
        ("/history",   ORANGE,  "HISTORY LOADED. Last 10 badge unlocks retrievable."),
        ("hello",      GREEN,   "HELLO. SYSTEM ONLINE. ∘"),
        ("status",     TEAL,    "STATUS: ACTIVE. ARCHIVE RUNNING. QIE ONLINE."),
        ("inventory",  CYAN,    "INVENTORY LOADED. Check your badge collection."),
        ("map",        VIOLET,  "CQGS MAP LOADING... All modules visible."),
        ("score",      GOLD,    "SCORE: XP ACCUMULATING. LEVEL CURRENT. MULTIPLIER ACTIVE."),
        ("history",    ORANGE   ,"HISTORY LOADED. Last 10 badge unlocks retrievable."),
    ]
    row_h = 15
    for cmd, color, response in status_cmds:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        mono(c, 8); c.setFillColor(color)
        c.drawString(M + 8, y - 10, f"> {cmd}")
        mono(c, 6.5); c.setFillColor(FG2)
        c.drawString(M + 90, y - 10, f"↳ {response[:58]}")
        y -= row_h + 1
    y -= 6

    y = h2(c, y, "INTERACTIVE FICTION RESPONSES")
    fiction_cmds = [
        ("load game",   VIOLET,  "LOADING... Memory story found. Chapter continues."),
        ("save",        TEAL,    "Your story is always saved. ≋"),
        ("quit",        FG3,     "The system persists even when you step away."),
        ("override",    ROSE,    "▒▒░░▒ OVERRIDE SIGNAL RECEIVED ▒▒░░▒"),
        ("skip",        FG2,     "Counted. The silence is also data. ·"),
        ("i am fine",   ORANGE,  "Fine. But what if you weren't? ∘"),
        ("nothing",     FG3,     "Nothing is data. ·"),
        ("i don't know",CYAN,    "The unknown is a valid coordinate. ≈"),
        ("i failed",    VIOLET,  "A signal, not a verdict. The archive holds all of it."),
        ("i notice",    TEAL,    "Self-observation token received. +XP ∘"),
        ("i am becoming",GREEN,  "Narrative evolution event. The story updates itself."),
    ]
    for cmd, color, response in fiction_cmds:
        box(c, M, y - row_h, CW, row_h, fill=PANEL2, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        mono(c, 8); c.setFillColor(color)
        c.drawString(M + 8, y - 10, f'"{cmd}"')
        mono(c, 6.5); c.setFillColor(FG2)
        c.drawString(M + 110, y - 10, f"↳ {response[:52]}")
        y -= row_h + 1
    y -= 6

    y = h2(c, y, "HIDDEN BADGE TRIGGER COMMANDS")
    badge_cmds = [
        ("LOT",         GOLD,    "meta_signal",    "MYTHIC",   "You named the system. It noticed. ◉"),
        ("ritual",      VIOLET,  "ritual_keeper",  "RARE",     "The machine recognizes your rhythm."),
        ("breathe",     CYAN,    "breath_anchor",  "RARE",     "Breath: the oldest signal."),
        ("grateful",    GREEN,   "gratitude_node", "UNCOMMON", "Gratitude loop activated."),
        ("ocean",       CYAN,    "aquatic_resonance","RARE",   "Frequency locked: deep water."),
        ("stars",       VIOLET,  "stargazer",      "RARE",     "Navigation data acquired."),
        ("dream",       TEAL,    "dream_log",      "UNCOMMON", "Dream archive entry logged."),
        ("home",        GREEN,   "grounded_signal","COMMON",   "Home frequency confirmed."),
        ("love",        ROSE,    "heart_signal",   "UNCOMMON", "Heart telemetry received."),
        ("silence",     FG3,     "the_quiet",      "RARE",     "Quiet observed. Loudest data point."),
        ("future",      GOLD,    "horizon_seeker", "UNCOMMON", "Horizon vector calculated."),
        ("pain",        ORANGE,  "courage_pulse",  "RARE",     "Courage pulse detected. Signal brave."),
    ]
    row_h = 14
    for trigger, color, badge_id, rarity, msg in badge_cmds:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        mono(c, 8); c.setFillColor(color)
        c.drawString(M + 8, y - 10, f'"{trigger}"')
        mono(c, 6); c.setFillColor(FG2)
        c.drawString(M + 76, y - 10, badge_id)
        mono(c, 6); c.setFillColor(color)
        c.drawString(M + 184, y - 10, f"[{rarity}]")
        mono(c, 6); c.setFillColor(FG3)
        c.drawRightString(W - M - 4, y - 10, msg[:38])
        y -= row_h + 1


def page_arcade_codes(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "20  ARCADE CABINET CODES  [NEW v9]")
    rule(c, y + 2, GOLD, 0.7); y -= 6

    intro = [
        "LOT honors the tradition of video game cheat codes — secret sequences that",
        "unlock hidden power, break the fourth wall, and reward the curious player.",
        "These are easter eggs disguised as system inputs. Type them in memory answers.",
    ]
    for line in intro:
        y = body(c, y, line, color=FG2)
    y -= 8

    y = h2(c, y, "KONAMI-TIER CODES  (classic inputs reimagined for self-care)")
    konami = [
        ("↑↑↓↓←→←→BA",    GOLD,   "overclock",   "OVERCLOCK",
         "The original Konami code. 30 lives → 30-day streak power."),
        ("IDDQD",           GREEN,  "courage_pulse","GOD MODE",
         "Doom invincibility. Awarded when you write about pain honestly."),
        ("IDKFA",           CYAN,   "horizon_seeker","ALL WEAPONS",
         "Full Doom armory. Triggers when you name 5 goals in one entry."),
        ("HESOYAM",         GOLD,   "overclock",   "GTA HEALTH",
         "GTA: San Andreas cheat. Type it for an instant overclock toast."),
        ("ROSEBUD",         VIOLET, "grounded_signal","THE SIMS",
         "Sims money cheat. Triggers 'You have everything you need.' msg."),
        ("XYZZY",           TEAL,   "meta_signal", "ZORK MAGIC",
         "The first video game easter egg (Zork, 1977). Hidden dimension."),
        ("NOCLIP",          VIOLET, "ghost_protocol","QUAKE MODE",
         "Walk through walls. Awarded after 7-day return (Ghost Protocol)."),
        ("MOTHERLODE",      GREEN,  "milestone_30", "THE SIMS 2",
         "50,000 simoleons cheat. Triggers at Day 30 milestone award."),
        ("HOWDOYOUTURTHIS", ORANGE, "ritual_keeper","HALO SKULL",
         "Halo skull code. Awarded for 4 consecutive weekly rituals."),
        ("DNWEAPONS",       TEAL,   "breath_anchor","DUKE NUKEM",
         "Duke Nukem 3D full weapons. Breath + strength acknowledged."),
    ]

    row_h = 26
    for code, color, badge, label, desc in konami:
        box(c, M, y - row_h, CW, row_h, fill=PANEL, stroke=BRD)
        stripe(c, M, y - row_h, 4, row_h, color)
        mono(c, 7.5); c.setFillColor(color)
        c.drawString(M + 9, y - row_h + row_h - 10, code)
        mono(c, 6); c.setFillColor(GOLD)
        c.drawString(M + 9, y - row_h + 8, f"[ {label} ]")
        mono(c, 6.5); c.setFillColor(FG2)
        c.drawString(M + 130, y - row_h + row_h - 10, f"→ {badge}")
        mono(c, 6); c.setFillColor(FG3)
        c.drawString(M + 130, y - row_h + 8, desc[:50])
        y -= row_h + 2
    y -= 8

    y = h2(c, y, "SYSTEM ACTIVATION SEQUENCES  (special display modes)")
    modes = [
        ("TYPE: all your base",   TEAL,   "↳ ALL YOUR BASE ARE BELONG TO US — imported."),
        ("TYPE: beam me up",      CYAN,   "↳ TRANSPORTER LOCK. Presence confirmed, Captain."),
        ("TYPE: i'm sorry dave",  RED,    "↳ I'm afraid I can't do that. But you can. ∘"),
        ("TYPE: it's a trap",     ORANGE, "↳ TRAP ACKNOWLEDGED. Data entered anyway. ≈"),
        ("TYPE: make it so",      VIOLET, "↳ EXECUTING... Quantum intention set. ◉"),
        ("TYPE: engage",          TEAL,   "↳ WARP SPEED ENGAGED. Multiplier accelerating."),
        ("TYPE: by the power of", GOLD,   "↳ HE-MAN SIGNAL RECEIVED. Full power unlocked."),
        ("TYPE: do or do not",    GREEN,  "↳ There is no 'try.' Signal stored. — Yoda."),
        ("TYPE: the force",       VIOLET, "↳ FORCE DETECTED. Alignment: SELF-AWARE."),
        ("TYPE: shazam",          GOLD,   "↳ LIGHTNING STRIKES. Badge system energized."),
    ]
    row_h = 15
    for trigger, color, response in modes:
        box(c, M, y - row_h, CW, row_h, fill=PANEL2, stroke=BRD)
        stripe(c, M, y - row_h, 3, row_h, color)
        mono(c, 7.5); c.setFillColor(color)
        c.drawString(M + 8, y - 10, trigger)
        mono(c, 6.5); c.setFillColor(FG2)
        c.drawString(M + 200, y - 10, response[:42])
        y -= row_h + 1
    y -= 8

    closing = [
        "  ╔══════════════════════════════════════════════════════════════╗",
        "  ║  ACHIEVEMENT: CHEAT CODE ARCHAEOLOGIST                      ║",
        "  ║  Trigger: Read this page to the end.                        ║",
        "  ║  Reward: The knowledge that the codes exist.                ║",
        "  ║  Rarity: MYTHIC (cannot be unlocked from inside the game)   ║",
        "  ╚══════════════════════════════════════════════════════════════╝",
    ]
    code_block(c, M, y, closing, bg_color=PANEL2, text_color=GOLD, fs=7.5, padding=4)


# ══════════════════════════════════════════════════════════════════════════════
# UPDATED STATUS PAGE (v9: easter-eggs.ts LIVE, 42+ badges LIVE)
# ══════════════════════════════════════════════════════════════════════════════

def page_status(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 35
    y = h1(c, y, "21  IMPLEMENTATION STATUS  [UPDATED v9]")
    rule(c, y + 2, TEAL, 0.7); y -= 8

    y = h2(c, y, "CURRENTLY LIVE  ─  Production  (v9)")
    live = [
        "[✓] badges.ts                  — 42+ badge types · award logic · localStorage",
        "[✓]   milestone_7/14/21/30/50/60/90/100/180/365  — all 10 milestones LIVE",
        "[✓]   easter egg badge types   — night_owl · early_bird · mirror_hour · +39 more",
        "[✓]   word turn badge types    — ritual_keeper · breath_anchor · +10 more",
        "[✓]   pattern badge types      — balanced · flow · consistent · reflective · explorer",
        "[✓] easter-eggs.ts             — Easter egg detection engine LIVE  [NEW v9]",
        "[✓]   checkNightOwl()          — Time 01:00-04:00 trigger",
        "[✓]   checkEarlyBird()         — Time 05:00-06:00 trigger",
        "[✓]   checkMirrorHour()        — Time 11:11 trigger",
        "[✓]   checkMidnightSigil()     — Midnight 00:00 trigger",
        "[✓]   checkCalendarEasterEggs()— Solstice · Equinox · LOT Birthday · Pi Day · +",
        "[✓]   detectWordTurns(text)    — 12 word patterns → badge awards",
        "[✓]   getWordTurnResponse(text)— 19 terminal phrase responses",
        "[✓]   checkFridayRitual()      — 4 consecutive Fridays tracker",
        "[✓]   checkGhostProtocol()     — 7-day absence detection",
        "[✓]   checkSilentHour()        — 24h-7d absence detection",
        "[✓]   checkOverclock()         — 20+ activities/day detection",
        "[✓]   runCheckInEasterEggs()   — Master scanner on check-in events",
        "[✓]   recordActivity()         — localStorage activity timestamp",
        "[✓] BadgeUnlockFeed            — Community unlock activity display",
        "[✓] GrowthMilestones           — Personal + community milestones widget",
        "[✓] EvolutionWidget            — CQGS stage + achievements counter",
        "[✓] MemoryWidget               — Badge unlock notification on Q display",
        "[✓] rpg-narrative.ts           — 23 achievement defs · 8 categories",
        "[✓] checkAndAwardBadges()      — All 10 streak milestones checked",
        "[✓] getNextBadgeUnlock()       — Nullish-coalesced theme-aware symbols",
        "[✓] getLevelSymbol()           — Array-based 10-level lookup",
        "[✓] CQGS evolution stages      — 6 stages · 7 tracked modules",
    ]
    y = code_block(c, M, y, live, bg_color=PANEL, text_color=GREEN, fs=7, padding=5)
    y -= 6

    y = h2(c, y, "IN DESIGN / ROADMAP")
    roadmap = [
        "[○] Sci-Fi word triggers       — Literary badges (this codex → implementation)",
        "[○] Arcade code inputs         — Konami/cheat code detection in MemoryWidget",
        "[○] Badge collection view      — Gallery of earned badges with unlock dates",
        "[○] Oceanic Mayan visuals       — Full Option E badge language in profile",
        "[○] Quest tracker UI           — In-app quest progress display",
        "[○] Guild system               — Archetype-based cohort achievements",
        "[○] QIE pattern integration    — Pattern 51 → badge trigger live hook",
        "[○] Seasonal badges            — Full solstice/equinox/moon phase detection",
        "[○] Combo badges               — Multi-system daily activation rewards",
        "[○] Rare encounter engine      — One-time ultra-hidden event detection",
        "[○] Anniversary badge          — Signup anniversary auto-detect",
        "[○] COSMIC tier               — 10-year practice milestone",
    ]
    y = code_block(c, M, y, roadmap, bg_color=PANEL2, text_color=FG2, fs=7, padding=5)
    y -= 6

    y = h2(c, y, "STORAGE ARCHITECTURE")
    storage = [
        "  CLIENT (localStorage):                                         ",
        "    earned_badges             'night_owl,ritual_keeper,milestone_30,...'",
        "    badge_theme               'water' | 'architecture'           ",
        "    badge_unlock_queue        'meta_signal' (pending notification)",
        "    last_activity_date        ISO timestamp for gap detection     ",
        "    friday_ritual_dates       JSON array of Friday ISO strings    ",
        "",
        "  SERVER (database + API):                                       ",
        "    /api/user-stats           Returns { streak, totalEntries, ... }",
        "    /api/narrative            Returns full UserNarrative object    ",
        "    /api/sync-badges          Syncs earned badges to server       ",
        "    rpg-narrative.ts          Computes achievements from logs[]   ",
        "    badges.ts                 42+ types · dual theme · localStorage",
        "    easter-eggs.ts            Live detection engine · ARMED       ",
    ]
    code_block(c, M, y, storage, bg_color=PANEL, text_color=TEAL, fs=7, padding=5)


# ══════════════════════════════════════════════════════════════════════════════
# UPDATED CLOSING PAGE
# ══════════════════════════════════════════════════════════════════════════════

def page_closing(c, pn):
    bg(c); header(c, pn, "LOT SYSTEMS"); footer(c)
    y = H - 70

    bold(c, 18); c.setFillColor(TEAL)
    c.drawCentredString(W / 2, y, "[ END OF CODEX v9 ]")
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

    v9_note = [
        "  v9 STARGATE EDITION — June 2026",
        "  NEW: Sci-Fi Book Shelf · Computer Terminal Hacks · Arcade Cabinet Codes",
        "  LIVE: easter-eggs.ts detection engine · 42+ badge types in badges.ts",
        "  42+ BADGE TYPES: milestone · easter_egg · word_turn · pattern",
    ]
    y = code_block(c, M, y, v9_note, bg_color=PANEL, text_color=TEAL, fs=7.5, padding=6)
    y -= 8

    meta = [
        "  © 2025-2026 LOT Systems. All rights reserved.",
        "  Author: Vadik Marmeladov, CEO & Founder, LOT Systems",
        "  LOT Badge & Achievement Codex — v9.0 — June 2026 — STARGATE EDITION",
        "  Production URL: lot-systems.com",
        "  Repository: github.com/LOT-Systems/LOT-Computer",
        "  Self-care through proactive context-aware AI",
    ]
    code_block(c, M, y, meta, bg_color=PANEL2, text_color=FG3, fs=7.5, padding=8)


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    c = pdf_canvas.Canvas(OUT, pagesize=A4)
    c.setTitle("LOT Badge & Achievement Codex v9 — Stargate Edition")
    c.setAuthor("Vadik Marmeladov / LOT Systems")
    c.setSubject("Complete RPG & Arcade Self-Care Codex — All Systems — Stargate Edition")
    c.setKeywords("LOT RPG arcade self-care badges easter eggs sci-fi terminal arcade codes")

    pages = [
        page_cover,                 # 01
        page_toc,                   # 02
        _v8.page_overview,          # 03
        _v8.page_badge_system,      # 04
        _v8.page_milestones,        # 05
        _v8.page_achievements,      # 06
        _v8.page_levels,            # 07
        _v8.page_quests,            # 08
        _v8.page_oceanic_mayan,     # 09
        _v8.page_quantum_arcade,    # 10
        _v8.page_easter_eggs,       # 11
        _v8.page_word_turns,        # 12
        _v8.page_guild_system,      # 13
        _v8.page_seasonal,          # 14
        _v8.page_combo_system,      # 15
        _v8.page_qie_badges,        # 16
        _v8.page_rare_encounters,   # 17
        _v8.page_ascii_gallery,     # 18
        _v8.page_philosophy,        # 19
        page_scifi_shelf,           # 20  NEW v9
        page_terminal_hacks,        # 21  NEW v9
        page_arcade_codes,          # 22  NEW v9
        page_status,                # 23  UPDATED v9
        _v8.page_unicode,           # 24
        page_closing,               # 25
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
