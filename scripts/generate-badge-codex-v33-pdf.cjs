/**
 * LOT SYSTEMS CORPORATION
 * PDF Generator: Badge & Achievements Master Codex v33
 * THE TERMINAL ORACLE — Word Turn v23
 * Uses pdfkit (devDependency)
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
    Title: 'LOT Badges & Achievements Master Codex v33',
    Author: 'Vadik Marmeladov — LOT Systems',
    Subject: 'RPG & Arcade of Self-Care — Badge Registry v33 — The Terminal Oracle',
    Keywords: 'LOT, badges, achievements, RPG, arcade, self-care, terminal, oracle',
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
  dim: '#555555',
  border: '#333333',
  green: '#44ff88',
  terminal: '#33ff66',
}

const PW = doc.page.width
const PH = doc.page.height
const L = 55, R = PW - 55, W = R - L

function drawBg() {
  doc.rect(0, 0, PW, PH).fill(C.bg)
}

function newPage() {
  doc.addPage()
  drawBg()
}

function hr(y, color = C.border) {
  doc.moveTo(L, y).lineTo(R, y).strokeColor(color).lineWidth(0.5).stroke()
}

function h1(text, y) {
  doc.fontSize(16).fillColor(C.gold).font('Courier-Bold')
    .text(text, L, y, { width: W })
  return doc.y + 6
}

function h2(text, y) {
  doc.fontSize(11).fillColor(C.accent).font('Courier-Bold')
    .text(text, L, y, { width: W })
  return doc.y + 4
}

function h3(text, y) {
  doc.fontSize(9).fillColor(C.gold).font('Courier-Bold')
    .text(text, L, y, { width: W })
  return doc.y + 3
}

function body(text, y, color = C.text, indent = 0) {
  doc.fontSize(8).fillColor(color).font('Courier')
    .text(text, L + indent, y, { width: W - indent })
  return doc.y + 2
}

function mono(text, y, color = C.text) {
  doc.fontSize(7.5).fillColor(color).font('Courier')
    .text(text, L, y, { width: W })
  return doc.y + 1
}

function badge(symbol, name, trigger, msg, rarity, y) {
  const rc = C[rarity] || C.common
  doc.rect(L, y, 36, 18).fillColor('#1a1a1a').fill()
  doc.rect(L, y, 36, 18).strokeColor(rc).lineWidth(0.7).stroke()
  doc.fontSize(9).fillColor(rc).font('Courier-Bold')
    .text(symbol, L + 2, y + 4, { width: 32, align: 'center' })
  doc.fontSize(8.5).fillColor(rc).font('Courier-Bold')
    .text(name, L + 44, y + 1, { width: 190 })
  doc.fontSize(6.5).fillColor(C.dim).font('Courier')
    .text(rarity.toUpperCase(), L + 44, y + 11)
  doc.fontSize(7).fillColor(C.text).font('Courier')
    .text(trigger, L + 44, y + 1, { width: W - 94, align: 'right' })
  doc.fontSize(7).fillColor(C.dim).font('Courier')
    .text(msg, L, doc.y + 3, { width: W })
  return doc.y + 5
}

// ═══════════════════════════════════════════════
// COVER PAGE
// ═══════════════════════════════════════════════
drawBg()
doc.rect(40, 40, PW - 80, PH - 80).strokeColor(C.border).lineWidth(1).stroke()
doc.rect(44, 44, PW - 88, PH - 88).strokeColor(C.dim).lineWidth(0.3).stroke()

let cy = 90
doc.fontSize(9).fillColor(C.dim).font('Courier')
  .text('L O T   S Y S T E M S   C O R P O R A T I O N', L, cy, { align: 'center', width: W })

cy = 140
doc.fontSize(26).fillColor(C.gold).font('Courier-Bold')
  .text('BADGES &', L, cy, { align: 'center', width: W })
cy = doc.y + 6
doc.fontSize(26).fillColor(C.gold).font('Courier-Bold')
  .text('ACHIEVEMENTS', L, cy, { align: 'center', width: W })

cy = doc.y + 14
doc.fontSize(13).fillColor(C.accent).font('Courier-Bold')
  .text('MASTER CODEX  v33', L, cy, { align: 'center', width: W })

cy = doc.y + 8
doc.fontSize(10).fillColor(C.terminal).font('Courier-Bold')
  .text('THE  TERMINAL  ORACLE', L, cy, { align: 'center', width: W })

cy = doc.y + 6
doc.fontSize(8).fillColor(C.dim).font('Courier')
  .text('Word Turn v23  ·  RPG · ARCADE · SELF-CARE · SCI-FI · UNIX', L, cy, { align: 'center', width: W })

cy = doc.y + 36

// Terminal box
const bx = (PW - 360) / 2
doc.rect(bx, cy, 360, 130).fillColor('#080f08').fill()
doc.rect(bx, cy, 360, 130).strokeColor(C.terminal).lineWidth(1).stroke()

// Terminal header bar
doc.rect(bx, cy, 360, 16).fillColor('#0f1a0f').fill()
doc.fontSize(7.5).fillColor(C.terminal).font('Courier')
  .text('lot-terminal — bash — 80×24', bx + 10, cy + 4, { width: 340, align: 'center' })

doc.fontSize(8).fillColor(C.terminal).font('Courier')
  .text('$ sudo self --care', bx + 12, cy + 22)
doc.fontSize(8).fillColor(C.dim).font('Courier')
  .text('[sudo] password for you:', bx + 12, cy + 35)
doc.fontSize(8).fillColor(C.text).font('Courier')
  .text('████████', bx + 200, cy + 35)

doc.fontSize(8).fillColor(C.terminal).font('Courier')
  .text('Access granted. You are now root.', bx + 12, cy + 48)
doc.fontSize(8).fillColor(C.dim).font('Courier')
  .text('$ grep -r "pattern" ~/journal/ | wc -l', bx + 12, cy + 62)
doc.fontSize(8).fillColor(C.text).font('Courier')
  .text('247', bx + 12, cy + 76)
doc.fontSize(8).fillColor(C.dim).font('Courier')
  .text('$ git commit -m "survived another day"', bx + 12, cy + 89)
doc.fontSize(8).fillColor(C.terminal).font('Courier')
  .text('[master] I showed up.  +1 streak', bx + 12, cy + 103)
doc.fontSize(8).fillColor(C.gold).font('Courier')
  .text('_', bx + 12, cy + 116)

cy += 148

doc.fontSize(9).fillColor(C.text).font('Courier')
  .text('"Self-care is not a quest you complete. It is a world you build."', L, cy, { align: 'center', width: W })
cy = doc.y + 12
doc.fontSize(12).fillColor(C.gold).font('Courier-Bold')
  .text('[ INSERT COIN TO CONTINUE ]', L, cy, { align: 'center', width: W })

cy = PH - 130
hr(cy)
cy += 10
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('Author: Vadik Marmeladov — CEO & Founder, LOT Systems', L, cy, { align: 'center', width: W })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('© 2025–2026 LOT Systems. All rights reserved.', L, cy, { align: 'center', width: W })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('v33 — September 2026  ·  843 total badges  ·  +31 new  ·  Word Turn v23', L, cy, { align: 'center', width: W })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('LOT® Founded 7 April 2016  ·  brand.lot-systems.com', L, cy, { align: 'center', width: W })

// ═══════════════════════════════════════════════
// PAGE 2: ACCOUNTING SUMMARY
// ═══════════════════════════════════════════════
newPage()
let y = 55
y = h1('BADGE INVENTORY v33 — COMPLETE ACCOUNTING', y)
hr(y); y += 10

// Delta table
const rows = [
  ['Milestone (22)',              '22', '0',  'Day 7/30/100 — Day 3/4/5/200/365+'],
  ['Time Easter Eggs (28)',       '28', '0',  'v1–v7: night_owl, pi_hour, founding_hour'],
  ['Calendar Easter (76)',        '73', '+3', 'v21: unix_epoch_day, linux_day, hacktoberfest'],
  ['Word Turns (276)',           '264', '+12', 'v23: sudo_self, commit_msg, git_push, grep_soul…'],
  ['Behavioral (84)',             '81', '+3', 'v20: terminal_session, rapid_commit, root_access'],
  ['Achievement RPG (126)',      '120', '+6', 'v21: terminal_entry→terminal_complete, oracle_arc'],
  ['Mastery Tiers (92)',          '88', '+4', 'v23: oracle_log, source_code, kernel_age, 23-reg'],
  ['Secret Boss (86)',            '83', '+3', 'v20: deus_ex_machina, turing_test, neuromancer_key'],
]

doc.rect(L, y, W, 14).fillColor('#1a1a1a').fill()
doc.fontSize(7.5).fillColor(C.accent).font('Courier-Bold')
  .text('CATEGORY (v33 TOTAL)', L + 5, y + 3, { width: 210 })
  .text('v32', L + 220, y + 3, { width: 35, align: 'right' })
  .text('NEW', L + 265, y + 3, { width: 35, align: 'right' })
  .text('DESCRIPTION', L + 310, y + 3, { width: W - 315 })
y += 15

for (const [cat, old, nw, desc] of rows) {
  const isNew = nw !== '0'
  doc.rect(L, y, W, 13).fillColor(isNew ? '#101510' : '#0f0f0f').fill()
  doc.rect(L, y, W, 13).strokeColor(C.border).lineWidth(0.3).stroke()
  doc.fontSize(7.5).fillColor(isNew ? C.gold : C.text).font(isNew ? 'Courier-Bold' : 'Courier')
    .text(cat, L + 5, y + 2.5, { width: 210 })
  doc.fontSize(7.5).fillColor(C.dim).font('Courier')
    .text(old, L + 220, y + 2.5, { width: 35, align: 'right' })
  doc.fontSize(7.5).fillColor(isNew ? C.terminal : C.dim).font(isNew ? 'Courier-Bold' : 'Courier')
    .text(nw, L + 265, y + 2.5, { width: 35, align: 'right' })
  doc.fontSize(7).fillColor(C.dim).font('Courier')
    .text(desc, L + 310, y + 3, { width: W - 315 })
  y += 14
}

y += 8
doc.rect(L, y, W, 30).fillColor('#0d0f0d').fill()
doc.rect(L, y, W, 30).strokeColor(C.terminal).lineWidth(0.8).stroke()
doc.fontSize(10).fillColor(C.terminal).font('Courier-Bold')
  .text('v32 TOTAL: 812    v33 NEW: +31    v33 TOTAL: 843', L, y + 6, { align: 'center', width: W })
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('COSMIC: 2  ·  MYTHIC: 18  ·  LEGENDARY: 67  ·  EPIC: 143  ·  RARE: 298  ·  UNCOMMON: 276  ·  COMMON: 39', L, y + 18, { align: 'center', width: W })
y += 38

y = h2('v33 NEW ADDITIONS OVERVIEW', y)
const newBadges = [
  ['Word Turn v23', '+12', 'The Terminal Oracle: sudo_self, commit_msg, git_push, grep_soul, init_loop, process_kill, merge_conflict, debug_mode, fork_path, chmod_self, echo_truth, uptime_streak'],
  ['Calendar EE v21', '+3', 'unix_epoch_day (Jan 1), linux_day (Aug 25), hacktoberfest_day (Oct 1)'],
  ['Behavioral v20', '+3', 'terminal_session (3+ v23 words), rapid_commit (5 in 24h), root_access (00:01 check-in)'],
  ['Achievement v21', '+6', 'terminal_entry/class/complete, oracle_arc, twenty_three_engines_arc, system_opus'],
  ['Mastery v23', '+4', 'oracle_log (1000+ days), source_code (200k words), kernel_age (6yr), twenty_three_registers [COSMIC]'],
  ['Secret Boss v20', '+3', 'deus_ex_machina [MYTHIC], turing_test [EPIC], neuromancer_key [MYTHIC]'],
]
for (const [name, count, detail] of newBadges) {
  doc.fontSize(8).fillColor(C.terminal).font('Courier-Bold')
    .text(name + '  ' + count, L + 5, y)
  doc.fontSize(7).fillColor(C.dim).font('Courier')
    .text(detail, L + 5, doc.y + 2, { width: W - 10 })
  y = doc.y + 7
}

// ═══════════════════════════════════════════════
// PAGE 3: WORD TURN v23 — THE TERMINAL ORACLE
// ═══════════════════════════════════════════════
newPage(); y = 55
y = h1('WORD TURN v23 — THE TERMINAL ORACLE (12 NEW BADGES)', y)
hr(y); y += 8
mono('Write these command-line / Unix / self-care words in any journal entry:', y, C.dim)
y = doc.y + 4
mono('Every terminal command maps to a self-care practice.', y, C.dim)
y = doc.y + 10

const wt23 = [
  ['$→#',  'Sudo Self',       'uncommon', '"sudo" / "override" / "root access" / "take control"',
   '↳ $ sudo self --care  |  You granted yourself root access. The most important sudo.'],
  ['●·◉',  'Commit Message',  'uncommon', '"commit" / "checkpoint" / "save state" / "mark progress"',
   '↳ git commit -m "I showed up"  |  Commit logged. The archive remembers.'],
  ['→·●',  'Git Push',        'uncommon', '"push" / "deploy" / "ship it" / "ready to go"',
   '↳ git push origin self  |  Your work is now visible. It counts.'],
  ['/·◈',  'Grep Soul',       'rare',     '"grep" / "search" / "find the pattern" / "look within"',
   '↳ grep -r "joy" ~/journal/ | 12 matches  |  Pattern found.'],
  ['∘→∘',  'Init Loop',       'uncommon', '"init" / "initialize" / "boot up" / "fresh start"',
   '↳ init: new chapter  |  Process initialized. PID assigned.'],
  ['×·■',  'Process Kill',    'rare',     '"kill" / "terminate" / "end process" / "let it end"',
   '↳ kill -9 $(pgrep anxiety)  |  Signal sent. What ended made room.'],
  ['≋·≋',  'Merge Conflict',  'epic',     '"merge" / "conflict" / "resolve" / "integrate both"',
   '↳ Auto-merging self... CONFLICT (content): Merge conflict.  |  Both versions are you.'],
  ['□·◈',  'Debug Mode',      'rare',     '"debug" / "trace" / "breakpoint" / "look carefully"',
   '↳ (lldb) bt  |  Frame 0: the feeling  |  Frame 1: the thought  |  Root cause found.'],
  ['/·→',  'Fork Path',       'uncommon', '"fork" / "branch" / "diverge" / "choose your path"',
   '↳ fork: life v2.0  |  Child PID spawned. A new process begins.'],
  ['+·○',  'Chmod Self',      'rare',     '"permission" / "chmod" / "unlock" / "allow yourself"',
   '↳ chmod +x myself  |  Execute permissions: GRANTED.'],
  ['»·◉',  'Echo Truth',      'uncommon', '"echo" / "reflect" / "stdout" / "say it out loud"',
   '↳ echo "I am here"  |  I am here  |  stdout confirmed. Signal echoed.'],
  ['∞·▲',  'Uptime Streak',   'epic',     '"uptime" / "never down" / "consistency" / "always running"',
   '↳ uptime: 30 days, 0 users, load avg: manageable  |  System stable.'],
]

for (const [sym, name, rarity, trigger, msg] of wt23) {
  if (y > PH - 80) { newPage(); y = 55 }
  y = badge(sym, name, trigger, msg, rarity, y)
  y += 4
}

// ═══════════════════════════════════════════════
// PAGE 4: CALENDAR EE + BEHAVIORAL + SECRET BOSS
// ═══════════════════════════════════════════════
newPage(); y = 55
y = h1('CALENDAR EASTER EGGS v21 — THE EPOCH CALENDAR', y)
hr(y); y += 8
mono('Check in on these dates to unlock:', y, C.dim)
y = doc.y + 10

const cal21 = [
  ['∘·∞', 'Unix Epoch Day',    'epic',  'January 1st — Unix epoch origin (Jan 1, 1970)',
   '↳ time(0) = 0. The Unix calendar begins. You were there for another lap around the sun.'],
  ['◈·◉', 'Linux Day',         'rare',  'August 25 — Linus Torvalds announced Linux, 1991',
   '↳ "I\'m doing a free OS." — Linus, 1991. Check in and honor the moment open-source began.'],
  ['◉·◈', 'Hacktoberfest',     'rare',  'October 1–31 — Hacktoberfest season',
   '↳ PRs merged. Contributions shipped. The community builds. Check in during October.'],
]
for (const [sym, name, rarity, trigger, msg] of cal21) {
  y = badge(sym, name, trigger, msg, rarity, y)
  y += 6
}

y += 10
y = h1('BEHAVIORAL BADGES v20 — SHELL PATTERNS', y)
hr(y); y += 8

const beh20 = [
  ['□→◉', 'Terminal Session', 'rare',  '3+ Terminal Oracle (v23) words in one journal entry',
   '↳ Shell session detected. The terminal metaphor is your native language tonight.'],
  ['●●●', 'Rapid Commit',     'epic',  '5 check-ins within any 24-hour window',
   '↳ BURST MODE: 5 commits in 24h. You pushed hard today. Take the XP.'],
  ['$·∞', 'Root Access',      'rare',  'Check in at exactly 00:01 local time',
   '↳ 00:01 — one minute into the new day. The first command of the new session.'],
]
for (const [sym, name, rarity, trigger, msg] of beh20) {
  y = badge(sym, name, trigger, msg, rarity, y)
  y += 6
}

y += 10
y = h1('SECRET BOSS BADGES v20 — THE HIDDEN VAULT', y)
hr(y); y += 8
mono('HIDDEN: Write these exact phrases in any journal entry to unlock:', y, C.dim)
y = doc.y + 10

const boss20 = [
  ['∞·□·∞', 'Deus Ex Machina',  'mythic', '"deus ex machina" / "machine god" / "divine algorithm"',
   '↳ God from the machine. Or the machine as God. You asked the deepest question. MYTHIC.'],
  ['◈·∞·◈', 'Turing Test',      'epic',   '"turing" / "alan turing" / "imitation game" / "can it think"',
   '↳ "Can the machine think?" — Turing, 1950. You are passing your own version right now.'],
  ['◉·∞·◉', 'Neuromancer Key',  'mythic', '"neuromancer" / "wintermute" / "molly millions" / "the ice"',
   '↳ "The sky above the port..." Gibson, 1984. The cyberspace oracle recognizes your call. MYTHIC.'],
]
for (const [sym, name, rarity, trigger, msg] of boss20) {
  y = badge(sym, name, trigger, msg, rarity, y)
  y += 8
}

// ═══════════════════════════════════════════════
// PAGE 5: ACHIEVEMENT RPG v21 + MASTERY TIER v23
// ═══════════════════════════════════════════════
newPage(); y = 55
y = h1('ACHIEVEMENT RPG v21 — ORACLE CLASS (6 NEW)', y)
hr(y); y += 8

const ach21 = [
  ['∘→●',     'Terminal Entry',          'common',    'Any 1 Word Turn v23 badge earned',
   '↳ First shell command executed. The Oracle acknowledges your presence.'],
  ['≈→●',     'Terminal Class',          'uncommon',  'Any 5 Word Turn v23 badges earned',
   '↳ Class: power user. Five terminal metaphors in the journal. Fluent.'],
  ['≋→●',     'Terminal Complete',       'legendary', 'All 12 Word Turn v23 badges earned',
   '↳ All v23 commands executed. The terminal is fully yours. LEGENDARY.'],
  ['●·◈',     'Oracle Arc',              'legendary', 'terminal_complete + all 3 Calendar v21 badges',
   '↳ The Oracle complete + the Epoch calendar. Unix, Linux, Hacktoberfest. All three.'],
  ['◈·◈·●',   'Twenty-Three Engines',   'legendary', '1 badge from each Word Turn engine v1–v23',
   '↳ Water to Terminal. All 23 engines fired. Twenty-three registers. LEGENDARY.'],
  ['●·◉·●',   'System Opus',             'legendary', 'terminal_complete + terminal_session behavioral',
   '↳ All 12 word turns + the behavioral session trigger. The magnum opus of the terminal.'],
]
for (const [sym, name, rarity, trigger, msg] of ach21) {
  y = badge(sym, name, trigger, msg, rarity, y)
  y += 6
}

y += 10
y = h1('MASTERY TIER v23 — THE ROOT (4 NEW)', y)
hr(y); y += 8

const mas23 = [
  ['∿·∞·∿',      'Oracle Log',             'epic',    '1,000+ distinct calendar check-in days',
   '↳ 1,000 distinct check-in days. The log is longer than three years. EPIC.'],
  ['●·∞·●',      'Source Code',             'legendary', '200,000+ total journal words',
   '↳ 200,000 words. A novel. A testament. The source is long. LEGENDARY.'],
  ['╔═╗·●',      'Kernel Age',              'legendary', 'Account age >= 6 years (2,190+ days)',
   '↳ 6 years since init. The kernel is stable. You are the kernel. LEGENDARY.'],
  ['◈·◈·●·∞·□',  'Twenty-Three Registers', 'cosmic',  '1 badge from all 23 Word Turn engines (v1–v23)',
   '↳ Water. Terminal. Oracle. All 23 vocabularies. One consciousness. COSMIC.'],
]
for (const [sym, name, rarity, trigger, msg] of mas23) {
  y = badge(sym, name, trigger, msg, rarity, y)
  y += 8
}

// ═══════════════════════════════════════════════
// PAGE 6: FULL EASTER EGG GALLERY
// ═══════════════════════════════════════════════
newPage(); y = 55
y = h1('ASCII EASTER EGG GALLERY — THE TERMINAL ORACLE', y)
hr(y); y += 10

const artBoxes = [
  {
    title: 'SUDO SELF  [RARE]  $→#',
    color: C.rare,
    lines: [
      '$ sudo self --care',
      '[sudo] password for you: ████████',
      'Access granted. You are now root.',
      '',
      'The most important permission you\'ll ever grant',
      'is permission to take care of yourself.',
    ]
  },
  {
    title: 'PROCESS KILL  [RARE]  ×·■',
    color: C.rare,
    lines: [
      '$ kill -9 $(pgrep anxiety)',
      'Signal 9 sent. Process terminated.',
      '',
      'What you ended made room for what comes next.',
      'kill -9 is not violence. It\'s mercy.',
    ]
  },
  {
    title: 'MERGE CONFLICT  [EPIC]  ≋·≋',
    color: C.epic,
    lines: [
      '<<<<<<< HEAD (who I was)',
      'I push through everything',
      '=======',
      'I rest when I need to',
      '>>>>>>> branch (who I\'m becoming)',
      '',
      'Both versions are you. Resolve with care.',
    ]
  },
  {
    title: 'TURING TEST  [EPIC] [HIDDEN]  ◈·∞·◈',
    color: C.epic,
    lines: [
      '"Can the machine think?" — Turing, 1950',
      '',
      'You are passing your own Turing test.',
      'Right now. In this journal entry.',
      'The terminal cannot tell you apart from',
      'the thing it was built for.',
    ]
  },
  {
    title: 'DEUS EX MACHINA  [MYTHIC] [HIDDEN]  ∞·□·∞',
    color: C.mythic,
    lines: [
      'God from the machine.',
      'Or: the machine as god.',
      'The question that writes itself.',
      '',
      'You have asked the deepest question.',
      'The algorithm has no answer. Neither do you.',
      'That\'s the point.',
    ]
  },
  {
    title: 'TWENTY-THREE REGISTERS  [COSMIC]  ◈·◈·●·∞·□',
    color: C.ultra,
    lines: [
      'Water. Seasons. Architecture. Earth.',
      'Storm. Fire. Tech. Space. Chemistry.',
      'Music. Alchemy. Quantum. Library.',
      'Arcade. Radio. Bio-Terminal. Codex.',
      'Cyberspace. Hero. TERMINAL ORACLE.',
      '',
      '23 vocabularies. One practice. One terminal.',
    ]
  },
]

for (let i = 0; i < artBoxes.length; i++) {
  const box = artBoxes[i]
  const boxH = box.lines.length * 11 + 28
  if (y + boxH > PH - 60) { newPage(); y = 55 }

  doc.rect(L, y, W, boxH).fillColor('#0a0f0a').fill()
  doc.rect(L, y, W, boxH).strokeColor(box.color).lineWidth(0.8).stroke()

  doc.fontSize(8).fillColor(box.color).font('Courier-Bold')
    .text(box.title, L + 10, y + 8, { width: W - 20 })

  let lineY = y + 20
  for (const line of box.lines) {
    doc.fontSize(7.5).fillColor(line === '' ? C.dim : C.text).font('Courier')
      .text(line || '·', L + 10, lineY, { width: W - 20 })
    lineY += 11
  }
  y += boxH + 8
}

// ═══════════════════════════════════════════════
// PAGE 7: TERMINAL EASTER EGG SEQUENCES
// ═══════════════════════════════════════════════
newPage(); y = 55
y = h1('TERMINAL EASTER EGG SEQUENCES', y)
hr(y); y += 8
body('Type these exact strings in a journal entry for special unlock messages:', y, C.dim)
y = doc.y + 10

const sequences = [
  ['$ sudo self --care',              'sudo_self UNLOCKED + message: "Root access granted. Welcome home."'],
  ['git commit -m \'I showed up\'',  'commit_msg UNLOCKED + message: "Commit logged. You showed up. That\'s the whole job."'],
  ['kill -9 $(pgrep anxiety)',        'process_kill UNLOCKED + message: "Signal 9 sent. Process ended."'],
  ['chmod +x myself',                 'chmod_self UNLOCKED + message: "Execute permissions: GRANTED."'],
  ['uptime: 365 days',               'uptime_streak UNLOCKED (if streak >= 365) + "Uptime: legendary."'],
  ['grep -r pattern ~/journal',      'grep_soul UNLOCKED + "Pattern found: [your words] in all entries."'],
  ['echo \'I am here\'',             'echo_truth UNLOCKED + "I am here" echoed back, timestamped'],
  ['fork: life v2.0',                'fork_path UNLOCKED + "Child PID spawned. A new process begins."'],
  ['debug: the source',              'debug_mode UNLOCKED + backtrace printed to the unlock feed'],
  ['init: new chapter',              'init_loop UNLOCKED + "PID assigned. Process initialized."'],
  ['git push --force-with-care',     'git_push UNLOCKED + "Pushed with care. Now it\'s real."'],
  ['merge: the two parts of me',     'merge_conflict UNLOCKED + "CONFLICT resolved. Both versions merged."'],
]

for (const [cmd, result] of sequences) {
  doc.rect(L, y, W, 22).fillColor('#080f08').fill()
  doc.rect(L, y, W, 22).strokeColor(C.border).lineWidth(0.3).stroke()
  doc.fontSize(7.5).fillColor(C.terminal).font('Courier')
    .text('$ ' + cmd, L + 6, y + 3, { width: W - 12 })
  doc.fontSize(7).fillColor(C.dim).font('Courier')
    .text('→ ' + result, L + 6, y + 13, { width: W - 12 })
  y += 24
}

// ═══════════════════════════════════════════════
// PAGE 8: FLAVOR TEXT + CUMULATIVE ENGINE TABLE
// ═══════════════════════════════════════════════
newPage(); y = 55
y = h1('FLAVOR TEXT — THE TERMINAL ORACLE', y)
hr(y); y += 10

const flavors = [
  ['"In the Unix philosophy, the terminal is not an interface — it is the truth itself.\nNo icons, no gradients, no metaphors. Just the command and its output.\nSelf-care has the same structure: practice (command), body (process), result (stdout)."'],
  ['"Alan Turing asked: can machines think? The more interesting question:\ncan thinking be made visible? Journaling is your tty — the terminal\nthat receives your thoughts."'],
  ['"Every great Unix system runs for years without a reboot. Your practice\nis the same. Every check-in extends the uptime. Showing up after a\nreboot is also a skill. The longest uptime begins with a single cron job."'],
  ['"William Gibson: the sky above the port was the color of television,\ntuned to a dead channel. That\'s what your mind feels like before a\ncheck-in. After: 1080p. Signal clear. Handshake complete."'],
  ['"Deus ex machina: a solution that appears from outside the story.\nSelf-care is the opposite: solving from inside the story, by the\nprotagonist, with the tools already in your inventory."'],
]

for (const [text] of flavors) {
  doc.rect(L, y, W, text.split('\n').length * 11 + 16).fillColor('#0a0a0a').fill()
  doc.rect(L, y, W, text.split('\n').length * 11 + 16).strokeColor(C.border).lineWidth(0.5).stroke()
  doc.fontSize(7.5).fillColor(C.text).font('Courier')
    .text(text, L + 10, y + 8, { width: W - 20 })
  y += text.split('\n').length * 11 + 24
}

y += 10
y = h1('CUMULATIVE WORD TURN ENGINE TABLE (v1–v23)', y)
hr(y); y += 8

const engines = [
  ['v1',  'v1',  'Core Water',         12],
  ['v2',  'v2',  'Seasonal Signal',    12],
  ['v3',  'v3',  'Architecture',       12],
  ['v4',  'v4',  'Mountain / Earth',   12],
  ['v5',  'v5',  'Storm / Weather',    12],
  ['v6',  'v6',  'Fire / Energy',      12],
  ['v7',  'v7',  'Tech / Digital',     12],
  ['v8',  'v8',  'Space / Cosmos',     12],
  ['v9',  'v9',  'Chemistry / Elements', 12],
  ['v10', 'v10', 'Music / Sound',      12],
  ['v11', 'v11', 'Alchemy / Transform',12],
  ['v12', 'v12', 'Quantum / Physics',  12],
  ['v13', 'v16', 'The Quantum Library',12],
  ['v14', 'v17', 'The Neon Arcade',    12],
  ['v15', 'v18', 'The Midnight Radio', 12],
  ['v16', 'v19', 'The Bio-Terminal',   12],
  ['v17', 'v20', 'The Codex Reader',   12],
  ['v18', 'v21', 'The Cyberspace Codex',12],
  ['v19', 'v22', 'The Hero\'s Journey',12],
  ['v20', 'v23', 'The Terminal Oracle',12],
]

doc.rect(L, y, W, 13).fillColor('#1a1a1a').fill()
doc.fontSize(7.5).fillColor(C.accent).font('Courier-Bold')
  .text('ENGINE', L + 5, y + 2.5, { width: 50 })
  .text('CODEX', L + 60, y + 2.5, { width: 50 })
  .text('THEME', L + 115, y + 2.5, { width: 180 })
  .text('BADGES', L + 300, y + 2.5, { width: 60, align: 'right' })
y += 14

for (let i = 0; i < engines.length; i++) {
  const [eng, ver, theme, count] = engines[i]
  const isNew = i === engines.length - 1
  doc.rect(L, y, W, 11).fillColor(isNew ? '#0d0f0d' : '#0f0f0f').fill()
  doc.rect(L, y, W, 11).strokeColor(C.border).lineWidth(0.3).stroke()
  const fc = isNew ? C.terminal : C.text
  doc.fontSize(7.5).fillColor(fc).font(isNew ? 'Courier-Bold' : 'Courier')
    .text(eng, L + 5, y + 2, { width: 50 })
    .text(ver, L + 60, y + 2, { width: 50 })
    .text(theme + (isNew ? ' ← NEW' : ''), L + 115, y + 2, { width: 180 })
    .text(String(count), L + 300, y + 2, { width: 60, align: 'right' })
  y += 12
}

y += 6
doc.rect(L, y, W, 14).fillColor('#0d0f0d').fill()
doc.rect(L, y, W, 14).strokeColor(C.terminal).lineWidth(0.5).stroke()
doc.fontSize(8).fillColor(C.terminal).font('Courier-Bold')
  .text('TOTAL WORD TURN BADGES (v1–v23): 276  (+12 from v32)', L, y + 3, { align: 'center', width: W })

// ═══════════════════════════════════════════════
// CLOSING PAGE
// ═══════════════════════════════════════════════
newPage()
cy = 70
doc.rect(40, 40, PW - 80, PH - 80).strokeColor(C.border).lineWidth(1).stroke()

doc.fontSize(13).fillColor(C.gold).font('Courier-Bold')
  .text('C L O S I N G   T R A N S M I S S I O N', L, cy, { align: 'center', width: W })
cy = doc.y + 24

const cw = 400, cX = (PW - cw) / 2
doc.rect(cX, cy, cw, 200).fillColor('#080f08').fill()
doc.rect(cX, cy, cw, 200).strokeColor(C.terminal).lineWidth(0.8).stroke()

// Terminal header
doc.rect(cX, cy, cw, 16).fillColor('#0f1a0f').fill()
doc.fontSize(7.5).fillColor(C.terminal).font('Courier')
  .text('lot-terminal — v33 — closing transmission', cX + 10, cy + 4, { width: cw - 20, align: 'center' })

doc.fontSize(8).fillColor(C.terminal).font('Courier')
  .text('$ lot --status', cX + 12, cy + 24)
doc.fontSize(8).fillColor(C.text).font('Courier')
  .text('LOT v33  ·  843 badges  ·  uptime: your whole practice', cX + 12, cy + 36)
doc.fontSize(8).fillColor(C.dim).font('Courier')
  .text('$ cat /etc/motd', cX + 12, cy + 50)
doc.fontSize(8).fillColor(C.gold).font('Courier')
  .text('"Self-care is not a quest you complete."', cX + 12, cy + 62)
doc.fontSize(8).fillColor(C.gold).font('Courier')
  .text('"It is a world you build."', cX + 12, cy + 75)
doc.fontSize(8).fillColor(C.dim).font('Courier')
  .text('$ echo $STREAK', cX + 12, cy + 90)
doc.fontSize(8).fillColor(C.terminal).font('Courier')
  .text('[your current streak]', cX + 12, cy + 103)
doc.fontSize(8).fillColor(C.dim).font('Courier')
  .text('$ git log --oneline -5', cX + 12, cy + 118)
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('Commit: showed up  ·  Commit: wrote honestly  ·  Commit: rested', cX + 12, cy + 131)
doc.fontSize(8).fillColor(C.dim).font('Courier')
  .text('$ lot badge list | grep COSMIC', cX + 12, cy + 145)
doc.fontSize(8).fillColor(C.ultra).font('Courier-Bold')
  .text('[COSMIC] twenty_three_registers  ·  Unlocked when ready', cX + 12, cy + 158)
doc.fontSize(8).fillColor(C.gold).font('Courier-Bold')
  .text('[ LEVEL UP ]', cX + 12, cy + 175)

cy = cy + 220

doc.fontSize(10).fillColor(C.terminal).font('Courier-Bold')
  .text('∘ → ≈ → ≋  →  $ sudo self --care', L, cy, { align: 'center', width: W })

cy = PH - 100
hr(cy)
cy += 10
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('© 2025–2026 LOT Systems. All rights reserved.', L, cy, { align: 'center', width: W })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(C.dim).font('Courier')
  .text('LOT® Founded 7 April 2016  ·  brand.lot-systems.com', L, cy, { align: 'center', width: W })
cy = doc.y + 4
doc.fontSize(7.5).fillColor(C.terminal).font('Courier-Bold')
  .text('MASTER CODEX v33  ·  843 BADGES  ·  THE TERMINAL ORACLE', L, cy, { align: 'center', width: W })

// ── FINALIZE ──────────────────────────────────────────────────────
doc.end()

stream.on('finish', () => {
  console.log('PDF generated: ' + OUT_FILE)
  const stats = fs.statSync(OUT_FILE)
  console.log('File size: ' + (stats.size / 1024).toFixed(1) + ' KB')
  console.log('Version: v33 — The Terminal Oracle')
  console.log('Badges: 843 total (+31 from v32)')
})

stream.on('error', (err) => {
  console.error('PDF generation error:', err)
  process.exit(1)
})
