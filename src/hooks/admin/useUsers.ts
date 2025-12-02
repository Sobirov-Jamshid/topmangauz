"use client";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/lib/api/adminService";
import { AllUser, PaginatedResponse, User } from "@/lib/api/types";

export function useUsers() {
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: async (): Promise<User[]> => {
      try {
        return await adminService.getUsers();
      } catch (error) {
        // Silent fail
        return [];
      }
    },
    retry: 1,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: async (): Promise<User[]> => {
      try {
        return await adminService.getUsers();
      } catch (error) {
        // Silent fail
        return [];
      }
    },
    retry: 1,
  });
}

export function useAllUsers(search?: string, ordering?: string, page?: number) {
  return useQuery({
    queryKey: ["allUsers", search, ordering, page],
    queryFn: async (): Promise<PaginatedResponse<AllUser>> => {
      try {
        return await adminService.getAllUsers(search, ordering, page);
      } catch (error) {
        // Silent fail
        return {
          count: 0,
          next: null,
          previous: null,
          results: []
        };
      }
    },
    retry: 1,
  });
}

export function useUsersCount() {
  return useQuery({
    queryKey: ["usersCount"],
    queryFn: async () => {
      try {
        return await adminService.getUsersCount();
      } catch (error) {
        // Silent fail
        return { count: 0 };
      }
    },
    retry: 1,
  });
} 