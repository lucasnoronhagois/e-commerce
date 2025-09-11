import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { validate, validateParams } from '../middlewares/validation';
import { requireAdmin, authenticateToken } from '../middlewares/auth';
import { createProductSchema, updateProductSchema, productIdSchema, productIdParamSchema, imageIdSchema } from '../schemas/productSchema';
import { uploadProductImages, processImage } from '../middlewares/upload';

const router = Router();
const productController = new ProductController();

// Rotas públicas
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', validateParams(productIdSchema), productController.getProductById);

// Rotas protegidas (autenticação aplicada no configrouter.ts)
router.post('/', authenticateToken, requireAdmin, validate(createProductSchema), productController.createProduct);
router.put('/:id', authenticateToken, requireAdmin, validateParams(productIdSchema), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, validateParams(productIdSchema), productController.deleteProduct);

// Rotas para gerenciar imagens
router.post('/:productId/images', authenticateToken, requireAdmin, validateParams(productIdParamSchema), uploadProductImages, processImage, productController.uploadImages);
router.delete('/images/:imageId', authenticateToken, requireAdmin, validateParams(imageIdSchema), productController.deleteImage);
router.put('/images/:imageId/primary', authenticateToken, requireAdmin, validateParams(imageIdSchema), productController.setPrimaryImage);

export default router;
