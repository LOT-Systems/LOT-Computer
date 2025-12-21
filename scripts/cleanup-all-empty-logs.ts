#!/usr/bin/env tsx
/**
 * One-time cleanup: Delete ALL empty log entries
 *
 * This removes all empty note logs from the database.
 * Run this once to clean up the accumulated duplicates.
 *
 * Usage:
 *   npx tsx scripts/cleanup-all-empty-logs.ts
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

async function cleanupAllEmptyLogs() {
  const client = new Client(config)
  await client.connect()

  try {
    console.log('🧹 Cleaning up ALL empty log entries...\n')

    // Count empty logs first
    const countResult = await client.query(`
      SELECT COUNT(*) as count
      FROM logs
      WHERE event = 'note' AND (text IS NULL OR text = '' OR TRIM(text) = '')
    `)

    const totalEmpty = parseInt(countResult.rows[0].count, 10)
    console.log(`Found ${totalEmpty} empty log entries`)

    if (totalEmpty === 0) {
      console.log('✨ No empty logs to clean up!')
      return
    }

    // Delete all empty logs
    const deleteResult = await client.query(`
      DELETE FROM logs
      WHERE event = 'note' AND (text IS NULL OR text = '' OR TRIM(text) = '')
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

cleanupAllEmptyLogs().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
