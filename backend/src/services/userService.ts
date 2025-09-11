import { User, CustomerDetail } from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

export class UserService {
  async createUser(data: {
    name: string;
    mail: string;
    login: string;
    password: string;
    role?: string;
  }) {
    // Verificar se login ou email já existem
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { login: data.login },
          { mail: data.mail }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Login ou email já existem');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await User.create({
      ...data,
      password: hashedPassword,
      role: data.role || 'customer'
    });
  }

  async getAllUsers() {
    return await User.findAll({
      where: { is_deleted: false },
      attributes: { exclude: ['password'] }
    });
  }

  async getUserById(id: number) {
    const user = await User.findOne({
      where: { id, is_deleted: false },
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    return user;
  }

  async updateUser(id: number, data: {
    name?: string;
    mail?: string;
    login?: string;
    password?: string;
    role?: string;
  }) {
    const user = await User.findOne({
      where: { id, is_deleted: false }
    });
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Se a senha está sendo atualizada, fazer hash
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    return await user.update(data);
  }

  async deleteUser(id: number) {
    const user = await User.findOne({
      where: { id, is_deleted: false }
    });
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    await user.update({ is_deleted: true });
    return { message: 'Usuário deletado com sucesso' };
  }

  async authenticateUser(login: string, password: string) {
    const user = await User.findOne({
      where: { login, is_deleted: false },
      include: [{
        association: 'customerDetail',
        required: false
      }]
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        login: user.login, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    // Se for customer, incluir dados do customerDetail
    if (user.role === 'customer' && user.customerDetail) {
      return {
        user: {
          id: user.id,
          name: user.name,
          mail: user.mail,
          login: user.login,
          role: user.role,
          phone: user.customerDetail.phone,
          address: user.customerDetail.address,
          zip_code: user.customerDetail.zip_code,
          document: user.customerDetail.document,
          neighborhood: user.customerDetail.neighborhood,
          city: user.customerDetail.city,
          state: user.customerDetail.state,
          address_number: user.customerDetail.address_number
        },
        token
      };
    }

    // Se for admin, retornar apenas dados básicos
    return {
      user: {
        id: user.id,
        name: user.name,
        mail: user.mail,
        login: user.login,
        role: user.role
      },
      token
    };
  }

  async createCustomer(data: {
    name: string;
    mail: string;
    login: string;
    password: string;
    phone?: string;
    address?: string;
    zip_code?: string;
    document?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    address_number?: string;
  }) {
    // Verificar se login ou email já existem
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { login: data.login },
          { mail: data.mail }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Login ou email já existem');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Criar usuário com role customer
    const user = await User.create({
      name: data.name,
      mail: data.mail,
      login: data.login,
      password: hashedPassword,
      role: 'customer'
    });

    // Criar customer_detail se houver dados específicos
    if (data.phone || data.address || data.document) {
      await CustomerDetail.create({
        user_id: user.id,
        phone: data.phone,
        address: data.address,
        zip_code: data.zip_code,
        document: data.document,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        address_number: data.address_number
      });
    }

    return user;
  }
}
