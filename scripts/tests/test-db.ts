import { Sequelize } from 'sequelize'

async function testDatabase() {
  console.log('Testing database connection...')
  
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'db-postgresql-nyc3-92053-do-user-22640384-0.f.db.ondigitalocean.com',
    port: 25060,
    database: 'defaultdb',
    username: 'doadmin',
    password: 'AVNS_8V6Hqzuxwj0JkMxgNvR',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  })

  try {
    await sequelize.authenticate()
    console.log('Connection has been established successfully.')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
  } finally {
    await sequelize.close()
  }
}

testDatabase()
