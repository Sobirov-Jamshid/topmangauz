"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Calendar, Star } from "lucide-react";
import { useLatestChapters } from "@/hooks/api/useLatestChapters";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { LatestChapter } from "@/hooks/api/useLatestChapters";

export default function LatestChapters() {
  const { latestChapters, isLoading, error } = useLatestChapters();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !latestChapters || latestChapters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Oxirgi qo&apos;shilgan boblar mavjud emas</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Hozir";
    if (diffInHours < 24) return `${diffInHours} soat oldin`;
    if (diffInHours < 48) return "Kecha";
    return date.toLocaleDateString("uz-UZ");
  };

  return (
    <div className="space-y-3">
      {/* Desktop: 2 ta ustun, mobil: 1 ustun */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {latestChapters.slice(0, 6).map((item: LatestChapter) => {
          const extraCount = Math.max(item.new_chapters_count - 1, 0);

          return (
            <Link
              key={item.id}
              href={`/main/manga/${item.slug}/`}
              className="
                group flex
                bg-[#0f0f0f]
                rounded-xl
                border border-[#1a1a1a]
                hover:border-[#ff9900]/40
                hover:shadow-lg hover:shadow-[#ff9900]/10
                transition-all duration-200
                px-3 py-2
              "
            >
              {/* Cover */}
              <div className="relative w-16 h-24 flex-shrink-0 rounded-md overflow-hidden mr-3">
                <Image
                  src={item.cover || "/images/manga-placeholder.jpg"}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />

                {/* Reyting – chap tepada */}
                <div className="absolute top-1 left-1">
                  <div className="flex items-center gap-1 bg-black/80 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[#ff9900] text-[11px] font-semibold">
                    <Star className="w-3 h-3 fill-[#ff9900] stroke-none" />
                    {(item.rating ?? 0).toFixed(1)}
                  </div>
                </div>

                {/* Age badge – pastda, agar bor bo'lsa */}
                {item.age && (
                  <div className="absolute bottom-1 left-1">
                    <span className="px-1.5 py-0.5 rounded bg-red-600 text-[10px] font-semibold text-white">
                      {item.age.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-center">
                {/* Manga nomi */}
                <h3 className="text-[14px] font-semibold text-white group-hover:text-[#ff9900] transition-colors line-clamp-1">
                  {item.title}
                </h3>

                {/* Eng oxirgi bob + yana nechta bob */}
                <p className="mt-1 text-[13px] text-white line-clamp-1">
                  Bob {item.last_chapter_title}
                  {extraCount > 0 && (
                    <span
                      className="
                        ml-2 px-2 py-[2px] 
                        bg-[#1a1a1a] 
                        border border-[#333] 
                        rounded-full
                        text-[#ff9900] 
                        font-semibold
                        text-[11px]
                      "
                    >
                      + yana {extraCount} bob
                    </span>
                  )}
                </p>

                {/* Vaqt */}
                <div className="mt-1 flex items-center gap-1 text-[11px] text-[#888]">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(item.last_chapter_created_at)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
