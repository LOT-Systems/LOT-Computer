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
    // Find ALL logs (any event type) to check for empty content
    const allLogs = await fastify.models.Log.findAll({
      where: {},
    })

    // Filter to find truly empty logs (empty string or whitespace only)
    const emptyLogs = allLogs.filter(log => {
      // Match logs with no text or only whitespace
      return !log.text || log.text.trim() === ''
    })

    if (emptyLogs.length === 0) {
      console.log('✅ [STARTUP] No empty logs found - database is clean')
      return
    }

    console.log(`📊 [STARTUP] Found ${emptyLogs.length} empty logs to delete (all event types)`)
    console.log(`🗑️  [STARTUP] Cleaning up accumulated empty logs...`)

    // Delete by IDs
    const idsToDelete = emptyLogs.map(log => log.id)
    await fastify.models.Log.destroy({
      where: { id: idsToDelete },
    })

    console.log(`✅ [STARTUP] Successfully deleted ${emptyLogs.length} empty logs`)
    console.log(`💡 [STARTUP] A fresh empty log will be created on first /logs request`)

  } catch (error: any) {
    console.error('❌ [STARTUP] Cleanup failed:', error.message)
    // Don't throw - let server start anyway
  }
}
