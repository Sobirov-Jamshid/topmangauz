"use client";

import React from "react";
import Image from "next/image";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large" | number;
  color?: string;
  thickness?: number;
  className?: string;
}

export function LoadingSpinner({
  size = "medium",
  color = "#ff9900",
  thickness = 2,
  className = "",
}: LoadingSpinnerProps) {
  let sizeInPixels: number;
  switch (size) {
    case "small":
      sizeInPixels = 16;
      break;
    case "medium":
      sizeInPixels = 24;
      break;
    case "large":
      sizeInPixels = 32;
      break;
    default:
      sizeInPixels = typeof size === "number" ? size : 24;
  }

  return (
    <div className={`inline-block ${className}`} role="status" aria-label="loading">
      <svg
        className="animate-spin"
        width={sizeInPixels}
        height={sizeInPixels}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth={thickness}
        ></circle>
        <path
          className="opacity-75"
          fill="none"
          strokeWidth={thickness}
          stroke={color}
          d="M12 2a10 10 0 0 1 10 10"
        ></path>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function PageLoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#121212] p-6 rounded-lg shadow-xl flex flex-col items-center">
        <LoadingSpinner size="large" />
        <p className="mt-4 text-white font-medium">Yuklanmoqda...</p>
      </div>
    </div>
  );
}

export function FullScreenLoading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      {/* Icon with animated background */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-6">
          <div className="w-20 h-20 relative">
            {/* Animated background circle */}
            <div className="absolute inset-0 border-4 border-[#ff9900]/30 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-[#ff9900]/20 border-b-transparent rounded-full animate-spin-slow"></div>
            
            {/* Icon in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/icon.png"
                alt="TopManga Icon"
                width={48}
                height={48}
                className="w-12 h-12 object-contain animate-pulse"
                priority
              />
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-[#a0a0a0] text-lg animate-pulse">Sahifa yuklanmoqda...</p>
    </div>
  );
}

export function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      {/* Icon with animated background */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-6">
          <div className="w-20 h-20 relative">
            {/* Animated background circle */}
            <div className="absolute inset-0 border-4 border-[#ff9900]/30 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-[#ff9900]/20 border-b-transparent rounded-full animate-spin-slow"></div>
            
            {/* Icon in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/icon.png"
                alt="TopManga Icon"
                width={48}
                height={48}
                className="w-12 h-12 object-contain animate-pulse"
                priority
              />
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-[#a0a0a0] text-lg animate-pulse">Tizimga kirish...</p>
    </div>
  );
}

export function ContentLoadingPlaceholder({ height = "h-64", text = "Yuklanmoqda..." }) {
  return (
    <div className={`w-full ${height} flex flex-col items-center justify-center bg-[#121212] border border-[#1a1a1a] rounded-md`}>
      <LoadingSpinner size="medium" />
      <p className="mt-4 text-[#a0a0a0]">{text}</p>
    </div>
  );
}

export function ButtonLoading() {
  return (
    <div className="flex items-center justify-center">
      <LoadingSpinner size="small" color="white" />
    </div>
  );
} 