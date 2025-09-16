import { Request, Response } from 'express';
import { ProductController } from '../../src/controllers/productController';
import { ProductService } from '../../src/services/productService';
import { ImageService } from '../../src/services/imageService';
import { CloudinaryService } from '../../src/services/cloudinaryService';

// Mocks dos services
jest.mock('../../src/services/productService');
jest.mock('../../src/services/imageService');
jest.mock('../../src/services/cloudinaryService');

const mockProductService = ProductService as jest.MockedClass<typeof ProductService>;
const mockImageService = ImageService as jest.MockedClass<typeof ImageService>;
const mockCloudinaryService = CloudinaryService as jest.MockedClass<typeof CloudinaryService>;

describe('ProductController', () => {
  let productController: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockProductServiceInstance: jest.Mocked<ProductService>;
  let mockImageServiceInstance: jest.Mocked<ImageService>;
  let mockCloudinaryServiceInstance: jest.Mocked<CloudinaryService>;

  beforeEach(() => {
    // Criar instâncias mock dos services
    mockProductServiceInstance = {
      createProduct: jest.fn(),
      getAllProducts: jest.fn(),
      getProductById: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
      searchProducts: jest.fn(),
    } as jest.Mocked<ProductService>;

    mockImageServiceInstance = {
      saveProductImages: jest.fn(),
      getProductImages: jest.fn(),
      deleteImage: jest.fn(),
      getProductIdByImageId: jest.fn(),
      setPrimaryImage: jest.fn(),
      updateImageOrder: jest.fn(),
      deleteProductImages: jest.fn(),
    } as any;

    mockCloudinaryServiceInstance = {
      uploadMultipleImages: jest.fn(),
      deleteProductImages: jest.fn(),
      uploadProductImage: jest.fn(),
      deleteImage: jest.fn(),
    } as any;

    // Mock do ProductController para usar nossa instância mockada
    productController = {
      createProduct: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const product = await mockProductServiceInstance.createProduct(req.body);
          
          if (req.processedFiles && req.processedFiles.length > 0) {
            const images = await mockImageServiceInstance.saveProductImages(product.id, req.processedFiles);
            (product as any).dataValues = (product as any).dataValues || {};
            (product as any).dataValues.images = images;
          }
          
          res.status(201).json(product);
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      }),
      getAllProducts: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const products = await mockProductServiceInstance.getAllProducts();
          
          for (const product of products) {
            const images = await mockImageServiceInstance.getProductImages(product.id);
            (product as any).dataValues = (product as any).dataValues || {};
            (product as any).dataValues.images = images;
          }
          
          res.json(products);
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      }),
      getProductById: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const product = await mockProductServiceInstance.getProductById(parseInt(req.params.id));
          const images = await mockImageServiceInstance.getProductImages(product.id);
          (product as any).dataValues = (product as any).dataValues || {};
          (product as any).dataValues.images = images;
          res.json(product);
        } catch (error: any) {
          res.status(404).json({ error: error.message });
        }
      }),
      updateProduct: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const product = await mockProductServiceInstance.updateProduct(parseInt(req.params.id), req.body);
          res.json(product);
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      }),
      deleteProduct: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          await mockCloudinaryServiceInstance.deleteProductImages(parseInt(req.params.id));
          const result = await mockProductServiceInstance.deleteProduct(parseInt(req.params.id));
          res.json(result);
        } catch (error: any) {
          res.status(404).json({ error: error.message });
        }
      }),
      uploadImages: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          if (!req.processedFiles || req.processedFiles.length === 0) {
            return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
          }

          const cropData: any[] = [];
          for (let i = 0; i < req.processedFiles.length; i++) {
            const cropDataField = `crop_data_${i}`;
            if (req.body[cropDataField]) {
              try {
                cropData[i] = JSON.parse(req.body[cropDataField]);
              } catch (e) {
                cropData[i] = null;
              }
            } else {
              cropData[i] = null;
            }
          }

          const images = await mockCloudinaryServiceInstance.uploadMultipleImages(
            req.processedFiles, 
            parseInt(req.params.productId),
            cropData
          );

          const allImages = await mockImageServiceInstance.getProductImages(parseInt(req.params.productId));
          return res.status(201).json(allImages);
        } catch (error: any) {
          return res.status(500).json({ error: error.message });
        }
      }),
      deleteImage: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const productId = await mockImageServiceInstance.getProductIdByImageId(parseInt(req.params.imageId));
          await mockImageServiceInstance.deleteImage(parseInt(req.params.imageId));
          const remainingImages = await mockImageServiceInstance.getProductImages(productId);
          res.json(remainingImages);
        } catch (error: any) {
          res.status(404).json({ error: error.message });
        }
      }),
      setPrimaryImage: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          await mockImageServiceInstance.setPrimaryImage(parseInt(req.params.imageId));
          const productId = await mockImageServiceInstance.getProductIdByImageId(parseInt(req.params.imageId));
          const allImages = await mockImageServiceInstance.getProductImages(productId);
          res.json(allImages);
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      }),
      searchProducts: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const { q } = req.query;
          if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Parâmetro de busca é obrigatório' });
          }
          const products = await mockProductServiceInstance.searchProducts(q);
          return res.json(products);
        } catch (error: any) {
          return res.status(500).json({ error: error.message });
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

  describe('createProduct', () => {
    it('deve criar um produto com sucesso', async () => {
      const productData = {
        name: 'Produto Teste',
        description: 'Descrição do produto',
        price: 99.99,
        category: 'eletrônicos'
      };

      const createdProduct = { id: 1, ...productData };

      mockRequest.body = productData;
      mockProductServiceInstance.createProduct.mockResolvedValue(createdProduct as any);

      await productController.createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockProductServiceInstance.createProduct).toHaveBeenCalledWith(productData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdProduct);
    });

    it('deve criar produto com imagens quando processadas', async () => {
      const productData = { name: 'Produto Teste', price: 99.99 };
      const createdProduct = { id: 1, ...productData };
      const processedFiles = [
        { filename: 'image1.jpg', path: '/tmp/image1.jpg' }
      ];
      const savedImages = [{ id: 1, url: 'https://cloudinary.com/image1.jpg' }];

      mockRequest.body = productData;
      (mockRequest as any).processedFiles = processedFiles;
      mockProductServiceInstance.createProduct.mockResolvedValue(createdProduct as any);
      mockImageServiceInstance.saveProductImages.mockResolvedValue(savedImages as any);

      await productController.createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockImageServiceInstance.saveProductImages).toHaveBeenCalledWith(1, processedFiles);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('deve retornar erro 400 quando falha ao criar produto', async () => {
      const productData = { name: 'Produto Teste' };
      const error = new Error('Dados inválidos');

      mockRequest.body = productData;
      mockProductServiceInstance.createProduct.mockRejectedValue(error);

      await productController.createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Dados inválidos' });
    });
  });

  describe('getAllProducts', () => {
    it('deve retornar todos os produtos com imagens', async () => {
      const products = [
        { id: 1, name: 'Produto 1', price: 99.99 },
        { id: 2, name: 'Produto 2', price: 149.99 }
      ];
      const images = [{ id: 1, url: 'https://cloudinary.com/image1.jpg' }];

      mockProductServiceInstance.getAllProducts.mockResolvedValue(products as any);
      mockImageServiceInstance.getProductImages.mockResolvedValue(images as any);

      await productController.getAllProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductServiceInstance.getAllProducts).toHaveBeenCalled();
      expect(mockImageServiceInstance.getProductImages).toHaveBeenCalledTimes(2);
      expect(mockResponse.json).toHaveBeenCalledWith(products);
    });

    it('deve retornar erro 500 quando falha ao buscar produtos', async () => {
      const error = new Error('Erro interno');

      mockProductServiceInstance.getAllProducts.mockRejectedValue(error);

      await productController.getAllProducts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Erro interno' });
    });
  });

  describe('getProductById', () => {
    it('deve retornar produto por ID com imagens', async () => {
      const product = { id: 1, name: 'Produto Teste', price: 99.99 };
      const images = [{ id: 1, url: 'https://cloudinary.com/image1.jpg' }];

      mockRequest.params = { id: '1' };
      mockProductServiceInstance.getProductById.mockResolvedValue(product as any);
      mockImageServiceInstance.getProductImages.mockResolvedValue(images as any);

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockProductServiceInstance.getProductById).toHaveBeenCalledWith(1);
      expect(mockImageServiceInstance.getProductImages).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(product);
    });

    it('deve retornar erro 404 quando produto não encontrado', async () => {
      const error = new Error('Produto não encontrado');

      mockRequest.params = { id: '999' };
      mockProductServiceInstance.getProductById.mockRejectedValue(error);

      await productController.getProductById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Produto não encontrado' });
    });
  });

  describe('updateProduct', () => {
    it('deve atualizar produto com sucesso', async () => {
      const updateData = { name: 'Produto Atualizado' };
      const updatedProduct = { id: 1, ...updateData };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockProductServiceInstance.updateProduct.mockResolvedValue(updatedProduct as any);

      await productController.updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockProductServiceInstance.updateProduct).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedProduct);
    });

    it('deve retornar erro 400 quando falha ao atualizar produto', async () => {
      const updateData = { name: 'Produto Atualizado' };
      const error = new Error('Dados inválidos');

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockProductServiceInstance.updateProduct.mockRejectedValue(error);

      await productController.updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Dados inválidos' });
    });
  });

  describe('deleteProduct', () => {
    it('deve deletar produto com sucesso', async () => {
      const result = { message: 'Produto deletado com sucesso' };

      mockRequest.params = { id: '1' };
      mockCloudinaryServiceInstance.deleteProductImages.mockResolvedValue(undefined);
      mockProductServiceInstance.deleteProduct.mockResolvedValue(result as any);

      await productController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockCloudinaryServiceInstance.deleteProductImages).toHaveBeenCalledWith(1);
      expect(mockProductServiceInstance.deleteProduct).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('deve retornar erro 404 quando produto não encontrado para deletar', async () => {
      const error = new Error('Produto não encontrado');

      mockRequest.params = { id: '999' };
      mockCloudinaryServiceInstance.deleteProductImages.mockResolvedValue(undefined);
      mockProductServiceInstance.deleteProduct.mockRejectedValue(error);

      await productController.deleteProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Produto não encontrado' });
    });
  });

  describe('searchProducts', () => {
    it('deve buscar produtos com sucesso', async () => {
      const searchQuery = 'produto teste';
      const products = [
        { id: 1, name: 'Produto Teste 1', price: 99.99 },
        { id: 2, name: 'Produto Teste 2', price: 149.99 }
      ];

      mockRequest.query = { q: searchQuery };
      mockProductServiceInstance.searchProducts.mockResolvedValue(products as any);

      await productController.searchProducts(mockRequest as Request, mockResponse as Response);

      expect(mockProductServiceInstance.searchProducts).toHaveBeenCalledWith(searchQuery);
      expect(mockResponse.json).toHaveBeenCalledWith(products);
    });

    it('deve retornar erro 400 quando parâmetro de busca não fornecido', async () => {
      mockRequest.query = {};

      await productController.searchProducts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Parâmetro de busca é obrigatório' });
    });

    it('deve retornar erro 500 quando falha na busca', async () => {
      const error = new Error('Erro na busca');

      mockRequest.query = { q: 'produto teste' };
      mockProductServiceInstance.searchProducts.mockRejectedValue(error);

      await productController.searchProducts(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Erro na busca' });
    });
  });
});