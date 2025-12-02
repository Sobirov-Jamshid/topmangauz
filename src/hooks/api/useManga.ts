"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as mangaService from "../../lib/api/mangaService";
import { MangaList, Chapter, Favorite } from "../../lib/api/types";

interface MangaListParams {
  search?: string;
  ordering?: string;
  category?: string;
  genre?: string;
  status?: string;
  year?: string;
  author?: string;
  page?: number;
}

export const useMangas = (params: MangaListParams = {}) => {
  return useQuery({
    queryKey: ['mangas', params],
    queryFn: () => mangaService.getAllMangas(params),
  });
};

export const usePopularMangas = (params: MangaListParams = {}) => {
  return useQuery({
    queryKey: ['popularMangas', params],
    queryFn: () => mangaService.getPopularMangas(params),
  });
};

export const useRecentMangas = (params: MangaListParams = {}) => {
  return useQuery({
    queryKey: ['recentMangas', params],
    queryFn: () => mangaService.getRecentMangas(params),
  });
};

export const useRecommendedMangas = (params: MangaListParams = {}) => {
  return useQuery({
    queryKey: ['recommendedMangas', params],
    queryFn: () => mangaService.getRecommendedMangas(params),
  });
};

export const useMangaDetail = (slug: string) => {
  return useQuery({
    queryKey: ['manga', slug],
    queryFn: () => mangaService.getMangaBySlug(slug),
    enabled: !!slug,
  });
};

export const useMangaChapters = (slug: string) => {
  return useQuery({
    queryKey: ['mangaChapters', slug],
    queryFn: () => mangaService.getMangaChapters(slug),
    enabled: !!slug,
    select: (response) => {
      if (Array.isArray(response)) {
        return response;
      }
      if (response?.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (response?.results && Array.isArray(response.results)) {
        return response.results;
      }
      return [];
    },
  });
};

export const useChapter = (id: number) => {
  return useQuery({
    queryKey: ['chapter', id],
    queryFn: () => mangaService.getChapter(id),
    enabled: !!id,
    select: (response) => {
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        return response;
      }
      if (response?.data && typeof response.data === 'object') {
        return response.data;
      }
      if (response?.results && typeof response.results === 'object') {
        return response.results;
      }
      return response;
    },
  });
};

export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: mangaService.getFavorites,
    select: (response) => response.data,
  });
};

export const useMangaFavorites = (slug: string) => {
  return useQuery({
    queryKey: ['mangaFavorites', slug],
    queryFn: () => mangaService.getMangaFavorites(slug),
    enabled: !!slug,
    select: (response) => response.data,
  });
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (slug: string) => mangaService.addToFavorites(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
};

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => mangaService.removeFromFavorites(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
  };

// hooks/api/useManga.ts
export const useReadingHistory = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['reading-history'],
    queryFn: async () => {
      const response = await mangaService.getReadingHistory();
      return response;
    },
    enabled: options?.enabled !== false, // enabled parametri bilan boshqarish
    retry: (failureCount, error: any) => {
      // 401 xatoligida qayta urinmaslik
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
export const useAddToReadingHistory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ manga, chapter }: { manga: MangaList, chapter: Chapter }) => 
      mangaService.addToReadingHistory(manga, chapter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingHistory'] });
    },
  });
};

export const usePurchaseChapter = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (chapterId: number) => mangaService.purchaseChapter(chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['readingHistory'] });
    },
  });
};

export const useAddReview = (slug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ text, rating }: { text: string, rating: number }) => 
      mangaService.addReview(slug, text, rating),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manga', slug] });
    },
  });
};

export const useCategories = (search?: string) => {
  return useQuery({
    queryKey: ['categories', search],
    queryFn: () => mangaService.getAllCategories(search),
  });
};

export const useCategoryManga = (categoryId: string) => {
  return useQuery({
    queryKey: ['categoryManga', categoryId],
    queryFn: () => mangaService.getCategoryManga(categoryId),
    enabled: !!categoryId,
  });
};

export const useGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: mangaService.getAllGenres,
  });
};

export const useChapterPdf = (chapterId: number) => {
  return useQuery({
    queryKey: ['chapterPdf', chapterId],
    queryFn: () => mangaService.getChapterPdf(chapterId),
    enabled: !!chapterId,
    select: (response) => {
      if (response && typeof response === 'object' && !Array.isArray(response)) {
        return response;
      }
      if (response?.data && typeof response.data === 'object') {
        return response.data;
      }
      if (response?.results && typeof response.results === 'object') {
        return response.results;
      }
      return response;
    },
  });
}; 