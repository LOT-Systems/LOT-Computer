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
    // Find and delete ALL empty logs (safer than direct destroy)
    const emptyLogs = await fastify.models.Log.findAll({
      where: {
        event: 'note',
        text: '',
      },
    })

    if (emptyLogs.length === 0) {
      console.log('✅ [STARTUP] No empty logs found - database is clean')
      return
    }

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
