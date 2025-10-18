import { ContentItem } from './types';

// ที่อยู่ของ Backend API ของคุณ
// ในระหว่างการพัฒนา อาจจะเป็น 'http://localhost:4000'
const API_BASE_URL = '/api'; // ใช้ relative path ถ้า Frontend และ Backend อยู่บนโดเมนเดียวกัน

const AUTH_TOKEN_KEY = 'ar-app-auth-token';

export const api = {
  // --- AUTH ---
  login: async (username?: string, password?: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      const { token } = await response.json();
      if (token) {
        sessionStorage.setItem(AUTH_TOKEN_KEY, token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  logout: (): void => {
    // ควรมีการเรียก API เพื่อ invalidate token ที่ฝั่ง server ด้วย
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  },

  isLoggedIn: (): boolean => {
    return !!sessionStorage.getItem(AUTH_TOKEN_KEY);
  },

  // --- CONTENT ---
  getContentItems: async (): Promise<ContentItem[]> => {
    try {
      const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch items');
      return await response.json();
    } catch (error) {
      console.error('Get content items failed:', error);
      return []; // คืนค่า array ว่างเมื่อเกิดข้อผิดพลาด
    }
  },

  getContentItem: async (id: string): Promise<ContentItem | null> => {
     try {
      const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch item');
      return await response.json();
    } catch (error) {
      console.error(`Get content item ${id} failed:`, error);
      return null;
    }
  },

  // การเพิ่มข้อมูลจะซับซ้อนขึ้น เพราะต้องส่งไฟล์
  addContentItem: async (name: string, modelFile: File, audioFile: File, qrCodeUrl: string): Promise<ContentItem | null> => {
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('modelFile', modelFile);
    formData.append('audioFile', audioFile);
    formData.append('qrCodeUrl', qrCodeUrl); // อาจจะให้ server สร้าง QR code เอง

    try {
        const response = await fetch(`${API_BASE_URL}/items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // ไม่ต้องใส่ 'Content-Type', browser จะใส่ให้เองเมื่อใช้ FormData
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to add content item');
        }
        return await response.json();
    } catch (error) {
        console.error('Add content item failed:', error);
        return null;
    }
  },

  deleteContentItem: async (id: string): Promise<void> => {
    try {
      const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
    } catch (error) {
      console.error(`Delete content item ${id} failed:`, error);
    }
  },
};
