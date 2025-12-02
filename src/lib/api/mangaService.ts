import apiClient from './axios';
import { MangaDetail, MangaList, Chapter, Review, Favorite, ReadingHistory, Category, Genre, PurchaseChapter } from './types';

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

export const getAllMangas = async (params: MangaListParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.ordering) queryParams.append('ordering', params.ordering);
  if (params.category) queryParams.append('category', params.category);
  if (params.genre) queryParams.append('genre', params.genre);
  if (params.status) queryParams.append('status', params.status);
  if (params.year) queryParams.append('year', params.year);
  if (params.author) queryParams.append('author', params.author);
  if (params.page) queryParams.append('page', params.page.toString());
  
  const response = await apiClient.get<MangaList[]>(`/manga/?${queryParams.toString()}`);
  const mangaData = response.data;
  return Array.isArray(mangaData) ? mangaData : (mangaData?.data || mangaData?.results || []);
};

export const getPopularMangas = async (params: MangaListParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.ordering) queryParams.append('ordering', params.ordering);
  if (params.category) queryParams.append('category', params.category);
  if (params.genre) queryParams.append('genre', params.genre);
  if (params.status) queryParams.append('status', params.status);
  if (params.year) queryParams.append('year', params.year);
  if (params.author) queryParams.append('author', params.author);
  if (params.page) queryParams.append('page', params.page.toString());
  
  const response = await apiClient.get<MangaList[]>(`/manga/popular/?${queryParams.toString()}`);
  const mangaData = response.data;
  return Array.isArray(mangaData) ? mangaData : (mangaData?.data || mangaData?.results || []);
};

export const getRecentMangas = async (params: MangaListParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.ordering) queryParams.append('ordering', params.ordering);
  if (params.category) queryParams.append('category', params.category);
  if (params.genre) queryParams.append('genre', params.genre);
  if (params.status) queryParams.append('status', params.status);
  if (params.year) queryParams.append('year', params.year);
  if (params.author) queryParams.append('author', params.author);
  if (params.page) queryParams.append('page', params.page.toString());
  
  const response = await apiClient.get<MangaList[]>(`/manga/recent/?${queryParams.toString()}`);
  const mangaData = response.data;
  return Array.isArray(mangaData) ? mangaData : (mangaData?.data || mangaData?.results || []);
};

export const getRecommendedMangas = async (params: MangaListParams = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.search) queryParams.append('search', params.search);
  if (params.ordering) queryParams.append('ordering', params.ordering);
  if (params.category) queryParams.append('category', params.category);
  if (params.genre) queryParams.append('genre', params.genre);
  if (params.status) queryParams.append('status', params.status);
  if (params.year) queryParams.append('year', params.year);
  if (params.author) queryParams.append('author', params.author);
  if (params.page) queryParams.append('page', params.page.toString());
  
  const response = await apiClient.get<MangaList[]>(`/manga/recommended/?${queryParams.toString()}`);
  const mangaData = response.data;
  return Array.isArray(mangaData) ? mangaData : (mangaData?.data || mangaData?.results || []);
};

export const getMangaBySlug = async (slug: string) => {
  const response = await apiClient.get<MangaDetail>(`/manga/${slug}/`);
  const mangaData = response.data;
  return Array.isArray(mangaData) ? mangaData[0] : (mangaData?.data || mangaData?.results || mangaData);
};

export const getMangaChapters = async (slug: string) => {
  const response = await apiClient.get<Chapter[]>(`/manga/${slug}/chapters/`);
  const chapterData = response.data;
  return Array.isArray(chapterData) ? chapterData : (chapterData?.data || chapterData?.results || []);
};

export const getChapter = async (id: number) => {
    const response = await apiClient.get<Chapter>(`/chapters/${id}/`);
  const chapterData = response.data;
  return Array.isArray(chapterData) ? chapterData : (chapterData?.data || chapterData?.results || chapterData);
};

