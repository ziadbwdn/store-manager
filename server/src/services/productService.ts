import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';
import { ProductStock } from '../entities/ProductStock';

const productRepository = AppDataSource.getRepository(Product);
const stockRepository = AppDataSource.getRepository(ProductStock);

export const productService = {
  async getAllProducts() {
    return await productRepository.find({
      relations: ['stock'],
      order: { createdAt: 'DESC' },
    });
  },

  async getProductById(id: number) {
    return await productRepository.findOne({
      where: { id },
      relations: ['stock'],
    });
  },

  async createProduct(data: { sku: string; name: string; description: string; price: number; quantity: number }) {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      const product = transactionalEntityManager.create(Product, {
        sku: data.sku,
        name: data.name,
        description: data.description,
        price: data.price,
      });

      const savedProduct = await transactionalEntityManager.save(product);

      const stock = transactionalEntityManager.create(ProductStock, {
        quantity: data.quantity,
        product: savedProduct,
      });

      await transactionalEntityManager.save(stock);

      return await this.getProductById(savedProduct.id);
    });
  },

  async updateProduct(id: number, data: Partial<Product>) {
    await productRepository.update(id, data);
    return await this.getProductById(id);
  },

  async deleteProduct(id: number) {
    return await productRepository.delete(id);
  },
};
