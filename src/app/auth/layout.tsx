"use client";

import React, { useState, useEffect } from 'react';
import { AuthLoadingScreen } from '@/components/ui/loading-spinner';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}