export const getChapterPdf = async (chapterId: number) => {
  try {
    const response = await apiClient.get<Blob>(`/chapters/${chapterId}/pdf/`, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    
    return { pdf_url: pdfUrl };
  } catch (error: any) {
    throw error;
  }
};

export const purchaseChapter = async (chapterId: number) => {
  try {
    
    const response = await apiClient.post<PurchaseChapter>('/chapters/purchase/', { chapter: chapterId });
    
    
    const purchaseData = response.data;
    return Array.isArray(purchaseData) ? purchaseData : (purchaseData?.data || purchaseData?.results || purchaseData);
  } catch (error: any) {
    throw error;
  }
};

export const getFavorites = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/favorites/');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Foydalanuvchi tizimga kirmagan, bo'sh array qaytarish
      return [];
    }
    throw error;
  }
};

export const addToFavorites = async (mangaId: string) => {
  try {
    // Get the access token from localStorage
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('mangaleep_access_token') : null;
    
    if (!accessToken) {
      throw new Error('Authentication token topilmadi');
    }

    const response = await fetch(`/api/favorites/${mangaId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add to favorites');
    }
    
    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

export const removeFromFavorites = async (favoriteId: string) => {
  try {
    // Get the access token from localStorage
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('mangaleep_access_token') : null;
    
    if (!accessToken) {
      throw new Error('Authentication token topilmadi');
    }

    const response = await fetch(`/api/favorites/delete/${favoriteId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove from favorites');
    }
    
    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

export const getMangaFavorites = async (slug: string) => {
  const response = await apiClient.get<Favorite[]>(`/manga/${slug}/favorites/`);
  const favoriteData = response.data;
  return Array.isArray(favoriteData) ? favoriteData : (favoriteData?.data || favoriteData?.results || []);
};

export const getReadingHistory = async () => {
  const response = await apiClient.get<ReadingHistory[]>('/reading-history/');
  const historyData = response.data;
  return Array.isArray(historyData) ? historyData : (historyData?.data || historyData?.results || []);
};

export const addToReadingHistory = async (manga: MangaList, chapter: Chapter) => {
  const response = await apiClient.post<ReadingHistory>('/reading-history/', { manga: manga.slug, chapter: chapter.id });
  const historyData = response.data;
  return Array.isArray(historyData) ? historyData : (historyData?.data || historyData?.results || []);
};

export const getAllCategories = async (search?: string) => {
  const params = search ? { search } : {};
  const response = await apiClient.get<Category[]>('/categories/', { params });
  const categoryData = response.data;
  return Array.isArray(categoryData) ? categoryData : (categoryData?.data || categoryData?.results || []);
};

export const getCategoryManga = async (categoryId: string) => {
  const response = await apiClient.get<MangaList[]>(`/categories/${categoryId}/manga/`);
  const mangaData = response.data;
  return Array.isArray(mangaData) ? mangaData : (mangaData?.data || mangaData?.results || []);
};

export const getAllGenres = async () => {
  const response = await apiClient.get<Genre[]>('/genres/');
  const genreData = response.data;
  return Array.isArray(genreData) ? genreData : (genreData?.data || genreData?.results || []);
};

export const addUserBalance = async (amount: string) => {
  const response = await apiClient.post('/balance/add/', { amount });
  const balanceData = response.data;
  return Array.isArray(balanceData) ? balanceData : (balanceData?.data || balanceData?.results || []);
};

export const getMangaReviews = async (slug: string) => {
  const response = await apiClient.get<Review[]>(`/manga/${slug}/reviews/`);
  const reviewData = response.data;
  return Array.isArray(reviewData) ? reviewData : (reviewData?.data || reviewData?.results || []);
};

export const addReview = async (slug: string, text: string, rating: number) => {
  const response = await apiClient.post<Review>(`/manga/${slug}/reviews/`, { text, rating });
  const reviewData = response.data;
  return Array.isArray(reviewData) ? reviewData : (reviewData?.data || reviewData?.results || []);
}; 