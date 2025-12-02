// components/common/SnowfallOverlay.tsx
"use client";

import React from "react";

const SnowfallOverlay: React.FC = () => {
  const flakes = Array.from({ length: 40 });

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {flakes.map((_, i) => (
          <div
            key={i}
            className="tm-snowflake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
              fontSize: `${8 + Math.random() * 14}px`,
            }}
          >
            ❄
          </div>
        ))}
      </div>

      <style jsx global>{`
        .tm-snowflake {
          position: absolute;
          top: -10%;
          color: rgba(255, 255, 255, 0.85);
          text-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
          animation-name: tm-snow-fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes tm-snow-fall {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate3d(0, 110vh, 0) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default SnowfallOverlay;
