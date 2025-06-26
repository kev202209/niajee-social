// components/ProgressBar.tsx
'use client';
import React from 'react';
import { VideoPlayerControls } from '../../hooks/useVideoPlayer';

export default function ProgressBar({ controls }: { controls: VideoPlayerControls }) {
  const pct = controls.duration ? (controls.currentTime / controls.duration) * 100 : 0;

  return (
    <div
      className={`
        w-full px-2 mb-1
        transition-opacity duration-300
        ${controls.controlsVisible ? 'opacity-100' : 'opacity-0'}
        ${controls.mouseIdle ? 'pointer-events-none' : 'pointer-events-auto'}
      `}
      onClick={controls.handleProgressClick}
    >
      <div className="w-full h-1 bg-gray-300 cursor-pointer relative rounded">
        {/* Filled progress */}
        <div className="h-full bg-blue-900 rounded" style={{ width: `${pct}%` }} />
        {/* Circular bulge/handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2"
          style={{
            left: `calc(${pct}% - 8px)`,
            transition: 'left 0.1s linear',
            pointerEvents: 'none',
          }}
        >
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />
        </div>
      </div>
    </div>
  );
}