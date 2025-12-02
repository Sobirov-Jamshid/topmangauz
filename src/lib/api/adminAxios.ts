import axios from 'axios';
import { API_URL } from './constants';

const ACCESS_KEY = "admin_token";
const REFRESH_KEY = "admin_refresh";

export interface TokenPair {
  access: string;
  refresh: string;
}

export function getAdminTokens(): { access?: string; refresh?: string } {
  if (typeof window === "undefined") return {};
  return {
    access: localStorage.getItem(ACCESS_KEY) || undefined,
    refresh: localStorage.getItem(REFRESH_KEY) || undefined,
  };
}

export function setAdminTokens(pair: TokenPair) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, pair.access);
  localStorage.setItem(REFRESH_KEY, pair.refresh);
}

export function clearAdminTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

const adminAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminAxios.interceptors.request.use(
  (config) => {
    const { access } = getAdminTokens();

    if (access) {
      config.headers['Authorization'] = `Bearer ${access}`;
    }
    
  return config;
  },
  (error) => Promise.reject(error)
);

adminAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const originalRequest = error.config;
      
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const { refresh } = getAdminTokens();
          if (refresh) {
            const response = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
            if (response.data.access) {
              setAdminTokens({
                access: response.data.access,
                refresh: response.data.refresh || refresh
              });
              
              originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
              return adminAxios(originalRequest);
            }
          }
        } catch (refreshError) {
          clearAdminTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const adminApi = adminAxios;

export default adminAxios; 