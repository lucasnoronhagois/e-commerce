import { UserService } from '../../src/services/userService';
import User from '../../src/models/User';
import { CustomerDetail } from '../../src/models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dos modelos
jest.mock('../../src/models/User');
jest.mock('../../src/models/CustomerDetail');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockUser = User as jest.Mocked<typeof User>;
const mockCustomerDetail = CustomerDetail as jest.Mocked<typeof CustomerDetail>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userData = {
        name: 'João Silva',
        mail: 'joao@test.com',
        login: 'joao123',
        password: 'password123',
        role: 'customer'
      };

      const hashedPassword = 'hashed_password_123';
      const createdUser = {
        id: 1,
        ...userData,
        password: hashedPassword,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockUser.findOne.mockResolvedValue(null);
      mockUser.create.mockResolvedValue(createdUser as any);

      const result = await userService.createUser(userData);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({
          [Symbol.for('or')]: [
            { login: userData.login },
            { mail: userData.mail }
          ]
        })
      });
      expect(mockUser.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
        role: 'customer'
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw error if user already exists', async () => {
      const userData = {
        name: 'João Silva',
        mail: 'joao@test.com',
        login: 'joao123',
        password: 'password123'
      };

      const existingUser = { id: 1, login: 'joao123' };
      mockUser.findOne.mockResolvedValue(existingUser as any);

      await expect(userService.createUser(userData)).rejects.toThrow('Login ou email já existem');
    });

    it('should set default role as customer', async () => {
      const userData = {
        name: 'João Silva',
        mail: 'joao@test.com',
        login: 'joao123',
        password: 'password123'
      };

      const hashedPassword = 'hashed_password_123';
      const createdUser = {
        id: 1,
        ...userData,
        password: hashedPassword,
        role: 'customer'
      };

      mockBcrypt.hash.mockResolvedValue(hashedPassword as never);
      mockUser.findOne.mockResolvedValue(null);
      mockUser.create.mockResolvedValue(createdUser as any);

      await userService.createUser(userData);

      expect(mockUser.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
        role: 'customer'
      });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [
        { id: 1, name: 'João', mail: 'joao@test.com', role: 'customer' },
        { id: 2, name: 'Maria', mail: 'maria@test.com', role: 'admin' }
      ];

      mockUser.findAll.mockResolvedValue(users as any);

      const result = await userService.getAllUsers();

      expect(mockUser.findAll).toHaveBeenCalledWith({
        where: { is_deleted: false },
        attributes: { exclude: ['password'] }
      });
      expect(result).toEqual(users);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = { id: 1, name: 'João', mail: 'joao@test.com', role: 'customer' };
      mockUser.findOne.mockResolvedValue(user as any);

      const result = await userService.getUserById(1);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { id: 1, is_deleted: false },
        attributes: { exclude: ['password'] }
      });
      expect(result).toEqual(user);
    });

    it('should throw error if user not found', async () => {
      mockUser.findOne.mockResolvedValue(null);

      await expect(userService.getUserById(999)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userData = { name: 'João Santos' };
      const existingUser = {
        id: 1,
        name: 'João Silva',
        mail: 'joao@test.com',
        update: jest.fn().mockResolvedValue({ id: 1, ...userData })
      };

      mockUser.findOne.mockResolvedValue(existingUser as any);

      const result = await userService.updateUser(1, userData);

      expect(existingUser.update).toHaveBeenCalledWith(userData);
      expect(result).toEqual({ id: 1, ...userData });
    });

    it('should throw error if user not found', async () => {
      mockUser.findOne.mockResolvedValue(null);

      await expect(userService.updateUser(999, { name: 'Test' })).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      const existingUser = {
        id: 1,
        name: 'João Silva',
        update: jest.fn().mockResolvedValue({ id: 1, is_deleted: true })
      };

      mockUser.findOne.mockResolvedValue(existingUser as any);

      const result = await userService.deleteUser(1);

      expect(existingUser.update).toHaveBeenCalledWith({ is_deleted: true });
      expect(result).toEqual({ message: 'Usuário deletado com sucesso' });
    });

    it('should throw error if user not found', async () => {
      mockUser.findOne.mockResolvedValue(null);

      await expect(userService.deleteUser(999)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user successfully with valid credentials', async () => {
      const login = 'joao123';
      const password = 'password123';

      const user = {
        id: 1,
        name: 'João Silva',
        mail: 'joao@test.com',
        login: 'joao123',
        password: 'hashed_password',
        role: 'customer'
      };

      const token = 'jwt_token_123';

      mockUser.findOne.mockResolvedValue(user as any);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValue(token as never);

      const result = await userService.authenticateUser(login, password);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: { login, is_deleted: false },
        include: [{ association: 'customerDetail', required: false }]
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id: user.id, login: user.login, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      expect(result).toEqual({
        user: {
          id: user.id,
          name: user.name,
          mail: user.mail,
          login: user.login,
          role: user.role
        },
        token
      });
    });

    it('should throw error for invalid login', async () => {
      const login = 'invalid';
      const password = 'password123';

      mockUser.findOne.mockResolvedValue(null);

      await expect(userService.authenticateUser(login, password)).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw error for invalid password', async () => {
      const login = 'joao123';
      const password = 'wrong_password';

      const user = {
        id: 1,
        name: 'João Silva',
        password: 'hashed_password'
      };

      mockUser.findOne.mockResolvedValue(user as any);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(userService.authenticateUser(login, password)).rejects.toThrow('Credenciais inválidas');
    });
  });
});
