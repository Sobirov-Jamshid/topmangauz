"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/api/adminService";
import { Genre, GenreCreate } from "@/lib/api/types";
import { showToast } from "@/lib/utils/toast";

export function useGenres() {
  const queryClient = useQueryClient();

  const {
    data: genresResponse,
    isLoading: isLoadingGenres,
    error: genresError,
    refetch: refetchGenres,
  } = useQuery({
    queryKey: ["genres"],
    queryFn: () => adminService.getGenres(),
  });

  const genres = Array.isArray(genresResponse) 
    ? genresResponse 
    : (genresResponse as any)?.data || (genresResponse as any)?.results || [];

  const {
    mutateAsync: createGenre,
    isPending: isCreatingGenre,
    error: createGenreError,
  } = useMutation({
    mutationFn: (data: GenreCreate) => adminService.createGenre(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      showToast("Janr muvaffaqiyatli yaratildi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Janr yaratishda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  const {
    mutateAsync: updateGenre,
    isPending: isUpdatingGenre,
    error: updateGenreError,
  } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: GenreCreate }) => 
      adminService.updateGenre(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      showToast("Janr muvaffaqiyatli yangilandi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Janrni yangilashda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  const {
    mutateAsync: deleteGenre,
    isPending: isDeletingGenre,
    error: deleteGenreError,
  } = useMutation({
    mutationFn: (id: number) => adminService.deleteGenre(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["genres"] });
      showToast("Janr muvaffaqiyatli o'chirildi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Janrni o'chirishda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  return {
    genres,
    isLoadingGenres,
    genresError,
    refetchGenres,
    createGenre,
    isCreatingGenre,
    createGenreError,
    updateGenre,
    isUpdatingGenre,
    updateGenreError,
    deleteGenre,
    isDeletingGenre,
    deleteGenreError,
  };
}

export const useGenresCRUD = useGenres; 