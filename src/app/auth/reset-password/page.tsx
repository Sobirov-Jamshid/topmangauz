"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/api/useAuth';
import { showToast } from '@/lib/utils/toast';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { passwordResetConfirm, isPasswordResetConfirming } = useAuth();
  
  const token = searchParams.get('token');
  const uid = searchParams.get('uid');

  useEffect(() => {
    if (!token || !uid) {
      setIsValidToken(false);
      showToast('Noto\'g\'ri yoki muddati tugagan havola', 'error');
    } else {
      setIsValidToken(true);
    }
  }, [token, uid]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newPassword1 = (formData.get('new_password1') as string);
    const newPassword2 = (formData.get('new_password2') as string);

    if (!newPassword1 || !newPassword2) {
      showToast('Parolni kiriting', 'error');
      return;
    }

    if (newPassword1 !== newPassword2) {
      showToast('Parollar mos emas', 'error');
      return;
    }

    if (newPassword1.length < 8) {
      showToast('Parol kamida 8 ta belgi bo\'lishi kerak', 'error');
      return;
    }

    if (!token || !uid) {
      showToast('Noto\'g\'ri yoki muddati tugagan havola', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await passwordResetConfirm({
        new_password1: newPassword1,
        new_password2: newPassword2,
        token,
        uid
      });
      
      setIsSuccess(true);
      showToast('Parol muvaffaqiyatli o\'zgartirildi', 'success');
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Parolni o\'zgartirishda xatolik';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner size="large" color="white" />
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
        <div className="w-full max-w-md bg-[#121212] rounded-lg shadow-xl border border-[#1a1a1a] overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-white">Noto'g'ri havola</h1>
            <p className="text-[#a0a0a0] mb-6">
              Bu havola noto'g'ri yoki muddati tugagan. Yangi parolni tiklash xabarini so'rang.
            </p>
            <Link 
              href="/auth/forgot-password"
              className="inline-block bg-[#ff9900] text-white py-3 px-6 rounded-md font-medium hover:bg-[#ff9900]/90 transition-colors"
            >
              Yangi parolni tiklash xabarini so'rash
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
        <div className="w-full max-w-md bg-[#121212] rounded-lg shadow-xl border border-[#1a1a1a] overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-[#ff9900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-[#ff9900]" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-white">Parol o'zgartirildi</h1>
            <p className="text-[#a0a0a0] mb-6">
              Parolingiz muvaffaqiyatli o'zgartirildi. Endi yangi parol bilan tizimga kira olasiz.
            </p>
            <Link 
              href="/auth/login"
              className="inline-block bg-[#ff9900] text-white py-3 px-6 rounded-md font-medium hover:bg-[#ff9900]/90 transition-colors"
            >
              Tizimga kirish
            </Link>
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
            <Link href="/main" className="flex items-center">
              <span className="text-3xl font-bold text-[#ff9900] mr-1">Top</span>
              <span className="text-3xl font-bold text-white">Manga</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2 text-white">Yangi parol o'rnatish</h1>
          <p className="text-center text-[#a0a0a0] mb-6">
            Yangi parolingizni kiriting
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* New Password field */}
              <div className="space-y-2">
                <label htmlFor="new_password1" className="block text-sm font-medium text-white">
                  Yangi parol
                </label>
                <div className="relative">
                  <input
                    id="new_password1"
                    name="new_password1"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 pl-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#a0a0a0]" />
                  </div>
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? 
                      <EyeOff className="h-5 w-5 text-[#a0a0a0] hover:text-white transition-colors" /> : 
                      <Eye className="h-5 w-5 text-[#a0a0a0] hover:text-white transition-colors" />
                    }
                  </button>
                </div>
                <p className="text-xs text-[#a0a0a0] mt-1">
                  Parol kamida 8 ta belgi bo'lishi kerak
                </p>
              </div>
              
              {/* Confirm Password field */}
              <div className="space-y-2">
                <label htmlFor="new_password2" className="block text-sm font-medium text-white">
                  Parolni tasdiqlang
                </label>
                <div className="relative">
                  <input
                    id="new_password2"
                    name="new_password2"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 pl-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-1 focus:ring-[#ff9900] focus:border-[#ff9900] text-white"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#a0a0a0]" />
                  </div>
                  <button 
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? 
                      <EyeOff className="h-5 w-5 text-[#a0a0a0] hover:text-white transition-colors" /> : 
                      <Eye className="h-5 w-5 text-[#a0a0a0] hover:text-white transition-colors" />
                    }
                  </button>
                </div>
              </div>
              
              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || isPasswordResetConfirming}
                className="w-full bg-[#ff9900] text-white py-3 px-4 rounded-md font-medium hover:bg-[#ff9900]/90 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isSubmitting || isPasswordResetConfirming ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  'Parolni o\'zgartirish'
                )}
              </button>
            </div>
          </form>
          
          {/* Back to login */}
          <div className="mt-8 text-center">
            <Link 
              href="/auth/login" 
              className="text-sm font-medium text-[#a0a0a0] hover:text-white transition-colors"
            >
              ← Kirish sahifasiga qaytish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 