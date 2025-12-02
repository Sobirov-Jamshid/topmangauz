"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Wallet,
  Heart,
  ShoppingBag,
  Calendar,
  Mail,
  Edit,
  CreditCard,
  Camera,
  Loader,
  ChevronDown,
  ChevronUp,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/api/useAuth";
import { useFavorites } from "@/hooks/api/useFavorites";
import { showToast } from "@/lib/utils/toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import MangaCard from "@/components/features/MangaCard/MangaCard";
import PurchasedChapterCard from "@/components/features/MangaCard/PurchasedChapterCard";


import { formatDate } from "@/lib/utils/formatDate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const profileStyles = `
  .profile-gradient {
    background: radial-gradient(circle at top left, #1f1400 0%, #050505 45%, #000000 100%);
  }
  .bg-gradient-card {
    background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%);
    backdrop-filter: blur(14px);
  }
  .shadow-glow {
    box-shadow: 0 0 20px rgba(255, 153, 0, 0.25);
  }
  .hover\\:shadow-glow:hover {
    box-shadow: 0 0 30px rgba(255, 153, 0, 0.35);
  }
  .bg-gradient-primary {
    background: linear-gradient(135deg, #ff9900, #ffb347);
  }
  .text-gradient-primary {
    background: linear-gradient(135deg, #ff9900, #ffdd99);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .payment-plan {
    transition: all 0.25s ease;
    border: 2px solid transparent;
  }
  .payment-plan:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 153, 0, 0.3);
    box-shadow: 0 8px 32px rgba(255, 153, 0, 0.18);
  }
  .payment-plan.selected {
    border-color: #ff9900;
    background: radial-gradient(circle at top, rgba(255, 153, 0, 0.12) 0%, rgba(15, 15, 15, 0.95) 52%);
  }
  .avatar-container {
    position: relative;
  }
  .avatar-edit-btn {
    position: absolute;
    bottom: 4px;
    right: 4px;
    background: #ff9900;
    border-radius: 9999px;
    padding: 6px;
    border: 1px solid #111;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .avatar-edit-btn:hover {
    background: #e67e00;
  }
  @media (max-width: 768px) {
    .profile-header {
      flex-direction: column;
      text-align: center;
      align-items: center;
    }
    .stats-grid {
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
  }
`;

export default function ProfilePage() {
  const {
    user,
    getUserProfile,
    isLoadingUser,
    updateProfileInfoMutation,
    uploadAvatar,
    isUploadingAvatar,
  } = useAuth();

  const { favorites, removeFromFavorites } = useFavorites();
  const userProfile = getUserProfile.data;

  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  const [isEditAvatarOpen, setIsEditAvatarOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  const [paymentPlans, setPaymentPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    if (userProfile || user) {
      setProfileForm({
        first_name: userProfile?.first_name || user?.first_name || "",
        last_name: userProfile?.last_name || user?.last_name || "",
      });
    }
  }, [userProfile, user]);

  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    const accessToken =
      localStorage.getItem("mangaleep_access_token") ||
      localStorage.getItem("access");
    return accessToken;
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    if (isPaymentOpen) {
      loadPaymentPlans();
      loadOrders();
    }
  }, [isPaymentOpen]);

  useEffect(() => {
    if (paymentPlans.length > 0 && !selectedPlan) {
      // birinchi tarifni default tanlaymiz
      setSelectedPlan(paymentPlans[0]);
    }
  }, [paymentPlans, selectedPlan]);

  const logoutAndRedirect = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mangaleep_access_token");
      localStorage.removeItem("mangaleep_refresh_token");
      localStorage.removeItem("mangaleep_token_expiry");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh_token");
      window.location.href = "/auth/login";
    }
  };

  const loadPaymentPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const token = getAuthToken();
      if (!token) {
        showToast("Iltimos, tizimga qayta kiring", "error");
        return;
      }
      const response = await fetch(
        "https://auth.topmanga.uz/api/auth/user/orders/",
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.status === 401) {
        showToast("Sessiya muddati tugagan. Iltimos, qayta kiring.", "error");
        logoutAndRedirect();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const ordersData = await response.json();
      const plans = ordersData
        .map((order: any) => {
          const coins = order.product_name;
          const price = order.amount;
          return {
            id: order.id,
            coins,
            price,
            originalOrder: order,
          };
        })
        .filter((plan: any) => plan.coins > 0 && plan.price > 0);

      setPaymentPlans(plans);
    } catch (error: any) {
      console.error("Error loading payment plans:", error);
      if (error instanceof Error && error.message.includes("401")) {
        showToast("Sessiya muddati tugagan. Iltimos, qayta kiring.", "error");
        logoutAndRedirect();
      } else {
        showToast("To'lov paketlarini yuklashda xatolik", "error");
      }
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const loadOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(
        "https://auth.topmanga.uz/api/auth/user/orders/",
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        const completedOrders = data.filter(
          (order: any) =>
            order.status === "completed" || order.status === "paid"
        );
        setOrderHistory(completedOrders);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const createOrder = async (plan: any) => {
    try {
      setIsCreatingOrder(true);
      const token = getAuthToken();
      if (!token) {
        showToast("Iltimos, tizimga qayta kiring", "error");
        return;
      }
      const orderData = plan.originalOrder;
      const paymentResponse = await fetch(
        `https://auth.topmanga.uz/api/auth/user/orders/${orderData.id}/`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (paymentResponse.status === 401) {
        showToast("Sessiya muddati tugagan. Iltimos, qayta kiring.", "error");
        logoutAndRedirect();
        return;
      }

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        if (paymentData.payme_link) {
          window.open(paymentData.payme_link, "_blank");
          showToast("To'lov sahifasiga yo'naltirilmoqda...", "success");
          setIsPaymentOpen(false);
          setSelectedPlan(null);
        }
      } else {
        throw new Error("To'lov havolasini olishda xatolik");
      }
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error?.message?.includes("401")) {
        showToast("Sessiya muddati tugagan. Iltimos, qayta kiring.", "error");
        logoutAndRedirect();
      } else {
        showToast(error.message || "To'lovni boshlashda xatolik", "error");
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await updateProfileInfoMutation.mutateAsync(profileForm);
      showToast("Profil muvaffaqiyatli yangilandi!", "success");
      setIsEditProfileOpen(false);
      getUserProfile.refetch();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Profilni yangilashda xatolik yuz berdi";
      showToast(errorMessage, "error");
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("Yangi parol va tasdiqlash mos emas", "error");
      return;
    }

    try {
      // Backendga ulashda shu yerga so'rov qo'shasiz
      showToast("Parol muvaffaqiyatli yangilandi!", "success");
      setIsEditPasswordOpen(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Parolni yangilashda xatolik yuz berdi";
      showToast(errorMessage, "error");
    }
  };

  const handleAvatarUpdate = async () => {
    if (!avatarFile) {
      showToast("Iltimos, avatar tanlang!", "error");
      return;
    }
    if (avatarFile.size > 5 * 1024 * 1024) {
      showToast("Fayl hajmi 5MB dan katta bo'lishi mumkin emas!", "error");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(avatarFile.type)) {
      showToast("Faqat JPG, PNG yoki GIF formatlari qabul qilinadi!", "error");
      return;
    }
    try {
      await uploadAvatar(avatarFile);
      showToast("Avatar muvaffaqiyatli yangilandi!", "success");
      setIsEditAvatarOpen(false);
      setAvatarFile(null);
      getUserProfile.refetch();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Avatarni yangilashda xatolik yuz berdi";
      showToast(errorMessage, "error");
    }
  };

  const handleRemoveFromFavorites = async (mangaId: string) => {
    try {
      await removeFromFavorites(mangaId);
    } catch {
      // Silent fail
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner size="large" color="white" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen profile-gradient">
        <div className="text-center bg-gradient-card px-8 py-10 rounded-2xl border border-[#333] shadow-glow">
          <h2 className="text-2xl font-bold text-white mb-3">
            Kirish talab etiladi
          </h2>
          <p className="text-[#a0a0a0] mb-6">
            Profil sahifasini ko&apos;rish uchun tizimga kiring
          </p>
          <Button className="bg-[#ff9900] hover:bg-[#e67e00] text-black font-semibold px-8">
            <a href="/auth/login">Kirish</a>
          </Button>
        </div>
      </div>
    );
  }

  const displayName =
    userProfile?.first_name && userProfile?.last_name
      ? `${userProfile.first_name} ${userProfile.last_name}`
      : userProfile?.username || user?.username || "Foydalanuvchi";

  const email = userProfile?.email || user?.email || "Email mavjud emas";
  const joinDate = formatDate(
    userProfile?.date_joined || user?.date_joined || new Date().toISOString()
  );
  const balance = user?.balance || 0;
  const favoriteCount = favorites?.length || 0;
  const purchasedCount = userProfile?.purchased_chapters?.length || 0;
  const avatarSrc = userProfile?.avatar || user?.avatar;

  return (
    <div className="min-h-screen profile-gradient pt-20 pb-10">
      <style dangerouslySetInnerHTML={{ __html: profileStyles }} />

      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-gradient-card rounded-3xl border border-[#333] shadow-glow"
        >
          <div className="py-8 px-6 sm:px-8">
            <div className="profile-header flex gap-8">
              <div className="avatar-container">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.25 }}
                >
                  <Avatar className="w-32 h-32 border-4 border-[#ff9900]/90 shadow-glow">
                    <AvatarImage src={avatarSrc} alt="Profile Avatar" />
                    <AvatarFallback className="text-4xl bg-gradient-primary text-black font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="avatar-edit-btn"
                  onClick={() => setIsEditAvatarOpen(true)}
                >
                  <Camera className="w-4 h-4 text-black" />
                </motion.button>
              </div>

              <div className="flex-1 flex flex-col justify-between gap-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <motion.h1
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
                    >
                      {displayName}
                    </motion.h1>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-[#a0a0a0]">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Ro&apos;yxatdan o&apos;tgan: {joinDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
                    <Badge className="px-4 py-2 bg-[#ff9900]/15 text-[#ff9900] border border-[#ff9900]/50 flex items-center gap-2 rounded-full">
                      <Heart className="w-4 h-4" />
                      {favoriteCount} Sevimli
                    </Badge>
                    <Badge className="px-4 py-2 bg-[#ff9900]/15 text-[#ff9900] border border-[#ff9900]/50 flex items-center gap-2 rounded-full">
                      <ShoppingBag className="w-4 h-4" />
                      {purchasedCount} Sotib olingan
                    </Badge>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditProfileOpen(true)}
                      className="border-[#ff9900] text-white hover:bg-[#ff9900] hover:text-black transition-all rounded-full px-4"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Profil
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditPasswordOpen(true)}
                      className="border-[#ff9900] text-White hover:bg-[#ff9900] hover:text-black transition-all rounded-full px-4"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Parolni o&apos;zgartirish
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* LEFT COLUMN – BALANCE + HISTORY */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Balance card */}
            <Card className="p-6 bg-gradient-card border border-[#333] rounded-2xl hover:shadow-glow transition-all">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#ff9900]/15 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#ff9900]" />
                </div>
                <h2 className="text-xl font-semibold text-[#ff9900]">
                  Balans va obunalar
                </h2>
              </div>

              <div className="bg-[#151515] rounded-xl p-4 mb-4 border border-[#333]">
                <p className="text-xs uppercase tracking-wide text-[#777] mb-1">
                  Joriy balans
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Image
                    src="/images/icon.png"
                    alt="Coin"
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="text-base text-[#ffb347] font-semibold">
                      <motion.p
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.25 }}
                        className="text-3xl font-extrabold text-gradient-primary"
                      >
                        {balance.toLocaleString("ru-RU", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{" "}
                        <span className="text-sm text-[#a0a0a0] ml-1">TopCoin</span>
                      </motion.p>
                    
                  </span>
                </div>
              </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                <Button
                  onClick={() => setIsPaymentOpen(true)}
                  className="w-full bg-[#ff9900] hover:bg-[#e67e00] text-black font-semibold rounded-xl"
                >
                  <Wallet className="w-5 h-5 mr-2 text-black animate-bounce" />
                  Balans to&apos;ldirish
                </Button>
              </motion.div>
              
              {/* History toggle */}
              <div className="mt-5 border-t border-[#333] pt-4">
                <button
                  onClick={() => setIsHistoryOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between text-sm text-[#a0a0a0] hover:text-white transition-colors"
                >
                  <span>To&apos;lovlar tarixi</span>
                  {isHistoryOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isHistoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                        {isLoadingOrders ? (
                          <div className="flex justify-center py-4">
                            <LoadingSpinner size="small" color="white" />
                          </div>
                        ) : orderHistory.length > 0 ? (
                          orderHistory
                            .slice()
                            .reverse()
                            .slice(0, 6)
                            .map((order) => (
                              <div
                                key={order.id}
                                className="flex items-center justify-between text-xs bg-[#141414] border border-[#2c2c2c] rounded-lg px-3 py-2"
                              >
                                <div className="space-y-0.5">
                                  <p className="text-[#e5e5e5] font-medium">
                                    {order.product_name}
                                  </p>
                                  <p className="text-[#777]">
                                    {formatDate(order.created_at)}
                                  </p>
                                </div>
                                <p className="text-[#ff9900] font-semibold">
                                  {Number(order.amount).toLocaleString(
                                    "ru-RU",
                                    {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    }
                                  )}{" "}
                                  so&apos;m
                                </p>
                              </div>
                            ))
                        ) : (
                          <p className="text-xs text-[#666] py-2">
                            Hozircha yakunlangan to&apos;lovlar mavjud emas.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* RIGHT COLUMN – TABS */}
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gradient-card border border-[#333] rounded-3xl overflow-hidden">
              <Tabs defaultValue="favorites" className="w-full">
                <TabsList className="relative w-full flex bg-[#0f0f0f] p-1 rounded-2xl border border-[#2a2a2a] shadow-inner">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#ff990012] to-[#ff990005]" />
                  
                  <TabsTrigger
                    value="favorites"
                    className="
                      flex-1 relative z-10 flex items-center justify-center gap-2
                      py-3 rounded-xl text-sm font-semibold
                      text-[#aaaaaa] transition-all duration-300
                      data-[state=active]:text-black
                      data-[state=active]:bg-[#ff9900]
                      data-[state=active]:shadow-[0_0_20px_#ff990060]
                      hover:text-white hover:bg-[#ff990020]
                    "
                  >
                    <Heart className="w-4 h-4" />
                    Sevimlilar
                  </TabsTrigger>

                  <TabsTrigger
                    value="purchased"
                    className="
                      flex-1 relative z-10 flex items-center justify-center gap-2
                      py-3 rounded-xl text-sm font-semibold
                      text-[#aaaaaa] transition-all duration-300
                      data-[state=active]:text-black
                      data-[state=active]:bg-[#ff9900]
                      data-[state=active]:shadow-[0_0_20px_#ff990060]
                      hover:text-white hover:bg-[#ff990020]
                    "
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Sotib olingan boblar
                  </TabsTrigger>
                </TabsList>


                {/* FAVOURITES */}
                <TabsContent value="favorites" className="mt-0">
                  <div className="p-4 sm:p-6">
                    {favorites && favorites.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 lg:gap-4">
                        {favorites.map((favorite: any, index: number) => (
                          <motion.div
                            key={`profile-favorite-${favorite.id || index}`}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                          >
                            <MangaCard
                              manga={favorite.manga}
                              showRemoveButton
                              onRemoveFromFavorites={handleRemoveFromFavorites}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-white mb-2">
                            Sevimlilar topilmadi
                          </h3>
                          <p className="text-[#a0a0a0] mb-6 text-sm">
                            Sevimli mangalaringizni qo&apos;shish uchun katalog
                            sahifasiga o&apos;ting.
                          </p>
                          <Button className="bg-[#ff9900] hover:bg-[#e67e00] text-black rounded-xl px-6">
                            <a href="/main/manga">Katalogga o&apos;tish</a>
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* PURCHASED */}
                <TabsContent value="purchased" className="mt-6">
                  <div className="p-4 sm:p-6">
                    {userProfile?.purchased_chapters?.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 lg:gap-4">
                        {userProfile.purchased_chapters.map((item: any, index: number) => (
                          <PurchasedChapterCard
                            key={index}
                            manga={item.manga}
                            chapter={item.chapter}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <h3 className="text-xl font-bold text-white mb-2">
                          Sotib olingan boblar mavjud emas
                        </h3>
                        <p className="text-[#a0a0a0]">
                          Hozircha siz biror bob sotib olmadingiz
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>


              </Tabs>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="bg-[#111] border-[#333] text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              Profilni tahrirlash
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProfileUpdate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="first_name" className="text-[#a0a0a0]">
                Ism
              </Label>
              <Input
                id="first_name"
                value={profileForm.first_name}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    first_name: e.target.value,
                  })
                }
                placeholder="Ism"
                className="bg-[#181818] border-[#333] text-white placeholder-[#666] focus:border-[#ff9900]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name" className="text-[#a0a0a0]">
                Familiya
              </Label>
              <Input
                id="last_name"
                value={profileForm.last_name}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    last_name: e.target.value,
                  })
                }
                placeholder="Familiya"
                className="bg-[#181818] border-[#333] text-white placeholder-[#666] focus:border-[#ff9900]"
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditProfileOpen(false)}
                className="flex-1 border-[#333] text-white hover:bg-[#222]"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#ff9900] hover:bg-[#e67e00] text-black"
              >
                Saqlash
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT PASSWORD MODAL */}
      <Dialog open={isEditPasswordOpen} onOpenChange={setIsEditPasswordOpen}>
        <DialogContent className="bg-[#111] border-[#333] text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              Parolni o&apos;zgartirish
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-[#a0a0a0]">
                Joriy parol
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Joriy parol"
                className="bg-[#181818] border-[#333] text-white placeholder-[#666] focus:border-[#ff9900]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-[#a0a0a0]">
                Yangi parol
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Yangi parol"
                className="bg-[#181818] border-[#333] text-white placeholder-[#666] focus:border-[#ff9900]"
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#a0a0a0]">
                Yangi parolni tasdiqlang
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Yangi parolni tasdiqlang"
                className="bg-[#181818] border-[#333] text-white placeholder-[#666] focus:border-[#ff9900]"
                required
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditPasswordOpen(false)}
                className="flex-1 border-[#333] text-white hover:bg-[#222]"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#ff9900] hover:bg-[#e67e00] text-black"
              >
                O&apos;zgartirish
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT AVATAR MODAL */}
      <Dialog open={isEditAvatarOpen} onOpenChange={setIsEditAvatarOpen}>
        <DialogContent className="bg-[#111] border-[#333] text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              Avatar yuklash
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-[#a0a0a0] mb-4 text-sm">
                Avatar rasmingizni yuklang. Faqat JPG, PNG yoki GIF formatlari
                qabul qilinadi (maks. 5MB).
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setAvatarFile(e.target.files?.[0] || null)
                }
                className="w-full px-4 py-2 border border-[#333] rounded-lg bg-[#181818] text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#ff9900] file:text-black hover:file:bg-[#e67e00]"
              />
            </div>
            <AnimatePresence>
              {avatarFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center"
                >
                  <div className="mb-3 flex justify-center">
                    <img
                      src={URL.createObjectURL(avatarFile)}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full border-2 border-[#ff9900] object-cover"
                    />
                  </div>
                  <p className="text-[#a0a0a0] text-sm">
                    Tanlangan fayl:{" "}
                    <span className="text-white">{avatarFile.name}</span>
                  </p>
                  <p className="text-[#666] text-xs">
                    Hajm: {(avatarFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditAvatarOpen(false)}
                className="flex-1 border-[#333] text-white hover:bg-[#222]"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleAvatarUpdate}
                disabled={isUploadingAvatar || !avatarFile}
                className="flex-1 bg-[#ff9900] hover:bg-[#e67e00] text-black disabled:opacity-50"
              >
                {isUploadingAvatar ? "Yuklanmoqda..." : "Yuklash"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PAYMENT MODAL */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="bg-[#111] border-[#333] text-white max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl text-center">
              Balans to&apos;ldirish
            </DialogTitle>
            <DialogDescription className="text-[#a0a0a0] text-center">
              O&apos;zingizga mos paketni tanlang va Payme orqali xavfsiz
              to&apos;lovni amalga oshiring.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-2">
            {isLoadingPlans ? (
              <div className="flex justify-center py-10">
                <LoadingSpinner size="large" color="white" />
              </div>
            ) : paymentPlans.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {paymentPlans.map((plan, index) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`payment-plan relative bg-[#181818] rounded-2xl p-5 cursor-pointer ${
                        selectedPlan?.id === plan.id ? "selected" : ""
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div className="text-center space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          <Image
                            src="/images/icon.png"
                            alt="Coin"
                            width={32}
                            height={32}
                            className="w-7 h-7 object-contain"
                          />
                          <span className="text-xl font-bold text-[#ffb347]">
                            {Number(plan.coins).toLocaleString("ru-RU", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-white">
                          {Number(plan.price).toLocaleString("ru-RU", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}{" "}
                          so&apos;m
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <AnimatePresence>
                  {selectedPlan && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="bg-[#181818] rounded-2xl p-6 border border-[#ff9900]/70"
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">
                            Tanlangan paket
                          </h4>
                          <p className="text-[#a0a0a0] text-sm">
                            {Number(selectedPlan.coins).toLocaleString(
                              "ru-RU",
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }
                            )}{" "}
                            TopCoin —{" "}
                            {Number(selectedPlan.price).toLocaleString(
                              "ru-RU",
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }
                            )}{" "}
                            so&apos;m
                          </p>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            onClick={() => createOrder(selectedPlan)}
                            disabled={isCreatingOrder}
                            className="bg-[#ff9900] hover:bg-[#e67e00] text-black font-bold px-8 py-2 rounded-xl"
                          >
                            {isCreatingOrder ? (
                              <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Tayyorlanmoqda...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                To&apos;lov qilish
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="text-center py-10">
                <CreditCard className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  To&apos;lov paketlari mavjud emas
                </h3>
                <p className="text-[#a0a0a0] text-sm max-w-md mx-auto">
                  Hozirda to&apos;lov paketlari faol emas. Iltimos, biroz vaqt o&apos;tib qayta
                  urinib ko&apos;ring.
                </p>
              </div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="bg-[#181818] rounded-2xl p-5 border border-[#333]"
            >
              <h4 className="text-lg font-semibold text-white mb-3">
                To&apos;lov usuli
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                  <Image
                    src="/images/paymee.png"
                    alt="Payme"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    Payme orqali onlayn to&apos;lov
                  </p>
                  <p className="text-[#a0a0a0] text-xs">
                    To&apos;lov Payme tizimi orqali xavfsiz tarzda amalga oshiriladi.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
