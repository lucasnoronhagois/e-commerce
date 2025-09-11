import { Request, Response } from 'express';
import { CustomerService } from '../services/customerService';

const customerService = new CustomerService();

export class CustomerController {
  async createCustomer(req: Request, res: Response) {
    try {
      const customer = await customerService.createCustomer(req.body);
      return res.status(201).json({
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
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAllCustomers(req: Request, res: Response) {
    try {
      const customers = await customerService.getAllCustomers();
      return res.json(customers);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getCustomerById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(parseInt(id));
      return res.json(customer);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  async updateCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const customer = await customerService.updateCustomer(parseInt(id), req.body);
      return res.json({
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
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await customerService.deleteCustomer(parseInt(id));
      return res.json(result);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { login, password } = req.body;
      const result = await customerService.authenticateCustomer(login, password);
      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }
}
