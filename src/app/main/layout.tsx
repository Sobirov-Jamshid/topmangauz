"use client";

import React, { useState, useEffect } from 'react';
import Nav from '@/components/layout/Navbar/Nav';
import Footer from '@/components/layout/Footer/Footer';
import { FullScreenLoading } from '@/components/ui/loading-spinner';
import { usePathname } from 'next/navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const pathname = usePathname();
  
  // O'qish sahifasida navbar va footer'ni yashirish
  const isReadingPage = pathname?.includes('/main/read/');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return <FullScreenLoading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navbar - o'qish sahifasida yashiriladi */}
      {!isReadingPage && <Nav />}

      {/* Asosiy kontent */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer - o'qish sahifasida yashiriladi */}
      {!isReadingPage && <Footer />}
    </div>
  );
} 