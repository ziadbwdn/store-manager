import { customersApi } from '../api/customers';
import { dom } from '../utils/dom';
import { Customer, CreateCustomerRequest } from '../types';

export class CustomersPage {
  private customers: Customer[] = [];

  async init(): Promise<void> {
    try {
      await this.loadCustomers();
      this.setupEventListeners();
    } catch (error) {
      dom.showError(`Failed to load customers: ${(error as Error).message}`);
    }
  }

  private async loadCustomers(): Promise<void> {
    this.customers = await customersApi.getAll();
    this.renderCustomers();
  }

  private renderCustomers(): void {
    const container = dom.getElementById('customers-table-body');
    if (!container) return;

    if (this.customers.length === 0) {
      container.innerHTML = '<tr><td colspan="5" class="text-center p-4">No customers found</td></tr>';
      return;
    }

    container.innerHTML = this.customers
      .map(
        (customer) => `
      <tr class="border-b">
        <td class="p-3">${customer.id}</td>
        <td class="p-3">${customer.name}</td>
        <td class="p-3">${customer.email}</td>
        <td class="p-3">${customer.phone || '-'}</td>
        <td class="p-3">${customer.city || '-'}, ${customer.state || '-'}</td>
      </tr>
    `
      )
      .join('');
  }

  private setupEventListeners(): void {
    const form = dom.getElementById<HTMLFormElement>('add-customer-form');
    const refreshBtn = dom.getElementById('refresh-btn');

    if (form) {
      dom.on(form, 'submit', (e) => this.handleSubmit(e));
    }

    if (refreshBtn) {
      dom.on(refreshBtn, 'click', () => this.loadCustomers());
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const data: CreateCustomerRequest = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || undefined,
      address: (formData.get('address') as string) || undefined,
      city: (formData.get('city') as string) || undefined,
      state: (formData.get('state') as string) || undefined,
      zipCode: (formData.get('zipCode') as string) || undefined,
      country: (formData.get('country') as string) || undefined,
    };

    // Validation
    if (!data.name || !data.email) {
      dom.showError('Name and Email are required');
      return;
    }

    try {
      const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      submitBtn.disabled = true;

      await customersApi.create(data);
      dom.showSuccess('Customer added successfully');
      form.reset();
      await this.loadCustomers();
    } catch (error) {
      dom.showError(`Failed to add customer: ${(error as Error).message}`);
    } finally {
      const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      submitBtn.disabled = false;
    }
  }
}
