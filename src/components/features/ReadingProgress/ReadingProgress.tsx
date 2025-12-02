"use client";

import React from 'react';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

interface ReadingProgressProps {
  readChapters: number;
  totalChapters: number;
  isCompleted: boolean;
  progressPercentage: number;
  className?: string;
}

export default function ReadingProgress({
  readChapters,
  totalChapters,
  isCompleted,
  progressPercentage,
  className = ""
}: ReadingProgressProps) {
  return (
    <div className={`bg-[#121212] rounded-lg p-4 border border-[#1a1a1a] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center">
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
          ) : (
            <BookOpen className="w-4 h-4 mr-2 text-[#ff9900]" />
          )}
          O'qish Jarayoni
        </h3>
        <span className="text-xs text-[#a0a0a0]">
          {readChapters}/{totalChapters} bob
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-[#1a1a1a] rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            isCompleted 
              ? 'bg-gradient-to-r from-green-500 to-green-400' 
              : 'bg-gradient-to-r from-[#ff9900] to-[#ff6600]'
          }`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Progress Info */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-medium ${
          isCompleted ? 'text-green-400' : 'text-[#ff9900]'
        }`}>
          {progressPercentage}% bajarildi
        </span>
        {isCompleted ? (
          <span className="text-green-400 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Tugallandi
          </span>
        ) : (
          <span className="text-[#a0a0a0] flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Davom etmoqda
          </span>
        )}
      </div>
    </div>
  );
}
