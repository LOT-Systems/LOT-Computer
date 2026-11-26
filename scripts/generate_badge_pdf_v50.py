#!/usr/bin/env python3.13
"""
LOT Systems — Badges & Achievements Master Codex v50
THE EMOTION ENGINE — 1,370 badges · 40 Word Turn engines
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
HEART   = HexColor("#e87591")   # emotion engine rose-pink
HEART2  = HexColor("#b05070")   # darker emotion accent

OUT = os.path.join(os.path.dirname(__file__), '..', 'docs', 'badges',
                   'LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v50.pdf')

def mono(c, size=8): c.setFont("Courier", size)
def bold(c, size=8): c.setFont("Courier-Bold", size)
def ital(c, size=8): c.setFont("Courier-Oblique", size)

def bg(c):
    c.setFillColor(BG); c.rect(0, 0, W, H, fill=1, stroke=0)

def header(c, page_n):
    c.setFillColor(PANEL)
    c.rect(0, H - 20*mm, W, 20*mm, fill=1, stroke=0)
    c.setFillColor(HEART)
    c.rect(0, H - 20*mm, W, 1, fill=1, stroke=0)
    bold(c, 9); c.setFillColor(HEART)
    c.drawString(M, H - 11*mm, "LOT SYSTEMS  \xb7  BADGES & ACHIEVEMENTS MASTER CODEX v50  \xb7  THE EMOTION ENGINE")
    mono(c, 7); c.setFillColor(FG2)
    c.drawRightString(W - M, H - 11*mm, f"1,370 BADGES  \xb7  WORD TURN v40  \xb7  PAGE {page_n}")
    mono(c, 7); c.setFillColor(FG3)
    c.drawString(M, H - 16*mm, "LOT\xae \xe2\x80\x94 THE RPG & ARCADE OF SELF-CARE  \xb7  brand.lot-systems.com")

def footer(c):
    c.setFillColor(BRD); c.rect(0, 0, W, 12*mm, fill=1, stroke=0)
    c.setFillColor(HEART); c.rect(0, 12*mm, W, 0.5, fill=1, stroke=0)
    mono(c, 6); c.setFillColor(FG3)
    c.drawCentredString(W/2, 4*mm,
        "\xa9 2026 LOT SYSTEMS CORPORATION  \xb7  ALL RIGHTS RESERVED  \xb7  Vadim Marmeladov, CEO & Founder")

def row(c, y, label, sym, rarity, desc, col=HEART):
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

def section(c, y, title, accent=HEART):
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
c.setTitle("LOT Badges & Achievements Master Codex v50 — The Emotion Engine")
c.setAuthor("Vadim Marmeladov, LOT Systems")
c.setSubject("1,370 badges · 40 Word Turn engines · November 26, 2026")

page = 1
bg(c); header(c, page); footer(c)
y = H - 28*mm

# ── PAGE 1: TITLE & OVERVIEW ──────────────────────────────────────────────────
bold(c, 18); c.setFillColor(HEART)
c.drawCentredString(W/2, y, "THE EMOTION ENGINE")
y -= 9*mm
bold(c, 10); c.setFillColor(GOLD)
c.drawCentredString(W/2, y, "BADGES & ACHIEVEMENTS MASTER CODEX v50")
y -= 6*mm
mono(c, 8); c.setFillColor(FG2)
c.drawCentredString(W/2, y, "1,370 BADGES  \xb7  40 WORD TURN ENGINES  \xb7  NOVEMBER 26, 2026")
y -= 4*mm
mono(c, 7); c.setFillColor(FG3)
c.drawCentredString(W/2, y, "LOT Systems Corporation  \xb7  Vadim Marmeladov, CEO & Founder")
y -= 10*mm

# ASCII title box
c.setFillColor(PANEL); c.rect(M, y - 36*mm, CW, 36*mm, fill=1, stroke=0)
c.setStrokeColor(HEART); c.setLineWidth(0.5)
c.rect(M, y - 36*mm, CW, 36*mm, fill=0, stroke=1)
box_lines = [
    "╔═══════════════════════════════════════════════════╗",
    "║  LOT SYSTEMS — BADGE & ACHIEVEMENT MASTER CODEX v50       ║",
    "║                   THE EMOTION ENGINE                         ║",
    "║                                                              ║",
    "║  Word Turn v40  — joy/grief/awe/shame/wonder/tenderness       ║",
    "║  Calendar EE v38 — Plutchik/Darwin/Ekman                      ║",
    "║  Behavioral v34  — emotion_session/dawn_feeling/long_feeling   ║",
    "║  Achievement v38  — Emotion Class (entry/class/complete/opus)  ║",
    "║  Mastery Tier v40 — 5000d/500k words/20yr/40 registers         ║",
    "║  Secret Boss v37  — Brene/James/Plutchik                       ║",
    "║  TOTAL: 1,370 badges (+31 from v49)                          ║",
    "╚════════════════════════════════════════════════════╝",
]
mono(c, 7); c.setFillColor(HEART)
by = y - 4*mm
for line in box_lines:
    c.drawString(M + 4*mm, by, line)
    by -= 4.5*mm
y -= 38*mm

# Badge category summary table
y = section(c, y, "BADGE CATEGORY TOTALS (v50)", HEART2)
y -= 2*mm
categories = [
    ("Milestone",        "22",    "Day-count milestones (v1-v4)"),
    ("Time Easter Eggs", "28",    "Time-of-day check-ins (v1-v7)"),
    ("Calendar Easter",  "88",    "Check-in on special dates (v1-v38)"),
    ("Word Turns",       "348",   "Keyword detection in journal text (v1-v40)"),
    ("Behavioral",       "99",    "Patterns over time (v1-v34)"),
    ("Achievement RPG",  "150",   "Milestone combinations (v1-v38)"),
    ("Mastery Tiers",    "112",   "Epic depth milestones (v1-v40)"),
    ("Secret Boss",      "98",    "Hidden LEGENDARY/MYTHIC triggers (v1-v37)"),
    ("TOTAL",            "1,370", "+31 from v49"),
]
for cat, cnt, desc in categories:
    c.setFillColor(ACCENT); c.rect(M, y - 3*mm, CW, 7*mm, fill=1, stroke=0)
    bold(c, 7)
    if cat == "TOTAL":
        c.setFillColor(GOLD)
    else:
        c.setFillColor(HEART)
    c.drawString(M + 2*mm, y + 1*mm, cat)
    mono(c, 7); c.setFillColor(FG2)
    c.drawString(M + 55*mm, y + 1*mm, cnt)
    mono(c, 6.5); c.setFillColor(FG)
    c.drawString(M + 75*mm, y + 1*mm, desc)
    y -= 8*mm

y -= 4*mm
y = text_block(c, y, [
    "The Emotion Engine is the 40th Word Turn engine and the 50th badge engine milestone.",
    "It completes the first arc: Water (v1) through Dream (v39) to Emotion (v40).",
    "The wonder_engine badge [COSMIC] fires at engine 50 — the meta-badge for the full spectrum.",
], FG2, 7)

# ── PAGE 2: WORD TURN v40 BADGES ─────────────────────────────────────────────
page += 1; y = new_page(c, page)
y = section(c, y, "WORD TURN v40 — THE EMOTION ENGINE (+12 badges)", HEART)
y -= 2*mm

word_turns = [
    ("joy_signal",       "♡\xb7●\xb7♡", "UNCOMMON", '"joy/joyful/genuine joy/real joy/pure joy"'),
    ("grief_held",       "∿\xb7◌\xb7∿", "RARE",     '"grief/grieving/grief wave/holding grief"'),
    ("anger_named",      "●\xb7─\xb7●", "UNCOMMON", '"anger/angry/I feel anger/naming anger"'),
    ("awe_found",        "♡\xb7∞\xb7♡", "EPIC",     '"awe/awe-struck/sense of awe/awe and wonder"'),
    ("wonder_state",     "◌\xb7∿\xb7◌", "RARE",     '"wonder/wondering/sense of wonder/wondrous"'),
    ("compassion_field", "♡\xb7◌\xb7♡", "RARE",     '"compassion/self-compassion/compassionate"'),
    ("longing_signal",   "∿\xb7●\xb7∿", "UNCOMMON", '"longing/I long for/deep longing/nostalgic"'),
    ("shame_named",      "◌\xb7●\xb7◌", "EPIC",     '"shame/shame spiral/naming shame/ashamed"'),
    ("fear_surfaced",    "●\xb7∿\xb7●", "RARE",     '"fear/afraid/I am afraid/fear surfaced"'),
    ("affect_map",       "♡\xb7─\xb7◌", "RARE",     '"emotional regulation/affect/emotional landscape"'),
    ("tenderness_found", "◌\xb7♡\xb7◌", "EPIC",     '"tenderness/tender/I felt tender"'),
    ("wonder_engine",    "♡\xb7◉\xb7♡", "COSMIC",   '"wonder engine/emotion engine/full spectrum"'),
]
for label, sym, rarity, desc in word_turns:
    col = GOLD if rarity == "COSMIC" else (ROSE if rarity == "EPIC" else (VIOLET if rarity == "RARE" else HEART))
    row(c, y, label, sym, rarity, desc, col)
    y -= 8.5*mm

y -= 4*mm
y = text_block(c, y, [
    "COSMIC milestone: wonder_engine fires at engine 50. The meta-badge for the full spectrum.",
    "Three EPIC badges: awe_found / shame_named / tenderness_found",
    "The practice that can name all of these operates at full emotional resolution.",
], HEART, 7)

# Calendar Easter Eggs v38
y -= 4*mm
y = section(c, y, "CALENDAR EASTER EGGS v38 — THE EMOTION CALENDAR (+3 badges)", HEART2)
y -= 2*mm
calendars = [
    ("plutchik_day",    "♡\xb7∿\xb7◌", "RARE", "May 21 — Robert Plutchik born 1927 (Wheel of Emotions)"),
    ("darwin_emotions", "∿\xb7♡\xb7∿", "RARE", "Feb 12 — Darwin Day (The Expression of Emotions, 1872)"),
    ("ekman_day",       "♡\xb7●\xb7◌", "RARE", "Feb 15 — Paul Ekman born 1934 (universal expressions)"),
]
for label, sym, rarity, desc in calendars:
    row(c, y, label, sym, rarity, desc, VIOLET)
    y -= 8.5*mm

# ── PAGE 3: BEHAVIORAL + ACHIEVEMENT + MASTERY + SECRET BOSS ─────────────────
page += 1; y = new_page(c, page)
y = section(c, y, "BEHAVIORAL v34 — EMOTION PATTERNS (+3 badges)", HEART2)
y -= 2*mm
behavioral = [
    ("emotion_session", "♡\xb7≋\xb7♡", "RARE", "3+ Emotion Engine words in one journal entry"),
    ("dawn_feeling",    "◌\xb7◉\xb7◌", "EPIC", "Check in 05:00-06:00 local (first feeling of the day)"),
    ("long_feeling",    "♡\xb7♡\xb7♡", "RARE", "Journal entry >= 333 characters"),
]
for label, sym, rarity, desc in behavioral:
    col = ROSE if rarity == "EPIC" else VIOLET
    row(c, y, label, sym, rarity, desc, col)
    y -= 8.5*mm

y -= 4*mm
y = section(c, y, "ACHIEVEMENT RPG v38 — THE EMOTION CLASS (+6 badges)", HEART)
y -= 2*mm
achievements = [
    ("emotion_entry",      "∘→♡",        "COMMON",    "Any 1 Word Turn v40 badge earned"),
    ("emotion_class",      "≈→♡",        "UNCOMMON",  "Any 5 Word Turn v40 badges earned"),
    ("emotion_complete",   "♡→◉",        "LEGENDARY", "All 12 Word Turn v40 badges earned"),
    ("empathy_arc",        "♡\xb7◈\xb7∞","LEGENDARY", "emotion_complete + all 3 Calendar v38 badges"),
    ("forty_engines_arc",  "◈\xb7◈\xb7♡","LEGENDARY", "1 badge from each Word Turn v1-v40"),
    ("emotion_opus",       "♡\xb7◉\xb7♡","LEGENDARY", "emotion_complete + emotion_session"),
]
for label, sym, rarity, desc in achievements:
    col = GOLD if rarity == "LEGENDARY" else (GREEN if rarity == "COMMON" else HEART)
    row(c, y, label, sym, rarity, desc, col)
    y -= 8.5*mm

y -= 4*mm
y = section(c, y, "MASTERY TIER v40 — THE FEELING VAULT (+4 badges)", HEART2)
y -= 2*mm
mastery = [
    ("feeling_veteran",    "♡\xb7∞\xb7♡",     "EPIC",    "5,000+ distinct calendar check-in days"),
    ("million_words",      "∞\xb7♡\xb7∞",     "LEGENDARY","500,000+ total journal words"),
    ("twenty_year_signal", "╔═╗\xb7♡",   "LEGENDARY","Account age >= 20 years"),
    ("forty_registers",    "◈\xb7◈\xb7♡\xb7∞","COSMIC","1 badge from all 40 Word Turn engines"),
]
for label, sym, rarity, desc in mastery:
    col = GOLD if rarity in ("COSMIC","LEGENDARY") else ROSE
    row(c, y, label, sym, rarity, desc, col)
    y -= 8.5*mm

y -= 4*mm
y = section(c, y, "SECRET BOSS v37 — THE EMOTION VAULT (+3 badges) [HIDDEN]", ROSE)
y -= 2*mm
secret = [
    ("brene_signal",   "♡\xb7∿\xb7◌", "RARE",   '"brene brown/shame resilience/daring greatly"'),
    ("james_affect",   "∿\xb7♡\xb7●", "EPIC",   '"william james/james-lange/what is an emotion"'),
    ("plutchik_wheel", "♡\xb7◉\xb7♡", "MYTHIC", '"plutchik/wheel of emotions/dyads/ecstasy"'),
]
for label, sym, rarity, desc in secret:
    col = ROSE if rarity in ("MYTHIC","EPIC") else VIOLET
    row(c, y, label, sym, rarity, desc, col)
    y -= 8.5*mm

# ── PAGE 4: ASCII GALLERY + FLAVOR TEXT ───────────────────────────────────────
page += 1; y = new_page(c, page)
y = section(c, y, "ASCII EASTER EGG GALLERY — THE EMOTION ENGINE", HEART)
y -= 4*mm

gallery = [
    "┌───────────────────────────────────────────────────────┐",
    "│  BADGE UNLOCKED                                         │",
    "│                                                         │",
    "│  ♡\xb7●\xb7♡  JOY SIGNAL  [UNCOMMON]                          │",
    "│  ↓ Not happiness — joy. Joy arrives from underneath,     │",
    "│    independent of events. It is the signal that you are  │",
    "│    in the right place, doing the right thing.            │",
    "│                                                         │",
    "│  ◌\xb7●\xb7◌  SHAME NAMED  [EPIC]                             │",
    "│  ↓ Shame needs secrecy, silence, and judgment to survive.│",
    "│    When you name it here, you remove one leg of the stool.│",
    "│    The naming is the antidote. ◌\xb7●\xb7◌              │",
    "│                                                         │",
    "│  ♡\xb7∞\xb7♡  AWE FOUND  [EPIC]                               │",
    "│  ↓ Awe: small and expanded simultaneously. Research     │",
    "│    shows awe reduces inflammation, shifts perspective     │",
    "│    from self to world. The practice made room for it.    │",
    "│                                                         │",
    "│  ♡\xb7◉\xb7♡  THE WONDER ENGINE  [COSMIC]                      │",
    "│  ↓ Engine 40. The 50th badge engine milestone.          │",
    "│    Water through Dream through Emotion — 40 frequencies.  │",
    "│    1,370 badges. One terminal. The full spectrum.        │",
    "│                                                         │",
    "│  ◈\xb7◈\xb7♡\xb7∞  FORTY REGISTERS  [COSMIC]                   │",
    "│  ↓ Every vocabulary LOT has named. 40 frequencies.      │",
    "│    One terminal. The full spectrum of a human life.      │",
    "└───────────────────────────────────────────────────────┘",
]
c.setFillColor(PANEL); c.rect(M, y - len(gallery)*4.5*mm, CW, len(gallery)*4.5*mm + 2*mm, fill=1, stroke=0)
c.setStrokeColor(HEART); c.setLineWidth(0.5)
c.rect(M, y - len(gallery)*4.5*mm, CW, len(gallery)*4.5*mm + 2*mm, fill=0, stroke=1)
mono(c, 7); c.setFillColor(HEART)
gy = y - 2*mm
for line in gallery:
    c.drawString(M + 4*mm, gy, line)
    gy -= 4.5*mm
y = gy - 4*mm

# Flavor text
y = section(c, y, "FLAVOR TEXT — THE EMOTION ENGINE", HEART2)
y -= 3*mm
flavor = [
    '"Joy is not the goal — it is the signal. The practice is not the pursuit of one emotion',
    ' over others; it is the cultivation of a system that can read all signals accurately."',
    "",
    '"Robert Plutchik, 1927–2006. His wheel arranged eight primary emotions as opposite pairs.',
    ' Joy + Trust = Love. Fear + Surprise = Awe. The wheel is a map that ends being lost."',
    "",
    '"William James, 1884: What is an Emotion? We do not tremble because we are afraid;',
    ' we are afraid because we tremble. The body leads. The practice follows."',
    "",
    '"Bren\xe9 Brown on shame: Shame needs secrecy, silence, and judgment to survive.',
    ' This entry named it. The naming is the antidote. ◌\xb7●\xb7◌"',
]
mono(c, 7); c.setFillColor(FG2)
for line in flavor:
    if line == "":
        y -= 2*mm
        continue
    c.drawString(M + 4*mm, y, line)
    y -= 4.5*mm

# ── PAGE 5: IMPLEMENTATION STATUS + ENGINE LINEAGE ────────────────────────────
page += 1; y = new_page(c, page)
y = section(c, y, "IMPLEMENTATION STATUS — v50", HEART)
y -= 3*mm
impl = [
    "badges.ts:          BadgeType union        +31 types added",
    "badges.ts:          BADGE_METADATA         +31 metadata objects added",
    "badges.ts:          checkBadges()          v40 logic block added",
    "easter-eggs.ts:     EMOTION_WORD_MAP[]     +12 patterns added (v40)",
    "easter-eggs.ts:     EMOTION_SECRET_WORDS[] +3 patterns added (Boss v37)",
    "easter-eggs.ts:     checkEmotionEngine()   exported function",
    "easter-eggs.ts:     checkEmotionSession()  exported function",
    "easter-eggs.ts:     checkLongFeeling()     exported function",
    "easter-eggs.ts:     checkDawnFeeling()     exported function",
    "TypeScript:         tsc --noEmit           0 new errors (pre-existing tsconfig warnings only)",
    "PDF:                docs/badges/LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v50.pdf",
]
c.setFillColor(PANEL); c.rect(M, y - len(impl)*5*mm - 4*mm, CW, len(impl)*5*mm + 6*mm, fill=1, stroke=0)
mono(c, 7)
iy = y - 2*mm
for line in impl:
    c.setFillColor(GREEN if "✓" in line or "exported" in line or "+31" in line else FG2)
    c.drawString(M + 4*mm, iy, line)
    iy -= 5*mm
y = iy - 6*mm

y = section(c, y, "WORD TURN ENGINE LINEAGE — v1 TO v40", HEART2)
y -= 3*mm
engines = [
    ("v1",  "SIGNAL CODEX",         "12"), ("v2",  "SCI-FI ARCADE",        "12"),
    ("v5",  "SIGNAL CODEX EXT",     "12"), ("v6",  "THE BECOMING",         "12"),
    ("v30", "THE A.I. ENGINE",       "12"), ("v31", "THE MYTH ENGINE",       "12"),
    ("v32", "THE ARCADE MASTER",    "12"), ("v33", "THE DREAM WEAVER",     "12"),
    ("v34", "THE STOIC FIELD",      "12"), ("v35", "THE ZEN TERMINAL",     "12"),
    ("v36", "THE JAZZ ENGINE",      "12"), ("v37", "THE NATURE SIGNAL",    "12"),
    ("v38", "THE BODY ELECTRIC",    "12"), ("v39", "THE DREAM LABORATORY", "12"),
    ("v40", "THE EMOTION ENGINE",   "12 ← NEW"),
]
for eng, theme, cnt in engines:
    c.setFillColor(ACCENT); c.rect(M, y - 3*mm, CW, 7*mm, fill=1, stroke=0)
    bold(c, 7)
    c.setFillColor(GOLD if "← NEW" in cnt else HEART)
    c.drawString(M + 2*mm, y + 1*mm, eng)
    mono(c, 7); c.setFillColor(FG2)
    c.drawString(M + 18*mm, y + 1*mm, theme)
    mono(c, 7)
    c.setFillColor(GOLD if "← NEW" in cnt else FG3)
    c.drawString(M + 85*mm, y + 1*mm, cnt)
    y -= 8*mm

y -= 6*mm
mono(c, 7); c.setFillColor(FG3)
c.drawCentredString(W/2, y, "LOT Systems Corporation  \xb7  Vadim Marmeladov, CEO  \xb7  Badge Codex v50 — 2026-11-26")
y -= 5*mm
mono(c, 7); c.setFillColor(FG3)
c.drawCentredString(W/2, y, "LOT\xae Founded 7 April 2016  \xb7  COSMO\xae Founded 1 July 2024  \xb7  Made in the USA")

c.save()
print(f"PDF written: {OUT}")
