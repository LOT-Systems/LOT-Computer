/**
 * Verification: story compression + /system registry (pure modules).
 * Run: npx tsx scripts/test-story-compression.ts
 */
import assert from 'node:assert'
import * as sc from '../src/shared/utils/story-compression'
import * as lt from '../src/client/utils/logTriggers'
const now=new Date('2026-10-16T12:00:00Z')
const d=(n: number)=>new Date(now.getTime()-n*864e5).toISOString()
assert.equal(sc.parseStoryPeriod('hi /story week'),'week')
assert.equal(sc.parseStoryPeriod('/story'),'day')
assert.equal(sc.parseStoryPeriod('/story yearly'),'year')
assert.equal(sc.stripStoryCommand('tired /story month 📖'),'tired')
const rows=[
 {event:'log_entry',text:'a',createdAt:d(0.2),context:{city:'NYC',temperature:68}},
 {event:'log_entry',text:'b',createdAt:d(1),context:{city:'NYC',temperature:70}},
 {event:'log_entry',text:'c',createdAt:d(2)},
 {event:'log_entry',text:'d',createdAt:d(5)},
 {event:'log_entry',text:'old',createdAt:d(40)},
 {event:'emotional_checkin',createdAt:d(6),metadata:{emotionalState:'low'}},
 {event:'emotional_checkin',createdAt:d(1),metadata:{emotionalState:'good'}},
]
const g=sc.buildStoryDigest(rows,'week',now)
assert.equal(g.entryCount,4); assert.equal(g.moodShift,'low → good'); assert.equal(g.cities[0],'NYC')
assert.equal(g.volumeTrend,'rising'); assert.equal(g.avgTemperatureC,21)

assert.equal(sc.buildStoryDigest(rows,'day',now).entryCount,2)
assert.equal(sc.computeArcadeRank(rows).rank,'INSERT COIN')
assert.deepEqual(lt.detectTriggers('/story week'),['story-mode'])
assert.ok(lt.detectTriggers('/system').includes('system-help'))
console.log('PASS')
