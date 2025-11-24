

Of course. Here is the updated comprehensive guide, incorporating the new and more detailed DDL. This new schema introduces a dedicated `customers` table and a `purchase_cancellations` table, which significantly improves data normalization and provides a better audit trail.

### **Summary of Key Changes from the DDL:**

1.  **Dedicated `customers` Table:** Customer information is now normalized into its own table. Purchases are linked to customers via a `customer_id`. This requires a change in the "New Purchase" UI to either select an existing customer or create a new one.
2.  **Dedicated `purchase_cancellations` Table:** Instead of a generic log, we now have a specific table to track cancellations, including the reason and timestamp. This replaces the previous `PurchaseLog` entity.
3.  **Updated `purchases` Table:** The `customer_name` and `customer_email` columns have been replaced by a `customer_id` foreign key.
4.  **Spelling:** The status enum now uses the British spelling `'cancelled'`. The guide will be updated to reflect this consistently.
5.  **Timestamps:** More tables now include `created_at` and `updated_at` columns, which TypeORM can manage automatically.

---

### **Phase 1: Project Setup & Dependencies**

The setup remains largely the same. Ensure you have the dependencies installed from the previous guide.

**Updated File Structure:**
```
store-admin-system/
├── src/
│   ├── controllers/
│   │   └── purchaseController.ts
│   ├── entities/
│   │   ├── Customer.ts              <-- NEW
│   │   ├── Product.ts
│   │   ├── ProductStock.ts
│   │   ├── Purchase.ts              <-- UPDATED
│   │   ├── PurchaseItem.ts
│   │   └── PurchaseCancellation.ts  <-- NEW (replaces PurchaseLog.ts)
│   ├── services/
│   │   └── purchaseService.ts       <-- UPDATED
│   ├── views/
│   │   ├── partials/
│   │   │   └── header.ejs
│   │   ├── newPurchase.ejs          <-- UPDATED
│   │   └── purchaseHistory.ejs      <-- UPDATED
│   ├── public/
│   │   ├── css/
│   │   │   └── output.css
│   │   └── ts/
│   │       └── main.ts             <-- UPDATED
│   ├── index.ts
│   └── ormconfig.json
├── .env
├── package.json
└── tsconfig.json
```

---

### **Phase 2: Server-Side Implementation (Node.js, Express, TypeORM)**

#### **1. Define ORM Models (Entities)**

Update your entities in `src/entities/` to match the new DDL.

**`src/entities/Customer.ts` (New)**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Purchase } from './Purchase';
import { PurchaseCancellation } from './PurchaseCancellation';

@Entity()
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    state: string;

    @Column({ nullable: true })
    zipCode: string;

    @Column({ nullable: true })
    country: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Purchase, purchase => purchase.customer)
    purchases: Purchase[];

    @OneToMany(() => PurchaseCancellation, cancellation => cancellation.customer)
    cancellations: PurchaseCancellation[];
}
```

**`src/entities/Product.ts` (Updated with `@UpdateDateColumn`)**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductStock } from './ProductStock';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    sku: string;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => ProductStock, stock => stock.product, { cascade: true })
    stock: ProductStock;
}
```

**`src/entities/Purchase.ts` (Updated with Customer relationship)**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from './Customer';
import { PurchaseItem } from './PurchaseItem';
import { PurchaseCancellation } from './PurchaseCancellation';

export enum PurchaseStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled' // Use 'cancelled' as per DDL
}

@Entity()
export class Purchase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    totalAmount: number;

    @Column({
        type: 'enum',
        enum: PurchaseStatus,
        default: PurchaseStatus.PENDING
    })
    status: PurchaseStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Customer, customer => customer.purchases, { onDelete: 'RESTRICT' })
    customer: Customer;

    @OneToMany(() => PurchaseItem, item => item.purchase, { cascade: true })
    items: PurchaseItem[];

    @OneToMany(() => PurchaseCancellation, cancellation => cancellation.purchase)
    cancellationRecord: PurchaseCancellation[];
}
```

**`src/entities/PurchaseCancellation.ts` (New, replaces PurchaseLog)**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Purchase } from './Purchase';
import { Customer } from './Customer';

@Entity()
export class PurchaseCancellation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true })
    reason: string;

    @CreateDateColumn()
    cancelledAt: Date;

    @ManyToOne(() => Purchase, purchase => purchase.cancellationRecord, { onDelete: 'CASCADE' })
    purchase: Purchase;

    @ManyToOne(() => Customer, customer => customer.cancellations, { onDelete: 'RESTRICT' })
    customer: Customer;
}
```

