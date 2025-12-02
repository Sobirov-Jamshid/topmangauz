"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import MangaCard from '@/components/features/MangaCard';
import ContinueReading from '@/components/features/ContinueReading';
import LatestChapters from '@/components/features/LatestChapters';
import { MangaCardSkeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ChevronRight } from 'lucide-react';
import { usePopularMangas, useRecentMangas, useRecommendedMangas } from '@/hooks/api/useManga';
import { useCategories } from '@/hooks/api/useCategories';
import { useReadingHistory } from '@/hooks/api/useManga';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import { useAuth } from '@/hooks/api/useAuth'; // To'g'ri import
import SnowfallOverlay from "@/components/common/SnowfallOverlay"; // ⬅️ yuqoriga qo'shing

export default function MainPageClient() {
  const { data: popularResponse, isLoading: loadingPopular } = usePopularMangas();
  const { data: recentResponse, isLoading: loadingRecent } = useRecentMangas();
  const { data: recommendedResponse, isLoading: loadingRecommended } = useRecommendedMangas();
  const { data: categoriesResponse, isLoading: loadingCategories } = useCategories();
  
  // useAuth hook'idan foydalanish
  const { isAuthenticated } = useAuth();
  
  // Faqat tizimga kirgan foydalanuvchilar uchun reading history
  const { data: readingHistoryResponse } = useReadingHistory({
    enabled: !!isAuthenticated // Faqat authenticated bo'lsa ishlaydi
  });

  const isLoading = loadingPopular || loadingRecent || loadingRecommended || loadingCategories;

  const popularMangas = Array.isArray(popularResponse) 
    ? popularResponse 
    : (popularResponse?.data || popularResponse?.results || []);
  const recentMangas = Array.isArray(recentResponse) 
    ? recentResponse 
    : (recentResponse?.data || recentResponse?.results || []);
  const recommendedMangas = Array.isArray(recommendedResponse) 
    ? recommendedResponse 
    : (recommendedResponse?.data || recommendedResponse?.results || []);
  const categories = Array.isArray(categoriesResponse) 
    ? categoriesResponse 
    : (categoriesResponse?.data || categoriesResponse?.results || []);
  
  // Reading history faqat authenticated bo'lsa
  const readingHistory = isAuthenticated 
    ? (Array.isArray(readingHistoryResponse) 
        ? readingHistoryResponse 
        : (readingHistoryResponse?.data || readingHistoryResponse?.results || []))
    : [];

  const safePopularMangas = Array.isArray(popularMangas) ? popularMangas : [];
  const safeRecentMangas = Array.isArray(recentMangas) ? recentMangas : [];
  const safeRecommendedMangas = Array.isArray(recommendedMangas) ? recommendedMangas : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeReadingHistory = Array.isArray(readingHistory) ? readingHistory : [];

  const featuredManga = safePopularMangas.length > 0 ? safePopularMangas[0] : null;

  return (
    // <div className="min-h-screen pb-20 bg-black">
    <div className="relative min-h-screen pb-20 bg-gradient-to-b from-[#020617] via-black to-black">
      {/* Qor yog'ishi overlay */}
      <SnowfallOverlay />
      <div className="relative z-10">
      {/* Featured manga banner */}
      <Link href={`/main/manga/${featuredManga?.slug || ''}`}>
        <section className="relative w-full bg-gradient-to-b from-[#0a0a0a] to-black overflow-hidden cursor-pointer hover:opacity-95 transition-opacity">
          {!isLoading && featuredManga && (
            <>
              {/* Background image */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url(${featuredManga.cover})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(15px)'
              }} />

              {/* Content */}
              <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-center">
                  <div className="md:col-span-2 space-y-2 sm:space-y-3">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <div className="inline-flex items-center px-2 py-1 bg-[#ff9900] rounded-full text-[11px] font-medium text-black">
                        🔥 Eng mashhur
                      </div>
                    </div>

                    <h1 className="text-lg sm:text-xl md:text-3xl font-bold text-white leading-tight drop-shadow-[0_0_20px_rgba(248,250,252,0.3)]">
                      {featuredManga.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[#a0a0a0] text-xs sm:text-sm">
                      <span className="bg-[#1a1a1a]/80 px-1.5 py-0.5 rounded text-xs border border-[#ffffff10]">
                        {featuredManga.category.name}
                      </span>
                      <span className="hidden sm:inline">{featuredManga.views} ko'rishlar</span>
                      <span className="flex items-center text-[#ff9900]">
                        ★ {featuredManga.rating?.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Cover image - visible on all screen sizes */}
                  <div className="flex justify-center md:justify-end">
                    <div className="relative aspect-[2/3] rounded-md overflow-hidden border-2 border-[#38bdf8] shadow-[0_0_25px_rgba(56,189,248,0.5)] w-full max-w-[120px] sm:max-w-[140px] md:max-w-[200px] bg-gradient-to-b from-[#0f172a] to-black">
                      {/* yuqoridan tushayotgan bayram chiroqlari */}
                      <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-60 pointer-events-none" />
                      {featuredManga.cover ? (
                        <Image
                          src={featuredManga.cover}
                          alt={featuredManga.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                          <span className="text-[#a0a0a0] text-xs">Rasm yo'q</span>
                        </div>
                      )}
                      {/* Pastki o'ngda kichik “2026” yarmarka badge */}
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-black/80 border border-[#facc15]/60 text-[9px] font-semibold text-[#facc15]">
                        ❄ 2025
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}
        </section>
      </Link>
        
      {isLoading && (
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="large" />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Continue Reading - faqat authenticated va history bor bo'lsa */}
        {isAuthenticated && safeReadingHistory.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <div className="w-1 h-6 bg-[#ff9900] rounded mr-3"></div>
                Davom etish
              </h2>
            </div>
            <ContinueReading />
          </section>
        )}

        {/* Popular Manga */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <div className="w-1 h-6 bg-[#ff9900] rounded mr-3"></div>
              Mashhur
            </h2>
            <Link 
              href="/main/manga" 
              className="text-[#ff9900] hover:text-[#ff6600] transition-colors flex items-center text-sm"
            >
              Barchasi
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <Swiper
            modules={[Navigation, FreeMode]}
            spaceBetween={8}
            slidesPerView={3}
            freeMode={true}
            navigation={{
              enabled: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 12,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 16,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 16,
              },
            }}
            className="manga-swiper"
          >
            {safePopularMangas.slice(1, 20).map((manga) => (
              <SwiperSlide key={manga.id}>
                <MangaCard manga={manga} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* Recent Manga */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <div className="w-1 h-6 bg-[#ff9900] rounded mr-3"></div>
              Yangi
            </h2>
            <Link 
              href="/main/manga" 
              className="text-[#ff9900] hover:text-[#ff6600] transition-colors flex items-center text-sm"
            >
              Barchasi
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <Swiper
            modules={[Navigation, FreeMode]}
            spaceBetween={8}
            slidesPerView={3}
            freeMode={true}
            navigation={{
              enabled: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 12,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 16,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 16,
              },
            }}
            className="manga-swiper"
          >
            {safeRecentMangas.slice(0, 20).map((manga) => (
              <SwiperSlide key={manga.id}>
                <MangaCard manga={manga} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* Latest Chapters */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <div className="w-1 h-6 bg-[#ff9900] rounded mr-3"></div>
              So'nggi boblar
            </h2>
            <Link 
              href="/main/manga" 
              className="text-[#ff9900] hover:text-[#ff6600] transition-colors flex items-center text-sm"
            >
              Barchasi
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <LatestChapters />
        </section>

        {/* Recommended Manga */}
        {safeRecommendedMangas.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <div className="w-1 h-6 bg-[#ff9900] rounded mr-3"></div>
                Tavsiya etilgan
              </h2>
              <Link 
                href="/main/manga" 
                className="text-[#ff9900] hover:text-[#ff6600] transition-colors flex items-center text-sm"
              >
                Barchasi
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <Swiper
              modules={[Navigation, FreeMode]}
              spaceBetween={8}
              slidesPerView={3}
              freeMode={true}
              navigation={{
                enabled: true,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 3,
                  spaceBetween: 12,
                },
                768: {
                  slidesPerView: 4,
                  spaceBetween: 16,
                },
                1024: {
                  slidesPerView: 5,
                  spaceBetween: 16,
                },
                1280: {
                  slidesPerView: 6,
                  spaceBetween: 16,
                },
              }}
              className="manga-swiper"
            >
              {safeRecommendedMangas.slice(0, 20).map((manga) => (
                <SwiperSlide key={manga.id}>
                  <MangaCard manga={manga} />
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}
      </div>
      </div>
    </div>
  );
}