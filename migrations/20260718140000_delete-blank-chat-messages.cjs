'use strict'

// Purge chat messages that are blank once all invisible characters are
// stripped. The earlier migration used TRIM(), which removes only the ASCII
// space (U+0020) — so messages made of tabs, newlines, NBSP (U+00A0), or
// zero-width characters (U+200B–U+200D, U+2060, U+FEFF, U+180E) survived and
// rendered as empty rows in Sync. This condition is a superset of the old one.
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.sequelize.query(`
      DELETE FROM chat_messages
      WHERE regexp_replace(
        message,
        '[[:space:]\\u200B\\u200C\\u200D\\u2060\\uFEFF\\u00A0\\u180E]',
        '',
        'g'
      ) = ''
    `)
  },

  async down() {
    // Deleted blank messages are not restored
  },
}