*The `ProductStock.ts` and `PurchaseItem.ts` entities remain mostly the same, but you can add `@CreateDateColumn` to `PurchaseItem` if you wish.*

#### **2. MVC Architecture (Updated)**

**Controller (C):** The controller now needs to handle fetching customers and processing more complex form data.

**`src/controllers/purchaseController.ts` (Updated)**
```typescript
import { Request, Response } from 'express';
import { AppDataSource } from '../index';
import { Customer } from '../entities/Customer';
import { Product } from '../entities/Product';
import { purchaseService } from '../services/purchaseService';

const customerRepository = AppDataSource.getRepository(Customer);
const productRepository = AppDataSource.getRepository(Product);

export const getNewPurchasePage = async (req: Request, res: Response) => {
    const customers = await customerRepository.find();
    const products = await productRepository.find({ relations: ['stock'] });
    res.render('newPurchase', { customers, products });
};

export const createPurchase = async (req: Request, res: Response) => {
    try {
        const { customerAction, customerId, newCustomer } = req.body;
        let finalCustomerId: number;

        if (customerAction === 'select') {
            finalCustomerId = parseInt(customerId, 10);
        } else {
            // Create a new customer
            const newCustomerEntity = customerRepository.create(newCustomer);
            const savedCustomer = await customerRepository.save(newCustomerEntity);
            finalCustomerId = savedCustomer.id;
        }
        
        // The items array needs to be parsed if sent as JSON string from a dynamic form
        const items = JSON.parse(req.body.items); 

        await purchaseService.createPurchase(finalCustomerId, items);
        res.redirect('/purchase-history');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating purchase: ' + error.message);
    }
};

// ... getPurchaseHistory and cancelPurchase will be updated in the service layer
export const getPurchaseHistory = async (req: Request, res: Response) => {
    const purchaseRepository = AppDataSource.getRepository(Purchase);
    const purchases = await purchaseRepository.find({
        relations: ['customer', 'items', 'items.product'],
        order: { createdAt: 'DESC' }
    });
    res.render('purchaseHistory', { purchases });
};

export const cancelPurchase = async (req: Request, res: Response) => {
    try {
        const purchaseId = parseInt(req.params.id, 10);
        const { reason } = req.body;
        await purchaseService.cancelPurchase(purchaseId, reason);
        res.redirect('/purchase-history');
    } catch (error) {
        res.status(500).send('Error canceling purchase: ' + error.message);
    }
};
```

**Service Layer (Updated):** The business logic now handles customer creation and specific cancellation records.

