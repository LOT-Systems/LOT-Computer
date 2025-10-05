import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import { Log as LogModel } from '#shared/types'

type LogCreateFields = Pick<LogModel, 'userId' | 'event'> & Partial<LogModel>

export class Log extends Model<LogModel, LogCreateFields> implements LogModel {
  declare id: LogModel['id']
  declare userId: LogModel['userId']
  declare text: LogModel['text']
  declare event: LogModel['event']
  declare metadata: LogModel['metadata']
  declare context: LogModel['context']
  declare createdAt: CreationOptional<LogModel['createdAt']>
  declare updatedAt: CreationOptional<LogModel['updatedAt']>
}

Log.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    text: DataTypes.TEXT,
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    context: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    event: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'log',
    tableName: 'logs',
    timestamps: true,
  }
)
