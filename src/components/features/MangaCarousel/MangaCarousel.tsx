"use client";

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MangaCard from '../MangaCard';
import { MangaList } from '@/lib/api/types';

interface MangaCarouselProps {
  title: string;
  viewAllLink?: string;
  mangas: MangaList[];
}

const MangaCarousel = ({ title, viewAllLink, mangas }: MangaCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isLeftVisible, setIsLeftVisible] = useState(false);
  const [isRightVisible, setIsRightVisible] = useState(true);

  useEffect(() => {
    const updateScrollVisibility = () => {
      if (!carouselRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setScrollPosition(scrollLeft);
      setMaxScroll(scrollWidth - clientWidth);
      setIsLeftVisible(scrollLeft > 0);
      setIsRightVisible(scrollLeft < scrollWidth - clientWidth - 10);
    };
    
    updateScrollVisibility();
    
    const ref = carouselRef.current;
    if (ref) {
      ref.addEventListener('scroll', updateScrollVisibility);
      window.addEventListener('resize', updateScrollVisibility);
    }
    
    return () => {
      if (ref) {
        ref.removeEventListener('scroll', updateScrollVisibility);
        window.removeEventListener('resize', updateScrollVisibility);
      }
    };
  }, [mangas]);

  const scrollToPosition = (position: number) => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollTo({
      left: position,
      behavior: 'smooth'
    });
  };

  const scrollPrev = () => {
    if (!carouselRef.current) return;
    const { clientWidth } = carouselRef.current;
    scrollToPosition(scrollPosition - clientWidth + 100);
  };

  const scrollNext = () => {
    if (!carouselRef.current) return;
    const { clientWidth } = carouselRef.current;
    scrollToPosition(scrollPosition + clientWidth - 100);
  };

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <span className="block w-1 h-6 bg-primary mr-2 rounded"></span>
          {title}
        </h2>
        
        {viewAllLink && (
          <a href={viewAllLink} className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Смотреть все
          </a>
        )}
      </div>
      
      <div className="relative group">
        {isLeftVisible && (
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-background/80 shadow-md border border-border backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        {/* Mobile: 3-column grid; >=sm: horizontal carousel */}
        <div
          ref={carouselRef}
          className="grid grid-cols-3 gap-[2px] sm:flex sm:gap-4 sm:overflow-x-auto pb-0 sm:pb-4 sm:snap-x sm:snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', gridTemplateColumns: 'repeat(3, 110px)' }}
        >
          {mangas.map((manga) => (
            <div
              key={manga.id || manga.slug}
              className="w-[110px] min-w-[110px] sm:min-w-[180px] sm:w-auto sm:snap-start"
            >
              <MangaCard manga={manga} />
            </div>
          ))}
        </div>
        
        {isRightVisible && (
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-background/80 shadow-md border border-border backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <style jsx>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default MangaCarousel; 