import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

async function testConnection(): Promise<void> {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set')
  }

  // Remove sslmode from URL if present
  const cleanUrl = dbUrl.replace('?sslmode=require', '')
  const maskedUrl = cleanUrl.replace(/:([^:@]+)@/, ':****@')
  console.log('Testing connection to:', maskedUrl)

  const sequelize = new Sequelize(cleanUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      timestamps: true
    },
    pool: {
      max: 20,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 1000
    },
    retry: {
      max: 3,
      timeout: 30000
    }
  })

  try {
    console.log('Attempting database connection...')
    await sequelize.authenticate()
    console.log('Database connection successful')
    
    // Test query
    try {
      await sequelize.query('SELECT NOW()')
      console.log('Test query successful')
    } catch (queryError) {
      console.error('Test query failed:', (queryError as Error).message)
    }
  } catch (error) {
    console.error('Database connection failed:', (error as Error).message)
    if ((error as any).original) {
      console.error('Original error:', (error as any).original.message)
    }
    throw error
  } finally {
    await sequelize.close()
  }
}

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error)
  process.exit(1)
})

testConnection()
  .then(() => {
    console.log('Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Test failed with error:', error)
    process.exit(1)
  })
