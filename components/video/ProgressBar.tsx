// components/ProgressBar.tsx
'use client';
import React from 'react';
import { VideoPlayerControls } from '../../hooks/useVideoPlayer';

export default function ProgressBar({ controls }: { controls: VideoPlayerControls }) {
  const pct = controls.duration ? (controls.currentTime / controls.duration) * 100 : 0;
  return (
    <div
      className={`absolute bottom-12 left-0 right-0 px-2 transition-opacity duration-300 ${controls.controlsVisible ? 'opacity-100' : 'opacity-0'} ${controls.mouseIdle ? 'pointer-events-none' : 'pointer-events-auto'}`}
      onClick={controls.handleProgressClick}
    >
      <div className="w-full h-1 bg-gray-300 cursor-pointer">
        <div className="h-full bg-blue-900" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}