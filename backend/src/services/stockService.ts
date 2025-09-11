import { Stock, Product } from '../models';

export class StockService {
  async createStock(data: { product_id: number; quantity: number }) {
    // Verificar se o produto existe
    const product = await Product.findByPk(data.product_id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return await Stock.create(data);
  }

  async getAllStock() {
    return await Stock.findAll({
      where: { is_deleted: false },
      include: [{
        model: Product,
        as: 'product',
        where: { is_deleted: false },
        required: true
      }]
    });
  }

  async getStockById(id: number) {
    const stock = await Stock.findOne({
      where: { id, is_deleted: false },
      include: [{
        model: Product,
        as: 'product',
        where: { is_deleted: false },
        required: true
      }]
    });
    
    if (!stock) {
      throw new Error('Estoque não encontrado');
    }
    
    return stock;
  }

  async getStockByProductId(product_id: number) {
    return await Stock.findAll({
      where: { product_id, is_deleted: false },
      include: [{
        model: Product,
        as: 'product',
        where: { is_deleted: false },
        required: true
      }]
    });
  }

  async updateStock(id: number, data: { quantity?: number }) {
    const stock = await Stock.findOne({
      where: { id, is_deleted: false }
    });
    
    if (!stock) {
      throw new Error('Estoque não encontrado');
    }
    
    return await stock.update(data);
  }

  async deleteStock(id: number) {
    const stock = await Stock.findOne({
      where: { id, is_deleted: false }
    });
    
    if (!stock) {
      throw new Error('Estoque não encontrado');
    }
    
    await stock.update({ is_deleted: true });
    return { message: 'Estoque deletado com sucesso' };
  }

  async updateStockQuantity(id: number, quantity: number) {
    const stock = await Stock.findOne({
      where: { id, is_deleted: false }
    });
    
    if (!stock) {
      throw new Error('Estoque não encontrado');
    }
    
    if (quantity < 0) {
      throw new Error('Quantidade não pode ser negativa');
    }
    
    return await stock.update({ quantity });
  }
}
