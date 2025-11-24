import { Request, Response } from 'express';
import { productService } from '../services/productService';

export const productController = {
  async getAllProducts(req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getProductById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async createProduct(req: Request, res: Response) {
    try {
      const { sku, name, description, price, quantity } = req.body;

      // Validation
      if (!sku || !name || !description || price === undefined || quantity === undefined) {
        return res.status(400).json({
          error: 'sku, name, description, price, and quantity are required',
        });
      }

      if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }

      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: 'Quantity must be a non-negative number' });
      }

      const product = await productService.createProduct({
        sku,
        name,
        description,
        price,
        quantity,
      });

      res.status(201).json(product);
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
      res.status(500).json({ error: err.message });
    }
  },

  async updateProduct(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = req.body;

      // Validate price if provided
      if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }

      const product = await productService.updateProduct(id, data);

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async deleteProduct(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await productService.deleteProduct(id);

      if (result.affected === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};
