import { useQuery } from '@tanstack/react-query';
import * as mangaService from '../../lib/api/mangaService';

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