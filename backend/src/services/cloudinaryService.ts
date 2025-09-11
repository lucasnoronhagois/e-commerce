import { v2 as cloudinary } from 'cloudinary';
import { ProductImage } from '../models';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export class CloudinaryService {
  async uploadProductImage(filePath: string, productId: number): Promise<any> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
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
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      };
    } catch (error) {
      throw new Error(`Erro ao fazer upload para Cloudinary: ${error}`);
    }
  }

  async uploadMultipleImages(files: any[], productId: number, cropData: any[] = []): Promise<any[]> {
    const uploadPromises = files.map(async (file, index) => {
      const result = await this.uploadProductImage(file.path, productId);
      
      // Gerar thumbnail se houver dados de crop
      let thumbnailUrl = result.secure_url;
      if (cropData[index]) {
        const crop = cropData[index];
        // Ajustar coordenadas para as dimensões reais da imagem no Cloudinary
        const adjustedCrop = this.adjustCropCoordinates(crop, result.width, result.height);
        
        // Usar transformação simples do Cloudinary
        thumbnailUrl = this.generateSimpleThumbnailUrl(result.secure_url, adjustedCrop);
      }
      
      // Salvar no banco de dados
      const image = await ProductImage.create({
        product_id: productId,
        filename: result.public_id.split('/').pop() || '',
        original_name: file.originalname,
        mime_type: `image/${result.format}`,
        size: result.bytes,
        url: thumbnailUrl, // URL do thumbnail para exibição no card
        original_url: result.secure_url, // URL da imagem original completa
        thumbnail_url: thumbnailUrl,
        crop_data: cropData[index] || null,
        alt_text: this.generateAltText(file.originalname),
        is_primary: false,
        order: 0
      });

      return image;
    });

    return await Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(`Erro ao deletar imagem do Cloudinary: ${error}`);
    }
  }

  async deleteProductImages(productId: number): Promise<void> {
    try {
      // Buscar todas as imagens do produto
      const images = await ProductImage.findAll({
        where: { product_id: productId }
      });

      // Deletar do Cloudinary
      const deletePromises = images.map(async (image) => {
        const publicId = `products/${productId}/${image.filename}`;
        await this.deleteImage(publicId);
      });

      await Promise.all(deletePromises);

      // Deletar do banco
      await ProductImage.destroy({
        where: { product_id: productId }
      });
    } catch (error) {
      throw new Error(`Erro ao deletar imagens do produto: ${error}`);
    }
  }

  private adjustCropCoordinates(crop: any, cloudinaryWidth: number, cloudinaryHeight: number): any {
    // As coordenadas foram calculadas para 1280x960, mas a imagem no Cloudinary é 800x600
    // Precisamos ajustar as coordenadas proporcionalmente
    
    const originalWidth = 1280;  // Dimensões assumidas do frontend
    const originalHeight = 960;
    
    const scaleX = cloudinaryWidth / originalWidth;
    const scaleY = cloudinaryHeight / originalHeight;
    
    const adjustedCrop = {
      x: Math.round(crop.x * scaleX),
      y: Math.round(crop.y * scaleY),
      width: Math.round(crop.width * scaleX),
      height: Math.round(crop.height * scaleY)
    };
    
    return adjustedCrop;
  }

  private generateSimpleThumbnailUrl(originalUrl: string, crop: any): string {
    // Usar transformação simples do Cloudinary
    const transformations = [
      `c_crop,w_${crop.width},h_${crop.height},x_${crop.x},y_${crop.y}`,
      'f_auto,q_auto'
    ].join(',');
    
    // Inserir transformações na URL
    const baseUrl = originalUrl.replace('/upload/', `/upload/${transformations}/`);
    
    return baseUrl;
  }

  private generateAltText(filename: string): string {
    return filename
      .replace(/[-_]/g, ' ')
      .replace(/\.[^/.]+$/, '')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
}
