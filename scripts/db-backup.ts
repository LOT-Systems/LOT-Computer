#!/usr/bin/env tsx
/**
 * Database Backup Utility
 *
 * Creates daily backups of the PostgreSQL database and manages retention.
 *
 * Usage:
 *   npm run db:backup              # Create backup with default settings
 *   npm run db:backup -- --keep 7  # Keep last 7 backups
 *
 * Setup cron job for daily backups at 2 AM:
 *   0 2 * * * cd /path/to/lot-systems && npm run db:backup >> logs/backup.log 2>&1
 */

import dotenv from 'dotenv'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

dotenv.config()

const execAsync = promisify(exec)

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || '25060',
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
}

// Default: keep last 30 days of backups
const DEFAULT_RETENTION_DAYS = 30

async function createBackup(keepDays: number = DEFAULT_RETENTION_DAYS) {
  try {
    // Create backups directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0]
    const backupFile = path.join(backupDir, `lot-systems-db-${timestamp}.sql`)

    console.log('📦 Creating database backup...')
    console.log(`   Database: ${config.database}`)
    console.log(`   Host: ${config.host}`)
    console.log(`   File: ${backupFile}`)

    // Create backup using pg_dump
    const pgDumpCommand = `PGPASSWORD="${config.password}" pg_dump \
      -h ${config.host} \
      -p ${config.port} \
      -U ${config.user} \
      -d ${config.database} \
      -F p \
      -f "${backupFile}"`

    await execAsync(pgDumpCommand)

    // Check file size
    const stats = fs.statSync(backupFile)
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)

    console.log(`✅ Backup created successfully!`)
    console.log(`   Size: ${fileSizeMB} MB`)
    console.log(`   Location: ${backupFile}`)

    // Compress backup
    console.log('\n🗜️  Compressing backup...')
    await execAsync(`gzip "${backupFile}"`)
    const compressedFile = `${backupFile}.gz`
    const compressedStats = fs.statSync(compressedFile)
    const compressedSizeMB = (compressedStats.size / (1024 * 1024)).toFixed(2)
    const compressionRatio = ((1 - compressedStats.size / stats.size) * 100).toFixed(1)

    console.log(`✅ Compression complete!`)
    console.log(`   Compressed size: ${compressedSizeMB} MB`)
    console.log(`   Compression ratio: ${compressionRatio}%`)
    console.log(`   File: ${compressedFile}`)

    // Clean up old backups
    await cleanupOldBackups(backupDir, keepDays)

    return compressedFile
  } catch (error: any) {
    console.error('❌ Backup failed:', error.message)
    if (error.stderr) {
      console.error('Error details:', error.stderr)
    }
    throw error
  }
}

async function cleanupOldBackups(backupDir: string, keepDays: number) {
  try {
    console.log(`\n🧹 Cleaning up backups older than ${keepDays} days...`)

    const files = fs.readdirSync(backupDir)
    const backupFiles = files.filter(f => f.startsWith('lot-systems-db-') && f.endsWith('.gz'))

    if (backupFiles.length === 0) {
      console.log('   No old backups to clean up')
      return
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - keepDays)

    let deletedCount = 0
    let deletedSize = 0

    for (const file of backupFiles) {
      const filePath = path.join(backupDir, file)
      const stats = fs.statSync(filePath)

      if (stats.mtime < cutoffDate) {
        deletedSize += stats.size
        fs.unlinkSync(filePath)
        deletedCount++
        console.log(`   Deleted: ${file}`)
      }
    }

    if (deletedCount > 0) {
      const deletedSizeMB = (deletedSize / (1024 * 1024)).toFixed(2)
      console.log(`✅ Cleaned up ${deletedCount} old backup(s), freed ${deletedSizeMB} MB`)
    } else {
      console.log('   No old backups to delete')
    }

    // List remaining backups
    const remaining = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('lot-systems-db-') && f.endsWith('.gz'))
    console.log(`\n📚 Total backups: ${remaining.length}`)
  } catch (error: any) {
    console.error('⚠️  Cleanup warning:', error.message)
    // Don't fail the backup if cleanup fails
  }
}

async function listBackups() {
  const backupDir = path.join(process.cwd(), 'backups')
  if (!fs.existsSync(backupDir)) {
    console.log('No backups directory found')
    return
  }

  const files = fs.readdirSync(backupDir)
  const backupFiles = files.filter(f => f.startsWith('lot-systems-db-') && f.endsWith('.gz'))

  if (backupFiles.length === 0) {
    console.log('No backups found')
    return
  }

  console.log(`\n📚 Available backups (${backupFiles.length}):\n`)

  const backups = backupFiles.map(file => {
    const filePath = path.join(backupDir, file)
    const stats = fs.statSync(filePath)
    return {
      file,
      size: (stats.size / (1024 * 1024)).toFixed(2),
      date: stats.mtime.toISOString().split('T')[0],
      time: stats.mtime.toTimeString().split(' ')[0],
    }
  }).sort((a, b) => b.file.localeCompare(a.file))

  console.table(backups)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--list')) {
    await listBackups()
    return
  }

  // Parse --keep argument
  let keepDays = DEFAULT_RETENTION_DAYS
  const keepIndex = args.indexOf('--keep')
  if (keepIndex !== -1 && args[keepIndex + 1]) {
    keepDays = parseInt(args[keepIndex + 1], 10)
    if (isNaN(keepDays) || keepDays < 1) {
      console.error('❌ Invalid --keep value. Must be a positive number.')
      process.exit(1)
    }
  }

  console.log('🗄️  LOT Systems Database Backup\n')
  console.log(`Retention policy: Keep last ${keepDays} days\n`)

  await createBackup(keepDays)

  console.log('\n✨ Backup process complete!\n')
  console.log('💡 To list all backups: npm run db:backup -- --list')
  console.log('💡 To restore: gunzip backup.sql.gz && psql < backup.sql')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
