import apiClient from './axios';
import { ReadingHistory, UserBalance } from './types';

export const userService = {
  async getReadingHistory(): Promise<ReadingHistory[]> {
    try {
      const response = await apiClient.get<ReadingHistory[]>('/reading-history/');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Foydalanuvchi tizimga kirmagan
        console.warn('User not authenticated - reading history unavailable');
        return [];
      }
      throw error;
    }
  },

  async addReadingHistory(data: {
    manga: number;
    chapter: number;
    page: number;
  }): Promise<ReadingHistory> {
    try {
      const response = await apiClient.post<ReadingHistory>('/reading-history/', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Foydalanuvchi tizimga kirmagan
        console.warn('User not authenticated - cannot add reading history');
        throw new Error('Authentication required');
      }
      throw error;
    }
  },

  async addBalance(amount: string): Promise<UserBalance> {
    try {
      const response = await apiClient.post<UserBalance>('/user/add-balance/', { amount });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Foydalanuvchi tizimga kirmagan
        console.warn('User not authenticated - cannot add balance');
        throw new Error('Authentication required');
      }
      throw error;
    }
  },

  async getBalance(): Promise<UserBalance> {
    try {
      const response = await apiClient.get<UserBalance>('/user/balance/');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Balance topilmagan, default qiymat qaytarish
        return { amount: '0' };
      }
      if (error.response?.status === 401) {
        // Foydalanuvchi tizimga kirmagan
        return { amount: '0' };
      }
      throw error;
    }
  },

  // Foydalanuvchi tizimga kirganligini tekshirish uchun yordamchi funksiya
  async checkAuthentication(): Promise<boolean> {
    try {
      await apiClient.get('/user/profile/'); // yoki boshqa protected endpoint
      return true;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return false;
      }
      throw error;
    }
  }
};