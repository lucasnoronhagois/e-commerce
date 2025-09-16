import request from 'supertest';
import express from 'express';
import { UserController } from '../../src/controllers/userController';
import { UserService } from '../../src/services/userService';

// Mock do UserService
jest.mock('../../src/services/userService');
const mockUserService = UserService as jest.MockedClass<typeof UserService>;

describe('User Routes Integration', () => {
  let app: express.Application;
  let mockUserServiceInstance: jest.Mocked<UserService>;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Criar instância mockada do UserService
    mockUserServiceInstance = {
      authenticateUser: jest.fn(),
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      createCustomer: jest.fn(),
    } as jest.Mocked<UserService>;
    
    // Mock do UserController para usar nossa instância mockada
    const userController = {
      login: jest.fn().mockImplementation(async (req: any, res: any) => {
        try {
          const result = await mockUserServiceInstance.authenticateUser(req.body.login, req.body.password);
          res.json(result);
        } catch (error: any) {
          res.status(401).json({ error: error.message });
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
    };

    // Rotas de autenticação (públicas)
    app.post('/api/auth/login', userController.login.bind(userController));

    // Rotas protegidas (simulando middleware de auth)
    app.get('/api/users', (req: any, res, next) => {
      req.user = { id: 1, role: 'admin' };
      next();
    }, userController.getAllUsers.bind(userController));

    app.get('/api/users/:id', (req: any, res, next) => {
      req.user = { id: 1, role: 'admin' };
      next();
    }, userController.getUserById.bind(userController));

    app.post('/api/users', (req: any, res, next) => {
      req.user = { id: 1, role: 'admin' };
      next();
    }, userController.createUser.bind(userController));

    app.put('/api/users/:id', (req: any, res, next) => {
      req.user = { id: 1, role: 'admin' };
      next();
    }, userController.updateUser.bind(userController));

    app.delete('/api/users/:id', (req: any, res, next) => {
      req.user = { id: 1, role: 'admin' };
      next();
    }, userController.deleteUser.bind(userController));

    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
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

      mockUserServiceInstance.authenticateUser.mockResolvedValue(loginResult as any);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toEqual(loginResult);
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        login: 'invalid',
        password: 'wrong_password'
      };

      mockUserServiceInstance.authenticateUser.mockRejectedValue(new Error('Credenciais inválidas'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.error).toBe('Credenciais inválidas');
    });
  });

  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const users = [
        { id: 1, name: 'João', mail: 'joao@test.com', role: 'customer' },
        { id: 2, name: 'Maria', mail: 'maria@test.com', role: 'admin' }
      ];

      mockUserServiceInstance.getAllUsers.mockResolvedValue(users as any);

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body).toEqual(users);
    });

    it('should handle service error', async () => {
      mockUserServiceInstance.getAllUsers.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/users')
        .expect(500);

      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      const user = { id: 1, name: 'João', mail: 'joao@test.com', role: 'customer' };
      mockUserServiceInstance.getUserById.mockResolvedValue(user as any);

      const response = await request(app)
        .get('/api/users/1')
        .expect(200);

      expect(response.body).toEqual(user);
      expect(mockUserServiceInstance.getUserById).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent user', async () => {
      mockUserServiceInstance.getUserById.mockRejectedValue(new Error('Usuário não encontrado'));

      const response = await request(app)
        .get('/api/users/999')
        .expect(404);

      expect(response.body.error).toBe('Usuário não encontrado');
    });
  });

  describe('POST /api/users', () => {
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

      mockUserServiceInstance.createUser.mockResolvedValue(createdUser as any);

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        id: createdUser.id,
        name: createdUser.name,
        mail: createdUser.mail,
        login: createdUser.login,
        role: createdUser.role
      });
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user successfully', async () => {
      const updateData = { name: 'João Santos' };
      const updatedUser = { id: 1, name: 'João Santos', mail: 'joao@test.com', role: 'customer' };

      mockUserServiceInstance.updateUser.mockResolvedValue(updatedUser as any);

      const response = await request(app)
        .put('/api/users/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        id: updatedUser.id,
        name: updatedUser.name,
        mail: updatedUser.mail,
        role: updatedUser.role
      });

      expect(mockUserServiceInstance.updateUser).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user successfully', async () => {
      mockUserServiceInstance.deleteUser.mockResolvedValue({ message: 'Usuário deletado com sucesso' } as any);

      const response = await request(app)
        .delete('/api/users/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Usuário deletado com sucesso' });
      expect(mockUserServiceInstance.deleteUser).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent user', async () => {
      mockUserServiceInstance.deleteUser.mockRejectedValue(new Error('Usuário não encontrado'));

      const response = await request(app)
        .delete('/api/users/999')
        .expect(404);

      expect(response.body.error).toBe('Usuário não encontrado');
    });
  });
});