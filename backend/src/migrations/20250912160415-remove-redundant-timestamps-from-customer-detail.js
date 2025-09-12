'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remover colunas redundantes de timestamps da tabela customer_detail
    // As datas já existem na tabela users através da relação
    await queryInterface.removeColumn('customer_detail', 'created_at');
    await queryInterface.removeColumn('customer_detail', 'updated_at');
  },

  async down (queryInterface, Sequelize) {
    // Reverter: adicionar as colunas de volta
    await queryInterface.addColumn('customer_detail', 'created_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });
    
    await queryInterface.addColumn('customer_detail', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    });
  }
};
