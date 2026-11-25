import { readFileSync, writeFileSync } from 'node:fs'
import { parseQuotesCsv, renderQuoteData } from '../src/server/basics/quotes-csv'
import { envelope, unquotedLines } from '../src/server/basics/cogs'

// LOT-FM-001 quote intake. Usage: npm run basics:quotes -- <sheet.csv> [--write]
// Validates the sheet, projects the envelope with those quotes, writes quotes.data.ts only on --write
// and only when the projected envelope is GREEN. Exit 1 on any rejection.
const [file, flag] = process.argv.slice(2)
if (!file) { console.error('USAGE: basics:quotes -- <sheet.csv> [--write]'); process.exit(1) }
const { quotes, errors } = parseQuotesCsv(readFileSync(file, 'utf8'))
if (errors.length) { errors.forEach((e) => console.error('REJECT ' + e)); process.exit(1) }
const now = new Date()
const env = envelope(now, quotes)
console.log(`QUOTES ${Object.keys(quotes).length}/23  UNQUOTED ${unquotedLines(now, quotes).join(',') || 'NONE'}`)
console.log(`STATUS ${env.status}  WORST ISSUE ${env.worst.issue} MARGIN ${(env.worst.margin * 100).toFixed(1)}%  MEAN ${(env.meanMargin * 100).toFixed(1)}%`)
if (!env.ok) { console.error('BREACH ' + env.breach); process.exit(1) }
if (flag === '--write') {
  writeFileSync('src/server/basics/quotes.data.ts', renderQuoteData(quotes))
  console.log('WRITTEN src/server/basics/quotes.data.ts')
} else console.log('DRY RUN. Add --write to commit quotes.')
