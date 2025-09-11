import { Customer } from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

export class CustomerService {
  async createCustomer(data: {
    name: string;
    phone: string;
    mail: string;
    login: string;
    password: string;
    address: string;
    zip_code: string;
    document: string;
    neighborhood: string;
    city: string;
    state: string;
    address_number: string;
  }) {
    // Verificar se login, email ou documento já existem
    const existingCustomer = await Customer.findOne({
      where: {
        [Op.or]: [
          { login: data.login },
          { mail: data.mail },
          { document: data.document }
        ]
      }
    });

    if (existingCustomer) {
      throw new Error('Login, email ou documento já existem');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await Customer.create({
      ...data,
      password: hashedPassword
    });
  }

  async getAllCustomers() {
    return await Customer.findAll({
      where: { is_deleted: false },
      attributes: { exclude: ['password'] }
    });
  }

  async getCustomerById(id: number) {
    const customer = await Customer.findOne({
      where: { id, is_deleted: false },
      attributes: { exclude: ['password'] }
    });
    
    if (!customer) {
      throw new Error('Cliente não encontrado');
    }
    
    return customer;
  }

  async updateCustomer(id: number, data: {
    name?: string;
    phone?: string;
    mail?: string;
    login?: string;
    password?: string;
    address?: string;
    zip_code?: string;
    document?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    address_number?: string;
  }) {
    const customer = await Customer.findOne({
      where: { id, is_deleted: false }
    });
    
    if (!customer) {
      throw new Error('Cliente não encontrado');
    }

    // Se a senha está sendo atualizada, fazer hash
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    
    return await customer.update(data);
  }

  async deleteCustomer(id: number) {
    const customer = await Customer.findOne({
      where: { id, is_deleted: false }
    });
    
    if (!customer) {
      throw new Error('Cliente não encontrado');
    }
    
    await customer.update({ is_deleted: true });
    return { message: 'Cliente deletado com sucesso' };
  }

  async authenticateCustomer(login: string, password: string) {
    const customer = await Customer.findOne({
      where: { login, is_deleted: false }
    });

    if (!customer) {
      throw new Error('Credenciais inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, customer.password);
    
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      { 
        id: customer.id, 
        login: customer.login, 
        type: 'customer'
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions
    );

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        mail: customer.mail,
        login: customer.login,
        address: customer.address,
        zip_code: customer.zip_code,
        document: customer.document,
        neighborhood: customer.neighborhood,
        city: customer.city,
        state: customer.state,
        address_number: customer.address_number
      },
      token
    };
  }
}
