// Enums
export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Entities
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductStock {
  id: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number | string;
  stock: ProductStock;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id: number;
  quantity: number;
  priceAtPurchase: number | string;
  product: Product;
  createdAt: string;
}

export interface Purchase {
  id: number;
  customerId: number;
  customer: Customer;
  totalAmount: number | string;
  status: PurchaseStatus;
  items: PurchaseItem[];
  createdAt: string;
  updatedAt: string;
}

// Request/Response Types
export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface CreatePurchaseRequest {
  customerId: number;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface CancelPurchaseRequest {
  reason?: string;
}

export interface ApiError {
  error: string;
}
