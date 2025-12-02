"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/api/adminService";
import { Author, AuthorCreate } from "@/lib/api/types";
import { showToast } from "@/lib/utils/toast";

export function useAuthors() {
  const queryClient = useQueryClient();

  const {
    data: authorsResponse,
    isLoading: isLoadingAuthors,
    error: authorsError,
    refetch: refetchAuthors,
  } = useQuery({
    queryKey: ["authors"],
    queryFn: () => adminService.getAuthors(),
  });

  const authors = Array.isArray(authorsResponse) 
    ? authorsResponse 
    : (authorsResponse as any)?.data || (authorsResponse as any)?.results || [];

  const {
    mutateAsync: createAuthor,
    isPending: isCreatingAuthor,
    error: createAuthorError,
  } = useMutation({
    mutationFn: (data: AuthorCreate) => adminService.createAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
      showToast("Tarjimon muvaffaqiyatli yaratildi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Tarjimon yaratishda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  const {
    mutateAsync: updateAuthor,
    isPending: isUpdatingAuthor,
    error: updateAuthorError,
  } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AuthorCreate }) => 
      adminService.updateAuthor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
      showToast("Tarjimon muvaffaqiyatli yangilandi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Tarjimonni yangilashda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  const {
    mutateAsync: deleteAuthor,
    isPending: isDeletingAuthor,
    error: deleteAuthorError,
  } = useMutation({
    mutationFn: (id: number) => adminService.deleteAuthor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authors"] });
      showToast("Tarjimon muvaffaqiyatli o'chirildi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Tarjimonni o'chirishda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  return {
    authors,
    isLoadingAuthors,
    authorsError,
    refetchAuthors,
    createAuthor,
    isCreatingAuthor,
    createAuthorError,
    updateAuthor,
    isUpdatingAuthor,
    updateAuthorError,
    deleteAuthor,
    isDeletingAuthor,
    deleteAuthorError,
  };
}

export const useAuthorsCRUD = useAuthors; 