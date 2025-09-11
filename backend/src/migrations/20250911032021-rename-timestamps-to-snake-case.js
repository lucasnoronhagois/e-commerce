'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Verificar e renomear colunas de timestamp para snake_case em todas as tabelas
    
    const tables = ['users', 'products', 'stock', 'customers'];
    
    for (const table of tables) {
      try {
        // Verificar se a coluna createdAt existe antes de renomear
        const tableDescription = await queryInterface.describeTable(table);
        
        if (tableDescription.createdAt && !tableDescription.created_at) {
          await queryInterface.renameColumn(table, 'createdAt', 'created_at');
        }
        
        if (tableDescription.updatedAt && !tableDescription.updated_at) {
          await queryInterface.renameColumn(table, 'updatedAt', 'updated_at');
        }
      } catch (error) {
        console.log(`Tabela ${table} não existe ou já foi processada:`, error.message);
      }
    }
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
