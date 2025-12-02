"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/api/userService";
import * as mangaService from '../../lib/api/mangaService';
import { useAuth } from "./useAuth";

export function useReadingHistory() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["readingHistory"],
    queryFn: userService.getReadingHistory,
  });

  const { mutateAsync: addToReadingHistory } = useMutation({
    mutationFn: userService.addReadingHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["readingHistory"] });
    },
  });

  return {
    history: data,
    isLoading,
    error,
    addToReadingHistory,
  };
}

export const useAddBalance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (amount: string) => mangaService.addUserBalance(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export function useBalance() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['user-balance'],
    queryFn: userService.getBalance,
    enabled: !!isAuthenticated, // ← MUHIM
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });
}