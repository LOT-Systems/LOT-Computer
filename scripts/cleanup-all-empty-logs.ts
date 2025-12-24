#!/usr/bin/env tsx
/**
 * One-time cleanup: Delete ALL empty log entries
 *
 * This removes all empty note logs from the database.
 * Run this once to clean up the accumulated duplicates.
 *
 * Usage:
 *   npx tsx scripts/cleanup-all-empty-logs.ts              # Preview what will be deleted
 *   npx tsx scripts/cleanup-all-empty-logs.ts --confirm    # Actually delete them
 */

import dotenv from 'dotenv'
import { Client } from 'pg'

dotenv.config()

const config = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '25060', 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
}

async function cleanupAllEmptyLogs(confirm: boolean) {
  const client = new Client(config)
  await client.connect()

  try {
    console.log('🧹 Empty Log Cleanup Utility\n')

    // Count and show empty logs from past 3 days
    const countResult = await client.query(`
      SELECT COUNT(*) as count
      FROM logs
      WHERE event = 'note'
        AND (text IS NULL OR text = '' OR TRIM(text) = '')
        AND "createdAt" >= NOW() - INTERVAL '3 days'
    `)

    const totalEmpty = parseInt(countResult.rows[0].count, 10)
    console.log(`📊 Found ${totalEmpty} empty log entries from past 3 days`)

    if (totalEmpty === 0) {
      console.log('✨ No empty logs to clean up!')
      return
    }

    // Show sample of what will be deleted
    const sampleResult = await client.query(`
      SELECT
        id,
        "userId",
        text,
        "createdAt",
        "updatedAt"
      FROM logs
      WHERE event = 'note'
        AND (text IS NULL OR text = '' OR TRIM(text) = '')
        AND "createdAt" >= NOW() - INTERVAL '3 days'
      ORDER BY "createdAt" DESC
      LIMIT 10
    `)

    console.log(`\n📋 Sample of empty logs to be deleted (showing first 10):`)
    console.table(sampleResult.rows.map(row => ({
      id: row.id.substring(0, 8) + '...',
      userId: row.userId.substring(0, 8) + '...',
      text: row.text === null ? 'NULL' : `"${row.text}"`,
      created: new Date(row.createdAt).toISOString().split('T')[0]
    })))

    if (!confirm) {
      console.log(`\n⚠️  DRY RUN MODE - Nothing deleted`)
      console.log(`\n💡 To actually delete these ${totalEmpty} empty logs, run:`)
      console.log(`   npx tsx scripts/cleanup-all-empty-logs.ts --confirm`)
      return
    }

    // Actually delete
    console.log(`\n⚠️  DELETING ${totalEmpty} empty logs from past 3 days...`)
    const deleteResult = await client.query(`
      DELETE FROM logs
      WHERE event = 'note'
        AND (text IS NULL OR text = '' OR TRIM(text) = '')
        AND "createdAt" >= NOW() - INTERVAL '3 days'
      RETURNING id
    `)

    console.log(`\n✅ Deleted ${deleteResult.rows.length} empty log entries`)
    console.log('\n💡 Next time you load the Log page, the API will create one fresh empty log for input.')

  } catch (error: any) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await client.end()
  }
}

const args = process.argv.slice(2)
const confirm = args.includes('--confirm')

cleanupAllEmptyLogs(confirm).catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
