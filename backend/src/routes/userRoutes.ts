import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { validate, validateParams } from '../middlewares/validation';
import { requireAdmin } from '../middlewares/auth';
import { createUserSchema, updateUserSchema, loginSchema, userIdSchema } from '../schemas/userSchema';

const router = Router();
const userController = new UserController();

// Rotas públicas
router.post('/login', validate(loginSchema), userController.login);
router.post('/register', validate(createUserSchema), userController.createCustomer);

// Rotas protegidas (autenticação aplicada no configrouter.ts)
router.get('/', requireAdmin, userController.getAllUsers);
router.get('/:id', requireAdmin, validateParams(userIdSchema), userController.getUserById);
router.post('/', requireAdmin, validate(createUserSchema), userController.createUser);
router.put('/:id', requireAdmin, validateParams(userIdSchema), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', requireAdmin, validateParams(userIdSchema), userController.deleteUser);

export default router;
