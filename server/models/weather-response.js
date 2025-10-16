import { DataTypes, Model } from 'sequelize';
import { sequelize } from '#server/utils/db';
export class WeatherResponse extends Model {
    useRecordView() {
        const data = (this.weather ?? {});
        return { ...data, createdAt: this.createdAt };
    }
}
WeatherResponse.init({
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
}, {
    sequelize,
    modelName: 'weather_response',
    tableName: 'weather_responses',
    timestamps: true,
    updatedAt: false,
});
