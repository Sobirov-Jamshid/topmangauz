// notificationService.ts

import apiClient from './axios';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  user?: string;
}

export interface NotificationResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Notification[];
  notifications?: Notification[]; // Yangi property qo'shildi
  notification_count?: number; // Yangi property qo'shildi
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get<NotificationResponse | Notification[]>('/notifications/');
    

    
    // Handle different response formats
    if (response.data) {
      // Format 1: { notification_count: 1, notifications: [...] }
      if (typeof response.data === 'object' && 'notifications' in response.data && Array.isArray(response.data.notifications)) {

        return response.data.notifications;
      }
      // Format 2: { count: 1, results: [...] } - paginated response
      if (typeof response.data === 'object' && 'results' in response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      // Format 3: Direct array
      if (Array.isArray(response.data)) {

        return response.data;
      }
      // Format 4: { count: 1, notifications: [...] } - alternative format
      if (typeof response.data === 'object' && 'notification_count' in response.data && Array.isArray((response.data as any).notifications)) {

        return (response.data as any).notifications;
      }
      // Format 5: Single object (shouldn't happen but handle it)
      if (typeof response.data === 'object' && 'id' in response.data) {

        return [response.data as Notification];
      }
    }
    

    return [];
  } catch (error: any) {

    
    // If it's a 401 or 403, return empty array instead of throwing
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return [];
    }
    
    throw error;
  }
};

// ... qolgan funksiyalar o'zgarmaydi
export const markNotificationAsRead = async (id: string) => {
  try {

    // According to API docs, GET /notifications/{id}/ marks as read
    const response = await apiClient.get<Notification>(`/notifications/${id}/`);

    return response.data;
  } catch (error: any) {

    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    // Try POST first, if it fails, mark each individually
    const response = await apiClient.post<{ message: string }>('/notifications/mark-all-read/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteNotification = async (id: string) => {
  try {
    const response = await apiClient.delete(`/notifications/${id}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};