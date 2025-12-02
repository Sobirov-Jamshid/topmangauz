  "use client";

  import React from "react";
  import { User, MessageCircleMore, Clock} from "lucide-react";
  import { Review } from "@/lib/api/types";

  interface ReviewCardProps {
    review: Review;
  }

  export default function ReviewCard({ review }: ReviewCardProps) {
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${day}.${month}.${year} ${hours}:${minutes}`;
      } catch (error) {
        return "Noma'lum sana";
      }
    };


    return (
      <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-3">
        {/* Top User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#333] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-[#a0a0a0]" />
            </div>
            <p className="font-medium text-white">
              {review.user || "Anonim"}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-[#a0a0a0]">
            <Clock className="w-4 h-4" />
            <span>
              {review.created_at
                ? formatDate(review.created_at)
                : "Noma'lum sana"}
            </span>
          </div>
        </div>

        {/* Long line */}
        <div className="w-full h-[1px] bg-[#333]" />

        {/* Message with icon */}
        <div className="flex items-start gap-2 text-[#a0a0a0] leading-relaxed">
          <MessageCircleMore className="w-4 h-4 text-[#a0a0a0]" />
          <p className="text-sm text-[#a0a0a0]">{review.text}</p>
        </div>
      </div>
    );
  }
