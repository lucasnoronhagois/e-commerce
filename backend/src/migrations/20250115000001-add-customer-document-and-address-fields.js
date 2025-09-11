'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adicionar colunas na tabela customers
    await queryInterface.addColumn('customers', 'document', {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'CPF ou CNPJ do cliente'
    });

    await queryInterface.addColumn('customers', 'neighborhood', {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'Bairro do cliente'
    });

    await queryInterface.addColumn('customers', 'city', {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'Cidade do cliente'
    });

    await queryInterface.addColumn('customers', 'state', {
      type: Sequelize.STRING(2),
      allowNull: false,
      comment: 'Estado do cliente (sigla)'
    });

    await queryInterface.addColumn('customers', 'address_number', {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: 'Número do endereço'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remover as colunas adicionadas
    await queryInterface.removeColumn('customers', 'document');
    await queryInterface.removeColumn('customers', 'neighborhood');
    await queryInterface.removeColumn('customers', 'city');
    await queryInterface.removeColumn('customers', 'state');
    await queryInterface.removeColumn('customers', 'address_number');
  }
};
