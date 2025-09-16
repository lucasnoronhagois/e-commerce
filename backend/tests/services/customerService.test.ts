import { CustomerService } from '../../src/services/customerService';
import { User, CustomerDetail, Customer } from '../../src/models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

// Mocks
jest.mock('../../src/models');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockUser = User as jest.Mocked<typeof User>;
const mockCustomerDetail = CustomerDetail as jest.Mocked<typeof CustomerDetail>;
const mockCustomer = Customer as jest.Mocked<typeof Customer>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('CustomerService', () => {
  let customerService: CustomerService;

  beforeEach(() => {
    customerService = new CustomerService();
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('deve criar um customer com sucesso', async () => {
      const customerData = {
        name: 'João Silva',
        phone: '11999999999',
        mail: 'joao@email.com',
        login: 'joao123',
        password: 'senha123',
        address: 'Rua A, 123',
        zip_code: '01234567',
        document: '12345678901',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        address_number: '123'
      };

      const mockUserInstance = { id: 1, ...customerData };
      const mockCustomerDetailInstance = { id: 1, user_id: 1, ...customerData };

      mockUser.findOne.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashed_password' as never);
      mockUser.create.mockResolvedValue(mockUserInstance as any);
      mockCustomerDetail.create.mockResolvedValue(mockCustomerDetailInstance as any);

      const result = await customerService.createCustomer(customerData);

      expect(mockUser.findOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { login: customerData.login },
            { mail: customerData.mail }
          ]
        }
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(customerData.password, 10);
      expect(mockUser.create).toHaveBeenCalledWith({
        name: customerData.name,
        mail: customerData.mail,
        login: customerData.login,
        password: 'hashed_password',
        role: 'customer'
      });
      expect(mockCustomerDetail.create).toHaveBeenCalledWith({
        user_id: 1,
        phone: customerData.phone,
        address: customerData.address,
        zip_code: customerData.zip_code,
        document: customerData.document,
        neighborhood: customerData.neighborhood,
        city: customerData.city,
        state: customerData.state,
        address_number: customerData.address_number
      });
      expect(result).toEqual(mockCustomerDetailInstance);
    });

    it('deve lançar erro quando login ou email já existem', async () => {
      const customerData = {
        name: 'João Silva',
        phone: '11999999999',
        mail: 'joao@email.com',
        login: 'joao123',
        password: 'senha123'
      };

      const existingUser = { id: 1, login: 'joao123', mail: 'joao@email.com' };
      mockUser.findOne.mockResolvedValue(existingUser as any);

      await expect(customerService.createCustomer(customerData)).rejects.toThrow('Login ou email já existem');
    });
  });

  describe('getAllCustomers', () => {
    it('deve retornar todos os customers', async () => {
      const mockCustomers = [
        {
          id: 1,
          user_id: 1,
          phone: '11999999999',
          user: { id: 1, name: 'João Silva', mail: 'joao@email.com', login: 'joao123', role: 'customer' }
        },
        {
          id: 2,
          user_id: 2,
          phone: '11888888888',
          user: { id: 2, name: 'Maria Santos', mail: 'maria@email.com', login: 'maria456', role: 'customer' }
        }
      ];

      mockCustomerDetail.findAll.mockResolvedValue(mockCustomers as any);

      const result = await customerService.getAllCustomers();

      expect(mockCustomerDetail.findAll).toHaveBeenCalledWith({
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'mail', 'login', 'role', 'created_at', 'updated_at']
        }]
      });
      expect(result).toEqual(mockCustomers);
    });
  });

  describe('getCustomerById', () => {
    it('deve retornar customer por ID', async () => {
      const mockCustomer = {
        id: 1,
        user_id: 1,
        phone: '11999999999',
        user: { id: 1, name: 'João Silva', mail: 'joao@email.com', login: 'joao123', role: 'customer' }
      };

      mockCustomerDetail.findByPk.mockResolvedValue(mockCustomer as any);

      const result = await customerService.getCustomerById(1);

      expect(mockCustomerDetail.findByPk).toHaveBeenCalledWith(1, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'mail', 'login', 'role', 'created_at', 'updated_at']
        }]
      });
      expect(result).toEqual(mockCustomer);
    });

    it('deve lançar erro quando customer não encontrado', async () => {
      mockCustomerDetail.findByPk.mockResolvedValue(null);

      await expect(customerService.getCustomerById(999)).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('updateCustomer', () => {
    it('deve atualizar customer com sucesso', async () => {
      const updateData = {
        name: 'João Santos',
        phone: '11777777777',
        password: 'nova_senha123'
      };

      const mockCustomerDetailInstance = {
        id: 1,
        user_id: 1,
        phone: '11999999999',
        user: {
          id: 1,
          name: 'João Silva',
          mail: 'joao@email.com',
          login: 'joao123',
          update: jest.fn()
        },
        update: jest.fn()
      };

      mockCustomerDetail.findByPk.mockResolvedValue(mockCustomerDetailInstance as any);
      mockBcrypt.hash.mockResolvedValue('hashed_new_password' as never);

      const result = await customerService.updateCustomer(1, updateData);

      expect(mockCustomerDetail.findByPk).toHaveBeenCalledWith(1, {
        include: [{
          model: User,
          as: 'user'
        }]
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(updateData.password, 10);
      expect(mockCustomerDetailInstance.user.update).toHaveBeenCalledWith({
        name: updateData.name,
        password: 'hashed_new_password'
      });
      expect(mockCustomerDetailInstance.update).toHaveBeenCalledWith({
        phone: updateData.phone
      });
      expect(result).toEqual(mockCustomerDetailInstance);
    });

    it('deve lançar erro quando customer não encontrado', async () => {
      mockCustomerDetail.findByPk.mockResolvedValue(null);

      await expect(customerService.updateCustomer(999, { name: 'Test' })).rejects.toThrow('Cliente não encontrado');
    });

    it('deve lançar erro quando user não encontrado', async () => {
      const mockCustomerDetailInstance = {
        id: 1,
        user_id: 1,
        user: null
      };

      mockCustomerDetail.findByPk.mockResolvedValue(mockCustomerDetailInstance as any);

      await expect(customerService.updateCustomer(1, { name: 'Test' })).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('deleteCustomer', () => {
    it('deve deletar customer com sucesso', async () => {
      const mockCustomerDetailInstance = {
        id: 1,
        user_id: 1,
        user: {
          id: 1,
          destroy: jest.fn()
        },
        destroy: jest.fn()
      };

      mockCustomerDetail.findByPk.mockResolvedValue(mockCustomerDetailInstance as any);

      const result = await customerService.deleteCustomer(1);

      expect(mockCustomerDetail.findByPk).toHaveBeenCalledWith(1, {
        include: [{
          model: User,
          as: 'user'
        }]
      });
      expect(mockCustomerDetailInstance.destroy).toHaveBeenCalled();
      expect(mockCustomerDetailInstance.user.destroy).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Cliente deletado com sucesso' });
    });

    it('deve lançar erro quando customer não encontrado', async () => {
      mockCustomerDetail.findByPk.mockResolvedValue(null);

      await expect(customerService.deleteCustomer(999)).rejects.toThrow('Cliente não encontrado');
    });

    it('deve lançar erro quando user não encontrado', async () => {
      const mockCustomerDetailInstance = {
        id: 1,
        user_id: 1,
        user: null
      };

      mockCustomerDetail.findByPk.mockResolvedValue(mockCustomerDetailInstance as any);

      await expect(customerService.deleteCustomer(1)).rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('authenticateCustomer', () => {
    it('deve autenticar customer com sucesso', async () => {
      const mockCustomerInstance = {
        id: 1,
        name: 'João Silva',
        phone: '11999999999',
        mail: 'joao@email.com',
        login: 'joao123',
        password: 'hashed_password',
        address: 'Rua A, 123',
        zip_code: '01234567',
        document: '12345678901',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        address_number: '123'
      };

      mockCustomer.findOne.mockResolvedValue(mockCustomerInstance as any);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwt.sign.mockReturnValue('jwt_token' as never);

      const result = await customerService.authenticateCustomer('joao123', 'senha123');

      expect(mockCustomer.findOne).toHaveBeenCalledWith({
        where: { login: 'joao123', is_deleted: false }
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith('senha123', 'hashed_password');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { 
          id: 1, 
          login: 'joao123', 
          type: 'customer'
        },
        expect.any(String),
        expect.any(Object)
      );
      expect(result).toEqual({
        customer: {
          id: 1,
          name: 'João Silva',
          phone: '11999999999',
          mail: 'joao@email.com',
          login: 'joao123',
          address: 'Rua A, 123',
          zip_code: '01234567',
          document: '12345678901',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          address_number: '123'
        },
        token: 'jwt_token'
      });
    });

    it('deve lançar erro quando customer não encontrado', async () => {
      mockCustomer.findOne.mockResolvedValue(null);

      await expect(customerService.authenticateCustomer('invalid', 'password')).rejects.toThrow('Credenciais inválidas');
    });

    it('deve lançar erro quando senha inválida', async () => {
      const mockCustomerInstance = {
        id: 1,
        login: 'joao123',
        password: 'hashed_password'
      };

      mockCustomer.findOne.mockResolvedValue(mockCustomerInstance as any);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(customerService.authenticateCustomer('joao123', 'wrong_password')).rejects.toThrow('Credenciais inválidas');
    });
  });
});
