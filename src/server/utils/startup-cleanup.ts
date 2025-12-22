/**
 * Startup Cleanup: Delete all empty logs on server boot
 *
 * This ensures a clean database state and removes accumulated empty logs.
 * Runs automatically when the server starts.
 */

import { FastifyInstance } from 'fastify'

export async function runStartupCleanup(fastify: FastifyInstance) {
  console.log('🧹 [STARTUP] Deleting ALL empty logs from database...')

  try {
    // Delete ALL empty logs without filtering - clean slate
    const result = await fastify.models.Log.destroy({
      where: {
        event: 'note',
        text: '',  // Only delete truly empty notes (empty string)
      },
    })

    if (result === 0) {
      console.log('✅ [STARTUP] No empty logs found - database is clean')
    } else {
      console.log(`✅ [STARTUP] Deleted ${result} empty logs`)
      console.log('💡 [STARTUP] Fresh empty logs will be created when users load the page')
    }

  } catch (error: any) {
    console.error('❌ [STARTUP] Cleanup failed:', error.message)
  }
}
