"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, Grid, List, ChevronDown, X, Menu } from "lucide-react";
import { useMangas, useCategories, useGenres } from "@/hooks/api/useManga";
import MangaCard from "@/components/features/MangaCard/MangaCard";
import LatestChapters from "@/components/features/LatestChapters";

function MangaCatalogContent() {
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
  
  const total = mangas.length;
  const totalPages = Math.ceil(total / 20);

  const updateParams = (newParams: Record<string, any>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') params.delete(k);
      else params.set(k, String(v));
    });
    router.push(`/main/manga?${params.toString()}`);
  };

  const filters = [
    { id: '-views', name: 'Mashhur' },
    { id: '-created_at', name: 'Yangi' },
    { id: '-rating', name: 'Yuqori baholanganlar' },
    { id: 'title', name: 'A-Z' },
    { id: '-title', name: 'Z-A' },
    { id: '-year', name: 'Yangi yillar' },
    { id: 'year', name: 'Eski yillar' },
  ];
  
  const filterButtons = [
    { id: '-views', name: 'Mashhur' },
    { id: '-created_at', name: 'Yangi' },
    { id: 'title', name: 'Yuqori baholanganlar' },
    { id: 'title', name: 'A-Z' },
    { id: '-title', name: 'Z-A' },
    { id: '-year', name: 'Yangi yillar' },
    { id: 'year', name: 'Eski yillar' },
  ];

  const statuses = [
    { id: 'all', name: 'Barchasi' },
    { id: 'ongoing', name: 'Jarayonda' },
    { id: 'completed', name: 'Yakunlangan' },
  ];

  const years = [
    { id: 'all', name: 'Barcha yillar' },
    { id: '2024', name: '2024' },
    { id: '2023', name: '2023' },
    { id: '2022', name: '2022' },
    { id: '2021', name: '2021' },
    { id: '2020', name: '2020' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: query, page: 1 });
  };

  const handleCategoryFilter = (categoryId: string) => {
    updateParams({ category: categoryId === 'all' ? '' : categoryId, page: 1 });
  };
  
  const handleGenreFilter = (genreId: string) => {
    updateParams({ genre: genreId === 'all' ? '' : genreId, page: 1 });
  };
  
  const handleStatusFilter = (status: string) => {
    updateParams({ status: status === 'all' ? '' : status, page: 1 });
  };

  const handleYearFilter = (year: string) => {
    updateParams({ year: year === 'all' ? '' : year, page: 1 });
  };

  const handleAuthorFilter = (author: string) => {
    updateParams({ author: author === 'all' ? '' : author, page: 1 });
  };

  const hasActiveFilters = categoryParam || genreParam || statusParam || yearParam || authorParam || query;

  return (
    <div className="min-h-screen bg-black text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile-optimized header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Manga katalogi
              </h1>
              <p className="text-sm sm:text-base text-[#a0a0a0]">
                Sevimli manga va manhwalarni toping va o'qing
              </p>
            </div>
            
            {/* Stats - mobile optimized */}
            {mangas.length > 0 && !(mangaError || categoriesError || genresError) && (
              <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-[#666]">
                <span className="bg-[#121212] px-2 py-1 rounded">
                  {total} manga
                </span>
                <span className="bg-[#121212] px-2 py-1 rounded">
                  {categories.length} kategoriya
                </span>
                <span className="bg-[#121212] px-2 py-1 rounded">
                  {genres.length} janr
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-first search and controls */}
        {!(mangaError || categoriesError || genresError) && (
          <div className="mb-6">
            {/* Search bar - full width on mobile */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666] w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Manga nomini kiriting..."
                  className="w-full pl-10 pr-20 py-3 bg-[#1a1a1a] border border-[#252525] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#ff9900] focus:ring-1 focus:ring-[#ff9900] transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-[#ff9900] hover:bg-[#ff9900]/90 text-white rounded text-sm font-medium transition-colors"
                >
                  Qidiruv
                </button>
              </div>
            </form>

            {/* Controls row - responsive */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              {/* Left side - filters and view mode */}
              <div className="flex items-center gap-3">
                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showFilters || hasActiveFilters
                      ? 'bg-[#ff9900] text-white'
                      : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#252525] border border-[#252525]'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filtrlar</span>
                  {hasActiveFilters && (
                    <span className="bg-white text-[#ff9900] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      !
                    </span>
                  )}
                </button>

                {/* View mode toggle - desktop only */}
                <div className="hidden sm:flex bg-[#1a1a1a] rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-[#ff9900] text-white'
                        : 'text-[#a0a0a0] hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[#ff9900] text-white'
                        : 'text-[#a0a0a0] hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sort dropdown - improved mobile design */}
              <div className="relative min-w-0 flex-1 sm:flex-initial sm:min-w-[200px]">
                <select
                  value={orderingParam}
                  onChange={(e) => updateParams({ ordering: e.target.value, page: 1 })}
                  className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#252525] rounded-lg text-white text-sm focus:outline-none focus:border-[#ff9900] transition-colors appearance-none cursor-pointer"
                >
                  {filters.map(filter => (
                    <option key={filter.id} value={filter.id}>
                      {filter.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#666] w-4 h-4 pointer-events-none" />
              </div>
            </div>
            
            {/* Filter buttons - horizontal scrollable */}
            <div className="mt-4 overflow-x-auto hide-scrollbar">
              <div className="flex space-x-2 pb-2 min-w-max">
                {filterButtons.map(filter => (
                  <button
                    key={filter.id}
                    onClick={(e) => {
                      e.preventDefault();
                      updateParams({ ordering: filter.id, page: 1 });
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                      orderingParam === filter.id
                        ? 'bg-[#ff9900] text-white'
                        : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#252525]'
                    }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Active filters - improved mobile display */}
        {hasActiveFilters && !(mangaError || categoriesError || genresError) && (
          <div className="bg-[#121212] border border-[#252525] rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-medium text-white">Faol filtrlar</h3>
              <button 
                className="text-xs text-[#ff9900] hover:text-[#ff6600] transition-colors self-start sm:self-auto"
                onClick={() => updateParams({
                  search: '',
                  category: '',
                  genre: '',
                  status: '',
                  year: '',
                  author: '',
                  page: 1
                })}
              >
                Barchasini tozalash
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {query && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#ff9900]/20 text-[#ff9900] rounded-full text-xs">
                  Qidiruv: "{query}"
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setQuery('');
                      updateParams({ search: '', page: 1 });
                    }}
                    className="hover:text-[#ff6600]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {categoryParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#ff9900]/20 text-[#ff9900] rounded-full text-xs">
                  Kategoriya: {categories.find((c: any) => c.id?.toString() === categoryParam)?.name || categoryParam}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateParams({ category: '', page: 1 });
                    }}
                    className="hover:text-[#ff6600]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {genreParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#ff9900]/20 text-[#ff9900] rounded-full text-xs">
                  Janr: {genres.find((g: any) => g.id?.toString() === genreParam)?.name || genreParam}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateParams({ genre: '', page: 1 });
                    }}
                    className="hover:text-[#ff6600]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {statusParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#ff9900]/20 text-[#ff9900] rounded-full text-xs">
                  Holat: {statuses.find(s => s.id === statusParam)?.name || statusParam}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateParams({ status: '', page: 1 });
                    }}
                    className="hover:text-[#ff6600]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {yearParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#ff9900]/20 text-[#ff9900] rounded-full text-xs">
                  Yil: {yearParam}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateParams({ year: '', page: 1 });
                    }}
                    className="hover:text-[#ff6600]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Advanced filters - mobile-optimized */}
        {showFilters && !(mangaError || categoriesError || genresError) && (
          <div className="bg-[#121212] border border-[#252525] rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">Filtrlar</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 text-[#a0a0a0] hover:text-white transition-colors sm:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Category filter */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-white">Kategoriya</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className={`px-3 py-2 rounded-full text-sm transition-colors ${
                      !categoryParam ? 'bg-[#ff9900] text-white' : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#252525]'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCategoryFilter('all');
                    }}
                  >
                    Barchasi
                  </button>
                  {categoriesResponse === undefined ? (
                    <div className="text-xs text-[#666] px-3 py-2">
                      Yuklanmoqda...
                    </div>
                  ) : (
                    categories.map((category: any) => (
                      <button 
                        key={category.id}
                        className={`px-3 py-2 rounded-full text-sm transition-colors ${
                          categoryParam === category.id?.toString() 
                            ? 'bg-[#ff9900] text-white' 
                            : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#252525]'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleCategoryFilter(category.id?.toString() || '');
                        }}
                      >
                        {category.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
              
              {/* Genre filter */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-white">Janrlar</h3>
                <div className="flex flex-wrap gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  <button 
                    className={`px-3 py-2 rounded-full text-sm transition-colors ${
                      !genreParam ? 'bg-[#ff9900] text-white' : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#252525]'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleGenreFilter('all');
                    }}
                  >
                    Barchasi
                  </button>
                  {genresResponse === undefined ? (
                    <div className="text-xs text-[#666] px-3 py-2">
                      Yuklanmoqda...
                    </div>
                  ) : (
                    genres.map((genre: any) => (
                      <button 
                        key={genre.id}
                        className={`px-3 py-2 rounded-full text-sm transition-colors ${
                          genreParam === genre.id?.toString() 
                            ? 'bg-[#ff9900] text-white' 
                            : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#252525]'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleGenreFilter(genre.id?.toString() || '');
                        }}
                      >
                        {genre.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Status and Year in same row on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Status filter */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-white">Holati</h3>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map(status => (
                      <button 
                        key={status.id}
                        className={`px-3 py-2 rounded-full text-sm transition-colors ${
                          (status.id === 'all' && !statusParam) || statusParam === status.id 
                            ? 'bg-[#ff9900] text-white' 
                            : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#252525]'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleStatusFilter(status.id);
                        }}
                      >
                        {status.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year filter */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-white">Yil</h3>
                  <div className="flex flex-wrap gap-2">
                    {years.map(year => (
                      <button 
                        key={year.id}
                        className={`px-3 py-2 rounded-full text-sm transition-colors ${
                          (year.id === 'all' && !yearParam) || yearParam === year.id 
                            ? 'bg-[#ff9900] text-white' 
                            : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#252525]'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleYearFilter(year.id);
                        }}
                      >
                        {year.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Clear filters button */}
              <div className="pt-4 border-t border-[#252525]">
                <button 
                  className="w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    updateParams({
                      search: '',
                      category: '',
                      genre: '',
                      status: '',
                      year: '',
                      author: '',
                      page: 1
                    });
                  }}
                >
                  Barcha filtrlarni tozalash
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Results info - mobile optimized */}
        {mangas.length > 0 && !(mangaError || categoriesError || genresError) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 text-sm">
            <div className="text-[#a0a0a0]">
              <span className="font-medium text-white">{total}</span> ta manga topildi
              {hasActiveFilters && (
                <span className="ml-1 text-[#ff9900]">(filtrlanqan)</span>
              )}
            </div>
            <div className="text-[#a0a0a0]">
              Sahifa <span className="font-medium text-white">{page}</span> / {totalPages}
            </div>
          </div>
        )}

        {/* Error state - improved design */}
        {(mangaError || categoriesError || genresError) && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
            <div className="text-6xl mb-6">😕</div>
            <h3 className="text-xl font-bold mb-2 text-white">Xatolik yuz berdi</h3>
            <p className="text-[#a0a0a0] mb-6 max-w-md">
              {mangaError ? 'Manga ma\'lumotlarini yuklashda muammo bo\'ldi' :
               categoriesError ? 'Kategoriyalarni yuklashda muammo bo\'ldi' :
               genresError ? 'Janrlarni yuklashda muammo bo\'ldi' :
               'Ma\'lumotlarni yuklashda muammo bo\'ldi'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#ff9900] hover:bg-[#ff6600] text-white rounded-lg font-medium transition-colors"
            >
              Sahifani yangilash
            </button>
          </div>
        )}

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
                <div className="text-6xl mb-6">📚</div>
                <h3 className="text-xl font-bold mb-2 text-white">Manga topilmadi</h3>
                <p className="text-[#a0a0a0] mb-6 max-w-md">
                  {hasActiveFilters 
                    ? 'Qidiruv natijalari bo\'sh. Boshqa filtrlarni sinab ko\'ring.'
                    : 'Hozircha manga mavjud emas.'
                  }
                </p>
                {hasActiveFilters && (
                  <button 
                    onClick={() => updateParams({
                      search: '',
                      category: '',
                      genre: '',
                      status: '',
                      year: '',
                      author: '',
                      page: 1
                    })}
                    className="px-6 py-3 bg-[#ff9900] hover:bg-[#ff6600] text-white rounded-lg font-medium transition-colors"
                  >
                    Filtrlarni tozalash
                  </button>
                )}
              </div>
            ) : (
              /* Manga grid - fully responsive */
              <div 
                className={
                  viewMode === 'grid' 
                    ? 'manga-grid-container'
                    : 'space-y-4'
                }
              >
                {mangas.map((manga: any, index: number) => (
                  <MangaCard
                    key={`manga-${manga.id || index}`}
                    manga={manga}
                    viewMode={viewMode}
                    disableNavigation={false}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Pagination - mobile optimized */}
        {totalPages > 1 && !(mangaError || categoriesError || genresError) && (
          <div className="flex justify-center mt-8 mb-8">
            <div className="flex items-center rounded-lg overflow-hidden">
              {/* Previous button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  updateParams({ page: Math.max(1, page - 1) });
                }}
                disabled={page <= 1}
                className={`px-4 py-3 text-white font-medium bg-[#121212] hover:bg-[#1a1a1a] ${
                  page <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                } transition-colors`}
              >
                <span>← Oldingi</span>
              </button>
              
              {/* Current page */}
              <button
                className="px-5 py-3 text-white bg-[#ff9900] font-medium transition-colors"
              >
                {page}
              </button>
              
              {/* Next button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  updateParams({ page: Math.min(totalPages, page + 1) });
                }}
                disabled={page >= totalPages}
                className={`px-4 py-3 text-white font-medium bg-[#121212] hover:bg-[#1a1a1a] ${
                  page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''
                } transition-colors`}
              >
                <span>Keyingi →</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MangaCatalogContent;