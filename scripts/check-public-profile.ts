import { sequelize } from '../src/server/utils/db.js'
import { models } from '../src/server/models/index.js'

async function checkPublicProfile() {
  try {
    console.log('🔍 Checking public profile configuration...\n')

    // Get all users
    const users = await models.User.findAll()

    console.log(`Found ${users.length} user(s):\n`)

    for (const user of users) {
      console.log('-----------------------------------')
      console.log(`User ID: ${user.id}`)
      console.log(`Email: ${user.email}`)
      console.log(`Name: ${user.firstName} ${user.lastName}`)
      console.log(`City: ${user.city}`)

      const privacy = user.metadata?.privacy || {}
      console.log('\nPrivacy Settings:')
      console.log(`  - Public Profile Enabled: ${privacy.isPublicProfile ? '✅ YES' : '❌ NO'}`)
      console.log(`  - Custom URL: ${privacy.customUrl || '(none)'}`)
      console.log(`  - Show Weather: ${privacy.showWeather !== false ? '✅' : '❌'}`)
      console.log(`  - Show Local Time: ${privacy.showLocalTime !== false ? '✅' : '❌'}`)
      console.log(`  - Show City: ${privacy.showCity !== false ? '✅' : '❌'}`)
      console.log(`  - Show Sound: ${privacy.showSound !== false ? '✅' : '❌'}`)
      console.log(`  - Show Memory Story: ${privacy.showMemoryStory !== false ? '✅' : '❌'}`)

      console.log('\nPublic Profile URLs:')
      console.log(`  By ID: /u/${user.id}`)
      if (privacy.customUrl) {
        console.log(`  By Custom URL: /u/${privacy.customUrl}`)
      }
      console.log('\nAPI Endpoint URLs:')
      console.log(`  By ID: /api/public/profile/${user.id}`)
      if (privacy.customUrl) {
        console.log(`  By Custom URL: /api/public/profile/${privacy.customUrl}`)
      }
      console.log('')
    }

    console.log('-----------------------------------\n')

    if (users.length === 0) {
      console.log('⚠️  No users found in database')
    } else {
      const publicProfiles = users.filter(u => u.metadata?.privacy?.isPublicProfile)
      console.log(`📊 Summary: ${publicProfiles.length} of ${users.length} users have public profiles enabled`)
    }

    await sequelize.close()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkPublicProfile()
