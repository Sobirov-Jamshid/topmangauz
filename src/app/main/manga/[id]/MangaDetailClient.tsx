"use client";
import { useRouter } from "next/navigation";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Heart,
  Lock,
  Unlock,
  DollarSign,
  MessageSquare,
  Eye,
  Home,
} from "lucide-react";
import { MangaDetailSkeleton } from "@/components/ui/skeleton";
import {
  useMangaDetail,
  usePurchaseChapter,
  useAddReview,
} from "@/hooks/api/useManga";
import { useFavorites } from "@/hooks/api/useFavorites";
// import { useBalance } from "@/hooks/api/useUser";
import { useAuth } from "@/hooks/api/useAuth";
import { showToast } from "@/lib/utils/toast";
import { useQueryClient } from "@tanstack/react-query";
import ReviewForm from "@/components/features/ReviewForm";
import ReviewCard from "@/components/features/ReviewCard";
import RatingComponent from "@/components/features/RatingComponent";
import {
  useUserRating,
  useCreateRating,
  useUpdateRating,
} from "@/hooks/api/useRating";
import MangaRatingStats from "./MangaRatingStats";

interface MangaDetailClientProps {
  slug: string; // slug
}

export default function MangaDetailClient({ slug }: MangaDetailClientProps) {
  const [activeTabs, setActiveTabs] = useState<"chapters" | "stats" | "reviews">(
    "chapters"
  );
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const {
    data: mangaResponse,
    isLoading,
    error,
  } = useMangaDetail(slug);

  const manga = Array.isArray(mangaResponse)
    ? mangaResponse[0]
    : (mangaResponse?.data || mangaResponse?.results || mangaResponse);

  const { user, isAuthenticated } = useAuth();

  // Tasdiqlash modali uchun state
  const [purchaseConfirm, setPurchaseConfirm] = useState<{
    chapterId: number;
    chapterPrice: number;
  } | null>(null);

  // Faqat authenticated foydalanuvchilar uchun protected hook'lar
  const {
    favorites: favoritesResponse,
    isLoadingFavorites,
    favoritesError,
    toggleFavorite: toggleFavoriteHook,
    isAddingToFavorites,
    isRemovingFromFavorites,
  } = useFavorites();
  // const { data: balanceData, isLoading: isLoadingBalance } = useBalance();
  const { data: userRatingData, isLoading: isLoadingRating } =
    useUserRating(slug);

  const purchaseChapter = usePurchaseChapter();
  const addReview = useAddReview(slug);
  const queryClient = useQueryClient();

  // const userBalance = balanceData?.balance || 0;
  const createRating = useCreateRating();
  const updateRating = useUpdateRating();

  const currentUserRating = userRatingData?.[0]?.rating || 0;

  // Foydalanuvchi tizimga kirmagan bo'lsa, favorites bilan bog'liq ma'lumotlarni cheklash
  const safeFavoritesResponse =
    isAuthenticated && Array.isArray(favoritesResponse)
      ? favoritesResponse
      : [];

  const favoriteItem = useMemo(() => {
    if (!safeFavoritesResponse || safeFavoritesResponse.length === 0 || !manga)
      return null;
    return safeFavoritesResponse.find((f) => f.manga.id === manga.id);
  }, [safeFavoritesResponse, manga]);

  const isFavorite = !!favoriteItem;

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast("Sevimlilarga qo'shish uchun tizimga kiring", "error");
      return;
    }

    if (manga?.id) {
      await toggleFavoriteHook(manga.id.toString());
    }
  };

  const handleRatingChange = async (rating: number) => {
    if (!isAuthenticated) {
      showToast("Reyting berish uchun tizimga kiring", "error");
      return;
    }

    try {
      // Agar user'ning rating'i bo'lsa, yangilash
      if (currentUserRating > 0) {
        await updateRating.mutateAsync({
          mangaId: slug,
          data: { rating },
        });
      } else {
        // Agar rating yo'q bo'lsa, yangi yaratish
        await createRating.mutateAsync({
          mangaId: slug,
          data: { rating },
        });
      }
    } catch (error: any) {
      // Error handling hook'larda amalga oshiriladi
    }
  };

  const isRatingDisabled =
    isLoadingRating || createRating.isPending || updateRating.isPending;

  const userRatingBlock = (
    <div className="mt-2 sm:mt-3 flex justify-center">
      <div
        className="
          relative 
          flex items-center gap-3
          bg-gradient-to-r from-[#1a1200]/80 to-[#0a0a0a]/80
          border border-[#ff9900]/30
          rounded-2xl px-4 py-2
          shadow-lg shadow-[#ff9900]/10
          backdrop-blur-md
          hover:shadow-[#ff9900]/20 transition-all
        "
      >
        <span className="text-xs sm:text-sm text-[#ffcc80] font-semibold tracking-wide">
          Reytingingiz:
        </span>

        <div className="flex items-center scale-110">
          <RatingComponent
            mangaId={slug}
            currentRating={currentUserRating}
            onRatingChange={handleRatingChange}
            size="md"
            showLabel={false}
            compact={true}
            disabled={isRatingDisabled || !isAuthenticated}
          />
        </div>

        <div className="absolute inset-0 rounded-2xl bg-[#ff9900]/5 pointer-events-none" />
      </div>
    </div>
  );

  // Haqiqiy xarid qilish funksiyasi (tasdiqlangandan keyin chaqiriladi)
  const performPurchase = async (chapterId: number, chapterPrice: number) => {
    try {
      await purchaseChapter.mutateAsync(chapterId);

      await queryClient.invalidateQueries({ queryKey: ["manga", slug] });
      await queryClient.invalidateQueries({ queryKey: ["mangaChapters", slug] });
      await queryClient.invalidateQueries({ queryKey: ["readingHistory"] });
      await queryClient.invalidateQueries({ queryKey: ["balance"] });

      showToast(
        `Bob muvaffaqiyatli sotib olindi! ${chapterPrice} TopCoin hisobingizdan yechildi`,
        "success"
      );
    } catch (error: any) {
      if (error?.response?.status === 400) {
        const errorData = error?.response?.data;
        const errorMessage =
          errorData?.error ||
          errorData?.detail ||
          errorData?.message ||
          "Ma'lumotlar noto'g'ri";

        if (
          errorMessage.includes("yetarli mablag") ||
          errorMessage.includes("insufficient")
        ) {
          showToast(
            "Hisobingizda yetarli mablag' yo'q. Balansingizni to'ldiring!",
            "error"
          );
          router.push("/main/profile?tab=subscription");
        } else if (
          errorMessage.includes("already purchased") ||
          errorMessage.includes("sotib olingan")
        ) {
          showToast("ℹ️ Bu bob allaqachon sotib olingan", "success");
        } else {
          showToast(`❌ Xatolik: ${errorMessage}`, "error");
        }
      } else if (error?.response?.status === 401) {
        showToast(
          "Ro'yxatdan o'ting yoki tizimga kirishni amalga oshiring",
          "error"
        );
      } else if (error?.response?.status === 403) {
        showToast("Bu amalni bajarish uchun ruxsat yo'q", "error");
      } else if (error?.response?.status === 404) {
        showToast("❌ Bob topilmadi", "error");
      } else {
        showToast("❌ Bobni sotib olishda xatolik", "error");
      }
    }
  };

  // Xarid qilish bosilganda – avval balans va tasdiqlash
  const handlePurchaseChapter = async (chapterId: number, chapterPrice: number) => {
    if (!isAuthenticated) {
      showToast("Bob sotib olish uchun tizimga kiring", "error");
      return;
    }

    const userBalance = user?.balance ?? 0;

    // Avval balansni tekshiramiz
    if (chapterPrice > userBalance) {
      showToast(
        "Hisobingizda yetarli mablag' yo'q. Balansni to'ldirish uchun profilga o'ting.",
        "error"
      );
      router.push(
        `/main/read/${manga.slug}/chapter/${chapterId}`
      )
      return;
    }

    // Balans yetarli bo'lsa — tasdiqlash modali ochiladi
    setPurchaseConfirm({ chapterId, chapterPrice });
  };

  const handleConfirmPurchase = async () => {
    if (!purchaseConfirm) return;
    await performPurchase(
      purchaseConfirm.chapterId,
      purchaseConfirm.chapterPrice
    );
    setPurchaseConfirm(null);
  };

  const handleCancelPurchase = () => {
    setPurchaseConfirm(null);
  };

  const handleAddReview = async (text: string, rating: number) => {
    if (!isAuthenticated) {
      showToast("Izoh qo'shish uchun tizimga kiring", "error");
      return;
    }

    try {
      await addReview.mutateAsync({ text, rating });
      showToast("Izoh muvaffaqiyatli qo'shildi", "success");
    } catch (error) {
      showToast("Izoh qo'shishda xatolik", "error");
    }
  };

  const safeChapters = Array.isArray(manga?.chapters) ? manga.chapters : [];

  // Sort chapters in ascending order by chapter number for consistent "first chapter" logic
  const sortedChaptersAsc = useMemo(() => {
    if (!safeChapters || safeChapters.length === 0) return [];
    const arr = [...safeChapters];
    return arr.sort((a, b) => {
      const aNum = parseInt(a.title.replace(/\D/g, "")) || 0;
      const bNum = parseInt(b.title.replace(/\D/g, "")) || 0;
      return aNum - bNum; // Ascending: smallest chapter number first
    });
  }, [safeChapters]);

  const sortedChapters = useMemo(() => {
    if (!safeChapters || safeChapters.length === 0) return [];
    const arr = [...safeChapters];
    return arr.sort((a, b) => {
      const aNum = parseInt(a.title.replace(/\D/g, "")) || 0;
      const bNum = parseInt(b.title.replace(/\D/g, "")) || 0;
      return sortOrder === "newest" ? bNum - aNum : aNum - bNum;
    });
  }, [safeChapters, sortOrder]);

  // Now get the first chapter (smallest number), regardless of access_type for the top button
  const firstChapterId = sortedChaptersAsc[0]?.id;

  useEffect(() => {
    setImageError(false);
  }, [manga?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-black">
        <Link
          href="/main/manga"
          className="inline-flex items-center text-[#a0a0a0] hover:text-[#ff9900] mb-6"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Katalogga qaytish
        </Link>
        <MangaDetailSkeleton />
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white">
        Manga ma'lumotlarini yuklashda xatolik
      </div>
    );
  }

  return (
    <div
      className="
      container 
      mx-auto 
      bg-black 
      text-white 
      px-3 sm:px-4 
      py-3 sm:py-6 md:py-8
    "
    >


      {/* ====== Xaridni tasdiqlash modali ====== */}
      {purchaseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-xl w-[90%] max-w-sm p-5 shadow-xl border border-[#2a2a2a]">
            <h3 className="text-lg font-semibold text-white mb-2">
              Sotib olishni tasdiqlaysizmi?
            </h3>
            <p className="text-sm text-[#a0a0a0] mb-4">
              Siz ushbu bobni{" "}
              <span className="text-[#ff9900] font-semibold flex items-center gap-1">
              {purchaseConfirm.chapterPrice}
              <Image
                src="/images/icon.png"
                alt="Coin"
                width={12}
                height={12}
                className="w-3 h-3 sm:w-4 sm:h-4 object-contain"
              />{" "}
              TopCoin
              </span>{" "}
              evaziga sotib olmoqchimisiz?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelPurchase}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2a2a2a] text-[#e5e5e5] hover:bg-[#343434] transition-colors"
              >
                Yo‘q
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#ff9900] text-black hover:bg-[#ff8800] transition-colors disabled:opacity-60"
                disabled={purchaseChapter.isPending}
              >
                {purchaseChapter.isPending ? "Xarid qilinmoqda..." : "Ha, sotib olish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav
        className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#a0a0a0] mb-4 sm:mb-6 overflow-hidden"
        aria-label="Breadcrumb"
      >
        {/* Mobile: faqat icon va title */}
        <div className="flex items-center gap-1 sm:hidden min-w-0 flex-1">
          <Link
            href="/main"
            className="hover:text-[#ff9900] transition-colors flex-shrink-0"
          >
            <Home className="w-4 h-4" />
          </Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span
            className="text-white font-medium truncate"
            title={manga?.title || "Manga"}
          >
            {manga?.title || "Manga"}
          </span>
        </div>

        {/* Desktop: to'liq breadcrumb */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/main"
            className="hover:text-[#ff9900] transition-colors flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            <span>Bosh sahifa</span>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link
            href="/main/manga"
            className="hover:text-[#ff9900] transition-colors"
          >
            Katalog
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span
            className="text-white font-medium max-w-xs lg:max-w-md xl:max-w-lg truncate"
            title={manga?.title || "Manga"}
          >
            {manga?.title || "Manga"}
          </span>
        </div>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Cover */}
        <div className="w-full sm:w-48 md:w-56 lg:w-64 xl:w-72 flex-shrink-0 mx-auto md:mx-0">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-[#1a1a1a] shadow-xl w-full max-w-[200px] sm:max-w-[240px] md:max-w-none mx-auto md:mx-0 bg-[#1a1a1a]">
            {!imageError ? (
              <Image
                src={manga.cover || "/images/manga-placeholder.jpg"}
                alt={manga.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, (max-width: 1024px) 224px, (max-width: 1280px) 256px, 288px"
                priority
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]">
                <div className="text-center p-4">
                  <BookOpen className="w-16 h-16 text-[#ff9900]/50 mx-auto mb-2" />
                  <p className="text-[#a0a0a0] text-sm">Rasm yuklanmadi</p>
                </div>
              </div>
            )}

            {/* Rating and Views Overlay - Bottom Center */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
              {/* ⭐ Rating badge – clickable */}
              <button
                type="button"
                onClick={() => {
                  setActiveTabs("stats");
                  if (typeof document !== "undefined") {
                    const el = document.getElementById("rating-section");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }
                }}
                className="
                   flex items-center gap-2 
                   bg-gradient-to-r from-[#ff9900]/90 to-[#ff6600]/90 
                   backdrop-blur-sm rounded-xl px-4 py-2 
                   border border-[#ff9900]/50 shadow-lg
                   hover:scale-105 active:scale-95 
                   transition-transform
                 "
                title="Reyting berish"
              >
                <Star className="w-5 h-5 fill-white text-white" />
                <span className="text-sm font-bold text-white">
                  {manga.rating?.toFixed(1) || "0.0"}
                </span>
              </button>

              {/* 👁 Views badge */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-gray-600/90 to-gray-700/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-500/50 shadow-lg">
                <Eye className="w-5 h-5 text-white" />
                <span className="text-sm font-bold text-white">
                  {manga.views?.toLocaleString() || "0"}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex mt-4 gap-2 w-full max-w-[200px] sm:max-w-[240px] md:max-w-none mx-auto md:mx-0">
            {firstChapterId && (
              <Link
                href={`/main/read/${manga.slug}/chapter/${firstChapterId}`}
                className="flex-1 flex items-center justify-center gap-2 bg-[#ff9900] text-white py-2 rounded-lg hover:bg-[#ff9900]/90 transition-colors font-medium text-sm"
              >
                <BookOpen className="w-5 h-5 opacity-80" />
                <span>O‘qish 1 / {manga.chapters?.length || 0}</span>
              </Link>
            )}

            <button
              disabled={isAddingToFavorites || isRemovingFromFavorites}
              onClick={toggleFavorite}
              className={`
                w-10 h-10 flex items-center justify-center rounded-full 
                transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl
                ${
                  isFavorite
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                }
                ${
                  isAddingToFavorites || isRemovingFromFavorites
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              `}
              title={
                isFavorite
                  ? "Sevimlilardan olib tashlash"
                  : "Sevimlilarga qo‘shish"
              }
            >
              <Heart
                className={`
                  w-5 h-5 transition-all duration-200
                  ${isFavorite ? "fill-current" : ""}
                `}
              />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold leading-tight">
            {manga.title}
          </h1>
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-[#a0a0a0]">
            <span>{manga.year}</span>
            <span>·</span>
            <span>
              {manga.status === "ongoing"
                ? "Davom etmoqda"
                : manga.status === "completed"
                ? "Tugallangan"
                : manga.status === "hiatus"
                ? "To‘xtatilgan"
                : manga.status === "frozen"
                ? "Muzlatilgan"
                : ""}
            </span>

            <span>·</span>
            <span>{manga.category.name}</span>
            <span>·</span>
            <span className="text-[#ff9900] font-medium">
              {manga.age?.name || ""}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm flex-wrap">
            <span className="flex items-center">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />{" "}
              {manga.chapters?.length || 0} bob
            </span>
            {/* Faqat authenticated foydalanuvchilar uchun balance ko'rsatish */}
            {/* {isAuthenticated && userBalance > 0 && (
              <span className="flex items-center text-green-400">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> 
                {isLoadingBalance ? "..." : `${userBalance} so'm`}
              </span>
            )} */}
          </div>
          <div className="flex flex-wrap gap-2">
            {(showAllGenres ? manga.genres : manga.genres.slice(0, 4)).map(
              (g: any) => (
                <span
                  key={g.id}
                  className="px-2 py-1 bg-[#1a1a1a] rounded text-xs"
                >
                  {g.name}
                </span>
              )
            )}
            {manga.genres.length > 4 && !showAllGenres && (
              <button
                onClick={() => setShowAllGenres(true)}
                className="px-2 py-1 bg-[#1a1a1a] rounded text-xs text-[#a0a0a0] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                +{manga.genres.length - 4}
              </button>
            )}
            {showAllGenres && manga.genres.length > 4 && (
              <button
                onClick={() => setShowAllGenres(false)}
                className="px-2 py-1 bg-[#1a1a1a] rounded text-xs text-[#a0a0a0] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                Kamroq
              </button>
            )}
          </div>
          <div className="text-xs sm:text-sm">
            <span className="text-[#a0a0a0]">Tarjimon:</span>{" "}
            {manga.author.name}
          </div>

          {/* Description */}
          {manga.description && (
            <div className="mt-4 sm:mt-6">
              <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3">
                Tavsif
              </h3>
              <div className="prose max-w-none text-[#a0a0a0] leading-relaxed text-left">
                <div
                  className={`text-xs sm:text-sm ${
                    !showFullDescription
                      ? "line-clamp-2 sm:line-clamp-3"
                      : ""
                  }`}
                >
                  {manga.description}
                </div>
                {manga.description.length > 150 && (
                  <button
                    onClick={() =>
                      setShowFullDescription(!showFullDescription)
                    }
                    className="mt-2 text-[#ff9900] hover:text-[#ff6600] text-xs sm:text-sm font-medium transition-colors"
                  >
                    {showFullDescription
                      ? "Kamroq ko'rsatish"
                      : "Batafsil"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 border-b border-[#1a1a1a] mb-4 sm:mb-6">
        <button
          onClick={() => setActiveTabs("chapters")}
          className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium ${
            activeTabs === "chapters"
              ? "text-[#ff9900] border-b-2 border-[#ff9900]"
              : "text-[#a0a0a0]"
          }`}
        >
          Boblar ({manga.chapters?.length || 0})
        </button>
        <button
          onClick={() => setActiveTabs("reviews")}
          className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium ${
            activeTabs === "reviews"
              ? "text-[#ff9900] border-b-2 border-[#ff9900]"
              : "text-[#a0a0a0]"
          }`}
        >
          <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
          Izohlar ({manga.reviews?.length || 0})
        </button>
        <button
          onClick={() => setActiveTabs("stats")}
          className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium ${
            activeTabs === "stats"
              ? "text-[#ff9900] border-b-2 border-[#ff9900]"
              : "text-[#a0a0a0]"
          }`}
        >
          Statistika
        </button>
      </div>

      {/* Tab content */}
      {activeTabs === "chapters" ? (
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-xl font-semibold">
              Boblar ro'yxati
            </h2>
            <button
              onClick={() =>
                setSortOrder((prev) =>
                  prev === "newest" ? "oldest" : "newest"
                )
              }
              className="flex items-center gap-1 text-xs sm:text-sm text-[#a0a0a0] hover:text-white"
            >
              <span className="hidden sm:inline">
                {sortOrder === "newest" ? "Yangi → Eski" : "Eski → Yangi"}
              </span>
              <span className="sm:hidden">
                {sortOrder === "newest" ? "Yangi" : "Eski"}
              </span>
              <ChevronRight
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
                  sortOrder === "newest" ? "rotate-90" : "-rotate-90"
                }`}
              />
            </button>
          </div>
          <div className="divide-y divide-[#1a1a1a]">
            {sortedChapters.map((ch) => {
              const isPurchased =
                ch.is_purchased === true ||
                ch.is_purchased === "true" ||
                ch.is_purchased === 1;
              // Pullik boblar (paid va 3_days_paid)
              const isPaidChapter =
                ch.access_type === "paid" ||
                ch.access_type === "3_days_paid";
              const isLocked = isPaidChapter && !isPurchased;

              return (
                <Link
                  key={ch.id}
                  href={
                    ch.id &&
                    (ch.access_type === "free" || isPurchased)
                      ? `/main/read/${manga.slug}/chapter/${ch.id}`
                      : "#"
                  }
                  className={`flex items-center py-2 sm:py-3 px-2 rounded hover:bg-[#1a1a1a] transition-colors ${
                    isLocked ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onClick={(e) => {
                    if (isLocked) {
                      e.preventDefault();
                    }
                  }}
                >
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm sm:text-base font-medium truncate">
                        {ch.title}
                      </p>
                    </div>

                    {/* Date row */}
                    <div className="flex items-center gap-1 mt-1 text-xs text-[#a0a0a0]">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {ch.created_at
                          ? new Date(ch.created_at).toLocaleDateString()
                          : "Noma'lum sana"}
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex items-center gap-2 sm:gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isLocked && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (ch.id) {
                            handlePurchaseChapter(ch.id, Number(ch.price ?? 0));
                          }
                        }}

                        
                        className="px-2 sm:px-4 py-1.5 sm:py-2 bg-[#ff9900] text-white rounded-md text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 hover:bg-[#ff6600] transition-colors"
                      >
                        <span className="hidden sm:inline">
                          {ch.price ? parseInt(ch.price) : "Narx yo‘q"}
                        </span>
                        <span className="sm:hidden">
                          {ch.price ? parseInt(ch.price) : "Narx yo‘q"}
                        </span>

                        <Image
                          src="/images/icon.png"
                          alt="Coin"
                          width={12}
                          height={12}
                          className="w-3 h-3 sm:w-4 sm:h-4 object-contain"
                        />
                      </button>
                    )}
                    {isPaidChapter && isPurchased && (
                      <div className="px-2 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-md text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                        <span className="sm:hidden">✓</span>
                      </div>
                    )}
                    <div
                      className={`flex items-center text-xs sm:text-sm ${
                        isLocked ? "text-[#a0a0a0]" : "text-white"
                      }`}
                    >
                      {isLocked ? (
                        <div className="flex items-center gap-1">
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Unlock className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                          <span className="hidden sm:inline"></span>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : activeTabs === "reviews" ? (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-sm sm:text-xl font-semibold mb-3 sm:mb-4">
              Izohlar
            </h2>
            {/* Review Form - faqat authenticated foydalanuvchilar uchun */}
            {isAuthenticated ? (
              <ReviewForm
                onSubmit={handleAddReview}
                isSubmitting={addReview.isPending}
              />
            ) : (
              <div className="text-center py-4 text-[#a0a0a0]">
                <p>Izoh qo'shish uchun tizimga kiring</p>
              </div>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            {manga.reviews && manga.reviews.length > 0 ? (
              manga.reviews.map((review: any) => (
                <ReviewCard key={review.id} review={review} />
              ))
            ) : (
              <div className="text-center py-6 sm:py-8 text-[#a0a0a0]">
                <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">
                  Hali izohlar yo'q. Birinchi izohni siz qoldiring!
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div id="rating-section" className="space-y-4 sm:space-y-6">
          {isAuthenticated ? (
            userRatingBlock
          ) : (
            <div className="text-center text-xs sm:text-sm text-[#a0a0a0]">
              Reyting berish uchun tizimga kiring
            </div>
          )}

          <MangaRatingStats slug={manga.slug} />
        </div>
      )}
    </div>
  );
}
