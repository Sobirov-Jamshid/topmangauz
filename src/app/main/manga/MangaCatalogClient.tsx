"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Grid, List, ChevronDown, X, Menu } from "lucide-react";
import { useMangas, useCategories, useGenres } from "@/hooks/api/useManga";
import MangaCard from "@/components/features/MangaCard/MangaCard";
import { generateCatalogStructuredData } from "@/lib/seo/structured-data";
import { MangaData } from "@/lib/seo/metadata";

export default function MangaCatalogClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('search') || '');
  const orderingParam = searchParams.get('ordering') || '-views';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const categoryParam = searchParams.get('category');
  const genreParam = searchParams.get('genre');
  const statusParam = searchParams.get('status');
  const yearParam = searchParams.get('year');
  const authorParam = searchParams.get('author');

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const mangaParams = {
    search: query || undefined,
    ordering: orderingParam,
    category: categoryParam || undefined,
    genre: genreParam || undefined,
    status: statusParam || undefined,
    year: yearParam || undefined,
    author: authorParam || undefined,
    page,
  };

  const { data: mangasResponse, isLoading: isMangaLoading, error: mangaError } = useMangas(mangaParams);
  const { data: categoriesResponse, error: categoriesError } = useCategories();
  const { data: genresResponse, error: genresError } = useGenres();

  const mangas = Array.isArray(mangasResponse) 
    ? mangasResponse 
    : (mangasResponse?.data || mangasResponse?.results || []);
  
  const categories = Array.isArray(categoriesResponse) 
    ? categoriesResponse 
    : (categoriesResponse?.data || categoriesResponse?.results || []);
  
  const genres = Array.isArray(genresResponse)
    ? genresResponse
    : (genresResponse?.data || genresResponse?.results || []);

  const structuredData = generateCatalogStructuredData(mangas as MangaData[], mangaParams);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (categoryParam) params.set('category', categoryParam);
    if (genreParam) params.set('genre', genreParam);
    if (statusParam) params.set('status', statusParam);
    if (yearParam) params.set('year', yearParam);
    if (authorParam) params.set('author', authorParam);
    if (orderingParam !== '-views') params.set('ordering', orderingParam);
    
    router.push(`/main/manga?${params.toString()}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset to first page when filtering
    router.push(`/main/manga?${params.toString()}`);
  };

  const handleSortChange = (ordering: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('ordering', ordering);
    params.delete('page'); // Reset to first page when sorting
    router.push(`/main/manga?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    router.push(`/main/manga?${params.toString()}`);
  };

  const hasActiveFilters = categoryParam || genreParam || statusParam || yearParam || authorParam || orderingParam !== '-views';

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {query ? `"${query}" qidiruvi` : 'Manga Katalogi'}
            </h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Manga qidirish..."
                  className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-[#1a1a1a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                />
              </div>
            </form>

            {/* Filter Toggle and View Mode */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-[#121212] border border-[#1a1a1a] rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtrlar
                {hasActiveFilters && (
                  <span className="ml-2 px-2 py-1 bg-[#ff9900] text-black text-xs rounded-full">
                    {[categoryParam, genreParam, statusParam, yearParam, authorParam].filter(Boolean).length}
                  </span>
                )}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-[#ff9900] text-black' : 'bg-[#121212] text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-[#ff9900] text-black' : 'bg-[#121212] text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-[#121212] border border-[#1a1a1a] rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Kategoriya</label>
                    <select
                      value={categoryParam || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                    >
                      <option value="">Barcha kategoriyalar</option>
                      {categories.map((category: any) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Genre Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Janr</label>
                    <select
                      value={genreParam || ''}
                      onChange={(e) => handleFilterChange('genre', e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                    >
                      <option value="">Barcha janrlar</option>
                      {genres.map((genre: any) => (
                        <option key={genre.id} value={genre.name}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Holat</label>
                    <select
                      value={statusParam || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                    >
                      <option value="">Barcha holatlar</option>
                      <option value="ongoing">Davom etmoqda</option>
                      <option value="completed">Tugallangan</option>
                      <option value="hiatus">To'xtatilgan</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tartiblash</label>
                    <select
                      value={orderingParam}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                    >
                      <option value="-views">Eng ko'p ko'rilgan</option>
                      <option value="-created_at">Eng yangi</option>
                      <option value="title">Alfavit bo'yicha</option>
                      <option value="-rating">Reyting bo'yicha</option>
                    </select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="flex items-center px-4 py-2 text-[#ff9900] hover:text-[#ff6600] transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Filtrlarni tozalash
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content area */}
          {!(mangaError || categoriesError || genresError) && (
            <>
              {(isMangaLoading || categoriesResponse === undefined || genresResponse === undefined) ? (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4"></div>
                    <p className="text-[#a0a0a0]">Yuklanmoqda...</p>
                  </div>
                  
                  {/* Skeleton loading - responsive grid */}
                  <div className="manga-grid-container">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="bg-[#121212] rounded-lg overflow-hidden animate-pulse">
                        <div className="aspect-[3/4] bg-[#1a1a1a]"></div>
                        <div className="p-3 space-y-2">
                          <div className="h-3 bg-[#1a1a1a] rounded w-3/4"></div>
                          <div className="h-2 bg-[#1a1a1a] rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : mangas.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
                  <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                    <Search className="w-12 h-12 text-[#666]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Hech qanday manga topilmadi</h3>
                  <p className="text-[#a0a0a0] mb-6">
                    {query ? `"${query}" qidiruvi bo'yicha hech qanday natija topilmadi.` : 'Filtrlar bo\'yicha hech qanday manga topilmadi.'}
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-[#ff9900] text-black rounded-lg font-medium hover:bg-[#ff6600] transition-colors"
                  >
                    Filtrlarni tozalash
                  </button>
                </div>
              ) : (
                <>
                  {/* Results count */}
                  <div className="mb-6">
                    <p className="text-[#a0a0a0]">
                      {mangas.length} ta manga topildi
                      {query && ` "${query}" qidiruvi bo'yicha`}
                    </p>
                  </div>

                  {/* Manga Grid */}
                  <div className={`manga-grid-container ${viewMode === 'list' ? 'list-view' : ''}`}>
                    {mangas.map((manga: any, index: number) => (
                      <MangaCard key={`catalog-${manga.id || index}`} manga={manga} />
                    ))}
                  </div>

                  {/* Pagination would go here */}
                </>
              )}
            </>
          )}

          {/* Error states */}
          {(mangaError || categoriesError || genresError) && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <X className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Xatolik yuz berdi</h3>
              <p className="text-[#a0a0a0] mb-6">
                Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[#ff9900] text-black rounded-lg font-medium hover:bg-[#ff6600] transition-colors"
              >
                Qaytadan urinish
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
