import { Product, Stock } from '../models';
import { Op } from 'sequelize';

export class ProductService {
  async createProduct(data: { name: string; description?: string; price?: number; category: string }) {
    return await Product.create(data);
  }

  async getAllProducts() {
    return await Product.findAll({
      where: { is_deleted: false },
      include: [{
        model: Stock,
        as: 'stocks',
        where: { is_deleted: false },
        required: false
      }]
    });
  }

  async getProductById(id: number) {
    const product = await Product.findOne({
      where: { id, is_deleted: false },
      include: [{
        model: Stock,
        as: 'stocks',
        where: { is_deleted: false },
        required: false
      }]
    });
    
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    
    return product;
  }

  async updateProduct(id: number, data: { name?: string; description?: string; price?: number; category?: string }) {
    const product = await Product.findOne({
      where: { id, is_deleted: false }
    });
    
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    
    return await product.update(data);
  }

  async deleteProduct(id: number) {
    const product = await Product.findOne({
      where: { id, is_deleted: false }
    });
    
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    
    await product.update({ is_deleted: true });
    return { message: 'Produto deletado com sucesso' };
  }

  async searchProducts(searchTerm: string) {
    return await Product.findAll({
      where: {
        name: {
          [Op.like]: `%${searchTerm}%`
        },
        is_deleted: false
      },
      include: [{
        model: Stock,
        as: 'stocks',
        where: { is_deleted: false },
        required: false
      }]
    });
  }
}
