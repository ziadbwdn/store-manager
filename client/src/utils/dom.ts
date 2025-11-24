export const dom = {
  querySelector: <T extends Element>(selector: string): T | null => {
    return document.querySelector(selector) as T | null;
  },

  querySelectorAll: <T extends Element>(selector: string): T[] => {
    return Array.from(document.querySelectorAll(selector)) as T[];
  },

  getElementById: <T extends HTMLElement>(id: string): T | null => {
    return document.getElementById(id) as T | null;
  },

  createElement: <T extends keyof HTMLElementTagNameMap>(tag: T): HTMLElementTagNameMap[T] => {
    return document.createElement(tag);
  },

  hide: (element: HTMLElement): void => {
    element.style.display = 'none';
  },

  show: (element: HTMLElement): void => {
    element.style.display = '';
  },

  setClass: (element: HTMLElement, className: string, add: boolean): void => {
    if (add) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  },

  setText: (element: HTMLElement, text: string): void => {
    element.textContent = text;
  },

  setHTML: (element: HTMLElement, html: string): void => {
    element.innerHTML = html;
  },

  on: <T extends HTMLElement>(element: T, event: string, handler: (e: Event) => void): void => {
    element.addEventListener(event, handler);
  },

  off: <T extends HTMLElement>(element: T, event: string, handler: (e: Event) => void): void => {
    element.removeEventListener(event, handler);
  },

  showError: (message: string): void => {
    const errorDiv = dom.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  },

  showSuccess: (message: string): void => {
    const successDiv = dom.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
  },
};
