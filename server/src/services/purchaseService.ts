import { AppDataSource } from '../config/database';
import { Purchase, PurchaseStatus } from '../entities/Purchase';
import { PurchaseItem } from '../entities/PurchaseItem';
import { PurchaseCancellation } from '../entities/PurchaseCancellation';
import { ProductStock } from '../entities/ProductStock';

const purchaseRepository = AppDataSource.getRepository(Purchase);

export const purchaseService = {
  async getAllPurchases() {
    return await purchaseRepository.find({
      relations: ['customer', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  },

  async getPurchaseById(id: number) {
    return await purchaseRepository.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.product', 'cancellationRecord'],
    });
  },

  async createPurchase(customerId: number, items: Array<{ productId: number; quantity: number }>) {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      let totalAmount = 0;
      const purchaseItemsToCreate = [];

      // Validate and process each item
      for (const item of items) {
        const stock = await transactionalEntityManager.findOne(ProductStock, {
          where: { product: { id: item.productId } },
          relations: ['product'],
        });

        if (!stock) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (stock.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for product ID ${item.productId}. Available: ${stock.quantity}, Requested: ${item.quantity}`
          );
        }

        // Deduct stock
        stock.quantity -= item.quantity;
        await transactionalEntityManager.save(stock);

        // Calculate item total
        const itemTotal = Number(stock.product.price) * item.quantity;
        totalAmount += itemTotal;

        // Create purchase item
        purchaseItemsToCreate.push(
          transactionalEntityManager.create(PurchaseItem, {
            quantity: item.quantity,
            priceAtPurchase: stock.product.price,
            product: stock.product,
          })
        );
      }

      // Create purchase
      const newPurchase = transactionalEntityManager.create(Purchase, {
        customer: { id: customerId },
        totalAmount: totalAmount,
        status: PurchaseStatus.COMPLETED,
        items: purchaseItemsToCreate,
      });

      return await transactionalEntityManager.save(newPurchase);
    });
  },

  async cancelPurchase(purchaseId: number, reason: string) {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
      const purchase = await transactionalEntityManager.findOne(Purchase, {
        where: { id: purchaseId },
        relations: ['items', 'items.product', 'customer'],
      });

      if (!purchase) {
        throw new Error(`Purchase with ID ${purchaseId} not found`);
      }

      if (purchase.status === PurchaseStatus.CANCELLED) {
        throw new Error('This purchase is already cancelled');
      }

      // Restore stock for each item
      for (const item of purchase.items) {
        const stock = await transactionalEntityManager.findOne(ProductStock, {
          where: { product: { id: item.product.id } },
        });

        if (stock) {
          stock.quantity += item.quantity;
          await transactionalEntityManager.save(stock);
        }
      }

      // Update purchase status
      purchase.status = PurchaseStatus.CANCELLED;
      await transactionalEntityManager.save(purchase);

      // Create cancellation record
      const cancellationRecord = transactionalEntityManager.create(PurchaseCancellation, {
        purchase: { id: purchaseId } as any,
        customer: { id: purchase.customer.id } as any,
        reason: reason,
      });

      await transactionalEntityManager.save(cancellationRecord);

      return purchase;
    });
  },
};