**`src/services/purchaseService.ts` (Updated)**
```typescript
import { AppDataSource } from '../index';
import { Purchase, PurchaseStatus } from '../entities/Purchase';
import { PurchaseItem } from '../entities/PurchaseItem';
import { PurchaseCancellation } from '../entities/PurchaseCancellation';
import { ProductStock } from '../entities/ProductStock';

const purchaseRepository = AppDataSource.getRepository(Purchase);
const productStockRepository = AppDataSource.getRepository(ProductStock);
const cancellationRepository = AppDataSource.getRepository(PurchaseCancellation);

export const purchaseService = {
    async createPurchase(customerId: number, items: any[]) {
        return await AppDataSource.transaction(async transactionalEntityManager => {
            let totalAmount = 0;
            const purchaseItemsToCreate = [];

            for (const item of items) {
                const stock = await transactionalEntityManager.findOne(ProductStock, {
                    where: { product: { id: item.productId } },
                    relations: ['product']
                });

                if (!stock || stock.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product ID: ${item.productId}`);
                }

                stock.quantity -= item.quantity;
                await transactionalEntityManager.save(stock);

                const itemTotal = stock.product.price * item.quantity;
                totalAmount += itemTotal;

                purchaseItemsToCreate.push(
                    transactionalEntityManager.create(PurchaseItem, {
                        quantity: item.quantity,
                        priceAtPurchase: stock.product.price,
                        product: stock.product
                    })
                );
            }

            const newPurchase = transactionalEntityManager.create(Purchase, {
                customer: { id: customerId }, // Use customer object with id
                totalAmount,
                status: PurchaseStatus.COMPLETED,
                items: purchaseItemsToCreate
            });

            return await transactionalEntityManager.save(newPurchase);
        });
    },

    async cancelPurchase(purchaseId: number, reason: string) {
        return await AppDataSource.transaction(async transactionalEntityManager => {
            const purchase = await transactionalEntityManager.findOne(Purchase, {
                where: { id: purchaseId },
                relations: ['items', 'items.product', 'customer']
            });

            if (!purchase || purchase.status === PurchaseStatus.CANCELLED) {
                throw new Error('Purchase not found or already cancelled.');
            }

            // Restore stock
            for (const item of purchase.items) {
                await transactionalEntityManager.increment(ProductStock, { product: { id: item.product.id } }, 'quantity', item.quantity);
            }

            // Update status
            purchase.status = PurchaseStatus.CANCELLED;
            await transactionalEntityManager.save(purchase);

            // Create cancellation record
            const cancellationRecord = transactionalEntityManager.create(PurchaseCancellation, {
                purchase: { id: purchaseId },
                customer: { id: purchase.customer.id },
                reason: reason
            });
            await transactionalEntityManager.save(cancellationRecord);
            
            return purchase;
        });
    }
};
```

#### **3. View (V): EJS Templates (Updated)**

The "New Purchase" form is now more complex to handle customer selection/creation.

**`src/views/newPurchase.ejs` (Updated)**
```html
<%- include('partials/header') %>

<h1 class="text-2xl font-bold mb-4">Create New Purchase</h1>
<form id="purchase-form" action="/purchases" method="POST" class="bg-white p-6 rounded-lg shadow-md">
    
    <!-- Customer Selection Section -->
    <div class="mb-6 p-4 border rounded">
        <h2 class="text-xl font-semibold mb-2">Customer Information</h2>
        <div class="mb-2">
            <label class="inline-flex items-center">
                <input type="radio" name="customerAction" value="select" checked class="form-radio" onchange="toggleCustomerForm()">
                <span class="ml-2">Select Existing Customer</span>
            </label>
            <label class="inline-flex items-center ml-6">
                <input type="radio" name="customerAction" value="create" class="form-radio" onchange="toggleCustomerForm()">
                <span class="ml-2">Create New Customer</span>
            </label>
        </div>

        <!-- Select Existing Customer -->
        <div id="select-customer-form">
            <label for="customerId" class="block text-gray-700">Customer</label>
            <select id="customerId" name="customerId" class="w-full p-2 border rounded">
                <% customers.forEach(customer => { %>
                    <option value="<%= customer.id %>"><%= customer.name %> (<%= customer.email %>)</option>
                <% }) %>
            </select>
        </div>

        <!-- Create New Customer -->
        <div id="create-customer-form" class="hidden space-y-2">
            <input type="text" name="newCustomer[name]" placeholder="Name" class="w-full p-2 border rounded">
            <input type="email" name="newCustomer[email]" placeholder="Email" class="w-full p-2 border rounded">
            <input type="text" name="newCustomer[phone]" placeholder="Phone" class="w-full p-2 border rounded">
            <!-- Add other fields as needed -->
        </div>
    </div>

    <!-- Product List (dynamically managed by client-side JS) -->
    <div id="items-container" class="mb-4">
        <!-- The item rows will be generated by client-side JS based on the 'products' data -->
    </div>
    <button type="button" id="add-item-btn" class="bg-green-500 text-white px-4 py-2 rounded mb-4">Add Item</button>

    <!-- Hidden input to store items as JSON string -->
    <input type="hidden" name="items" id="items-json">

    <div class="flex justify-between items-center">
        <div>
            <p>Total Items: <span id="total-items">0</span></p>
            <p>Order Total: $<span id="order-total">0.00</span></p>
        </div>
        <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded">Complete Purchase</button>
    </div>
