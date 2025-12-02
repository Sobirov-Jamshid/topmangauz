export interface Category {
  id: number;
  name: string;
}

export interface CategoryCreate {
  name: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface GenreCreate {
  name: string;
}

export interface Author {
  id: number;
  name: string;
}

export interface AuthorCreate {
  name: string;
}

export interface Age {
  id: number;
  name: string;
}

export interface AgeCreate {
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface GoogleLoginRequest {
  access_token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  avatar?: File;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface ResendEmailVerificationRequest {
  email: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  new_password: string;
  new_password_confirm: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenVerifyRequest {
  token: string;
}

export interface AvatarUploadResponse {
  avatar: string;
}

export interface ReadingHistory {
  id: number;
  manga: MangaList;
  chapter: Chapter;
  read_at: string;
}

export interface UserBalance {
  balance: number;
}

export interface MangaList {
  id: number;
  title: string;
  slug: string;
  title_uz?: string;
  title_en?: string;
  category: Category;
  author: Author;
  genres: Genre[];
  age: Age;
  year: number;
  status: string;
  cover?: string;
  views: number;
  rating: number;
  description?: string;
}

export interface MangaDetail {
  id: number;
  title: string;
  slug: string;
  title_uz?: string;
  title_en?: string;
  category: Category;
  author: Author;
  genres: Genre[];
  age: Age;
  year: number;
  status: string;
  cover?: string;
  background?: string;
  views: number;
  rating: number;
  description: string;
  chapters?: Chapter[];
  reviews?: Review[];
}

export interface MangaCreate {
  title: string;
  slug?: string;
  title_uz?: string;
  title_en?: string;
  category: number;
  author: number;
  genres: number[];
  age: number;
  year: number;
  status: string;
  description: string;
}

export interface MangaUpdate {
  title?: string;
  slug?: string;
  title_uz?: string;
  title_en?: string;
  category?: {
    name: string;
  };
  author?: {
    name: string;
  };
  genres?: {
    name: string;
  }[];
  year?: number;
  status?: string;
  views?: number;
  rating?: number;
  description?: string;
}

export interface ChapterImage {
  id: number;
  order: number;
  url: string;
}

export interface Chapter {
  id: number;
  title: string;
  title_uz?: string;
  title_en?: string;
  pdf_file?: string;
  access_type: 'free' | 'paid' | '3_days_paid';
  price?: string;
  is_purchased?: string | boolean;
  expiry_date?: string | null;
  is_free?: string | boolean;
  created_at?: string;
  locked?: string | boolean;
  manga?: number | {
    id: number;
    title: string;
    title_uz?: string;
    title_en?: string;
    slug: string;
    category?: { id: number; name: string };
    author?: { id: number; name: string };
    age?: { id: number; name: string };
    genres?: Array<{ id: number; name: string }>;
    year?: number;
    status?: string;
    cover?: string;
    views?: number;
    rating?: number;
    chapter_count?: string;
  };
  manga_title?: string;
  images?: ChapterImage[];
}

export interface ChapterCreate {
  manga: number;
  title: string;
  access_type: 'free' | 'paid' | '3_days_paid';
  price?: string;
  pdf_file?: File;
}

export interface ChapterDetail {
  id: number;
  title: string;
  pdf_file?: string;
  access_type: 'free' | 'paid' | '3_days_paid';
  price?: string;
  is_purchased?: string;
  created_at?: string;
}

export interface Review {
  id: number;
  user?: string;
  text: string;
  manga: MangaList;
  rating: number;
  created_at?: string;
}

export interface ReviewCreate {
  text: string;
  manga: MangaList;
  rating: number;
}

export interface Comment {
  id: number;
  text: string;
  user?: string;
  manga?: MangaList;
  chapter?: Chapter;
  created_at?: string;
}

export interface CommentCreate {
  text: string;
  manga?: number;
  chapter?: number;
}

export interface CommentReport {
  comment: number;
  reason: string;
}

export interface PurchaseChapter {
  chapter: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  favorites: Favorite[];
  purchased_chapters: UserPurchase[];
  date_joined: string;
}

export interface Favorite {
  id: number;
  user: number;
  manga: MangaList;
  created_at: string;
}

export interface UserPurchase {
  id: number;
  manga: MangaList;
  chapter: Chapter;
  purchase_date: string;
}

export interface AllUser {
  id: number;
  username: string;
  avatar?: string;
  balance?: number;
  email: string;
  is_staff: boolean;
  is_active?: boolean;
  first_name?: string;
  last_name?: string;
}

export interface AdminStats {
  total_manga: number;
  total_chapters: number;
  total_users: number;
  total_reviews: number;
  popular_genres: { name: string; count: number }[];
  top_authors: { name: string; count: number }[];
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

export interface FileUploadResponse {
  url: string;
  file_url?: string;
} 