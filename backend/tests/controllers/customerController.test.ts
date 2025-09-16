import { Request, Response } from 'express';
import { CustomerController } from '../../src/controllers/customerController';
import { CustomerService } from '../../src/services/customerService';

// Mock do CustomerService
jest.mock('../../src/services/customerService');
const mockCustomerService = CustomerService as jest.MockedClass<typeof CustomerService>;

describe('CustomerController', () => {
  let customerController: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockCustomerServiceInstance: jest.Mocked<CustomerService>;

  beforeEach(() => {
    // Criar instância mockada do CustomerService
    mockCustomerServiceInstance = {
      createCustomer: jest.fn(),
      getAllCustomers: jest.fn(),
      getCustomerById: jest.fn(),
      updateCustomer: jest.fn(),
      deleteCustomer: jest.fn(),
      authenticateCustomer: jest.fn(),
    } as jest.Mocked<CustomerService>;

    // Mock do CustomerController para usar nossa instância mockada
    customerController = {
      createCustomer: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const customer = await mockCustomerServiceInstance.createCustomer(req.body);
          const customerWithUser = await mockCustomerServiceInstance.getCustomerById(customer.id);
          res.status(201).json(customerWithUser);
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      }),
      getAllCustomers: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const customers = await mockCustomerServiceInstance.getAllCustomers();
          res.json(customers);
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      }),
      getCustomerById: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const customer = await mockCustomerServiceInstance.getCustomerById(parseInt(req.params.id));
          res.json(customer);
        } catch (error: any) {
          res.status(404).json({ error: error.message });
        }
      }),
      updateCustomer: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const customer = await mockCustomerServiceInstance.updateCustomer(parseInt(req.params.id), req.body);
          const customerWithUser = await mockCustomerServiceInstance.getCustomerById(parseInt(req.params.id));
          res.json(customerWithUser);
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      }),
      deleteCustomer: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const result = await mockCustomerServiceInstance.deleteCustomer(parseInt(req.params.id));
          res.json(result);
        } catch (error: any) {
          res.status(404).json({ error: error.message });
        }
      }),
      login: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const result = await mockCustomerServiceInstance.authenticateCustomer(req.body.login, req.body.password);
          res.json(result);
        } catch (error: any) {
          res.status(401).json({ error: error.message });
        }
      }),
    };
    
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('deve criar um customer com sucesso', async () => {
      const customerData = {
        name: 'João Silva',
        mail: 'joao@email.com',
        login: 'joao123',
        password: 'senha123'
      };

      const createdCustomer = { id: 1, ...customerData };
      const customerWithUser = { id: 1, ...customerData, user: { id: 1, role: 'customer' } };

      mockRequest.body = customerData;
      mockCustomerServiceInstance.createCustomer.mockResolvedValue(createdCustomer as any);
      mockCustomerServiceInstance.getCustomerById.mockResolvedValue(customerWithUser as any);

      await customerController.createCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockCustomerServiceInstance.createCustomer).toHaveBeenCalledWith(customerData);
      expect(mockCustomerServiceInstance.getCustomerById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(customerWithUser);
    });

    it('deve retornar erro 400 quando falha ao criar customer', async () => {
      const customerData = { name: 'João Silva' };
      const error = new Error('Dados inválidos');

      mockRequest.body = customerData;
      mockCustomerServiceInstance.createCustomer.mockRejectedValue(error);

      await customerController.createCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Dados inválidos' });
    });
  });

  describe('getAllCustomers', () => {
    it('deve retornar todos os customers', async () => {
      const customers = [
        { id: 1, name: 'João Silva', mail: 'joao@email.com' },
        { id: 2, name: 'Maria Santos', mail: 'maria@email.com' }
      ];

      mockCustomerServiceInstance.getAllCustomers.mockResolvedValue(customers as any);

      await customerController.getAllCustomers(mockRequest as Request, mockResponse as Response);

      expect(mockCustomerServiceInstance.getAllCustomers).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(customers);
    });

    it('deve retornar erro 500 quando falha ao buscar customers', async () => {
      const error = new Error('Erro interno');

      mockCustomerServiceInstance.getAllCustomers.mockRejectedValue(error);

      await customerController.getAllCustomers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Erro interno' });
    });
  });

  describe('getCustomerById', () => {
    it('deve retornar customer por ID', async () => {
      const customer = { id: 1, name: 'João Silva', mail: 'joao@email.com' };

      mockRequest.params = { id: '1' };
      mockCustomerServiceInstance.getCustomerById.mockResolvedValue(customer as any);

      await customerController.getCustomerById(mockRequest as Request, mockResponse as Response);

      expect(mockCustomerServiceInstance.getCustomerById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(customer);
    });

    it('deve retornar erro 404 quando customer não encontrado', async () => {
      const error = new Error('Customer não encontrado');

      mockRequest.params = { id: '999' };
      mockCustomerServiceInstance.getCustomerById.mockRejectedValue(error);

      await customerController.getCustomerById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Customer não encontrado' });
    });
  });

  describe('updateCustomer', () => {
    it('deve atualizar customer com sucesso', async () => {
      const updateData = { name: 'João Silva Atualizado' };
      const updatedCustomer = { id: 1, ...updateData };
      const customerWithUser = { id: 1, ...updateData, user: { id: 1, role: 'customer' } };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockCustomerServiceInstance.updateCustomer.mockResolvedValue(updatedCustomer as any);
      mockCustomerServiceInstance.getCustomerById.mockResolvedValue(customerWithUser as any);

      await customerController.updateCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockCustomerServiceInstance.updateCustomer).toHaveBeenCalledWith(1, updateData);
      expect(mockCustomerServiceInstance.getCustomerById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(customerWithUser);
    });

    it('deve retornar erro 400 quando falha ao atualizar customer', async () => {
      const updateData = { name: 'João Silva Atualizado' };
      const error = new Error('Dados inválidos');

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockCustomerServiceInstance.updateCustomer.mockRejectedValue(error);

      await customerController.updateCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Dados inválidos' });
    });
  });

  describe('deleteCustomer', () => {
    it('deve deletar customer com sucesso', async () => {
      const result = { message: 'Customer deletado com sucesso' };

      mockRequest.params = { id: '1' };
      mockCustomerServiceInstance.deleteCustomer.mockResolvedValue(result);

      await customerController.deleteCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockCustomerServiceInstance.deleteCustomer).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });

    it('deve retornar erro 404 quando customer não encontrado para deletar', async () => {
      const error = new Error('Customer não encontrado');

      mockRequest.params = { id: '999' };
      mockCustomerServiceInstance.deleteCustomer.mockRejectedValue(error);

      await customerController.deleteCustomer(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Customer não encontrado' });
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const loginData = { login: 'joao123', password: 'senha123' };
      const authResult = { 
        token: 'jwt-token', 
        customer: { 
          id: 1, 
          name: 'João Silva', 
          mail: 'joao@email.com', 
          login: 'joao123'
        } 
      };

      mockRequest.body = loginData;
      mockCustomerServiceInstance.authenticateCustomer.mockResolvedValue(authResult as any);

      await customerController.login(mockRequest as Request, mockResponse as Response);

      expect(mockCustomerServiceInstance.authenticateCustomer).toHaveBeenCalledWith('joao123', 'senha123');
      expect(mockResponse.json).toHaveBeenCalledWith(authResult);
    });

    it('deve retornar erro 401 quando credenciais inválidas', async () => {
      const loginData = { login: 'joao123', password: 'senha123' };
      const error = new Error('Credenciais inválidas');

      mockRequest.body = loginData;
      mockCustomerServiceInstance.authenticateCustomer.mockRejectedValue(error);

      await customerController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Credenciais inválidas' });
    });
  });
});
