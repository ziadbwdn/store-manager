import { NewPurchasePage } from './pages/NewPurchase';
import { PurchaseHistoryPage } from './pages/PurchaseHistory';

type PageName = 'new-purchase' | 'purchase-history';

class App {
  private currentPage: NewPurchasePage | PurchaseHistoryPage | null = null;

  async init(): Promise<void> {
    this.setupNavigation();
    await this.loadPage('new-purchase');
  }

  private setupNavigation(): void {
    const navButtons = document.querySelectorAll('[data-page]') as NodeListOf<HTMLElement>;
    navButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const page = btn.getAttribute('data-page') as PageName;
        this.loadPage(page);
      });
    });
  }

  private async loadPage(pageName: PageName): Promise<void> {
    // Hide all pages
    document.querySelectorAll('[data-page-content]').forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    // Update active nav
    document.querySelectorAll('[data-page]').forEach((btn) => {
      btn.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
    });

    const activeBtn = document.querySelector(`[data-page="${pageName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
    }

    // Show current page
    const pageEl = document.getElementById(`${pageName}-page`);
    if (pageEl) {
      pageEl.style.display = '';
    }

    // Initialize page
    try {
      if (pageName === 'new-purchase') {
        this.currentPage = new NewPurchasePage();
        await (this.currentPage as NewPurchasePage).init();
      } else if (pageName === 'purchase-history') {
        this.currentPage = new PurchaseHistoryPage();
        await (this.currentPage as PurchaseHistoryPage).init();
      }
    } catch (error) {
      console.error(`Failed to load page ${pageName}:`, error);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
