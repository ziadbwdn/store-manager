import { customersApi } from '../api/customers';
import { productsApi } from '../api/products';
import { purchasesApi } from '../api/purchases';
import { dom } from '../utils/dom';
import { Customer, Product } from '../types';

export class NewPurchasePage {
  private customers: Customer[] = [];
  private products: Product[] = [];
  private selectedItems: Map<number, number> = new Map(); // productId -> quantity

  async init(): Promise<void> {
    try {
      await this.loadData();
      this.setupEventListeners();
    } catch (error) {
      dom.showError(`Failed to load page: ${(error as Error).message}`);
    }
  }

  private async loadData(): Promise<void> {
    this.customers = await customersApi.getAll();
    this.products = await productsApi.getAll();
    this.renderCustomerSelect();
    this.renderProductSelect();
  }

  private renderCustomerSelect(): void {
    const select = dom.getElementById<HTMLSelectElement>('customer-select');
    if (!select) return;

    select.innerHTML = '<option value="">-- Select Customer --</option>';
    this.customers.forEach((customer) => {
      const option = dom.createElement('option');
      option.value = customer.id.toString();
      option.textContent = `${customer.name} (${customer.email})`;
      select.appendChild(option);
    });
  }

  private renderProductSelect(): void {
    const container = dom.getElementById('product-list');
    if (!container) return;

    container.innerHTML = '';
    this.products.forEach((product) => {
      const div = dom.createElement('div');
      div.className = 'flex gap-2 mb-2 p-2 border rounded';
      div.innerHTML = `
        <div class="flex-grow">
          <p class="font-semibold">${product.name}</p>
          <p class="text-sm text-gray-600">SKU: ${product.sku} | Price: $${Number(product.price).toFixed(2)} | Stock: ${product.stock.quantity}</p>
        </div>
        <input type="number" min="0" max="${product.stock.quantity}" value="0" class="product-qty w-20 p-2 border rounded" data-product-id="${product.id}" placeholder="Qty">
      `;
      container.appendChild(div);
    });

    this.querySelectorAll<HTMLInputElement>('.product-qty').forEach((input) => {
      dom.on(input, 'change', (e) => this.updateSelectedItems(e));
    });
  }

  private updateSelectedItems(e: Event): void {
    const input = e.target as HTMLInputElement;
    const productId = parseInt(input.getAttribute('data-product-id') || '0', 10);
    const quantity = parseInt(input.value || '0', 10);

    if (quantity > 0) {
      this.selectedItems.set(productId, quantity);
    } else {
      this.selectedItems.delete(productId);
    }

    this.updateOrderTotal();
  }

  private updateOrderTotal(): void {
    let total = 0;
    let itemCount = 0;

    this.selectedItems.forEach((qty, productId) => {
      const product = this.products.find((p) => p.id === productId);
      if (product) {
        total += Number(product.price) * qty;
        itemCount += qty;
      }
    });

    const totalEl = dom.getElementById('order-total');
    const countEl = dom.getElementById('item-count');
    if (totalEl) totalEl.textContent = total.toFixed(2);
    if (countEl) countEl.textContent = itemCount.toString();
  }

