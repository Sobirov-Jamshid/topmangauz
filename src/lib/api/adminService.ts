import adminApi from './adminAxios';
import {
  Category,
  CategoryCreate,
  Genre,
  GenreCreate,
  Author,
  AuthorCreate,
  MangaList,
  MangaDetail,
  MangaCreate,
  MangaUpdate,
  Chapter,
  ChapterCreate,
  ChapterDetail,
  Comment,
  CommentCreate,
  CommentReport,
  PurchaseChapter,
  Review,
  ReviewCreate,
  AdminStats,
  PaginatedResponse,
  User,
  AllUser
} from './types';

export const adminService = {
  getCategories: async (search?: string): Promise<Category[]> => {
    const params = search ? { search } : {};
    const response = await adminApi.get<Category[]>('/categories/', { params });
    const categoryData = response.data;
    return Array.isArray(categoryData) ? categoryData : (categoryData?.data || categoryData?.results || []);
  },

  createCategory: async (data: CategoryCreate): Promise<Category> => {
    const response = await adminApi.post<Category>('/categories/', data);
    return response.data;
  },

  getCategory: async (id: number): Promise<Category> => {
    const response = await adminApi.get<Category>(`/categories/${id}/`);
    return response.data;
  },

  updateCategory: async (id: number, data: CategoryCreate): Promise<Category> => {
    const response = await adminApi.put<Category>(`/categories/${id}/update/`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await adminApi.delete(`/categories/${id}/delete/`);
  },

  getCategoryManga: async (id: number): Promise<MangaList[]> => {
    const response = await adminApi.get<MangaList[]>(`/categories/${id}/manga/`);
    const mangaData = response.data;
    return Array.isArray(mangaData) ? mangaData : (mangaData?.data || mangaData?.results || []);
  },

  getGenres: async (): Promise<Genre[]> => {
    const response = await adminApi.get<Genre[]>('/genres/');
    const genreData = response.data;
    return Array.isArray(genreData) ? genreData : (genreData?.data || genreData?.results || []);
  },

  createGenre: async (data: GenreCreate): Promise<Genre> => {
    const response = await adminApi.post<Genre>('/genres/', data);
    return response.data;
  },

  updateGenre: async (id: number, data: GenreCreate): Promise<Genre> => {
    const response = await adminApi.put<Genre>(`/genres/${id}/update/`, data);
    return response.data;
  },

  deleteGenre: async (id: number): Promise<void> => {
    await adminApi.delete(`/genres/${id}/delete/`);
  },

  getAuthors: async (): Promise<Author[]> => {
    const response = await adminApi.get<Author[]>('/authors/');
    const authorData = response.data;
    return Array.isArray(authorData) ? authorData : (authorData?.data || authorData?.results || []);
  },

  createAuthor: async (data: AuthorCreate): Promise<Author> => {
    const response = await adminApi.post<Author>('/authors/', data);
    return response.data;
  },

  updateAuthor: async (id: number, data: AuthorCreate): Promise<Author> => {
    const response = await adminApi.post<Author>('/authors/', data);
    return response.data;
  },

  deleteAuthor: async (id: number): Promise<void> => {
    await adminApi.delete(`/authors/${id}/`);
  },

  getManga: async (search?: string, ordering?: string): Promise<MangaList[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (ordering) params.ordering = ordering;
    
    const response = await adminApi.get<MangaList[]>('/manga/', { params });
    const mangaData = response.data;
    return Array.isArray(mangaData) ? mangaData : (mangaData?.data || mangaData?.results || []);
  },

  getPopularManga: async (search?: string, ordering?: string): Promise<MangaList[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (ordering) params.ordering = ordering;
    
    const response = await adminApi.get<MangaList[]>('/manga/popular/', { params });
    const mangaData = response.data;
    return Array.isArray(mangaData) ? mangaData : (mangaData?.data || mangaData?.results || []);
  },

  getRecentManga: async (search?: string, ordering?: string): Promise<MangaList[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (ordering) params.ordering = ordering;
    
    const response = await adminApi.get<MangaList[]>('/manga/recent/', { params });
    const mangaData = response.data;
    return Array.isArray(mangaData) ? mangaData : (mangaData?.data || mangaData?.results || []);
  },

  getRecommendedManga: async (search?: string, ordering?: string): Promise<MangaList[]> => {
    const params: any = {};
    if (search) params.search = search;
    if (ordering) params.ordering = ordering;
    
    const response = await adminApi.get<MangaList[]>('/manga/recommended/', { params });
    const mangaData = response.data;
    return Array.isArray(mangaData) ? mangaData : (mangaData?.data || mangaData?.results || []);
  },

  getMangaDetail: async (slug: string): Promise<MangaDetail> => {
    const response = await adminApi.get<MangaDetail>(`/manga/${slug}/`);
    return response.data;
  },

  createManga: async (data: MangaCreate | FormData): Promise<MangaDetail> => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    const response = await adminApi.post<MangaDetail>('/manga/create/', data, config);
    return response.data;
  },

  updateManga: async (slug: string, data: MangaUpdate | FormData): Promise<MangaDetail> => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    const response = await adminApi.patch<MangaDetail>(`/manga/${slug}/`, data, config);
    return response.data;
  },

  deleteManga: async (id: number): Promise<void> => {
    await adminApi.delete(`/manga/${id}/delete/`);
  },

  getMangaChapters: async (slug: string): Promise<Chapter[]> => {
    const response = await adminApi.get<Chapter[]>(`/manga/${slug}/chapters/`);
    const chapterData = response.data;
    return Array.isArray(chapterData) ? chapterData : (chapterData?.data || chapterData?.results || []);
  },

  getMangaFavorites: async (slug: string): Promise<any[]> => {
    const response = await adminApi.get<any[]>(`/manga/${slug}/favorite/`);
    return response.data;
  },

  createMangaReview: async (slug: string, data: ReviewCreate): Promise<Review> => {
    const response = await adminApi.post<Review>(`/manga/${slug}/reviews/`, data);
    return response.data;
  },

  getChapters: async (): Promise<Chapter[]> => {
    try {
      const mangas = await adminService.getManga();
      
      if (!Array.isArray(mangas)) {
        return [];
      }
      
      const allChapters: Chapter[] = [];
      
      for (const manga of mangas) {
        try {
          const chapters = await adminService.getMangaChapters(manga.slug);
          
          if (Array.isArray(chapters)) {
            chapters.forEach(chapter => {
              chapter.manga = manga.id;
              chapter.manga_title = manga.title;
            });
            allChapters.push(...chapters);
          }
        } catch (error) {
        }
      }
      
      return allChapters;
    } catch (error) {
      return [];
    }
  },

  createChapter: async (data: ChapterCreate): Promise<Chapter> => {
    const response = await adminApi.post<Chapter>('/chapters/create/', data);
    return response.data;
  },

  createChapterWithPdf: async (formData: FormData): Promise<Chapter> => {
    const response = await adminApi.post<Chapter>('/chapters/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 5 * 60 * 1000,
    });
    return response.data;
  },

  updateChapter: async (id: number, data: Partial<ChapterCreate> | FormData): Promise<Chapter> => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    const response = await adminApi.put<Chapter>(`/chapters/${id}/update/`, data, config);
    return response.data;
  },

  getChapter: async (id: number): Promise<ChapterDetail> => {
    const response = await adminApi.get<ChapterDetail>(`/chapters/${id}/`);
    return response.data;
  },

  deleteChapter: async (id: number): Promise<void> => {
    await adminApi.delete(`/chapters/${id}/delete/`);
  },

  uploadChapterPdf: async (chapterId: number, file: File, chapterData?: any): Promise<{ pdf_file: string }> => {
    const formData = new FormData();
    formData.append('pdf_file', file);
    
    try {
      
      const response = await adminApi.put(`/chapters/${chapterId}/update/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  purchaseChapter: async (data: PurchaseChapter): Promise<PurchaseChapter> => {
    const response = await adminApi.post<PurchaseChapter>('/chapters/purchase/', data);
    return response.data;
  },

  getComments: async (): Promise<Comment[]> => {
    const response = await adminApi.get<Comment[]>('/comments/');
    return response.data;
  },

  createComment: async (data: CommentCreate): Promise<Comment> => {
    const response = await adminApi.post<Comment>('/comments/', data);
    return response.data;
  },

  reportComment: async (data: CommentReport): Promise<CommentReport> => {
    const response = await adminApi.post<CommentReport>('/comments/report/', data);
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await adminApi.get<User[]>('/users/');
    const userData = response.data;
    return Array.isArray(userData) ? userData : (userData?.data || userData?.results || []);
  },

  getAllUsers: async (search?: string, ordering?: string, page?: number): Promise<PaginatedResponse<AllUser>> => {
    const params: any = {};
    if (search) params.search = search;
    if (ordering) params.ordering = ordering;
    if (page) params.page = page;
    
    const response = await adminApi.get<PaginatedResponse<AllUser>>('/auth/all-users/', { params });
    return response.data;
  },

  getUsersCount: async (): Promise<{ count: number }> => {
    const response = await adminApi.get<{ count: number }>('/auth/all-users/count/');
    return response.data;
  },

  getAdminUser: async (id: number): Promise<AllUser> => {
    const response = await adminApi.get<AllUser>(`/auth/admin/users/${id}/`);
    return response.data;
  },

  updateAdminUser: async (id: number, data: Partial<AllUser>): Promise<AllUser> => {
    const response = await adminApi.put<AllUser>(`/auth/admin/users/${id}/`, data);
    return response.data;
  },

  updateAdminUserPartial: async (id: number, data: Partial<AllUser>): Promise<AllUser> => {
    const response = await adminApi.patch<AllUser>(`/auth/admin/users/${id}/`, data);
    return response.data;
  },

  getAdminStats: async (): Promise<AdminStats> => {
    try {
      const [mangaRes, categoriesRes, genresRes, authorsRes, chaptersRes, usersRes] = await Promise.all([
        adminApi.get<MangaList[]>('/manga/'),
        adminApi.get<Category[]>('/categories/'),
        adminApi.get<Genre[]>('/genres/'),
        adminApi.get<Author[]>('/authors/'),
        adminService.getChapters(),
        adminService.getUsers(),
      ]);

      const mangaData = mangaRes.data;
      const categoriesData = categoriesRes.data;
      const genresData = genresRes.data;
      const authorsData = authorsRes.data;

      const mangas = Array.isArray(mangaData) ? mangaData : (mangaData?.data || mangaData?.results || []);
      const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.data || categoriesData?.results || []);
      const genres = Array.isArray(genresData) ? genresData : (genresData?.data || genresData?.results || []);
      const authors = Array.isArray(authorsData) ? authorsData : (authorsData?.data || authorsData?.results || []);

      const totalManga = mangas.length;
      const totalChapters = chaptersRes.length;
      const totalUsers = usersRes.length;
      const totalReviews = 0; // Bu ma'lumotni reviews endpoint dan olish kerak

      const genreCount: Record<string, { name: string; count: number }> = {};
      mangas.forEach(manga => {
        manga.genres?.forEach(genre => {
          if (!genreCount[genre.id]) {
            genreCount[genre.id] = { name: genre.name, count: 0 };
          }
          genreCount[genre.id].count++;
        });
      });

      const popularGenres = Object.values(genreCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const authorCount: Record<string, { name: string; count: number }> = {};
      mangas.forEach(manga => {
        if (manga.author?.id) {
          if (!authorCount[manga.author.id]) {
            authorCount[manga.author.id] = { name: manga.author.name, count: 0 };
          }
          authorCount[manga.author.id].count++;
        }
      });

      const topAuthors = Object.values(authorCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        total_manga: totalManga,
        total_chapters: totalChapters,
        total_users: totalUsers,
        total_reviews: totalReviews,
        popular_genres: popularGenres,
        top_authors: topAuthors,
      };
    } catch (error) {
      return {
        total_manga: 0,
        total_chapters: 0,
        total_users: 0,
        total_reviews: 0,
        popular_genres: [],
        top_authors: [],
      };
    }
  },
}; 