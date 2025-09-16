import { ProductService } from '../../src/services/productService';
import { Product, Stock } from '../../src/models';
import { Op } from 'sequelize';

// Mocks
jest.mock('../../src/models');

const mockProduct = Product as jest.Mocked<typeof Product>;
const mockStock = Stock as jest.Mocked<typeof Stock>;

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('deve criar um produto com sucesso', async () => {
      const productData = {
        name: 'Produto Teste',
        description: 'Descrição do produto',
        price: 99.99,
        category: 'eletrônicos'
      };

      const mockCreatedProduct = { id: 1, ...productData };
      mockProduct.create.mockResolvedValue(mockCreatedProduct as any);

      const result = await productService.createProduct(productData);

      expect(mockProduct.create).toHaveBeenCalledWith(productData);
      expect(result).toEqual(mockCreatedProduct);
    });

    it('deve criar produto com dados mínimos', async () => {
      const productData = {
        name: 'Produto Simples',
        category: 'categoria'
      };

      const mockCreatedProduct = { id: 1, ...productData };
      mockProduct.create.mockResolvedValue(mockCreatedProduct as any);

      const result = await productService.createProduct(productData);

      expect(mockProduct.create).toHaveBeenCalledWith(productData);
      expect(result).toEqual(mockCreatedProduct);
    });
  });

  describe('getAllProducts', () => {
    it('deve retornar todos os produtos não deletados', async () => {
      const mockProducts = [
        {
          id: 1,
          name: 'Produto 1',
          description: 'Descrição 1',
          price: 99.99,
          category: 'eletrônicos',
          is_deleted: false,
          stocks: []
        },
        {
          id: 2,
          name: 'Produto 2',
          description: 'Descrição 2',
          price: 149.99,
          category: 'roupas',
          is_deleted: false,
          stocks: []
        }
      ];

      mockProduct.findAll.mockResolvedValue(mockProducts as any);

      const result = await productService.getAllProducts();

      expect(mockProduct.findAll).toHaveBeenCalledWith({
        where: { is_deleted: false },
        include: [{
          model: Stock,
          as: 'stocks',
          where: { is_deleted: false },
          required: false
        }]
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getProductById', () => {
    it('deve retornar produto por ID', async () => {
      const mockProductData = {
        id: 1,
        name: 'Produto Teste',
        description: 'Descrição do produto',
        price: 99.99,
        category: 'eletrônicos',
        is_deleted: false,
        stocks: []
      };

      mockProduct.findOne.mockResolvedValue(mockProductData as any);

      const result = await productService.getProductById(1);

      expect(mockProduct.findOne).toHaveBeenCalledWith({
        where: { id: 1, is_deleted: false },
        include: [{
          model: Stock,
          as: 'stocks',
          where: { is_deleted: false },
          required: false
        }]
      });
      expect(result).toEqual(mockProductData);
    });

    it('deve lançar erro quando produto não encontrado', async () => {
      mockProduct.findOne.mockResolvedValue(null);

      await expect(productService.getProductById(999)).rejects.toThrow('Produto não encontrado');
    });
  });

  describe('updateProduct', () => {
    it('deve atualizar produto com sucesso', async () => {
      const updateData = {
        name: 'Produto Atualizado',
        price: 149.99
      };

      const mockProductInstance = {
        id: 1,
        name: 'Produto Original',
        price: 99.99,
        update: jest.fn().mockResolvedValue({ id: 1, ...updateData })
      };

      mockProduct.findOne.mockResolvedValue(mockProductInstance as any);

      const result = await productService.updateProduct(1, updateData);

      expect(mockProduct.findOne).toHaveBeenCalledWith({
        where: { id: 1, is_deleted: false }
      });
      expect(mockProductInstance.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual({ id: 1, ...updateData });
    });

    it('deve lançar erro quando produto não encontrado para atualizar', async () => {
      mockProduct.findOne.mockResolvedValue(null);

      await expect(productService.updateProduct(999, { name: 'Test' })).rejects.toThrow('Produto não encontrado');
    });

    it('deve atualizar apenas campos fornecidos', async () => {
      const updateData = { name: 'Novo Nome' };

      const mockProductInstance = {
        id: 1,
        name: 'Produto Original',
        update: jest.fn().mockResolvedValue({ id: 1, name: 'Novo Nome' })
      };

      mockProduct.findOne.mockResolvedValue(mockProductInstance as any);

      const result = await productService.updateProduct(1, updateData);

      expect(mockProductInstance.update).toHaveBeenCalledWith(updateData);
      expect(result).toEqual({ id: 1, name: 'Novo Nome' });
    });
  });

  describe('deleteProduct', () => {
    it('deve deletar produto com sucesso (soft delete)', async () => {
      const mockProductInstance = {
        id: 1,
        name: 'Produto Teste',
        is_deleted: false,
        update: jest.fn().mockResolvedValue({ id: 1, is_deleted: true })
      };

      mockProduct.findOne.mockResolvedValue(mockProductInstance as any);

      const result = await productService.deleteProduct(1);

      expect(mockProduct.findOne).toHaveBeenCalledWith({
        where: { id: 1, is_deleted: false }
      });
      expect(mockProductInstance.update).toHaveBeenCalledWith({ is_deleted: true });
      expect(result).toEqual({ message: 'Produto deletado com sucesso' });
    });

    it('deve lançar erro quando produto não encontrado para deletar', async () => {
      mockProduct.findOne.mockResolvedValue(null);

      await expect(productService.deleteProduct(999)).rejects.toThrow('Produto não encontrado');
    });
  });

  describe('searchProducts', () => {
    it('deve buscar produtos por nome', async () => {
      const searchTerm = 'teste';
      const mockProducts = [
        {
          id: 1,
          name: 'Produto Teste 1',
          description: 'Descrição 1',
          price: 99.99,
          category: 'eletrônicos',
          is_deleted: false,
          stocks: []
        },
        {
          id: 2,
          name: 'Produto Teste 2',
          description: 'Descrição 2',
          price: 149.99,
          category: 'roupas',
          is_deleted: false,
          stocks: []
        }
      ];

      mockProduct.findAll.mockResolvedValue(mockProducts as any);

      const result = await productService.searchProducts(searchTerm);

      expect(mockProduct.findAll).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockProducts);
    });

    it('deve retornar array vazio quando nenhum produto encontrado', async () => {
      const searchTerm = 'inexistente';
      mockProduct.findAll.mockResolvedValue([]);

      const result = await productService.searchProducts(searchTerm);

      expect(result).toEqual([]);
    });

    it('deve buscar com termo parcial', async () => {
      const searchTerm = 'ele';
      const mockProducts = [
        {
          id: 1,
          name: 'Eletrônicos',
          category: 'eletrônicos',
          is_deleted: false,
          stocks: []
        }
      ];

      mockProduct.findAll.mockResolvedValue(mockProducts as any);

      const result = await productService.searchProducts(searchTerm);

      expect(mockProduct.findAll).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockProducts);
    });
  });
});
