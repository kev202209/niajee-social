// components/VideoContainer.tsx
'use client';
import React from 'react';
import { VideoPlayerControls } from '../../hooks/useVideoPlayer';
interface Props { controls: VideoPlayerControls; src: string; }
export default function VideoContainer({ controls, src }: Props) {
  return (
    <div
      ref={controls.containerRef}
      className={`relative bg-black rounded overflow-hidden ${controls.ambientMode ? 'shadow-xl' : 'shadow-sm'} ${controls.isCinemaMode ? 'w-full' : ''} ${controls.isMiniplayer ? 'w-64 h-36 fixed bottom-4 right-4' : 'aspect-video'}`}
    >
      <video
        ref={controls.videoRef}
        src={src}
        autoPlay={controls.isAutoplay}
        onClick={controls.togglePlay}
        className="w-full h-full cursor-pointer rounded"
      />
    </div>
  );
}