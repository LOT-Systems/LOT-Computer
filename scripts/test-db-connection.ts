import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Validate database URL format
function validateDatabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    console.log('URL parts validation:')
    console.log('- Protocol:', parsed.protocol === 'postgresql:' ? '✅' : '❌')
    console.log('- Host exists:', !!parsed.hostname ? '✅' : '❌')
    console.log('- Port exists:', !!parsed.port ? '✅' : '❌')
    console.log('- Username exists:', !!parsed.username ? '✅' : '❌')
    console.log('- Password exists:', !!parsed.password ? '✅' : '❌')
    console.log('- Database exists:', !!parsed.pathname.slice(1) ? '✅' : '❌')
    return true
  } catch (error) {
    console.error('Invalid database URL format')
    return false
  }
}

async function testConnection(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set')
  }

  // Validate URL format
  if (!validateDatabaseUrl(dbUrl)) {
    throw new Error('Invalid database URL format')
  }

  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':****@')
  console.log('Testing connection to:', maskedUrl)

  const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  })

  try {
    await sequelize.authenticate()
    console.log('✅ Database connection successful')
  } catch (error) {
    console.error('❌ Database connection failed:', (error as Error).message)
    throw error
  } finally {
    await sequelize.close()
  }
}

// Run the test
testConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
