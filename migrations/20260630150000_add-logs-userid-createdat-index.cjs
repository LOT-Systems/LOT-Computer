// @ts-check

// Adds a composite index on (userId, createdAt) for the logs table.
// Fixes statement-timeout on ORDER BY createdAt ASC LIMIT 1 queries that
// scan all logs for a user (e.g. finding the first/oldest log per user).
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.addIndex('logs', ['userId', 'createdAt'], {
      name: 'idx_logs_userid_createdat',
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.removeIndex('logs', 'idx_logs_userid_createdat')
  },
}
