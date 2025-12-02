"use client";

import { useAuth } from "@/hooks/api/useAuth";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Monitor,
  LayoutGrid,
  ArrowLeft,
  Maximize,
  Minimize,
  X,
} from "lucide-react";
import { FullScreenLoading } from "@/components/ui/loading-spinner";
import {
  useMangaChapters,
  useChapter,
  usePurchaseChapter,
} from "@/hooks/api/useManga";
import { useReadingProgress } from "@/hooks/api/useReadingProgress";
import PdfViewer from "@/components/common/PdfViewer";
import { AuthGuard } from "@/components/common/AuthGuard";

interface ReadPageClientProps {
  id: string; // manga slug
  chapterNumber: string; // chapter id in URL
}

export default function ReadPageClient({
  id,
  chapterNumber,
}: ReadPageClientProps) {
  return <ReadPageContent id={id} chapterNumber={chapterNumber} />;
}

function ReadPageContent({ id, chapterNumber }: ReadPageClientProps) {
  const chapterNumberInt = parseInt(chapterNumber, 10);
  const chapterId = chapterNumberInt;

  const { data: chapters, isLoading: chaptersLoading } = useMangaChapters(id);
  const safeChapters = Array.isArray(chapters) ? chapters : [];

  // Hozirgi bobni topamiz
  const currentChapter = safeChapters.find((ch: any) => ch.id === chapterId);

  // Boblarni tartiblash (eng eski -> eng yangi)
  const sortedChapters = Array.isArray(safeChapters)
    ? [...safeChapters].sort((a, b) => {
        const aNum = parseInt((a?.title || "").replace(/\D/g, "")) || 0;
        const bNum = parseInt((b?.title || "").replace(/\D/g, "")) || 0;
        return aNum - bNum;
      })
    : [];

  // 1–3-bob yoki free bo'lsa — login shartsiz o'qish mumkin (faqat AuthGuard uchun)
  const isFirstThreeChapters = sortedChapters
    .slice(0, 3)
    .some((ch) => ch.id === chapterId);
  const isFreeChapter = currentChapter?.access_type === "free";
  const canReadWithoutLogin = isFirstThreeChapters || isFreeChapter;

  // Reading progress
  const { markChapterAsRead } = useReadingProgress({
    mangaId: id,
    totalChapters: safeChapters.length,
    onStatusUpdate: () => {},
  });

  // Bob ma'lumotlari
  const {
    data: chapter,
    isLoading: chapterLoading,
    refetch: refetchChapter,
  } = useChapter(chapterId || 0);

  const purchaseMutation = usePurchaseChapter();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [readingMode, setReadingMode] = useState<"scroll" | "continuous">(
    "scroll"
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);

  const [brightness, setBrightness] = useState(100);
  const [containerWidth, setContainerWidth] = useState(50);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const readerRef = useRef<HTMLDivElement>(null);

  // Qurilma turi
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Qurilmaga qarab default sozlamalar
  useEffect(() => {
    if (isMobile) {
      setContainerWidth(100);
      setBrightness(105);
    } else if (isTablet) {
      setContainerWidth(75);
      setBrightness(102);
    } else {
      setContainerWidth(35);
      setBrightness(100);
    }
  }, [isMobile, isTablet]);

  // Yuklanish holati
  useEffect(() => {
    if (!chaptersLoading && !chapterLoading) {
      setIsLoading(false);
    }
  }, [chaptersLoading, chapterLoading]);

  // Bobni o‘qilgan deb belgilash
  useEffect(() => {
    if (currentChapter && chapterId && !isLoading) {
      const timer = setTimeout(() => {
        markChapterAsRead(chapterId);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentChapter, chapterId, isLoading, markChapterAsRead]);

  // Bob rasmlari
  const chapterImages =
    chapter?.images && Array.isArray(chapter.images)
      ? chapter.images
          .sort((a: any, b: any) => a.order - b.order)
          .map((img: any) => img.url)
      : [];

  const pages =
    chapterImages.length > 0
      ? chapterImages.map((url: string, index: number) => ({
          image: url,
          order: index + 1,
        }))
      : [];

  const hasImages = chapterImages.length > 0;

  // Scroll bo'yicha navigatsiya ko‘rsatish/yashirish
  useEffect(() => {
    if (pages.length > 0) {
      const handleScroll = () => {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const scrollPercent =
          scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setProgress(scrollPercent);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        const isScrollingDown = scrollTop > lastScrollTop;
        const isScrollingUp = scrollTop < lastScrollTop;
        const scrollThreshold = 100;

        if (isScrollingDown && scrollTop > scrollThreshold) {
          scrollTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 150);
        } else if (isScrollingUp || scrollTop <= scrollThreshold) {
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          setShowControls(true);
        }

        setLastScrollTop(scrollTop);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [pages.length, lastScrollTop]);

  // Oldingi / keyingi boblar
  const currentIndex = sortedChapters.findIndex(
    (ch: any) => ch.id === chapterId
  );
  const nextChapter =
    currentIndex < sortedChapters.length - 1
      ? sortedChapters[currentIndex + 1]
      : null;
  const prevChapter =
    currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;

  // Sichqoncha va touch orqali tepaga chiqqanda panelni ko‘rsatish
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < window.innerHeight * 0.1) {
        setShowControls(true);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          if (window.pageYOffset > 100) {
            setShowControls(false);
          }
        }, 3000);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches[0].clientY < window.innerHeight * 0.1) {
        setShowControls(true);

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          if (window.pageYOffset > 100) {
            setShowControls(false);
          }
        }, 3000);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handleNextChapter = () => {
    if (nextChapter) {
      window.location.href = `/main/read/${id}/chapter/${nextChapter.id}`;
    }
  };

  const handlePrevChapter = () => {
    if (prevChapter) {
      window.location.href = `/main/read/${id}/chapter/${prevChapter.id}`;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          if (readingMode === "scroll") {
            // Scroll rejimida — tepaga scroll
            e.preventDefault();
            window.scrollBy({
              top: -300,
              behavior: "smooth",
            });
          } else if (readingMode === "continuous") {
            // Sahifa-sahifa rejimida — oldingi page
            e.preventDefault();
            setCurrentPageIndex((prev) => Math.max(prev - 1, 0));
          }
          break;

        case "ArrowDown":
          if (readingMode === "scroll") {
            // Scroll rejimida — pastga scroll
            e.preventDefault();
            window.scrollBy({
              top: 300,
              behavior: "smooth",
            });
          } else if (readingMode === "continuous") {
            // Sahifa-sahifa rejimida — keyingi page
            e.preventDefault();
            setCurrentPageIndex((prev) =>
              Math.min(prev + 1, pages.length - 1)
            );
          }
          break;

        case "Escape":
          setShowControls((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [readingMode, pages.length]);



  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const handlePurchase = async () => {
    if (chapterId) {
      try {
        await purchaseMutation.mutateAsync(chapterId);
        await refetchChapter();
      } catch {
        // xato log qilmasdan, UI ni buzmaymiz
      }
    }
  };

  // ====== LOADING / ERROR HOLATLAR ======
  if (isLoading || chaptersLoading || chapterLoading) {
    return <FullScreenLoading />;
  }

  // Chapter topilmagan
  const notFoundContent = (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Bob topilmadi</h2>
        <p className="text-gray-400 mb-6">
          Kechirasiz, bu bob mavjud emas
        </p>
        <Link
          href={`/main/manga/${id}`}
          className="px-6 py-2 bg-[#ff9900] text-white rounded-md font-medium hover:bg-[#ff9900]/90 transition-colors"
        >
          Manga sahifasiga qaytish
        </Link>
      </div>
    </div>
  );

  if (!chapter) {
    if (canReadWithoutLogin) {
      return notFoundContent;
    }
    return <AuthGuard>{notFoundContent}</AuthGuard>;
  }

  // ====== PAYWALL HISOB-KITOBLARI ======
  const isPurchased =
    chapter.is_purchased === true ||
    chapter.is_purchased === "true" ||
    chapter.is_purchased === 1;

  const isPaidChapter =
    chapter.access_type === "paid" || chapter.access_type === "3_days_paid";

  const isThreeDaysPaid = chapter.access_type === "3_days_paid";

  const userBalance = user?.balance ?? 0;
  const chapterPrice = Number(chapter.price ?? 0);
  const hasEnoughBalance = userBalance >= chapterPrice;
  const priceLabel = chapter?.price ?? "Narx yo'q";

  const formattedExpiryDate = chapter?.expiry_date
    ? new Date(chapter.expiry_date).toLocaleString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // ❗ Barcha pullik boblar (paid yoki 3_days_paid) va hali sotib olinmagan bo‘lsa – PAYWALL
  if (isPaidChapter && !isPurchased) {
    const purchaseContent = (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto text-center text-white p-6">
          <div className="bg-[#121212] border border-[#1a1a1a] rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Pullik bob</h2>

            {/* 3 kunlik boblar uchun alohida matn */}
            {isThreeDaysPaid ? (
              <>
                <p className="text-gray-300 mb-2">
                  <h4>Narxi:{" "}
                  <span className="font-semibold text-[#ff9900]">
                    {priceLabel}
                  </span>{" "}
                  <span className="inline-flex items-center gap-1">
                    TopCoin
                    <Image
                      src="/images/icon.png"
                      alt="Coin"
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 object-contain"
                    />
                  </span>
                  </h4>
                </p>

                {formattedExpiryDate && (
                  <p className="text-gray-400 mb-6">
                    Ushbu bobni{" "}
                    <span className="font-medium text-white">
                      {formattedExpiryDate}
                    </span>{" "}
                    dan boshlab bepul o‘qish mumkin bo‘ladi.
                  </p>
                )}

                <p className="text-gray-400 mb-4">
                  Agar kutishni xohlamasangiz, hoziroq xarid qilib o‘qishingiz
                  mumkin 👇
                </p>
              </>
            ) : (
              // Oddiy pullik boblar uchun matn
              <p className="text-gray-400 mb-6">
                  <h3>Narxi:{" "}
                  <span className="font-semibold text-[#ff9900]">
                    {priceLabel}
                  </span>{" "}
                  <span className="inline-flex items-center gap-1">
                    TopCoin
                    <Image
                      src="/images/icon.png"
                      alt="Coin"
                      width={14}
                      height={14}
                      className="w-3.5 h-3.5 object-contain"
                    />
                  </span>
                </h3>
                  <br/>
                {hasEnoughBalance
                  ? `Bu bob pullik. Xarid qilish uchun ${priceLabel} TopCoin to'lov qilishingiz kerak.`
                  : `Bu bob pullik. Xarid qilish uchun balansingizda yetarli TopCoin yo'q. Balansni to'ldirish uchun profilga o'ting.`}
              </p>
            )}

            <div className="space-y-4">
              {hasEnoughBalance ? (
                <button
                  onClick={handlePurchase}
                  disabled={purchaseMutation.isPending}
                  className="w-full px-6 py-3 bg-[#ff9900] text-white rounded-md font-medium hover:bg-[#ff9900]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {purchaseMutation.isPending ? (
                    "Xarid qilinmoqda..."
                  ) : (
                    <>
                      Xarid qilish ({priceLabel}
                      <Image
                        src="/images/icon.png"
                        alt="Coin"
                        width={16}
                        height={16}
                        className="w-4 h-4 object-contain"
                      />
                      )
                    </>
                  )}
                </button>
              ) : (
                <Link
                  href="/main/profile?tab=subscription"
                  className="block w-full px-6 py-3 bg-[#ff9900] text-black rounded-md font-medium hover:bg-[#e67e00] transition-colors text-center"
                >
                  💳 Balansni to'ldirish
                </Link>
              )}

              <Link
                href={`/main/manga/${id}`}
                className="block w-full px-6 py-3 bg-[#1a1a1a] rounded-md font-medium hover:bg-[#252525] transition-colors text-center"
              >
                Manga sahifasiga qaytish
              </Link>
            </div>

            <div className="mt-6 text-center text-sm text-[#666]">
              <p>Pullik boblar sizning balansingizdan to'lanadi</p>
              <p className="mt-1">
                Xarid qilgandan so'ng bobni cheksiz o'qishingiz mumkin
              </p>
            </div>
          </div>
        </div>
      </div>
    );

    // Login qilinmagan foydalanuvchi uchun AuthGuard orqali
    return <AuthGuard>{purchaseContent}</AuthGuard>;
  }

  // ====== ASOSIY O‘QISH SAHIFASI ======
  const hasPages = pages.length > 0;

  if (
    chapter &&
    (chapter.access_type === "free" || isPurchased || canReadWithoutLogin)
  ) {
    if (hasImages && hasPages) {
      return (
        <div
          ref={readerRef}
          className={`min-h-screen bg-black relative ${
            isFullscreen ? "fullscreen-mode" : ""
          }`}
        >
          {/* Tepada navigation panel */}
          <div
            className={`fixed top-0 left-0 right-0 bg-gradient-to-b from-black/95 to-transparent backdrop-blur-sm z-50 transition-all duration-300 ease-in-out ${
              showControls
                ? "h-16 opacity-100"
                : "h-0 opacity-0 pointer-events-none"
            }`}
          >
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
              {/* Chap tomonda */}
              <div className="flex items-center gap-4 flex-1">
                <Link
                  href={`/main/manga/${id}`}
                  className="flex items-center text-white hover:text-[#ff9900] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Mangaga qaytish</span>
                </Link>

                {prevChapter && (
                  <button
                    onClick={handlePrevChapter}
                    className="flex items-center px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333] text-white transition-colors text-sm rounded"
                    title={`Oldingi bob: ${
                      prevChapter.title || `Bob ${prevChapter.id}`
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Oldingi</span>
                  </button>
                )}
              </div>

              {/* Markaz */}
              <div className="text-white text-center flex-1">
                <div className="text-sm md:text-base font-medium truncate">
                  {currentChapter?.title || "Manga"}
                </div>
                <div className="text-xs text-[#ff9900]">
                  Bob{" "}
                  {currentChapter?.title || chapter?.title || chapterNumberInt}
                </div>
              </div>

              {/* O‘ng tomonda */}
              <div className="flex items-center gap-4 flex-1 justify-end">
                {nextChapter && (
                  <button
                    onClick={handleNextChapter}
                    className="flex items-center px-3 py-1.5 bg-[#ff9900] hover:bg-[#ff6600] text-white transition-colors text-sm rounded"
                    title={`Keyingi bob: ${
                      nextChapter.title || `Bob ${nextChapter.id}`
                    }`}
                  >
                    <span className="hidden sm:inline">Keyingi</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                )}

                <button
                  onClick={() => setShowSettings(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1a] hover:bg-[#252525] text-white transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>

                {!isMobile && (
                  <button
                    onClick={toggleFullscreen}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a1a1a] hover:bg-[#252525] text-white transition-colors"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-5 h-5" />
                    ) : (
                      <Maximize className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
              onClick={() => setShowSettings(false)}
            >
              <div
                className="bg-[#1a1a1a] rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-[#333]">
                  <h3 className="text-white font-semibold text-lg">
                    Sozlamalar
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-[#a0a0a0] hover:text-white p-1"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-4 space-y-6">
                  <div>
                    <h4 className="text-white mb-3 text-sm font-medium">
                      O&apos;qish rejimi
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setReadingMode("scroll")}
                        className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          readingMode === "scroll"
                            ? "bg-[#ff9900] text-white shadow-lg"
                            : "bg-[#2a2a2a] text-[#a0a0a0] hover:text-white hover:bg-[#333]"
                        }`}
                      >
                        <Monitor className="w-6 h-6 mx-auto mb-2" />
                        Barchasi birdan
                      </button>
                      <button
                        onClick={() => setReadingMode("continuous")}
                        className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          readingMode === "continuous"
                            ? "bg-[#ff9900] text-white shadow-lg"
                            : "bg-[#2a2a2a] text-[#a0a0a0] hover:text-white hover:bg-[#333]"
                        }`}
                      >
                        <LayoutGrid className="w-6 h-6 mx-auto mb-2" />
                        Sahifa sahifa
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white text-sm font-medium">
                        Yorqinlik
                      </h4>
                      <span className="text-[#ff9900] text-sm font-medium">
                        {brightness}%
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={brightness}
                        onChange={(e) =>
                          setBrightness(Number(e.target.value))
                        }
                        className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #ff9900 0%, #ff9900 ${brightness}%, #333 ${brightness}%, #333 100%)`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white text-sm font-medium">
                        Konteyner kengligi
                      </h4>
                      <span className="text-[#ff9900] text-sm font-medium">
                        {containerWidth}%
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={containerWidth}
                        onChange={(e) =>
                          setContainerWidth(Number(e.target.value))
                        }
                        className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #ff9900 0%, #ff9900 ${
                            ((containerWidth - 10) / 90) * 100
                          }%, #333 ${
                            ((containerWidth - 10) / 90) * 100
                          }%, #333 100%)`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PdfViewer */}
          <div
            className="w-full h-full pt-0"
            style={{
              height:
                isMobile && readingMode === "continuous"
                  ? "100vh"
                  : "calc(100vh)",
              overflow: "visible",
              position: "relative",
              zIndex: 1,
            }}
          >
            <PdfViewer
              key={`pdfviewer-${readingMode}-${chapterId}-${chapterImages.length}`}
              images={chapterImages}
              watermark="Topmanga"
              mode={readingMode === "continuous" ? "swipe" : "vertical"}
              brightness={brightness}
              containerWidth={containerWidth}
              showNavigation={false}
              renderAllPages={readingMode === "scroll"}
              onPageChange={(page: number, total: number) => {
                if (readingMode === "continuous") {
                  setCurrentPageIndex(page);
                }
                const progressPercent = ((page + 1) / total) * 100;
                setProgress(progressPercent);
              }}
              currentPage={
                readingMode === "continuous" ? currentPageIndex : undefined
              }
              onScroll={(scrollTop: number) => {
                if (readingMode === "scroll") {
                  if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                  }

                  const prevScrollTop = lastScrollTop;
                  const isScrollingDown = scrollTop > prevScrollTop;
                  const isScrollingUp = scrollTop < prevScrollTop;

                  if (isScrollingDown && scrollTop > 100) {
                    scrollTimeoutRef.current = setTimeout(() => {
                      setShowControls(false);
                    }, 150);
                  } else if (isScrollingUp || scrollTop <= 100) {
                    if (scrollTimeoutRef.current) {
                      clearTimeout(scrollTimeoutRef.current);
                    }
                    setShowControls(true);
                  }

                  setLastScrollTop(scrollTop);
                }
              }}
            />
          </div>
        </div>
      );
    }

    // Rasm yo‘q bo‘lsa
    const noImagesContent = (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Yuklash jarayonida ...</h2>
          <p className="text-gray-400 mb-6">
            Ushbu bob saytga yuklanish jarayonida va bir necha daqiqadan so‘ng
            o‘qish uchun mavjud bo‘ladi.
          </p>
          <Link
            href={`/main/manga/${id}`}
            className="px-6 py-2 bg-[#ff9900] text-white rounded-md font-medium hover:bg-[#ff9900]/90 transition-colors"
          >
            Manga sahifasiga qaytish
          </Link>
        </div>
      </div>
    );

    if (canReadWithoutLogin) {
      return noImagesContent;
    }

    return <AuthGuard>{noImagesContent}</AuthGuard>;
  }

  // Umumiy fallback
  const content = (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Xatolik</h2>
        <p className="text-gray-400 mb-6">
          Kechirasiz, biror xatolik yuz berdi
        </p>
        <Link
          href={`/main/manga/${id}`}
          className="px-6 py-2 bg-[#ff9900] text-white rounded-md font-medium hover:bg-[#ff9900]/90 transition-colors"
        >
          Manga sahifasiga qaytish
        </Link>
      </div>
    </div>
  );

  if (canReadWithoutLogin) {
    return content;
  }

  return <AuthGuard>{content}</AuthGuard>;
}
