"use client";

import { useAuth } from "@/hooks/api/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const protectedRoutes = ['/main/profile', '/admin', '/main/read'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    if (isProtectedRoute && !isAuthenticated && isAuthenticated !== null) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/auth/login?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, pathname, router, isProtectedRoute]);

  if (isProtectedRoute && (isAuthenticated === null || isLoadingUser)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner size="large" color="white" />
      </div>
    );
  }

  if (isProtectedRoute && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center text-white">
          <LoadingSpinner size="large" color="white" />
          <p className="mt-4">Login sahifasiga yo'naltirilmoqda...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 