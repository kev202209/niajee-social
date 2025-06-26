// components/VolumeSeekIndicator.tsx
'use client';
import React from 'react';
import { FiVolume2, FiVolumeX, FiRewind, FiFastForward } from 'react-icons/fi';
import { VideoPlayerControls } from '../../hooks/useVideoPlayer';

export default function VolumeSeekIndicator({ controls }: { controls: VideoPlayerControls }) {
  const { volumeIndicator, seekIndicator } = controls;
  if (!volumeIndicator.type && !seekIndicator) return null;
  return (
    <div className="absolute inset-0 flex items-center pointer-events-none">
      {seekIndicator === 'rewind' && (
        <div className="ml-8 bg-black/60 px-6 py-4 rounded-lg flex items-center">
          <FiRewind className="text-white text-4xl" /><span className="text-white ml-2">5 sec</span>
        </div>
      )}
      {volumeIndicator.type && (
        <div className="flex-1 flex justify-center">
          <div className="bg-black/60 px-6 py-4 rounded-lg flex flex-col items-center">
            {volumeIndicator.type === 'up' ? <FiVolume2 className="text-white text-4xl mb-2" /> : <FiVolumeX className="text-white text-4xl mb-2" />}
            <span className="text-white text-lg">{Math.round(volumeIndicator.value * 100)}%</span>
          </div>
        </div>
      )}
      {seekIndicator === 'forward' && (
        <div className="mr-8 ml-auto bg-black/60 px-6 py-4 rounded-lg flex items-center">
          <FiFastForward className="text-white text-4xl" /><span className="text-white ml-2">5 sec</span>
        </div>
      )}
    </div>
  );
}
