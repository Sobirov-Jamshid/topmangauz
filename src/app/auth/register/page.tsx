"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/api/useAuth';
import { showToast } from '@/lib/utils/toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Eye, EyeOff, Mail } from 'lucide-react';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [verificationSent, setVerificationSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const {
    register,
    isRegistering,
    registerError,
    resendEmailVerification,
    isResendingEmailVerification,
  } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      showToast('Barcha maydonlarni to\'ldiring', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Parollar mos emas', 'error');
      return;
    }

    if (formData.password.length < 8) {
      showToast('Parol kamida 8 ta belgi bo\'lishi kerak', 'error');
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
      });
      
      setVerificationSent(true);
      setPendingEmail(formData.email);
      
      showToast('Tasdiqlash kodi email manzilingizga yuborildi', 'success');
    } catch (error: any) {
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.detail) {
          showToast(errorData.detail, 'error');
        } else if (errorData.non_field_errors) {
          showToast(errorData.non_field_errors[0], 'error');
        } else if (errorData.username) {
          showToast(`Foydalanuvchi nomi: ${errorData.username[0]}`, 'error');
        } else if (errorData.email) {
          showToast(`Email: ${errorData.email[0]}`, 'error');
        } else if (errorData.password1) {
          showToast(`Parol: ${errorData.password1[0]}`, 'error');
        } else if (errorData.password2) {
          showToast(`Parol tasdiqlash: ${errorData.password2[0]}`, 'error');
        } else {
          const errorMessages: string[] = [];
          Object.keys(errorData).forEach(key => {
            if (Array.isArray(errorData[key])) {
              errorMessages.push(`${key}: ${errorData[key][0]}`);
            }
          });
          if (errorMessages.length > 0) {
            showToast(errorMessages.join(', '), 'error');
          } else {
            showToast('Ro\'yxatdan o\'tishda xatolik yuz berdi', 'error');
          }
        }
      } else {
        showToast('Tarmoq xatoligi. Iltimos, qaytadan urinib ko\'ring', 'error');
      }
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendEmailVerification({ email: pendingEmail });
      showToast('Tasdiqlash kodi qayta yuborildi', 'success');
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Kodni qayta yuborishda xatolik';
      showToast(message, 'error');
    }
  };

  // 🔹 Google orqali ro‘yxatdan o‘tish → backendga redirect
  const handleGoogleRegister = () => {
    // Google callback sahifamiz
    const callbackUrl = `https://topmanga.uz/auth/callback?mode=register`;
    const nextParam = encodeURIComponent(callbackUrl);

    // auth.topmanga.uz dagi /google/login/ endpoint
    window.location.href = `https://auth.topmanga.uz/google/login/?next=${nextParam}`;
  };

  // Agar email tasdiqlash ekrani bo'lsa
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
        <div className="w-full max-w-md bg-[#121212] rounded-lg shadow-xl border border-[#1a1a1a] overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-[#ff9900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-[#ff9900]" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-white">Emailni tasdiqlang</h1>
            <p className="text-[#a0a0a0] mb-4">
              <strong>{pendingEmail}</strong> manziliga tasdiqlash kodi yuborildi.
            </p>
            <p className="text-[#a0a0a0] mb-6">
              Iltimos, email manzilingizni tekshiring va tasdiqlash kodini quyidagi sahifada kiriting.
            </p>
            
            <div className="space-y-3">
              <Link 
                href={`/auth/verify-email?email=${encodeURIComponent(pendingEmail)}`}
                className="inline-block w-full bg-[#ff9900] text-white py-3 px-6 rounded-md font-medium hover:bg-[#ff9900]/90 transition-colors"
              >
                Kodni kiritish
              </Link>
              
              <button
                onClick={handleResendVerification}
                className="text-[#a0a0a0] hover:text-white transition-colors text-sm"
              >
                Kodni qayta yuborish
              </button>
              
              <div>
                <Link 
                  href="/auth/register"
                  className="text-[#a0a0a0] hover:text-white transition-colors text-sm"
                >
                  Boshqa email bilan ro'yxatdan o'tish
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

          <h1 className="text-2xl font-bold text-center mb-6 text-[#ff9900]">Ro'yxatdan o'tish</h1>
          
          {/* 🔹 Google Register Button (endi oddiy tugma + redirect) */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="w-full mb-6 flex items-center justify-center gap-2 border border-[#e5e5e5] bg-white text-black py-2.5 px-4 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Image
              src="/images/google.png"
              alt="Google"
              width={28}
              height={28}
            />
            <span className="font-medium">Google orqali ro'yxatdan o'tish</span>
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
                Foydalanuvchi nomi
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                placeholder="Foydalanuvchi nomi"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                placeholder="example@mail.com"
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

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-white mb-2">
                Parolni tasdiqlang
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 pl-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a0a0a0] hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-gradient-to-r from-[#ff9900] to-[#ff6600] text-white py-3 px-4 rounded-md font-medium hover:from-[#ff6600] hover:to-[#ff9900] transition-all duration-200 disabled:opacity-50"
            >
              {isRegistering ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="small" color="white" />
                  <span className="ml-2">Ro'yxatdan o'tish...</span>
                </div>
              ) : (
                "Ro'yxatdan o'tish"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#a0a0a0] text-sm">
              Hisobingiz bormi?{" "}
              <Link href="/auth/login" className="text-[#ff9900] hover:underline">
                Tizimga kirish
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RegisterPageContent />
    </Suspense>
  );
}
