"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, BookOpen, Eye, Calendar, User, Heart, X } from 'lucide-react';
import { MangaList } from '@/lib/api/types';
import { useFavorites } from '@/hooks/api/useFavorites';
import { useAuth } from '@/hooks/api/useAuth';
import { showToast } from '@/lib/utils/toast';

export interface MangaCardProps {
  manga?: MangaList;
  id?: string;
  title?: string;
  coverImage?: string;
  type?: string;
  status?: string;
  rating?: number;
  chapter?: string;
  views?: number;
  disableNavigation?: boolean;
  viewMode?: 'grid' | 'list';
  year?: number;
  genres?: string[];
  age?: string;
  onRemoveFromFavorites?: (mangaId: string) => void;
  showRemoveButton?: boolean;
}

const MangaCard = ({ 
  manga, 
  id, 
  title, 
  coverImage, 
  type, 
  status, 
  chapter, 
  rating,
  views,
  disableNavigation = false,
  viewMode = 'grid',
  year,
  genres = [],
  age,
  onRemoveFromFavorites,
  showRemoveButton = false
}: MangaCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const { isInFavorites, toggleFavorite, isAddingToFavorites, isRemovingFromFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const mangaId = id || manga?.slug || manga?.id?.toString() || '';
  const mangaTitle = title || manga?.title || '';
  const mangaCover = coverImage || manga?.cover || '';
  const mangaType = type || manga?.category?.name || '';
  const mangaStatus = status || manga?.status || '';
  const mangaRating = rating || manga?.rating || 0;
  const mangaViews = views || manga?.views || 0;
  const mangaYear = year || manga?.year || 0;
  const mangaGenres = genres.length > 0 ? genres : manga?.genres?.map(g => g.name) || [];
  const mangaAge = age || manga?.age?.name || '';
  

  const getStatusText = (status: string) => {
    switch(status) {
      case 'ongoing': return 'Jarayonda';
      case 'completed': return 'Yakunlangan';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ongoing': return 'bg-[#ff9900]/20 text-[#ff9900] border-[#ff9900]/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-[#666]/20 text-[#888] border-[#666]/30';
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    if (!isAuthenticated) {
      showToast('Sevimlilarga qo\'shish uchun tizimga kiring', 'error');
      return;
    }
    
    if (manga?.id) {
      await toggleFavorite(manga.id.toString());
    }
  };

  const handleRemoveFromFavorites = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveFromFavorites && manga?.id) {
      onRemoveFromFavorites(manga.id.toString());
    }
  };

  const cardContent = (
    <>
      <div className="relative overflow-hidden group">
        <div className={`relative ${viewMode === 'list' ? 'aspect-[3/4] w-32' : 'aspect-[3/4] w-full'} sm:aspect-[3/4] aspect-[2/3]`}>
          {!isMounted || (!imageLoaded && !imageError) ? (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] animate-pulse" />
          ) : null}
          
          {isMounted && (
            <Image
              src={imageError || !mangaCover || mangaCover === '' ? '/images/manga-placeholder.jpg' : mangaCover}
              alt={mangaTitle || 'Manga Cover'}
              fill
              sizes={viewMode === 'list' ? "128px" : "(max-width: 640px) 33vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"}
              className={`object-cover transition-all duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-110`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              priority={false}
            />
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Top badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
            {/* Rating badge */}
            <div className="flex items-center px-2 py-1 bg-black/80 backdrop-blur-sm rounded-full text-[#ff9900] text-xs font-bold transition-all duration-200 group-hover:scale-105">
              <Star className="w-3 h-3 mr-1 fill-[#ff9900] stroke-none" />
              {mangaRating ? mangaRating.toFixed(1) : '0.0'}
            </div>
          </div>
          
          {/* Favorite button - top right */}
          {manga?.id && (
            <button 
              onClick={handleFavoriteClick}
              disabled={isAddingToFavorites || isRemovingFromFavorites}
              className={`absolute top-2 right-2 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl ${
                isInFavorites(manga.id)
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInFavorites(manga.id) ? 'fill-current' : ''}`} />
            </button>
          )}
          
          {/* Bottom badges - only chapter badge */}
          <div className="absolute bottom-2 right-2 flex flex-col gap-1">
            {/* Chapter badge */}
            {chapter && (
              <div className="flex items-center px-2 py-1 bg-black/80 backdrop-blur-sm rounded-full text-white text-xs font-medium transition-all duration-200 group-hover:scale-105">
                <BookOpen className="w-3 h-3 mr-1" />
                {chapter}
              </div>
            )}
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

          {/* Remove from favorites button */}
          {showRemoveButton && onRemoveFromFavorites && (
            <button
              onClick={handleRemoveFromFavorites}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all duration-200 hover:scale-110 shadow-lg opacity-0 group-hover:opacity-100"
              title="Sevimlilardan olib tashlash"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <div className="p-2 sm:p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-xs sm:text-sm leading-tight line-clamp-2 text-white group-hover:text-[#ff9900] transition-colors mb-2">
            {mangaTitle}
          </h3>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#888] font-medium">{mangaType}</span>
            <div className="flex items-center gap-2">
              {mangaYear && (
                <span className="text-xs text-[#666]">{mangaYear}</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg leading-tight text-white group-hover:text-[#ff9900] transition-colors flex-1 mr-4">
              {mangaTitle}
            </h3>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-[#888] mb-3">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{mangaType}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-[#ff9900] font-medium bg-[#ff9900]/10 px-2 py-1 rounded">
                {mangaAge || ''}
              </span>
            </div>
            {mangaYear && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{mangaYear}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-[#ff9900]" />
              <span>{mangaRating ? mangaRating.toFixed(1) : '0.0'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {chapter && (
              <div className="flex items-center gap-1 text-xs text-[#a0a0a0]">
                <BookOpen className="w-3 h-3" />
                <span>{chapter}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  if (disableNavigation) {
    return (
      <div 
        className={`group block bg-[#0f0f0f] rounded-xl overflow-hidden border border-[#1a1a1a] hover:border-[#ff9900]/50 hover:shadow-xl hover:shadow-[#ff9900]/10 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] cursor-pointer h-full flex flex-col w-full ${
          viewMode === 'list' ? 'flex-row' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div className={`group block bg-[#0f0f0f] rounded-xl overflow-hidden border border-[#1a1a1a] hover:border-[#ff9900]/50 hover:shadow-xl hover:shadow-[#ff9900]/10 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] relative cursor-pointer h-full flex flex-col w-full ${
      viewMode === 'list' ? 'flex-row' : ''
    }`}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}>
      {cardContent}
      <Link 
        href={`/main/manga/${mangaId}`} 
        className="absolute inset-0 z-5"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="sr-only">Manga ko'rish</span>
      </Link>
    </div>
  );
};

export default MangaCard; 