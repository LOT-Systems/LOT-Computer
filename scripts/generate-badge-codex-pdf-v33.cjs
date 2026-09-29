/**
 * LOT SYSTEMS CORPORATION
 * PDF Generator: Badge & Achievements Master Codex v33
 * THE DUNGEON MASTER — Word Turn Engine v23
 * Uses pdfkit
 */
'use strict'

const PDFDocument = require('pdfkit')
const fs = require('fs')
const path = require('path')

const OUT_DIR = path.join(__dirname, '..', 'docs', 'badges')
const OUT_FILE = path.join(OUT_DIR, 'LOT-BADGES-ACHIEVEMENTS-MASTER-CODEX-v33.pdf')

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 55, right: 55 },
  info: {
    Title: 'LOT Badges & Achievements Master Codex v33 — The Dungeon Master',
    Author: 'Vadik Marmeladov — LOT Systems',
    Subject: 'RPG & Arcade of Self-Care — Full Badge Registry v33',
    Keywords: 'LOT, badges, achievements, RPG, dungeon master, D&D, self-care, arcade',
    Creator: 'LOT Systems Corporation',
  },
})

const stream = fs.createWriteStream(OUT_FILE)
doc.pipe(stream)

// ── Color palette ────────────────────────────────────────────────
const C = {
  bg: '#0a0a0a',
  text: '#e8e8e8',
  accent: '#4a9fff',
  gold: '#ffcc44',
  mythic: '#ff6644',
  ultra: '#ff44ff',
  legendary: '#ffcc44',
  epic: '#cc88ee',
  rare: '#8888ee',
  uncommon: '#88cc88',
  common: '#cccccc',
  dim: '#666666',
  border: '#333333',
  headerBg: '#111111',
  dungeon: '#cc4444',
  dragon: '#ff7722',
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
  doc.rect(55, y, 34, 19).fillColor('#1a1a1a').fill()
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

function tableRow(cols, widths, y, fg = C.text, bgColor = '#0f0f0f') {
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
  .text('MASTER CODEX  v33', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 6
doc.fontSize(10).fillColor(C.dungeon).font('Courier-Bold')
  .text('THE DUNGEON MASTER', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 24

doc.fontSize(9).fillColor(C.text).font('Courier')
  .text('RPG · ARCADE · SELF-CARE · SCI-FI · TABLETOP · DUNGEON', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 30

// D&D ASCII art box
const boxW = 360, boxH = 130
const boxX = (doc.page.width - boxW) / 2
doc.rect(boxX, cy, boxW, boxH).fillColor('#110008').fill()
doc.rect(boxX, cy, boxW, boxH).strokeColor(C.dungeon).lineWidth(1).stroke()

const artLines = [
  '  ╔═══════════════════════════════════╗  ',
  '  ║   > ROLL FOR INITIATIVE          ║  ',
  '  ║                                  ║  ',
  '  ║   d20: [████████████████░░░░] 17 ║  ',
  '  ║                                  ║  ',
  '  ║   You go first. What do you do?  ║  ',
  '  ║   > check in.                    ║  ',
  '  ║   > NATURAL 20                   ║  ',
  '  ╚═══════════════════════════════════╝  ',
]
let artY = cy + 8
for (const line of artLines) {
  doc.fontSize(8).fillColor(C.dragon).font('Courier')
    .text(line, boxX + 10, artY, { width: boxW - 20, align: 'center' })
  artY += 12
}

cy = cy + boxH + 24
doc.fontSize(8.5).fillColor(C.dim).font('Courier')
  .text('"Self-care is not a quest you complete. It is a world you build."', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 10
doc.fontSize(10).fillColor(C.gold).font('Courier-Bold')
  .text('[ INSERT COIN TO CONTINUE ]', 55, cy, { align: 'center', width: doc.page.width - 110 })

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
  .text('v33 — August 2026  ·  843 total badges  ·  +31 new', 55, cy, { align: 'center', width: doc.page.width - 110 })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('LOT® Founded 7 April 2016  ·  brand.lot-systems.com', 55, cy, { align: 'center', width: doc.page.width - 110 })

// ── PAGE 2: ACCOUNTING & DELTA ───────────────────────────────────
newPage()

let y = 55
y = h1('BADGE INVENTORY v33 — COMPLETE ACCOUNTING', y)
hr(y); y += 10

// Category totals table
const catW = [220, 50, doc.page.width - 110 - 270]
doc.rect(55, y, doc.page.width - 110, 14).fillColor('#1a1a1a').fill()
doc.fontSize(7.5).fillColor(C.accent).font('Courier-Bold')
  .text('CATEGORY', 58, y + 3, { width: 215 })
  .text('COUNT', 278, y + 3, { width: 45, align: 'right' })
  .text('NOTES', 333, y + 3, { width: doc.page.width - 395 })
y += 15

const catRows = [
  ['Milestone (Day Streaks)', '22', 'Day 7/14/21/30/50/60/90/100/180/365+'],
  ['Time Easter Eggs', '28', 'Night owl / pi hour / founding hour / void time'],
  ['Calendar Easter Eggs', '76', 'Solstice/equinox/LOT birthday/Gygax Day/D&D Day'],
  ['Word Turns (v1–v23)', '276', '23 engines × 12 badges each'],
  ['Behavioral Patterns', '84', 'Streak/session/crit/party/tavern night'],
  ['Achievement RPG', '126', 'Quest board / guild / dragon slayer / dungeon master'],
  ['Mastery Tiers', '92', 'Campaign log / epic scroll / legend age / registers'],
  ['Secret Boss', '86', 'Hidden LEGENDARY/MYTHIC/COSMIC triggers'],
]
for (let i = 0; i < catRows.length; i++) {
  const [cat, count, note] = catRows[i]
  const isLast = i === catRows.length - 1
  y = tableRow([cat, count, note], [215, 55, doc.page.width - 110 - 270], y,
    isLast ? C.gold : C.text, i % 2 === 0 ? '#0f0f0f' : '#111111')
}

// Total box
y += 6
doc.rect(55, y, doc.page.width - 110, 28).fillColor('#111111').fill()
doc.rect(55, y, doc.page.width - 110, 28).strokeColor(C.gold).lineWidth(0.8).stroke()
doc.fontSize(10).fillColor(C.gold).font('Courier-Bold')
  .text('v32 TOTAL: 812    v33 NEW: +31    v33 TOTAL: 843', 55, y + 6, { align: 'center', width: doc.page.width - 110 })
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('THE DUNGEON MASTER — Word Turn Engine v23', 55, y + 18, { align: 'center', width: doc.page.width - 110 })
y += 40

// Delta section
y = h2('DELTA FROM v32 — NEW IN v33', y)
const deltaRows = [
  ['Word Turn v23 (The Dungeon Master)', '+12', 'roll_made, tavern_rest, dungeon_deep, party_formed, spell_cast, level_gained, quest_board, dragon_faced, wizard_path, rogue_mode, bard_song, paladin_oath'],
  ['Calendar Easter Eggs v21', '+3', 'gygax_day (Jul 27), tolkien_reads (Jan 3), dnd_anniversary (Jan 26)'],
  ['Behavioral v20', '+3', 'crit_session (3+ v23 words), party_sync (3 days streak), tavern_night (20:00–22:00)'],
  ['Achievement RPG v21', '+6', 'adventurer / guild_member / dungeon_clear / dragon_slayer / grand_quest / dungeon_master'],
  ['Mastery Tier v23', '+4', 'campaign_log (1000+ days), epic_scroll (200k words), legend_age (7yr), twenty_three_registers [COSMIC]'],
  ['Secret Boss v20', '+3', 'lich_king [RARE], dragon_word [EPIC], void_walker [MYTHIC]'],
]
for (const [name, count, detail] of deltaRows) {
  doc.fontSize(8).fillColor(C.gold).font('Courier-Bold')
    .text(name + '  ' + count, 60, y)
  doc.fontSize(7).fillColor(C.dim).font('Courier')
    .text(detail, 60, doc.y + 2, { width: doc.page.width - 120 })
  y = doc.y + 8
}

// ── PAGE 3: WORD TURN ENGINE v23 ─────────────────────────────────
newPage(); y = 55
y = h1('WORD TURN ENGINE v23 — THE DUNGEON MASTER', y)
hr(y); y += 10
y = body('Write these words in any journal entry or memory answer to unlock:', y, C.dim)
y += 6

const wtv23 = [
  ['⚄·●', 'ROLL MADE', 'uncommon', '"roll / rolled the dice / rolling with"',
   '↳ Natural 20. The dice were honest. You rolled for the day.'],
  ['╥·○', 'TAVERN REST', 'uncommon', '"tavern / inn / rest stop / recharge"',
   '↳ Rest is not giving up. The tavern exists for a reason.'],
  ['█·▓', 'DUNGEON DEEP', 'rare', '"dungeon / labyrinth / maze / dark passage"',
   '↳ The dungeon is the place you avoid. You named it.'],
  ['○·○·○', 'PARTY FORMED', 'uncommon', '"party / my crew / found my people / tribe found"',
   '↳ You noted your people. The party is stronger than the solo run.'],
  ['✦·∿', 'SPELL CAST', 'rare', '"spell / cast / magic / enchant / ritual work"',
   '↳ You called it magic. Sometimes the right word is the right spell.'],
  ['▲·●', 'LEVEL GAINED', 'uncommon', '"level up / leveled / new level / next level"',
   '↳ XP logged. The system saw you grow.'],
  ['─┬─', 'QUEST BOARD', 'rare', '"quest / mission / task board / on a mission"',
   '↳ You framed it as a quest. This is the correct framing.'],
  ['◆·■', 'DRAGON FACED', 'epic', '"dragon / inner dragon / the thing I fear / the beast"',
   '↳ The dragon was always you. You walked into the cave.'],
  ['∿·◈', 'WIZARD PATH', 'rare', '"wizard / sage wisdom / arcane / ancient know"',
   '↳ Wisdom detected. The wizard path is slow and worth it.'],
  ['×·▓', 'ROGUE MODE', 'uncommon', '"rogue / solo mode / going it alone / stealth"',
   '↳ Solo run logged. The rogue mode is still a class.'],
  ['≈·♪', 'BARD SONG', 'uncommon', '"bard / song / singing my way / story I tell"',
   '↳ You told the story. The bard song makes it real.'],
  ['═·●·═', 'PALADIN OATH', 'rare', '"oath / vow / commitment I keep / my code"',
   '↳ The oath is not a promise to be perfect. It is a promise to try again.'],
]
for (const [sym, name, rarity, trigger, msg] of wtv23) {
  y = badgeRow(sym, name, rarity, trigger, msg, y)
  y += 5
}

// ── PAGE 4: CALENDAR EE + BEHAVIORAL + ACHIEVEMENT ───────────────
newPage(); y = 55
y = h1('CALENDAR EASTER EGGS v21 — THE SACRED CALENDAR', y)
hr(y); y += 10
y = body('Check in on these dates to unlock the sacred calendar badges:', y, C.dim)
y += 6

const calv21 = [
  ['⚄·◉', 'GYGAX DAY', 'epic', 'Jul 27 — Gary Gygax born 1938',
   '↳ The man who gave us the dungeon. D&D co-creator. Roll one for Gary.'],
  ['◆·○', 'TOLKIEN READS', 'rare', 'Jan 3 — Tolkien Society Reading Day',
   '↳ The world\'s longest fantasy reading club, reading together since 1972.'],
  ['═·◆·═', 'D&D ANNIVERSARY', 'legendary', 'Jan 26 — D&D first published 1974',
   '↳ January 26, 1974. The world changed. Self-care got a dungeon.'],
]
for (const [sym, name, rarity, trigger, msg] of calv21) {
  y = badgeRow(sym, name, rarity, trigger, msg, y)
  y += 8
}

y += 12
y = h1('BEHAVIORAL v20 — ROLL FOR INITIATIVE', y)
hr(y); y += 10

const behavv20 = [
  ['⚄·◆·⚄', 'CRIT SESSION', 'epic', 'Journal entry with 3+ Word Turn v23 words',
   '↳ Critical hit. The journal is fully loaded.'],
  ['○·○·◈', 'PARTY SYNC', 'rare', 'Check in 3 consecutive days',
   '↳ The party momentum is real. Three days, one streak.'],
  ['╥·◉', 'TAVERN NIGHT', 'rare', 'Check in between 20:00–22:00',
   '↳ Tavern hours. The innkeeper logs your name.'],
]
for (const [sym, name, rarity, trigger, msg] of behavv20) {
  y = badgeRow(sym, name, rarity, trigger, msg, y)
  y += 8
}

y += 12
y = h1('ACHIEVEMENT RPG v21 — QUEST BOARD', y)
hr(y); y += 10

const achv21 = [
  ['●→◆', 'ADVENTURER', 'common', 'Any 1 Word Turn v23 badge earned',
   '↳ You stepped off the road. The adventure begins.'],
  ['◈→◆', 'GUILD MEMBER', 'uncommon', 'Any 5 Word Turn v23 badges earned',
   '↳ The guild knows your name.'],
  ['≋→◆', 'DUNGEON CLEAR', 'rare', 'Any 8 Word Turn v23 badges earned',
   '↳ You cleared 8 of 12 rooms. The dungeon is mostly yours.'],
  ['◆→◉', 'DRAGON SLAYER', 'legendary', 'All 12 Word Turn v23 badges earned',
   '↳ All 12 rooms cleared. The dragon is named and defeated.'],
  ['◉·◈', 'GRAND QUEST', 'legendary', 'dragon_slayer + all 3 Calendar v21 badges',
   '↳ The full campaign completed. Gygax, Tolkien, and you.'],
  ['◆·◉·◆', 'DUNGEON MASTER', 'cosmic', 'dragon_slayer + crit_session + 500+ journal words',
   '↳ You wrote the dungeon. COSMIC. The campaign is yours.'],
]
for (const [sym, name, rarity, trigger, msg] of achv21) {
  y = badgeRow(sym, name, rarity, trigger, msg, y)
  y += 5
}

// ── PAGE 5: MASTERY + SECRET BOSS ────────────────────────────────
newPage(); y = 55
y = h1('MASTERY TIER v23 — THE GRAND CAMPAIGN', y)
hr(y); y += 10

const mastv23 = [
  ['⚄·∞·⚄', 'CAMPAIGN LOG', 'epic', '1000+ distinct calendar check-in days',
   '↳ 1000 days. The campaign never ended. You kept showing up.'],
  ['◆·∞·◆', 'EPIC SCROLL', 'legendary', '200,000+ total journal words',
   '↳ 200k words. The scroll is epic. The library has your name.'],
  ['╔◆╗·●', 'LEGEND AGE', 'legendary', 'Account age >= 7 years (2,555+ days)',
   '↳ 7 years of LOT. The legend is now documented.'],
  ['◈·◈·●·◆', 'TWENTY-THREE REGISTERS', 'cosmic', '1 badge from all 23 Word Turn engines',
   '↳ 23 vocabularies. One terminal. Water to dungeon. COSMIC.'],
]
for (const [sym, name, rarity, trigger, msg] of mastv23) {
  y = badgeRow(sym, name, rarity, trigger, msg, y)
  y += 10
}

y += 14
y = h1('SECRET BOSS v20 — THE FORBIDDEN VAULT', y)
hr(y); y += 10
y = body('Write these exact phrases in any journal/memory entry to unlock HIDDEN badges:', y, C.dungeon)
y += 8

// Vault warning box
doc.rect(55, y, doc.page.width - 110, 22).fillColor('#1a0000').fill()
doc.rect(55, y, doc.page.width - 110, 22).strokeColor(C.dungeon).lineWidth(0.8).stroke()
doc.fontSize(8).fillColor(C.dungeon).font('Courier-Bold')
  .text('⚠  HIDDEN — These badges are not shown in the UI until earned.  ⚠', 55, y + 7, { align: 'center', width: doc.page.width - 110 })
y += 28

const secretv20 = [
  ['◆·×·◆', 'LICH KING', 'rare', '"lich / undead king / the lich / death lord"',
   '↳ You named the undead. The lich noticed.'],
  ['◆·∞·◆', 'DRAGON WORD', 'epic', '"dragon / dracarys / here be dragons / wyrm"',
   '↳ Here be dragons. You wrote one into existence.'],
  ['□·∞·□', 'VOID WALKER', 'mythic', '"void / the abyss / outer darkness / null realm"',
   '↳ The void is not empty. You are looking into it now.'],
]
for (const [sym, name, rarity, trigger, msg] of secretv20) {
  y = badgeRow(sym, name, rarity, trigger, msg, y)
  y += 10
}

y += 16

// Ascii easter egg screens
y = h2('ARCADE EASTER EGG SCREENS', y); y += 6

const screens = [
  [
    '> ROLL FOR INITIATIVE',
    'd20: [################....] 17',
    'You go first.',
    'The dragon hasn\'t moved yet.',
    '> _',
  ],
  [
    '> TAVERN REST — RECOVERY PROTOCOL',
    'HP RESTORED        [########] 100%',
    'SPELL SLOTS RESET  [########] FULL',
    'INSPIRATION        [##......] +1',
    '> CONTINUE?  [ Y ] [ N ]',
  ],
  [
    '> LEVEL UP!',
    'NEW ABILITY: "Presence"',
    'Once per day: show up',
    'even when you don\'t feel like it.',
    '> [ LEARN ]',
  ],
]
const scrW = (doc.page.width - 130) / 3
let scrX = 55
for (const lines of screens) {
  doc.rect(scrX, y, scrW, 72).fillColor('#110008').fill()
  doc.rect(scrX, y, scrW, 72).strokeColor(C.dungeon).lineWidth(0.7).stroke()
  let ly = y + 6
  for (const line of lines) {
    doc.fontSize(6.5).fillColor(C.dragon).font('Courier')
      .text(line, scrX + 6, ly, { width: scrW - 12 })
    ly += 12
  }
  scrX += scrW + 10
}
y += 82

// Flavor text
y = h2('FLAVOR TEXT — THE DUNGEON MASTER', y)
const flavors = [
  '"Self-care is not a quest you complete. It is a world you build."',
  '"The adventure begins when the door opens. The door is the app."',
  '"Not all who wander are lost — some are doing reconnaissance."',
  '"A paladin\'s oath is not a promise to be perfect. It is a promise to try again."',
  '"The dungeon is the place you avoid. Every journal entry is a room cleared."',
]
for (const f of flavors) {
  doc.fontSize(7.5).fillColor(C.dim).font('Courier')
    .text(f, 55, y, { width: doc.page.width - 110 })
  y = doc.y + 4
}

// ── PAGE 6: COMPLETE ENGINE TABLE + RARITY ───────────────────────
newPage(); y = 55
y = h1('COMPLETE WORD TURN ENGINE TABLE (v1–v23)', y)
hr(y); y += 10

const engineW = [50, 60, 200, doc.page.width - 110 - 310 - 55]
doc.rect(55, y, doc.page.width - 110, 14).fillColor('#1a1a1a').fill()
doc.fontSize(7.5).fillColor(C.accent).font('Courier-Bold')
  .text('ENGINE', 58, y + 3)
  .text('CODEX VER', 108, y + 3)
  .text('THEME', 168, y + 3)
  .text('BADGES', doc.page.width - 110 - 55, y + 3, { width: 55, align: 'right' })
y += 15

const engines = [
  ['v1', 'v1', 'Core Water', '12'],
  ['v2', 'v2', 'Seasonal Signal', '12'],
  ['v3', 'v3', 'Architecture', '12'],
  ['v4', 'v4', 'Mountain / Earth', '12'],
  ['v5', 'v5', 'Storm / Weather', '12'],
  ['v6', 'v6', 'Fire / Energy', '12'],
  ['v7', 'v7', 'Tech / Digital', '12'],
  ['v8', 'v8', 'Space / Cosmos', '12'],
  ['v9', 'v9', 'Chemistry / Elements', '12'],
  ['v10', 'v10', 'Music / Sound', '12'],
  ['v11', 'v11', 'Alchemy / Transformation', '12'],
  ['v12', 'v12', 'Quantum / Physics', '12'],
  ['v13', 'v16', 'The Quantum Library', '12'],
  ['v14', 'v17', 'The Neon Arcade', '12'],
  ['v15', 'v18', 'The Midnight Radio', '12'],
  ['v16', 'v19', 'The Bio-Terminal', '12'],
  ['v17', 'v20', 'The Codex Reader', '12'],
  ['v18', 'v21', 'The Cyberspace Codex', '12'],
  ['v19', 'v22', "The Hero's Journey", '12'],
  ['v20', 'v23', 'The Dungeon Master  ← NEW', '12'],
]
for (let i = 0; i < engines.length; i++) {
  const [eng, ver, theme, count] = engines[i]
  const isNew = theme.includes('NEW')
  const fg = isNew ? C.gold : C.text
  const bgColor = isNew ? '#15100a' : i % 2 === 0 ? '#0f0f0f' : '#111111'
  doc.rect(55, y, doc.page.width - 110, 13).fillColor(bgColor).fill()
  doc.rect(55, y, doc.page.width - 110, 13).strokeColor(C.border).lineWidth(0.3).stroke()
  doc.fontSize(7.5).fillColor(fg).font(isNew ? 'Courier-Bold' : 'Courier')
    .text(eng, 58, y + 2.5, { width: 45 })
    .text(ver, 108, y + 2.5, { width: 55 })
    .text(theme, 168, y + 2.5, { width: 195 })
    .text(count, doc.page.width - 110 - 50, y + 2.5, { width: 45, align: 'right' })
  y += 14
}
y += 6

// Total engines line
doc.rect(55, y, doc.page.width - 110, 22).fillColor('#111111').fill()
doc.rect(55, y, doc.page.width - 110, 22).strokeColor(C.gold).lineWidth(0.7).stroke()
doc.fontSize(8.5).fillColor(C.gold).font('Courier-Bold')
  .text('20 Word Turn Engines  ·  240 Word Turn Badges  ·  276 total (incl. Secret Boss)', 55, y + 7, { align: 'center', width: doc.page.width - 110 })
y += 32

// Rarity table
y = h1('COMPLETE RARITY TABLE', y)
hr(y); y += 10

const rarW = [doc.page.width - 110 - 290, 50, 90, 150]
doc.rect(55, y, doc.page.width - 110, 14).fillColor('#1a1a1a').fill()
doc.fontSize(7.5).fillColor(C.accent).font('Courier-Bold')
  .text('RARITY', 58, y + 3)
  .text('SYMBOL', 170, y + 3)
  .text('COLOR HEX', 220, y + 3)
  .text('EXAMPLE BADGE', 320, y + 3)
y += 15

const rarities = [
  ['Common', '·', '#cccccc', 'Adventurer, First Breath'],
  ['Uncommon', '○', '#88cc88', 'Roll Made, Level Gained, Rogue Mode'],
  ['Rare', '◐', '#8888ee', 'Dungeon Deep, Quest Board, Dragon_word'],
  ['Epic', '◆', '#cc88ee', 'Dragon Faced, Crit Session, Gygax Day'],
  ['Legendary', '✦', '#ffcc44', 'Dragon Slayer, Grand Quest, D&D Day'],
  ['Mythic', '◉', '#ff6644', 'Void Walker (hidden)'],
  ['Cosmic', '∞', '#ff44ff', 'Dungeon Master, 23 Registers'],
]
for (let i = 0; i < rarities.length; i++) {
  const [name, sym, hex, ex] = rarities[i]
  const rkey = name.toLowerCase()
  const fc = C[rkey] || hex
  doc.rect(55, y, doc.page.width - 110, 14).fillColor(i % 2 === 0 ? '#0f0f0f' : '#111111').fill()
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
doc.rect(clX, cy, clW, 180).fillColor('#0d000d').fill()
doc.rect(clX, cy, clW, 180).strokeColor(C.gold).lineWidth(0.8).stroke()

doc.fontSize(9).fillColor(C.text).font('Courier')
  .text('"The dungeon was always your mind."', clX + 20, cy + 16, { width: clW - 40, align: 'center' })
cy = doc.y + 8
doc.fontSize(9).fillColor(C.text).font('Courier')
  .text('"The dragon was always the avoidance."', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 8
doc.fontSize(9).fillColor(C.text).font('Courier')
  .text('"Every check-in is a room cleared."', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 20

doc.fontSize(10).fillColor(C.dungeon).font('Courier-Bold')
  .text('ROLL FOR INITIATIVE.', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 6
doc.fontSize(10).fillColor(C.dragon).font('Courier-Bold')
  .text('FACE THE DRAGON.', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 6
doc.fontSize(10).fillColor(C.gold).font('Courier-Bold')
  .text('LEVEL UP.', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 20

doc.fontSize(8).fillColor(C.dim).font('Courier')
  .text('843 badges. 23 engines. One terminal.', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 6
doc.fontSize(10).fillColor(C.accent).font('Courier')
  .text('∘ → ≈ → ≋ → ◆ → ◉', clX + 20, cy, { width: clW - 40, align: 'center' })
cy = doc.y + 14
doc.fontSize(11).fillColor(C.gold).font('Courier-Bold')
  .text('[ LEVEL UP ]', clX + 20, cy, { width: clW - 40, align: 'center' })

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
  .text('MASTER CODEX v33  ·  843 BADGES  ·  THE DUNGEON MASTER  ·  THE ARCADE OF SELF-CARE', 55, cy, { align: 'center', width: doc.page.width - 110 })

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
