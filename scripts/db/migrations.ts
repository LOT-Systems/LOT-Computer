import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Sequelize } from 'sequelize'
import { Umzug, SequelizeStorage } from 'umzug'
import dotenv from 'dotenv'
import pg from 'pg'

// Load environment variables
dotenv.config()

// Disable SSL certificate validation for self-signed certificates
// This is needed for some managed database services
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// ES module compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MIGRATIONS_PATH = path.join(__dirname, '../../migrations')

// Debug: Print available environment variables
console.log('Environment variables available:', Object.keys(process.env));
console.log('NODE_ENV:', process.env.NODE_ENV);

// Get and validate DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
console.log('Database URL exists:', !!databaseUrl);

if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL environment variable');
}

// Initialize Sequelize with explicit configuration
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const [command, ...args] = process.argv.slice(2)

// Generate migration file
if (command === '-new') {
  const name = args[0]
  if (!name) {
    throw new Error('Invalid input format. Should be "node migrations.js -new <MIGRATION_NAME>"')
  }
  const timeToken = getTimeToken(new Date())
  const fileName = getMigrationFileName(timeToken, name)
  const filePath = path.join(MIGRATIONS_PATH, fileName)
  generateMigration(filePath)
  console.log(`Generated migration:\n\t${filePath}`)
  process.exit(0)
}

// Execute `up` or `down` migration
if (['-up', '-down'].includes(command)) {
  console.log('\x1b[36m%s\x1b[0m', `\nExecuting migrations...`)
  ;(async () => {
    try {
      // Test database connection
      await sequelize.authenticate()
      console.log('Database connection established successfully')

      const umzug = new Umzug({
        migrations: { glob: MIGRATIONS_PATH + '/*.cjs' },
        context: sequelize.getQueryInterface(),
        storage: new SequelizeStorage({ sequelize }),
        logger: console,
      })

      if (command === '-up') {
        await umzug.up()
      } else {
        const stepsArg = parseInt(args[0] || '0', 10)
        if (stepsArg) {
          await umzug.down({ step: stepsArg })
        } else {
          await umzug.down({ to: 0 })
        }
      }
    } catch (err) {
      console.error(`Error while executing migrations:`, err)
      process.exit(1)
    }

    await sequelize.close()
    process.exit(0)
  })()
}

// Utils remain the same
function generateMigration(filePath) {
  const content = `
// @ts-check
const { Sequelize, DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    // await queryInterface.sequelize.transaction(async (transaction) => {})
    // await queryInterface.createTable('table_name', { id: { type: DataTypes.INTEGER, primaryKey: true } })
    // await queryInterface.addColumn('table_name', 'column_name', { type: DataTypes.STRING })
    // await queryInterface.changeColumn('table_name', 'column_name', { type: DataTypes.STRING })
  },
  async down({ context: queryInterface }) {
    // await queryInterface.sequelize.transaction(async (transaction) => {})
    // await queryInterface.dropTable('table_name')
    // await queryInterface.removeColumn('table_name', 'column_name')
  }
}\n`.trim()
  fs.writeFileSync(filePath, content)
}

function getTimeToken(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
    String(date.getSeconds()).padStart(2, '0'),
  ].join('')
}

function getMigrationFileName(timeToken, name) {
  return `${timeToken}_${name}.js`
}