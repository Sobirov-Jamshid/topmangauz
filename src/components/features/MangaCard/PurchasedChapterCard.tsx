"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, CheckCircle } from "lucide-react";

interface PurchasedChapterCardProps {
  manga: any;
  chapter: any;
}

const PurchasedChapterCard = ({ manga, chapter }: PurchasedChapterCardProps) => {
  return (
    <Link
      href={`/main/read/${manga.slug}/chapter/${chapter.id}`}
      className="
        group relative bg-[#0f0f0f] rounded-xl overflow-hidden 
        border border-[#1a1a1a] hover:border-[#ff9900]/50 
        hover:shadow-xl hover:shadow-[#ff9900]/10 
        transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]
      "
    >
      {/* Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <Image
          src={manga.cover}
          alt={manga.title}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-110"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* ✅ Purchased badge */}
        <div className="absolute top-2 left-2 bg-[#22c55e] text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Sotib olingan 
        </div>

        {/* 📘 Chapter badge */}
        <div className="absolute bottom-2 right-2 bg-[#ff9900] text-black text-xs font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          Bob {chapter.title}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-[#ff9900]">
          {manga.title}
        </h3>
        <p className="text-xs text-[#888] mt-1">
          {manga.category?.name || "Manga"}
        </p>
      </div>
    </Link>
  );
};

export default PurchasedChapterCard;
