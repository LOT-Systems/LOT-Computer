/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import { Sequelize } from 'sequelize'

// Create direct connection without any URL parsing
const sequelize = new Sequelize('defaultdb', 'doadmin', 'AVNS_8V6Hqzuxwj0JkMxgNvR', {
  dialect: 'postgres',
  host: 'db-postgresql-nyc3-92053-do-user-22640384-0.f.db.ondigitalocean.com',
  port: 25060,
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
  }
})

// Test connection
async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Run test but don't wait for it
testConnection()

export { sequelize }
