"use client";

import { useAuth } from "@/hooks/api/useAuth";
import PurchasedChapterCard from "@/components/features/MangaCard/PurchasedChapterCard";

export default function PurchasedChaptersPage() {
  const { getUserProfile } = useAuth();
  const userProfile = getUserProfile.data;

  return (
    <div className="min-h-screen bg-black p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Sotib olingan boblar
      </h1>

      {userProfile?.purchased_chapters?.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {userProfile.purchased_chapters.map((item: any, index: number) => (
            <PurchasedChapterCard
              key={index}
              manga={item.manga}
              chapter={item.chapter}
            />
          ))}
        </div>
      ) : (
        <p className="text-[#888] text-center mt-10">
          Siz hali hech qanday bob sotib olmadingiz
        </p>
      )}
    </div>
  );
}
