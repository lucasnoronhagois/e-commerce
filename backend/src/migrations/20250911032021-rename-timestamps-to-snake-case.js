'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Renomear colunas de timestamp para snake_case em todas as tabelas
    
    // Tabela users
    await queryInterface.renameColumn('users', 'createdAt', 'created_at');
    await queryInterface.renameColumn('users', 'updatedAt', 'updated_at');
    
    // Tabela products
    await queryInterface.renameColumn('products', 'createdAt', 'created_at');
    await queryInterface.renameColumn('products', 'updatedAt', 'updated_at');
    
    // Tabela stock
    await queryInterface.renameColumn('stock', 'createdAt', 'created_at');
    await queryInterface.renameColumn('stock', 'updatedAt', 'updated_at');
    
    // Tabela customers
    await queryInterface.renameColumn('customers', 'createdAt', 'created_at');
    await queryInterface.renameColumn('customers', 'updatedAt', 'updated_at');
  },

  async down (queryInterface, Sequelize) {
    // Reverter as alterações - renomear de volta para camelCase
    
    // Tabela users
    await queryInterface.renameColumn('users', 'created_at', 'createdAt');
    await queryInterface.renameColumn('users', 'updated_at', 'updatedAt');
    
    // Tabela products
    await queryInterface.renameColumn('products', 'created_at', 'createdAt');
    await queryInterface.renameColumn('products', 'updated_at', 'updatedAt');
    
    // Tabela stock
    await queryInterface.renameColumn('stock', 'created_at', 'createdAt');
    await queryInterface.renameColumn('stock', 'updated_at', 'updatedAt');
    
    // Tabela customers
    await queryInterface.renameColumn('customers', 'created_at', 'createdAt');
    await queryInterface.renameColumn('customers', 'updated_at', 'updatedAt');
  }
};
