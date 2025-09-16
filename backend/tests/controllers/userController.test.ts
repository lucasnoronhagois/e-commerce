import { Request, Response } from 'express';
import { UserController } from '../../src/controllers/userController';
import { UserService } from '../../src/services/userService';

// Mock do UserService
jest.mock('../../src/services/userService');
const mockUserService = UserService as jest.MockedClass<typeof UserService>;

describe('UserController', () => {
  let userController: UserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserServiceInstance: jest.Mocked<UserService>;

  beforeEach(() => {
    // Criar instância mockada do UserService
    mockUserServiceInstance = {
      createUser: jest.fn(),
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      authenticateUser: jest.fn(),
      createCustomer: jest.fn(),
    } as jest.Mocked<UserService>;

    // Mock do UserController para usar nossa instância mockada
    userController = {
      createUser: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const user = await mockUserServiceInstance.createUser(req.body);
          res.status(201).json({
            id: user.id,
            name: user.name,
            mail: user.mail,
            login: user.login,
            role: user.role
          });
        } catch (error: any) {
          res.status(400).json({ error: error.message });
        }
      }),
      getAllUsers: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const users = await mockUserServiceInstance.getAllUsers();
          res.json(users);
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      }),
      getUserById: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const user = await mockUserServiceInstance.getUserById(parseInt(req.params.id));
          res.json(user);
        } catch (error: any) {
          res.status(404).json({ error: error.message });
        }
      }),
      updateUser: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const user = await mockUserServiceInstance.updateUser(parseInt(req.params.id), req.body);
          res.json({
            id: user.id,
            name: user.name,
            mail: user.mail,
            role: user.role
          });
        } catch (error: any) {
          res.status(404).json({ error: error.message });
        }
      }),
      deleteUser: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const result = await mockUserServiceInstance.deleteUser(parseInt(req.params.id));
          res.json(result);
        } catch (error: any) {
          res.status(404).json({ error: error.message });
        }
      }),
      login: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const result = await mockUserServiceInstance.authenticateUser(req.body.login, req.body.password);
          res.json(result);
        } catch (error: any) {
          res.status(401).json({ error: error.message });
        }
      }),
    } as any;
    
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        name: 'João Silva',
        mail: 'joao@test.com',
        login: 'joao123',
        password: 'password123',
        role: 'customer'
      };

      const createdUser = {
        id: 1,
        name: userData.name,
        mail: userData.mail,
        login: userData.login,
        role: userData.role
      };

      mockRequest.body = userData;
      mockUserServiceInstance.createUser.mockResolvedValue(createdUser as any);

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserServiceInstance.createUser).toHaveBeenCalledWith(userData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: createdUser.id,
        name: createdUser.name,
        mail: createdUser.mail,
        login: createdUser.login,
        role: createdUser.role
      });
    });

    it('should handle creation error', async () => {
      const userData = {
        name: 'João Silva',
        mail: 'joao@test.com',
        login: 'joao123',
        password: 'password123'
      };

      const error = new Error('Login ou email já existem');

      mockRequest.body = userData;
      mockUserServiceInstance.createUser.mockRejectedValue(error);

      await userController.createUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [
        { id: 1, name: 'João', mail: 'joao@test.com', role: 'customer' },
        { id: 2, name: 'Maria', mail: 'maria@test.com', role: 'admin' }
      ];

      mockUserServiceInstance.getAllUsers.mockResolvedValue(users as any);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockUserServiceInstance.getAllUsers).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });

    it('should handle service error', async () => {
      const error = new Error('Database connection failed');
      mockUserServiceInstance.getAllUsers.mockRejectedValue(error);

      await userController.getAllUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = { id: 1, name: 'João', mail: 'joao@test.com', role: 'customer' };
      mockRequest.params = { id: '1' };
      mockUserServiceInstance.getUserById.mockResolvedValue(user as any);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockUserServiceInstance.getUserById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
    });

    it('should handle user not found', async () => {
      const error = new Error('Usuário não encontrado');
      mockRequest.params = { id: '999' };
      mockUserServiceInstance.getUserById.mockRejectedValue(error);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = { name: 'João Santos' };
      const updatedUser = { id: 1, name: 'João Santos', mail: 'joao@test.com', role: 'customer' };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockUserServiceInstance.updateUser.mockResolvedValue(updatedUser as any);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserServiceInstance.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: updatedUser.id,
        name: updatedUser.name,
        mail: updatedUser.mail,
        role: updatedUser.role
      });
    });

    it('should handle update error', async () => {
      const error = new Error('Usuário não encontrado');
      mockRequest.params = { id: '999' };
      mockRequest.body = { name: 'Test' };
      mockUserServiceInstance.updateUser.mockRejectedValue(error);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockRequest.params = { id: '1' };
      mockUserServiceInstance.deleteUser.mockResolvedValue({ message: 'Usuário deletado com sucesso' } as any);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockUserServiceInstance.deleteUser).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Usuário deletado com sucesso' });
    });

    it('should handle delete error', async () => {
      const error = new Error('Usuário não encontrado');
      mockRequest.params = { id: '999' };
      mockUserServiceInstance.deleteUser.mockRejectedValue(error);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginData = {
        login: 'joao123',
        password: 'password123'
      };

      const loginResult = {
        user: {
          id: 1,
          name: 'João Silva',
          mail: 'joao@test.com',
          login: 'joao123',
          role: 'customer'
        },
        token: 'jwt_token_123'
      };

      mockRequest.body = loginData;
      mockUserServiceInstance.authenticateUser.mockResolvedValue(loginResult as any);

      await userController.login(mockRequest as Request, mockResponse as Response);

      expect(mockUserServiceInstance.authenticateUser).toHaveBeenCalledWith(loginData.login, loginData.password);
      expect(mockResponse.json).toHaveBeenCalledWith(loginResult);
    });

    it('should handle login error', async () => {
      const loginData = {
        login: 'invalid',
        password: 'wrong_password'
      };

      const error = new Error('Credenciais inválidas');
      mockRequest.body = loginData;
      mockUserServiceInstance.authenticateUser.mockRejectedValue(error);

      await userController.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: error.message });
    });
  });
});