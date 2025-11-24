import { DataSource } from 'typeorm';
import { Customer } from '../entities/Customer';
import { Product } from '../entities/Product';
import { ProductStock } from '../entities/ProductStock';
import { Purchase } from '../entities/Purchase';
import { PurchaseItem } from '../entities/PurchaseItem';
import { PurchaseCancellation } from '../entities/PurchaseCancellation';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'store_admin',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [Customer, Product, ProductStock, Purchase, PurchaseItem, PurchaseCancellation],
});
