"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/lib/api/adminService";
import { AdminStats } from "@/lib/api/types";

export function useStats() {
  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => adminService.getAdminStats(),
    retry: 1,
    retryDelay: 1000,
  });

  const stats = statsResponse?.data || statsResponse || null;

  return {
    stats,
    isLoadingStats,
    statsError,
    refetchStats,
  };
} 