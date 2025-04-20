// components/PlayPauseOverlay.tsx
'use client';
import React from 'react';
import { FiPlay, FiPause } from 'react-icons/fi';
import { VideoPlayerControls } from '../../hooks/useVideoPlayer';

export default function PlayPauseOverlay({ controls }: { controls: VideoPlayerControls }) {
  if (!controls.playPauseAnim) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {controls.playPauseAnim === 'play' ? (
        <FiPlay className="text-white text-6xl animate-fade" />
      ) : (
        <FiPause className="text-white text-6xl animate-fade" />
      )}
    </div>
  );
}