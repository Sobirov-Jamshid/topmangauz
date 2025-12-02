"use client";

import React, { useState } from "react";
import { useFavorites } from "@/hooks/api/useFavorites";
import MangaCard from "@/components/features/MangaCard/MangaCard";
import { Heart, Grid, List, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FavoritesPage() {
  const {
    favorites,
    isLoadingFavorites,
    favoritesError,
    removeFromFavorites,
  } = useFavorites();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredFavorites =
    favorites?.filter((favorite: any) => {
      const title = favorite.manga.title?.toLowerCase() || "";
      const category = favorite.manga.category?.name?.toLowerCase() || "";
      const author = favorite.manga.author?.name?.toLowerCase() || "";

      const term = searchTerm.toLowerCase();

      const matchesSearch =
        title.includes(term) || category.includes(term) || author.includes(term);

      const matchesStatus =
        selectedStatus === "all" || favorite.manga.status === selectedStatus;

      return matchesSearch && matchesStatus;
    }) || [];

  const handleRemoveFromFavorites = async (mangaId: string) => {
    try {
      await removeFromFavorites(mangaId);
    } catch {
      // silent
    }
  };

  if (isLoadingFavorites) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff9900]" />
          </div>
        </div>
      </div>
    );
  }

  if (favoritesError) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center py-12">
            <h1 className="text-xl sm:text-2xl font-bold text-red-500 mb-4">
              Xatolik yuz berdi
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Sevimlilarni yuklashda muammo bor
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-5 sm:mb-7">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-[#ff9900]" />
              <h1 className="text-2xl sm:text-3xl font-bold">Sevimlilar</h1>
              <span className="bg-[#ff9900] text-black px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                {favorites?.length || 0}
              </span>
            </div>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Sizning sevimli mangalaringiz ro&apos;yxati
          </p>
        </div>

        {/* Filters & Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Manga qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-[#333] text-white placeholder-gray-400 focus:border-[#ff9900] focus:ring-[#ff9900] h-10"
              />
            </div>

            {/* Status filter */}
            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-[#1a1a1a] border border-[#333] text-white rounded-md focus:border-[#ff9900] focus:ring-[#ff9900] appearance-none h-10"
              >
                <option value="all">Barcha holatlar</option>
                <option value="ongoing">Jarayonda</option>
                <option value="completed">Yakunlangan</option>
              </select>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex justify-center sm:justify-end">
            <div className="flex bg-[#1a1a1a] rounded-lg p-1">
              <Button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-md transition-all ${
                  viewMode === "grid"
                    ? "bg-[#ff9900] text-black"
                    : "bg-transparent text-gray-400 hover:text-white"
                }`}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-[#ff9900] text-black"
                    : "bg-transparent text-gray-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredFavorites.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">
              {searchTerm || selectedStatus !== "all"
                ? "Qidiruv natijasi topilmadi"
                : "Sevimlilar ro'yxati bo'sh"}
            </h2>
            <p className="text-gray-500 text-sm sm:text-base px-4">
              {searchTerm || selectedStatus !== "all"
                ? "Boshqa qidiruv so'zlari yoki filtrlarni sinab ko'ring"
                : "Mangalarni sevimlilarga qo'shish uchun manga sahifasiga o'ting"}
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-3 sm:gap-4 md:gap-6 ${
              viewMode === "grid"
                ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
                : "grid-cols-1"
            }`}
          >

            {filteredFavorites.map((favorite: any, index: number) => (
              <MangaCard
                key={`favorite-${favorite.id || index}`}
                manga={favorite.manga}
                viewMode={viewMode}
                showRemoveButton={true}
                onRemoveFromFavorites={handleRemoveFromFavorites}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
