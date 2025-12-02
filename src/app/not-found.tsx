"use client";

import React from 'react';
import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-6">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="text-8xl font-bold text-[#ff9900] mb-4">404</div>
          <div className="w-24 h-1 bg-[#ff9900] mx-auto rounded"></div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Sahifa topilmadi</h1>
          <p className="text-[#a0a0a0] leading-relaxed">
            Kechirasiz, qidirilayotgan sahifa mavjud emas. 
            Sahifa o'chirilgan, ko'chirilgan yoki noto'g'ri manzil kiritilgan bo'lishi mumkin.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link 
            href="/main"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff9900] text-white rounded-lg font-medium hover:bg-[#ff9900]/90 transition-colors"
          >
            <Home className="w-5 h-5" />
            Bosh sahifaga qaytish
          </Link>
          
          <div className="flex gap-3 justify-center">
            <Link 
              href="/main/manga"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg font-medium hover:bg-[#252525] transition-colors"
            >
              <Search className="w-4 h-4" />
              Manga katalogi
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white rounded-lg font-medium hover:bg-[#252525] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Orqaga
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-6 border-t border-[#1a1a1a]">
          <p className="text-sm text-[#666]">
            Agar bu xatolik davom etsa, iltimos biz bilan bog'laning
          </p>
          <Link 
            href="mailto:info@topmanga.uz"
            className="text-[#ff9900] hover:text-[#ff9900]/80 transition-colors text-sm"
          >
            info@topmanga.uz
          </Link>
        </div>
      </div>
    </div>
  );
}
