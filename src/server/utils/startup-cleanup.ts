/**
 * Startup Cleanup: Delete all empty logs on server boot
 *
 * This ensures a clean database state and removes accumulated empty logs.
 * Runs automatically when the server starts.
 */

import { FastifyInstance } from 'fastify'

export async function runStartupCleanup(fastify: FastifyInstance) {
  console.log('🧹 [STARTUP] Running empty logs cleanup...')

  try {
    // Find all empty note logs
    const emptyLogs = await fastify.models.Log.findAll({
      where: {
        event: 'note',
      },
    })

    // Check for empty or placeholder text (MUST match GET /logs logic exactly)
    const isEmptyOrPlaceholder = (log: any) => {
      if (!log.text || log.text.trim().length === 0) return true
      const text = log.text.trim().toLowerCase()
      if (text === 'the log record will be deleted') return true
      if (text === 'the log will be deleted') return true
      if (text.includes('will be deleted')) return true
      if (text.includes('log record')) return true
      if (text.length < 5) return true
      return false
    }

    const emptyNotes = emptyLogs.filter(isEmptyOrPlaceholder)

    if (emptyNotes.length === 0) {
      console.log('✅ [STARTUP] No empty/placeholder logs found - database is clean')
      return
    }

    console.log(`📊 [STARTUP] Found ${emptyNotes.length} empty/placeholder logs across all users`)

    // Delete all empty/placeholder logs
    const deletedIds = emptyNotes.map((log) => log.id)
    await fastify.models.Log.destroy({
      where: { id: deletedIds },
    })

    console.log(`✅ [STARTUP] Deleted ${emptyNotes.length} empty/placeholder logs`)
    console.log('💡 [STARTUP] Fresh empty logs will be created when users load the Log page')

  } catch (error: any) {
    console.error('❌ [STARTUP] Cleanup failed:', error.message)
    // Don't crash the server if cleanup fails - just log the error
  }
}
