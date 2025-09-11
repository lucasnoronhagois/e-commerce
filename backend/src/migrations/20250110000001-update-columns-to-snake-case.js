'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna is_deleted em todas as tabelas
    await queryInterface.addColumn('products', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('stock', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('users', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('customers', 'is_deleted', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // Renomear coluna productId para product_id na tabela stock
    await queryInterface.renameColumn('stock', 'productId', 'product_id');

    // Renomear coluna zipCode para zip_code na tabela customers
    await queryInterface.renameColumn('customers', 'zipCode', 'zip_code');
  },

  async down(queryInterface, Sequelize) {
    // Reverter renomeação das colunas
    await queryInterface.renameColumn('stock', 'product_id', 'productId');
    await queryInterface.renameColumn('customers', 'zip_code', 'zipCode');

    // Remover coluna is_deleted de todas as tabelas
    await queryInterface.removeColumn('products', 'is_deleted');
    await queryInterface.removeColumn('stock', 'is_deleted');
    await queryInterface.removeColumn('users', 'is_deleted');
    await queryInterface.removeColumn('customers', 'is_deleted');
  }
};
