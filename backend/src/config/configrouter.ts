import { Application } from 'express';
import { authenticateToken } from '../middlewares/auth';
import productRoutes from '../routes/productRoutes';
import stockRoutes from '../routes/stockRoutes';
import userRoutes from '../routes/userRoutes';
import customerRoutes from '../routes/customerRoutes';

export default function setupRoutes(app: Application): void {
  // rotas públicas (não protegidas)
  app.use('/api/products', productRoutes);
  app.use('/api/stock', stockRoutes);
  
  // rotas de autenticação e registro (públicas)
  app.use('/api/auth', userRoutes);
  
  // rotas protegidas por autenticação
  app.use('/api/users', authenticateToken, userRoutes);
}
