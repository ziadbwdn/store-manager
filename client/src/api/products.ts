import { ApiClient } from './client';
import { Product, CreateProductRequest } from '../types';

export const productsApi = {
  async getAll(): Promise<Product[]> {
    return ApiClient.get<Product[]>('/products');
  },

  async getById(id: number): Promise<Product> {
    return ApiClient.get<Product>(`/products/${id}`);
  },

  async create(data: CreateProductRequest): Promise<Product> {
    return ApiClient.post<Product>('/products', data);
  },

  async update(id: number, data: Partial<Product>): Promise<Product> {
    return ApiClient.put<Product>(`/products/${id}`, data);
  },

  async delete(id: number): Promise<{ message: string }> {
    return ApiClient.delete<{ message: string }>(`/products/${id}`);
  },
};
