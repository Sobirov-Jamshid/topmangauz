"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/api/adminService";
import { Category, CategoryCreate } from "@/lib/api/types";
import { showToast } from "@/lib/utils/toast";

export function useCategories() {
  const queryClient = useQueryClient();

  const {
    data: categoriesResponse,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: () => adminService.getCategories(),
  });

  const categories = Array.isArray(categoriesResponse) 
    ? categoriesResponse 
    : (categoriesResponse as any)?.data || (categoriesResponse as any)?.results || [];

  const {
    mutateAsync: createCategory,
    isPending: isCreatingCategory,
    error: createCategoryError,
  } = useMutation({
    mutationFn: (data: CategoryCreate) => adminService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showToast("Kategoriya muvaffaqiyatli yaratildi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Kategoriya yaratishda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  const {
    mutateAsync: updateCategory,
    isPending: isUpdatingCategory,
    error: updateCategoryError,
  } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryCreate }) => 
      adminService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showToast("Kategoriya muvaffaqiyatli yangilandi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Kategoriyani yangilashda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  const {
    mutateAsync: deleteCategory,
    isPending: isDeletingCategory,
    error: deleteCategoryError,
  } = useMutation({
    mutationFn: (id: number) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      showToast("Kategoriya muvaffaqiyatli o'chirildi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Kategoriyani o'chirishda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  const getCategory = (id: number) => {
    return useQuery({
      queryKey: ["category", id],
      queryFn: () => adminService.getCategory(id),
      enabled: !!id,
    });
  };

  const getCategoryManga = (id: number) => {
    return useQuery({
      queryKey: ["categoryManga", id],
      queryFn: () => adminService.getCategoryManga(id),
      enabled: !!id,
    });
  };

  return {
    categories,
    isLoadingCategories,
    categoriesError,
    refetchCategories,
    createCategory,
    isCreatingCategory,
    createCategoryError,
    updateCategory,
    isUpdatingCategory,
    updateCategoryError,
    deleteCategory,
    isDeletingCategory,
    deleteCategoryError,
    getCategory,
    getCategoryManga,
  };
}

export const useCategoriesCRUD = useCategories; 