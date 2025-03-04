'use client';

import React from "react";

// #2563eb; /* Tailwind blue-600 */
const LoadingDots = () => {
  return (
    <div className="inline-flex items-center justify-center">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      <style jsx>{`
        .dot {
          background-color:rgb(255, 255, 255); /* Tailwind blue-600 */
          width: 0.5rem;
          height: 0.5rem;
          margin: 0 0.125rem;
          border-radius: 50%;
          animation: blink 1.4s infinite both;
        }
        .dot:nth-child(1) {
          animation-delay: 0s;
        }
        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0% {
            opacity: 0.2;
            transform: scale(1);
          }
          20% {
            opacity: 1;
            transform: scale(1.3);
          }
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingDots;
