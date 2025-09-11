'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna category na tabela products
    await queryInterface.addColumn('products', 'category', {
      type: Sequelize.ENUM('rings', 'necklaces', 'bags_purse', 'high_heeled_shoes'),
      allowNull: false,
      defaultValue: 'rings' // Valor padrão para produtos existentes
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover coluna category
    await queryInterface.removeColumn('products', 'category');
  }
};
