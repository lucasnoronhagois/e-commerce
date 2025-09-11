import { Router } from 'express';
import productRoutes from './productRoutes';
import stockRoutes from './stockRoutes';
import userRoutes from './userRoutes';
import customerRoutes from './customerRoutes';

const router = Router();

router.use('/products', productRoutes);
router.use('/stock', stockRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);

export default router;
