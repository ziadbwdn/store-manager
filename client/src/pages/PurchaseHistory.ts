import { purchasesApi } from '../api/purchases';
import { dom } from '../utils/dom';
import { Purchase, PurchaseStatus } from '../types';

export class PurchaseHistoryPage {
  private purchases: Purchase[] = [];

  async init(): Promise<void> {
    try {
      await this.loadPurchases();
      this.setupEventListeners();
    } catch (error) {
      dom.showError(`Failed to load purchases: ${(error as Error).message}`);
    }
  }

  private async loadPurchases(): Promise<void> {
    this.purchases = await purchasesApi.getAll();
    this.renderPurchases();
  }

  private renderPurchases(): void {
    const container = dom.getElementById('purchases-table-body');
    if (!container) return;

    if (this.purchases.length === 0) {
      container.innerHTML = '<tr><td colspan="6" class="text-center p-4">No purchases found</td></tr>';
      return;
    }

    container.innerHTML = this.purchases
      .map(
        (purchase) => `
      <tr class="border-b">
        <td class="p-3">${purchase.id}</td>
        <td class="p-3">${purchase.customer.name}</td>
        <td class="p-3">${new Date(purchase.createdAt).toLocaleDateString()}</td>
        <td class="p-3">$${Number(purchase.totalAmount).toFixed(2)}</td>
        <td class="p-3">
          <span class="px-2 py-1 rounded text-xs font-semibold ${this.getStatusClass(purchase.status)}">
            ${purchase.status.toUpperCase()}
          </span>
        </td>
        <td class="p-3">
          ${purchase.status === PurchaseStatus.COMPLETED ? `<button class="bg-red-500 text-white px-3 py-1 rounded text-sm cancel-btn" data-purchase-id="${purchase.id}">Cancel</button>` : ''}
        </td>
      </tr>
    `
      )
      .join('');

    this.querySelectorAll<HTMLButtonElement>('.cancel-btn').forEach((btn) => {
      dom.on(btn, 'click', (e) => this.handleCancel(e));
    });
  }

  private getStatusClass(status: PurchaseStatus): string {
    switch (status) {
      case PurchaseStatus.COMPLETED:
        return 'bg-green-200 text-green-800';
      case PurchaseStatus.CANCELLED:
        return 'bg-red-200 text-red-800';
      case PurchaseStatus.PENDING:
        return 'bg-yellow-200 text-yellow-800';
      default:
        return '';
    }
  }

  private setupEventListeners(): void {
    const refreshBtn = dom.getElementById('refresh-btn');
    if (refreshBtn) {
      dom.on(refreshBtn, 'click', () => this.loadPurchases());
    }
  }

  private async handleCancel(e: Event): Promise<void> {
    const btn = e.target as HTMLButtonElement;
    const purchaseId = parseInt(btn.getAttribute('data-purchase-id') || '0', 10);

    const reason = prompt('Enter cancellation reason (optional):');
    if (reason === null) return; // User cancelled the dialog

    try {
      await purchasesApi.cancel(purchaseId, { reason: reason || undefined });
      dom.showSuccess('Purchase cancelled successfully');
      await this.loadPurchases();
    } catch (error) {
      dom.showError(`Failed to cancel purchase: ${(error as Error).message}`);
    }
  }

  private querySelectorAll<T extends Element>(selector: string): T[] {
    return Array.from(document.querySelectorAll(selector)) as T[];
  }
}
