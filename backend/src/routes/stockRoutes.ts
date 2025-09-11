import { Router } from 'express';
import { StockController } from '../controllers/stockController';
import { validate, validateParams } from '../middlewares/validation';
import { requireAdmin } from '../middlewares/auth';
import { createStockSchema, updateStockSchema, stockIdSchema, productIdParamSchema } from '../schemas/stockSchema';

const router = Router();
const stockController = new StockController();

// Rotas públicas
router.get('/', stockController.getAllStock);
router.get('/product/:product_id', validateParams(productIdParamSchema), stockController.getStockByProductId);
router.get('/:id', validateParams(stockIdSchema), stockController.getStockById);

// Rotas protegidas (autenticação aplicada no configrouter.ts)
router.post('/', requireAdmin, validate(createStockSchema), stockController.createStock);
router.put('/:id', requireAdmin, validateParams(stockIdSchema), validate(updateStockSchema), stockController.updateStock);
router.put('/:id/quantity', requireAdmin, validateParams(stockIdSchema), stockController.updateStockQuantity);
router.delete('/:id', requireAdmin, validateParams(stockIdSchema), stockController.deleteStock);

export default router;
