#!/usr/bin/env tsx
/**
 * Restore Memory Answer Events from Backup (Using Sequelize)
 *
 * Restores deleted Memory answer events (event='answer') from a backup database
 * to the production database. Only restores records that don't already exist.
 */

import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

// Backup database credentials (provided by user)
const backupDb = new Sequelize('defaultdb', 'doadmin', 'AVNS_8V6Hqzuxwj0JkMxgNvR', {
  host: 'db-postgresql-nyc3-92053-dec-24-backup-do-user-22640384-0.l.db.ondigitalocean.com',
  port: 25060,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
})

// Production database credentials
const prodDb = new Sequelize(
  process.env.DB_NAME || 'defaultdb',
  process.env.DB_USER || 'doadmin',
  process.env.DB_PASSWORD || 'AVNS_8V6Hqzuxwj0JkMxgNvR',
  {
    host: process.env.DB_HOST || 'db-postgresql-nyc3-92053-do-user-22640384-0.f.db.ondigitalocean.com',
    port: parseInt(process.env.DB_PORT || '25060'),
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
)

async function restoreMemoryAnswers() {
  console.log('🔄 Starting Memory Answer Restoration\n')

  try {
    // Test connections
    console.log('📦 Connecting to backup database...')
    await backupDb.authenticate()
    console.log('✅ Connected to backup database\n')

    console.log('🗄️  Connecting to production database...')
    await prodDb.authenticate()
    console.log('✅ Connected to production database\n')

    // Calculate 4 days ago
    const fourDaysAgo = new Date()
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)

    console.log('🔍 Finding deleted Memory answer events...')
    console.log(`   Looking for events since: ${fourDaysAgo.toISOString()}\n`)

    // Get answer events from backup (past 4 days)
    const [backupAnswers] = await backupDb.query(`
      SELECT id, user_id, event, text, metadata, context, created_at, updated_at
      FROM logs
      WHERE event = 'answer'
        AND created_at >= :fourDaysAgo
      ORDER BY created_at DESC
    `, {
      replacements: { fourDaysAgo }
    })

    console.log(`   Found ${backupAnswers.length} answer events in backup\n`)

    // Get existing answer IDs from production
    const [prodAnswers] = await prodDb.query(`
      SELECT id FROM logs WHERE event = 'answer'
    `)

    const existingIds = new Set((prodAnswers as any[]).map(r => r.id))
    console.log(`   Found ${existingIds.size} answer events currently in production\n`)

    // Find missing answers
    const missingAnswers = (backupAnswers as any[]).filter(row => !existingIds.has(row.id))

    console.log(`📊 Analysis:`)
    console.log(`   Total in backup (past 4 days): ${backupAnswers.length}`)
    console.log(`   Currently in production: ${existingIds.size}`)
    console.log(`   Missing (to restore): ${missingAnswers.length}\n`)

    if (missingAnswers.length === 0) {
      console.log('✅ No missing answer events found. Database is complete!')
      return
    }

    // Show sample of what will be restored
    console.log('📝 Sample of missing answers:')
    missingAnswers.slice(0, 5).forEach((answer: any, i: number) => {
      const metadata = typeof answer.metadata === 'string' ? JSON.parse(answer.metadata) : answer.metadata
      const question = metadata?.question || 'Unknown question'
      const userAnswer = metadata?.answer || 'Unknown answer'
      console.log(`   ${i + 1}. Q: "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`)
      console.log(`      A: "${userAnswer.substring(0, 50)}${userAnswer.length > 50 ? '...' : ''}"`)
      console.log(`      Date: ${new Date(answer.created_at).toLocaleString()}`)
    })
    if (missingAnswers.length > 5) {
      console.log(`   ... and ${missingAnswers.length - 5} more`)
    }
    console.log()

    console.log(`⚠️  Ready to restore ${missingAnswers.length} Memory answer events\n`)
    console.log('💾 Starting restoration...')

    let restored = 0
    for (const answer of missingAnswers) {
      // Ensure metadata and context are proper JSON
      const metadata = typeof answer.metadata === 'string' ? answer.metadata : JSON.stringify(answer.metadata)
      const context = typeof answer.context === 'string' ? answer.context : JSON.stringify(answer.context)

      await prodDb.query(`
        INSERT INTO logs (id, user_id, event, text, metadata, context, created_at, updated_at)
        VALUES (:id, :userId, :event, :text, :metadata::jsonb, :context::jsonb, :createdAt, :updatedAt)
        ON CONFLICT (id) DO NOTHING
      `, {
        replacements: {
          id: answer.id,
          userId: answer.user_id,
          event: answer.event,
          text: answer.text || '',
          metadata,
          context: context || '{}',
          createdAt: answer.created_at,
          updatedAt: answer.updated_at
        }
      })

      restored++
      if (restored % 10 === 0) {
        console.log(`   Restored ${restored}/${missingAnswers.length} answers...`)
      }
    }

    console.log(`\n✅ Restoration complete!`)
    console.log(`   Restored ${restored} Memory answer events`)
    console.log(`   No data was overwritten or lost\n`)

    // Verify restoration
    console.log('🔍 Verifying restoration...')
    const [verifyResult] = await prodDb.query(`
      SELECT COUNT(*) as count FROM logs WHERE event = 'answer'
    `)
    console.log(`   Total answer events in production: ${(verifyResult as any[])[0].count}`)
    console.log('✅ Verification complete!\n')

  } catch (error: any) {
    console.error('❌ Restoration failed:', error.message)
    if (error.original) {
      console.error('Database error:', error.original.message)
    }
    throw error
  } finally {
    // Close connections
    await backupDb.close()
    await prodDb.close()
    console.log('🔌 Closed database connections')
  }
}

// Run restoration
restoreMemoryAnswers()
  .then(() => {
    console.log('\n✨ Memory Answer restoration completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
