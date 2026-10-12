'use strict';
const PDFDocument = require('pdfkit');
const { createWriteStream, readFileSync } = require('fs');

const OUTPUT = '/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v33.pdf';
const MD_PATH = '/home/user/LOT-Computer/docs/badges/LOT_BADGES_ACHIEVEMENTS_MASTER_CODEX_v33.md';

const mdContent = readFileSync(MD_PATH, 'utf8');

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 54, bottom: 54, left: 54, right: 54 },
  bufferPages: true,
  info: {
    Title: 'LOT Badges & Achievements Master Codex v33 — The Stoic Terminal',
    Author: 'LOT Systems Corporation',
    Subject: 'Badge & Achievement System — Word Turn v23',
  }
});

const ws = createWriteStream(OUTPUT);
doc.pipe(ws);

// Colors
const GOLD = '#bb8800';
const CYAN = '#336688';
const GREEN = '#336644';
const GRAY = '#555555';
const LGRAY = '#888888';
const PARCH = '#f7f3eb';
const DARK = '#1a1a1a';

// Cover block
doc.rect(0, 0, doc.page.width, 80).fill('#000000');
doc.fillColor('#ffffff').font('Courier-Bold').fontSize(17)
   .text('LOT SYSTEMS CORPORATION', 54, 14, { align: 'center', lineBreak: false });
doc.fontSize(10).font('Courier')
   .text('BADGE & ACHIEVEMENT MASTER CODEX — VERSION 33', 54, 40, { align: 'center', lineBreak: false });
doc.fontSize(8.5)
   .text('THE STOIC TERMINAL  |  WORD TURN v23  |  843 TOTAL BADGES  |  2026-10-12', 54, 60, { align: 'center', lineBreak: false });

doc.y = 95;

const lines = mdContent.split('\n');
let inCode = false;
let codeBuf = [];

function flushCode() {
  if (!codeBuf.length) return;
  const text = codeBuf.join('\n');
  const y0 = doc.y;
  const lineCount = text.split('\n').length;
  const boxH = lineCount * 8.5 + 12;

  // Check if we need a new page
  if (y0 + boxH > doc.page.height - 60) {
    doc.addPage();
  }

  const yNow = doc.y;
  doc.rect(54, yNow, doc.page.width - 108, boxH).fill(PARCH);
  doc.fillColor(DARK).font('Courier').fontSize(7).lineGap(0.5)
     .text(text, 60, yNow + 5, {
       width: doc.page.width - 124,
       lineBreak: true,
       lineGap: 0.5,
     });
  doc.moveDown(0.5);
  codeBuf = [];
}

function ensureSpace(needed) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
  }
}

for (const raw of lines) {
  const line = raw.trimEnd();

  if (line.trim().startsWith('```')) {
    if (inCode) flushCode();
    inCode = !inCode;
    continue;
  }
  if (inCode) {
    codeBuf.push(raw.replace(/\t/g, '  '));
    continue;
  }

  if (line.startsWith('# ')) {
    ensureSpace(25);
    doc.fillColor(GOLD).font('Courier-Bold').fontSize(13)
       .text(line.slice(2), { lineBreak: true });
    doc.moveDown(0.3);
  } else if (line.startsWith('## ')) {
    ensureSpace(20);
    doc.fillColor(GOLD).font('Courier-Bold').fontSize(11)
       .text(line.slice(3), { lineBreak: true });
    doc.moveDown(0.2);
  } else if (line.startsWith('### ')) {
    ensureSpace(16);
    doc.fillColor(CYAN).font('Courier-Bold').fontSize(9.5)
       .text(line.slice(4), { lineBreak: true });
    doc.moveDown(0.15);
  } else if (line.startsWith('#### ')) {
    ensureSpace(14);
    doc.fillColor(GREEN).font('Courier-Bold').fontSize(9)
       .text(line.slice(5), { lineBreak: true });
    doc.moveDown(0.1);
  } else if (line.trim().startsWith('---')) {
    doc.moveDown(0.15);
    doc.strokeColor(LGRAY).lineWidth(0.4)
       .moveTo(54, doc.y).lineTo(doc.page.width - 54, doc.y).stroke();
    doc.moveDown(0.25);
  } else if (line.trim() === '') {
    doc.moveDown(0.2);
  } else if (line.trim().startsWith('> ')) {
    const text = line.trim().slice(2).replace(/\*+([^*]+)\*+/g, '$1');
    ensureSpace(12);
    doc.fillColor(LGRAY).font('Courier').fontSize(7.5)
       .text(text, 66, doc.y, { width: doc.page.width - 130, lineBreak: true });
    doc.moveDown(0.2);
  } else if (line.trim().startsWith('|')) {
    ensureSpace(10);
    doc.fillColor(GRAY).font('Courier').fontSize(7)
       .text(line.trim(), { lineBreak: true });
  } else {
    const text = line.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
    ensureSpace(11);
    doc.fillColor(DARK).font('Courier').fontSize(8)
       .text(text, { lineBreak: true });
    doc.moveDown(0.1);
  }
}

// Flush any remaining code block
flushCode();

// Footer on each page
const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
  doc.switchToPage(i);
  doc.fillColor(LGRAY).font('Courier').fontSize(6)
     .text(
       'LOT SYSTEMS — BADGE & ACHIEVEMENT MASTER CODEX v33 — THE STOIC TERMINAL',
       54, doc.page.height - 28,
       { align: 'left', lineBreak: false, width: doc.page.width - 140 }
     );
  doc.fillColor(LGRAY).font('Courier').fontSize(6)
     .text(`p.${i + 1}`,
       doc.page.width - 80, doc.page.height - 28,
       { align: 'right', lineBreak: false }
     );
}

doc.end();

ws.on('finish', () => {
  const { statSync } = require('fs');
  const size = statSync(OUTPUT).size;
  console.log(`[v33] PDF written: ${OUTPUT}`);
  console.log(`[v33] Size: ${(size/1024).toFixed(1)} KB`);
});

ws.on('error', (e) => {
  console.error('[v33] Error:', e.message);
  process.exit(1);
});
