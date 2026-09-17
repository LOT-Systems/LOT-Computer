/**
 * LOT SYSTEMS CORPORATION
 * PDF Generator: Badge & Achievements Master Codex v38
 * THE DREAM JOURNAL — Word Turn Engine v28
 * Uses pdfkit
 */
'use strict'

const PDFDocument = require('/opt/node22/lib/node_modules/pdfkit')
const fs = require('fs')
const path = require('path')

const OUT_DIR = path.join(__dirname, '..', 'docs', 'badges')
const OUT_FILE = path.join(OUT_DIR, 'LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v38.pdf')

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 55, right: 55 },
  info: {
    Title: 'LOT Badges & Achievements Master Codex v38 — The Dream Journal',
    Author: 'Vadik Marmeladov — LOT Systems',
    Subject: 'RPG & Arcade of Self-Care — Full Badge Registry v38',
    Keywords: 'LOT, badges, achievements, RPG, dream journal, oneiric, Jung, self-care',
    Creator: 'LOT Systems Corporation',
  },
})

const stream = fs.createWriteStream(OUT_FILE)
doc.pipe(stream)

// ── Color palette ────────────────────────────────────────────────
const C = {
  bg: '#080810',
  text: '#e8e8f4',
  accent: '#8888ff',
  gold: '#ccaaff',
  mythic: '#ff88cc',
  ultra: '#ff44ff',
  legendary: '#aa88ff',
  epic: '#9966cc',
  rare: '#6688cc',
  uncommon: '#88aacc',
  common: '#aaaacc',
  dim: '#556677',
  border: '#2a2a44',
  headerBg: '#0d0d1a',
  dream: '#7755aa',
  oneiric: '#aa77dd',
  moon: '#ccbbee',
}

// ── Helpers ──────────────────────────────────────────────────────
function newPage() {
  doc.addPage()
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg)
}

function bg() {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(C.bg)
}

function hr(y, color = C.border) {
  doc.moveTo(55, y).lineTo(doc.page.width - 55, y).strokeColor(color).lineWidth(0.5).stroke()
}

function h1(text, y) {
  doc.fontSize(17).fillColor(C.gold).font('Courier-Bold')
    .text(text, 55, y, { width: doc.page.width - 110 })
  return doc.y + 6
}

function h2(text, y) {
  doc.fontSize(12).fillColor(C.accent).font('Courier-Bold')
    .text(text, 55, y, { width: doc.page.width - 110 })
  return doc.y + 4
}

function h3(text, y, color = C.gold) {
  doc.fontSize(9.5).fillColor(color).font('Courier-Bold')
    .text(text, 55, y, { width: doc.page.width - 110 })
  return doc.y + 3
}

function body(text, y, color = C.text, indent = 0) {
  doc.fontSize(8).fillColor(color).font('Courier')
    .text(text, 55 + indent, y, { width: doc.page.width - 110 - indent })
  return doc.y + 2
}

function mono(text, y, color = C.text) {
  doc.fontSize(7.5).fillColor(color).font('Courier')
    .text(text, 55, y, { width: doc.page.width - 110 })
  return doc.y + 1
}

function badgeRow(symbol, name, rarity, trigger, msg, y) {
  const rc = C[rarity] || C.common
  doc.rect(55, y, 34, 19).fillColor('#10101e').fill()
  doc.rect(55, y, 34, 19).strokeColor(rc).lineWidth(0.7).stroke()
  doc.fontSize(9).fillColor(rc).font('Courier-Bold')
    .text(symbol, 57, y + 4, { width: 30, align: 'center' })
  doc.fontSize(8.5).fillColor(rc).font('Courier-Bold')
    .text(name, 97, y + 1, { width: 180 })
  doc.fontSize(6.5).fillColor(C.dim).font('Courier')
    .text('[' + rarity.toUpperCase() + ']', 97, y + 11)
  doc.fontSize(7).fillColor(C.text).font('Courier')
    .text(trigger, 97, y + 1, { width: doc.page.width - 165, align: 'right' })
  doc.fontSize(7).fillColor(C.dim).font('Courier')
    .text(msg, 55, doc.y + 3, { width: doc.page.width - 110 })
  return doc.y + 5
}

