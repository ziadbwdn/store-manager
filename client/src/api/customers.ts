import { ApiClient } from './client';
import { Customer, CreateCustomerRequest } from '../types';

export const customersApi = {
  async getAll(): Promise<Customer[]> {
    return ApiClient.get<Customer[]>('/customers');
  },

  async getById(id: number): Promise<Customer> {
    return ApiClient.get<Customer>(`/customers/${id}`);
  },

  async create(data: CreateCustomerRequest): Promise<Customer> {
    return ApiClient.post<Customer>('/customers', data);
  },

  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    return ApiClient.put<Customer>(`/customers/${id}`, data);
  },

  async delete(id: number): Promise<{ message: string }> {
    return ApiClient.delete<{ message: string }>(`/customers/${id}`);
  },
};
