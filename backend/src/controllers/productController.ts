import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { ImageService } from '../services/imageService';
import { CloudinaryService } from '../services/cloudinaryService';

const productService = new ProductService();
const imageService = new ImageService();
const cloudinaryService = new CloudinaryService();

export class ProductController {
  async createProduct(req: Request, res: Response) {
    try {
      const product = await productService.createProduct(req.body);
      
      // Se houver imagens, processar upload
      if ((req as any).processedFiles && (req as any).processedFiles.length > 0) {
        const images = await imageService.saveProductImages(product.id, (req as any).processedFiles);
        (product as any).dataValues.images = images;
      }
      
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts();
      
      // Carregar imagens para cada produto
      for (const product of products) {
        const images = await imageService.getProductImages(product.id);
        (product as any).dataValues.images = images;
      }
      
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(parseInt(id));
      
      // Carregar imagens do produto
      const images = await imageService.getProductImages(product.id);
      (product as any).dataValues.images = images;
      
      res.json(product);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(parseInt(id), req.body);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Deletar imagens associadas ao produto do Cloudinary
      await cloudinaryService.deleteProductImages(parseInt(id));
      
      const result = await productService.deleteProduct(parseInt(id));
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  // Métodos para gerenciar imagens
  async uploadImages(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      
      // Upload de imagens
      
      if (!(req as any).processedFiles || (req as any).processedFiles.length === 0) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
      }

      // Extrair dados do crop do body
      const cropData: any[] = [];
      for (let i = 0; i < (req as any).processedFiles.length; i++) {
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

      // Upload para Cloudinary
      const images = await cloudinaryService.uploadMultipleImages(
        (req as any).processedFiles, 
        parseInt(productId),
        cropData
      );

      // Retornar TODAS as imagens do produto (existentes + novas)
      const allImages = await imageService.getProductImages(parseInt(productId));
      return res.status(201).json(allImages);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteImage(req: Request, res: Response) {
    try {
      const { imageId } = req.params;
      
      // Buscar o productId ANTES de deletar a imagem
      const productId = await imageService.getProductIdByImageId(parseInt(imageId));
      
      // Deletar a imagem
      await imageService.deleteImage(parseInt(imageId));
      
      // Retornar todas as imagens restantes do produto
      const remainingImages = await imageService.getProductImages(productId);
      res.json(remainingImages);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async setPrimaryImage(req: Request, res: Response) {
    try {
      const { imageId } = req.params;
      await imageService.setPrimaryImage(parseInt(imageId));
      
      // Retornar todas as imagens do produto atualizadas
      const productId = await imageService.getProductIdByImageId(parseInt(imageId));
      const allImages = await imageService.getProductImages(productId);
      res.json(allImages);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchProducts(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Parâmetro de busca é obrigatório' });
      }
      const products = await productService.searchProducts(q);
      return res.json(products);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
