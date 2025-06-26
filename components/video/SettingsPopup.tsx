// components/SettingsPopup.tsx
'use client';
import React, { useRef } from 'react';
import { VideoPlayerControls } from '../../hooks/useVideoPlayer';
import Hls from 'hls.js';
import useOutsideClick from '../../hooks/useOutsideClick';

// Extend HTMLVideoElement to include hlsInstance for Hls.js
declare global {
  interface HTMLVideoElement {
    hlsInstance?: Hls;
  }
}

export default function SettingsPopup({ controls, videoId, onClose }: { 
  controls: VideoPlayerControls;
  videoId: string;
  onClose: () => void; // Add this prop to handle closing
}) {
  const popupRef = useRef<HTMLDivElement>(null!);

  // Use the hook to close on outside click
  useOutsideClick([popupRef as React.RefObject<HTMLElement>], onClose);

  const qualities = ['auto', '1080p', '720p', '480p', '360p'] as const;

  const handleQualityChange = (quality: string) => {
    if (!controls.videoRef.current) return;
    const video = controls.videoRef.current;
    const streamUrl = `${process.env.NEXT_PUBLIC_API_URL}/stream/${videoId}/${quality}/playlist.m3u8`;

    // Show buffering spinner
    if (controls.setBuffering) controls.setBuffering(true);
    if (controls.setVideoQuality) controls.setVideoQuality(quality);

    // Destroy previous Hls instance if it exists
    if (video.hlsInstance && typeof video.hlsInstance.destroy === 'function') {
      video.hlsInstance.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      video.hlsInstance = hls;
      const currentTime = video.currentTime;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.currentTime = currentTime;
        if (controls.isPlaying) video.play();
        // Hide buffering spinner
        if (controls.setBuffering) controls.setBuffering(false);
      });
      hls.on(Hls.Events.ERROR, () => {
        if (controls.setBuffering) controls.setBuffering(false);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.load();
      video.currentTime = video.currentTime;
      if (controls.isPlaying) video.play();
      if (controls.setBuffering) controls.setBuffering(false);
    }
  };

  return (
    <div
      ref={popupRef}
      className="absolute bottom-14 right-2 bg-gray-900/95 border border-gray-700 rounded-xl shadow-2xl text-sm w-64 z-50 p-4 space-y-4 animate-fade-in"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-200 font-medium">Ambient Mode</span>
        <button
          onClick={controls.toggleAmbientMode}
          className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
            controls.ambientMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {controls.ambientMode ? 'On' : 'Off'}
        </button>
      </div>
      <div className="border-t border-gray-700 my-2" />
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-200 font-medium">Subtitles</span>
        <select className="ml-2 bg-gray-800 px-2 py-1 rounded text-xs text-gray-100 border border-gray-700 focus:outline-none">
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      </div>
      <div className="border-t border-gray-700 my-2" />
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-200 font-medium">Sleep Timer</span>
        <select
          onChange={controls.handleSleepTimerChange}
          className="ml-2 bg-gray-800 px-2 py-1 rounded text-xs text-gray-100 border border-gray-700 focus:outline-none"
        >
          <option value="0">Off</option>
          <option value="10">10 sec</option>
          <option value="20">20 sec</option>
          <option value="30">30 sec</option>
          <option value="40">40 sec</option>
          <option value="50">50 sec</option>
          <option value="1 hour">1 hour</option>
        </select>
      </div>
      <div className="border-t border-gray-700 my-2" />
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-200 font-medium">Playback Speed</span>
        <select
          onChange={controls.handlePlaybackSpeedChange}
          defaultValue="1"
          className="ml-2 bg-gray-800 px-2 py-1 rounded text-xs text-gray-100 border border-gray-700 focus:outline-none"
        >
          <option value="0.25">0.25x</option>
          <option value="0.5">0.5x</option>
          <option value="0.75">0.75x</option>
          <option value="1">Normal</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>
      </div>
      <div className="border-t border-gray-700 my-2" />
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-200 font-medium">Quality</span>
        <select
          onChange={(e) => handleQualityChange(e.target.value)}
          className="ml-2 bg-gray-800 px-2 py-1 rounded text-xs text-gray-100 border border-gray-700 focus:outline-none"
          value={controls.videoQuality}
        >
          {qualities.map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
