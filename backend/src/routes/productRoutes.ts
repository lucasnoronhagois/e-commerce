import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { validate, validateParams } from '../middlewares/validation';
import { requireAdmin } from '../middlewares/auth';
import { createProductSchema, updateProductSchema, productIdSchema } from '../schemas/productSchema';

const router = Router();
const productController = new ProductController();

// Rotas públicas
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', validateParams(productIdSchema), productController.getProductById);

// Rotas protegidas (autenticação aplicada no configrouter.ts)
router.post('/', requireAdmin, validate(createProductSchema), productController.createProduct);
router.put('/:id', requireAdmin, validateParams(productIdSchema), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', requireAdmin, validateParams(productIdSchema), productController.deleteProduct);

export default router;
