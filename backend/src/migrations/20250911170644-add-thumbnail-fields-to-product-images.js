'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('product_images', 'thumbnail_url', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'URL do thumbnail recortado para exibição no card'
    });

    await queryInterface.addColumn('product_images', 'crop_data', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Dados do crop (x, y, width, height) para regenerar o thumbnail'
    });

    await queryInterface.addColumn('product_images', 'original_url', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'URL da imagem original completa'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('product_images', 'thumbnail_url');
    await queryInterface.removeColumn('product_images', 'crop_data');
    await queryInterface.removeColumn('product_images', 'original_url');
  }
};
