import { ImageService } from '../../src/services/imageService';
import { ProductImage } from '../../src/models';

// Mocks
jest.mock('../../src/models');

const mockProductImage = ProductImage as jest.Mocked<typeof ProductImage>;

describe('ImageService', () => {
  let imageService: ImageService;

  beforeEach(() => {
    imageService = new ImageService();
    jest.clearAllMocks();
  });

  describe('saveProductImages', () => {
    it('deve salvar múltiplas imagens de produto', async () => {
      const productId = 1;
      const files = [
        {
          filename: 'image1.jpg',
          originalname: 'produto-imagem-1.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          url: 'https://cloudinary.com/image1.jpg'
        },
        {
          filename: 'image2.jpg',
          originalname: 'produto-imagem-2.jpg',
          mimetype: 'image/jpeg',
          size: 2048,
          url: 'https://cloudinary.com/image2.jpg'
        }
      ];

      const mockImages = [
        {
          id: 1,
          product_id: productId,
          filename: files[0].filename,
          original_name: files[0].originalname,
          mime_type: files[0].mimetype,
          size: files[0].size,
          url: files[0].url,
          alt_text: 'Produto Imagem 1',
          is_primary: true,
          order: 0
        },
        {
          id: 2,
          product_id: productId,
          filename: files[1].filename,
          original_name: files[1].originalname,
          mime_type: files[1].mimetype,
          size: files[1].size,
          url: files[1].url,
          alt_text: 'Produto Imagem 2',
          is_primary: false,
          order: 1
        }
      ];

      mockProductImage.create
        .mockResolvedValueOnce(mockImages[0] as any)
        .mockResolvedValueOnce(mockImages[1] as any);

      const result = await imageService.saveProductImages(productId, files);

      expect(mockProductImage.create).toHaveBeenCalledTimes(2);
      expect(mockProductImage.create).toHaveBeenNthCalledWith(1, {
        product_id: productId,
        filename: files[0].filename,
        original_name: files[0].originalname,
        mime_type: files[0].mimetype,
        size: files[0].size,
        url: files[0].url,
        alt_text: 'Produto Imagem 1',
        is_primary: true,
        order: 0,
      });
      expect(mockProductImage.create).toHaveBeenNthCalledWith(2, {
        product_id: productId,
        filename: files[1].filename,
        original_name: files[1].originalname,
        mime_type: files[1].mimetype,
        size: files[1].size,
        url: files[1].url,
        alt_text: 'Produto Imagem 2',
        is_primary: false,
        order: 1,
      });
      expect(result).toEqual(mockImages);
    });

    it('deve salvar uma única imagem como primária', async () => {
      const productId = 1;
      const files = [
        {
          filename: 'image1.jpg',
          originalname: 'produto-imagem.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          url: 'https://cloudinary.com/image1.jpg'
        }
      ];

      const mockImage = {
        id: 1,
        product_id: productId,
        filename: files[0].filename,
        is_primary: true,
        order: 0
      };

      mockProductImage.create.mockResolvedValue(mockImage as any);

      const result = await imageService.saveProductImages(productId, files);

      expect(mockProductImage.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockImage]);
    });
  });

  describe('getProductImages', () => {
    it('deve retornar imagens de um produto ordenadas', async () => {
      const productId = 1;
      const mockImages = [
        {
          id: 1,
          product_id: productId,
          filename: 'image1.jpg',
          order: 0,
          is_primary: true
        },
        {
          id: 2,
          product_id: productId,
          filename: 'image2.jpg',
          order: 1,
          is_primary: false
        }
      ];

      mockProductImage.findAll.mockResolvedValue(mockImages as any);

      const result = await imageService.getProductImages(productId);

      expect(mockProductImage.findAll).toHaveBeenCalledWith({
        where: { product_id: productId },
        order: [['order', 'ASC']],
      });
      expect(result).toEqual(mockImages);
    });
  });

  describe('getProductIdByImageId', () => {
    it('deve retornar product_id da imagem', async () => {
      const imageId = 1;
      const mockImage = {
        id: imageId,
        product_id: 5,
        filename: 'image.jpg'
      };

      mockProductImage.findByPk.mockResolvedValue(mockImage as any);

      const result = await imageService.getProductIdByImageId(imageId);

      expect(mockProductImage.findByPk).toHaveBeenCalledWith(imageId);
      expect(result).toBe(5);
    });

    it('deve lançar erro quando imagem não encontrada', async () => {
      const imageId = 999;
      mockProductImage.findByPk.mockResolvedValue(null);

      await expect(imageService.getProductIdByImageId(imageId)).rejects.toThrow('Imagem não encontrada');
    });
  });

  describe('deleteImage', () => {
    it('deve deletar imagem com sucesso', async () => {
      const imageId = 1;
      const mockImage = {
        id: imageId,
        product_id: 1,
        filename: 'image.jpg',
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockProductImage.findByPk.mockResolvedValue(mockImage as any);

      await imageService.deleteImage(imageId);

      expect(mockProductImage.findByPk).toHaveBeenCalledWith(imageId);
      expect(mockImage.destroy).toHaveBeenCalled();
    });

    it('deve lançar erro quando imagem não encontrada para deletar', async () => {
      const imageId = 999;
      mockProductImage.findByPk.mockResolvedValue(null);

      await expect(imageService.deleteImage(imageId)).rejects.toThrow('Imagem não encontrada');
    });
  });

  describe('updateImageOrder', () => {
    it('deve atualizar ordem da imagem', async () => {
      const imageId = 1;
      const newOrder = 2;
      const mockImage = {
        id: imageId,
        product_id: 1,
        order: 0,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockProductImage.findByPk.mockResolvedValue(mockImage as any);

      await imageService.updateImageOrder(imageId, newOrder);

      expect(mockProductImage.findByPk).toHaveBeenCalledWith(imageId);
      expect(mockImage.update).toHaveBeenCalledWith({ order: newOrder });
    });

    it('deve lançar erro quando imagem não encontrada para atualizar ordem', async () => {
      const imageId = 999;
      mockProductImage.findByPk.mockResolvedValue(null);

      await expect(imageService.updateImageOrder(imageId, 1)).rejects.toThrow('Imagem não encontrada');
    });
  });

  describe('setPrimaryImage', () => {
    it('deve definir imagem como primária', async () => {
      const imageId = 1;
      const productId = 5;
      const mockImage = {
        id: imageId,
        product_id: productId,
        is_primary: false,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockProductImage.findByPk.mockResolvedValue(mockImage as any);
      mockProductImage.update.mockResolvedValue([1] as any);

      await imageService.setPrimaryImage(imageId);

      expect(mockProductImage.findByPk).toHaveBeenCalledWith(imageId);
      expect(mockProductImage.update).toHaveBeenCalledWith(
        { is_primary: false },
        { where: { product_id: productId } }
      );
      expect(mockImage.update).toHaveBeenCalledWith({ is_primary: true });
    });

    it('deve lançar erro quando imagem não encontrada para definir como primária', async () => {
      const imageId = 999;
      mockProductImage.findByPk.mockResolvedValue(null);

      await expect(imageService.setPrimaryImage(imageId)).rejects.toThrow('Imagem não encontrada');
    });
  });

  describe('deleteProductImages', () => {
    it('deve deletar todas as imagens de um produto', async () => {
      const productId = 1;
      const mockImages = [
        { id: 1, product_id: productId, filename: 'image1.jpg' },
        { id: 2, product_id: productId, filename: 'image2.jpg' }
      ];

      mockProductImage.findAll.mockResolvedValue(mockImages as any);
      mockProductImage.destroy.mockResolvedValue(1 as any);

      await imageService.deleteProductImages(productId);

      expect(mockProductImage.findAll).toHaveBeenCalledWith({
        where: { product_id: productId },
      });
      expect(mockProductImage.destroy).toHaveBeenCalledWith({
        where: { product_id: productId },
      });
    });

    it('deve funcionar mesmo quando não há imagens', async () => {
      const productId = 1;
      mockProductImage.findAll.mockResolvedValue([]);
      mockProductImage.destroy.mockResolvedValue(1 as any);

      await imageService.deleteProductImages(productId);

      expect(mockProductImage.destroy).toHaveBeenCalledWith({
        where: { product_id: productId },
      });
    });
  });
});