  private setupEventListeners(): void {
    // Submit purchase button
    const submitBtn = dom.getElementById('submit-btn');
    if (submitBtn) {
      dom.on(submitBtn, 'click', () => this.handleSubmit());
    }

    // Modal buttons
    const addCustomerBtn = dom.getElementById('add-customer-btn');
    const closeModalBtn = dom.getElementById('close-modal-btn');
    const cancelModalBtn = dom.getElementById('cancel-modal-btn');
    const submitCustomerBtn = dom.getElementById('submit-customer-btn');
    const modal = dom.getElementById('add-customer-modal');

    if (addCustomerBtn) {
      dom.on(addCustomerBtn, 'click', () => this.openModal());
    }

    if (closeModalBtn) {
      dom.on(closeModalBtn, 'click', () => this.closeModal());
    }

    if (cancelModalBtn) {
      dom.on(cancelModalBtn, 'click', () => this.closeModal());
    }

    if (submitCustomerBtn) {
      dom.on(submitCustomerBtn, 'click', () => this.submitCustomerForm());
    }

    // Close modal when clicking outside
    if (modal) {
      dom.on(modal, 'click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }
  }

  private openModal(): void {
    const modal = dom.getElementById('add-customer-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  private closeModal(): void {
    const modal = dom.getElementById('add-customer-modal');
    if (modal) {
      modal.classList.add('hidden');
      const form = dom.getElementById<HTMLFormElement>('add-customer-form');
      if (form) {
        form.reset();
      }
    }
  }

  private async submitCustomerForm(): Promise<void> {
    const form = dom.getElementById<HTMLFormElement>('add-customer-form');
    if (!form) return;

    const name = (dom.getElementById<HTMLInputElement>('modal-name') as HTMLInputElement).value;
    const email = (dom.getElementById<HTMLInputElement>('modal-email') as HTMLInputElement).value;
    const phone = (dom.getElementById<HTMLInputElement>('modal-phone') as HTMLInputElement).value;
    const address = (dom.getElementById<HTMLInputElement>('modal-address') as HTMLInputElement).value;
    const city = (dom.getElementById<HTMLInputElement>('modal-city') as HTMLInputElement).value;
    const state = (dom.getElementById<HTMLInputElement>('modal-state') as HTMLInputElement).value;
    const zipCode = (dom.getElementById<HTMLInputElement>('modal-zipCode') as HTMLInputElement).value;
    const country = (dom.getElementById<HTMLInputElement>('modal-country') as HTMLInputElement).value;

    if (!name || !email) {
      dom.showError('Name and Email are required');
      return;
    }

    try {
      const submitBtn = dom.getElementById('submit-customer-btn') as HTMLButtonElement;
      submitBtn.disabled = true;

      const newCustomer = await customersApi.create({
        name,
        email,
        phone: phone || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        zipCode: zipCode || undefined,
        country: country || undefined,
      });

      // Add to customers list and select it
      this.customers.push(newCustomer);
      this.renderCustomerSelect();

      // Select the new customer
      const select = dom.getElementById<HTMLSelectElement>('customer-select');
      if (select) {
        select.value = newCustomer.id.toString();
      }

      dom.showSuccess(`Customer "${newCustomer.name}" added successfully`);
      this.closeModal();
    } catch (error) {
      dom.showError(`Failed to add customer: ${(error as Error).message}`);
    } finally {
      const submitBtn = dom.getElementById('submit-customer-btn') as HTMLButtonElement;
      submitBtn.disabled = false;
    }
  }

  private async handleSubmit(): Promise<void> {
    const customerId = dom.querySelector<HTMLSelectElement>('#customer-select')?.value;

    if (!customerId) {
      dom.showError('Please select a customer');
      return;
    }

    if (this.selectedItems.size === 0) {
      dom.showError('Please select at least one product');
      return;
    }

    try {
      const items = Array.from(this.selectedItems).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      const purchase = await purchasesApi.create({
        customerId: parseInt(customerId, 10),
        items,
      });

      dom.showSuccess(`Purchase created successfully! ID: ${purchase.id}`);
      this.resetForm();
    } catch (error) {
      dom.showError(`Failed to create purchase: ${(error as Error).message}`);
    }
  }

  private resetForm(): void {
    const select = dom.querySelector<HTMLSelectElement>('#customer-select');
    if (select) select.value = '';

    this.querySelectorAll<HTMLInputElement>('.product-qty').forEach((input) => {
      input.value = '0';
    });

    this.selectedItems.clear();
    this.updateOrderTotal();
  }

  private querySelectorAll<T extends Element>(selector: string): T[] {
    return Array.from(document.querySelectorAll(selector)) as T[];
  }
}
