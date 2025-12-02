"use client";

import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { clearAdminTokens } from '@/lib/api/adminAxios';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { me: user, loadingMe: isLoadingUser, isAuthenticated } = useAdminAuth();
  const router = useRouter();

  const authResolved = isAuthenticated !== null;

  useEffect(() => {
    if (!authResolved) return;

    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    if (!isLoadingUser) {
      if (user) {
        // Backend turli formatlarda is_staff qaytarishi mumkin - barchasini tekshiramiz
        const isStaff = 
          user.is_staff === true || 
          (user.is_staff as any) === 'true' || 
          (user.is_staff as any) === 'True' ||
          (user.is_staff as any) === 1 ||
          (user.is_staff as any) === '1' ||
          (user as any).is_superuser === true;
        
        if (!isStaff) {
          clearAdminTokens();
          router.push('/admin/login');
          return;
        }
        
      } else {
        clearAdminTokens();
        router.push('/admin/login');
      }
    }
  }, [authResolved, isAuthenticated, isLoadingUser, user, router]);

  if (!authResolved || isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return children;
} 