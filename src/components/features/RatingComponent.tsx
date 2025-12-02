"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { showToast } from "@/lib/utils/toast";

interface RatingComponentProps {
  mangaId: string;
  currentRating?: number;
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export default function RatingComponent({
  mangaId,
  currentRating = 0,
  onRatingChange,
  size = "md",
  showLabel = true,
  disabled = false,
  compact = false
}: RatingComponentProps) {
  const [rating, setRating] = useState(currentRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setRating(currentRating);
  }, [currentRating]);


  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6"
  };

  const handleRatingClick = (newRating: number) => {
    if (disabled || isLoading) return;
    
    setRating(newRating);
    onRatingChange?.(newRating);
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled && !isLoading) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && !isLoading) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled || isLoading}
            className={`transition-colors duration-150 ${
              disabled || isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= displayRating
                  ? "text-[#ff9900] fill-[#ff9900]"
                  : "text-gray-400"
              }`}
            />
          </button>
        ))}
        {isLoading && (
          <div className="ml-2">
            <div className="animate-spin rounded-full h-3 w-3 border border-[#ff9900] border-t-transparent"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleRatingClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={disabled || isLoading}
          className={`transition-colors duration-150 ${
            disabled || isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= displayRating
                ? "text-[#ff9900] fill-[#ff9900]"
                : "text-gray-400"
            }`}
          />
        </button>
      ))}
      {isLoading && (
        <div className="ml-2">
          <div className="animate-spin rounded-full h-3 w-3 border border-[#ff9900] border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}