</form>

<!-- Pass product data to the client-side script -->
<script>
    const productsData = <%- JSON.stringify(products) %>;
</script>

</main>
</body>
</html>
```

**`src/views/purchaseHistory.ejs` (Updated with cancellation form)**
```html
<%- include('partials/header') %>
<!-- ... (table header remains the same) ... -->
<% if (purchases.length === 0) { %>
    <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <p>No purchase history yet. Create your first purchase!</p>
    </div>
<% } else { %>
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="w-full">
            <!-- ... (thead section remains the same) ... -->
            <tbody>
                <% purchases.forEach(purchase => { %>
                    <tr class="border-b">
                        <td class="p-2"><%= purchase.id %></td>
                        <td class="p-2"><%= purchase.customer.name %></td>
                        <td class="p-2"><%= new Date(purchase.createdAt).toLocaleDateString() %></td>
                        <td class="p-2">$<%= purchase.totalAmount.toFixed(2) %></td>
                        <td class="p-2">
                            <span class="px-2 py-1 rounded text-xs font-semibold
                                <%= purchase.status === 'completed' ? 'bg-green-200 text-green-800' : '' %>
                                <%= purchase.status === 'cancelled' ? 'bg-red-200 text-red-800' : '' %>
                                <%= purchase.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : '' %>
                            ">
                                <%= purchase.status.toUpperCase() %>
                            </span>
                        </td>
                        <td class="p-2">
                            <% if (purchase.status !== 'cancelled') { %>
                                <!-- Button to trigger a modal/form for cancellation -->
                                <button onclick="showCancellationForm(<%= purchase.id %>)" class="bg-red-500 text-white px-3 py-1 rounded text-sm">Cancel</button>
                            <% } %>
                        </td>
                    </tr>
                <% }) %>
            </tbody>
        </table>
    </div>
<% } %>

<!-- Cancellation Modal (hidden by default) -->
<div id="cancellation-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
            <h3 class="text-lg font-medium text-gray-900">Cancel Purchase</h3>
            <form id="cancel-purchase-form" action="" method="POST">
                <input type="hidden" id="cancel-purchase-id" name="">
                <div class="mt-2">
                    <label for="reason" class="block text-gray-700">Reason for Cancellation</label>
                    <textarea id="reason" name="reason" rows="4" class="w-full p-2 border rounded" required></textarea>
                </div>
                <div class="items-center px-4 py-3">
                    <button id="confirm-cancel-btn" type="submit" class="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700">Confirm Cancel</button>
                    <button onclick="hideCancellationForm()" type="button" class="mt-2 w-full px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300">Close</button>
                </div>
            </form>
        </div>
    </div>
</div>

