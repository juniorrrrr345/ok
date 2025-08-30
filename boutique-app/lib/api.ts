const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  farm_id: number;
  category_name?: string;
  farm_name?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Farm {
  id: number;
  name: string;
}

export interface Config {
  background_url: string;
  logo_url: string;
  shop_name: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  info_text: string;
  instagram_url: string;
  telegram_url: string;
  facebook_url: string;
  twitter_url: string;
}

export interface CarouselImage {
  id: number;
  image_url: string;
  title: string;
  order_index: number;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return this.token || localStorage.getItem('admin_token');
    }
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  private async fetch(url: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  // Public methods
  async getProducts(category?: string, farm?: string): Promise<{ products: Product[] }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (farm) params.append('farm', farm);
    
    return this.fetch(`/api/products?${params}`);
  }

  async getCategories(): Promise<{ categories: Category[] }> {
    return this.fetch('/api/categories');
  }

  async getFarms(): Promise<{ farms: Farm[] }> {
    return this.fetch('/api/farms');
  }

  async getConfig(): Promise<{ config: Config }> {
    return this.fetch('/api/config');
  }

  async getCarousel(): Promise<{ images: CarouselImage[] }> {
    return this.fetch('/api/carousel');
  }

  // Admin methods
  async login(password: string): Promise<{ token: string; success: boolean }> {
    const result = await this.fetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    
    if (result.token) {
      this.setToken(result.token);
    }
    
    return result;
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<{ success: boolean; id: number }> {
    return this.fetch('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<{ success: boolean }> {
    return this.fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number): Promise<{ success: boolean }> {
    return this.fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  async createCategory(name: string): Promise<{ success: boolean; id: number }> {
    return this.fetch('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteCategory(id: number): Promise<{ success: boolean }> {
    return this.fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async createFarm(name: string): Promise<{ success: boolean; id: number }> {
    return this.fetch('/api/admin/farms', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async deleteFarm(id: number): Promise<{ success: boolean }> {
    return this.fetch(`/api/admin/farms/${id}`, {
      method: 'DELETE',
    });
  }

  async updateConfig(config: Partial<Config>): Promise<{ success: boolean }> {
    return this.fetch('/api/admin/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async addCarouselImage(image: { image_url: string; title?: string; order_index?: number }): Promise<{ success: boolean; id: number }> {
    return this.fetch('/api/admin/carousel', {
      method: 'POST',
      body: JSON.stringify(image),
    });
  }

  async deleteCarouselImage(id: number): Promise<{ success: boolean }> {
    return this.fetch(`/api/admin/carousel/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/api/admin/upload`, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }
}

export const api = new ApiClient();