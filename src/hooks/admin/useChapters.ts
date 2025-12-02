"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/lib/api/adminService";
import { Chapter, ChapterCreate, ChapterDetail } from "@/lib/api/types";
import { showToast } from "@/lib/utils/toast";

export function useChapters() {
  const queryClient = useQueryClient();

  const {
    data: chapters,
    isLoading: isLoadingChapters,
    error: chaptersError,
    refetch: refetchChapters,
  } = useQuery({
    queryKey: ["chapters"],
    queryFn: () => adminService.getChapters(),
  });

  const {
    mutateAsync: createChapter,
    isPending: isCreatingChapter,
    error: createChapterError,
  } = useMutation({
    mutationFn: (data: ChapterCreate) => adminService.createChapter(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      return data;
    },
    onError: (error: any) => {
      // Silent fail
      console.log(error, 2)

      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Bob yaratishda xatolik yuz berdi";
      showToast(errorMessage, "error");
      throw error;
    },
  });

  const {
    mutateAsync: updateChapter,
    isPending: isUpdatingChapter,
    error: updateChapterError,
  } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ChapterCreate> }) => 
      adminService.updateChapter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
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
    mutateAsync: uploadChapterPdf,
    isPending: isUploadingPdf,
    error: uploadPdfError,
  } = useMutation({
    mutationFn: ({ chapterId, file, chapterData }: { chapterId: number; file: File; chapterData?: any }) => 
      adminService.uploadChapterPdf(chapterId, file, chapterData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter", variables.chapterId] });
      return data;
    },
    onError: (error: any) => {
      // Silent fail
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "PDF yuklashda xatolik yuz berdi";
      showToast(errorMessage, "error");
      throw error;
    },
  });

  const {
    mutateAsync: deleteChapter,
    isPending: isDeletingChapter,
    error: deleteChapterError,
  } = useMutation({
    mutationFn: (id: number) => adminService.deleteChapter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
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

  const getChapter = (id: number) => {
    return useQuery({
      queryKey: ["chapter", id],
      queryFn: () => adminService.getChapter(id),
      enabled: !!id,
    });
  };

  return {
    chapters,
    isLoadingChapters,
    chaptersError,
    refetchChapters,
    createChapter,
    isCreatingChapter,
    createChapterError,
    updateChapter,
    isUpdatingChapter,
    updateChapterError,
    deleteChapter,
    isDeletingChapter,
    deleteChapterError,
    uploadChapterPdf,
    isUploadingPdf,
    uploadPdfError,
    getChapter,
  };
}

export const useChaptersCRUD = useChapters; 