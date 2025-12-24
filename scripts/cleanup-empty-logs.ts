#!/usr/bin/env tsx
/**
 * Clean up duplicate empty log entries
 *
 * This script safely removes old empty note logs while keeping the most recent one per user.
 *
 * Usage:
 *   npm run cleanup-logs           # Dry run (shows what would be deleted)
 *   npm run cleanup-logs -- --confirm  # Actually delete the logs
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

async function connectDB() {
  const client = new Client(config)
  await client.connect()
  return client
}

async function analyzeEmptyLogs() {
  const client = await connectDB()
  try {
    console.log('📊 Analyzing empty log entries...\n')

    // 1. Count empty logs by date
    console.log('1️⃣  Empty logs by date (last 10 days):')
    const byDate = await client.query(`
      SELECT
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM logs
      WHERE event = 'note' AND (text IS NULL OR text = '')
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 10
    `)
    console.table(byDate.rows)

    // 2. Find users with multiple empty notes
    console.log('\n2️⃣  Users with multiple empty notes:')
    const multipleEmpty = await client.query(`
      SELECT
        "userId",
        COUNT(*) as empty_count
      FROM logs
      WHERE event = 'note' AND (text IS NULL OR text = '')
      GROUP BY "userId"
      HAVING COUNT(*) > 1
      ORDER BY empty_count DESC
      LIMIT 20
    `)
    console.table(multipleEmpty.rows)

    const totalDuplicates = multipleEmpty.rows.reduce((sum, row) => sum + (row.empty_count - 1), 0)
    console.log(`\n📈 Summary:`)
    console.log(`   Total users with duplicates: ${multipleEmpty.rows.length}`)
    console.log(`   Total duplicate empty logs: ${totalDuplicates}`)
    console.log(`   (Keeping 1 most recent per user, deleting ${totalDuplicates} old ones)\n`)

    return { totalDuplicates, affectedUsers: multipleEmpty.rows.length }
  } finally {
    await client.end()
  }
}

async function cleanupEmptyLogs(dryRun: boolean) {
  const client = await connectDB()
  try {
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - Nothing will be deleted\n')
    } else {
      console.log('⚠️  LIVE MODE - Will delete duplicate empty logs\n')
    }

    // Get logs that would be deleted
    const toDelete = await client.query(`
      SELECT
        id,
        "userId",
        "createdAt"
      FROM (
        SELECT
          id,
          "userId",
          "createdAt",
          ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) as rn
        FROM logs
        WHERE event = 'note' AND (text IS NULL OR text = '')
      ) ranked
      WHERE rn > 1
      ORDER BY "createdAt" DESC
      LIMIT 100
    `)

    console.log(`📋 ${dryRun ? 'Would delete' : 'Deleting'} ${toDelete.rows.length} old empty logs:`)
    if (toDelete.rows.length > 0) {
      console.table(toDelete.rows.slice(0, 20))
      if (toDelete.rows.length > 20) {
        console.log(`   ... and ${toDelete.rows.length - 20} more`)
      }
    }

    if (!dryRun) {
      const result = await client.query(`
        DELETE FROM logs
        WHERE id IN (
          SELECT id
          FROM (
            SELECT
              id,
              ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "createdAt" DESC) as rn
            FROM logs
            WHERE event = 'note' AND (text IS NULL OR text = '')
          ) ranked
          WHERE rn > 1
        )
        RETURNING id
      `)

      console.log(`\n✅ Successfully deleted ${result.rows.length} duplicate empty logs`)
      console.log(`   Kept the most recent empty log for each user`)
    } else {
      console.log(`\n💡 To actually delete these logs, run:`)
      console.log(`   npm run cleanup-logs -- --confirm`)
    }
  } finally {
    await client.end()
  }
}

async function main() {
  const args = process.argv.slice(2)
  const isConfirmed = args.includes('--confirm')

  console.log('🧹 Empty Logs Cleanup Utility\n')

  try {
    // First, analyze
    const { totalDuplicates, affectedUsers } = await analyzeEmptyLogs()

    if (totalDuplicates === 0) {
      console.log('✨ No duplicate empty logs found! Database is clean.')
      return
    }

    console.log('\n' + '='.repeat(60) + '\n')

    // Then cleanup (dry run or real)
    await cleanupEmptyLogs(!isConfirmed)

  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to database')
      console.error('   Make sure DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD are set in .env')
    } else {
      console.error('❌ Error:', error.message)
    }
    process.exit(1)
  }
}

main().catch(console.error)
