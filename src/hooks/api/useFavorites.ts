// hooks/api/useFavorites.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addToFavorites, getFavorites, removeFromFavorites } from '@/lib/api/mangaService';
import { showToast } from '@/lib/utils/toast';
import { useAuth } from './useAuth';

export function useFavorites() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const {
    data: favorites,
    isLoading: isLoadingFavorites,
    error: favoritesError,
    refetch: refetchFavorites,
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: !!isAuthenticated, // Faqat authenticated bo'lsa ishlaydi
    retry: (failureCount, error: any) => {
      // 401 xatoligida qayta urinmaslik
      if (error?.response?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const {
    mutateAsync: addToFavoritesMutation,
    isPending: isAddingToFavorites,
    error: addToFavoritesError,
  } = useMutation({
    mutationFn: (mangaId: string) => addToFavorites(mangaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      showToast('Sevimlilarga qo\'shildi!', 'success');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Sevimlilarga qo'shishda xatolik yuz berdi";
      showToast(errorMessage, 'error');
    },
  });

  const {
    mutateAsync: removeFromFavoritesMutation,
    isPending: isRemovingFromFavorites,
    error: removeFromFavoritesError,
  } = useMutation({
    mutationFn: (mangaId: string) => removeFromFavorites(mangaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      showToast('Sevimlilardan olib tashlandi!', 'success');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || 
                          error?.response?.data?.message || 
                          "Sevimlilardan olib tashlashda xatolik yuz berdi";
      showToast(errorMessage, 'error');
    },
  });

  const isInFavorites = (mangaId: number | string) => {
    if (!isAuthenticated) return false; // Foydalanuvchi tizimga kirmagan bo'lsa, false qaytarish
    
    const id = typeof mangaId === 'string' ? parseInt(mangaId) : mangaId;
    const result = favorites?.some((favorite: any) => favorite.manga.id === id) || false;
    return result;
  };

  const getFavoriteId = (mangaId: number | string) => {
    if (!isAuthenticated) return null; // Foydalanuvchi tizimga kirmagan bo'lsa, null qaytarish
    
    const id = typeof mangaId === 'string' ? parseInt(mangaId) : mangaId;
    const favorite = favorites?.find((fav: any) => fav.manga.id === id);
    return favorite?.id;
  };

  const toggleFavorite = async (mangaId: string) => {
    if (!isAuthenticated) {
      showToast('Sevimlilarga qo\'shish uchun tizimga kiring', 'error');
      return;
    }

    const isFavorite = isInFavorites(mangaId);
    
    if (isFavorite) {
      // Find the favorite ID for this manga and remove it
      const favoriteId = getFavoriteId(mangaId);
      if (favoriteId) {
        await removeFromFavoritesMutation(favoriteId.toString());
      }
    } else {
      await addToFavoritesMutation(mangaId);
    }
  };

  return {
    favorites,
    isLoadingFavorites,
    favoritesError,
    refetchFavorites,
    addToFavorites: addToFavoritesMutation,
    isAddingToFavorites,
    addToFavoritesError,
    removeFromFavorites: removeFromFavoritesMutation,
    isRemovingFromFavorites,
    removeFromFavoritesError,
    isInFavorites,
    toggleFavorite,
  };
}