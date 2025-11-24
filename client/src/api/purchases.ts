import { ApiClient } from './client';
import { Purchase, CreatePurchaseRequest, CancelPurchaseRequest } from '../types';

export const purchasesApi = {
  async getAll(): Promise<Purchase[]> {
    return ApiClient.get<Purchase[]>('/purchases');
  },

  async getById(id: number): Promise<Purchase> {
    return ApiClient.get<Purchase>(`/purchases/${id}`);
  },

  async create(data: CreatePurchaseRequest): Promise<Purchase> {
    return ApiClient.post<Purchase>('/purchases', data);
  },

  async cancel(id: number, data: CancelPurchaseRequest): Promise<Purchase> {
    return ApiClient.post<Purchase>(`/purchases/${id}/cancel`, data);
  },
};
