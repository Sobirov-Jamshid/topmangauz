"use client";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminAxios";

export interface Purchase {
  id: number;
  user: { id: number; username: string };
  manga: { id: number; title: string };
  chapter: { id: number; number: number };
  amount: string;
  created_at: string;
}

export function usePurchases() {
  return useQuery({
    queryKey: ["purchases"],
    queryFn: async () => {
      const res = await adminApi.get<Purchase[]>("/purchases/");
      return res.data;
    },
  });
} 