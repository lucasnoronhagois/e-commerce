'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar campos description e price na tabela products
    await queryInterface.addColumn('products', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('products', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    // Criar tabela product_images
    await queryInterface.createTable('product_images', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      alt_text: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Adicionar índices para performance
    await queryInterface.addIndex('product_images', ['product_id']);
    await queryInterface.addIndex('product_images', ['is_primary']);
    await queryInterface.addIndex('product_images', ['order']);
  },

  async down(queryInterface, Sequelize) {
    // Remover tabela product_images
    await queryInterface.dropTable('product_images');
    
    // Remover colunas da tabela products
    await queryInterface.removeColumn('products', 'description');
    await queryInterface.removeColumn('products', 'price');
  }
};
