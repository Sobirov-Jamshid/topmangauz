"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ReadingHistory } from '@/lib/api/types';

interface ContinueReadingProps {
  readingHistory?: ReadingHistory[];
  isLoading?: boolean;
  error?: any;
}

interface HistoryRowProps {
  item: ReadingHistory;
}

function HistoryRow({ item }: HistoryRowProps) {
  const manga = item.manga;
  const chapter = item.chapter;
  const lastRead = item.last_read ? new Date(item.last_read).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) : '';
  
  const progress = 50; // Default to 50% for now

  return (
    <Link
      href={`/main/read/${manga.slug}/chapter/${chapter.id}`}
      className="flex p-4 hover:bg-[#1a1a1a] transition-colors"
    >
      <div className="w-16 h-24 relative rounded overflow-hidden flex-shrink-0">
        <Image
          src={manga.cover || '/images/manga-placeholder.jpg'}
          alt={manga.title}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="ml-3 flex-grow">
        <h3 className="font-medium text-sm line-clamp-2 text-white hover:text-[#ff9900] transition-colors">
          {manga.title}
        </h3>
        <div className="flex items-center mt-1 text-xs text-[#a0a0a0]">
          <BookOpen className="w-3.5 h-3.5 mr-1" />
          <span>Bob: {chapter.title}</span>
        </div>
        <div className="mt-2">
          <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ff9900] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-[#ff9900]">{progress}%</span>
            <div className="flex items-center text-xs text-[#a0a0a0]">
              <Clock className="w-3 h-3 mr-1" />
              <span>{lastRead}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ContinueReading({ readingHistory = [], isLoading = false, error }: ContinueReadingProps) {
  if (isLoading) {
    return (
      <div className="bg-[#121212] rounded border border-[#1a1a1a] overflow-hidden">
        <div className="p-4 border-b border-[#1a1a1a]">
          <h2 className="font-bold text-white">O'qishni davom ettirish</h2>
        </div>
        <div className="flex items-center justify-center h-40">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error && error.response?.status === 401) {
    return (
      <div className="bg-[#121212] rounded border border-[#1a1a1a] overflow-hidden">
        <div className="p-4 border-b border-[#1a1a1a]">
          <h2 className="font-bold text-white">O'qishni davom ettirish</h2>
        </div>
        <div className="p-8 text-center">
          <BookOpen className="w-8 h-8 text-[#a0a0a0] mx-auto mb-3" />
          <p className="text-sm text-[#a0a0a0] mb-3">
            O'qish tarixini ko'rish uchun tizimga kiring
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-4 py-2 bg-[#ff9900] hover:bg-[#ff9900]/90 rounded text-sm text-white transition-colors"
          >
            Kirish
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#121212] rounded border border-[#1a1a1a] overflow-hidden">
      <div className="p-4 border-b border-[#1a1a1a]">
        <h2 className="font-bold text-white">O'qishni davom ettirish</h2>
      </div>
      
      {readingHistory && readingHistory.length > 0 ? (
        <div className="divide-y divide-[#1a1a1a]">
          {readingHistory.slice(0, 3).map((item) => (
            <HistoryRow key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <BookOpen className="w-8 h-8 text-[#a0a0a0] mx-auto mb-3" />
          <p className="text-sm text-[#a0a0a0]">
            Hali hech qanday manga o'qimagansiz
          </p>
          <Link
            href="/main/manga"
            className="mt-3 inline-block px-4 py-2 bg-[#1a1a1a] hover:bg-[#252525] rounded text-sm text-white transition-colors"
          >
            Manga ko'rish
          </Link>
        </div>
      )}
    </div>
  );
} 