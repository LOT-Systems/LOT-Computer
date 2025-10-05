import { Sequelize } from 'sequelize'
import config from '#server/config'

export const sequelize = new Sequelize(config.databaseUri, {
  logging: false,
  dialectOptions:
    config.env === 'production'
      ? {
          ssl: { require: true, rejectUnauthorized: false },
        }
      : undefined,
})
