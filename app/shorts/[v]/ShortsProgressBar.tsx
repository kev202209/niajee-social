'use client';
import React from 'react';

interface ShortsProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}

const ShortsProgressBar: React.FC<ShortsProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  className = ''
}) => {
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  return (
    <div
      className={`w-full h-1 bg-gray-300/30 cursor-pointer relative ${className}`}
      onClick={handleProgressClick}
    >
      {/* Progress fill */}
      <div 
        className="h-full bg-blue-500 transition-all duration-150 ease-out"
        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
      />
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-blue-700/30 opacity-0 hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

export default ShortsProgressBar;