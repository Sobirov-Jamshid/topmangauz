import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { updateMangaStatus, checkMangaCompletion } from '@/lib/api/mangaStatus';

interface ReadingProgress {
  mangaId: string;
  totalChapters: number;
  readChapters: number;
  lastReadChapter: number;
  isCompleted: boolean;
  progressPercentage: number;
}

interface UseReadingProgressProps {
  mangaId: string;
  totalChapters: number;
  onStatusUpdate?: (status: 'ongoing' | 'completed') => void;
}

export function useReadingProgress({ 
  mangaId, 
  totalChapters, 
  onStatusUpdate 
}: UseReadingProgressProps) {
  const { isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<ReadingProgress>({
    mangaId,
    totalChapters,
    readChapters: 0,
    lastReadChapter: 0,
    isCompleted: false,
    progressPercentage: 0
  });

  useEffect(() => {
    if (!isAuthenticated || !mangaId) return;

    const savedProgress = localStorage.getItem(`reading_progress_${mangaId}`);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(prev => ({
          ...prev,
          ...parsed,
          totalChapters,
          isCompleted: checkMangaCompletion(totalChapters, parsed.readChapters || 0)
        }));
      } catch (error) {
      }
    }
  }, [mangaId, totalChapters, isAuthenticated]);

  const saveProgress = useCallback((newProgress: Partial<ReadingProgress>) => {
    if (!isAuthenticated || !mangaId) return;

    const updatedProgress = {
      ...progress,
      ...newProgress,
      mangaId,
      totalChapters
    };

    setProgress(updatedProgress);
    localStorage.setItem(`reading_progress_${mangaId}`, JSON.stringify(updatedProgress));
  }, [progress, mangaId, totalChapters, isAuthenticated]);

  const markChapterAsRead = useCallback(async (chapterId: number) => {
    if (!isAuthenticated || !mangaId) return;

    const newReadChapters = Math.max(progress.readChapters, chapterId);
    const isCompleted = checkMangaCompletion(totalChapters, newReadChapters);
    
    const newProgress = {
      readChapters: newReadChapters,
      lastReadChapter: chapterId,
      isCompleted,
      progressPercentage: Math.round((newReadChapters / totalChapters) * 100)
    };

    saveProgress(newProgress);

    if (isCompleted && !progress.isCompleted) {
      try {
        await updateMangaStatus(mangaId, 'completed');
        onStatusUpdate?.('completed');
      } catch (error) {
      }
    }

    return newProgress;
  }, [mangaId, totalChapters, progress.readChapters, progress.isCompleted, isAuthenticated, saveProgress, onStatusUpdate]);

  const resetProgress = useCallback(() => {
    if (!isAuthenticated || !mangaId) return;

    const newProgress = {
      readChapters: 0,
      lastReadChapter: 0,
      isCompleted: false,
      progressPercentage: 0
    };

    saveProgress(newProgress);
    localStorage.removeItem(`reading_progress_${mangaId}`);
  }, [mangaId, isAuthenticated, saveProgress]);

  const getProgressInfo = useCallback(() => {
    return {
      readChapters: progress.readChapters,
      totalChapters: progress.totalChapters,
      progressPercentage: progress.progressPercentage,
      isCompleted: progress.isCompleted,
      lastReadChapter: progress.lastReadChapter
    };
  }, [progress]);

  return {
    progress,
    markChapterAsRead,
    resetProgress,
    getProgressInfo,
    isCompleted: progress.isCompleted
  };
}
