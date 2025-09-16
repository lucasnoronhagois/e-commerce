import { StockService } from '../../src/services/stockService';
import { Stock, Product } from '../../src/models';

// Mocks
jest.mock('../../src/models');

const mockStock = Stock as jest.Mocked<typeof Stock>;
const mockProduct = Product as jest.Mocked<typeof Product>;

describe('StockService', () => {
  let stockService: StockService;

  beforeEach(() => {
    stockService = new StockService();
    jest.clearAllMocks();
  });

  describe('createStock', () => {
    it('deve criar um estoque com sucesso', async () => {
      const stockData = {
        product_id: 1,
        quantity: 100
      };

      const mockProductInstance = { id: 1, name: 'Produto Teste' };
      const mockCreatedStock = { id: 1, ...stockData };

      mockProduct.findByPk.mockResolvedValue(mockProductInstance as any);
      mockStock.create.mockResolvedValue(mockCreatedStock as any);

      const result = await stockService.createStock(stockData);

      expect(mockProduct.findByPk).toHaveBeenCalledWith(stockData.product_id);
      expect(mockStock.create).toHaveBeenCalledWith(stockData);
      expect(result).toEqual(mockCreatedStock);
    });

    it('deve lançar erro quando produto não encontrado', async () => {
      const stockData = {
        product_id: 999,
        quantity: 100
      };

      mockProduct.findByPk.mockResolvedValue(null);

      await expect(stockService.createStock(stockData)).rejects.toThrow('Produto não encontrado');
    });
  });

  describe('getAllStock', () => {
    it('deve retornar todos os estoques não deletados', async () => {
      const mockStocks = [
        {
          id: 1,
          product_id: 1,
          quantity: 100,
          is_deleted: false,
          product: {
            id: 1,
            name: 'Produto 1',
            is_deleted: false
          }
        },
        {
          id: 2,
          product_id: 2,
          quantity: 50,
          is_deleted: false,
          product: {
            id: 2,
            name: 'Produto 2',
            is_deleted: false
          }
        }
      ];

      mockStock.findAll.mockResolvedValue(mockStocks as any);

      const result = await stockService.getAllStock();

      expect(mockStock.findAll).toHaveBeenCalledWith({
        where: { is_deleted: false },
        include: [{
          model: Product,
          as: 'product',
          where: { is_deleted: false },
          required: true
        }]
      });
      expect(result).toEqual(mockStocks);
    });
  });

  describe('getStockById', () => {
    it('deve retornar estoque por ID', async () => {
      const mockStockData = {
        id: 1,
        product_id: 1,
        quantity: 100,
        is_deleted: false,
        product: {
          id: 1,
          name: 'Produto Teste',
          is_deleted: false
        }
      };

      mockStock.findOne.mockResolvedValue(mockStockData as any);

      const result = await stockService.getStockById(1);

      expect(mockStock.findOne).toHaveBeenCalledWith({
        where: { id: 1, is_deleted: false },
        include: [{
          model: Product,
          as: 'product',
          where: { is_deleted: false },
          required: true
        }]
      });
      expect(result).toEqual(mockStockData);
    });

    it('deve lançar erro quando estoque não encontrado', async () => {
      mockStock.findOne.mockResolvedValue(null);

      await expect(stockService.getStockById(999)).rejects.toThrow('Estoque não encontrado');
    });
  });

  describe('getStockByProductId', () => {
    it('deve retornar estoques por product_id', async () => {
      const mockStocks = [
        {
          id: 1,
          product_id: 1,
          quantity: 100,
          is_deleted: false,
          product: {
            id: 1,
            name: 'Produto Teste',
            is_deleted: false
          }
        }
      ];

      mockStock.findAll.mockResolvedValue(mockStocks as any);

      const result = await stockService.getStockByProductId(1);

      expect(mockStock.findAll).toHaveBeenCalledWith({
        where: { product_id: 1, is_deleted: false },
        include: [{
          model: Product,
          as: 'product',
          where: { is_deleted: false },
          required: true
        }]
      });
      expect(result).toEqual(mockStocks);
    });

    it('deve retornar array vazio quando nenhum estoque encontrado', async () => {
      mockStock.findAll.mockResolvedValue([]);

      const result = await stockService.getStockByProductId(999);

      expect(result).toEqual([]);
    });
  });

  describe('updateStock', () => {
    it('deve atualizar estoque com sucesso', async () => {
      const updateData = {
        quantity: 150
      };

      const mockStockInstance = {
        id: 1,
        product_id: 1,
        quantity: 100,
        update: jest.fn().mockResolvedValue({ id: 1, product_id: 1, quantity: 150 })
      };

      mockStock.findOne.mockResolvedValue(mockStockInstance as any);

      const result = await stockService.updateStock(1, updateData);

      expect(mockStock.findOne).toHaveBeenCalledWith({
        where: { id: 1, is_deleted: false }
      });
      expect(mockStockInstance.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual({ id: 1, product_id: 1, quantity: 150 });
    });

    it('deve lançar erro quando estoque não encontrado para atualizar', async () => {
      mockStock.findOne.mockResolvedValue(null);

      await expect(stockService.updateStock(999, { quantity: 100 })).rejects.toThrow('Estoque não encontrado');
    });
  });

  describe('deleteStock', () => {
    it('deve deletar estoque com sucesso (soft delete)', async () => {
      const mockStockInstance = {
        id: 1,
        product_id: 1,
        quantity: 100,
        is_deleted: false,
        update: jest.fn().mockResolvedValue({ id: 1, is_deleted: true })
      };

      mockStock.findOne.mockResolvedValue(mockStockInstance as any);

      const result = await stockService.deleteStock(1);

      expect(mockStock.findOne).toHaveBeenCalledWith({
        where: { id: 1, is_deleted: false }
      });
      expect(mockStockInstance.update).toHaveBeenCalledWith({ is_deleted: true });
      expect(result).toEqual({ message: 'Estoque deletado com sucesso' });
    });

    it('deve lançar erro quando estoque não encontrado para deletar', async () => {
      mockStock.findOne.mockResolvedValue(null);

      await expect(stockService.deleteStock(999)).rejects.toThrow('Estoque não encontrado');
    });
  });

  describe('updateStockQuantity', () => {
    it('deve atualizar quantidade do estoque com sucesso', async () => {
      const newQuantity = 200;
      const mockStockInstance = {
        id: 1,
        product_id: 1,
        quantity: 100,
        update: jest.fn().mockResolvedValue({ id: 1, product_id: 1, quantity: newQuantity })
      };

      mockStock.findOne.mockResolvedValue(mockStockInstance as any);

      const result = await stockService.updateStockQuantity(1, newQuantity);

      expect(mockStock.findOne).toHaveBeenCalledWith({
        where: { id: 1, is_deleted: false }
      });
      expect(mockStockInstance.update).toHaveBeenCalledWith({ quantity: newQuantity });
      expect(result).toEqual({ id: 1, product_id: 1, quantity: newQuantity });
    });

    it('deve lançar erro quando estoque não encontrado', async () => {
      mockStock.findOne.mockResolvedValue(null);

      await expect(stockService.updateStockQuantity(999, 100)).rejects.toThrow('Estoque não encontrado');
    });

    it('deve lançar erro quando quantidade é negativa', async () => {
      const mockStockInstance = {
        id: 1,
        product_id: 1,
        quantity: 100
      };

      mockStock.findOne.mockResolvedValue(mockStockInstance as any);

      await expect(stockService.updateStockQuantity(1, -10)).rejects.toThrow('Quantidade não pode ser negativa');
    });

    it('deve permitir quantidade zero', async () => {
      const newQuantity = 0;
      const mockStockInstance = {
        id: 1,
        product_id: 1,
        quantity: 100,
        update: jest.fn().mockResolvedValue({ id: 1, product_id: 1, quantity: newQuantity })
      };

      mockStock.findOne.mockResolvedValue(mockStockInstance as any);

      const result = await stockService.updateStockQuantity(1, newQuantity);

      expect(mockStockInstance.update).toHaveBeenCalledWith({ quantity: newQuantity });
      expect(result).toEqual({ id: 1, product_id: 1, quantity: newQuantity });
    });
  });
});
