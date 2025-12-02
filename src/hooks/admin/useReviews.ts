import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminAxios";

export interface ReviewAdmin {
  id: number;
  user: string;
  manga: { id: number; title: string };
  text: string;
  rating: number;
  is_approved: boolean;
  created_at: string;
}

export function useReviewsCRUD() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ReviewAdmin[]>({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await adminApi.get<ReviewAdmin[]>("/reviews/");
      return res.data;
    },
  });

  const { mutateAsync: approveReview, isPending: approving } = useMutation({
    mutationFn: async (id: number) => {
      await adminApi.patch(`/admin/reviews/${id}/moderate/`, {
        status: "approved",   // ✅ backend kutayotgan format
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });


  const { mutateAsync: rejectReview, isPending: rejecting } = useMutation({
    mutationFn: async (id: number) => {
      await adminApi.patch(`/admin/reviews/${id}/moderate/`, {
        status: "rejected",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });


  return {
    data,
    isLoading,
    approveReview,
    approving,
    rejectReview,
    rejecting,
  };
} 