</main>
</body>
</html>
```

---

### **Phase 3: Client-Side Implementation (Updated Vanilla TS)**

The client-side script now needs to handle the more complex form and populate product data dynamically.

**`src/public/ts/main.ts` (Updated)**
```typescript
document.addEventListener('DOMContentLoaded', () => {
    const addItemBtn = document.getElementById('add-item-btn');
    const itemsContainer = document.getElementById('items-container');
    const totalItemsSpan = document.getElementById('total-items');
    const orderTotalSpan = document.getElementById('order-total');
    const purchaseForm = document.getElementById('purchase-form') as HTMLFormElement;
    const itemsJsonInput = document.getElementById('items-json') as HTMLInputElement;

    if (!addItemBtn || !itemsContainer || !totalItemsSpan || !orderTotalSpan || !purchaseForm) return;

    let itemCount = 0;

    // --- State Management ---
    const getFormState = () => {
        const rows = itemsContainer.querySelectorAll('.item-row');
        const state = [];
        rows.forEach(row => {
            const select = row.querySelector('.product-select') as HTMLSelectElement;
            const quantityInput = row.querySelector('.quantity-input') as HTMLInputElement;
            const productId = parseInt(select.value, 10);
            const quantity = parseInt(quantityInput.value, 10);
            const product = productsData.find(p => p.id === productId);
            const price = product ? product.price : 0;

            state.push({ productId, quantity, price });
        });
        return state;
    };

    // --- DOM Manipulation ---
    const updateTotals = () => {
        const state = getFormState();
        const totalItems = state.reduce((sum, item) => sum + item.quantity, 0);
        const orderTotal = state.reduce((sum, item) => sum + (item.quantity * item.price), 0);

        totalItemsSpan.textContent = totalItems.toString();
        orderTotalSpan.textContent = orderTotal.toFixed(2);
    };

    const addNewItemRow = () => {
        const newRow = document.createElement('div');
        newRow.className = 'item-row flex gap-2 mb-2';
        newRow.innerHTML = `
            <select name="items[${itemCount}][productId]" class="product-select flex-grow p-2 border rounded">
                ${productsData.map(product => `<option value="${product.id}">${product.name} ($${product.price})</option>`).join('')}
            </select>
            <input type="number" name="items[${itemCount}][quantity]" value="1" min="1" class="quantity-input w-20 p-2 border rounded">
            <button type="button" class="remove-item-btn bg-red-500 text-white px-3 py-1 rounded">Remove</button>
        `;
        itemsContainer.appendChild(newRow);
        attachRowEventListeners(newRow);
        updateTotals();
        itemCount++;
    };

    const removeItemRow = (event: Event) => {
        const target = event.target as HTMLButtonElement;
        const row = target.closest('.item-row');
        if (row && itemsContainer.querySelectorAll('.item-row').length > 1) {
            row.remove();
            updateTotals();
        }
    };

    const attachRowEventListeners = (row: HTMLElement) => {
        row.querySelector('.remove-item-btn').addEventListener('click', removeItemRow);
        row.querySelector('.product-select').addEventListener('change', updateTotals);
        row.querySelector('.quantity-input').addEventListener('input', updateTotals);
    };
    
    // --- Event Listeners ---
    addItemBtn.addEventListener('click', addNewItemRow);

    purchaseForm.addEventListener('submit', (e) => {
        itemsJsonInput.value = JSON.stringify(getFormState());
    });

    // --- Customer Form Toggle ---
    window.toggleCustomerForm = function() {
        const selectForm = document.getElementById('select-customer-form');
        const createForm = document.getElementById('create-customer-form');
        const action = document.querySelector('input[name="customerAction"]:checked') as HTMLInputElement;
        
        if (action.value === 'select') {
            selectForm.classList.remove('hidden');
            createForm.classList.add('hidden');
        } else {
            selectForm.classList.add('hidden');
            createForm.classList.remove('hidden');
        }
    };

    // --- Cancellation Modal ---
    window.showCancellationForm = function(purchaseId: number) {
        const modal = document.getElementById('cancellation-modal');
        const form = document.getElementById('cancel-purchase-form') as HTMLFormElement;
        form.action = `/purchases/${purchaseId}/cancel`;
        modal.classList.remove('hidden');
    };

    window.hideCancellationForm = function() {
        const modal = document.getElementById('cancellation-modal');
        modal.classList.add('hidden');
    };
    
    // Initial setup
    addNewItemRow(); // Add the first row on load
});
```

---

### **Phase 4: Running the Application**

1.  **Update Database:** Before running the app, execute the new DDL script on your PostgreSQL database to update the schema.
2.  **Start Tailwind CSS Watcher:**
    ```bash
    npx tailwindcss -i ./src/public/css/input.css -o ./src/public/css/output.css --watch
    ```
3.  **Run the Server:**
    ```bash
    npm run dev
    ```
4.  Open your browser to `http://localhost:3000` to see the updated application.
