import { DataTypes, Model } from 'sequelize';
import { sequelize } from '#server/utils/db';
export class Answer extends Model {
}
Answer.init({
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
    question: {
        type: DataTypes.STRING(1024),
        allowNull: false,
    },
    options: {
        type: DataTypes.ARRAY(DataTypes.STRING(1024)),
        defaultValue: [],
    },
    answer: {
        type: DataTypes.STRING(1024),
        allowNull: false,
    },
    metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
}, {
    sequelize,
    modelName: 'answer',
    tableName: 'answers',
    timestamps: true,
});
