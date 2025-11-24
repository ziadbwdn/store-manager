import { Request, Response } from 'express';
import { purchaseService } from '../services/purchaseService';

export const purchaseController = {
  async getAllPurchases(req: Request, res: Response) {
    try {
      const purchases = await purchaseService.getAllPurchases();
      res.json(purchases);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getPurchaseById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const purchase = await purchaseService.getPurchaseById(id);

      if (!purchase) {
        return res.status(404).json({ error: 'Purchase not found' });
      }

      res.json(purchase);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async createPurchase(req: Request, res: Response) {
    try {
      const { customerId, items } = req.body;

      // Validation
      if (!customerId) {
        return res.status(400).json({ error: 'customerId is required' });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'items must be a non-empty array' });
      }

      // Validate items structure
      for (const item of items) {
        if (!item.productId || typeof item.quantity !== 'number' || item.quantity <= 0) {
          return res.status(400).json({
            error: 'Each item must have productId and quantity (positive number)',
          });
        }
      }

      const purchase = await purchaseService.createPurchase(customerId, items);

      res.status(201).json(purchase);
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('Insufficient stock')) {
        return res.status(400).json({ error: err.message });
      }
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  },

  async cancelPurchase(req: Request, res: Response) {
    try {
      const purchaseId = parseInt(req.params.id, 10);
      const { reason } = req.body;

      const purchase = await purchaseService.cancelPurchase(purchaseId, reason);

      res.json(purchase);
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        return res.status(404).json({ error: err.message });
      }
      if (err.message.includes('already cancelled')) {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  },
};
