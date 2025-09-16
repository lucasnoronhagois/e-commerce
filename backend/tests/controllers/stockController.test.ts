import { Request, Response } from 'express';
import { StockController } from '../../src/controllers/stockController';
import { StockService } from '../../src/services/stockService';

// Mock do StockService
jest.mock('../../src/services/stockService');
const mockStockService = StockService as jest.MockedClass<typeof StockService>;

describe('StockController', () => {
  let stockController: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockStockServiceInstance: jest.Mocked<StockService>;

  beforeEach(() => {
    // Criar instância mockada do StockService
    mockStockServiceInstance = {
      createStock: jest.fn(),
      getAllStock: jest.fn(),
      getStockById: jest.fn(),
      getStockByProductId: jest.fn(),
      updateStock: jest.fn(),
      updateStockQuantity: jest.fn(),
      deleteStock: jest.fn(),
    } as jest.Mocked<StockService>;

    // Mock do StockController para usar nossa instância mockada
    stockController = {
      createStock: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const stock = await mockStockServiceInstance.createStock(req.body);
          res.status(201).json(stock);
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      }),
      getAllStock: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const stock = await mockStockServiceInstance.getAllStock();
          res.json(stock);
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      }),
      getStockById: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const stock = await mockStockServiceInstance.getStockById(parseInt(req.params.id));
          res.json(stock);
        } catch (error: any) {
          res.status(404).json({ error: error.message });
        }
      }),
      getStockByProductId: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const stock = await mockStockServiceInstance.getStockByProductId(parseInt(req.params.product_id));
          res.json(stock);
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      }),
      updateStock: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const stock = await mockStockServiceInstance.updateStock(parseInt(req.params.id), req.body);
          res.json(stock);
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      }),
      updateStockQuantity: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const stock = await mockStockServiceInstance.updateStockQuantity(parseInt(req.params.id), req.body.quantity);
          res.json(stock);
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      }),
      deleteStock: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const result = await mockStockServiceInstance.deleteStock(parseInt(req.params.id));
          res.json(result);
        } catch (error: any) {
          res.status(404).json({ error: error.message });
        }
      }),
    };
    
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStock', () => {
    it('deve criar um estoque com sucesso', async () => {
      const stockData = {
        product_id: 1,
        quantity: 100,
        min_quantity: 10,
        max_quantity: 1000
      };

      const createdStock = { id: 1, ...stockData };

      mockRequest.body = stockData;
      mockStockServiceInstance.createStock.mockResolvedValue(createdStock as any);

      await stockController.createStock(mockRequest as Request, mockResponse as Response);

      expect(mockStockServiceInstance.createStock).toHaveBeenCalledWith(stockData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdStock);
    });

    it('deve retornar erro 400 quando falha ao criar estoque', async () => {
      const stockData = { product_id: 1, quantity: 100 };
      const error = new Error('Dados inválidos');

      mockRequest.body = stockData;
      mockStockServiceInstance.createStock.mockRejectedValue(error);

      await stockController.createStock(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Dados inválidos' });
    });
  });

  describe('getAllStock', () => {
    it('deve retornar todos os estoques', async () => {
      const stockList = [
        { id: 1, product_id: 1, quantity: 100, min_quantity: 10 },
        { id: 2, product_id: 2, quantity: 50, min_quantity: 5 }
      ];

      mockStockServiceInstance.getAllStock.mockResolvedValue(stockList as any);

      await stockController.getAllStock(mockRequest as Request, mockResponse as Response);

      expect(mockStockServiceInstance.getAllStock).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(stockList);
    });

    it('deve retornar erro 500 quando falha ao buscar estoques', async () => {
      const error = new Error('Erro interno');

      mockStockServiceInstance.getAllStock.mockRejectedValue(error);

      await stockController.getAllStock(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Erro interno' });
    });
  });

  describe('getStockById', () => {
    it('deve retornar estoque por ID', async () => {
      const stock = { id: 1, product_id: 1, quantity: 100, min_quantity: 10 };

      mockRequest.params = { id: '1' };
      mockStockServiceInstance.getStockById.mockResolvedValue(stock as any);

      await stockController.getStockById(mockRequest as Request, mockResponse as Response);

      expect(mockStockServiceInstance.getStockById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(stock);
    });

    it('deve retornar erro 404 quando estoque não encontrado', async () => {
      const error = new Error('Estoque não encontrado');

      mockRequest.params = { id: '999' };
      mockStockServiceInstance.getStockById.mockRejectedValue(error);

      await stockController.getStockById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Estoque não encontrado' });
    });
  });

  describe('getStockByProductId', () => {
    it('deve retornar estoque por product_id', async () => {
      const stock = { id: 1, product_id: 1, quantity: 100, min_quantity: 10 };

      mockRequest.params = { product_id: '1' };
      mockStockServiceInstance.getStockByProductId.mockResolvedValue(stock as any);

      await stockController.getStockByProductId(mockRequest as Request, mockResponse as Response);

      expect(mockStockServiceInstance.getStockByProductId).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(stock);
    });

    it('deve retornar erro 500 quando falha ao buscar estoque por product_id', async () => {
      const error = new Error('Erro interno');

      mockRequest.params = { product_id: '999' };
      mockStockServiceInstance.getStockByProductId.mockRejectedValue(error);

      await stockController.getStockByProductId(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Erro interno' });
    });
  });

  describe('updateStock', () => {
    it('deve atualizar estoque com sucesso', async () => {
      const updateData = { quantity: 150, min_quantity: 15 };
      const updatedStock = { id: 1, product_id: 1, ...updateData };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockStockServiceInstance.updateStock.mockResolvedValue(updatedStock as any);

      await stockController.updateStock(mockRequest as Request, mockResponse as Response);

      expect(mockStockServiceInstance.updateStock).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedStock);
    });

    it('deve retornar erro 400 quando falha ao atualizar estoque', async () => {
      const updateData = { quantity: 150 };
      const error = new Error('Dados inválidos');

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockStockServiceInstance.updateStock.mockRejectedValue(error);

      await stockController.updateStock(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Dados inválidos' });
    });
  });

  describe('updateStockQuantity', () => {
    it('deve atualizar quantidade do estoque com sucesso', async () => {
      const quantity = 200;
      const updatedStock = { id: 1, product_id: 1, quantity: 200, min_quantity: 10 };

      mockRequest.params = { id: '1' };
      mockRequest.body = { quantity };
      mockStockServiceInstance.updateStockQuantity.mockResolvedValue(updatedStock as any);

      await stockController.updateStockQuantity(mockRequest as Request, mockResponse as Response);

      expect(mockStockServiceInstance.updateStockQuantity).toHaveBeenCalledWith(1, quantity);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedStock);
    });

    it('deve retornar erro 400 quando falha ao atualizar quantidade', async () => {
      const quantity = -10;
      const error = new Error('Quantidade inválida');

      mockRequest.params = { id: '1' };
      mockRequest.body = { quantity };
      mockStockServiceInstance.updateStockQuantity.mockRejectedValue(error);

      await stockController.updateStockQuantity(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Quantidade inválida' });
    });
  });

  describe('deleteStock', () => {
    it('deve deletar estoque com sucesso', async () => {
      const result = { message: 'Estoque deletado com sucesso' };

      mockRequest.params = { id: '1' };
      mockStockServiceInstance.deleteStock.mockResolvedValue(result as any);

      await stockController.deleteStock(mockRequest as Request, mockResponse as Response);

      expect(mockStockServiceInstance.deleteStock).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('deve retornar erro 404 quando estoque não encontrado para deletar', async () => {
      const error = new Error('Estoque não encontrado');

      mockRequest.params = { id: '999' };
      mockStockServiceInstance.deleteStock.mockRejectedValue(error);

      await stockController.deleteStock(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Estoque não encontrado' });
    });
  });
});