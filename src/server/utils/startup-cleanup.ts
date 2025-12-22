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
    // Find all note logs across all users
    const allNotes = await fastify.models.Log.findAll({
      where: {
        event: 'note',
      },
    })

    // Check for empty or placeholder text - be aggressive to clean up accumulated mess
    const isEmptyOrPlaceholder = (log: any) => {
      if (!log.text || log.text.trim().length === 0) return true
      const text = log.text.trim().toLowerCase()
      // Catch all variations of placeholder text that got saved
      if (text.includes('delete')) return true
      if (text.includes('record')) return true
      if (text.includes('will be')) return true
      if (text.length < 5) return true
      return false
    }

    const emptyNotes = allNotes.filter(isEmptyOrPlaceholder)

    if (emptyNotes.length === 0) {
      console.log('✅ [STARTUP] No empty/placeholder logs found - database is clean')
      return
    }

    console.log(`📊 [STARTUP] Found ${emptyNotes.length} empty/placeholder logs to delete`)
    console.log(`📊 [STARTUP] Sample texts: ${emptyNotes.slice(0, 5).map(x => `"${x.text || '(empty)')}"` ).join(', ')}`)

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
