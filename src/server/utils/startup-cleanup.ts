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

    const emptyNotes = emptyLogs.filter(
      (log) => !log.text || log.text.trim().length === 0
    )

    if (emptyNotes.length === 0) {
      console.log('✅ [STARTUP] No empty logs found - database is clean')
      return
    }

    console.log(`📊 [STARTUP] Found ${emptyNotes.length} empty logs across all users`)

    // Delete all empty logs
    const deletedIds = emptyNotes.map((log) => log.id)
    await fastify.models.Log.destroy({
      where: { id: deletedIds },
    })

    console.log(`✅ [STARTUP] Deleted ${emptyNotes.length} empty logs`)
    console.log('💡 [STARTUP] Fresh empty logs will be created when users load the Log page')

  } catch (error: any) {
    console.error('❌ [STARTUP] Cleanup failed:', error.message)
    // Don't crash the server if cleanup fails - just log the error
  }
}
