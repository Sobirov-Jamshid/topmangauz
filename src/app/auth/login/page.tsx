"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/api/useAuth';
import { showToast } from '@/lib/utils/toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Eye, EyeOff } from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const {
    login,
    isLoggingIn,
    loginError,
  } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      showToast('Barcha maydonlarni to\'ldiring', 'error');
      return;
    }

    try {
      await login({
        username: formData.username,
        password: formData.password
      });
      
      showToast('Muvaffaqiyatli kirdingiz', 'success');
      
      const returnUrl = searchParams.get('returnUrl') || '/main';
      router.push(returnUrl);
    } catch (error: any) {
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.email_verification) {
          showToast("Iltimos emailingizni tasdiqlang!", "error");
          router.push(`/auth/verify-email?email=${errorData.email}`);
          return;
        } else if (errorData.detail) {
          showToast(errorData.detail, 'error');
        } else if (errorData.non_field_errors) {
          showToast(errorData.non_field_errors[0], 'error');
        } else if (errorData.username) {
          showToast(errorData.username[0], 'error');
        } else if (errorData.password) {
          showToast(errorData.password[0], 'error');
        } else {
          showToast('Kirishda xatolik yuz berdi', 'error');
        }
      } else {
        showToast('Tarmoq xatoligi. Iltimos, qaytadan urinib ko\'ring', 'error');
      }
    }
  };

  // 🔹 Google orqali login → backend redirect
  const handleGoogleLogin = () => {
    const returnUrl = searchParams.get('returnUrl') || '/main';
    const callbackUrl = `https://topmanga.uz/auth/callback?mode=login&returnUrl=${encodeURIComponent(returnUrl)}`;
    const nextParam = encodeURIComponent(callbackUrl);

    window.location.href = `https://auth.topmanga.uz/google/login/?next=${nextParam}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
      <div className="w-full max-w-md bg-[#121212] rounded-lg shadow-xl border border-[#1a1a1a] overflow-hidden">
        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/main" className="group">
              <div className="relative">
                <Image
                  src="/images/logo.png"
                  alt="TopManga Logo"
                  width={200}
                  height={80}
                  className="h-20 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
                  priority
                />
              </div>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-center mb-6 text-[#ff9900]">Tizimga kirish</h1>
          
          {/* 🔹 Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mb-6 flex items-center justify-center gap-2 border border-[#e5e5e5] bg-white text-black py-2.5 px-4 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Image
              src="/images/google.png"
              alt="Google"
              width={28}
              height={28}
            />
            <span className="font-medium">Google orqali kirish</span>
          </button>


          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a2a]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#121212] text-[#a0a0a0]">yoki</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Foydalanuvchi nomi yoki Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                placeholder="Foydalanuvchi nomi yoki email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Parol
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 pl-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a0a0a0] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-[#ff9900] to-[#ff6600] text-white py-3 px-4 rounded-md font-medium hover:from-[#ff6600] hover:to-[#ff9900] transition-all duration-200 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="small" color="white" />
                  <span className="ml-2">Kirish...</span>
                </div>
              ) : (
                "Kirish"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#a0a0a0] text-sm">
              Hisobingiz yo'qmi?{" "}
              <Link href="/auth/register" className="text-[#ff9900] hover:underline">
                Ro'yxatdan o'ting
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/auth/forgot-password" className="text-[#a0a0a0] hover:text-[#ff9900] text-sm">
              Parolni unutdingizmi?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoginFormContent />
    </Suspense>
  );
}
