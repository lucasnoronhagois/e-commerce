'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Alterar o campo url para suportar URLs maiores (Cloudinary)
    await queryInterface.changeColumn('product_images', 'url', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverter para VARCHAR(500)
    await queryInterface.changeColumn('product_images', 'url', {
      type: Sequelize.STRING(500),
      allowNull: false,
    });
  }
};
