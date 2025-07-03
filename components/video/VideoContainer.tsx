// components/VideoContainer.tsx
'use client';
import React from 'react';
import { VideoPlayerControls } from '../../hooks/useVideoPlayer';

interface VideoContainerProps {
  controls: VideoPlayerControls;
  videoRef: React.RefObject<HTMLVideoElement>;
  className?: string;
}

export default function VideoContainer({ 
  controls, 
  videoRef,
  className 
}: VideoContainerProps) {
  return (
    <div className="relative bg-black rounded overflow-hidden w-full aspect-video">
      <video
        ref={videoRef}
        className={`w-full h-full object-contain ${className}`}
        playsInline
        onClick={controls.togglePlay}
        autoPlay
        style={{
          // Prevent default browser styling
          WebkitAppearance: 'none',
          MozAppearance: 'none'
        }}
      >
        {/* <source 
          type="application/x-mpegURL"
        /> */}
      </video>
    </div>
  );
}