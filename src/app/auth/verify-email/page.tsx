"use client";

import React, { useState, Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAuth } from '@/hooks/api/useAuth';
import { showToast } from '@/lib/utils/toast';

function VerifyEmailPageContent() {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const {
    verifyEmail,
    isVerifyingEmail,
    resendEmailVerification,
    isResendingEmailVerification,
  } = useAuth();
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasAutoSentRef = useRef(false); // 🔥 useRef ishlatamiz, chunki u re-renderda o'zgarmaydi
    
  const email = searchParams.get('email');

  // AUTO SEND - STRICT MODE SAFE
  useEffect(() => {
    if (!email) return;

    const alreadySent = sessionStorage.getItem("verify_code_already_sent");

    if (!alreadySent) {
      sessionStorage.setItem("verify_code_already_sent", "true");
      handleAutoResendCode();
    }
  }, [email]);

  // 1 daqiqa orqaga sanash
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleAutoResendCode = async () => {
    if (!email) {
      showToast('Email manzili topilmadi', 'error');
      return;
    }

    try {
      await resendEmailVerification({ email });
      showToast('Tasdiqlash kodi yuborildi', 'success');
      setResendCooldown(60); // 60 soniya = 1 daqiqa
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Kodni yuborishda xatolik';
      showToast(message, 'error');
    }
  };

  const handleInputChange = (index: number, value: string) => {
    // Faqat raqamlarga ruxsat berish
    if (!/^\d?$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Keyingi inputga o'tish
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Avtomatik submit qilish agar barcha raqamlar to'ldirilgan bo'lsa
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerificationFromCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!verificationCode[index] && index > 0) {
        // Oldingi inputga o'tish va uning qiymatini o'chirish
        inputRefs.current[index - 1]?.focus();
        const newCode = [...verificationCode];
        newCode[index - 1] = '';
        setVerificationCode(newCode);
      } else if (verificationCode[index]) {
        // Joriy inputdagi qiymatni o'chirish
        const newCode = [...verificationCode];
        newCode[index] = '';
        setVerificationCode(newCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setVerificationCode(newCode);
      
      // Oxirgi inputga focus
      inputRefs.current[5]?.focus();
      
      // Avtomatik submit
      setTimeout(() => {
        handleVerificationFromCode(pastedData);
      }, 100);
    }
  };

  const handleVerificationFromCode = async (code: string) => {
    if (!email) {
      showToast('Email manzili topilmadi', 'error');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyEmail({ 
        "email": email,
        "code": code 
      });
      setIsSuccess(true);
      showToast('Email muvaffaqiyatli tasdiqlandi', 'success');
      
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Email tasdiqlashda xatolik';
      showToast(message, 'error');
      setIsError(true);
      setErrorMessage(message);
      
      // Xatolik yuz berganda barcha inputlarni tozalash
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      showToast('Iltimos, 6 xonali kodni kiriting', 'error');
      return;
    }

    await handleVerificationFromCode(code);
  };

  // RESEND BUTTON - RESET + STRICT MODE FIX
  const handleResendCode = async () => {
    if (!email || resendCooldown > 0) return;
      
    try {
      await resendEmailVerification({ email });
      showToast('Tasdiqlash kodi qayta yuborildi', 'success');

      setResendCooldown(60);

      // Avoid duplicate auto-send after resend
      sessionStorage.setItem("verify_code_already_sent", "true");

      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const message = error?.response?.data?.detail || 'Kodni qayta yuborishda xatolik';
      showToast(message, 'error');
    }
  };


  const isCodeComplete = verificationCode.every(digit => digit !== '');

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
        <div className="w-full max-w-md bg-[#121212] rounded-lg shadow-xl border border-[#1a1a1a] overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-[#ff9900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-[#ff9900]" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-white">Email tasdiqlandi</h1>
            <p className="text-[#a0a0a0] mb-6">
              Email manzilingiz muvaffaqiyatli tasdiqlandi. Siz avtomatik ravishda login sahifasiga yo'naltirilasiz.
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
          {/* Back Button */}
          <button
            onClick={() => router.push('/auth/register')}
            className="flex items-center text-[#a0a0a0] hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#ff9900]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-[#ff9900]" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-white">Emailni tasdiqlash</h1>
            <p className="text-[#a0a0a0]">
              <strong className="text-white">{email}</strong> manziliga yuborilgan tasdiqlash kodini kiriting. Spam papkasini ham tekshiring.
            </p>
          </div>

          {isError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <p className="text-red-500 text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleVerification} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-4 text-center">
                Tasdiqlash kodi
              </label>
              <div className="flex justify-center space-x-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff9900] focus:border-[#ff9900] text-white text-center text-xl font-semibold transition-all"
                    autoComplete="one-time-code"
                    disabled={isVerifying}
                  />
                ))}
              </div>
            </div>

            {/* TASDIQLASH TUGMASI */}
            <button
              type="submit"
              disabled={isVerifying || !isCodeComplete}
              className="w-full bg-[#ff9900] text-white py-3 px-4 rounded-md font-medium hover:bg-[#ff9900]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="small" color="white" />
                  <span className="ml-2">Tasdiqlanmoqda...</span>
                </div>
              ) : (
                'Emailni tasdiqlash'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#a0a0a0] text-sm">
              Kodni olmadingizmi?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isResendingEmailVerification}
                className="text-[#ff9900] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResendingEmailVerification ? (
                  "Yuborilmoqda..."
                ) : resendCooldown > 0 ? (
                  `Qayta yuborish (${resendCooldown}s)`
                ) : (
                  "Kodni qayta yuborish"
                )}
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link 
              href="/auth/register"
              className="text-[#a0a0a0] hover:text-white text-sm transition-colors"
            >
              Boshqa email bilan ro'yxatdan o'tish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner size="large" color="white" />
      </div>
    }>
      <VerifyEmailPageContent />
    </Suspense>
  );
}