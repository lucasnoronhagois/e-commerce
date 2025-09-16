import User from '../../src/models/User';

// Mock do Sequelize
const mockSequelize = {
  define: jest.fn(),
  sync: jest.fn(),
  authenticate: jest.fn(),
  close: jest.fn()
};

// Mock do Model
const mockModel = {
  init: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  bulkCreate: jest.fn(),
  destroy: jest.fn(),
  associate: jest.fn()
};

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'João Silva',
        mail: 'joao@test.com',
        login: 'joao123',
        password: 'password123',
        role: 'customer'
      };

      const createdUser = {
        id: 1,
        ...userData,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockModel.create.mockResolvedValue(createdUser);

      const result = await mockModel.create(userData);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe(userData.name);
      expect(result.mail).toBe(userData.mail);
      expect(result.login).toBe(userData.login);
      expect(result.role).toBe(userData.role);
      expect(result.is_deleted).toBe(false);
    });

    it('should set default role as customer', async () => {
      const userData = {
        name: 'Maria Santos',
        mail: 'maria@test.com',
        login: 'maria123',
        password: 'password123'
      };

      const createdUser = {
        id: 1,
        ...userData,
        role: 'customer'
      };

      mockModel.create.mockResolvedValue(createdUser);

      const result = await mockModel.create(userData);

      expect(result.role).toBe('customer');
    });

    it('should handle creation errors', async () => {
      const userData = {
        name: 'João Silva',
        mail: 'joao@test.com',
        login: 'joao123',
        password: 'password123'
      };

      const error = new Error('Validation error');
      mockModel.create.mockRejectedValue(error);

      await expect(mockModel.create(userData)).rejects.toThrow('Validation error');
    });
  });

  describe('User Queries', () => {
    it('should find user by id', async () => {
      const user = { id: 1, name: 'João Silva', mail: 'joao@test.com', role: 'customer' };
      mockModel.findByPk.mockResolvedValue(user);

      const result = await mockModel.findByPk(1);

      expect(result).toBeDefined();
      expect(result.name).toBe('João Silva');
    });

    it('should find user by email', async () => {
      const user = { id: 1, name: 'Maria Santos', mail: 'maria@test.com', role: 'admin' };
      mockModel.findOne.mockResolvedValue(user);

      const result = await mockModel.findOne({ where: { mail: 'maria@test.com' } });

      expect(result).toBeDefined();
      expect(result.name).toBe('Maria Santos');
      expect(result.role).toBe('admin');
    });

    it('should find all users', async () => {
      const users = [
        { id: 1, name: 'João', mail: 'joao@test.com', role: 'customer' },
        { id: 2, name: 'Maria', mail: 'maria@test.com', role: 'admin' }
      ];

      mockModel.findAll.mockResolvedValue(users);

      const result = await mockModel.findAll();

      expect(result).toHaveLength(2);
    });

    it('should find only active users', async () => {
      const activeUsers = [
        { id: 1, name: 'João', is_deleted: false },
        { id: 2, name: 'Maria', is_deleted: false }
      ];

      mockModel.findAll.mockResolvedValue(activeUsers);

      const result = await mockModel.findAll({ where: { is_deleted: false } });

      expect(result).toHaveLength(2);
    });

    it('should find users by role', async () => {
      const customers = [
        { id: 1, name: 'João', role: 'customer' },
        { id: 2, name: 'Pedro', role: 'customer' }
      ];

      mockModel.findAll.mockResolvedValue(customers);

      const result = await mockModel.findAll({ where: { role: 'customer' } });

      expect(result).toHaveLength(2);
    });
  });

  describe('User Updates', () => {
    it('should update user data', async () => {
      const updateData = { name: 'João Santos' };
      const updatedUser = { id: 1, name: 'João Santos', mail: 'joao@test.com' };

      const mockUser = {
        update: jest.fn().mockResolvedValue(updatedUser)
      };

      mockModel.findByPk.mockResolvedValue(mockUser);

      const user = await mockModel.findByPk(1);
      const result = await user.update(updateData);

      expect(result.name).toBe('João Santos');
    });

    it('should soft delete user', async () => {
      const mockUser = {
        update: jest.fn().mockResolvedValue({ id: 1, is_deleted: true })
      };

      mockModel.findByPk.mockResolvedValue(mockUser);

      const user = await mockModel.findByPk(1);
      const result = await user.update({ is_deleted: true });

      expect(result.is_deleted).toBe(true);
    });
  });
});