import { Request, Response } from 'express';
import { StockService } from '../services/stockService';

const stockService = new StockService();

export class StockController {
  async createStock(req: Request, res: Response) {
    try {
      const stock = await stockService.createStock(req.body);
      return res.status(201).json(stock);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getAllStock(req: Request, res: Response) {
    try {
      const stock = await stockService.getAllStock();
      return res.json(stock);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getStockById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stock = await stockService.getStockById(parseInt(id));
      return res.json(stock);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }

  async getStockByProductId(req: Request, res: Response) {
    try {
      const { product_id } = req.params;
      const stock = await stockService.getStockByProductId(parseInt(product_id));
      return res.json(stock);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const stock = await stockService.updateStock(parseInt(id), req.body);
      return res.json(stock);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateStockQuantity(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const stock = await stockService.updateStockQuantity(parseInt(id), quantity);
      return res.json(stock);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async deleteStock(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await stockService.deleteStock(parseInt(id));
      return res.json(result);
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  }
}
