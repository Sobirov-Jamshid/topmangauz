import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/lib/utils/toast";
import apiClient from "@/lib/api/axios";

interface Rating {
  id: number;
  rating: number;
  manga: number;
  created_at: string;
}

interface CreateRatingData {
  rating: number;
}

interface UpdateRatingData {
  rating: number;
}

export const useCreateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mangaId, data }: { mangaId: string; data: CreateRatingData }) => {
      const response = await apiClient.post(`/ratings/create/${mangaId}/`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      showToast("Rating muvaffaqiyatli saqlandi!", "success");
      queryClient.invalidateQueries({ queryKey: ["user-rating", variables.mangaId] });
      queryClient.invalidateQueries({ queryKey: ["manga-detail", variables.mangaId] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || "Rating yaratishda xatolik";
      showToast(errorMessage, "error");
    },
  });
};

export const useUserRating = (mangaId: string) => {
  return useQuery({
    queryKey: ["user-rating", mangaId],
    queryFn: async (): Promise<Rating[]> => {
      try {
        const response = await apiClient.get(`/ratings/user/${mangaId}/`);
        return response.data;
      } catch (error: any) {
        if (error?.response?.status === 404) {
          return []; // Return empty array if no rating found
        }
        throw error;
      }
    },
    enabled: !!mangaId,
  });
};


export const useUpdateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mangaId, data }: { mangaId: string; data: UpdateRatingData }) => {
      const response = await apiClient.put(`/ratings/${mangaId}/update/`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      showToast("Rating muvaffaqiyatli yangilandi!", "success");
      queryClient.invalidateQueries({ queryKey: ["user-rating", variables.mangaId] });
      queryClient.invalidateQueries({ queryKey: ["manga-detail", variables.mangaId] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || "Rating yangilashda xatolik";
      showToast(errorMessage, "error");
    },
  });
};

export const usePatchRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mangaId, data }: { mangaId: string; data: UpdateRatingData }) => {
      const response = await apiClient.patch(`/ratings/${mangaId}/update/`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      showToast("Rating muvaffaqiyatli yangilandi!", "success");
      queryClient.invalidateQueries({ queryKey: ["user-rating", variables.mangaId] });
      queryClient.invalidateQueries({ queryKey: ["manga-detail", variables.mangaId] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.detail || "Rating yangilashda xatolik";
      showToast(errorMessage, "error");
    },
  });
};
