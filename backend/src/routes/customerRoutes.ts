import { Router } from 'express';
import { CustomerController } from '../controllers/customerController';
import { validate, validateParams } from '../middlewares/validation';
import { requireAdmin } from '../middlewares/auth';
import { createCustomerSchema, updateCustomerSchema, customerLoginSchema, customerIdSchema } from '../schemas/customerSchema';

const router = Router();
const customerController = new CustomerController();

// Rotas públicas
router.post('/register', validate(createCustomerSchema), customerController.createCustomer);
router.post('/login', validate(customerLoginSchema), customerController.login);

// Rotas protegidas (autenticação aplicada no configrouter.ts)
router.get('/', requireAdmin, customerController.getAllCustomers);
router.get('/:id', requireAdmin, validateParams(customerIdSchema), customerController.getCustomerById);
router.put('/:id', validateParams(customerIdSchema), validate(updateCustomerSchema), customerController.updateCustomer);
router.delete('/:id', requireAdmin, validateParams(customerIdSchema), customerController.deleteCustomer);

export default router;
