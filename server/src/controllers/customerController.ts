import { Request, Response } from 'express';
import { customerService } from '../services/customerService';

export const customerController = {
  async getAllCustomers(req: Request, res: Response) {
    try {
      const customers = await customerService.getAllCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getCustomerById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const customer = await customerService.getCustomerById(id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async createCustomer(req: Request, res: Response) {
    try {
      const { name, email, phone, address, city, state, zipCode, country } = req.body;

      // Validation
      if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
      }

      const customer = await customerService.createCustomer({
        name,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
      });

      res.status(201).json(customer);
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('unique constraint')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: err.message });
    }
  },

  async updateCustomer(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const data = req.body;

      const customer = await customerService.updateCustomer(id, data);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async deleteCustomer(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await customerService.deleteCustomer(id);

      if (result.affected === 0) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json({ message: 'Customer deleted' });
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('RESTRICT')) {
        return res.status(400).json({ error: 'Cannot delete customer with purchases' });
      }
      res.status(500).json({ error: err.message });
    }
  },
};
