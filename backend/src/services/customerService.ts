import { Customer, CustomerDetail, User } from '../models';
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

    // Hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar usuário
    const user = await User.create({
      name: data.name,
      mail: data.mail,
      login: data.login,
      password: hashedPassword,
      role: 'customer'
    });

    // Criar detalhes do cliente
    const customerDetail = await CustomerDetail.create({
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

    return customerDetail;
  }

  async getAllCustomers() {
    return await CustomerDetail.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'mail', 'login', 'role', 'created_at', 'updated_at']
      }]
    });
  }

  async getCustomerById(id: number) {
    const customer = await CustomerDetail.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'mail', 'login', 'role', 'created_at', 'updated_at']
      }]
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
    const customerDetail = await CustomerDetail.findByPk(id, {
      include: [{
        model: User,
        as: 'user'
      }]
    });
    
    if (!customerDetail || !customerDetail.user) {
      throw new Error('Cliente não encontrado');
    }

    // Atualizar dados do usuário
    const userData: any = {};
    if (data.name) userData.name = data.name;
    if (data.mail) userData.mail = data.mail;
    if (data.login) userData.login = data.login;
    if (data.password) userData.password = await bcrypt.hash(data.password, 10);

    if (Object.keys(userData).length > 0) {
      await customerDetail.user.update(userData);
    }

    // Atualizar dados do customer detail
    const detailData: any = {};
    if (data.phone) detailData.phone = data.phone;
    if (data.address) detailData.address = data.address;
    if (data.zip_code) detailData.zip_code = data.zip_code;
    if (data.document) detailData.document = data.document;
    if (data.neighborhood) detailData.neighborhood = data.neighborhood;
    if (data.city) detailData.city = data.city;
    if (data.state) detailData.state = data.state;
    if (data.address_number) detailData.address_number = data.address_number;

    if (Object.keys(detailData).length > 0) {
      await customerDetail.update(detailData);
    }
    
    return customerDetail;
  }

  async deleteCustomer(id: number) {
    const customerDetail = await CustomerDetail.findByPk(id, {
      include: [{
        model: User,
        as: 'user'
      }]
    });
    
    if (!customerDetail || !customerDetail.user) {
      throw new Error('Cliente não encontrado');
    }
    
    // Deletar o customer detail
    await customerDetail.destroy();
    
    // Deletar o usuário associado
    await customerDetail.user.destroy();
    
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
