/**
 * Migration: Add Admin tag to vadikmarmeladov@gmail.com
 *
 * This migration ensures that vadikmarmeladov@gmail.com has the 'admin' tag
 * in the database, providing immediate admin access on deployment.
 *
 * Safe to run multiple times (idempotent) - only adds tag if not already present.
 */

module.exports = {
  async up({ context: queryInterface }) {
    console.log('🔧 Adding Admin tag to vadikmarmeladov@gmail.com...')

    try {
      // Add 'admin' tag to vadikmarmeladov@gmail.com if not already present
      const [results] = await queryInterface.sequelize.query(`
        UPDATE users
        SET tags = array_append(tags, 'admin')
        WHERE email = 'vadikmarmeladov@gmail.com'
        AND NOT ('admin' = ANY(tags))
        RETURNING id, email, "firstName", "lastName", tags;
      `)

      if (results && results.length > 0) {
        console.log('✅ Admin tag added successfully!')
        console.log('User:', {
          id: results[0].id,
          email: results[0].email,
          firstName: results[0].firstName,
          lastName: results[0].lastName,
          tags: results[0].tags,
        })
      } else {
        console.log('ℹ️  Admin tag already exists or user not found')

        // Check if user exists
        const [user] = await queryInterface.sequelize.query(`
          SELECT id, email, tags
          FROM users
          WHERE email = 'vadikmarmeladov@gmail.com';
        `)

        if (user && user.length > 0) {
          console.log('User found with tags:', user[0].tags)
        } else {
          console.log('⚠️  User vadikmarmeladov@gmail.com not found in database')
          console.log('User will get admin tag automatically after first login')
        }
      }
    } catch (error) {
      console.error('❌ Error adding admin tag:', error.message)
      throw error
    }
  },

  async down({ context: queryInterface }) {
    console.log('🔄 Removing Admin tag from vadikmarmeladov@gmail.com...')

    try {
      // Remove 'admin' tag from vadikmarmeladov@gmail.com
      const [results] = await queryInterface.sequelize.query(`
        UPDATE users
        SET tags = array_remove(tags, 'admin')
        WHERE email = 'vadikmarmeladov@gmail.com'
        RETURNING id, email, tags;
      `)

      if (results && results.length > 0) {
        console.log('✅ Admin tag removed')
      } else {
        console.log('ℹ️  User not found or tag not present')
      }
    } catch (error) {
      console.error('❌ Error removing admin tag:', error.message)
      throw error
    }
  }
}
