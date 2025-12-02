"use client";

import { useState, useEffect } from "react";
import { adminApi, setAdminTokens, clearAdminTokens, getAdminTokens, TokenPair } from "@/lib/api/adminAxios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/lib/api/types";

export function useAdminAuth() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const { access } = getAdminTokens();
    setIsAuthenticated(!!access);
  }, []);

  const {
    data: me,
    isLoading: loadingMe,
    error: meError,
  } = useQuery({
    queryKey: ["adminMe"],
    queryFn: async () => {
      try {
        const res = await adminApi.get<User>("/auth/me/");
        
        // Agar is_staff mavjud bo'lsa, to'g'ridan-to'g'ri qaytarish
        if (res.data.is_staff !== undefined) {
          return res.data;
        }
        
        // Aks holda, admin endpoint dan to'liq ma'lumot olish
        try {
          const adminUserRes = await adminApi.get<User>(`/auth/admin/users/${res.data.id}/`);
          return adminUserRes.data;
        } catch {
          // Agar admin endpoint ishlamasa, oddiy user ma'lumotini qaytarish
          return res.data;
        }
      } catch (error: any) {
        // 401 xatolikda tokenlarni tozalash
        if (error?.response?.status === 401) {
          clearAdminTokens();
          setIsAuthenticated(false);
        }
        throw error;
      }
    },
    enabled: isAuthenticated === true,
    retry: false,
  });

  const { mutateAsync: login, isPending: loggingIn, error: loginError } = useMutation({
    mutationFn: async (payload: { username: string; password: string }) => {
      try {
        const loginRes = await adminApi.post<TokenPair>("/auth/admin/login/", payload);
        
        setAdminTokens(loginRes.data);
        
        const userRes = await adminApi.get<User>("/auth/me/");
        
        // Get full user data with admin privileges from admin endpoint
        const adminUserRes = await adminApi.get<User>(`/auth/admin/users/${userRes.data.id}/`);
        
        // Backend turli formatlarda is_staff qaytarishi mumkin - barchasini tekshiramiz
        const isStaff = 
          adminUserRes.data.is_staff === true || 
          adminUserRes.data.is_staff === 'true' || 
          (adminUserRes.data.is_staff as any) === 'True' ||
          (adminUserRes.data.is_staff as any) === 1 ||
          (adminUserRes.data.is_staff as any) === '1' ||
          (adminUserRes.data as any).is_superuser === true;
        
        
        if (!isStaff) {
          clearAdminTokens();
          setIsAuthenticated(false);
          const error: any = new Error('Sizda admin paneliga kirish huquqi yo\'q!');
          error.isStaffError = true;
          throw error;
        }
        
        setIsAuthenticated(true);
        return loginRes.data;
      } catch (error: any) {
        // Silent fail
        clearAdminTokens();
        setIsAuthenticated(false);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMe"] });
    },
    onError: (error: any) => {
      // Silent fail
      clearAdminTokens();
      setIsAuthenticated(false);
    },
  });

  const logout = () => {
    clearAdminTokens();
    setIsAuthenticated(false);
    queryClient.removeQueries({ queryKey: ["adminMe"] });
  };

  return {
    me,
    user: me,
    isAuthenticated,
    loadingMe,
    meError,
    login,
    loggingIn,
    loginError,
    logout,
  };
} 