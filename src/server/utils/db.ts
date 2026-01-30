import { Sequelize } from 'sequelize'
import config from '#server/config'

// Add debug logging to see what's being imported
console.log('Imported config:', config)

if (!config || !config.db) {
  throw new Error(`Database configuration is missing! Config received: ${JSON.stringify(config, null, 2)}`)
}

console.log('Initializing database connection with:', {
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  username: config.db.username
})

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  username: config.db.username,
  password: config.db.password,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: config.env === 'development' ? console.log : false,
  protocol: 'postgres'
})

async function initializeDatabase() {
  try {
    await sequelize.authenticate()
    console.log('Database connection established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  }
}

initializeDatabase()

export { sequelize }
