"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/api/adminService";
import { MangaList, MangaDetail, MangaCreate, MangaUpdate, Chapter, ChapterCreate } from "@/lib/api/types";
import { showToast } from "@/lib/utils/toast";

export function useMangas() {
  const queryClient = useQueryClient();

  const {
    data: mangaResponse,
    isLoading: isLoadingManga,
    error: mangaError,
    refetch: refetchManga,
  } = useQuery({
    queryKey: ["manga"],
    queryFn: () => adminService.getManga(),
  });

  const manga = Array.isArray(mangaResponse) 
    ? mangaResponse 
    : (mangaResponse as any)?.data || (mangaResponse as any)?.results || [];

  const {
    data: popularMangaResponse,
    isLoading: isLoadingPopularManga,
    error: popularMangaError,
  } = useQuery({
    queryKey: ["popularManga"],
    queryFn: () => adminService.getPopularManga(),
  });

  const popularManga = Array.isArray(popularMangaResponse) 
    ? popularMangaResponse 
    : (popularMangaResponse?.data || popularMangaResponse?.results || []);

  const {
    data: recentMangaResponse,
    isLoading: isLoadingRecentManga,
    error: recentMangaError,
  } = useQuery({
    queryKey: ["recentManga"],
    queryFn: () => adminService.getRecentManga(),
  });

  const recentManga = Array.isArray(recentMangaResponse) 
    ? recentMangaResponse 
    : (recentMangaResponse?.data || recentMangaResponse?.results || []);

  const {
    data: recommendedMangaResponse,
    isLoading: isLoadingRecommendedManga,
    error: recommendedMangaError,
  } = useQuery({
    queryKey: ["recommendedManga"],
    queryFn: () => adminService.getRecommendedManga(),
  });

  const recommendedManga = Array.isArray(recommendedMangaResponse) 
    ? recommendedMangaResponse 
    : (recommendedMangaResponse?.data || recommendedMangaResponse?.results || []);

  const {
    mutateAsync: createManga,
    isPending: isCreatingManga,
    error: createMangaError,
  } = useMutation({
    mutationFn: (data: MangaCreate) => adminService.createManga(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manga"] });
      queryClient.invalidateQueries({ queryKey: ["popularManga"] });
      queryClient.invalidateQueries({ queryKey: ["recentManga"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedManga"] });
      showToast("Manga muvaffaqiyatli yaratildi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Manga yaratishda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  const {
    mutateAsync: updateManga,
    isPending: isUpdatingManga,
    error: updateMangaError,
  } = useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: MangaUpdate }) => 
      adminService.updateManga(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manga"] });
      queryClient.invalidateQueries({ queryKey: ["popularManga"] });
      queryClient.invalidateQueries({ queryKey: ["recentManga"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedManga"] });
      showToast("Manga muvaffaqiyatli yangilandi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Mangani yangilashda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  const {
    mutateAsync: deleteManga,
    isPending: isDeletingManga,
    error: deleteMangaError,
  } = useMutation({
    mutationFn: (id: number) => adminService.deleteManga(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manga"] });
      queryClient.invalidateQueries({ queryKey: ["popularManga"] });
      queryClient.invalidateQueries({ queryKey: ["recentManga"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedManga"] });
      showToast("Manga muvaffaqiyatli o'chirildi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Mangani o'chirishda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  const getMangaDetail = (slug: string) => {
    return useQuery({
      queryKey: ["mangaDetail", slug],
      queryFn: () => adminService.getMangaDetail(slug),
      enabled: !!slug,
    });
  };

  const getMangaChapters = (slug: string) => {
    return useQuery({
      queryKey: ["mangaChapters", slug],
      queryFn: () => adminService.getMangaChapters(slug),
      enabled: !!slug,
    });
  };

  const {
    mutateAsync: createChapter,
    isPending: isCreatingChapter,
    error: createChapterError,
  } = useMutation({
    mutationFn: (data: ChapterCreate) => adminService.createChapter(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mangaChapters", variables.manga.toString()] });
      showToast("Bob muvaffaqiyatli yaratildi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      console.log(error, 1)

      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Bob yaratishda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  const {
    mutateAsync: updateChapter,
    isPending: isUpdatingChapter,
    error: updateChapterError,
  } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ChapterCreate> | FormData }) => 
      adminService.updateChapter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mangaChapters"] });
      showToast("Bob muvaffaqiyatli yangilandi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Bobni yangilashda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  const {
    mutateAsync: deleteChapter,
    isPending: isDeletingChapter,
    error: deleteChapterError,
  } = useMutation({
    mutationFn: (id: number) => adminService.deleteChapter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mangaChapters"] });
      showToast("Bob muvaffaqiyatli o'chirildi!", "success");
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Bobni o'chirishda xatolik yuz berdi";
      showToast(errorMessage, "error");
    },
  });

  return {
    manga,
    isLoadingManga,
    mangaError,
    refetchManga,
    popularManga,
    isLoadingPopularManga,
    popularMangaError,
    recentManga,
    isLoadingRecentManga,
    recentMangaError,
    recommendedManga,
    isLoadingRecommendedManga,
    recommendedMangaError,
    createManga,
    isCreatingManga,
    createMangaError,
    updateManga,
    isUpdatingManga,
    updateMangaError,
    deleteManga,
    isDeletingManga,
    deleteMangaError,
    getMangaDetail,
    getMangaChapters,
    createChapter,
    isCreatingChapter,
    createChapterError,
    updateChapter,
    isUpdatingChapter,
    updateChapterError,
    deleteChapter,
    isDeletingChapter,
    deleteChapterError,
  };
}

export const useMangasCRUD = useMangas; 