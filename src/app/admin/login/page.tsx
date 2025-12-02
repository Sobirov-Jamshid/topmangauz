"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import { showToast } from "@/lib/utils/toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";

export default function AdminLoginPage() {
  const { login, loggingIn } = useAdminAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const username = fd.get("username") as string;
    const password = fd.get("password") as string;
    
    try {
      await login({ username, password });
      showToast("Xush kelibsiz, admin!", "success");
      router.push("/admin");
    } catch (err: any) {
      // Silent fail
      
      if (err?.isStaffError || err?.message?.includes('admin paneliga kirish')) {
        showToast("❌ Sizda admin paneliga kirish huquqi yo'q! Faqat adminlar kirishi mumkin.", "error");
        setError("Sizda admin paneliga kirish huquqi yo'q!");
      } else if (err?.response?.data?.detail) {
        showToast(err.response.data.detail, "error");
        setError(err.response.data.detail);
      } else if (err?.response?.data?.message) {
        showToast(err.response.data.message, "error");
        setError(err.response.data.message);
      } else if (err?.response?.status === 401) {
        showToast("Noto'g'ri foydalanuvchi nomi yoki parol", "error");
        setError("Noto'g'ri foydalanuvchi nomi yoki parol");
      } else if (err?.response?.status === 400) {
        showToast("Ma'lumotlar noto'g'ri", "error");
        setError("Ma'lumotlar noto'g'ri");
      } else {
        showToast("Tarmoq xatoligi. Iltimos, qaytadan urinib ko'ring", "error");
        setError("Tarmoq xatoligi");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#121212] p-6 rounded-md border border-[#1a1a1a]"
      >
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin kirishi</h1>
        <div className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm text-[#a0a0a0] mb-1">
              Foydalanuvchi nomi
            </label>
            <input
              id="username"
              name="username"
              required
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-[#a0a0a0] mb-1">
              Parol
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-white focus:outline-none"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loggingIn}
            className="w-full bg-[#ff9900] text-white py-2 rounded hover:bg-[#ff9900]/90 transition-colors flex justify-center"
          >
            {loggingIn ? <LoadingSpinner size="small" color="#fff" /> : "Kirish"}
          </button>
        </div>
        <Link href="/" className="block mt-4 text-center text-[#a0a0a0] hover:text-white text-sm">
          ← Saytga qaytish
        </Link>
      </form>
    </div>
  );
} 