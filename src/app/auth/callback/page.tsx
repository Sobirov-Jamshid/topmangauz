"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { showToast } from "@/lib/utils/toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/hooks/api/useAuth";

export default function GoogleAuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setTokensFromSocialLogin } = useAuth();

  useEffect(() => {
    const error = searchParams.get("error");
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");
    const mode = searchParams.get("mode") || "login";
    const returnUrl = decodeURIComponent(
      searchParams.get("returnUrl") || "/main"
    );

    if (error) {
      showToast(
        "Google orqali autentifikatsiyada xatolik: " + error,
        "error"
      );
      router.replace("/auth/login");
      return;
    }

    if (!access || !refresh) {
      showToast("Google’dan tokenlar olinmadi", "error");
      router.replace("/auth/login");
      return;
    }

    try {
      setTokensFromSocialLogin({
        accessToken: access,
        refreshToken: refresh,
      });

      if (mode === "register") {
        showToast("Google orqali muvaffaqiyatli ro'yxatdan o'tdingiz", "success");
      } else {
        showToast("Google orqali muvaffaqiyatli kirdingiz", "success");
      }

      router.replace(returnUrl);
    } catch (e) {
      showToast("Mahalliy saqlashda xatolik", "error");
      router.replace("/auth/login");
    }
  }, [searchParams, router, setTokensFromSocialLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4 text-white">
        <LoadingSpinner />
        <p>Google orqali autentifikatsiya yakunlanmoqda...</p>
      </div>
    </div>
  );
}
