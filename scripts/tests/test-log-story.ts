/**
 * LOT SYSTEMS CORPORATION — S-2: VADIK MARMELADOV
 * Unit checks for log-story (digest, local story, Arcade rank) and the
 * /system command registry. Run: npx tsx scripts/tests/test-log-story.ts
 */
import assert from 'node:assert/strict'
import {
  compressEntries, composeLocalStory, digestToPromptBlock,
  arcadeXp, arcadeRank, parseStoryPeriod, stripGenerated,
} from '../../src/shared/utils/log-story'
import { LOG_COMMANDS, buildSystemHelp } from '../../src/client/utils/logCommands'
import { detectTriggers } from '../../src/client/utils/logTriggers'

const now = Date.UTC(2026, 9, 26, 12)
const day = 86400000
const e = (d: number, text: string, ctx: any = null) => ({ text, createdAt: now - d * day, context: ctx })

// parse
assert.equal(parseStoryPeriod('hello /story'), 'week')
assert.equal(parseStoryPeriod('/story month'), 'month')
assert.equal(parseStoryPeriod('x /story today'), 'day')
assert.equal(parseStoryPeriod('/storyboard year'), 'week')

// strip generated blocks and slash commands
assert.equal(stripGenerated('real thought\n\n📖 generated story').trim(), 'real thought')
assert.equal(stripGenerated('/story'), '')

// empty
const empty = compressEntries([], 'week', now)
assert.equal(empty.entryCount, 0)
assert.match(composeLocalStory(empty), /No entries/)

// digest: 5 consecutive days, last day spikes
const entries = [
  e(4, 'quiet morning walk coffee', { city: 'Austin', weatherDescription: 'clear' }),
  e(3, 'quiet morning work coffee', { city: 'Austin', weatherDescription: 'clear' }),
  e(2, 'quiet morning coffee again', { city: 'Austin', weatherDescription: 'rain' }),
  e(1, 'short note here today ok', { city: 'Austin' }),
  e(0, Array(80).fill('word').join(' ') + ' big day', { city: 'Austin', astroMoonPhase: 'Waxing' }),
  e(40, 'outside the week window'),
]
const d = compressEntries(entries, 'week', now)
assert.equal(d.entryCount, 5)
assert.equal(d.activeDays, 5)
assert.equal(d.streak, 5)
assert.equal(d.topCity, 'Austin')
assert.equal(d.spike?.direction, 'up')
assert.equal(d.peakDay?.words, 82)
assert.ok(d.themes.includes('coffee'))
assert.match(digestToPromptBlock(d), /PATTERN CHANGE/)
assert.match(composeLocalStory(d), /5 entries/)
assert.equal(compressEntries(entries, 'year', now).entryCount, 6)

// arcade
const r0 = arcadeRank(0)
assert.equal(r0.level, 1); assert.equal(r0.title, 'SEED')
const xp = arcadeXp(entries, now)
assert.ok(xp > 0)
assert.ok(arcadeRank(xp).level >= 2)
assert.equal(arcadeRank(99999).nextAt, null)

// command registry: every slash-keyword trigger is documented
const documented = new Set(LOG_COMMANDS.map(c => c.trigger))
for (const t of ['ai-scan','silent-mode','breathe','force-fast','radio-toggle','night-mode','prayer-mode','freeze-widgets','qos-report','assembly-check','phys-report','sil-check','qi-rfi','system-help','story-mode','how-checkin','toggle-synth']) {
  assert.ok(documented.has(t as any), `undocumented trigger ${t}`)
}
for (const c of LOG_COMMANDS) {
  const cmd = c.usage.split(' ')[0]
  assert.ok(detectTriggers(cmd).includes(c.trigger), `${cmd} does not fire ${c.trigger}`)
}
const help = buildSystemHelp(arcadeRank(xp))
assert.match(help, /OPERATOR RANK/); assert.match(help, /\/story/); assert.match(help, /\/system/)
console.log('log-story: all checks passed')
