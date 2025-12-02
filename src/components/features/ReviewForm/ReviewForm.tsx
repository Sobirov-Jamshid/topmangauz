"use client";

import React, { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/api/useAuth";

interface ReviewFormProps {
  onSubmit: (text: string) => void;
  isSubmitting: boolean;
}

export default function ReviewForm({ onSubmit, isSubmitting }: ReviewFormProps) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText("");

    }
  };

  if (!user) {
    return (
      <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
        <p className="text-[#a0a0a0]">Izoh qoldirish uchun tizimga kirish kerak</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-lg p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Izoh</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Manga haqida fikringizni yozing..."
          className="w-full bg-[#252525] border border-[#333] rounded-md px-3 py-2 text-white placeholder-[#666] focus:outline-none focus:border-[#ff9900] resize-none"
          rows={4}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={!text.trim() || isSubmitting}
        className="w-full bg-[#ff9900] text-white hover:bg-[#ff9900]/90 disabled:bg-[#333] disabled:text-[#666] disabled:opacity-50"
        title={!text.trim() || rating === 0 ? "Iltimos, baho va izoh matnini to'ldiring" : ""}
      >
        {isSubmitting ? (
          "Yuborilmoqda..."
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Izoh qoldirish
          </>
        )}
      </Button>
    </form>
  );
} 