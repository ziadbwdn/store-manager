import { AppDataSource } from '../config/database';
import { Customer } from '../entities/Customer';

const customerRepository = AppDataSource.getRepository(Customer);

export const customerService = {
  async getAllCustomers() {
    return await customerRepository.find({
      order: { createdAt: 'DESC' },
    });
  },

  async getCustomerById(id: number) {
    return await customerRepository.findOne({
      where: { id },
      relations: ['purchases'],
    });
  },

  async createCustomer(data: Partial<Customer>) {
    const customer = customerRepository.create(data);
    return await customerRepository.save(customer);
  },

  async updateCustomer(id: number, data: Partial<Customer>) {
    await customerRepository.update(id, data);
    return await this.getCustomerById(id);
  },

  async deleteCustomer(id: number) {
    return await customerRepository.delete(id);
  },
};
