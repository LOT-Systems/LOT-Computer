// @ts-check
const { Sequelize, DataTypes } = require('sequelize')

/**
 * LOT® Email — the simplest internal mail between LOT Community members.
 *
 * Reuses the `direct_messages` table (model existed, table was never
 * migrated) and adds two columns:
 *   kind   — 'dm' (Sync thread) | 'email' (LOT® Email, composed in Log)
 *   readAt — null until the receiver opens Sync
 *
 * Idempotent: safe on databases where the table already exists.
 */
module.exports = {
  async up({ context: queryInterface }) {
    const tables = await queryInterface.showAllTables()
    const exists = tables.map((t) => (typeof t === 'string' ? t : t.tableName)).includes('direct_messages')

    if (!exists) {
      await queryInterface.createTable('direct_messages', {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
        senderId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        receiverId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        message: { type: DataTypes.TEXT, allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      })
    }

    const columns = await queryInterface.describeTable('direct_messages')
    if (!columns.kind) {
      await queryInterface.addColumn('direct_messages', 'kind', {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'dm',
      })
    }
    if (!columns.readAt) {
      await queryInterface.addColumn('direct_messages', 'readAt', {
        type: DataTypes.DATE,
        allowNull: true,
      })
    }

    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS direct_messages_receiver_kind_created ON direct_messages ("receiverId", "kind", "createdAt")'
    )
    await queryInterface.sequelize.query(
      'CREATE INDEX IF NOT EXISTS direct_messages_sender_kind_created ON direct_messages ("senderId", "kind", "createdAt")'
    )
  },

  async down({ context: queryInterface }) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS direct_messages_receiver_kind_created')
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS direct_messages_sender_kind_created')
    const columns = await queryInterface.describeTable('direct_messages')
    if (columns.readAt) await queryInterface.removeColumn('direct_messages', 'readAt')
    if (columns.kind) await queryInterface.removeColumn('direct_messages', 'kind')
  },
}
