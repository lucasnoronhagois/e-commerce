import { ProductImage } from '../models';

export class ImageService {
  async saveProductImages(productId: number, files: any[]): Promise<ProductImage[]> {
    const images = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const image = await ProductImage.create({
        product_id: productId,
        filename: file.filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        url: file.url,
        alt_text: this.generateAltText(file.originalname),
        is_primary: i === 0, // Primeira imagem é a principal
        order: i,
      });
      
      images.push(image);
    }
    
    return images;
  }

  async getProductImages(productId: number): Promise<ProductImage[]> {
    return await ProductImage.findAll({
      where: { product_id: productId },
      order: [['order', 'ASC']],
    });
  }

  async getProductIdByImageId(imageId: number): Promise<number> {
    const image = await ProductImage.findByPk(imageId);
    if (!image) {
      throw new Error('Imagem não encontrada');
    }
    return image.product_id;
  }

  async deleteImage(imageId: number): Promise<void> {
    const image = await ProductImage.findByPk(imageId);
    if (!image) {
      throw new Error('Imagem não encontrada');
    }

    // Nota: Com Cloudinary, não precisamos deletar arquivos físicos locais
    // O Cloudinary gerencia os arquivos automaticamente

    // Deletar do banco
    await image.destroy();
  }

  async updateImageOrder(imageId: number, order: number): Promise<void> {
    const image = await ProductImage.findByPk(imageId);
    if (!image) {
      throw new Error('Imagem não encontrada');
    }

    await image.update({ order });
  }

  async setPrimaryImage(imageId: number): Promise<void> {
    const image = await ProductImage.findByPk(imageId);
    if (!image) {
      throw new Error('Imagem não encontrada');
    }

    // Remover primary de todas as outras imagens do produto
    await ProductImage.update(
      { is_primary: false },
      { where: { product_id: image.product_id } }
    );

    // Definir esta como primary
    await image.update({ is_primary: true });
  }

  private generateAltText(filename: string): string {
    // Gerar texto alternativo baseado no nome do arquivo
    return filename
      .replace(/[-_]/g, ' ')
      .replace(/\.[^/.]+$/, '')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  async deleteProductImages(productId: number): Promise<void> {
    const images = await ProductImage.findAll({
      where: { product_id: productId },
    });

    // Nota: Com Cloudinary, não precisamos deletar arquivos físicos locais
    // O Cloudinary gerencia os arquivos automaticamente

    await ProductImage.destroy({
      where: { product_id: productId },
    });
  }
}
