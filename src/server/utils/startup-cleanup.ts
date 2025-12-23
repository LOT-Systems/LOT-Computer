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
    // Find ALL notes (need to check text content)
    const allNotes = await fastify.models.Log.findAll({
      where: {
        event: 'note',
      },
    })

    // Filter to find truly empty notes and placeholder text
    const emptyLogs = allNotes.filter(log => {
      if (!log.text || log.text.trim() === '') return true
      const text = log.text.trim().toLowerCase()
      // Catch placeholder text that might have been saved
      return text.includes('will be deleted') || text.includes('log record')
    })

    if (emptyLogs.length === 0) {
      console.log('✅ [STARTUP] No empty logs found - database is clean')
      return
    }

    console.log(`📊 [STARTUP] Found ${emptyLogs.length} empty/placeholder logs`)

    // Delete by IDs
    const idsToDelete = emptyLogs.map(log => log.id)
    await fastify.models.Log.destroy({
      where: { id: idsToDelete },
    })

    console.log(`✅ [STARTUP] Deleted ${emptyLogs.length} empty logs`)

  } catch (error: any) {
    console.error('❌ [STARTUP] Cleanup failed:', error.message)
    // Don't throw - let server start anyway
  }
}
