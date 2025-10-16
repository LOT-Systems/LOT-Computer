import { DataTypes, Model } from 'sequelize';
import { sequelize } from '#server/utils/db';
export class ChatMessageLike extends Model {
}
ChatMessageLike.init({
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
    messageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'chat_messages',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    createdAt: DataTypes.DATE,
}, {
    sequelize,
    modelName: 'chat_message_like',
    tableName: 'chat_messages_likes',
    timestamps: true,
    updatedAt: false,
});
