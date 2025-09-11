import { Request, Response } from 'express';
import { UserService } from '../services/userService';

const userService = new UserService();

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      return res.status(201).json({
        id: user.id,
        name: user.name,
        mail: user.mail,
        login: user.login,
        role: user.role
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(parseInt(id));
      return res.json(user);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.updateUser(parseInt(id), req.body);
      return res.json({
        id: user.id,
        name: user.name,
        mail: user.mail,
        login: user.login,
        role: user.role
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(parseInt(id));
      return res.json(result);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { login, password } = req.body;
      const result = await userService.authenticateUser(login, password);
      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  async createCustomer(req: Request, res: Response) {
    try {
      const user = await userService.createCustomer(req.body);
      return res.status(201).json({
        id: user.id,
        name: user.name,
        mail: user.mail,
        login: user.login,
        role: user.role
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}