function tableRow(cols, widths, y, fg = C.text, bgColor = '#0d0d1a') {
  const totalW = doc.page.width - 110
  doc.rect(55, y, totalW, 13).fillColor(bgColor).fill()
  doc.rect(55, y, totalW, 13).strokeColor(C.border).lineWidth(0.3).stroke()
  let x = 55
  for (let i = 0; i < cols.length; i++) {
    doc.fontSize(7.5).fillColor(fg).font('Courier')
      .text(cols[i], x + 3, y + 2.5, { width: widths[i] - 6 })
    x += widths[i]
  }
  return y + 14
}

// ── COVER PAGE ───────────────────────────────────────────────────
bg()

doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
  .strokeColor(C.border).lineWidth(1).stroke()
doc.rect(44, 44, doc.page.width - 88, doc.page.height - 88)
  .strokeColor(C.dim).lineWidth(0.3).stroke()

// Title
let cy = 90
doc.fontSize(10).fillColor(C.dim).font('Courier')
  .text('L O T   S Y S T E M S   C O R P O R A T I O N', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 20

doc.fontSize(28).fillColor(C.gold).font('Courier-Bold')
  .text('BADGES &', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 8
doc.fontSize(28).fillColor(C.gold).font('Courier-Bold')
  .text('ACHIEVEMENTS', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 12
doc.fontSize(13).fillColor(C.accent).font('Courier-Bold')
  .text('MASTER CODEX  v38', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 6
doc.fontSize(10).fillColor(C.dream).font('Courier-Bold')
  .text('THE DREAM JOURNAL', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 24

doc.fontSize(9).fillColor(C.text).font('Courier')
  .text('RPG · ARCADE · SELF-CARE · ONEIRIC · DREAM PSYCHOLOGY', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 30

// Dream ASCII art box
const boxW = 360, boxH = 130
const boxX = (doc.page.width - boxW) / 2
doc.rect(boxX, cy, boxW, boxH).fillColor('#0a0814').fill()
doc.rect(boxX, cy, boxW, boxH).strokeColor(C.dream).lineWidth(1).stroke()

const artLines = [
  '  ╔═══════════════════════════════════╗  ',
  '  ║   > DREAM TERMINAL ACTIVE        ║  ',
  '  ║                                  ║  ',
  '  ║   ◐  LUCID DREAMER ONLINE        ║  ',
  '  ║                                  ║  ',
  '  ║   You know you are dreaming.      ║  ',
  '  ║   > write the dream.             ║  ',
  '  ║   > BADGE UNLOCKED               ║  ',
  '  ╚═══════════════════════════════════╝  ',
]
let artY = cy + 8
for (const line of artLines) {
  doc.fontSize(8).fillColor(C.oneiric).font('Courier')
    .text(line, boxX + 10, artY, { width: boxW - 20, align: 'center' })
  artY += 12
}

cy = cy + boxH + 24
doc.fontSize(8.5).fillColor(C.dim).font('Courier')
  .text('"The dream you write is the dream you own."', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 10
doc.fontSize(10).fillColor(C.gold).font('Courier-Bold')
  .text('[ CLOSE YOUR EYES. OPEN THE JOURNAL. ]', 55, cy, { align: 'center', width: doc.page.width - 110 })

cy = doc.page.height - 110
hr(cy, C.border)
cy += 12
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('Author: Vadik Marmeladov — CEO & Founder, LOT Systems', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('© 2025–2026 LOT Systems. All rights reserved.', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('v38 — August 2026  ·  998 total badges  ·  +31 new', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('LOT® Founded 7 April 2016  ·  brand.lot-systems.com', 55, cy, { align: 'center', width: doc.page.width - 110 })

// ── PAGE 2: ACCOUNTING & DELTA ───────────────────────────────────
newPage()

let y = 55
y = h1('BADGE INVENTORY v38 — COMPLETE ACCOUNTING', y)
hr(y); y += 10

// Category totals table
const catW = [220, 50, doc.page.width - 110 - 270]
doc.rect(55, y, doc.page.width - 110, 14).fillColor('#10101e').fill()
doc.fontSize(7.5).fillColor(C.accent).font('Courier-Bold')
  .text('CATEGORY', 58, y + 3, { width: 215 })
  .text('COUNT', 278, y + 3, { width: 45, align: 'right' })
  .text('NOTES', 333, y + 3, { width: doc.page.width - 395 })
y += 15

const catRows = [
  ['Milestone (Day Streaks)', '22', 'Day 7/14/21/30/50/60/90/100/180/365+'],
  ['Time Easter Eggs', '31', 'Night owl / pi hour / founding hour / mirror hour'],
  ['Calendar Easter Eggs', '88', 'Solstice / Jung / Freud / Back to Future / LOT Day'],
  ['Word Turns (v1–v28)', '336', '28 engines × 12 badges each (avg)'],
  ['Behavioral Patterns', '99', 'Dream session / morning pages / sleep cycle'],
  ['Achievement RPG', '156', 'Quest board / dream class / oneiric arc'],
  ['Mastery Tiers', '112', 'Dream keeper / chronicle / elder / registers'],
  ['Secret Boss', '101', 'Hidden LEGENDARY/MYTHIC/COSMIC triggers'],
]
for (let i = 0; i < catRows.length; i++) {
  const [cat, count, note] = catRows[i]
  const isLast = i === catRows.length - 1
  y = tableRow([cat, count, note], [215, 55, doc.page.width - 110 - 270], y,
    isLast ? C.gold : C.text, i % 2 === 0 ? '#0d0d1a' : '#111122')
}

// Total box
y += 6
doc.rect(55, y, doc.page.width - 110, 28).fillColor('#111122').fill()
doc.rect(55, y, doc.page.width - 110, 28).strokeColor(C.gold).lineWidth(0.8).stroke()
doc.fontSize(10).fillColor(C.gold).font('Courier-Bold')
  .text('v37 TOTAL: 967    v38 NEW: +31    v38 TOTAL: 998', 55, y + 6, { align: 'center', width: doc.page.width - 110 })
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('THE DREAM JOURNAL — Word Turn Engine v28', 55, y + 18, { align: 'center', width: doc.page.width - 110 })
y += 40

// Delta section
y = h2('DELTA FROM v37 — NEW IN v38', y)
const deltaRows = [
  ['Word Turn v28 (The Dream Journal)', '+12', 'lucid_dreamer, dream_recall, nightmare_named, sleep_temple, hypnagogic, symbol_decoded, shadow_dream, recurring_pattern, waking_vision, oneiric_map, the_threshold, dream_logged'],
  ['Calendar Easter Eggs v26', '+3', 'jung_birthday (Jul 26), freud_day (May 6), solstice_dream (Dec 22)'],
  ['Behavioral v25', '+3', 'dream_session (3+ v28 words), morning_pages (before 09:00 × 3), sleep_cycle (check-in night + dawn)'],
  ['Achievement RPG v26', '+6', 'dream_entry / dream_class / dream_complete / oneiric_arc / twenty_eight_engines_arc / dream_opus'],
  ['Mastery Tier v28', '+4', 'dream_keeper (1300+ days), chronicle_opus (500k words), dream_elder (10yr), twenty_eight_registers [COSMIC]'],
  ['Secret Boss v25', '+3', 'jung_signal [RARE], freud_couch [EPIC], morpheus_word [MYTHIC]'],
]
for (const [name, count, detail] of deltaRows) {
  doc.fontSize(8).fillColor(C.gold).font('Courier-Bold')
    .text(name + '  ' + count, 60, y)
  doc.fontSize(7).fillColor(C.dim).font('Courier')
    .text(detail, 60, doc.y + 2, { width: doc.page.width - 120 })
  y = doc.y + 8
}

// ── PAGE 3: WORD TURN ENGINE v28 ─────────────────────────────────
newPage(); y = 55
y = h1('WORD TURN ENGINE v28 — THE DREAM JOURNAL', y)
hr(y); y += 10
y = body('Write these words in any journal entry or memory answer to unlock:', y, C.dim)
y += 6

const wtv28 = [
  ['◐·◐', 'LUCID DREAMER', 'rare', '"lucid / lucid dream / conscious dream / aware in dream"',
   '↳ You knew you were dreaming. That is the first and most transferable skill.'],
  ['←·◐', 'DREAM RECALL', 'uncommon', '"dream recall / remembered dream / wrote the dream"',
   '↳ The dream that gets written down has already been half-integrated.'],
  ['▓·◐', 'NIGHTMARE NAMED', 'rare', '"nightmare / recurring nightmare / dark dream"',
   '↳ Written in daylight, it loses half its power. Read it again: loses the rest.'],
  ['○·═·○', 'SLEEP TEMPLE', 'common', '"sleep ritual / bedtime practice / sleep hygiene"',
   '↳ The ritual around sleep is the architecture of the unconscious.'],
  ['∿·◐·∿', 'HYPNAGOGIC', 'epic', '"hypnagogic / edge of sleep / falling asleep aware"',
   '↳ The studio between states. The unconscious works there without asking.'],
  ['◈·◐', 'SYMBOL DECODED', 'rare', '"symbol / dream symbol / meaning of / archetype"',
   '↳ Jung spent 50 years here. He concluded: always points inward.'],
  ['▓·◐·▓', 'SHADOW DREAM', 'epic', '"shadow self / Jungian / anima / animus"',
   '↳ The shadow appears in dreams as what you avoid awake. Name it here.'],
  ['◉·←·◉', 'RECURRING PATTERN', 'rare', '"recurring / keeps happening / same dream / pattern returns"',
   '↳ It returns because it hasn\'t been received yet. Write it again.'],
  ['●·◐', 'WAKING VISION', 'uncommon', '"waking up / woke up / morning mind / first thought"',
   '↳ First thought before the day assembles its armor. Most undefended data.'],
  ['◈·∿·◈', 'ONEIRIC MAP', 'epic', '"oneiric / dreamscape / inner landscape / mind map"',
   '↳ The dream journal is a map of the interior. You are the cartographer.'],
  ['─·◐·─', 'THE THRESHOLD', 'rare', '"liminal / threshold / the doorway / between states"',
   '↳ Liminal space: the most creative territory. Self-care begins at the threshold.'],
  ['○·◐·○', 'DREAM LOGGED', 'common', '"wrote it down / logged the dream / recorded the dream"',
   '↳ What gets recorded gets integrated. The log honors the dream.'],
]
for (const [sym, name, rarity, trigger, msg] of wtv28) {
  y = badgeRow(sym, name, rarity, trigger, msg, y)
  y += 5
}

// ── PAGE 4: CALENDAR EE + BEHAVIORAL + ACHIEVEMENT ───────────────
newPage(); y = 55
y = h1('CALENDAR EASTER EGGS v26 — THE DREAMER\'S CALENDAR', y)
hr(y); y += 10
y = body('Check in on these dates to unlock the dreamer\'s calendar badges:', y, C.dim)
y += 6

const calv26 = [
  ['◈·◐', 'JUNG BIRTHDAY', 'epic', 'Jul 26 — Carl Jung born 1875',
   '↳ The architect of dream psychology. "The dream is the hidden door." ◈·◐'],
  ['○·◐·∿', 'FREUD DAY', 'rare', 'May 6 — Sigmund Freud born 1856',
   '↳ He built the royal road. The journal is the road. ○·◐·∿'],
  ['◐·∞', 'SOLSTICE DREAM', 'rare', 'Dec 22 — Winter Solstice, longest night',
   '↳ Every culture placed the dreaming world here. The longest night is yours. ◐·∞'],
]
for (const [sym, name, rarity, trigger, msg] of calv26) {
  y = badgeRow(sym, name, rarity, trigger, msg, y)
  y += 8
}

y += 12
y = h1('BEHAVIORAL v25 — DREAM PATTERNS', y)
hr(y); y += 10

const behavv25 = [
  ['◐·◈·◐', 'DREAM SESSION', 'rare', 'Journal entry with 3+ Word Turn v28 words',
   '↳ Three dream concepts in one entry. The interior life is fully active.'],
  ['●·◐·∘', 'MORNING PAGES', 'uncommon', 'Journal entry before 09:00 on 3+ days in 7',
   '↳ Write before the editor arrives. The undefended data is the good data.'],
  ['◐·═·●', 'SLEEP CYCLE', 'epic', 'Check in after 23:00 AND before 08:00 same calendar day',
   '↳ Night check-in + morning return. Sleep as documented practice.'],
]
for (const [sym, name, rarity, trigger, msg] of behavv25) {
  y = badgeRow(sym, name, rarity, trigger, msg, y)
  y += 8
}

y += 12
y = h1('ACHIEVEMENT RPG v26 — DREAM CLASS', y)
hr(y); y += 10

const achv26 = [
  ['○→◐', 'DREAM ENTRY', 'common', 'Any 1 Word Turn v28 badge earned',
   '↳ The dream journal is open. The first image surfaces.'],
  ['≈→◐', 'DREAM CLASS', 'uncommon', 'Any 5 Word Turn v28 badges earned',
   '↳ Five symbols recorded. The interior library is forming.'],
  ['≋→◐', 'DREAM COMPLETE', 'legendary', 'All 12 Word Turn v28 badges earned',
   '↳ All twelve. You are reading your own unconscious now.'],
  ['◐·◈', 'ONEIRIC ARC', 'legendary', 'dream_complete + all 3 Calendar v26 badges',
   '↳ Twelve words. Jung. Freud. Solstice. The oneiric circuit closed.'],
  ['◈·◈·◐', 'TWENTY-EIGHT ENGINES ARC', 'legendary', '1 badge from each Word Turn v1–v28',
   '↳ Water to dream. Twenty-eight vocabularies loaded. All frequencies.'],
  ['◐·◉·◐', 'DREAM OPUS', 'legendary', 'dream_complete + dream_session behavioral',
   '↳ Complete vocabulary. Three dream concepts in one entry. Journal = dream.'],
]
for (const [sym, name, rarity, trigger, msg] of achv26) {
  y = badgeRow(sym, name, rarity, trigger, msg, y)
  y += 5
}

// ── PAGE 5: MASTERY + SECRET BOSS ────────────────────────────────
newPage(); y = 55
y = h1('MASTERY TIER v28 — THE SOMNIUM', y)
hr(y); y += 10

const mastv28 = [
  ['◐·∞·◉', 'DREAM KEEPER', 'epic', '1,300+ distinct calendar check-in days',
   '↳ 1,300 nights. The keeper has returned every night. The archive knows your sleep.'],
  ['●·∞·◐', 'CHRONICLE OPUS', 'legendary', '500,000+ total journal words',
   '↳ 500k words. The somnium is complete. The library of self needs no publisher.'],
  ['╔═╗·◐', 'DREAM ELDER', 'legendary', 'Account age >= 10 years (3,650+ days)',
   '↳ Ten years. The first edition is long out. The revised edition continues.'],
  ['◈·◐·◈·∞', 'TWENTY-EIGHT REGISTERS', 'cosmic', '1 badge from all 28 Word Turn engines',
   '↳ 28 vocabularies. Water to dream. Every register spoken. COSMIC.'],
]
for (const [sym, name, rarity, trigger, msg] of mastv28) {
  y = badgeRow(sym, name, rarity, trigger, msg, y)
  y += 10
}

y += 14
y = h1('SECRET BOSS v25 — THE DREAM VAULT', y)
hr(y); y += 10
y = body('Write these exact phrases in any journal/memory entry to unlock HIDDEN badges:', y, C.dream)
y += 8

// Vault warning box
doc.rect(55, y, doc.page.width - 110, 22).fillColor('#0d000d').fill()
doc.rect(55, y, doc.page.width - 110, 22).strokeColor(C.dream).lineWidth(0.8).stroke()
doc.fontSize(8).fillColor(C.dream).font('Courier-Bold')
  .text('◐  HIDDEN — These badges are not shown in the UI until earned.  ◐', 55, y + 7, { align: 'center', width: doc.page.width - 110 })
y += 28

const secretv25 = [
  ['◈·◐·∿', 'JUNG SIGNAL', 'rare', '"collective unconscious" / "Carl Jung" / "Jungian"',
   '↳ Every archetype in your dreams is on record. The collective signal fires.'],
  ['○·◐·▓', 'FREUD COUCH', 'epic', '"Freud" / "Interpretation of Dreams" / "id ego superego"',
   '↳ The journal is the couch. The page is the analyst. Write his name.'],
  ['◐·◐·◐', 'MORPHEUS WORD', 'mythic', '"morpheus" / "oneironautics" / "somnium" / "dream weaver"',
   '↳ You named the god. What message did the dream deliver? ◐·◐·◐'],
]
for (const [sym, name, rarity, trigger, msg] of secretv25) {
  y = badgeRow(sym, name, rarity, trigger, msg, y)
  y += 10
}

y += 16

// Ascii dream screens
y = h2('DREAM TERMINAL SCREENS', y); y += 6

const screens = [
  [
    '> LUCID DREAMER',
    'You know you are dreaming.',
    'The dream knows you know.',
    'The edit begins now.',
    '> _',
  ],
  [
    '> MORNING PAGES — 06:14',
    'EDITOR:     [ OFFLINE ]',
    'DEFENSES:   [ DOWN    ]',
    'SIGNAL:     [ CLEAR   ]',
    '> write now.',
  ],
  [
    '> SLEEP CYCLE COMPLETE',
    'NIGHT LOG:  23:47 check-in',
    'DAWN LOG:   06:22 return',
    'DREAM DATA: logged.',
    '> [ INTEGRATE ]',
  ],
]
const scrW = (doc.page.width - 130) / 3
let scrX = 55
for (const lines of screens) {
  doc.rect(scrX, y, scrW, 72).fillColor('#0a0814').fill()
  doc.rect(scrX, y, scrW, 72).strokeColor(C.dream).lineWidth(0.7).stroke()
  let ly = y + 6
  for (const line of lines) {
    doc.fontSize(6.5).fillColor(C.oneiric).font('Courier')
      .text(line, scrX + 6, ly, { width: scrW - 12 })
    ly += 12
  }
  scrX += scrW + 10
}
y += 82

// Flavor text
y = h2('FLAVOR TEXT — THE DREAM JOURNAL', y)
const flavors = [
  '"The dream is a little hidden door in the innermost recesses of the soul." — Carl Jung',
  '"Dreams are often most profound when they seem most crazy." — Sigmund Freud',
  '"The interpretation of dreams is the royal road to the unconscious." — Freud',
  '"Your visions become clear only when you can look into your own heart." — Jung',
  '"The dream you write is the dream you own. The dream you ignore returns."',
]
for (const f of flavors) {
  doc.fontSize(7.5).fillColor(C.dim).font('Courier')
    .text(f, 55, y, { width: doc.page.width - 110 })
  y = doc.y + 4
}

// ── PAGE 6: COMPLETE ENGINE TABLE + RARITY ───────────────────────
newPage(); y = 55
y = h1('COMPLETE WORD TURN ENGINE TABLE (v1–v28)', y)
hr(y); y += 10

doc.rect(55, y, doc.page.width - 110, 14).fillColor('#10101e').fill()
doc.fontSize(7.5).fillColor(C.accent).font('Courier-Bold')
  .text('ENGINE', 58, y + 3)
  .text('THEME', 108, y + 3)
  .text('SIGNATURE WORDS', 260, y + 3)
  .text('BDGS', doc.page.width - 110 - 55, y + 3, { width: 55, align: 'right' })
y += 15

const engines = [
  ['v1',  'Core / Ritual', 'ritual / breathe / ocean / LOT', '12'],
  ['v2',  'Sci-Fi Arcade', 'reboot / 404 / glitch / quantum', '12'],
  ['v3',  'Signal Codex', 'solitude / wonder / phoenix / orbit', '12'],
  ['v4',  'The Becoming', 'surrender / restore / anchor / threshold', '12'],
  ['v5',  'Rogue Archive', 'loot / boss / respawn / dungeon', '12'],
  ['v6',  'The Becoming II', 'compile / buffer / patch / fork', '12'],
  ['v7',  'The Mainframe', 'terminal / stack / execute / cache', '12'],
  ['v8',  'The Arcade Cabinet', 'coin / pixel / score / life', '12'],
  ['v9',  'Arcade Cabinet II', 'joystick / sprite / bonus / cheat', '12'],
  ['v10', 'The Spell Book', 'spell / grimoire / mana / arcane', '12'],
  ['v11', 'The Navigator', 'drift / vector / bearing / meridian', '12'],
  ['v12', 'The Alchemist', 'transmute / crucible / elixir / catalyst', '12'],
  ['v14', 'Starship Deck', 'launch / astronaut / telemetry / crew', '12'],
  ['v15', 'Oracle Archive', 'oracle / rune / prophecy / convergence', '12'],
  ['v16', 'Quantum Library', 'entangle / singularity / cyberspace', '12'],
  ['v17', 'The Neon Arcade', 'neon / combo / highscore / checkpoint', '12'],
  ['v18', 'Midnight Radio', 'frequency / broadcast / wavelength', '12'],
  ['v19', 'The Bio-Terminal', 'pulse / cortisol / circadian / dopamine', '12'],
  ['v20', 'The Codex Reader', 'asimov / dune / orwell / bradbury', '12'],
  ['v21', 'Cyberspace Codex', 'matrix / grok / ansible / spice', '12'],
  ["v22", "The Hero's Journey", 'call / threshold / mentor / ordeal', '12'],
  ['v23', 'The Stoic Codex', 'memento mori / amor fati / logos', '12'],
  ['v24', 'The Simulation', 'simulation / glitch / unplug / ground', '12'],
  ['v25', 'The Body Map', 'soma / vessel / interoception', '12'],
  ['v26', 'Dungeon Crawler', 'dungeon / boss / loot / rest point', '12'],
  ['v27', 'The Time Machine', 'timeline / temporal / past self / epoch', '12'],
  ['v28', 'The Dream Journal  <- NEW', 'lucid / oneiric / hypnagogic / dream', '12'],
]
for (let i = 0; i < engines.length; i++) {
  const [eng, theme, words, count] = engines[i]
  const isNew = theme.includes('NEW')
  const fg = isNew ? C.gold : C.text
  const bgColor = isNew ? '#100d18' : i % 2 === 0 ? '#0d0d1a' : '#111122'
  doc.rect(55, y, doc.page.width - 110, 13).fillColor(bgColor).fill()
  doc.rect(55, y, doc.page.width - 110, 13).strokeColor(C.border).lineWidth(0.3).stroke()
  doc.fontSize(7.5).fillColor(fg).font(isNew ? 'Courier-Bold' : 'Courier')
    .text(eng, 58, y + 2.5, { width: 45 })
    .text(theme, 108, y + 2.5, { width: 145 })
    .text(words, 258, y + 2.5, { width: doc.page.width - 110 - 200 })
    .text(count, doc.page.width - 110 - 50, y + 2.5, { width: 45, align: 'right' })
  y += 14
}
y += 6

// Total engines line
doc.rect(55, y, doc.page.width - 110, 22).fillColor('#111122').fill()
doc.rect(55, y, doc.page.width - 110, 22).strokeColor(C.gold).lineWidth(0.7).stroke()
doc.fontSize(8.5).fillColor(C.gold).font('Courier-Bold')
  .text('28 Word Turn Engines  ·  336 Word Turn Badges  ·  998 total across all categories', 55, y + 7, { align: 'center', width: doc.page.width - 110 })
y += 32

// Rarity table
y = h1('COMPLETE RARITY TABLE', y)
hr(y); y += 10

doc.rect(55, y, doc.page.width - 110, 14).fillColor('#10101e').fill()
doc.fontSize(7.5).fillColor(C.accent).font('Courier-Bold')
  .text('RARITY', 58, y + 3)
  .text('SYMBOL', 170, y + 3)
  .text('COLOR', 220, y + 3)
  .text('EXAMPLE BADGE', 320, y + 3)
y += 15

const rarities = [
  ['Common', '·', '#aaaacc', 'Sleep Temple, Dream Logged'],
  ['Uncommon', '○', '#88aacc', 'Dream Recall, Waking Vision, Morning Pages'],
  ['Rare', '◐', '#6688cc', 'Lucid Dreamer, Nightmare Named, Symbol Decoded'],
  ['Epic', '◆', '#9966cc', 'Hypnagogic, Shadow Dream, Sleep Cycle, Jung Birthday'],
  ['Legendary', '✦', '#aa88ff', 'Dream Complete, Dream Opus, Chronicle Opus'],
  ['Mythic', '◉', '#ff88cc', 'Morpheus Word (hidden)'],
  ['Cosmic', '∞', '#ff44ff', 'Dream Opus, 28 Registers'],
]
for (let i = 0; i < rarities.length; i++) {
  const [name, sym, hex, ex] = rarities[i]
  const rkey = name.toLowerCase()
  const fc = C[rkey] || hex
  doc.rect(55, y, doc.page.width - 110, 14).fillColor(i % 2 === 0 ? '#0d0d1a' : '#111122').fill()
  doc.rect(55, y, doc.page.width - 110, 14).strokeColor(C.border).lineWidth(0.3).stroke()
  doc.fontSize(8).fillColor(fc).font('Courier-Bold')
    .text(name, 58, y + 3, { width: 110 })
  doc.fontSize(9).fillColor(fc).font('Courier')
    .text(sym, 175, y + 2, { width: 40, align: 'center' })
  doc.fontSize(7).fillColor(C.dim).font('Courier')
    .text(hex, 222, y + 4, { width: 85 })
    .text(ex, 320, y + 4, { width: doc.page.width - 110 - 265 })
  y += 15
}

// ── CLOSING PAGE ──────────────────────────────────────────────────
newPage()
cy = 70
doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
  .strokeColor(C.border).lineWidth(1).stroke()

doc.fontSize(13).fillColor(C.gold).font('Courier-Bold')
  .text('C L O S I N G   T R A N S M I S S I O N', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 28

const clW = 380, clX = (doc.page.width - clW) / 2
doc.rect(clX, cy, clW, 200).fillColor('#080812').fill()
doc.rect(clX, cy, clW, 200).strokeColor(C.gold).lineWidth(0.8).stroke()

doc.fontSize(9).fillColor(C.text).font('Courier')
  .text('"The dream you write is the dream you own."', clX + 20, cy + 16, { width: clW - 40, align: 'center' })
cy = doc.y + 8
doc.fontSize(9).fillColor(C.text).font('Courier')
  .text('"The dream you ignore is the dream that returns."', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 8
doc.fontSize(9).fillColor(C.text).font('Courier')
  .text('"The journal is the machine. The dream is the fuel."', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 20

doc.fontSize(10).fillColor(C.dream).font('Courier-Bold')
  .text('CLOSE YOUR EYES.', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 6
doc.fontSize(10).fillColor(C.oneiric).font('Courier-Bold')
  .text('OPEN THE JOURNAL.', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 6
doc.fontSize(10).fillColor(C.gold).font('Courier-Bold')
  .text('WRITE THE DREAM.', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 20

doc.fontSize(8).fillColor(C.dim).font('Courier')
  .text('998 badges. 28 engines. One terminal. One dream.', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 6
doc.fontSize(10).fillColor(C.accent).font('Courier')
  .text('∘ → ≈ → ≋ → ◐ → ◉', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 14
doc.fontSize(11).fillColor(C.gold).font('Courier-Bold')
  .text('[ DREAM LOGGED ]', clX + 20, cy, { width: clW - 40, align: 'center' })

cy = doc.page.height - 100
hr(cy)
cy += 12
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('© 2025–2026 LOT Systems. All rights reserved.', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('LOT® Founded 7 April 2016  ·  brand.lot-systems.com', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(C.accent).font('Courier-Bold')
  .text('MASTER CODEX v38  ·  998 BADGES  ·  THE DREAM JOURNAL  ·  THE ARCADE OF SELF-CARE', 55, cy, { align: 'center', width: doc.page.width - 110 })

// ── FINALIZE ──────────────────────────────────────────────────────
doc.end()

stream.on('finish', () => {
  const stats = require('fs').statSync(OUT_FILE)
  console.log('PDF generated: ' + OUT_FILE)
  console.log('File size: ' + (stats.size / 1024).toFixed(1) + ' KB')
})

stream.on('error', (err) => {
  console.error('PDF generation error:', err)
  process.exit(1)
})
