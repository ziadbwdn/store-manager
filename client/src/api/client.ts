const API_BASE = 'http://localhost:3000/api';

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, any>;
}

export class ApiClient {
  static async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { method = 'GET', body } = options;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, fetchOptions);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Fallback to generic message
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, body: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  static async put<T>(endpoint: string, body: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
