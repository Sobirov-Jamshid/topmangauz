import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://auth.topmanga.uz/api';
const TOKEN_REFRESH_MARGIN = Number(process.env.NEXT_PUBLIC_TOKEN_REFRESH_MARGIN) || 45;

interface TokenPair {
  access: string;
  refresh: string;
}

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ACCESS_TOKEN_KEY = 'mangaleep_access_token';
const REFRESH_TOKEN_KEY = 'mangaleep_refresh_token';
const TOKEN_EXPIRY_KEY = 'mangaleep_token_expiry';

export const getTokens = (): { access?: string; refresh?: string; expiry?: number } => {
  if (typeof window === 'undefined') {
    return {};
  }
  
  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  return {
    access: access || undefined,
    refresh: refresh || undefined,
    expiry: expiry ? parseInt(expiry, 10) : undefined,
  };
};

export const setTokens = (tokens: TokenPair): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  const decode = (token: string): any | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  };
  
  const payload = decode(tokens.access);
  const expiry = payload?.exp ? payload.exp * 1000 : Date.now() + 24 * 60 * 60 * 1000; // fallback 24h
  
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString());
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

export const clearTokensForTesting = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const refreshTokens = async (): Promise<boolean> => {
  const { refresh } = getTokens();
  
  if (!refresh) {
    return false;
  }
  
  try {
    const response = await axios.post<TokenPair>(
      `${API_URL}/auth/refresh/`,
      { refresh },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    if (response.data.access && response.data.refresh) {
      setTokens(response.data);
      return true;
    }
    
    return false;
  } catch (error) {
    clearTokens();
    return false;
  }
};

const shouldRefreshToken = (): boolean => {
  const { expiry } = getTokens();
  if (!expiry) return false;
  
  return expiry - Date.now() < TOKEN_REFRESH_MARGIN * 1000;
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const { access } = getTokens();
    
    if (shouldRefreshToken()) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        const { access: newAccess } = getTokens();
        if (newAccess) {
          config.headers.Authorization = `Bearer ${newAccess}`;
        }
      }
    } else if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeToTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshSuccess = await refreshTokens();
        
        if (refreshSuccess) {
          const { access } = getTokens();
          if (access) {
            onTokenRefreshed(access);
            
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return apiClient(originalRequest);
          }
        }
        
        clearTokens();
        isRefreshing = false;
        
        if (originalRequest.url?.includes('/auth/')) {
          return Promise.reject(error);
        }
        
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          const protectedRoutes = ['/main/profile', '/admin', '/main/read'];
          const isProtectedRoute = protectedRoutes.some(route => window.location.pathname.startsWith(route));
          
          if (isProtectedRoute) {
            window.location.href = `/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
          }
        }
        
        return Promise.reject(error);
      } catch (refreshError) {
        clearTokens();
        isRefreshing = false;
        
        if (originalRequest.url?.includes('/auth/')) {
          return Promise.reject(refreshError);
        }
        
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          const protectedRoutes = ['/main/profile', '/admin', '/main/read'];
          const isProtectedRoute = protectedRoutes.some(route => window.location.pathname.startsWith(route));
          
          if (isProtectedRoute) {
            window.location.href = `/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
          }
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status === 401 && isRefreshing && !originalRequest._retry) {
      originalRequest._retry = true;
      
      return new Promise((resolve) => {
        subscribeToTokenRefresh((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }
    
    if (error.response?.status === 401 && originalRequest._retry) {
      clearTokens();
      
      if (originalRequest.url?.includes('/auth/')) {
        return Promise.reject(error);
      }
      
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        const protectedRoutes = ['/main/profile', '/admin', '/main/read'];
        const isProtectedRoute = protectedRoutes.some(route => window.location.pathname.startsWith(route));
        
        if (isProtectedRoute) {
          window.location.href = `/auth/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 