import { CloudinaryService } from '../../src/services/cloudinaryService';
import { ProductImage } from '../../src/models';

// Mocks
jest.mock('../../src/models');
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn()
    }
  }
}));

const mockProductImage = ProductImage as jest.Mocked<typeof ProductImage>;

// Mock do cloudinary
const mockCloudinary = require('cloudinary').v2;

describe('CloudinaryService', () => {
  let cloudinaryService: CloudinaryService;

  beforeEach(() => {
    cloudinaryService = new CloudinaryService();
    jest.clearAllMocks();
  });

  describe('uploadProductImage', () => {
    it('deve fazer upload de imagem com sucesso', async () => {
      const fileBuffer = Buffer.from('fake-image-data');
      const productId = 1;
      const filename = 'test-image.jpg';

      const mockUploadResult = {
        public_id: 'products/1/test-image',
        secure_url: 'https://cloudinary.com/products/1/test-image.jpg',
        width: 800,
        height: 600,
        format: 'jpg',
        bytes: 1024
      };

      mockCloudinary.uploader.upload.mockResolvedValue(mockUploadResult);

      const result = await cloudinaryService.uploadProductImage(fileBuffer, productId, filename);

      expect(mockCloudinary.uploader.upload).toHaveBeenCalledWith(
        expect.stringContaining('data:image/jpeg;base64,'),
        {
          public_id: 'test-image',
          folder: `products/${productId}`,
          transformation: [
            {
              width: 800,
              height: 600,
              crop: 'limit',
              quality: 'auto',
              fetch_format: 'auto'
            }
          ],
          resource_type: 'image'
        }
      );

      expect(result).toEqual({
        public_id: mockUploadResult.public_id,
        secure_url: mockUploadResult.secure_url,
        width: mockUploadResult.width,
        height: mockUploadResult.height,
        format: mockUploadResult.format,
        bytes: mockUploadResult.bytes
      });
    });

    it('deve lançar erro quando buffer está vazio', async () => {
      const emptyBuffer = Buffer.alloc(0);
      const productId = 1;
      const filename = 'test.jpg';

      await expect(
        cloudinaryService.uploadProductImage(emptyBuffer, productId, filename)
      ).rejects.toThrow('Buffer de arquivo está vazio');
    });

    it('deve lançar erro quando buffer é null', async () => {
      const productId = 1;
      const filename = 'test.jpg';

      await expect(
        cloudinaryService.uploadProductImage(null as any, productId, filename)
      ).rejects.toThrow('Buffer de arquivo está vazio');
    });

    it('deve determinar tipo MIME correto para diferentes extensões', async () => {
      const fileBuffer = Buffer.from('fake-image-data');
      const productId = 1;

      const testCases = [
        { filename: 'test.png', expectedMimeType: 'image/png' },
        { filename: 'test.jpg', expectedMimeType: 'image/jpeg' },
        { filename: 'test.jpeg', expectedMimeType: 'image/jpeg' },
        { filename: 'test.webp', expectedMimeType: 'image/webp' },
        { filename: 'test.gif', expectedMimeType: 'image/gif' },
        { filename: 'test.unknown', expectedMimeType: 'image/jpeg' }
      ];

      for (const testCase of testCases) {
        jest.clearAllMocks();
        
        const mockResult = {
          public_id: 'test',
          secure_url: 'https://cloudinary.com/test.jpg',
          width: 800,
          height: 600,
          format: 'jpg',
          bytes: 1024
        };

        mockCloudinary.uploader.upload.mockResolvedValue(mockResult);

        await cloudinaryService.uploadProductImage(fileBuffer, productId, testCase.filename);

        expect(mockCloudinary.uploader.upload).toHaveBeenCalledWith(
          expect.stringContaining(`data:${testCase.expectedMimeType};base64,`),
          expect.any(Object)
        );
      }
    });

    it('deve lançar erro quando upload falha', async () => {
      const fileBuffer = Buffer.from('fake-image-data');
      const productId = 1;
      const filename = 'test.jpg';

      const uploadError = new Error('Upload failed');
      mockCloudinary.uploader.upload.mockRejectedValue(uploadError);

      await expect(
        cloudinaryService.uploadProductImage(fileBuffer, productId, filename)
      ).rejects.toThrow('Erro ao fazer upload para Cloudinary');
    });
  });

  describe('uploadMultipleImages', () => {
    it('deve fazer upload de múltiplas imagens', async () => {
      const files = [
        {
          buffer: Buffer.from('image1-data'),
          filename: 'image1.jpg',
          originalname: 'produto-imagem-1.jpg'
        },
        {
          buffer: Buffer.from('image2-data'),
          filename: 'image2.jpg',
          originalname: 'produto-imagem-2.jpg'
        }
      ];

      const productId = 1;
      const cropData = [
        { x: 0, y: 0, width: 400, height: 300, originalWidth: 800, originalHeight: 600 },
        null
      ];

      const mockUploadResults = [
        {
          public_id: 'products/1/image1',
          secure_url: 'https://cloudinary.com/products/1/image1.jpg',
          width: 800,
          height: 600,
          format: 'jpg',
          bytes: 1024
        },
        {
          public_id: 'products/1/image2',
          secure_url: 'https://cloudinary.com/products/1/image2.jpg',
          width: 800,
          height: 600,
          format: 'jpg',
          bytes: 2048
        }
      ];

      const mockCreatedImages = [
        { id: 1, product_id: productId, filename: 'image1', url: 'thumbnail1.jpg' },
        { id: 2, product_id: productId, filename: 'image2', url: 'thumbnail2.jpg' }
      ];

      mockCloudinary.uploader.upload
        .mockResolvedValueOnce(mockUploadResults[0])
        .mockResolvedValueOnce(mockUploadResults[1]);

      mockProductImage.create
        .mockResolvedValueOnce(mockCreatedImages[0] as any)
        .mockResolvedValueOnce(mockCreatedImages[1] as any);

      const result = await cloudinaryService.uploadMultipleImages(files, productId, cropData);

      expect(mockCloudinary.uploader.upload).toHaveBeenCalledTimes(2);
      expect(mockProductImage.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockCreatedImages);
    });

    it('deve funcionar sem dados de crop', async () => {
      const files = [
        {
          buffer: Buffer.from('image1-data'),
          filename: 'image1.jpg',
          originalname: 'produto-imagem-1.jpg'
        }
      ];

      const productId = 1;

      const mockUploadResult = {
        public_id: 'products/1/image1',
        secure_url: 'https://cloudinary.com/products/1/image1.jpg',
        width: 800,
        height: 600,
        format: 'jpg',
        bytes: 1024
      };

      const mockCreatedImage = {
        id: 1,
        product_id: productId,
        filename: 'image1',
        url: 'https://cloudinary.com/products/1/image1.jpg'
      };

      mockCloudinary.uploader.upload.mockResolvedValue(mockUploadResult);
      mockProductImage.create.mockResolvedValue(mockCreatedImage as any);

      const result = await cloudinaryService.uploadMultipleImages(files, productId);

      expect(mockProductImage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: productId,
          filename: 'image1',
          original_name: 'produto-imagem-1.jpg',
          mime_type: 'image/jpg',
          size: 1024,
          crop_data: null,
          is_primary: false,
          order: 0
        })
      );
      expect(result).toEqual([mockCreatedImage]);
    });
  });

  describe('deleteImage', () => {
    it('deve deletar imagem com sucesso', async () => {
      const publicId = 'products/1/test-image';

      mockCloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

      await cloudinaryService.deleteImage(publicId);

      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith(publicId);
    });

    it('deve lançar erro quando delete falha', async () => {
      const publicId = 'products/1/test-image';
      const deleteError = new Error('Delete failed');

      mockCloudinary.uploader.destroy.mockRejectedValue(deleteError);

      await expect(
        cloudinaryService.deleteImage(publicId)
      ).rejects.toThrow('Erro ao deletar imagem do Cloudinary');
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
      mockCloudinary.uploader.destroy
        .mockResolvedValueOnce({ result: 'ok' })
        .mockResolvedValueOnce({ result: 'ok' });
      mockProductImage.destroy.mockResolvedValue(1 as any);

      await cloudinaryService.deleteProductImages(productId);

      expect(mockProductImage.findAll).toHaveBeenCalledWith({
        where: { product_id: productId }
      });
      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith('products/1/image1.jpg');
      expect(mockCloudinary.uploader.destroy).toHaveBeenCalledWith('products/1/image2.jpg');
      expect(mockProductImage.destroy).toHaveBeenCalledWith({
        where: { product_id: productId }
      });
    });

    it('deve funcionar mesmo quando não há imagens', async () => {
      const productId = 1;

      mockProductImage.findAll.mockResolvedValue([]);
      mockProductImage.destroy.mockResolvedValue(1 as any);

      await cloudinaryService.deleteProductImages(productId);

      expect(mockProductImage.destroy).toHaveBeenCalledWith({
        where: { product_id: productId }
      });
    });

    it('deve lançar erro quando delete falha', async () => {
      const productId = 1;
      const mockImages = [{ id: 1, product_id: productId, filename: 'image1.jpg' }];

      mockProductImage.findAll.mockResolvedValue(mockImages as any);
      mockCloudinary.uploader.destroy.mockRejectedValue(new Error('Delete failed'));

      await expect(
        cloudinaryService.deleteProductImages(productId)
      ).rejects.toThrow('Erro ao deletar imagens do produto');
    });
  });
});
