import { DataTypes, Model, CreationOptional } from 'sequelize'
import { sequelize } from '#server/utils/db'
import {
  Weather,
  WeatherRecord,
  WeatherResponse as WeatherResponseModel,
} from '#shared/types'
import * as fp from '#shared/utils/fp'

type WeatherResponseCreateFields = Pick<
  WeatherResponseModel,
  'city' | 'country' | 'weather'
>

export class WeatherResponse
  extends Model<WeatherResponseModel, WeatherResponseCreateFields>
  implements WeatherResponseModel
{
  declare id: WeatherResponseModel['id']
  declare city: WeatherResponseModel['city']
  declare country: WeatherResponseModel['country']
  declare weather: WeatherResponseModel['weather']
  declare createdAt: WeatherResponseModel['createdAt']

  useRecordView(): WeatherRecord {
    const data = (this.weather ?? {}) as Weather
    return { ...data, createdAt: this.createdAt }
  }
}

WeatherResponse.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weather: DataTypes.JSONB,
    createdAt: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'weather_response',
    tableName: 'weather_responses',
    timestamps: true,
    updatedAt: false,
  }
)
