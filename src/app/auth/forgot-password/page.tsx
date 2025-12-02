"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/api/useAuth';
import { showToast } from '@/lib/utils/toast';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  
  const { passwordReset, isPasswordResetting } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showToast('Email manzilini kiriting', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await passwordReset({ email: email.trim() });
      setIsSubmitted(true);
      showToast('Parolni tiklash xabari yuborildi', 'success');
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Parolni tiklash xabarini yuborishda xatolik';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
      <div className="w-full max-w-md bg-[#121212] rounded-lg shadow-xl border border-[#1a1a1a] overflow-hidden">
        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/main" className="flex items-center">
              <span className="text-3xl font-bold text-[#ff9900] mr-1">Top</span>
              <span className="text-3xl font-bold text-white">Manga</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2 text-white">Parolni tiklash</h1>
          <p className="text-center text-[#a0a0a0] mb-6">
            Parolni tiklash uchun elektron pochta manzilingizni kiriting
          </p>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Email field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-white">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                      className="w-full px-4 py-2 pl-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[#a0a0a0]" />
                    </div>
                  </div>
                </div>
                
                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isPasswordResetting}
                  className="w-full bg-[#ff9900] text-white py-3 px-4 rounded-md font-medium hover:bg-[#ff9900]/90 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isSubmitting || isPasswordResetting ? (
                    <LoadingSpinner size="small" color="white" />
                  ) : (
                    'Yuborish'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-[#1a1a1a]/50 border border-[#2a2a2a] rounded-md p-6 text-center">
              <div className="w-12 h-12 bg-[#ff9900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-[#ff9900]" />
              </div>
              <h2 className="text-white font-medium mb-2">Elektron pochta yuborildi</h2>
              <p className="text-[#a0a0a0] text-sm mb-4">
                Parolni tiklash uchun ko'rsatmalar <strong>{email}</strong> elektron pochtangizga yuborildi. 
                Iltimos, elektron pochtangizni tekshiring va spam papkasini ham ko'rib chiqing.
              </p>
              <div className="space-y-2">
                <Link 
                  href="/auth/login"
                  className="text-[#ff9900] hover:text-[#ff9900]/80 transition-colors font-medium text-sm block"
                >
                  Kirish sahifasiga qaytish
                </Link>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-[#a0a0a0] hover:text-white transition-colors font-medium text-sm"
                >
                  Boshqa email kiriting
                </button>
              </div>
            </div>
          )}
          
          {/* Back to login */}
          <div className="mt-8 text-center">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center text-sm font-medium text-[#a0a0a0] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kirish sahifasiga qaytish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 