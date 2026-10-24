/**
 * LOT SYSTEMS CORPORATION
 * Vadim Marmeladov — CEO, Owner LOT®
 * Kuzya Cosmo Marmeladov — CEO, Owner COSMO®
 * LOT® Founded 7 April 2016 | COSMO® Founded 1 July 2024
 * Made in the USA | brand.lot-systems.com
 */

import fs from 'fs'
import path from 'path'
import { Sequelize } from 'sequelize'
import config from '#server/config'

if (!config || !config.db) {
  throw new Error('Database configuration is missing!')
}

console.log('Initializing database connection to:', config.db.host)

// Load DigitalOcean CA certificate if available
const caCertPaths = [
  path.join(process.cwd(), 'certs', 'ca-certificate.crt'),
  '/etc/ssl/certs/digitalocean-db-ca.crt',
  process.env.DB_CA_CERT_PATH,
].filter(Boolean) as string[]

let caCert: string | undefined
for (const certPath of caCertPaths) {
  try {
    if (fs.existsSync(certPath)) {
      caCert = fs.readFileSync(certPath, 'utf-8')
      console.log('Loaded DB CA certificate from:', certPath)
      break
    }
  } catch {
    // Continue to next path
  }
}

const sslEnabled = process.env.DB_SSL !== 'false'

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  username: config.db.username,
  password: config.db.password,
  dialectOptions: {
    ...(sslEnabled && {
      ssl: {
        require: true,
        rejectUnauthorized: !!caCert,
        ...(caCert && { ca: caCert }),
      },
    }),
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000,
  },
  pool: {
    max: 10,
    min: 1,
    acquire: 15000,
    idle: 10000,
    evict: 1000,
  },
  // Never log SQL queries containing user data in production
  logging: config.env === 'development' ? console.log : false,
  protocol: 'postgres',
})

async function initializeDatabase() {
  try {
    await sequelize.authenticate()
    console.log('Database connection established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', (error as Error).message)
  }
}

initializeDatabase()

export { sequelize }
