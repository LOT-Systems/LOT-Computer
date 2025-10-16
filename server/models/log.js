import { DataTypes, Model } from 'sequelize';
import { sequelize } from '#server/utils/db';
export class Log extends Model {
}
Log.init({
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
}, {
    sequelize,
    modelName: 'log',
    tableName: 'logs',
    timestamps: true,
});
