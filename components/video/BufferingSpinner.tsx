import React from "react";

interface BufferingSpinnerProps {
  size?: number; // Optional size in pixels for customization
}

export default function BufferingSpinner({
  size = 64,
}: BufferingSpinnerProps) {
  return (
    <div
      className="flex items-center justify-center"
      role="status"
      aria-label="Buffering video content"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className="animate-spin"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="spinnerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="25%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="75%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="none"
          stroke="url(#spinnerGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          className="opacity-75 animate-pulse"
          strokeDasharray="175"
          strokeDashoffset="50"
        />
      </svg>
    </div>
  );
}