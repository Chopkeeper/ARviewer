import { ContentItem } from './types';

const AUTH_TOKEN_KEY = 'ar-app-auth-token';
const CONTENT_ITEMS_KEY = 'ar-app-content-items';

export const api = {
  // --- AUTH ---
  login: async (username?: string, password?: string): Promise<boolean> => {
    // In a real app, this would be a network request.
    // Here, we use hardcoded credentials for demonstration.
    if (username === 'admin' && password === 'password') {
      const token = `fake-jwt-token-${Date.now()}`;
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      return true;
    }
    return false;
  },

  logout: (): void => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  },

  isLoggedIn: (): boolean => {
    return !!sessionStorage.getItem(AUTH_TOKEN_KEY);
  },

  // --- CONTENT ---
  getContentItems: async (): Promise<ContentItem[]> => {
    const itemsJson = localStorage.getItem(CONTENT_ITEMS_KEY);
    return itemsJson ? JSON.parse(itemsJson) : [];
  },

  getContentItem: async (id: string): Promise<ContentItem | null> => {
    const items = await api.getContentItems();
    return items.find(item => item.id === id) || null;
  },

  addContentItem: async (item: ContentItem): Promise<ContentItem> => {
    const items = await api.getContentItems();
    const newItems = [...items, item];
    localStorage.setItem(CONTENT_ITEMS_KEY, JSON.stringify(newItems));
    return item;
  },

  deleteContentItem: async (id: string): Promise<void> => {
    let items = await api.getContentItems();
    items = items.filter(item => item.id !== id);
    localStorage.setItem(CONTENT_ITEMS_KEY, JSON.stringify(items));
  },
};
