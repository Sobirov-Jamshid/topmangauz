"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/api/adminService";
import { AllUser } from "@/lib/api/types";

export function useAdminUser(id: number) {
  return useQuery({
    queryKey: ["adminUser", id],
    queryFn: async (): Promise<AllUser> => {
      try {
        return await adminService.getAdminUser(id);
      } catch (error) {
        throw error;
      }
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AllUser> }) => {
      try {
        return await adminService.updateAdminUser(id, data);
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUser", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["usersCount"] });
    },
  });
}

export function useUpdateAdminUserPartial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AllUser> }) => {
      try {
        return await adminService.updateAdminUserPartial(id, data);
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminUser", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      queryClient.invalidateQueries({ queryKey: ["usersCount"] });
    },
  });
}
