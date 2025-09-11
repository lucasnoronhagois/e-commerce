'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Adicionar coluna role na tabela users se não existir
    const tableDescription = await queryInterface.describeTable('users');
    if (!tableDescription.role) {
      await queryInterface.addColumn('users', 'role', {
        type: Sequelize.ENUM('admin', 'customer'),
        allowNull: false,
        defaultValue: 'customer'
      });
    }

    // 2. Criar tabela customer_detail
    await queryInterface.createTable('customer_detail', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      zip_code: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      document: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      neighborhood: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      state: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      address_number: {
        type: Sequelize.STRING(10),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer_detail');
    await queryInterface.removeColumn('users', 'role');
  }
};
