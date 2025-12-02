'use client';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import AuthLoginPage from '@/app/auth/login/page';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner size="large" color="white" />
      </div>
    }>
      <AuthLoginPage />
    </Suspense>
  );
} 