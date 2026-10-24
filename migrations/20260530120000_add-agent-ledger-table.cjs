// @ts-check
const { Sequelize, DataTypes } = require('sequelize')

/**
 * Agent Decision Ledger — append-only table.
 * Every agent action: INPUT → CLASSIFY → ACTION → RECORD.
 * Nothing overwrites, nothing deletes.
 */
module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('agent_ledger', {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      source: {
        type: DataTypes.STRING(128),
        allowNull: false,
      },
      input: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      classification: {
        type: DataTypes.STRING(32),
        allowNull: false,
      },
      action: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      gate: {
        type: DataTypes.STRING(16),
        allowNull: false,
        defaultValue: 'auto',
      },
      result: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      duration_ms: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    })

    await queryInterface.addIndex('agent_ledger', ['timestamp'], {
      name: 'idx_agent_ledger_timestamp',
    })

    await queryInterface.addIndex('agent_ledger', ['source'], {
      name: 'idx_agent_ledger_source',
    })

    await queryInterface.addIndex('agent_ledger', ['classification'], {
      name: 'idx_agent_ledger_classification',
    })

    await queryInterface.addIndex('agent_ledger', ['gate'], {
      name: 'idx_agent_ledger_gate',
    })

    await queryInterface.addIndex('agent_ledger', ['userId'], {
      name: 'idx_agent_ledger_user_id',
    })
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('agent_ledger')
  },
}
