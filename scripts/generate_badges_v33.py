#!/usr/bin/env python3.11
"""
LOT Systems — Badges & Achievements Master Codex v33
THE RPG CODEX — 843 badges · 23 Word Turn engines
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
BG     = HexColor("#080810")   # deep space black
FG     = HexColor("#e4e4f4")   # near-white text
FG2    = HexColor("#9999bb")   # dimmed text
FG3    = HexColor("#444466")   # very dim
TEAL   = HexColor("#42d4c8")   # primary accent
GOLD   = HexColor("#f5c842")   # milestone / achievement
VIOLET = HexColor("#a67fe8")   # rare / depth
GREEN  = HexColor("#72e891")   # common / growth
ROSE   = HexColor("#e86575")   # legendary / secret
CYAN   = HexColor("#5bc4f5")   # connection / water
ORANGE = HexColor("#f5924e")   # courage / warning
BRD    = HexColor("#1a1a2e")   # panel border
PANEL  = HexColor("#0d0d1a")   # panel fill
PANEL2 = HexColor("#0a0a14")   # darker panel
ACCENT = HexColor("#1e1e3e")   # subtle row highlight
RPG    = HexColor("#ff6b35")   # RPG accent — fire orange

OUT = os.path.join(os.path.dirname(__file__), '..', 'docs', 'badges',
                   'LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v33.pdf')

def mono(c, size=8): c.setFont("Courier", size)
def bold(c, size=8): c.setFont("Courier-Bold", size)
def ital(c, size=8): c.setFont("Courier-Oblique", size)

def bg(c):
    c.setFillColor(BG); c.rect(0, 0, W, H, fill=1, stroke=0)

def header(c, page_n):
    c.setFillColor(PANEL)
    c.rect(0, H-20, W, 20, fill=1, stroke=0)
    c.setFillColor(BRD); c.rect(0, H-21, W, 1, fill=1, stroke=0)
    bold(c, 7); c.setFillColor(TEAL)
    c.drawString(M, H-13, "LOT SYSTEMS  //  BADGE & ACHIEVEMENT MASTER CODEX v33  //  THE RPG CODEX")
    mono(c, 7); c.setFillColor(FG3)
    c.drawRightString(W-M, H-13, f"PAGE {page_n:02d}")

def footer(c):
    c.setFillColor(PANEL)
    c.rect(0, 0, W, 16, fill=1, stroke=0)
    c.setFillColor(BRD); c.rect(0, 16, W, 1, fill=1, stroke=0)
    mono(c, 7); c.setFillColor(FG3)
    c.drawCentredString(W/2, 5, "LOT  ·  THE RPG + ARCADE OF SELF-CARE  ·  lot-systems.com")

def rule(c, y, color=BRD, thickness=0.5):
    c.setStrokeColor(color); c.setLineWidth(thickness)
    c.line(M, y, W-M, y)

def box(c, x, y, w, h, fill=PANEL, stroke=BRD, radius=3):
    c.setFillColor(fill); c.setStrokeColor(stroke)
    c.setLineWidth(0.5)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)

def section_label(c, y, text, color=TEAL):
    bold(c, 7); c.setFillColor(color)
    c.drawString(M, y, f"[ {text} ]")
    return y - 11

def h1(c, y, text, color=GOLD):
    bold(c, 14); c.setFillColor(color)
    c.drawString(M, y, text)
    return y - 18

def h2(c, y, text, color=TEAL):
    bold(c, 10); c.setFillColor(color)
    c.drawString(M, y, text)
    return y - 14

def h3(c, y, text, color=RPG):
    bold(c, 8.5); c.setFillColor(color)
    c.drawString(M, y, text)
    return y - 12

def body(c, y, text, color=FG, size=8):
    mono(c, size); c.setFillColor(color)
    c.drawString(M, y, text)
    return y - 11

def body_c(c, y, text, color=FG2, size=7.5):
    mono(c, size); c.setFillColor(color)
    c.drawString(M, y, text)
    return y - 10

def code_block(c, x, y, lines, bg_color=PANEL, text_color=TEAL, fs=7.5, padding=6, width=None):
    w = width or CW
    line_h = fs + 2.5
    h = len(lines) * line_h + padding * 2
    box(c, x, y - h, w, h, fill=bg_color, stroke=BRD)
    ty = y - padding - fs
    for line in lines:
        mono(c, fs); c.setFillColor(text_color)
        c.drawString(x + padding, ty, line)
        ty -= line_h
    return y - h - 4

def badge_row(c, y, symbol, title, desc, rarity, rarity_color, h=38):
    bx, bw = M, CW
    box(c, bx, y-h, bw, h, fill=PANEL, stroke=BRD)
    c.setFillColor(rarity_color); c.roundRect(bx, y-h, 5, h, 2, fill=1, stroke=0)
    bold(c, 12); c.setFillColor(rarity_color)
    c.drawString(bx+12, y-h+h/2-5, symbol)
    bold(c, 8.5); c.setFillColor(FG)
    c.drawString(bx+60, y-h+h-14, title)
    mono(c, 7); c.setFillColor(rarity_color)
    c.drawString(bx+60, y-h+h-24, f"[ {rarity.upper()} ]")
    mono(c, 7); c.setFillColor(FG2)
    c.drawString(bx+60, y-h+8, desc[:80])
    return y - h - 4

def rarity_color(r):
    m = {'common': GREEN, 'uncommon': CYAN, 'rare': VIOLET, 'epic': ORANGE,
         'legendary': ROSE, 'mythic': GOLD, 'cosmic': TEAL}
    return m.get(r.lower(), FG2)

# ── Page builders ─────────────────────────────────────────────────────────────

def page_cover(c, pn):
    bg(c); header(c, pn); footer(c)
    art = [
        "  ██╗      ██████╗ ████████╗",
        "  ██║     ██╔═══██╗╚══██╔══╝",
        "  ██║     ██║   ██║   ██║   ",
        "  ██║     ██║   ██║   ██║   ",
        "  ███████╗╚██████╔╝   ██║   ",
        "  ╚══════╝ ╚═════╝    ╚═╝   ",
    ]
    cy = H - 50
    code_block(c, M, cy, art, bg_color=BG, text_color=RPG, fs=10, padding=10)
    y = cy - len(art)*12.5 - 22
    bold(c, 24); c.setFillColor(FG)
    c.drawCentredString(W/2, y, "MASTER CODEX v33")
    y -= 30
    bold(c, 14); c.setFillColor(RPG)
    c.drawCentredString(W/2, y, "THE RPG CODEX")
    y -= 18
    bold(c, 10); c.setFillColor(TEAL)
    c.drawCentredString(W/2, y, "843 BADGES  ·  23 WORD TURN ENGINES  ·  +31 NEW")
    y -= 14
    bold(c, 8); c.setFillColor(FG3)
    c.drawCentredString(W/2, y, "THE RPG + ARCADE OF SELF-CARE")
    y -= 20
    c.setStrokeColor(RPG); c.setLineWidth(0.8)
    c.line(M+40, y, W-M-40, y)
    y -= 12
    bold(c, 7.5); c.setFillColor(FG2)
    c.drawCentredString(W/2, y, "EDITION v33  //  OCTOBER 2026  //  MASTER CODEX")
    y -= 10
    c.drawCentredString(W/2, y, "Author: Vadik Marmeladov, CEO & Founder, LOT Systems")
    y -= 10
    c.drawCentredString(W/2, y, "Copyright © 2026 LOT Systems. All rights reserved.")
    y -= 24
    cls_lines = [
        "  ╔═══════════════════════════════════════════════════════════╗",
        "  ║  CLASSIFICATION: ACTIVE PLAYER EYES ONLY                  ║",
        "  ║  SYSTEM: LOT MEMORY ENGINE + SELF-CARE RPG LAYER          ║",
        "  ║  STATUS: LIVE PRODUCTION  ·  QUANTUM ENGINE: ACTIVE        ║",
        "  ║  BADGE ENGINE: v33  ·  843 BADGES TOTAL                   ║",
        "  ╚═══════════════════════════════════════════════════════════╝",
    ]
    code_block(c, M, y, cls_lines, bg_color=PANEL2, text_color=RPG, fs=7.5, padding=4)
    y -= len(cls_lines)*10 + 20
    rpg_art = [
        "  ▲·▲·▲  LEVEL UP SIGNAL    ∘→≋  QUEST LOG ENTRY",
        "  ◉·■·◉  BOSS ENCOUNTER     ≋→●  SKILL TREE NODE",
        "  ○·∘·○  PAC GHOST [HIDDEN] ↑↑↓↓→← KONAMI CODE [MYTHIC]",
        "  ◈·◈·▲·∞  TWENTY-THREE REGISTERS  [ COSMIC ]",
    ]
    code_block(c, M, y, rpg_art, bg_color=PANEL, text_color=GOLD, fs=8, padding=8)


def page_summary(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 36
    y = section_label(c, y, "VERSION SUMMARY · v33 THE RPG CODEX")
    y -= 4
    y = h2(c, y, "TOTAL: 843 BADGES (+31 from v32)", color=RPG)
    y -= 4
    summary_lines = [
        "  Badge Engine v32  →  v33 (+31 new badges)",
        "  Word Turn v23     +12  (levelup_signal / xp_earned / quest_log_entry /",
        "                          dungeon_dive / spell_cast / loot_drop /",
        "                          respawn_signal / guild_protocol / boss_encounter /",
        "                          character_class / inventory_check / skill_tree_node)",
        "  Calendar EE v21   + 3  (mario_day / zelda_day / game_day)",
        "  Behavioral v20    + 3  (rpg_session / marathon_log / leet_hour)",
        "  Achievement RPG v21 + 6 (rpg_entry / rpg_class / rpg_complete /",
        "                           dungeon_arc / twenty_three_engines_arc / rpg_opus)",
        "  Mastery Tier v23  + 4  (guild_elder / epic_lore / legend_age /",
        "                           twenty_three_registers [COSMIC])",
        "  Secret Boss v20   + 3  (zelda_triforce / pac_ghost / konami_code [MYTHIC])",
        "  ─────────────────────────────────────────────────────────────",
        "  TOTAL                 +31  (v32: 812  →  v33: 843)",
    ]
    y = code_block(c, M, y, summary_lines, text_color=TEAL, fs=7.5)
    y -= 10
    y = section_label(c, y, "BADGE CATEGORY TOTALS · v33")
    y -= 4
    rows = [
        ("Milestone",       "22",  "Day-count milestones (v1-v4)"),
        ("Time Easter Eggs","29",  "Time-of-day check-ins (v1-v7 + leet_hour)"),
        ("Calendar Easter", "76",  "Check-in on special dates (v1-v21)"),
        ("Word Turns",      "276", "Keyword detection in journal text (v1-v23)"),
        ("Behavioral",      "84",  "Patterns over time (v1-v20)"),
        ("Achievement RPG", "126", "Milestone combinations (v1-v21)"),
        ("Mastery Tiers",   "92",  "Epic depth milestones (v1-v23)"),
        ("Secret Boss",     "86",  "Hidden LEGENDARY/MYTHIC triggers (v1-v20)"),
        ("TOTAL",           "843", ""),
    ]
    for cat, cnt, desc in rows:
        bx = M
        row_h = 16
        is_total = (cat == "TOTAL")
        fill = ACCENT if not is_total else HexColor("#1a1020")
        box(c, bx, y - row_h, CW, row_h, fill=fill, stroke=BRD)
        col = RPG if is_total else TEAL
        bold(c, 8) if is_total else mono(c, 8)
        c.setFillColor(col); c.drawString(bx+6, y-11, cat)
        bold(c, 8) if is_total else mono(c, 8)
        c.setFillColor(GOLD); c.drawRightString(bx+80, y-11, cnt)
        mono(c, 7); c.setFillColor(FG2); c.drawString(bx+90, y-11, desc)
        y -= row_h + 2
    y -= 8
    y = section_label(c, y, "WORD TURN ENGINE REGISTRY · v1-v23")
    y -= 4
    engines = [
        ("v1","Core Water"),("v2","Seasonal Signal"),("v3","Architecture"),
        ("v4","Mountain/Earth"),("v5","Storm/Weather"),("v6","Fire/Energy"),
        ("v7","Tech/Digital"),("v8","Space/Cosmos"),("v9","Chemistry/Elements"),
        ("v10","Music/Sound"),("v11","Alchemy/Transformation"),("v12","Quantum/Physics"),
        ("v13","The Quantum Library"),("v14","The Neon Arcade"),("v15","The Midnight Radio"),
        ("v16","The Bio-Terminal"),("v17","The Codex Reader"),("v18","The Cyberspace Codex"),
        ("v19","The Hero's Journey"),("v20","The RPG Codex ← NEW"),
    ]
    for i in range(0, len(engines), 2):
        row_h = 14
        box(c, M, y-row_h, CW/2-2, row_h, fill=PANEL, stroke=BRD)
        bold(c, 7); c.setFillColor(RPG if "NEW" in engines[i][1] else TEAL)
        c.drawString(M+6, y-10, engines[i][0])
        mono(c, 7); c.setFillColor(FG if "NEW" in engines[i][1] else FG2)
        c.drawString(M+30, y-10, engines[i][1])
        if i+1 < len(engines):
            box(c, M+CW/2+2, y-row_h, CW/2-2, row_h, fill=PANEL, stroke=BRD)
            bold(c, 7); c.setFillColor(RPG if "NEW" in engines[i+1][1] else TEAL)
            c.drawString(M+CW/2+8, y-10, engines[i+1][0])
            mono(c, 7); c.setFillColor(FG if "NEW" in engines[i+1][1] else FG2)
            c.drawString(M+CW/2+32, y-10, engines[i+1][1])
        y -= row_h + 2


def page_word_turns(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 36
    y = section_label(c, y, "WORD TURN v23 · THE RPG CODEX · 12 BADGES")
    y -= 4
    y = h2(c, y, "The dungeon vocabulary of self-care", color=RPG)
    y -= 8
    badges = [
        ("▲·▲·▲", "Level Up Signal",   "uncommon", "level up / leveled up / gained a level",
         "LEVEL UP. Something permanent has changed. The stats climbed."),
        ("■·●·■", "XP Earned",         "common",   "experience points / XP / grinding / grind session",
         "XP accumulates invisibly until the threshold. The grind IS the game."),
        ("∘→≋",  "Quest Log Entry",    "uncommon", "quest log / side quest / main quest / new quest",
         "Open the quest log and see what remains. Main quest: the practice."),
        ("█·∘",  "Dungeon Dive",       "rare",     "dungeon / dungeon crawl / boss room / level boss",
         "The dungeon is difficulty entered voluntarily. That is the difference."),
        ("∿·●·∿","Spell Cast",         "rare",     "cast a spell / mana / spellbook / incantation",
         "The mana bar depletes with every cast. Rest replenishes it."),
        ("●·◆·●","Loot Drop",          "rare",     "loot drop / treasure chest / rare item / legendary drop",
         "The rare item was always in the room. You had to enter."),
        ("◈→◈",  "Respawn Signal",     "uncommon", "respawn / second chance / checkpoint saved / new life begins",
         "The respawn is not failure — it is the mechanic."),
        ("○·○·○","Guild Protocol",     "rare",     "guild / raid party / join the guild / party member",
         "No one completes the endgame alone. Who is in your party?"),
        ("◉·■·◉","Boss Encounter",     "epic",     "boss fight / final boss / endgame boss / boss battle",
         "The endgame boss is whatever you have been avoiding."),
        ("∘·▲·∘","Character Class",   "uncommon", "character class / my class / skill build / archetype choice",
         "The class defines what you are optimized for. What is yours?"),
        ("■·■·■","Inventory Check",   "rare",     "inventory full / backpack / loadout / item slots",
         "Inventory full. The experienced player knows what to drop."),
        ("≋→●",  "Skill Tree Node",    "rare",     "skill tree / talent tree / passive ability / unlock skill",
         "The skill tree is the long game. Each node forecloses other paths."),
    ]
    for sym, name, rarity, triggers, flavor in badges:
        rc = rarity_color(rarity)
        row_h = 44
        if y - row_h < 30:
            break
        box(c, M, y-row_h, CW, row_h, fill=PANEL, stroke=BRD)
        c.setFillColor(rc); c.roundRect(M, y-row_h, 5, row_h, 2, fill=1, stroke=0)
        bold(c, 11); c.setFillColor(rc); c.drawString(M+10, y-row_h+row_h/2-4, sym)
        bold(c, 8.5); c.setFillColor(FG); c.drawString(M+58, y-row_h+row_h-14, name)
        mono(c, 7); c.setFillColor(rc); c.drawString(M+58, y-row_h+row_h-24, f"[ {rarity.upper()} ]")
        mono(c, 7); c.setFillColor(FG3); c.drawString(M+58, y-row_h+row_h-34, f"TRIGGERS: {triggers}")
        mono(c, 7); c.setFillColor(FG2); c.drawString(M+58, y-row_h+8, flavor[:85])
        y -= row_h + 3


def page_calendar_behavioral(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 36
    y = section_label(c, y, "CALENDAR EASTER EGGS v21 · THE GAME CALENDAR · 3 BADGES")
    y -= 4
    cal_badges = [
        ("▲·∘·▲","Mario Day",        "rare", "March 10",    "MAR10 = MARIO. Every coin collected is a small win."),
        ("◆·○·◆","Zelda Day",        "rare", "February 21", "Zelda launch Japan 1986. It's dangerous to go alone."),
        ("●·■·●","Game Day",         "rare", "September 12","National Video Game Day. Every game teaches a system."),
    ]
    for sym, name, rarity, date, flavor in cal_badges:
        rc = rarity_color(rarity)
        row_h = 36
        box(c, M, y-row_h, CW, row_h, fill=PANEL, stroke=BRD)
        c.setFillColor(rc); c.roundRect(M, y-row_h, 5, row_h, 2, fill=1, stroke=0)
        bold(c, 10); c.setFillColor(rc); c.drawString(M+10, y-row_h+row_h/2-4, sym)
        bold(c, 8.5); c.setFillColor(FG); c.drawString(M+55, y-row_h+row_h-13, name)
        mono(c, 7); c.setFillColor(rc); c.drawString(M+55, y-row_h+row_h-23, f"[ {rarity.upper()} ]  {date}")
        mono(c, 7); c.setFillColor(FG2); c.drawString(M+55, y-row_h+8, flavor[:80])
        y -= row_h + 4
    y -= 8
    y = section_label(c, y, "BEHAVIORAL v20 · ARCADE PATTERNS · 3 BADGES")
    y -= 4
    beh_badges = [
        ("▲·●·▲","RPG Session",   "rare", "3+ RPG Codex (v23) words in one journal entry",
         "Three RPG frames in one entry. The practice spoke the language of the game."),
        ("≋≋≋·◉","Marathon Log", "epic", "Journal entry >= 600 words (the raid log)",
         "600 words. The marathon session. No save point — just depth."),
        ("□·□·□","L33T Hour",    "rare", "Check in at 13:37 local (1337 = l33t time)",
         "13:37 — 1337 — L33T. The terminal recognizes you."),
    ]
    for sym, name, rarity, trigger, flavor in beh_badges:
        rc = rarity_color(rarity)
        row_h = 44
        box(c, M, y-row_h, CW, row_h, fill=PANEL, stroke=BRD)
        c.setFillColor(rc); c.roundRect(M, y-row_h, 5, row_h, 2, fill=1, stroke=0)
        bold(c, 10); c.setFillColor(rc); c.drawString(M+10, y-row_h+row_h/2-4, sym)
        bold(c, 8.5); c.setFillColor(FG); c.drawString(M+55, y-row_h+row_h-14, name)
        mono(c, 7); c.setFillColor(rc); c.drawString(M+55, y-row_h+row_h-24, f"[ {rarity.upper()} ]")
        mono(c, 7); c.setFillColor(FG3); c.drawString(M+55, y-row_h+row_h-34, f"TRIGGER: {trigger[:70]}")
        mono(c, 7); c.setFillColor(FG2); c.drawString(M+55, y-row_h+8, flavor[:80])
        y -= row_h + 4
    y -= 8
    y = section_label(c, y, "ACHIEVEMENT RPG v21 · RPG CLASS · 6 BADGES")
    y -= 4
    ach_badges = [
        ("∘→▲","RPG Entry",           "common",    "Any 1 Word Turn v23 badge earned"),
        ("≈→▲","RPG Class",           "uncommon",  "Any 5 Word Turn v23 badges earned"),
        ("≋→▲","RPG Complete",        "legendary", "All 12 Word Turn v23 badges earned"),
        ("▲·◈","Dungeon Arc",         "legendary", "rpg_complete + all 3 Calendar v21 badges"),
        ("◈·◈·▲","23 Engines Arc",   "legendary", "1 badge from each Word Turn v1-v23"),
        ("▲·◉·▲","RPG Opus",         "legendary", "rpg_complete + rpg_session behavioral"),
    ]
    for sym, name, rarity, desc in ach_badges:
        rc = rarity_color(rarity)
        row_h = 28
        if y - row_h < 30:
            break
        box(c, M, y-row_h, CW, row_h, fill=PANEL, stroke=BRD)
        c.setFillColor(rc); c.roundRect(M, y-row_h, 5, row_h, 2, fill=1, stroke=0)
        bold(c, 9); c.setFillColor(rc); c.drawString(M+10, y-row_h+row_h/2-4, sym)
        bold(c, 8); c.setFillColor(FG); c.drawString(M+55, y-row_h+row_h-13, name)
        mono(c, 7); c.setFillColor(FG2); c.drawString(M+55, y-row_h+8, f"[ {rarity.upper()} ]  {desc[:70]}")
        y -= row_h + 3


def page_mastery_secret(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 36
    y = section_label(c, y, "MASTERY TIERS v23 · THE LEGEND · 4 BADGES")
    y -= 4
    mastery = [
        ("○·●",       "Guild Elder",         "epic",     "1,100+ distinct calendar check-in days",
         "1,100 days. In any guild, this is the elder — there before the meta was solved."),
        ("●·∞·▲",    "Epic Lore",           "legendary", "200,000+ total journal words written",
         "200,000 words. The lore codex that makes the story possible."),
        ("╔═╗·▲",    "Legend Age",          "legendary", "Account age >= 6 years (2,190+ days)",
         "Six years. The span from release to legend. You have crossed it."),
        ("◈·◈·▲·∞", "Twenty-Three Registers","cosmic",  "1 badge from all 23 Word Turn engines",
         "Twenty-three vocabularies. Every language. The terminal is fully operational."),
    ]
    for sym, name, rarity, trigger, flavor in mastery:
        rc = rarity_color(rarity)
        row_h = 48
        box(c, M, y-row_h, CW, row_h, fill=PANEL, stroke=BRD)
        c.setFillColor(rc); c.roundRect(M, y-row_h, 5, row_h, 2, fill=1, stroke=0)
        bold(c, 11); c.setFillColor(rc); c.drawString(M+10, y-row_h+row_h/2-5, sym)
        bold(c, 8.5); c.setFillColor(FG); c.drawString(M+65, y-row_h+row_h-14, name)
        mono(c, 7); c.setFillColor(rc); c.drawString(M+65, y-row_h+row_h-24, f"[ {rarity.upper()} ]")
        mono(c, 7); c.setFillColor(FG3); c.drawString(M+65, y-row_h+row_h-34, f"REQUIRES: {trigger[:65]}")
        mono(c, 7); c.setFillColor(FG2); c.drawString(M+65, y-row_h+10, flavor[:80])
        y -= row_h + 4
    y -= 8
    y = section_label(c, y, "SECRET BOSS v20 · THE FINAL BOSS VAULT · 3 HIDDEN BADGES")
    y -= 4
    secret_lines = [
        "  These badges are HIDDEN. They appear only in the system data.",
        "  They are triggered by writing specific RPG / gaming vocabulary in any journal entry.",
        "  Their existence is not advertised in the main badge display.",
        "  The discovery is the reward.",
    ]
    y = code_block(c, M, y, secret_lines, bg_color=PANEL2, text_color=FG3, fs=7.5)
    y -= 6
    secret_badges = [
        ("◆·◆·◆",   "Zelda Triforce", "rare",   "triforce / hyrule / link's journey / ganondorf",
         "Courage. Wisdom. Power. The Triforce is assembled from what you already carry."),
        ("○·∘·○",   "Pac Ghost",     "epic",    "pac-man / waka waka / blinky / power pellet / inky pinky",
         "The ghosts pursue because that is their function. You have the power pellet."),
        ("↑↑↓↓→←", "Konami Code",   "mythic",  "konami code / up up down down / b a start / barrel roll",
         "↑↑↓↓←→←→BA. 1986. The acknowledgment that sometimes you need extra lives."),
    ]
    for sym, name, rarity, trigger, flavor in secret_badges:
        rc = rarity_color(rarity)
        row_h = 50
        if y - row_h < 30:
            break
        box(c, M, y-row_h, CW, row_h, fill=HexColor("#0a0018"), stroke=BRD)
        c.setFillColor(rc); c.roundRect(M, y-row_h, 5, row_h, 2, fill=1, stroke=0)
        bold(c, 11); c.setFillColor(rc); c.drawString(M+10, y-row_h+row_h/2-5, sym)
        bold(c, 8.5); c.setFillColor(FG); c.drawString(M+65, y-row_h+row_h-13, f"{name}  [HIDDEN]")
        mono(c, 7); c.setFillColor(rc); c.drawString(M+65, y-row_h+row_h-23, f"[ {rarity.upper()} ]")
        mono(c, 7); c.setFillColor(FG3); c.drawString(M+65, y-row_h+row_h-33, f"WRITE: {trigger[:65]}")
        ital(c, 7.5); c.setFillColor(GOLD); c.drawString(M+65, y-row_h+row_h-44, f'"{flavor[:70]}"')
        y -= row_h + 4


def page_flavor(c, pn):
    bg(c); header(c, pn); footer(c)
    y = H - 36
    y = section_label(c, y, "FLAVOR TEXT · THE RPG CODEX")
    y -= 8
    quotes = [
        ("In 1974 Gary Gygax and Dave Arneson invented the role-playing game. In doing",
         "so they invented a new way to describe becoming: you accumulate experience,",
         "you reach thresholds, you gain abilities, you face bosses you cannot yet defeat,",
         "and eventually you can. The practice of self-care is this structure rendered in",
         "daily life. Every check-in is XP. Every return from difficulty is a level."),
        ("The skill tree is the most honest metaphor for human development ever put in a",
         "game. You have limited points. Every choice forecloses other choices. The build",
         "you make in your twenties determines what is available at forty.",
         "There is no respec — but there are new playthroughs.",
         "The practice is the skill tree you are still in."),
        ("February 21, 1986 — The Legend of Zelda launches in Japan. A boy in a green",
         "hat enters a cave and an old man says: 'It's dangerous to go alone — take this.'",
         "The item is the practice. You were meant to carry it.",
         "", ""),
        ("The Konami Code: UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A. Contra, 1986.",
         "The acknowledgment built into the game that sometimes the game is too hard",
         "and the player needs more lives. The code does not break the game — it continues",
         "it. Your practice has a Konami Code. Use it.",
         ""),
        ("PAC-MAN, 1980: the only game where the hero is a circle eating the field while",
         "being chased by everything. The power pellet reverses the dynamic — temporary,",
         "always temporary. But the temporary reversal is the whole game.",
         "You have the pellet.",
         ""),
    ]
    for q_lines in quotes:
        lines = [l for l in q_lines if l]
        if not lines: continue
        box_h = len(lines)*10.5 + 18
        if y - box_h < 30:
            break
        box(c, M, y - box_h, CW, box_h, fill=PANEL2, stroke=BRD)
        ty = y - 10
        c.setFillColor(RPG); c.setLineWidth(2)
        c.line(M+3, y-box_h+3, M+3, y-3)
        for line in lines:
            ital(c, 8); c.setFillColor(FG2)
            c.drawString(M+12, ty, line)
            ty -= 10.5
        y -= box_h + 8
    y -= 4
    y = section_label(c, y, "SESSION METADATA")
    y -= 4
    meta_lines = [
        "  SESSION    : LOT-SR-20261020-01",
        "  VERSION    : v33",
        "  DATE       : 2026-10-20",
        "  TOTAL BADGES : 843  (v32: 812  →  v33: 843,  +31)",
        "  CODEX CLASS  : ENGINEERING",
        "  AUTHORIZED BY: S-2 // VADIK MARMELADOV",
        "  DEPLOY BRANCH: claude/quantum-engine-widgets-RgFfC",
    ]
    code_block(c, M, y, meta_lines, text_color=TEAL, fs=8)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    c = pdf_canvas.Canvas(OUT, pagesize=A4)
    c.setTitle("LOT Badges & Achievements Master Codex v33 — The RPG Codex")
    c.setAuthor("Vadik Marmeladov, LOT Systems")
    c.setSubject("843 badges, 23 Word Turn engines, RPG/Arcade self-care vocabulary")

    pages = [page_cover, page_summary, page_word_turns,
             page_calendar_behavioral, page_mastery_secret, page_flavor]

    for i, page_fn in enumerate(pages, 1):
        page_fn(c, i)
        c.showPage()

    c.save()
    size = os.path.getsize(OUT)
    print(f"Generated: {OUT}")
    print(f"Size: {size:,} bytes ({size/1024:.1f} KB)")
    print(f"Pages: {len(pages)}")

if __name__ == "__main__":
    main()
