/*
    node -r esbuild-runner/register scripts/migrations.ts [ARGUMENTS]
    [ARGUMENTS]
      -new <MIGRATION_NAME>       generate new empty migration file
      -up                         upgrade the database state for all modules
      -down [<STEPS>]             downgrade the database state for all modules
*/

import fs from 'fs'
import path from 'path'
import { Sequelize } from 'sequelize'
import { Umzug, SequelizeStorage } from 'umzug'
import dotenv from 'dotenv'

const MIGRATIONS_PATH = path.join(__dirname, '../migrations')

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
  console.log(`✅ Generated migration:\n\t${filePath}`)
  process.exit(0)
}


// Execute `up` or `down` migration
if (['-up', '-down'].includes(command)) {
  dotenv.config()
  const databaseUri = process.env.DATABASE_URL
  if (!databaseUri) {
    throw new Error('Missed "DATABASE_URL" env variable')
  }
  const sequelize = new Sequelize(databaseUri, {
    logging: false,
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: { rejectUnauthorized: false }
    } : undefined,
  })

  console.log('\x1b[36m%s\x1b[0m', `\nExecuting migrations...`)
    ; (async () => {
      try {
        const umzug = new Umzug({
          migrations: { glob: MIGRATIONS_PATH + '/*.js' },
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
        console.error(`Error while executing migrations:\n`, err)
      }

      sequelize.close()
      process.exit(0)
    })()
}


// Utils
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
